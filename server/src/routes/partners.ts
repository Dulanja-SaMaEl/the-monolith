import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { supabaseAdmin } from '../services/supabase';

const router = Router();

// GET /api/partners - Public or client view active partners
router.get('/', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('partners')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ partners: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/partners - Admin adds a new partner
router.post('/', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, category, logo_url, website_url, description } = req.body;

    if (!name || !category) {
      res.status(400).json({ error: 'Name and category are required' });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('partners')
      .insert({
        name,
        category,
        logo_url,
        website_url,
        description,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ partner: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/partners/:id - Admin deactivates partner
router.delete('/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('partners')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Partner deactivated' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
