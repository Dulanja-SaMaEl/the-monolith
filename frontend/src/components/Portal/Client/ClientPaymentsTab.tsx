import React, { useMemo } from 'react';
import {
  ProjectPaymentPlan,
  BillingDocument,
  PortalProject,
  BillingType,
} from '../../../lib/portalStore';
import {
  downloadBillingVoucherHtml,
  downloadPaymentReceiptHtml,
  printPaymentReceiptPdf,
} from '../../../lib/invoiceDownloader';
import { ScrollReveal, CountingNumber, RevealVariant } from '../../MedianStudio/ScrollReveal';
import { CalendarSyncButton } from '../CalendarSyncButton';

interface ClientPaymentsTabProps {
  paymentPlans: ProjectPaymentPlan[];
  projects: PortalProject[];
  billingDocs: BillingDocument[];
  onViewInvoice: (doc: BillingDocument) => void;
}

const BILLING_TYPE_LABEL: Record<BillingType, string> = {
  one_time: 'One-Time Package',
  monthly: 'Monthly Recurring',
  installment: 'Installment Plan',
};

const getDueStatus = (plan: ProjectPaymentPlan, remaining: number) => {
  if (plan.status === 'completed' || (plan.billing_type !== 'monthly' && plan.total_amount > 0 && remaining <= 0)) {
    return {
      label: 'Fully Settled ✓',
      cls: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      urgent: false,
    };
  }
  if (plan.status === 'paused') {
    return {
      label: 'Paused',
      cls: 'bg-neutral-100 text-neutral-700 border-neutral-300',
      urgent: false,
    };
  }
  if (plan.next_due_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(plan.next_due_date + 'T00:00:00');
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0 || plan.status === 'overdue') {
      return {
        label: diffDays < 0 ? `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}` : 'Payment Overdue',
        cls: 'bg-red-100 text-red-800 border-red-300',
        urgent: true,
      };
    }
    if (diffDays <= 7) {
      return {
        label: diffDays === 0 ? 'Due Today' : `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`,
        cls: 'bg-amber-100 text-amber-800 border-amber-300',
        urgent: true,
      };
    }
    return {
      label: `Due in ${diffDays} days`,
      cls: 'bg-blue-50 text-blue-800 border-blue-200',
      urgent: false,
    };
  }
  return {
    label: 'Active Plan',
    cls: 'bg-median-taupe/10 text-median-taupe border-median-taupe/30',
    urgent: false,
  };
};

