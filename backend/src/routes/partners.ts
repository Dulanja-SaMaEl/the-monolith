import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { supabaseAdmin } from '../services/supabase';

const router = Router();

// GET /api/partners - Public or admin view partners
router.get('/', async (req: Request, res: Response) => {
  try {
    const { all } = req.query;
    let query = supabaseAdmin.from('partners').select('*');
    if (!all) {
      query = query.eq('is_active', true);
    }
    const { data, error } = await query.order('created_at', { ascending: false });

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

// PATCH /api/partners/:id - Admin toggles active status or edits partner
router.patch('/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, logo_url, website_url, description, is_active } = req.body;

    const { data, error } = await supabaseAdmin
      .from('partners')
      .update({
        ...(name !== undefined ? { name } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(logo_url !== undefined ? { logo_url } : {}),
        ...(website_url !== undefined ? { website_url } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(is_active !== undefined ? { is_active } : {}),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ partner: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/partners/:id - Admin deletes partner
router.delete('/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('partners')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, deleted: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
