import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { supabaseAdmin } from '../services/supabase';

const router = Router();

// GET /api/reviews - Public or admin retrieve reviews
router.get('/', async (req: Request, res: Response) => {
  try {
    const { all } = req.query;
    let query = supabaseAdmin.from('customer_reviews').select('*');

    if (!all) {
      query = query.eq('is_featured', true);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ reviews: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reviews - Admin adds a new customer review
router.post('/', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { client_name, client_title, company_name, rating = 5, review_text, client_avatar_url, is_featured = true } = req.body;

    if (!client_name || !company_name || !review_text) {
      res.status(400).json({ error: 'client_name, company_name, and review_text are required' });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('customer_reviews')
      .insert({
        client_name,
        client_title: client_title || 'Client Partner',
        company_name,
        rating: Math.min(5, Math.max(1, Number(rating))),
        review_text,
        client_avatar_url,
        is_featured,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ review: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/reviews/:id/feature - Admin toggles featured status
router.patch('/:id/feature', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { is_featured } = req.body;

    const { data, error } = await supabaseAdmin
      .from('customer_reviews')
      .update({ is_featured })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ review: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/reviews/:id - Admin updates a customer review
router.patch('/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { client_name, client_title, company_name, rating, review_text, is_featured, client_avatar_url } = req.body;

    const { data, error } = await supabaseAdmin
      .from('customer_reviews')
      .update({
        ...(client_name !== undefined ? { client_name } : {}),
        ...(client_title !== undefined ? { client_title } : {}),
        ...(company_name !== undefined ? { company_name } : {}),
        ...(rating !== undefined ? { rating: Math.min(5, Math.max(1, Number(rating))) } : {}),
        ...(review_text !== undefined ? { review_text } : {}),
        ...(is_featured !== undefined ? { is_featured } : {}),
        ...(client_avatar_url !== undefined ? { client_avatar_url } : {}),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ review: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/reviews/:id - Admin deletes a customer review
router.delete('/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('customer_reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, deleted: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
