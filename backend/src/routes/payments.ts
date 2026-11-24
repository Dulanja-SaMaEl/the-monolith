import { Router, Response } from 'express';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { supabaseAdmin } from '../services/supabase';

const router = Router();

// GET /api/payments - List all payment plans with nested payment records (Admin: all, Client: own)
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    let query = supabaseAdmin
      .from('project_payment_plans')
      .select(
        '*, client:profiles!client_id(full_name, email, company_name), project:projects!project_id(id, title, code_name), payments:payment_records(*)'
      );

    if (req.user?.role !== 'admin') {
      query = query.eq('client_id', req.user?.id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    // Sort nested payments newest first
    const plans = (data || []).map((plan: any) => ({
      ...plan,
      payments: Array.isArray(plan.payments)
        ? [...plan.payments].sort(
            (a, b) => new Date(b.payment_date || b.created_at).getTime() - new Date(a.payment_date || a.created_at).getTime()
          )
        : [],
    }));

    res.json({ plans });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payments - Admin creates a payment plan / package for a client project
router.post('/', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      client_id,
      project_id,
      package_name,
      billing_type = 'one_time',
      currency = 'LKR',
      total_amount = 0,
      installment_amount = 0,
      total_months = 1,
      start_date,
      next_due_date,
      status = 'active',
      notes,
    } = req.body;

    if (!client_id || !package_name) {
      res.status(400).json({ error: 'client_id and package_name are required' });
      return;
    }

    if (!['one_time', 'monthly', 'installment'].includes(billing_type)) {
      res.status(400).json({ error: 'Invalid billing_type. Use one_time, monthly, or installment.' });
      return;
    }

    const parsedTotal = Number(total_amount) || 0;
    const parsedInstallment = Number(installment_amount) || 0;
    const parsedMonths = Number(total_months) || (billing_type === 'monthly' ? 0 : 1);

    const effectiveTotal =
      billing_type === 'installment' && parsedTotal === 0 && parsedInstallment > 0 && parsedMonths > 0
        ? parsedInstallment * parsedMonths
        : billing_type === 'monthly' && parsedTotal === 0
        ? parsedInstallment
        : parsedTotal;

    const effectiveInstallment =
      billing_type === 'installment' && parsedInstallment === 0 && effectiveTotal > 0 && parsedMonths > 0
        ? Math.round(effectiveTotal / parsedMonths)
        : billing_type === 'monthly' && parsedInstallment === 0
        ? effectiveTotal
        : parsedInstallment;

    const { data, error } = await supabaseAdmin
      .from('project_payment_plans')
      .insert({
        client_id,
        project_id: project_id || null,
        package_name,
        billing_type,
        currency,
        total_amount: effectiveTotal,
        installment_amount: effectiveInstallment,
        total_months: parsedMonths,
        start_date: start_date || new Date().toISOString().split('T')[0],
        next_due_date: next_due_date || null,
        status,
        notes: notes || null,
      })
      .select(
        '*, client:profiles!client_id(full_name, email, company_name), project:projects!project_id(id, title, code_name), payments:payment_records(*)'
      )
      .single();

    if (error) throw error;
    res.status(201).json({ plan: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/payments/:id - Admin updates a payment plan / package
router.patch('/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      project_id,
      package_name,
      billing_type,
      currency,
      total_amount,
      installment_amount,
      total_months,
      start_date,
      next_due_date,
      status,
      notes,
    } = req.body;

    const { data, error } = await supabaseAdmin
      .from('project_payment_plans')
      .update({
        ...(project_id !== undefined ? { project_id: project_id || null } : {}),
        ...(package_name !== undefined ? { package_name } : {}),
        ...(billing_type !== undefined ? { billing_type } : {}),
        ...(currency !== undefined ? { currency } : {}),
        ...(total_amount !== undefined ? { total_amount: Number(total_amount) } : {}),
        ...(installment_amount !== undefined ? { installment_amount: Number(installment_amount) } : {}),
        ...(total_months !== undefined ? { total_months: Number(total_months) } : {}),
        ...(start_date !== undefined ? { start_date: start_date || null } : {}),
        ...(next_due_date !== undefined ? { next_due_date: next_due_date || null } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(notes !== undefined ? { notes } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(
        '*, client:profiles!client_id(full_name, email, company_name), project:projects!project_id(id, title, code_name), payments:payment_records(*)'
      )
      .single();

    if (error) throw error;
    res.json({ plan: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/payments/:id - Admin deletes a payment plan (and its cascade payment records)
router.delete('/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('project_payment_plans').delete().eq('id', id);
    if (error) throw error;
    res.json({ deleted: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payments/:id/records - Admin logs a payment entry against a plan
router.post('/:id/records', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id: payment_plan_id } = req.params;
    const {
      amount,
      payment_date,
      payment_method = 'Bank Transfer / CEFTS',
      reference_number,
      invoice_id,
      billing_scope = 'project_cover',
      notes,
      advance_due_date = false,
    } = req.body;

    if (!amount || Number(amount) <= 0) {
      res.status(400).json({ error: 'A positive payment amount is required' });
      return;
    }

    const { data: plan, error: planErr } = await supabaseAdmin
      .from('project_payment_plans')
      .select('*, payments:payment_records(*)')
      .eq('id', payment_plan_id)
      .single();

    if (planErr || !plan) {
      res.status(404).json({ error: 'Payment plan not found' });
      return;
    }

    const { data: record, error } = await supabaseAdmin
      .from('payment_records')
      .insert({
        payment_plan_id,
        client_id: plan.client_id,
        project_id: plan.project_id || null,
        invoice_id: invoice_id || null,
        amount: Number(amount),
        currency: plan.currency || 'LKR',
        payment_date: payment_date || new Date().toISOString().split('T')[0],
        payment_method,
        reference_number: reference_number || null,
        billing_scope,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Auto-update plan status or advance next_due_date if requested
    const existingPaid = (plan.payments || []).reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
    const newPaid = existingPaid + Number(amount);
    const planUpdates: Record<string, any> = { updated_at: new Date().toISOString() };

    if (plan.billing_type !== 'monthly' && Number(plan.total_amount) > 0 && newPaid >= Number(plan.total_amount)) {
      planUpdates.status = 'completed';
    } else if (plan.status === 'overdue') {
      planUpdates.status = 'active';
    }

    if (advance_due_date && (plan.billing_type === 'monthly' || plan.billing_type === 'installment')) {
      const base = plan.next_due_date ? new Date(plan.next_due_date) : new Date(payment_date || Date.now());
      base.setMonth(base.getMonth() + 1);
      planUpdates.next_due_date = base.toISOString().split('T')[0];
    }

    if (Object.keys(planUpdates).length > 1) {
      await supabaseAdmin.from('project_payment_plans').update(planUpdates).eq('id', payment_plan_id);
    }

    res.status(201).json({ record });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/payments/records/:recordId - Admin adjusts a past payment record
router.patch('/records/:recordId', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { recordId } = req.params;
    const { amount, payment_date, payment_method, reference_number, billing_scope, notes } = req.body;

    const { data, error } = await supabaseAdmin
      .from('payment_records')
      .update({
        ...(amount !== undefined ? { amount: Number(amount) } : {}),
        ...(payment_date !== undefined ? { payment_date } : {}),
        ...(payment_method !== undefined ? { payment_method } : {}),
        ...(reference_number !== undefined ? { reference_number } : {}),
        ...(billing_scope !== undefined ? { billing_scope } : {}),
        ...(notes !== undefined ? { notes } : {}),
      })
      .eq('id', recordId)
      .select()
      .single();

    if (error) throw error;
    res.json({ record: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/payments/records/:recordId - Admin deletes a past payment record
router.delete('/records/:recordId', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { recordId } = req.params;
    const { error } = await supabaseAdmin.from('payment_records').delete().eq('id', recordId);
    if (error) throw error;
    res.json({ deleted: true, id: recordId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
