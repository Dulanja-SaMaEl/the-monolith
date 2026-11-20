import { Router, Response } from 'express';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { supabaseAdmin } from '../services/supabase';

const router = Router();

// GET /api/clients - Admin views all registered customers/clients
router.get('/', requireAuth, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*, projects:projects(id, title, status, progress_percentage)')
      .eq('role', 'client')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ clients: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/clients - Admin adds a new customer profile
router.post('/', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password, full_name, company_name, phone } = req.body;

    if (!email || !full_name) {
      res.status(400).json({ error: 'Email and full_name are required' });
      return;
    }

    // 1. Create Supabase Auth User
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: password || 'MonolithClient2026!',
      email_confirm: true,
      user_metadata: { full_name, company_name, role: 'client' },
    });

    if (authError) throw authError;

    // 2. Upsert into public.profiles
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email,
        full_name,
        company_name,
        phone,
        role: 'client',
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileError) throw profileError;

    res.status(201).json({ client: profileData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/clients/:id - Admin updates customer details
router.patch('/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { full_name, company_name, phone } = req.body;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        ...(full_name !== undefined ? { full_name } : {}),
        ...(company_name !== undefined ? { company_name } : {}),
        ...(phone !== undefined ? { phone } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ client: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/clients/:id - Admin deletes customer
router.delete('/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', id);

    if (profileError) throw profileError;

    // Delete auth user if exists
    await supabaseAdmin.auth.admin.deleteUser(id).catch(() => {});

    res.json({ deleted: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
