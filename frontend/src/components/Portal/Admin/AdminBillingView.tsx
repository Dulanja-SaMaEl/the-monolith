import React, { useState, useMemo } from 'react';
import {
  UserProfile,
  PortalProject,
  ProjectPaymentPlan,
  BillingDocument,
  BillingLineItem,
  BillingScope,
} from '../../../lib/portalStore';
import { portalApi } from '../../../lib/portalApi';
import { downloadBillingVoucherHtml, printBillingVoucherPdf } from '../../../lib/invoiceDownloader';
import { AdminPagination, AdminSkeletonList, AdminToolbar } from './AdminUiPrimitives';
import { ScrollReveal } from '../../MedianStudio/ScrollReveal';

interface AdminBillingViewProps {
  users: UserProfile[];
  projects: PortalProject[];
  paymentPlans: ProjectPaymentPlan[];
  billingDocs: BillingDocument[];
  isSyncing: boolean;
  onRefresh: () => Promise<void>;
  onPreviewDoc: (doc: BillingDocument) => void;
  showAlert: (msg: string) => void;
}

export const AdminBillingView: React.FC<AdminBillingViewProps> = ({
  users,
  projects,
  paymentPlans,
  billingDocs,
  isSyncing,
  onRefresh,
  onPreviewDoc,
  showAlert,
}) => {
  const clients = useMemo(() => users.filter((u) => u.role === 'client'), [users]);

  const [mode, setMode] = useState<'registry' | 'create'>('registry');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'invoice' | 'quotation' | 'unpaid'>('all');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  // Create form states
  const [billType, setBillType] = useState<'quotation' | 'invoice'>('invoice');
  const [billClientId, setBillClientId] = useState('');
  const [billScope, setBillScope] = useState<BillingScope>('project_cover');
  const [billProjectId, setBillProjectId] = useState('');
  const [billPaymentPlanId, setBillPaymentPlanId] = useState('');
  const [billProjectTitle, setBillProjectTitle] = useState('');
  const [billDueDate, setBillDueDate] = useState('');
  const [billNotes, setBillNotes] = useState('');
  const [lineItems, setLineItems] = useState<BillingLineItem[]>([
    { id: '1', description: 'Core Software Deliverable & System Setup', quantity: 1, unit_price: 250000, total: 250000 },
  ]);
  const [lastCreatedDoc, setLastCreatedDoc] = useState<BillingDocument | null>(null);

  const enrichDoc = (doc: BillingDocument): BillingDocument => {
    const client = users.find((u) => u.id === doc.client_id);
    if (!client) return doc;
    return {
      ...doc,
      client_name: doc.client_name || client.company_name || client.full_name,
      client_contact_name: doc.client_contact_name || client.full_name,
      client_email: doc.client_email || client.email,
      client_phone: doc.client_phone || client.phone,
    };
  };

  const filteredDocs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return billingDocs.filter((d) => {
      if (typeFilter === 'invoice' && d.type !== 'invoice') return false;
      if (typeFilter === 'quotation' && d.type !== 'quotation') return false;
      if (typeFilter === 'unpaid' && d.status === 'paid') return false;
      if (!q) return true;
      return (
        d.document_number.toLowerCase().includes(q) ||
        (d.client_name || '').toLowerCase().includes(q) ||
        (d.project_title || '').toLowerCase().includes(q)
      );
    });
  }, [billingDocs, search, typeFilter]);

  const addLineItem = () => {
    setLineItems([...lineItems, { id: String(Date.now()), description: '', quantity: 1, unit_price: 50000, total: 50000 }]);
  };

  const updateLineItem = (id: string, field: keyof BillingLineItem, val: any) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: val };
        updated.total = Number(updated.quantity || 1) * Number(updated.unit_price || 0);
        return updated;
      })
    );
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((i) => i.id !== id));
  };

  const createBillingRecord = async (): Promise<BillingDocument | null> => {
    if (!billClientId || lineItems.length === 0) return null;
    const selectedClient = clients.find((u) => u.id === billClientId);
    const selectedPlan = paymentPlans.find((p) => p.id === billPaymentPlanId);
    const resolvedProjectId = billProjectId || selectedPlan?.project_id || undefined;
    const selectedProject = projects.find((p) => p.id === resolvedProjectId);
    const subtotal = lineItems.reduce((acc, i) => acc + i.total, 0);

    try {
      const { document: created } = await portalApi.createBillingDocument({
        type: billType,
        client_id: billClientId,
        client_name: selectedClient?.company_name || selectedClient?.full_name || 'Client',
        client_contact_name: selectedClient?.full_name,
        client_email: selectedClient?.email,
        client_phone: selectedClient?.phone,
        project_id: resolvedProjectId,
        payment_plan_id: billScope === 'project_cover' ? billPaymentPlanId || undefined : undefined,
        billing_scope: billScope,
        project_title: billProjectTitle || selectedProject?.title || 'Monolith LK Deliverable',
        status: 'sent',
        currency: 'LKR',
        line_items: lineItems,
        subtotal,
        tax: 0,
        total: subtotal,
        due_date: billDueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        notes: billNotes || 'Settled in LKR via Sri Lanka CEFTS / Corporate Bank Wire.',
      });

      const enriched = enrichDoc(created);
      setLastCreatedDoc(enriched);
      setBillProjectTitle('');
      setBillNotes('');
      await onRefresh();
      showAlert(
        `✓ ${billType.toUpperCase()} (${created.document_number}) issued (${
          billScope === 'project_cover' ? 'Project Cover-Up' : 'Separate Charge'
        }).`
      );
      return enriched;
    } catch (err: any) {
      showAlert(`✕ Error creating billing document: ${err.message}`);
      return null;
    }
  };

  const handleConvertQuotation = async (quo: BillingDocument) => {
    const scopeChoice = window.confirm(
      `Convert Quotation ${quo.document_number} (${quo.currency || 'LKR'} ${quo.total.toLocaleString()}) into an Invoice?\n\nPress OK to count it toward Project Payment Cover-Up (or Cancel to choose Separate / Standalone).`
    );
    const chosenScope: BillingScope = scopeChoice ? 'project_cover' : 'separate';
    if (
      !scopeChoice &&
      !window.confirm(`Create ${quo.document_number} as a SEPARATE / STANDALONE Invoice? (Cancel to abort)`)
    ) {
      return;
    }

    const enriched = enrichDoc(quo);
    const matchedPlan =
      chosenScope === 'project_cover'
        ? paymentPlans.find(
            (pl) =>
              pl.id === quo.payment_plan_id ||
              (quo.project_id && pl.project_id === quo.project_id && pl.client_id === quo.client_id)
          )
        : undefined;

    try {
      const dueDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
      const { document: createdInv } = await portalApi.createBillingDocument({
        type: 'invoice',
        client_id: quo.client_id,
        client_name: enriched.client_name,
        client_contact_name: enriched.client_contact_name,
        client_email: enriched.client_email,
        client_phone: enriched.client_phone,
        project_id: quo.project_id || matchedPlan?.project_id,
        payment_plan_id: chosenScope === 'project_cover' ? matchedPlan?.id || quo.payment_plan_id : undefined,
        billing_scope: chosenScope,
        project_title: quo.project_title || 'Converted Project Deliverable',
        status: 'sent',
        currency: quo.currency || 'LKR',
        line_items: quo.line_items,
        subtotal: quo.subtotal,
        tax: quo.tax,
        total: quo.total,
        due_date: dueDate,
        notes: `Converted from Quotation ${quo.document_number}. ${quo.notes || ''}`.trim(),
      });

      if (quo.status !== 'approved' && quo.status !== 'paid') {
        await portalApi.updateBillingStatus(quo.id, 'approved');
      }

      const finalInv = enrichDoc(createdInv);
      setLastCreatedDoc(finalInv);
      await onRefresh();
      showAlert(`✓ Converted ${quo.document_number} → Invoice ${finalInv.document_number}.`);
    } catch (err: any) {
      showAlert(`✕ Error converting quotation: ${err.message}`);
    }
  };

  const handleDelete = async (doc: BillingDocument) => {
    if (!window.confirm(`Permanently delete ${doc.type.toUpperCase()} ${doc.document_number}?`)) return;
    try {
      await portalApi.deleteBillingDocument(doc.id);
      if (lastCreatedDoc?.id === doc.id) setLastCreatedDoc(null);
      await onRefresh();
      showAlert(`✓ Deleted ${doc.document_number}.`);
    } catch (err: any) {
      showAlert(`✕ Error deleting document: ${err.message}`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Clean Segmented Toolbar */}
      <div data-guide="admin-billing-composer-btn">
      <ScrollReveal variant="fade-up" duration={550} once>
        <AdminToolbar
          searchValue={mode === 'registry' ? search : undefined}
          onSearchChange={
            mode === 'registry'
              ? (v) => {
                  setSearch(v);
                  setPage(1);
                }
              : undefined
          }
          searchPlaceholder="Search invoice #, client, project..."
          actionLabel="+ Issue Invoice / Quote"
          actionOpen={mode === 'create'}
          onActionToggle={() => setMode((m) => (m === 'create' ? 'registry' : 'create'))}
          extraControls={
            mode === 'registry' ? (
              <div className="flex flex-wrap items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-median-taupe/20 text-[10px] font-mono">
                {(['all', 'invoice', 'quotation', 'unpaid'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      setTypeFilter(f);
                      setPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-lg uppercase font-bold transition-all ${
                      typeFilter === f ? 'bg-black text-white' : 'text-median-taupe hover:text-black'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-xs font-mono text-median-taupe">
                Focused Document Composer · Currency: <strong className="text-black">LKR</strong>
              </span>
            )
          }
        />
      </ScrollReveal>
      </div>

      {/* Instant Ready Banner (visible in either mode) */}
      {lastCreatedDoc && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div>
            <strong className="text-emerald-950 uppercase block">
              ✓ Document Ready: {lastCreatedDoc.document_number} ({lastCreatedDoc.type})
            </strong>
            <span className="text-emerald-800">
              {lastCreatedDoc.client_name} · LKR {lastCreatedDoc.total.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onPreviewDoc(lastCreatedDoc)}
              className="px-3 py-1.5 rounded-lg border border-emerald-700 text-emerald-900 hover:bg-emerald-100 font-bold uppercase"
            >
              Preview
            </button>
            <button
              type="button"
              onClick={() => downloadBillingVoucherHtml(lastCreatedDoc)}
              className="px-3 py-1.5 rounded-lg bg-white border border-emerald-700 text-emerald-900 hover:bg-emerald-700 hover:text-white font-bold uppercase"
            >
              ↓ Download
            </button>
            <button
              type="button"
              onClick={() => printBillingVoucherPdf(lastCreatedDoc)}
              className="px-3 py-1.5 rounded-lg bg-black text-white hover:bg-median-taupe font-bold uppercase"
            >
              Save PDF ↗
            </button>
            <button
              type="button"
              onClick={() => setLastCreatedDoc(null)}
              className="px-2 py-1 text-emerald-800 hover:text-black font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* MODE A: DEDICATED FULL-WIDTH COMPOSER */}
      {mode === 'create' && (
        <ScrollReveal variant="card-lift" duration={550} once>
          <div className="max-w-4xl mx-auto p-5 sm:p-8 rounded-2xl bg-white border border-median-taupe/20 shadow-sm">
            <h3 className="font-oswald text-xl sm:text-2xl font-bold uppercase text-black mb-1">
              Create Quotation / Invoice
            </h3>
            <p className="text-xs text-median-taupe/80 mb-6">
              Issue a formal quotation or payment invoice. Link it to cover a project payment package or issue as a separate standalone charge.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await createBillingRecord();
              }}
              className="space-y-4 text-xs font-mono"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase text-black mb-1">Document Type</label>
                  <select
                    value={billType}
                    onChange={(e) => setBillType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
                  >
                    <option value="invoice">Invoice (Payment Request)</option>
                    <option value="quotation">Formal Quotation</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase text-black mb-1">Select Client *</label>
                  <select
                    required
                    value={billClientId}
                    onChange={(e) => {
                      setBillClientId(e.target.value);
                      setBillProjectId('');
                      setBillPaymentPlanId('');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
                  >
                    <option value="">-- Choose Client --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.company_name} ({c.full_name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Allocation Mode */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-median-taupe/20 space-y-3">
                <label className="block font-bold uppercase text-black">Payment Allocation Mode</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setBillScope('project_cover')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      billScope === 'project_cover'
                        ? 'bg-black text-white border-black shadow-sm'
                        : 'bg-white text-black border-median-taupe/30 hover:border-black'
                    }`}
                  >
                    <div className="font-bold uppercase text-[11px]">Project Cover-Up</div>
                    <div className={`text-[10px] mt-0.5 ${billScope === 'project_cover' ? 'text-white/75' : 'text-median-taupe'}`}>
                      Automatically updates client&apos;s payment progress when marked Paid
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBillScope('separate');
                      setBillPaymentPlanId('');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      billScope === 'separate'
                        ? 'bg-black text-white border-black shadow-sm'
                        : 'bg-white text-black border-median-taupe/30 hover:border-black'
                    }`}
                  >
                    <div className="font-bold uppercase text-[11px]">Separate / Standalone</div>
                    <div className={`text-[10px] mt-0.5 ${billScope === 'separate' ? 'text-white/75' : 'text-median-taupe'}`}>
                      Independent charge (travel, add-ons, domain/server extras)
                    </div>
                  </button>
                </div>

                {billClientId && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-median-taupe mb-1">Client Project</label>
                      <select
                        value={billProjectId}
                        onChange={(e) => {
                          const pid = e.target.value;
                          setBillProjectId(pid);
                          const matchedProj = projects.find((p) => p.id === pid);
                          if (matchedProj && !billProjectTitle) setBillProjectTitle(matchedProj.title);
                          if (billScope === 'project_cover') {
                            const matchedPlan = paymentPlans.find(
                              (pl) => pl.client_id === billClientId && pl.project_id === pid
                            );
                            setBillPaymentPlanId(matchedPlan?.id || '');
                          }
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-white text-xs text-black"
                      >
                        <option value="">-- No Specific Project --</option>
                        {projects
                          .filter((p) => p.client_id === billClientId)
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.code_name} · {p.title}
                            </option>
                          ))}
                      </select>
                    </div>
                    {billScope === 'project_cover' && (
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-median-taupe mb-1">
                          Target Payment Package
                        </label>
                        <select
                          value={billPaymentPlanId}
                          onChange={(e) => {
                            const planId = e.target.value;
                            setBillPaymentPlanId(planId);
                            const matched = paymentPlans.find((pl) => pl.id === planId);
                            if (matched?.project_id) setBillProjectId(matched.project_id);
                            if (matched?.project_title && !billProjectTitle) setBillProjectTitle(matched.project_title);
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-white text-xs text-black"
                        >
                          <option value="">-- Auto-match Project Plan --</option>
                          {paymentPlans
                            .filter((pl) => pl.client_id === billClientId)
                            .map((pl) => (
                              <option key={pl.id} value={pl.id}>
                                {pl.package_name} ({pl.currency} {pl.total_amount.toLocaleString()})
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase text-black mb-1">Project / Reference Title</label>
                  <input
                    type="text"
                    value={billProjectTitle}
                    onChange={(e) => setBillProjectTitle(e.target.value)}
                    placeholder="e.g. Phase 02 System Deployment"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-black mb-1">Payment Due Date</label>
                  <input
                    type="date"
                    value={billDueDate}
                    onChange={(e) => setBillDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div className="pt-2 border-t border-median-taupe/15 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold uppercase text-black">Itemized Deliverables</span>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="text-[11px] text-median-taupe hover:text-black font-bold uppercase underline"
                  >
                    + Add Item Row
                  </button>
                </div>

                {lineItems.map((item) => (
                  <div key={item.id} className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
                    <input
                      type="text"
                      required
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                      placeholder="Deliverable description..."
                      className="w-full sm:flex-1 px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-xs text-black"
                    />
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, 'quantity', Number(e.target.value))}
                        className="w-16 sm:w-14 px-2 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-xs text-center text-black"
                      />
                      <input
                        type="number"
                        step="100"
                        value={item.unit_price}
                        onChange={(e) => updateLineItem(item.id, 'unit_price', Number(e.target.value))}
                        className="flex-1 sm:w-28 px-2 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-xs text-right text-black"
                      />
                      <button
                        type="button"
                        onClick={() => removeLineItem(item.id)}
                        className="text-red-500 hover:text-red-700 px-2 py-1 font-bold text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}

                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-median-taupe/20 flex justify-between font-bold text-sm text-black">
                  <span>Total Calculation:</span>
                  <span className="font-oswald text-lg text-median-taupe">
                    LKR {lineItems.reduce((acc, i) => acc + i.total, 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-black mb-1">Terms &amp; Banking Notes</label>
                <textarea
                  rows={2}
                  value={billNotes}
                  onChange={(e) => setBillNotes(e.target.value)}
                  placeholder="Wire instructions, Net-14 clauses..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-black text-white font-oswald text-xs uppercase tracking-widest hover:bg-median-taupe transition-colors"
                >
                  Generate &amp; Send →
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const created = await createBillingRecord();
                    if (created) printBillingVoucherPdf(created);
                  }}
                  className="w-full py-3 rounded-xl border border-black text-black hover:bg-black hover:text-white font-oswald text-xs uppercase tracking-widest transition-colors"
                >
                  Generate &amp; Save PDF ↓
                </button>
              </div>
            </form>
          </div>
        </ScrollReveal>
      )}

      {/* MODE B: FULL-WIDTH MINIMALIST BILLING REGISTRY */}
      {mode === 'registry' && (
        <div className="space-y-3">
          {isSyncing ? (
            <AdminSkeletonList count={4} />
          ) : filteredDocs.length === 0 ? (
            <div className="p-10 rounded-2xl bg-white border border-median-taupe/20 text-center text-xs font-mono text-median-taupe">
              No invoices or quotations found. Click <strong>+ Issue Invoice / Quote</strong> above.
            </div>
          ) : (
            filteredDocs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((rawDoc, idx) => {
              const doc = enrichDoc(rawDoc);
              return (
                <ScrollReveal key={doc.id} variant="fade-up" delay={idx * 50} duration={550} once>
                  <div className="p-4 sm:p-5 rounded-2xl bg-white border border-median-taupe/20 hover:border-median-taupe/50 shadow-sm space-y-3 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe font-bold">
                            {doc.type.toUpperCase()} · {doc.document_number}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${
                              doc.billing_scope === 'project_cover'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-[#FAF8F5] text-median-taupe border-median-taupe/25'
                            }`}
                          >
                            {doc.billing_scope === 'project_cover' ? 'Project Cover-Up' : 'Separate Charge'}
                          </span>
                        </div>
                        <h4 className="font-oswald text-lg sm:text-xl font-bold uppercase text-black break-words">
                          {doc.client_name}
                          {doc.client_contact_name && doc.client_contact_name !== doc.client_name && (
                            <span className="text-sm font-normal text-median-taupe normal-case ml-2">
                              ({doc.client_contact_name})
                            </span>
                          )}
                        </h4>
                        <div className="text-xs font-mono text-median-taupe/80">
                          <strong className="text-black">{doc.currency || 'LKR'} {doc.total.toLocaleString()}</strong>
                          {doc.project_title ? ` · ${doc.project_title}` : ''}
                          {doc.due_date ? ` · Due ${doc.due_date}` : ''}
                        </div>
                      </div>

                      <span
                        className={`self-start px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase shrink-0 ${
                          doc.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : doc.status === 'approved'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-median-taupe/15 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        {doc.status !== 'paid' && (
                          <button
                            type="button"
                            onClick={async () => {
                              await portalApi.updateBillingStatus(doc.id, 'paid');
                              await onRefresh();
                              showAlert(
                                doc.billing_scope === 'project_cover' && doc.type === 'invoice'
                                  ? `Marked ${doc.document_number} PAID & updated project payment progress.`
                                  : `Marked ${doc.document_number} as PAID.`
                              );
                            }}
                            className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-mono font-bold hover:bg-emerald-700 transition-colors"
                          >
                            Mark Paid ✓
                          </button>
                        )}
                        {doc.status !== 'approved' && doc.status !== 'paid' && (
                          <button
                            type="button"
                            onClick={async () => {
                              await portalApi.updateBillingStatus(doc.id, 'approved');
                              await onRefresh();
                              showAlert(`Marked ${doc.document_number} as APPROVED.`);
                            }}
                            className="px-3 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-mono font-bold hover:bg-blue-700 transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        {doc.type === 'quotation' && (
                          <button
                            type="button"
                            onClick={() => handleConvertQuotation(doc)}
                            className="px-3 py-1 rounded-lg bg-black text-white text-[10px] font-mono font-bold hover:bg-median-taupe transition-colors"
                          >
                            Convert → Invoice
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => onPreviewDoc(doc)}
                          className="px-2.5 py-1 rounded-lg border border-median-taupe/35 text-median-taupe hover:border-black hover:text-black text-[10px] font-mono font-bold uppercase"
                        >
                          Preview
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadBillingVoucherHtml(doc)}
                          className="px-2.5 py-1 rounded-lg border border-median-taupe/35 text-black hover:border-black text-[10px] font-mono font-bold uppercase"
                        >
                          ↓ HTML
                        </button>
                        <button
                          type="button"
                          onClick={() => printBillingVoucherPdf(doc)}
                          className="px-2.5 py-1 rounded-lg bg-black text-white hover:bg-median-taupe text-[10px] font-mono font-bold uppercase transition-colors"
                        >
                          PDF ↗
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(doc)}
                          className="px-2.5 py-1 rounded-lg border border-red-200 text-red-700 hover:bg-red-600 hover:text-white text-[10px] font-mono font-bold uppercase transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })
          )}

          <AdminPagination
            currentPage={page}
            totalItems={filteredDocs.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};
