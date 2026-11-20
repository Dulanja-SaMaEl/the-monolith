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

export default router;
