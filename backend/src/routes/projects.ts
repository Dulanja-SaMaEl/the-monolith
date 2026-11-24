import { Router, Response } from 'express';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { supabaseAdmin } from '../services/supabase';
import { checkSystemHeartbeat } from '../services/heartbeat';

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

// GET /api/projects/:id/heartbeat - Live System Heartbeat telemetry (latency, HTTP status, SSL cert validity)
router.get('/:id/heartbeat', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const force = req.query.force === '1' || req.query.force === 'true';

    let query = supabaseAdmin
      .from('projects')
      .select('id, client_id, title, production_url, staging_url')
      .eq('id', id);

    if (req.user?.role !== 'admin') {
      query = query.eq('client_id', req.user?.id);
    }

    const { data: project, error } = await query.maybeSingle();

    if (error) throw error;
    if (!project) {
      res.status(404).json({ error: 'Project not found or access denied' });
      return;
    }

    const targetUrl = (project.production_url || '').trim();
    if (!targetUrl) {
      res.json({
        heartbeat: {
          configured: false,
          project_id: project.id,
          url: '',
          hostname: '',
          status: 'unconfigured',
          http_status: null,
          latency_ms: null,
          ssl: null,
          checked_at: new Date().toISOString(),
          cached: false,
          error_detail: 'No production URL configured in Project Vault yet.',
          history: [],
        },
      });
      return;
    }

    const heartbeat = await checkSystemHeartbeat(project.id, targetUrl, force);
    res.json({ heartbeat });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Heartbeat check failed' });
  }
});

// POST /api/projects - Admin creates a new project for a customer (with milestones)
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
      production_url,
      figma_url,
      api_docs_url,
      domain_renewal_date,
      server_expiry_date,
      vault_notes,
      target_launch_date,
      summary,
      milestones,
    } = req.body;

    if (!client_id || !title || !category) {
      res.status(400).json({ error: 'client_id, title, and category are required' });
      return;
    }

    const { data: project, error } = await supabaseAdmin
      .from('projects')
      .insert({
        client_id,
        title,
        code_name: code_name || `PRJ-${Date.now().toString().slice(-4)}`,
        category,
        status: status || 'architecture',
        progress_percentage: progress_percentage ?? 15,
        repository_or_demo_url,
        staging_url,
        production_url: production_url || null,
        figma_url: figma_url || null,
        api_docs_url: api_docs_url || null,
        domain_renewal_date: domain_renewal_date || null,
        server_expiry_date: server_expiry_date || null,
        vault_notes: vault_notes || null,
        target_launch_date: target_launch_date || null,
        summary,
      })
      .select()
      .single();

    if (error) throw error;

    const milestoneRows = Array.isArray(milestones) && milestones.length > 0
      ? milestones.map((m: any, idx: number) => ({
          project_id: project.id,
          title: String(m.title),
          is_completed: Boolean(m.is_completed),
          due_date: (m.due_date || null) as string | null,
          order_index: idx + 1,
        }))
      : [
          { project_id: project.id, title: 'Architecture Schema & Core Protocol Design', is_completed: true, due_date: null as string | null, order_index: 1 },
          { project_id: project.id, title: 'Microservices & Idempotent Webhook Pipeline', is_completed: false, due_date: null as string | null, order_index: 2 },
          { project_id: project.id, title: 'Load Simulation & Multi-Region Cutover', is_completed: false, due_date: null as string | null, order_index: 3 },
        ];

    const { data: insertedMilestones } = await supabaseAdmin
      .from('project_milestones')
      .insert(milestoneRows)
      .select();

    res.status(201).json({
      project: {
        ...project,
        milestones: insertedMilestones || [],
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/projects/:id - Admin updates project details, progress and status
router.patch('/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      code_name,
      category,
      client_id,
      target_launch_date,
      status,
      progress_percentage,
      staging_url,
      production_url,
      figma_url,
      api_docs_url,
      domain_renewal_date,
      server_expiry_date,
      vault_notes,
      repository_or_demo_url,
      summary,
    } = req.body;

    const { data, error } = await supabaseAdmin
      .from('projects')
      .update({
        ...(title !== undefined ? { title } : {}),
        ...(code_name !== undefined ? { code_name } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(client_id !== undefined ? { client_id } : {}),
        ...(target_launch_date !== undefined ? { target_launch_date: target_launch_date || null } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(progress_percentage !== undefined ? { progress_percentage } : {}),
        ...(staging_url !== undefined ? { staging_url: staging_url || null } : {}),
        ...(production_url !== undefined ? { production_url: production_url || null } : {}),
        ...(figma_url !== undefined ? { figma_url: figma_url || null } : {}),
        ...(api_docs_url !== undefined ? { api_docs_url: api_docs_url || null } : {}),
        ...(domain_renewal_date !== undefined ? { domain_renewal_date: domain_renewal_date || null } : {}),
        ...(server_expiry_date !== undefined ? { server_expiry_date: server_expiry_date || null } : {}),
        ...(vault_notes !== undefined ? { vault_notes: vault_notes || null } : {}),
        ...(repository_or_demo_url !== undefined ? { repository_or_demo_url: repository_or_demo_url || null } : {}),
        ...(summary !== undefined ? { summary } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, client:profiles!client_id(full_name, email, company_name), milestones:project_milestones(*)')
      .single();

    if (error) throw error;
    res.json({ project: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/projects/:id - Admin deletes a project
router.delete('/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, deleted: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/projects/:id/milestones/:milestoneId - Admin toggles a milestone
router.patch('/:id/milestones/:milestoneId', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id, milestoneId } = req.params;
    const { is_completed, title } = req.body;

    const { data, error } = await supabaseAdmin
      .from('project_milestones')
      .update({
        ...(is_completed !== undefined ? { is_completed } : {}),
        ...(title !== undefined ? { title } : {}),
      })
      .eq('id', milestoneId)
      .eq('project_id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ milestone: data });
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
      .select('*, client:profiles!client_id(full_name, email, company_name)')
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

// PATCH /api/projects/requests/:id - Admin updates project request status
router.patch('/requests/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending_review', 'under_estimation', 'approved', 'declined'].includes(status)) {
      res.status(400).json({ error: 'Invalid project request status' });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('project_requests')
      .update({ status })
      .eq('id', id)
      .select('*, client:profiles!client_id(full_name, email, company_name)')
      .single();

    if (error) throw error;
    res.json({ request: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
