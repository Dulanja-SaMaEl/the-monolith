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
    res.setHeader('Content-Disposition', `attachment; filename="${doc.document_number}.html"`);
    res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${doc.document_number} — Monolith LK</title>
  <style>
    body { font-family: sans-serif; padding: 40px; background: #faf8f5; color: #141414; }
    .card { max-width: 800px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 12px; border: 1px solid #9f8170; }
    h1 { margin: 0 0 10px; font-size: 24px; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; border-bottom: 1px solid #eee; text-align: left; }
    th { color: #9f8170; }
    .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; color: #9f8170; }
  </style>
</head>
<body>
  <div class="card">
    <h1>MONOLITH LK · ${doc.type.toUpperCase()}: ${doc.document_number}</h1>
    <p>Issued to: <strong>${doc.client?.company_name || doc.client?.full_name}</strong> (${doc.client?.email})</p>
    <p>Due Date: <strong>${doc.due_date}</strong> · Status: <strong>${doc.status.toUpperCase()}</strong></p>
    <table>
      <thead>
        <tr><th>Deliverable Item</th><th>Qty</th><th>Unit Rate</th><th>Total</th></tr>
      </thead>
      <tbody>
        ${(doc.line_items || []).map((i: any) => `<tr><td>${i.description}</td><td>${i.quantity}</td><td>$${i.unit_price}</td><td>$${i.total}</td></tr>`).join('')}
      </tbody>
    </table>
    <div class="total">Total Due: $${doc.total} ${doc.currency}</div>
  </div>
</body>
</html>`);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
