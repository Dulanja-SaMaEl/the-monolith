import { Router, Response } from 'express';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { supabaseAdmin } from '../services/supabase';

const router = Router();

const SELECT_WITH_JOINS =
  '*, client:profiles!client_id(full_name, email, company_name), project:projects!project_id(id, title, code_name, target_launch_date)';

// GET /api/change-requests - List change requests (Admin: all or scoped, Client: strictly own)
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    let query = supabaseAdmin.from('project_change_requests').select(SELECT_WITH_JOINS);

    if (req.user?.role !== 'admin') {
      query = query.eq('client_id', req.user?.id);
    } else if (typeof req.query.client_id === 'string' && req.query.client_id.trim()) {
      query = query.eq('client_id', req.query.client_id.trim());
    }

    if (typeof req.query.project_id === 'string' && req.query.project_id.trim()) {
      query = query.eq('project_id', req.query.project_id.trim());
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ change_requests: data || [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/change-requests - Client submits a Tweak / New Feature request inside a project
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { project_id, title, description, priority = 'normal' } = req.body;

    if (!project_id || !title || !description) {
      res.status(400).json({ error: 'project_id, title, and description are required' });
      return;
    }

    // Verify project exists and belongs to caller (unless Admin)
    const { data: project, error: projErr } = await supabaseAdmin
      .from('projects')
      .select('id, client_id, title')
      .eq('id', project_id)
      .single();

    if (projErr || !project) {
      res.status(404).json({ error: 'Target project not found' });
      return;
    }

    if (req.user?.role !== 'admin' && project.client_id !== req.user?.id) {
      res.status(403).json({ error: 'Forbidden: You can only submit change requests for your own projects' });
      return;
    }

    const safePriority = priority === 'urgent' ? 'urgent' : 'normal';

    const { data, error } = await supabaseAdmin
      .from('project_change_requests')
      .insert({
        project_id: project.id,
        client_id: project.client_id,
        title: String(title).trim(),
        description: String(description).trim(),
        priority: safePriority,
        status: 'requested',
        currency: 'LKR',
      })
      .select(SELECT_WITH_JOINS)
      .single();

    if (error) throw error;
    res.status(201).json({ change_request: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/change-requests/:id/quote - Admin replies with a transparent Impact Card (Cost + Launch Impact)
router.patch('/:id/quote', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      is_complimentary = false,
      estimated_cost = 0,
      currency = 'LKR',
      timeline_impact_days = 0,
      auto_create_invoice = true,
      admin_notes = '',
    } = req.body;

    const complimentary = Boolean(is_complimentary) || Number(estimated_cost) <= 0;
    const finalCost = complimentary ? 0 : Math.max(0, Number(estimated_cost) || 0);
    const impactDays = Math.max(0, Math.round(Number(timeline_impact_days) || 0));

    const { data, error } = await supabaseAdmin
      .from('project_change_requests')
      .update({
        is_complimentary: complimentary,
        estimated_cost: finalCost,
        currency: currency || 'LKR',
        timeline_impact_days: impactDays,
        auto_create_invoice: complimentary ? false : Boolean(auto_create_invoice),
        admin_notes: admin_notes ? String(admin_notes).trim() : null,
        status: 'quoted',
        quoted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(SELECT_WITH_JOINS)
      .single();

    if (error) throw error;
    res.json({ change_request: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/change-requests/:id/respond - Client approves (auto-creates invoice + shifts timeline + adds milestone) or declines
router.post('/:id/respond', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { action, client_notes } = req.body;

    if (action !== 'approve' && action !== 'decline') {
      res.status(400).json({ error: 'action must be "approve" or "decline"' });
      return;
    }

    const { data: cr, error: fetchErr } = await supabaseAdmin
      .from('project_change_requests')
      .select(SELECT_WITH_JOINS)
      .eq('id', id)
      .single();

    if (fetchErr || !cr) {
      res.status(404).json({ error: 'Change request not found' });
      return;
    }

    if (req.user?.role !== 'admin' && cr.client_id !== req.user?.id) {
      res.status(403).json({ error: 'Forbidden: Access denied' });
      return;
    }

    if (cr.status !== 'quoted') {
      res.status(400).json({ error: `Change request is currently "${cr.status}" and cannot be responded to.` });
      return;
    }

    const nowIso = new Date().toISOString();

    if (action === 'decline') {
      const { data: declined, error: decErr } = await supabaseAdmin
        .from('project_change_requests')
        .update({
          status: 'declined',
          client_notes: client_notes ? String(client_notes).trim() : null,
          responded_at: nowIso,
          updated_at: nowIso,
        })
        .eq('id', id)
        .select(SELECT_WITH_JOINS)
        .single();

      if (decErr) throw decErr;
      res.json({ change_request: declined, invoice: null, updated_launch_date: null });
      return;
    }

    // === APPROVED FLOW ===
    let createdInvoice: any = null;
    let updatedLaunchDate: string | null = null;

    // 1. Auto-create Separate Charge Invoice if priced and enabled
    const cost = Number(cr.estimated_cost || 0);
    if (!cr.is_complimentary && cost > 0 && cr.auto_create_invoice !== false) {
      const document_number = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const impactText =
        Number(cr.timeline_impact_days || 0) > 0
          ? `+${cr.timeline_impact_days} day${Number(cr.timeline_impact_days) === 1 ? '' : 's'} launch adjustment`
          : 'No launch delay';

      const { data: inv, error: invErr } = await supabaseAdmin
        .from('documents_billing')
        .insert({
          document_number,
          type: 'invoice',
          client_id: cr.client_id,
          project_id: cr.project_id,
          billing_scope: 'separate',
          status: 'sent',
          currency: cr.currency || 'LKR',
          line_items: [
            {
              id: `cr-${Date.now()}`,
              description: `Approved Change Request: ${cr.title}`,
              quantity: 1,
              unit_price: cost,
              total: cost,
            },
          ],
          subtotal: cost,
          tax: 0,
          total: cost,
          due_date: dueDate,
          notes: `Auto-generated upon client approval of Change Request "${cr.title}" (${impactText}).`,
        })
        .select('*, client:profiles!client_id(full_name, email, company_name, phone), project:projects!project_id(title, code_name)')
        .single();

      if (!invErr && inv) {
        createdInvoice = inv;
      }
    }

    // 2. Transparently advance project target_launch_date if timeline_impact_days > 0
    const impactDays = Number(cr.timeline_impact_days || 0);
    if (impactDays > 0 && cr.project?.target_launch_date) {
      const baseDate = new Date(`${cr.project.target_launch_date}T00:00:00Z`);
      if (!Number.isNaN(baseDate.getTime())) {
        baseDate.setUTCDate(baseDate.getUTCDate() + impactDays);
        updatedLaunchDate = baseDate.toISOString().split('T')[0];
        await supabaseAdmin
          .from('projects')
          .update({
            target_launch_date: updatedLaunchDate,
            updated_at: nowIso,
          })
          .eq('id', cr.project_id);
      }
    }

    // 3. Append approved feature directly to the project's live milestones build tracker
    try {
      const { data: existingMs } = await supabaseAdmin
        .from('project_milestones')
        .select('order_index')
        .eq('project_id', cr.project_id)
        .order('order_index', { ascending: false })
        .limit(1);

      const nextOrder = existingMs && existingMs.length > 0 ? Number(existingMs[0].order_index || 0) + 1 : 1;
      await supabaseAdmin.from('project_milestones').insert({
        project_id: cr.project_id,
        title: `Add-On: ${cr.title}`,
        description: cr.admin_notes || cr.description,
        is_completed: false,
        order_index: nextOrder,
      });
    } catch (msErr) {
      console.warn('Could not auto-append milestone for approved change request:', msErr);
    }

    // 4. Persist approved status + linked invoice reference
    const { data: approved, error: updErr } = await supabaseAdmin
      .from('project_change_requests')
      .update({
        status: 'approved',
        client_notes: client_notes ? String(client_notes).trim() : null,
        invoice_id: createdInvoice?.id || null,
        invoice_number: createdInvoice?.document_number || null,
        responded_at: nowIso,
        updated_at: nowIso,
      })
      .eq('id', id)
      .select(SELECT_WITH_JOINS)
      .single();

    if (updErr) throw updErr;

    res.json({
      change_request: approved,
      invoice: createdInvoice,
      updated_launch_date: updatedLaunchDate,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/change-requests/:id/status - Admin updates execution status (e.g. in_progress, completed)
router.patch('/:id/status', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['requested', 'quoted', 'approved', 'declined', 'in_progress', 'completed'].includes(status)) {
      res.status(400).json({ error: 'Invalid change request status' });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('project_change_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(SELECT_WITH_JOINS)
      .single();

    if (error) throw error;
    res.json({ change_request: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/change-requests/:id - Admin deletes a change request
router.delete('/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('project_change_requests').delete().eq('id', id);
    if (error) throw error;
    res.json({ deleted: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
