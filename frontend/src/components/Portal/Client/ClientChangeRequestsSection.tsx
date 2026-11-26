import React, { useState } from 'react';
import {
  PortalProject,
  ProjectChangeRequest,
  BillingDocument,
  UserProfile,
} from '../../../lib/portalStore';
import { portalApi } from '../../../lib/portalApi';

interface ClientChangeRequestsSectionProps {
  project: PortalProject;
  client: UserProfile;
  changeRequests: ProjectChangeRequest[];
  billingDocs: BillingDocument[];
  onRefresh: () => Promise<void>;
  onViewInvoice: (doc: BillingDocument) => void;
}

const STATUS_BADGE: Record<
  ProjectChangeRequest['status'],
  { label: string; cls: string }
> = {
  requested: {
    label: 'Awaiting Impact Card',
    cls: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  quoted: {
    label: 'Impact Card Ready · Action Needed',
    cls: 'bg-black text-white border-black',
  },
  approved: {
    label: 'Approved · Added to Build ✓',
    cls: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  in_progress: {
    label: 'In Development',
    cls: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  completed: {
    label: 'Delivered ✓',
    cls: 'bg-emerald-100 text-emerald-900 border-emerald-400',
  },
  declined: {
    label: 'Declined',
    cls: 'bg-neutral-100 text-neutral-600 border-neutral-300',
  },
};

export const ClientChangeRequestsSection: React.FC<ClientChangeRequestsSectionProps> = ({
  project,
  client,
  changeRequests,
  billingDocs,
  onRefresh,
  onViewInvoice,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);

  const projectCrs = changeRequests.filter((cr) => cr.project_id === project.id);
  const quotedCount = projectCrs.filter((cr) => cr.status === 'quoted').length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setIsSubmitting(true);
    setBannerMsg(null);
    try {
      await portalApi.createChangeRequest({
        project_id: project.id,
        project_title: project.title,
        project_code: project.code_name,
        client_id: client.id,
        client_name: client.company_name || client.full_name,
        title: title.trim(),
        description: description.trim(),
        priority,
      });
      setTitle('');
      setDescription('');
      setPriority('normal');
      setShowForm(false);
      await onRefresh();
      setBannerMsg('✓ Request sent! Monolith LK will reply here with a transparent Cost & Timeline Impact Card.');
      setTimeout(() => setBannerMsg(null), 6000);
    } catch (err: any) {
      setBannerMsg(`✕ ${err.message || 'Could not submit change request'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRespond = async (cr: ProjectChangeRequest, action: 'approve' | 'decline') => {
    if (
      action === 'approve' &&
      !cr.is_complimentary &&
      cr.estimated_cost > 0 &&
      !window.confirm(
        `Approve "${cr.title}" for ${cr.currency} ${cr.estimated_cost.toLocaleString()} (${
          cr.timeline_impact_days > 0 ? `+${cr.timeline_impact_days} Days` : 'No Delay'
        })?${cr.auto_create_invoice ? ' This will automatically generate a Separate Invoice and add it to your build.' : ''}`
      )
    ) {
      return;
    }

    setRespondingId(cr.id);
    setBannerMsg(null);
    try {
      const res = await portalApi.respondChangeRequest(cr.id, action);
      await onRefresh();
      if (action === 'approve') {
        const parts = [`✓ "${cr.title}" approved and added to your live build milestones.`];
        if (res.invoice?.document_number) {
          parts.push(`Separate Invoice ${res.invoice.document_number} issued.`);
        }
        if (res.updated_launch_date) {
          parts.push(`Target launch updated to ${res.updated_launch_date}.`);
        }
        setBannerMsg(parts.join(' '));
      } else {
        setBannerMsg(`Change request "${cr.title}" declined. Original scope & timeline remain unchanged.`);
      }
      setTimeout(() => setBannerMsg(null), 7000);
    } catch (err: any) {
      setBannerMsg(`✕ ${err.message || 'Action failed'}`);
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <div className="mt-6 pt-5 border-t border-median-taupe/15 space-y-4">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-oswald text-sm font-bold uppercase tracking-wider text-black">
            Change Requests &amp; Feature Add-Ons
          </h3>
          {quotedCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-black text-white text-[10px] font-mono font-bold uppercase animate-pulse">
              {quotedCount} Ready to Approve
            </span>
          )}
        </div>

        <button
          type="button"
          data-guide="client-change-request-btn"
          onClick={() => setShowForm((s) => !s)}
          className={`px-3.5 py-1.5 rounded-xl text-[11px] font-mono font-bold uppercase tracking-wider transition-colors ${
            showForm
              ? 'border border-median-taupe/40 bg-[#FAF8F5] text-black'
              : 'bg-black text-white hover:bg-median-taupe'
          }`}
        >
          {showForm ? 'Close Form ×' : '+ Request Tweak / New Feature'}
        </button>
      </div>

      {bannerMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono">
          {bannerMsg}
        </div>
      )}

      {/* Inline Tweak / New Feature Request Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-median-taupe/30 space-y-3.5 text-xs font-mono"
        >
          <div>
            <span className="text-[10px] uppercase tracking-widest text-median-taupe font-bold block">
              Transparent Scope Add-On
            </span>
            <p className="text-[11px] text-black/75 mt-0.5">
              Describe any tweak or extra feature. Monolith LK will reply right here with a clear Impact Card (exact LKR cost or Complimentary + launch timeline impact) before any work or charge begins.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold uppercase text-black mb-1">
                Tweak / Feature Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. WhatsApp Order Receipt Alerts or Export to Excel"
                className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-white text-sm text-black focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-black mb-1">Urgency</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'normal' | 'urgent')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-white text-sm text-black focus:outline-none focus:border-black"
              >
                <option value="normal">Standard Priority</option>
                <option value="urgent">Urgent / Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-black mb-1">
              Details &amp; Expected Behavior *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what you'd like added or adjusted..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-white text-sm text-black focus:outline-none focus:border-black"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl border border-median-taupe/30 text-median-taupe hover:text-black uppercase font-bold text-[11px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-black text-white hover:bg-median-taupe uppercase font-bold text-[11px] tracking-wider transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Sending...' : 'Request Impact Assessment →'}
            </button>
          </div>
        </form>
      )}

      {/* Existing Change Request Impact Cards */}
      {projectCrs.length > 0 && (
        <div className="space-y-3">
          {projectCrs.map((cr) => {
            const badge = STATUS_BADGE[cr.status] || STATUS_BADGE.requested;
            const linkedDoc = cr.invoice_id ? billingDocs.find((d) => d.id === cr.invoice_id) : undefined;
            const isQuoted = cr.status === 'quoted';

            return (
              <div
                key={cr.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3.5 ${
                  isQuoted
                    ? 'bg-white border-black shadow-md'
                    : 'bg-[#FAF8F5] border-median-taupe/20'
                }`}
              >
                {/* Title & Status */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold uppercase ${badge.cls}`}>
                        {badge.label}
                      </span>
                      {cr.priority === 'urgent' && (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 text-[9px] font-mono font-bold uppercase">
                          Urgent
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-median-taupe/70">
                        {new Date(cr.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-oswald text-lg font-bold uppercase text-black">{cr.title}</h4>
                    <p className="text-xs text-black/75 mt-0.5 leading-relaxed">{cr.description}</p>
                  </div>
                </div>

                {/* Transparent Impact Summary (Shown once Admin quotes it) */}
                {cr.status !== 'requested' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#FAF8F5] border border-median-taupe/20 text-xs font-mono">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-median-taupe block">
                        Cost Impact
                      </span>
                      {cr.is_complimentary || cr.estimated_cost <= 0 ? (
                        <strong className="font-oswald text-xl font-bold uppercase text-emerald-700">
                          Complimentary (LKR 0)
                        </strong>
                      ) : (
                        <strong className="font-oswald text-xl font-bold uppercase text-black">
                          {cr.currency} {Number(cr.estimated_cost).toLocaleString()}
                        </strong>
                      )}
                      {!cr.is_complimentary && cr.estimated_cost > 0 && cr.auto_create_invoice && (
                        <span className="block text-[10px] text-median-taupe mt-0.5">
                          Billed as a Separate Invoice upon approval
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-median-taupe block">
                        Launch Timeline Impact
                      </span>
                      {cr.timeline_impact_days > 0 ? (
                        <strong className="font-oswald text-xl font-bold uppercase text-amber-800">
                          +{cr.timeline_impact_days} Day{cr.timeline_impact_days === 1 ? '' : 's'}
                        </strong>
                      ) : (
                        <strong className="font-oswald text-xl font-bold uppercase text-emerald-700">
                          No Delay
                        </strong>
                      )}
                      <span className="block text-[10px] text-median-taupe mt-0.5">
                        {cr.timeline_impact_days > 0
                          ? 'Target launch date adjusts automatically'
                          : 'Absorbed inside current sprint schedule'}
                      </span>
                    </div>

                    {cr.admin_notes && (
                      <div className="sm:col-span-2 pt-2.5 border-t border-median-taupe/15 text-[11px] text-black/85">
                        <strong className="text-median-taupe uppercase">Monolith LK Architect Note:</strong>{' '}
                        {cr.admin_notes}
                      </div>
                    )}
                  </div>
                )}

                {/* Client 1-Tap Approve & Add to Build CTA */}
                {isQuoted && (
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <span className="text-[10px] font-mono text-median-taupe">
                      Approving adds this feature directly to your live build milestones
                      {!cr.is_complimentary && cr.estimated_cost > 0 && cr.auto_create_invoice
                        ? ' and issues a separate invoice.'
                        : '.'}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={respondingId === cr.id}
                        onClick={() => handleRespond(cr, 'decline')}
                        className="px-3.5 py-2 rounded-xl border border-median-taupe/40 text-median-taupe hover:border-red-400 hover:text-red-700 text-[11px] font-mono font-bold uppercase transition-colors disabled:opacity-50"
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        disabled={respondingId === cr.id}
                        onClick={() => handleRespond(cr, 'approve')}
                        className="px-5 py-2 rounded-xl bg-black text-white hover:bg-emerald-700 text-[11px] font-mono font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                      >
                        {respondingId === cr.id ? 'Processing...' : 'Approve & Add to Build ✓'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Linked Separate Invoice Quick View */}
                {cr.invoice_number && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] font-mono">
                    <span className="text-emerald-800 font-semibold">
                      Linked Separate Invoice: <strong>{cr.invoice_number}</strong>
                    </span>
                    {linkedDoc && (
                      <button
                        type="button"
                        onClick={() => onViewInvoice(linkedDoc)}
                        className="px-3 py-1 rounded-lg border border-black text-black hover:bg-black hover:text-white text-[10px] font-bold uppercase transition-colors"
                      >
                        View Invoice ↗
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