export const ClientPaymentsTab: React.FC<ClientPaymentsTabProps> = ({
  paymentPlans,
  projects,
  billingDocs,
  onViewInvoice,
}) => {
  // Compute high-level client summary
  const summary = useMemo(() => {
    let totalPaid = 0;
    let totalRemaining = 0;
    let monthlyRetainerTotal = 0;
    let earliestDueDate: string | null = null;

    for (const plan of paymentPlans) {
      const paid = (plan.payments || []).reduce((s, r) => s + Number(r.amount || 0), 0);
      totalPaid += paid;

      const isSettled =
        plan.status === 'completed' || (plan.billing_type !== 'monthly' && plan.total_amount > 0 && paid >= plan.total_amount);

      if (plan.billing_type === 'monthly') {
        if (plan.status === 'active' || plan.status === 'overdue') {
          monthlyRetainerTotal += Number(plan.installment_amount || plan.total_amount || 0);
        }
      } else {
        totalRemaining += Math.max(0, Number(plan.total_amount || 0) - paid);
      }

      if (!isSettled && plan.status !== 'paused' && plan.next_due_date) {
        if (!earliestDueDate || plan.next_due_date < earliestDueDate) {
          earliestDueDate = plan.next_due_date;
        }
      }
    }

    return { totalPaid, totalRemaining, monthlyRetainerTotal, earliestDueDate };
  }, [paymentPlans]);

  // Group plans project by project so each project's payments stay cleanly separated
  const groupedByProject = useMemo(() => {
    const groups: {
      key: string;
      projectTitle: string;
      projectCode?: string;
      projectStatus?: string;
      plans: ProjectPaymentPlan[];
    }[] = [];

    const map = new Map<string, (typeof groups)[0]>();

    for (const plan of paymentPlans) {
      const key = plan.project_id || '__standalone__';
      let group = map.get(key);
      if (!group) {
        const matchedProj = plan.project_id ? projects.find((p) => p.id === plan.project_id) : undefined;
        group = {
          key,
          projectTitle: matchedProj?.title || plan.project_title || 'General Retainer & Standalone Packages',
          projectCode: matchedProj?.code_name || plan.project_code,
          projectStatus: matchedProj?.status,
          plans: [],
        };
        map.set(key, group);
        groups.push(group);
      }
      group.plans.push(plan);
    }

    return groups;
  }, [paymentPlans, projects]);

  // Separate / Standalone Invoices (not counted as project cover-up)
  const separateInvoices = useMemo(
    () => billingDocs.filter((d) => d.type === 'invoice' && d.billing_scope !== 'project_cover'),
    [billingDocs]
  );

  return (
    <div className="space-y-8">
      {/* Animated Section Header */}
      <div>
        <ScrollReveal variant="badge-drop" duration={650} once>
          <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe font-bold block mb-1">
            Transparent Project Accounting
          </span>
        </ScrollReveal>
        <ScrollReveal variant="split-mask" delay={80} duration={750} once>
          <h2 className="font-oswald text-2xl sm:text-3xl font-bold uppercase text-black">
            Payment Progress &amp; Packages
          </h2>
        </ScrollReveal>
        <ScrollReveal variant="blur-focus" delay={140} duration={700} once>
          <p className="text-xs sm:text-sm text-median-taupe/80 mt-1 max-w-2xl">
            Track each project&apos;s active package, remaining balance, upcoming due dates, official payment receipts, and complete payment history separately.
          </p>
        </ScrollReveal>
      </div>

      {/* Top Executive Summary Cards with Staggered Reveal & Counting Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScrollReveal variant="card-flip-left" delay={0} duration={800} once className="h-full">
          <div className="p-5 rounded-2xl bg-white border border-median-taupe/20 shadow-sm hover:border-median-taupe hover:shadow-md transition-all h-full">
            <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe font-bold block mb-1">
              Total Paid to Date
            </span>
            <div className="font-oswald text-2xl sm:text-3xl font-bold text-emerald-700">
              <CountingNumber value={summary.totalPaid} prefix="LKR " duration={1200} />
            </div>
            <span className="text-[10px] font-mono text-median-taupe/70">Verified cleared settlements</span>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="card-lift" delay={90} duration={800} once className="h-full">
          <div className="p-5 rounded-2xl bg-white border border-median-taupe/20 shadow-sm hover:border-median-taupe hover:shadow-md transition-all h-full">
            <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe font-bold block mb-1">
              Remaining Balance Needed
            </span>
            <div className="font-oswald text-2xl sm:text-3xl font-bold text-black">
              <CountingNumber value={summary.totalRemaining} prefix="LKR " duration={1200} />
            </div>
            <span className="text-[10px] font-mono text-median-taupe/70">Across one-time &amp; installment plans</span>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="card-flip-right" delay={180} duration={800} once className="h-full">
          <div className="p-5 rounded-2xl bg-white border border-median-taupe/20 shadow-sm hover:border-median-taupe hover:shadow-md transition-all h-full">
            <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe font-bold block mb-1">
              Monthly Recurring Plan
            </span>
            <div className="font-oswald text-2xl sm:text-3xl font-bold text-median-taupe">
              {summary.monthlyRetainerTotal > 0 ? (
                <CountingNumber value={summary.monthlyRetainerTotal} prefix="LKR " suffix="/mo" duration={1200} />
              ) : (
                'None Active'
              )}
            </div>
            <span className="text-[10px] font-mono text-median-taupe/70">Ongoing server / maintenance retainers</span>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="zoom-rotate" delay={260} duration={800} once className="h-full">
          <div className="p-5 rounded-2xl bg-white border border-median-taupe/20 shadow-sm hover:border-median-taupe hover:shadow-md transition-all h-full flex flex-col justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe font-bold block mb-1">
                Next Payment Due Date
              </span>
              <div className="font-oswald text-2xl sm:text-3xl font-bold text-black">
                {summary.earliestDueDate || 'All Clear'}
              </div>
              <span className="text-[10px] font-mono text-median-taupe/70">
                {summary.earliestDueDate ? 'Earliest scheduled milestone / cycle' : 'No pending due dates'}
              </span>
            </div>
            {summary.earliestDueDate && (
              <div>
                <CalendarSyncButton
                  align="left"
                  event={{
                    uid: `monolith-next-payment-${summary.earliestDueDate}`,
                    title: 'Monolith LK · Scheduled Payment Due',
                    description: `Upcoming scheduled payment due on ${summary.earliestDueDate}. Review package progress & download official receipts inside the Monolith LK Client Portal.`,
                    date: summary.earliestDueDate,
                    reminderDaysBefore: [3, 1],
                    filename: `monolith-payment-due-${summary.earliestDueDate}`,
                  }}
                />
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>

      {/* Project-by-Project Payment Packages */}
      {groupedByProject.length === 0 ? (
        <ScrollReveal variant="fade-up" duration={750} once>
          <div className="p-10 sm:p-12 text-center rounded-2xl bg-white border border-median-taupe/20">
            <p className="font-oswald text-xl uppercase text-black mb-2">No Active Payment Packages Configured Yet</p>
            <p className="text-xs text-median-taupe/80 max-w-md mx-auto">
              Once your project billing package is configured by Monolith LK, your payment progress, due dates, official receipts, and past payments will appear here automatically.
            </p>
          </div>
        </ScrollReveal>
      ) : (
        <div className="space-y-8">
          {groupedByProject.map((group, gIdx) => (
            <div key={group.key} className="space-y-4">
              {/* Project Group Header */}
              <ScrollReveal variant="split-mask" delay={gIdx * 80} duration={750} once>
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-median-taupe/25">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {group.projectCode && (
                      <span className="px-2.5 py-0.5 rounded-full bg-black text-white text-[10px] font-mono font-bold uppercase tracking-wider">
                        {group.projectCode}
                      </span>
                    )}
                    <h3 className="font-oswald text-xl sm:text-2xl font-bold uppercase text-black">
                      {group.projectTitle}
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-median-taupe uppercase">
                    {group.plans.length} Payment Package{group.plans.length === 1 ? '' : 's'}
                  </span>
                </div>
              </ScrollReveal>

              {/* Plans inside this project */}
              <div className="space-y-5">
                {group.plans.map((plan, pIdx) => {
                  const payments = plan.payments || [];
                  const paidSoFar = payments.reduce((sum, r) => sum + Number(r.amount || 0), 0);
                  const totalTarget = Number(plan.total_amount || 0);
                  const remaining = plan.billing_type === 'monthly' ? 0 : Math.max(0, totalTarget - paidSoFar);
                  const pct =
                    plan.billing_type === 'monthly'
                      ? 100
                      : totalTarget > 0
                      ? Math.min(100, Math.round((paidSoFar / totalTarget) * 100))
                      : 0;
                  const dueStatus = getDueStatus(plan, remaining);
                  const cardVariants: RevealVariant[] = ['card-lift', 'card-flip-left', 'card-flip-right'];
                  const cardVariant = cardVariants[pIdx % cardVariants.length];

                  const linkedInvoices = billingDocs.filter(
                    (d) =>
                      d.billing_scope === 'project_cover' &&
                      (d.payment_plan_id === plan.id || (plan.project_id && d.project_id === plan.project_id))
                  );

                  return (
                    <ScrollReveal
                      key={plan.id}
                      variant={cardVariant}
                      delay={pIdx * 100}
                      duration={850}
                      once
                    >
                      <div className="p-5 sm:p-8 rounded-2xl bg-white border border-median-taupe/20 hover:border-median-taupe/50 shadow-sm hover:shadow-lg transition-all duration-300 space-y-6">
                        {/* Plan Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="px-2.5 py-0.5 rounded-full border border-black bg-[#FAF8F5] text-[10px] font-mono font-bold uppercase text-black">
                                {BILLING_TYPE_LABEL[plan.billing_type]}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold uppercase ${dueStatus.cls}`}>
                                {dueStatus.label}
                              </span>
                            </div>
                            <h4 className="font-oswald text-2xl sm:text-3xl font-bold uppercase text-black">
                              {plan.package_name}
                            </h4>
                            {plan.notes && (
                              <p className="text-xs text-median-taupe/85 mt-1">{plan.notes}</p>
                            )}
                          </div>

                          {plan.next_due_date && plan.status !== 'completed' && (
                            <div
                              className={`px-4 py-2.5 rounded-xl border text-left sm:text-right shrink-0 space-y-1.5 ${
                                dueStatus.urgent
                                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                                  : 'bg-[#FAF8F5] border-median-taupe/25 text-black'
                              }`}
                            >
                              <div>
                                <span className="text-[10px] font-mono uppercase tracking-wider opacity-75 block">
                                  Next Due Date
                                </span>
                                <strong className="font-oswald text-lg uppercase">{plan.next_due_date}</strong>
                              </div>
                              <div>
                                <CalendarSyncButton
                                  align="right"
                                  event={{
                                    uid: `monolith-plan-due-${plan.id}-${plan.next_due_date}`,
                                    title: `Monolith LK · Payment Due — ${plan.package_name}`,
                                    description: `Project: ${group.projectTitle}\nPackage: ${plan.package_name}\nDue Amount: ${plan.currency} ${(plan.billing_type === 'monthly' ? Number(plan.installment_amount || totalTarget) : remaining).toLocaleString()}\nManaged via Monolith LK Client Portal.`,
                                    date: plan.next_due_date,
                                    reminderDaysBefore: [3, 1],
                                    filename: `payment-due-${plan.package_name}`,
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Financial Breakdown Grid */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-median-taupe/15 space-y-4">
                          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                            <div>
                              <span className="text-[10px] uppercase text-median-taupe block mb-0.5">
                                {plan.billing_type === 'monthly' ? 'Monthly Package Rate' : 'Current Package Total'}
                              </span>
                              <strong className="font-oswald text-xl sm:text-2xl text-black">
                                {plan.currency} {(plan.billing_type === 'monthly' ? plan.installment_amount || totalTarget : totalTarget).toLocaleString()}
                                {plan.billing_type === 'monthly' ? '/mo' : ''}
                              </strong>
                            </div>

                            <div>
                              <span className="text-[10px] uppercase text-median-taupe block mb-0.5">
                                Paid So Far
                              </span>
                              <strong className="font-oswald text-xl sm:text-2xl text-emerald-700">
                                {plan.currency} {paidSoFar.toLocaleString()}
                              </strong>
                            </div>

                            <div>
                              <span className="text-[10px] uppercase text-median-taupe block mb-0.5">
                                {plan.billing_type === 'monthly' ? 'Next Cycle Payment' : 'How Much Needed to Pay'}
                              </span>
                              <strong
                                className={`font-oswald text-xl sm:text-2xl ${
                                  remaining > 0 || plan.billing_type === 'monthly' ? 'text-median-taupe' : 'text-emerald-700'
                                }`}
                              >
                                {plan.billing_type === 'monthly'
                                  ? `${plan.currency} ${Number(plan.installment_amount || totalTarget).toLocaleString()}`
                                  : remaining > 0
                                  ? `${plan.currency} ${remaining.toLocaleString()}`
                                  : 'LKR 0 (Paid)'}
                              </strong>
                            </div>

                            <div>
                              <span className="text-[10px] uppercase text-median-taupe block mb-0.5">
                                Billing Schedule
                              </span>
                              <strong className="font-oswald text-lg text-black">
                                {plan.billing_type === 'monthly'
                                  ? `${payments.length} Cycle${payments.length === 1 ? '' : 's'} Paid`
                                  : plan.billing_type === 'installment'
                                  ? `${payments.length} / ${plan.total_months} Months`
                                  : 'One-Time Settlement'}
                              </strong>
                              {plan.billing_type === 'installment' && plan.installment_amount > 0 && (
                                <span className="block text-[10px] text-median-taupe">
                                  ~{plan.currency} {Number(plan.installment_amount).toLocaleString()} / month
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Visual Progress Bar */}
                          {plan.billing_type !== 'monthly' ? (
                            <div>
                              <div className="flex justify-between items-center text-xs font-mono uppercase mb-1.5">
                                <span className="font-bold text-black">Payment Settlement Progress</span>
                                <span className="font-bold text-median-taupe">{pct}% COVERED</span>
                              </div>
                              <div className="w-full h-3 rounded-full bg-median-taupe/15 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                    pct >= 100 ? 'bg-emerald-600' : 'bg-median-taupe'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="pt-2 border-t border-median-taupe/15 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-median-taupe">
                              <span>Started: <strong className="text-black">{plan.start_date || 'Active'}</strong></span>
                              <span>Recurring monthly billing — billed per cycle.</span>
                            </div>
                          )}
                        </div>

                        {/* Past Payments History with Official Payment Receipt PDF */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="font-oswald text-sm sm:text-base font-bold uppercase tracking-wider text-black">
                              Past Payments History &amp; Official Receipts ({payments.length})
                            </h5>
                          </div>

                          {payments.length === 0 ? (
                            <div className="p-4 rounded-xl border border-dashed border-median-taupe/25 text-xs font-mono text-median-taupe/80">
                              No payments recorded yet for this package.
                            </div>
                          ) : (
                            <div className="divide-y divide-median-taupe/15 rounded-xl border border-median-taupe/20 overflow-hidden">
                              {payments.map((rec) => {
                                const matchedInvoice = rec.invoice_id
                                  ? billingDocs.find((d) => d.id === rec.invoice_id)
                                  : undefined;
                                return (
                                  <div
                                    key={rec.id}
                                    className="p-3.5 sm:p-4 bg-white hover:bg-[#FAF8F5]/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
                                  >
                                    <div className="space-y-1">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold">
                                          ✓
                                        </span>
                                        <strong className="font-oswald text-base sm:text-lg text-emerald-700">
                                          {rec.currency || 'LKR'} {Number(rec.amount || 0).toLocaleString()}
                                        </strong>
                                        <span className="text-black font-semibold">{rec.payment_date}</span>
                                        <span className="px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-median-taupe/20 text-[10px] text-median-taupe">
                                          {rec.payment_method}
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-median-taupe/80 pl-7">
                                        {rec.reference_number && <span>Ref: {rec.reference_number}</span>}
                                        {rec.notes && <span>· {rec.notes}</span>}
                                      </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-1.5 pl-7 sm:pl-0 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => downloadPaymentReceiptHtml(plan, rec)}
                                        title="Download Official Receipt File (.html)"
                                        className="px-2.5 py-1.5 rounded-lg border border-median-taupe/40 text-black hover:border-black text-[10px] font-bold uppercase transition-colors"
                                      >
                                        ↓ Receipt
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => printPaymentReceiptPdf(plan, rec)}
                                        title="Print or Save Official Payment Receipt as PDF"
                                        className="px-3 py-1.5 rounded-lg bg-black text-white hover:bg-median-taupe text-[10px] font-bold uppercase transition-colors"
                                      >
                                        Receipt PDF ↗
                                      </button>
                                      {matchedInvoice && (
                                        <button
                                          type="button"
                                          onClick={() => onViewInvoice(matchedInvoice)}
                                          className="px-2.5 py-1.5 rounded-lg border border-black text-black hover:bg-black hover:text-white text-[10px] font-bold uppercase transition-colors"
                                        >
                                          {matchedInvoice.document_number}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Linked Project Cover-Up Invoices */}
                        {linkedInvoices.length > 0 && (
                          <div className="pt-3 border-t border-median-taupe/15 space-y-2">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-median-taupe block">
                              Invoices Applied to This Project Package
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {linkedInvoices.map((inv) => (
                                <button
                                  key={inv.id}
                                  type="button"
                                  onClick={() => onViewInvoice(inv)}
                                  className="px-3 py-1.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] hover:border-black text-xs font-mono flex items-center gap-2 transition-colors"
                                >
                                  <span className="font-bold text-black">{inv.document_number}</span>
                                  <span className="text-median-taupe">
                                    {inv.currency} {inv.total.toLocaleString()}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                      inv.status === 'paid'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {inv.status}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Separate / Standalone Invoices Section */}
      {separateInvoices.length > 0 && (
        <div className="pt-6 border-t border-median-taupe/25 space-y-4">
          <ScrollReveal variant="split-mask" duration={750} once>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe font-bold block mb-1">
                Independent Billing Items
              </span>
              <h3 className="font-oswald text-xl sm:text-2xl font-bold uppercase text-black">
                Separate / Standalone Invoices ({separateInvoices.length})
              </h3>
              <p className="text-xs text-median-taupe/80">
                Additional invoices billed separately from your core project payment packages (e.g. domain/server renewals, travel, or extra modules).
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {separateInvoices.map((doc, idx) => (
              <ScrollReveal
                key={doc.id}
                variant={idx % 2 === 0 ? 'card-flip-left' : 'card-flip-right'}
                delay={(idx % 2) * 110}
                duration={800}
                once
                className="h-full"
              >
                <div className="p-5 rounded-2xl bg-white border border-median-taupe/20 hover:border-median-taupe shadow-sm transition-all flex flex-col justify-between gap-4 h-full">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold uppercase text-median-taupe">
                          {doc.document_number}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-median-taupe/25 text-[9px] font-mono uppercase font-bold text-median-taupe">
                          Separate Charge
                        </span>
                      </div>
                      <h4 className="font-oswald text-lg font-bold uppercase text-black">
                        {doc.project_title || 'Standalone Deliverable'}
                      </h4>
                      <span className="text-[11px] font-mono text-median-taupe/80">
                        Due: {doc.due_date || 'Upon Receipt'}
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                        doc.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-median-taupe/15 flex flex-wrap items-center justify-between gap-3">
                    <strong className="font-oswald text-xl text-median-taupe">
                      {doc.currency || 'LKR'} {doc.total.toLocaleString()}
                    </strong>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => downloadBillingVoucherHtml(doc)}
                        className="px-3 py-1.5 rounded-lg border border-median-taupe/40 text-black hover:border-black text-[11px] font-mono uppercase font-semibold"
                      >
                        ↓ Download
                      </button>
                      <button
                        type="button"
                        onClick={() => onViewInvoice(doc)}
                        className="px-3 py-1.5 rounded-lg bg-black text-white hover:bg-median-taupe text-[11px] font-mono uppercase font-semibold transition-colors"
                      >
                        View Invoice
                      </button>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
