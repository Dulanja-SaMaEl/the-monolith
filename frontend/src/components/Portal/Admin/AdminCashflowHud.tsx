import React, { useMemo } from 'react';
import { ProjectPaymentPlan, BillingDocument } from '../../../lib/portalStore';

interface AdminCashflowHudProps {
  paymentPlans: ProjectPaymentPlan[];
  billingDocs: BillingDocument[];
  onOpenPayments: () => void;
  onOpenBilling: () => void;
}

const formatCompactLkr = (val: number): string => {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `${Math.round(val / 1_000)}K`;
  return String(Math.round(val));
};

export const AdminCashflowHud: React.FC<AdminCashflowHudProps> = ({
  paymentPlans,
  billingDocs,
  onOpenPayments,
  onOpenBilling,
}) => {
  const analytics = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed
    const currentYM = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

    let collectedThisMonth = 0;
    let expectedThisMonth = 0;
    let overdueReceivables = 0;
    let monthlyRetainerRunRate = 0;

    // Build 6-month window: -3, -2, -1, 0 (current), +1, +2
    const months: {
      ym: string;
      label: string;
      isCurrent: boolean;
      isFuture: boolean;
      collected: number;
      expected: number;
    }[] = [];

    for (let offset = -3; offset <= 2; offset++) {
      const d = new Date(currentYear, currentMonth + offset, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
      months.push({
        ym,
        label,
        isCurrent: offset === 0,
        isFuture: offset > 0,
        collected: 0,
        expected: 0,
      });
    }
    const monthMap = new Map(months.map((m) => [m.ym, m]));

    // 1. Aggregate payment_plans & payment_records
    for (const plan of paymentPlans) {
      const payments = plan.payments || [];
      let paidTotal = 0;

      for (const rec of payments) {
        const amt = Number(rec.amount || 0);
        paidTotal += amt;
        const recYM = (rec.payment_date || rec.created_at || '').slice(0, 7);
        const bucket = monthMap.get(recYM);
        if (bucket) bucket.collected += amt;
        if (recYM === currentYM) collectedThisMonth += amt;
      }

      const remaining =
        plan.billing_type === 'monthly' ? 0 : Math.max(0, Number(plan.total_amount || 0) - paidTotal);
      const isSettled =
        plan.status === 'completed' || (plan.billing_type !== 'monthly' && plan.total_amount > 0 && remaining <= 0);

      if (plan.billing_type === 'monthly' && (plan.status === 'active' || plan.status === 'overdue')) {
        const rate = Number(plan.installment_amount || plan.total_amount || 0);
        monthlyRetainerRunRate += rate;
        // Project monthly retainer across current (if unpaid this month) & next 2 months
        const paidCurrentMonth = payments.some((r) => (r.payment_date || '').slice(0, 7) === currentYM);
        if (!paidCurrentMonth) {
          expectedThisMonth += rate;
          const curBucket = monthMap.get(currentYM);
          if (curBucket) curBucket.expected += rate;
        }
        months
          .filter((m) => m.isFuture)
          .forEach((m) => {
            m.expected += rate;
          });

        if (plan.status === 'overdue' || (plan.next_due_date && plan.next_due_date < todayStr)) {
          overdueReceivables += rate;
        }
      } else if (!isSettled && plan.status !== 'paused') {
        const cycleAmount =
          plan.billing_type === 'installment'
            ? Math.min(remaining, Number(plan.installment_amount || remaining))
            : remaining;

        if (plan.next_due_date) {
          const dueYM = plan.next_due_date.slice(0, 7);
          if (plan.next_due_date < todayStr || plan.status === 'overdue') {
            overdueReceivables += cycleAmount;
            expectedThisMonth += cycleAmount;
            const curBucket = monthMap.get(currentYM);
            if (curBucket) curBucket.expected += cycleAmount;
          } else if (dueYM === currentYM) {
            expectedThisMonth += cycleAmount;
            const curBucket = monthMap.get(currentYM);
            if (curBucket) curBucket.expected += cycleAmount;
          } else {
            const targetBucket = monthMap.get(dueYM);
            if (targetBucket) targetBucket.expected += cycleAmount;
          }

          // For installment plans, also project subsequent month if remaining > cycleAmount
          if (plan.billing_type === 'installment' && remaining > cycleAmount) {
            const nextM = new Date(plan.next_due_date + 'T00:00:00');
            nextM.setMonth(nextM.getMonth() + 1);
            const nextYM = `${nextM.getFullYear()}-${String(nextM.getMonth() + 1).padStart(2, '0')}`;
            const nextBucket = monthMap.get(nextYM);
            if (nextBucket) nextBucket.expected += Math.min(remaining - cycleAmount, cycleAmount);
          }
        }
      }
    }

    // 2. Include Separate / Standalone Invoices (avoid double counting project_cover invoices already in payment_records)
    for (const doc of billingDocs) {
      if (doc.type !== 'invoice' || doc.billing_scope === 'project_cover') continue;
      const amt = Number(doc.total || 0);
      if (doc.status === 'paid') {
        const ym = (doc.created_at || '').slice(0, 7);
        const bucket = monthMap.get(ym);
        if (bucket) bucket.collected += amt;
        if (ym === currentYM) collectedThisMonth += amt;
      } else if (doc.status === 'sent' || doc.status === 'approved' || doc.status === 'overdue') {
        const dueDate = doc.due_date || '';
        const dueYM = dueDate.slice(0, 7);
        if (doc.status === 'overdue' || (dueDate && dueDate < todayStr)) {
          overdueReceivables += amt;
          expectedThisMonth += amt;
          const curBucket = monthMap.get(currentYM);
          if (curBucket) curBucket.expected += amt;
        } else if (!dueDate || dueYM === currentYM) {
          expectedThisMonth += amt;
          const curBucket = monthMap.get(currentYM);
          if (curBucket) curBucket.expected += amt;
        } else {
          const targetBucket = monthMap.get(dueYM);
          if (targetBucket) targetBucket.expected += amt;
        }
      }
    }

    const maxBarValue = Math.max(
      100000,
      ...months.map((m) => Math.max(m.collected, m.expected, m.collected + m.expected))
    );

    return {
      collectedThisMonth,
      expectedThisMonth,
      overdueReceivables,
      monthlyRetainerRunRate,
      months,
      maxBarValue,
    };
  }, [paymentPlans, billingDocs]);

  return (
    <div className="p-5 sm:p-8 rounded-2xl bg-white border border-median-taupe/20 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-median-taupe/15">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe font-bold block mb-1">
            Monolith LK Financial Telemetry
          </span>
          <h3 className="font-oswald text-xl sm:text-2xl font-bold uppercase text-black">
            Cashflow Forecast &amp; Receivables HUD
          </h3>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] font-mono">
          <button
            type="button"
            onClick={onOpenPayments}
            className="px-3 py-1.5 rounded-xl border border-black text-black hover:bg-black hover:text-white uppercase font-bold transition-colors"
          >
            Manage Packages →
          </button>
          <button
            type="button"
            onClick={onOpenBilling}
            className="px-3 py-1.5 rounded-xl bg-black text-white hover:bg-median-taupe uppercase font-bold transition-colors"
          >
            Issue Invoice
          </button>
        </div>
      </div>

      {/* 3 Core Cashflow KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-800 font-bold block mb-1">
            Collected This Month
          </span>
          <div className="font-oswald text-2xl sm:text-3xl font-bold text-emerald-800">
            LKR {analytics.collectedThisMonth.toLocaleString()}
          </div>
          <span className="text-[10px] font-mono text-emerald-700/80">
            Cleared payments &amp; settled invoices
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-median-taupe/25">
          <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe font-bold block mb-1">
            Expected This Month (Due)
          </span>
          <div className="font-oswald text-2xl sm:text-3xl font-bold text-black">
            LKR {analytics.expectedThisMonth.toLocaleString()}
          </div>
          <span className="text-[10px] font-mono text-median-taupe/80">
            Retainer Run-Rate: LKR {analytics.monthlyRetainerRunRate.toLocaleString()}/mo
          </span>
        </div>

        <div
          className={`p-4 sm:p-5 rounded-2xl border ${
            analytics.overdueReceivables > 0
              ? 'bg-red-50/80 border-red-200'
              : 'bg-[#FAF8F5] border-median-taupe/20'
          }`}
        >
          <span
            className={`text-[10px] font-mono uppercase tracking-widest font-bold block mb-1 ${
              analytics.overdueReceivables > 0 ? 'text-red-700' : 'text-median-taupe'
            }`}
          >
            Overdue Receivables
          </span>
          <div
            className={`font-oswald text-2xl sm:text-3xl font-bold ${
              analytics.overdueReceivables > 0 ? 'text-red-700' : 'text-emerald-700'
            }`}
          >
            {analytics.overdueReceivables > 0
              ? `LKR ${analytics.overdueReceivables.toLocaleString()}`
              : 'LKR 0 (Healthy)'}
          </div>
          <span
            className={`text-[10px] font-mono ${
              analytics.overdueReceivables > 0 ? 'text-red-600/80' : 'text-median-taupe/80'
            }`}
          >
            {analytics.overdueReceivables > 0
              ? 'Action needed — follow up on past-due plans'
              : 'Zero overdue balances across all clients'}
          </span>
        </div>
      </div>

      {/* 6-Month Visual Cashflow Bar Chart */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#FAF8F5] border border-median-taupe/15 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
          <span className="font-bold uppercase text-black">6-Month Cashflow Trajectory (LKR)</span>
          <div className="flex items-center gap-4 text-[10px] uppercase">
            <span className="inline-flex items-center gap-1.5 text-black">
              <span className="w-2.5 h-2.5 rounded-sm bg-black inline-block" />
              Collected
            </span>
            <span className="inline-flex items-center gap-1.5 text-median-taupe">
              <span className="w-2.5 h-2.5 rounded-sm bg-median-taupe/45 border border-median-taupe inline-block" />
              Expected / Projected
            </span>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-48 pt-6">
          {analytics.months.map((m) => {
            const collectedPct = Math.round((m.collected / analytics.maxBarValue) * 100);
            const expectedPct = Math.round((m.expected / analytics.maxBarValue) * 100);
            const totalForLabel = m.collected + m.expected;

            return (
              <div key={m.ym} className="flex flex-col items-center h-full justify-end gap-1.5 group">
                <span className="text-[9px] sm:text-[10px] font-mono font-bold text-black/80 truncate max-w-full">
                  {totalForLabel > 0 ? formatCompactLkr(totalForLabel) : '—'}
                </span>

                <div className="w-full max-w-[48px] flex-1 flex flex-col justify-end items-stretch gap-0.5">
                  {/* Projected / Expected stacked segment */}
                  {m.expected > 0 && (
                    <div
                      title={`${m.label} Expected: LKR ${m.expected.toLocaleString()}`}
                      className="w-full rounded-t-lg bg-median-taupe/35 border border-dashed border-median-taupe transition-all duration-700"
                      style={{ height: `${Math.max(8, expectedPct)}%` }}
                    />
                  )}
                  {/* Collected solid bar */}
                  {m.collected > 0 && (
                    <div
                      title={`${m.label} Collected: LKR ${m.collected.toLocaleString()}`}
                      className={`w-full ${
                        m.expected > 0 ? 'rounded-b-lg' : 'rounded-lg'
                      } bg-black group-hover:bg-median-taupe transition-all duration-700`}
                      style={{ height: `${Math.max(8, collectedPct)}%` }}
                    />
                  )}
                  {m.collected === 0 && m.expected === 0 && (
                    <div className="w-full h-1.5 rounded-full bg-median-taupe/15" />
                  )}
                </div>

                <div className="text-center">
                  <span
                    className={`text-[10px] font-mono uppercase block ${
                      m.isCurrent ? 'font-bold text-black underline decoration-median-taupe' : 'text-median-taupe'
                    }`}
                  >
                    {m.label}
                  </span>
                  <span className="text-[8px] font-mono text-median-taupe/60 hidden sm:block">
                    {m.isCurrent ? 'NOW' : m.isFuture ? 'EST' : 'ACT'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
