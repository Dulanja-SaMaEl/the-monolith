import { Router, Response } from 'express';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { supabaseAdmin } from '../services/supabase';

const router = Router();

// GET /api/tasks - Admin views executive tasks (with optional date or assignee filters)
router.get('/', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { date, assignee } = req.query;
    let query = supabaseAdmin.from('executive_tasks').select('*');

    if (date && typeof date === 'string') {
      query = query.eq('task_date', date);
    }

    if (assignee && typeof assignee === 'string' && assignee !== 'all') {
      query = query.or(`assignee.eq."${assignee}",assignee.ilike."%Both%"`);
    }

    const { data, error } = await query
      .order('is_completed', { ascending: true })
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json({ tasks: data || [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks - Admin adds a new executive task
router.post('/', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title,
      assignee = 'Dulanja Abeysinghe',
      category = 'Architecture',
      priority = 'normal',
      task_date,
      notes,
    } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ error: 'Task title is required' });
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const { data, error } = await supabaseAdmin
      .from('executive_tasks')
      .insert({
        title: title.trim(),
        assignee,
        category,
        priority: ['urgent', 'high', 'normal'].includes(priority) ? priority : 'normal',
        task_date: task_date || todayStr,
        is_completed: false,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ task: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/tasks/:id - Admin updates a task (toggle completion, change title, assignee, date, priority)
router.patch('/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      assignee,
      category,
      priority,
      task_date,
      is_completed,
      notes,
    } = req.body;

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updates.title = title.trim();
    if (assignee !== undefined) updates.assignee = assignee;
    if (category !== undefined) updates.category = category;
    if (priority !== undefined) updates.priority = priority;
    if (task_date !== undefined) updates.task_date = task_date;
    if (notes !== undefined) updates.notes = notes;

    if (is_completed !== undefined) {
      updates.is_completed = Boolean(is_completed);
      updates.completed_at = Boolean(is_completed) ? new Date().toISOString() : null;
    }

    const { data, error } = await supabaseAdmin
      .from('executive_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ task: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks/rollover - Moves remaining incomplete tasks from one day to the next
router.post('/rollover', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { from_date, to_date } = req.body;
    if (!from_date || !to_date) {
      res.status(400).json({ error: 'from_date and to_date are required' });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('executive_tasks')
      .update({
        task_date: to_date,
        updated_at: new Date().toISOString(),
      })
      .eq('task_date', from_date)
      .eq('is_completed', false)
      .select();

    if (error) throw error;
    res.json({ success: true, count: data?.length || 0, tasks: data || [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tasks/:id - Admin deletes a task
router.delete('/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('executive_tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, deleted: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
