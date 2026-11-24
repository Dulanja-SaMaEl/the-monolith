import React, { useState } from 'react';
import { ProjectChangeRequest, PortalProject } from '../../../lib/portalStore';
import { portalApi } from '../../../lib/portalApi';

interface AdminChangeRequestsPanelProps {
  project: PortalProject;
  changeRequests: ProjectChangeRequest[];
  onRefresh: () => Promise<void>;
  showAlert: (msg: string) => void;
}

export const AdminChangeRequestsPanel: React.FC<AdminChangeRequestsPanelProps> = ({
  project,
  changeRequests,
  onRefresh,
  showAlert,
}) => {
  const projectCrs = changeRequests.filter((cr) => cr.project_id === project.id);
  const pendingCount = projectCrs.filter((cr) => cr.status === 'requested').length;

  const [expanded, setExpanded] = useState(pendingCount > 0);
  const [quotingId, setQuotingId] = useState<string | null>(null);
  const [isComplimentary, setIsComplimentary] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState('25000');
  const [timelineDays, setTimelineDays] = useState('3');
  const [autoInvoice, setAutoInvoice] = useState(true);
  const [adminNotes, setAdminNotes] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  if (projectCrs.length === 0) return null;

  const openQuoteForm = (cr: ProjectChangeRequest) => {
    if (quotingId === cr.id) {
      setQuotingId(null);
      return;
    }
    setQuotingId(cr.id);
    setIsComplimentary(cr.is_complimentary);
    setEstimatedCost(cr.estimated_cost > 0 ? String(cr.estimated_cost) : '25000');
    setTimelineDays(String(cr.timeline_impact_days || 0));
    setAutoInvoice(cr.auto_create_invoice !== false);
    setAdminNotes(cr.admin_notes || '');
  };

  const handleSendQuote = async (e: React.FormEvent, cr: ProjectChangeRequest) => {
    e.preventDefault();
    setBusyId(cr.id);
    try {
      await portalApi.quoteChangeRequest(cr.id, {
        is_complimentary: isComplimentary,
        estimated_cost: isComplimentary ? 0 : Number(estimatedCost) || 0,
        currency: 'LKR',
        timeline_impact_days: Math.max(0, Number(timelineDays) || 0),
        auto_create_invoice: isComplimentary ? false : autoInvoice,
        admin_notes: adminNotes,
      });
      setQuotingId(null);
      await onRefresh();
      showAlert(`✓ Impact Card sent to ${project.client_name} for "${cr.title}".`);
    } catch (err: any) {
      showAlert(`✕ Error quoting change request: ${err.message}`);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="rounded-xl bg-[#FAF8F5] border border-median-taupe/25 overflow-hidden text-xs font-mono">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full px-4 py-2.5 flex items-center justify-between gap-2 hover:bg-median-taupe/5 transition-colors text-left"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-oswald text-sm font-bold uppercase text-black">
            Change Request Impact Cards ({projectCrs.length})
          </span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-bold uppercase">
              {pendingCount} Needs Impact Quote
            </span>
          )}
        </div>
        <span className="text-[11px] font-bold text-median-taupe uppercase">
          {expanded ? 'Hide ▲' : 'Open ▼'}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-median-taupe/15 space-y-3">
          {projectCrs.map((cr) => (
            <div
              key={cr.id}
              className="p-3.5 rounded-xl bg-white border border-median-taupe/20 space-y-2.5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                        cr.status === 'requested'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : cr.status === 'quoted'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : cr.status === 'approved' || cr.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                      }`}
                    >
                      {cr.status.replace('_', ' ')}
                    </span>
                    {cr.priority === 'urgent' && (
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[9px] font-bold uppercase">
                        Urgent
                      </span>
                    )}
                    {cr.invoice_number && (
                      <span className="px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-median-taupe/25 text-black text-[9px] font-bold">
                        {cr.invoice_number}
                      </span>
                    )}
                  </div>
                  <strong className="font-oswald text-base uppercase text-black block">{cr.title}</strong>
                  <p className="text-[11px] text-black/75 mt-0.5">{cr.description}</p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  {(cr.status === 'requested' || cr.status === 'quoted') && (
                    <button
                      type="button"
                      onClick={() => openQuoteForm(cr)}
                      className="px-3 py-1 rounded-lg bg-black text-white hover:bg-median-taupe text-[10px] font-bold uppercase transition-colors"
                    >
                      {quotingId === cr.id
                        ? 'Close'
                        : cr.status === 'quoted'
                        ? 'Edit Quote'
                        : 'Send Impact Card'}
                    </button>
                  )}
                  {cr.status === 'approved' && (
                    <button
                      type="button"
                      disabled={busyId === cr.id}
                      onClick={async () => {
                        setBusyId(cr.id);
                        await portalApi.updateChangeRequestStatus(cr.id, 'completed');
                        await onRefresh();
                        setBusyId(null);
                        showAlert(`✓ Marked "${cr.title}" completed.`);
                      }}
                      className="px-3 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-[10px] font-bold uppercase transition-colors"
                    >
                      Mark Delivered ✓
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      if (!window.confirm(`Delete change request "${cr.title}"?`)) return;
                      await portalApi.deleteChangeRequest(cr.id);
                      await onRefresh();
                      showAlert('✓ Change request removed.');
                    }}
                    className="px-2.5 py-1 rounded-lg border border-red-200 text-red-700 hover:bg-red-600 hover:text-white text-[10px] font-bold uppercase transition-colors"
                  >
                    Del
                  </button>
                </div>
              </div>

              {/* Existing Impact Summary */}
              {cr.status !== 'requested' && quotingId !== cr.id && (
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-median-taupe/15 text-[11px]">
                  <span className="font-bold text-black">
                    Cost:{' '}
                    {cr.is_complimentary || cr.estimated_cost <= 0
                      ? 'Complimentary (LKR 0)'
                      : `${cr.currency} ${Number(cr.estimated_cost).toLocaleString()}`}
                  </span>
                  <span className="text-median-taupe/40">·</span>
                  <span className="font-bold text-black">
                    Timeline:{' '}
                    {cr.timeline_impact_days > 0 ? `+${cr.timeline_impact_days} Days` : 'No Delay'}
                  </span>
                  {cr.admin_notes && (
                    <>
                      <span className="text-median-taupe/40">·</span>
                      <span className="text-median-taupe truncate max-w-md">{cr.admin_notes}</span>
                    </>
                  )}
                </div>
              )}

              {/* Inline Quote Composer */}
              {quotingId === cr.id && (
                <form
                  onSubmit={(e) => handleSendQuote(e, cr)}
                  className="p-3.5 rounded-xl bg-[#FAF8F5] border border-black/15 space-y-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsComplimentary(false)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase border transition-colors ${
                        !isComplimentary
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-median-taupe border-median-taupe/30'
                      }`}
                    >
                      Priced Add-On (LKR)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsComplimentary(true)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase border transition-colors ${
                        isComplimentary
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-white text-median-taupe border-median-taupe/30'
                      }`}
                    >
                      Complimentary (Free)
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {!isComplimentary && (
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-black mb-1">
                          Additional Cost (LKR) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="500"
                          required
                          value={estimatedCost}
                          onChange={(e) => setEstimatedCost(e.target.value)}
                          placeholder="25000"
                          className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-white text-black"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-black mb-1">
                        Launch Timeline Impact (Days — 0 = No Delay)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="180"
                        value={timelineDays}
                        onChange={(e) => setTimelineDays(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-white text-black"
                      />
                    </div>
                  </div>

                  {!isComplimentary && (
                    <label className="flex items-center gap-2 text-[11px] text-black cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoInvoice}
                        onChange={(e) => setAutoInvoice(e.target.checked)}
                        className="accent-black"
                      />
                      <span>Automatically issue a Separate Charge Invoice when client clicks Approve</span>
                    </label>
                  )}

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-black mb-1">
                      Architect Scope Note (Visible to Client)
                    </label>
                    <input
                      type="text"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="e.g. Includes webhook setup, dashboard toggle, and QA testing."
                      className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-white text-black"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setQuotingId(null)}
                      className="px-3 py-1.5 rounded-lg border border-median-taupe/30 text-median-taupe hover:text-black uppercase text-[10px] font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={busyId === cr.id}
                      className="px-4 py-1.5 rounded-lg bg-black text-white hover:bg-median-taupe uppercase text-[10px] font-bold tracking-wider transition-colors disabled:opacity-50"
                    >
                      {busyId === cr.id ? 'Publishing...' : 'Publish Impact Card to Client →'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
