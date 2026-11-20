import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { supabaseAdmin } from '../services/supabase';

const router = Router();

// POST /api/inquiries - Public contact form submission
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, company, service_need, budget_tier, brief } = req.body;

    if (!name || !email || !brief) {
      res.status(400).json({ error: 'name, email, and brief are required' });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('contact_inquiries')
      .insert({
        name,
        email,
        company: company || null,
        service_need: service_need || 'Custom Software Engineering',
        budget_tier: budget_tier || null,
        brief,
        status: 'new',
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ inquiry: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/inquiries - Admin lists all public contact inquiries
router.get('/', requireAuth, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('contact_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ inquiries: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/inquiries/:id - Admin updates inquiry status
router.patch('/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'contacted', 'converted', 'archived'].includes(status)) {
      res.status(400).json({ error: 'Invalid inquiry status' });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('contact_inquiries')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ inquiry: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
