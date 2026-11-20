import { Router, Response } from 'express';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { supabaseAdmin } from '../services/supabase';

const router = Router();

// GET /api/projects - View projects (Admin: all, Client: own)
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    let query = supabaseAdmin
      .from('projects')
      .select('*, client:profiles!client_id(full_name, email, company_name), milestones:project_milestones(*)');

    if (req.user?.role !== 'admin') {
      query = query.eq('client_id', req.user?.id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ projects: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects - Admin creates a new project for a customer
router.post('/', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      client_id,
      title,
      code_name,
      category,
      status,
      progress_percentage,
      repository_or_demo_url,
      staging_url,
      target_launch_date,
      summary,
    } = req.body;

    if (!client_id || !title || !category) {
      res.status(400).json({ error: 'client_id, title, and category are required' });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert({
        client_id,
        title,
        code_name: code_name || `PRJ-${Date.now().toString().slice(-4)}`,
        category,
        status: status || 'discovery',
        progress_percentage: progress_percentage || 0,
        repository_or_demo_url,
        staging_url,
        target_launch_date,
        summary,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ project: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/projects/:id - Admin updates project progress and status
router.patch('/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, progress_percentage, staging_url, repository_or_demo_url, summary } = req.body;

    const { data, error } = await supabaseAdmin
      .from('projects')
      .update({
        status,
        progress_percentage,
        staging_url,
        repository_or_demo_url,
        summary,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ project: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/requests - Client submits a new project request
router.post('/requests', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { project_title, service_category, estimated_budget, target_timeline, project_scope } = req.body;

    if (!project_title || !service_category || !project_scope) {
      res.status(400).json({ error: 'project_title, service_category, and project_scope are required' });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('project_requests')
      .insert({
        client_id: req.user?.id,
        project_title,
        service_category,
        estimated_budget,
        target_timeline,
        project_scope,
        status: 'pending_review',
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ request: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/projects/requests - List project requests
router.get('/requests', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    let query = supabaseAdmin
      .from('project_requests')
      .select('*, client:profiles!client_id(full_name, email, company_name)');

    if (req.user?.role !== 'admin') {
      query = query.eq('client_id', req.user?.id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ requests: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
