import { Router, Response } from 'express';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { supabaseAdmin } from '../services/supabase';

const router = Router();

// GET /api/billing - View invoices & quotations
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    let query = supabaseAdmin
      .from('documents_billing')
      .select('*, client:profiles!client_id(full_name, email, company_name), project:projects!project_id(title, code_name)');

    if (req.user?.role !== 'admin') {
      query = query.eq('client_id', req.user?.id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ documents: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/billing - Admin creates invoice or quotation
router.post('/', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      type,
      client_id,
      project_id,
      currency,
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
    const subtotal = line_items.reduce((acc: number, item: any) => {
      const qty = Number(item.quantity) || 1;
      const unit = Number(item.unit_price) || 0;
      return acc + qty * unit;
    }, 0);

    const tax = subtotal * (Number(tax_percentage) / 100);
    const total = subtotal + tax;

    // Generate Document Number (e.g. INV-2026-104 or QUO-2026-104)
    const prefix = type === 'invoice' ? 'INV' : 'QUO';
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const document_number = `${prefix}-${new Date().getFullYear()}-${randCode}`;

    const { data, error } = await supabaseAdmin
      .from('documents_billing')
      .insert({
        document_number,
        type,
        client_id,
        project_id: project_id || null,
        status: 'draft',
        currency: currency || 'USD',
        line_items,
        subtotal,
        tax,
        total,
        due_date,
        notes,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ document: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/billing/:id/status - Admin updates document status
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
      .select()
      .single();

    if (error) throw error;
    res.json({ document: data });
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

// GET /api/billing/:id/download - Download voucher file
router.get('/:id/download', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    let query = supabaseAdmin
      .from('documents_billing')
      .select('*, client:profiles!client_id(full_name, email, company_name)')
      .eq('id', id);

    if (req.user?.role !== 'admin') {
      query = query.eq('client_id', req.user?.id);
    }

    const { data: doc, error } = await query.single();
    if (error || !doc) {
      res.status(404).json({ error: 'Billing document not found or access denied' });
      return;
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${escapeHtml(doc.document_number)}.html"`);
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(doc.document_number)} — Monolith LK</title>
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
    <p>Issued to: <strong>${escapeHtml(doc.client?.company_name || doc.client?.full_name)}</strong> (${escapeHtml(doc.client?.email)})</p>
    <p>Due Date: <strong>${escapeHtml(doc.due_date)}</strong> · Status: <strong>${escapeHtml(doc.status).toUpperCase()}</strong></p>
    <table>
      <thead>
        <tr><th>Deliverable Item</th><th>Qty</th><th>Unit Rate</th><th>Total</th></tr>
      </thead>
      <tbody>
        ${(doc.line_items || []).map((i: any) => `<tr><td>${escapeHtml(i.description)}</td><td>${escapeHtml(i.quantity)}</td><td>$${Number(i.unit_price || 0).toLocaleString()}</td><td>$${Number(i.total || 0).toLocaleString()}</td></tr>`).join('')}
      </tbody>
    </table>
    <div class="total">Total Due: $${Number(doc.total || 0).toLocaleString()} ${escapeHtml(doc.currency)}</div>
  </div>
</body>
</html>`);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
