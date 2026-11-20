import { Router, Response } from 'express';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { supabaseAdmin } from '../services/supabase';

const router = Router();

// GET /api/meetings - View meeting requests
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    let query = supabaseAdmin
      .from('meeting_requests')
      .select('*, client:profiles!client_id(full_name, email, company_name)');

    if (req.user?.role !== 'admin') {
      query = query.eq('client_id', req.user?.id);
    }

    const { data, error } = await query.order('requested_date', { ascending: true });

    if (error) throw error;
    res.json({ meetings: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/meetings - Client schedules a meeting
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { requested_date, requested_time, timezone, meeting_type, agenda } = req.body;

    if (!requested_date || !requested_time || !agenda) {
      res.status(400).json({ error: 'requested_date, requested_time, and agenda are required' });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('meeting_requests')
      .insert({
        client_id: req.user?.id,
        requested_date,
        requested_time,
        timezone: timezone || 'Asia/Colombo (UTC+5:30)',
        meeting_type: meeting_type || 'Architecture Consultation',
        agenda,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ meeting: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/meetings/:id - Admin confirms or adds meeting link
router.patch('/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, meeting_link } = req.body;

    const { data, error } = await supabaseAdmin
      .from('meeting_requests')
      .update({
        status,
        meeting_link,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ meeting: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
