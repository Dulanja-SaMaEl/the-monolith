import { Router, Response } from 'express';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { supabaseAdmin } from '../services/supabase';

const router = Router();

// GET /api/billing - View invoices & quotations
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    let query = supabaseAdmin
      .from('documents_billing')
      .select('*, client:profiles!client_id(full_name, email, company_name, phone), project:projects!project_id(title, code_name)');

    if (req.user?.role !== 'admin') {
      query = query.eq('client_id', req.user?.id);
    } else if (typeof req.query.client_id === 'string' && req.query.client_id.trim()) {
      query = query.eq('client_id', req.query.client_id.trim());
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ documents: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/billing - Admin creates invoice or quotation (Default currency: LKR)
router.post('/', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      type,
      client_id,
      project_id,
      payment_plan_id,
      billing_scope,
      currency,
      status,
      line_items,
      tax_percentage = 0,
      due_date,
      notes,
    } = req.body;

    if (!type || !client_id || !Array.isArray(line_items) || line_items.length === 0) {
      res.status(400).json({ error: 'type, client_id, and line_items array are required' });
      return;
    }

    // Compute subtotal and total
    const normalizedItems = line_items.map((item: any, idx: number) => {
      const qty = Number(item.quantity) || 1;
      const unit = Number(item.unit_price) || 0;
      return {
        id: item.id || `li-${idx + 1}`,
        description: String(item.description || ''),
        quantity: qty,
        unit_price: unit,
        total: qty * unit,
      };
    });

    const subtotal = normalizedItems.reduce((acc: number, item: any) => acc + item.total, 0);
    const tax = subtotal * (Number(tax_percentage) / 100);
    const total = subtotal + tax;

    const prefix = type === 'invoice' ? 'INV' : 'QUO';
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const document_number = `${prefix}-${new Date().getFullYear()}-${randCode}`;

    const safeScope = billing_scope === 'project_cover' ? 'project_cover' : 'separate';

    const { data, error } = await supabaseAdmin
      .from('documents_billing')
      .insert({
        document_number,
        type,
        client_id,
        project_id: project_id || null,
        payment_plan_id: payment_plan_id || null,
        billing_scope: safeScope,
        status: status || 'sent',
        currency: currency || 'LKR',
        line_items: normalizedItems,
        subtotal,
        tax,
        total,
        due_date: due_date || null,
        notes,
      })
      .select('*, client:profiles!client_id(full_name, email, company_name, phone), project:projects!project_id(title, code_name)')
      .single();

    if (error) throw error;
    res.status(201).json({ document: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/billing/:id/status - Admin updates document status (auto-applies project cover payment when paid)
router.patch('/:id/status', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['draft', 'sent', 'approved', 'paid', 'overdue'].includes(status)) {
      res.status(400).json({ error: 'Invalid billing status' });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('documents_billing')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, client:profiles!client_id(full_name, email, company_name, phone), project:projects!project_id(title, code_name)')
      .single();

    if (error) throw error;

    // If this invoice counts toward a project cover-up and is now PAID, auto-record into payment_records idempotently
    if (status === 'paid' && data && data.type === 'invoice' && data.billing_scope === 'project_cover') {
      try {
        const { data: existingRec } = await supabaseAdmin
          .from('payment_records')
          .select('id')
          .eq('invoice_id', data.id)
          .maybeSingle();

        if (!existingRec) {
          let targetPlanId = data.payment_plan_id;
          if (!targetPlanId && data.project_id) {
            const { data: matchedPlan } = await supabaseAdmin
              .from('project_payment_plans')
              .select('id')
              .eq('project_id', data.project_id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            targetPlanId = matchedPlan?.id || null;
          }

          if (targetPlanId) {
            await supabaseAdmin.from('payment_records').insert({
              payment_plan_id: targetPlanId,
              client_id: data.client_id,
              project_id: data.project_id || null,
              invoice_id: data.id,
              amount: Number(data.total || 0),
              currency: data.currency || 'LKR',
              payment_date: new Date().toISOString().split('T')[0],
              payment_method: 'Invoice Settlement',
              reference_number: data.document_number,
              billing_scope: 'project_cover',
              notes: `Auto-applied from paid invoice ${data.document_number}`,
            });

            // Recompute completion status for fixed/installment plans
            const { data: plan } = await supabaseAdmin
              .from('project_payment_plans')
              .select('*, payments:payment_records(amount)')
              .eq('id', targetPlanId)
              .single();

            if (plan && plan.billing_type !== 'monthly' && Number(plan.total_amount) > 0) {
              const totalPaid = (plan.payments || []).reduce((acc: number, r: any) => acc + Number(r.amount || 0), 0);
              if (totalPaid >= Number(plan.total_amount)) {
                await supabaseAdmin
                  .from('project_payment_plans')
                  .update({ status: 'completed', updated_at: new Date().toISOString() })
                  .eq('id', targetPlanId);
              }
            }
          }
        }
      } catch (syncErr) {
        console.warn('Auto payment sync skipped:', syncErr);
      }
    }

    res.json({ document: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/billing/:id - Admin deletes invoice or quotation
router.delete('/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('documents_billing')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ deleted: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const escapeHtml = (str: unknown): string =>
  String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const cleanFileSegment = (raw: unknown, maxLen = 36): string =>
  String(raw ?? '')
    .replace(/[<>:"/\\|?*\x00-\x1F]+/g, ' ')
    .replace(/&/g, 'and')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, maxLen)
    .replace(/-$/g, '');

// GET /api/billing/:id/download - Download voucher file
router.get('/:id/download', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    let query = supabaseAdmin
      .from('documents_billing')
      .select('*, client:profiles!client_id(full_name, email, company_name, phone), project:projects!project_id(title, code_name)')
      .eq('id', id);

    if (req.user?.role !== 'admin') {
      query = query.eq('client_id', req.user?.id);
    }

    const { data: doc, error } = await query.single();
    if (error || !doc) {
      res.status(404).json({ error: 'Billing document not found or access denied' });
      return;
    }

    const kind = doc.type === 'invoice' ? 'Invoice' : 'Quotation';
    const clientSeg = cleanFileSegment(doc.client?.company_name || doc.client?.full_name, 30);
    const subjectSeg = cleanFileSegment(
      doc.project?.title || (Array.isArray(doc.line_items) && doc.line_items[0]?.description) || '',
      36
    );
    const docNoSeg = cleanFileSegment(doc.document_number, 24) || kind;
    const dateSeg = String(doc.created_at || new Date().toISOString()).slice(0, 10);
    const meaningfulBase = ['Monolith-LK', kind, clientSeg, subjectSeg, docNoSeg, dateSeg]
      .filter(Boolean)
      .join('_');

    const cur = escapeHtml(doc.currency || 'LKR');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${meaningfulBase}.html"`);
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(meaningfulBase)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=Oswald:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter Tight', sans-serif; padding: 40px; background: #FAF8F5; color: #141414; line-height: 1.6; }
    .card { max-width: 820px; margin: 0 auto; background: #fff; padding: 48px; border-radius: 16px; border: 1px solid rgba(159, 129, 112, 0.3); }
    h1 { font-family: 'Oswald', sans-serif; margin: 0 0 10px; font-size: 28px; text-transform: uppercase; letter-spacing: 0.04em; color: #000; }
    table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px; }
    th, td { padding: 14px 12px; border-bottom: 1px solid rgba(159, 129, 112, 0.2); text-align: left; }
    th { font-family: 'Oswald', sans-serif; text-transform: uppercase; letter-spacing: 0.08em; color: #9F8170; font-size: 13px; }
    .total { font-family: 'Oswald', sans-serif; text-align: right; font-size: 22px; font-weight: 700; margin-top: 24px; color: #9F8170; text-transform: uppercase; }
    @media print { body { background: #fff; padding: 0; } .card { border: none; padding: 20px; } }
  </style>
</head>
<body>
  <div class="card">
    <h1>MONOLITH LK · ${escapeHtml(doc.type).toUpperCase()}: ${escapeHtml(doc.document_number)}</h1>
    <p>Client Name: <strong>${escapeHtml(doc.client?.full_name || doc.client?.company_name || 'Client')}</strong>${doc.client?.company_name && doc.client?.full_name && doc.client.company_name !== doc.client.full_name ? ` · Company: <strong>${escapeHtml(doc.client.company_name)}</strong>` : ''} (${escapeHtml(doc.client?.email)})</p>
    <p>Due Date: <strong>${escapeHtml(doc.due_date || 'Upon Receipt')}</strong> · Status: <strong>${escapeHtml(doc.status).toUpperCase()}</strong></p>
    <table>
      <thead>
        <tr><th>Deliverable Item</th><th>Qty</th><th>Unit Rate</th><th>Total</th></tr>
      </thead>
      <tbody>
        ${(doc.line_items || []).map((i: any) => `<tr><td>${escapeHtml(i.description)}</td><td>${escapeHtml(i.quantity)}</td><td>${cur} ${Number(i.unit_price || 0).toLocaleString()}</td><td>${cur} ${Number(i.total || 0).toLocaleString()}</td></tr>`).join('')}
      </tbody>
    </table>
    <div class="total">Total Due: ${cur} ${Number(doc.total || 0).toLocaleString()}</div>
  </div>
</body>
</html>`);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
