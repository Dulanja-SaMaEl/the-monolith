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

    // 2. Insert into public.profiles
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        full_name,
        company_name,
        phone,
        role: 'client',
      })
      .select()
      .single();

    if (profileError) throw profileError;

    res.status(201).json({ client: profileData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
