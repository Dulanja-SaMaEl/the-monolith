import React, { useState, useMemo } from 'react';
import {
  UserProfile,
  PortalProject,
  ProjectPaymentPlan,
  PaymentRecord,
  BillingType,
} from '../../../lib/portalStore';
import { portalApi } from '../../../lib/portalApi';

interface AdminPaymentsPanelProps {
  users: UserProfile[];
  projects: PortalProject[];
  paymentPlans: ProjectPaymentPlan[];
  isSyncing: boolean;
  onRefresh: () => Promise<void>;
  showAlert: (msg: string) => void;
}

const BILLING_TYPE_LABEL: Record<BillingType, string> = {
  one_time: 'One-Time Payment',
  monthly: 'Monthly Recurring',
  installment: 'Multi-Month Installment',
};

const getDueBadge = (plan: ProjectPaymentPlan, remaining: number) => {
  if (plan.status === 'completed' || (plan.billing_type !== 'monthly' && plan.total_amount > 0 && remaining <= 0)) {
    return { label: 'Settled in Full', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
  }
  if (plan.status === 'paused') {
    return { label: 'Paused', cls: 'bg-neutral-100 text-neutral-700 border-neutral-300' };
  }
  if (plan.next_due_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(plan.next_due_date + 'T00:00:00');
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0 || plan.status === 'overdue') {
      return {
        label: diffDays < 0 ? `Overdue by ${Math.abs(diffDays)}d` : 'Overdue',
        cls: 'bg-red-100 text-red-800 border-red-300',
      };
    }
    if (diffDays <= 7) {
      return {
        label: diffDays === 0 ? 'Due Today' : `Due in ${diffDays}d`,
        cls: 'bg-amber-100 text-amber-800 border-amber-300',
      };
    }
  }
  return { label: 'Active Plan', cls: 'bg-blue-100 text-blue-800 border-blue-300' };
};

export const AdminPaymentsPanel: React.FC<AdminPaymentsPanelProps> = ({
  users,
  projects,
  paymentPlans,
  isSyncing,
  onRefresh,
  showAlert,
}) => {
  const clients = useMemo(() => users.filter((u) => u.role === 'client'), [users]);

  // Filter States
  const [filterClient, setFilterClient] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const PAGE_SIZE = 5;

  // Create New Plan Form States
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [packageName, setPackageName] = useState('');
  const [billingType, setBillingType] = useState<BillingType>('one_time');
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [installmentAmount, setInstallmentAmount] = useState<string>('');
  const [totalMonths, setTotalMonths] = useState<string>('3');
  const [startDate, setStartDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [nextDueDate, setNextDueDate] = useState<string>('');
  const [planNotes, setPlanNotes] = useState('');
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  // Edit Existing Plan State
  const [editingPlan, setEditingPlan] = useState<ProjectPaymentPlan | null>(null);

  // Add Payment Record Drawer State (keyed by planId)
  const [recordingForPlanId, setRecordingForPlanId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState<string>('');
  const [payDate, setPayDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [payMethod, setPayMethod] = useState<string>('Bank Transfer / CEFTS');
  const [payRef, setPayRef] = useState<string>('');
  const [payNotes, setPayNotes] = useState<string>('');
  const [advanceDue, setAdvanceDue] = useState<boolean>(true);

  // Edit Existing Payment Record State
  const [editingRecord, setEditingRecord] = useState<PaymentRecord | null>(null);

  const clientProjects = useMemo(
    () => (clientId ? projects.filter((p) => p.client_id === clientId) : []),
    [clientId, projects]
  );

  // Summary KPIs
  const summary = useMemo(() => {
    let totalCommitted = 0;
    let totalCollected = 0;
    let totalRemaining = 0;
    let monthlyRecurringRate = 0;

    for (const plan of paymentPlans) {
      const paid = (plan.payments || []).reduce((s, r) => s + Number(r.amount || 0), 0);
      totalCollected += paid;
      if (plan.billing_type === 'monthly') {
        if (plan.status === 'active' || plan.status === 'overdue') {
          monthlyRecurringRate += Number(plan.installment_amount || plan.total_amount || 0);
        }
      } else {
        const target = Number(plan.total_amount || 0);
        totalCommitted += target;
        totalRemaining += Math.max(0, target - paid);
      }
    }

    return { totalCommitted, totalCollected, totalRemaining, monthlyRecurringRate };
  }, [paymentPlans]);

  const filteredPlans = useMemo(() => {
    return paymentPlans.filter((p) => {
      if (filterClient !== 'all' && p.client_id !== filterClient) return false;
      if (filterType !== 'all' && p.billing_type !== filterType) return false;
      return true;
    });
  }, [paymentPlans, filterClient, filterType]);

  const totalPages = Math.max(1, Math.ceil(filteredPlans.length / PAGE_SIZE));
  const pagedPlans = filteredPlans.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Auto-calculate installment / total convenience
  const handleBillingTypeChange = (nextType: BillingType) => {
    setBillingType(nextType);
    if (nextType === 'one_time') {
      setTotalMonths('1');
    } else if (nextType === 'monthly') {
      setTotalMonths('0');
    } else {
      setTotalMonths('3');
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !packageName.trim()) return;

    const selectedClient = clients.find((c) => c.id === clientId);
    const selectedProject = projects.find((p) => p.id === projectId);

    const parsedTotal = Number(totalAmount) || 0;
    const parsedInstallment = Number(installmentAmount) || 0;
    const parsedMonths = billingType === 'monthly' ? 0 : billingType === 'one_time' ? 1 : Math.max(1, Number(totalMonths) || 3);

    const effectiveTotal =
      billingType === 'installment'
        ? parsedTotal > 0
          ? parsedTotal
          : parsedInstallment * parsedMonths
        : billingType === 'monthly'
        ? parsedInstallment || parsedTotal
        : parsedTotal;

    const effectiveInstallment =
      billingType === 'installment'
        ? parsedInstallment > 0
          ? parsedInstallment
          : parsedMonths > 0
          ? Math.round(effectiveTotal / parsedMonths)
          : effectiveTotal
        : billingType === 'monthly'
        ? parsedInstallment || parsedTotal
        : effectiveTotal;

    if (effectiveTotal <= 0) {
      showAlert('✕ Please enter a valid LKR package or monthly amount.');
      return;
    }

    setIsSavingPlan(true);
    try {
      await portalApi.createPaymentPlan({
        client_id: clientId,
        client_name: selectedClient?.company_name || selectedClient?.full_name || 'Client',
        project_id: projectId || undefined,
        project_title: selectedProject?.title,
        project_code: selectedProject?.code_name,
        package_name: packageName.trim(),
        billing_type: billingType,
        currency: 'LKR',
        total_amount: effectiveTotal,
        installment_amount: effectiveInstallment,
        total_months: parsedMonths,
        start_date: startDate || new Date().toISOString().split('T')[0],
        next_due_date: nextDueDate || undefined,
        status: 'active',
        notes: planNotes.trim() || undefined,
      });

      setPackageName('');
      setTotalAmount('');
      setInstallmentAmount('');
      setNextDueDate('');
      setPlanNotes('');
      await onRefresh();
      showAlert(`✓ Payment package "${packageName.trim()}" added and visible in client portal.`);
    } catch (err: any) {
      showAlert(`✕ Error creating payment package: ${err.message}`);
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleSavePlanEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    try {
      await portalApi.updatePaymentPlan(editingPlan.id, {
        project_id: editingPlan.project_id || undefined,
        package_name: editingPlan.package_name,
        billing_type: editingPlan.billing_type,
        total_amount: Number(editingPlan.total_amount) || 0,
        installment_amount: Number(editingPlan.installment_amount) || 0,
        total_months: Number(editingPlan.total_months) || 0,
        start_date: editingPlan.start_date,
        next_due_date: editingPlan.next_due_date || undefined,
        status: editingPlan.status,
        notes: editingPlan.notes,
      });
      setEditingPlan(null);
      await onRefresh();
      showAlert(`✓ Payment package "${editingPlan.package_name}" updated.`);
    } catch (err: any) {
      showAlert(`✕ Error updating payment package: ${err.message}`);
    }
  };

  const handleDeletePlan = async (plan: ProjectPaymentPlan) => {
    if (!window.confirm(`Delete payment plan "${plan.package_name}" and its payment history?`)) return;
    try {
      await portalApi.deletePaymentPlan(plan.id);
      if (editingPlan?.id === plan.id) setEditingPlan(null);
      await onRefresh();
      showAlert(`✓ Removed payment package "${plan.package_name}".`);
    } catch (err: any) {
      showAlert(`✕ Error deleting payment package: ${err.message}`);
    }
  };

  const openRecordPayment = (plan: ProjectPaymentPlan) => {
    const paid = (plan.payments || []).reduce((s, r) => s + Number(r.amount || 0), 0);
    const remaining = Math.max(0, Number(plan.total_amount || 0) - paid);
    const suggestedAmount =
      plan.billing_type === 'monthly'
        ? plan.installment_amount || plan.total_amount
        : plan.billing_type === 'installment'
        ? Math.min(remaining || plan.installment_amount, plan.installment_amount || remaining)
        : remaining || plan.total_amount;

    setRecordingForPlanId(recordingForPlanId === plan.id ? null : plan.id);
    setPayAmount(suggestedAmount ? String(suggestedAmount) : '');
    setPayDate(new Date().toISOString().split('T')[0]);
    setPayMethod('Bank Transfer / CEFTS');
    setPayRef('');
    setPayNotes('');
    setAdvanceDue(plan.billing_type !== 'one_time');
  };

  const handleRecordPayment = async (e: React.FormEvent, plan: ProjectPaymentPlan) => {
    e.preventDefault();
    const numericAmount = Number(payAmount);
    if (!numericAmount || numericAmount <= 0) {
      showAlert('✕ Please enter a valid payment amount in LKR.');
      return;
    }
    try {
      await portalApi.addPaymentRecord(plan.id, {
        amount: numericAmount,
        payment_date: payDate || new Date().toISOString().split('T')[0],
        payment_method: payMethod,
        reference_number: payRef.trim() || undefined,
        billing_scope: 'project_cover',
        notes: payNotes.trim() || undefined,
        advance_due_date: advanceDue,
      });
      setRecordingForPlanId(null);
      setPayAmount('');
      setPayRef('');
      setPayNotes('');
      await onRefresh();
      showAlert(`✓ Recorded LKR ${numericAmount.toLocaleString()} payment on "${plan.package_name}".`);
    } catch (err: any) {
      showAlert(`✕ Error logging payment: ${err.message}`);
    }
  };

  const handleSaveRecordEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    try {
      await portalApi.updatePaymentRecord(editingRecord.id, {
        amount: Number(editingRecord.amount) || 0,
        payment_date: editingRecord.payment_date,
        payment_method: editingRecord.payment_method,
        reference_number: editingRecord.reference_number,
        notes: editingRecord.notes,
      });
      setEditingRecord(null);
      await onRefresh();
      showAlert('✓ Payment record adjusted.');
    } catch (err: any) {
      showAlert(`✕ Error adjusting payment: ${err.message}`);
    }
  };

  const handleDeleteRecord = async (record: PaymentRecord) => {
    if (!window.confirm(`Delete recorded payment of LKR ${Number(record.amount).toLocaleString()} (${record.payment_date})?`)) return;
    try {
      await portalApi.deletePaymentRecord(record.id);
      if (editingRecord?.id === record.id) setEditingRecord(null);
      await onRefresh();
      showAlert('✓ Payment record removed and balances recalculated.');
    } catch (err: any) {
      showAlert(`✕ Error deleting payment record: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Financial Telemetry Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-median-taupe/20 shadow-sm">
          <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe font-bold block mb-1">
            Total Collected (All Plans)
          </span>
          <div className="font-oswald text-2xl sm:text-3xl font-bold text-emerald-700">
            LKR {summary.totalCollected.toLocaleString()}
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-median-taupe/20 shadow-sm">
          <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe font-bold block mb-1">
            Remaining Project Balances
          </span>
          <div className="font-oswald text-2xl sm:text-3xl font-bold text-black">
            LKR {summary.totalRemaining.toLocaleString()}
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-median-taupe/20 shadow-sm">
          <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe font-bold block mb-1">
            Active Monthly Retainers
          </span>
          <div className="font-oswald text-2xl sm:text-3xl font-bold text-median-taupe">
            LKR {summary.monthlyRecurringRate.toLocaleString()}/mo
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white border border-median-taupe/20 shadow-sm">
          <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe font-bold block mb-1">
            Active Project Packages
          </span>
          <div className="font-oswald text-2xl sm:text-3xl font-bold text-black">
            {paymentPlans.length} Plans
          </div>
        </div>
      </div>

      {/* Create New Project Payment Package Form */}
      <div className="p-5 sm:p-8 rounded-2xl bg-white border border-median-taupe/20 shadow-sm">
        <h3 className="font-oswald text-xl font-bold uppercase text-black mb-1">
          Configure Project Payment Package
        </h3>
        <p className="text-xs text-median-taupe/80 mb-5">
          Assign a one-time, monthly recurring, or multi-month installment package per project. Customers track balances, due dates, and past payments live in their portal.
        </p>

        <form onSubmit={handleCreatePlan} className="space-y-4 text-xs font-mono">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold uppercase text-black mb-1">Select Client *</label>
              <select
                required
                value={clientId}
                onChange={(e) => {
                  setClientId(e.target.value);
                  setProjectId('');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
              >
                <option value="">-- Choose Client --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name} ({c.full_name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold uppercase text-black mb-1">Project Scope</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                disabled={!clientId}
                className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black disabled:opacity-50"
              >
                <option value="">-- Standalone / General Retainer --</option>
                {clientProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code_name} · {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold uppercase text-black mb-1">Billing Model *</label>
              <select
                value={billingType}
                onChange={(e) => handleBillingTypeChange(e.target.value as BillingType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
              >
                <option value="one_time">One-Time Payment (Fixed Total)</option>
                <option value="monthly">Monthly Recurring (Ongoing)</option>
                <option value="installment">Installment Plan (Few Months)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="block font-bold uppercase text-black mb-1">Package Name *</label>
              <input
                type="text"
                required
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                placeholder={
                  billingType === 'monthly'
                    ? 'e.g. Monthly Cloud Server & Maintenance Retainer'
                    : billingType === 'installment'
                    ? 'e.g. Full POS & Web Platform — 4-Month Plan'
                    : 'e.g. Custom Enterprise Platform (One-Time)'
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
              />
            </div>

            {billingType !== 'monthly' && (
              <div>
                <label className="block font-bold uppercase text-black mb-1">Total Package (LKR) *</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  required={billingType === 'one_time'}
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="e.g. 500000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                />
              </div>
            )}

            {billingType === 'monthly' && (
              <div>
                <label className="block font-bold uppercase text-black mb-1">Monthly Rate (LKR) *</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  required
                  value={installmentAmount}
                  onChange={(e) => setInstallmentAmount(e.target.value)}
                  placeholder="e.g. 45000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                />
              </div>
            )}

            {billingType === 'installment' && (
              <div>
                <label className="block font-bold uppercase text-black mb-1">Duration (Months) *</label>
                <input
                  type="number"
                  min="2"
                  max="60"
                  required
                  value={totalMonths}
                  onChange={(e) => setTotalMonths(e.target.value)}
                  placeholder="e.g. 3 or 6"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                />
              </div>
            )}

            {billingType === 'one_time' && (
              <div>
                <label className="block font-bold uppercase text-black mb-1">Payment Due Date</label>
                <input
                  type="date"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {billingType === 'installment' && (
              <div>
                <label className="block font-bold uppercase text-black mb-1">
                  Per-Month Installment (LKR)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={installmentAmount}
                  onChange={(e) => setInstallmentAmount(e.target.value)}
                  placeholder={
                    totalAmount && Number(totalMonths) > 0
                      ? `Auto: ${Math.round(Number(totalAmount) / Number(totalMonths)).toLocaleString()}`
                      : 'Optional (auto-divides total)'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                />
              </div>
            )}

            <div>
              <label className="block font-bold uppercase text-black mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
              />
            </div>

            {billingType !== 'one_time' && (
              <div>
                <label className="block font-bold uppercase text-black mb-1">Next Due Date</label>
                <input
                  type="date"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                />
              </div>
            )}

            <div className={billingType === 'one_time' ? 'sm:col-span-2' : ''}>
              <label className="block font-bold uppercase text-black mb-1">Package Terms / Notes</label>
              <input
                type="text"
                value={planNotes}
                onChange={(e) => setPlanNotes(e.target.value)}
                placeholder="e.g. 50% upfront, 50% upon UAT sign-off..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSavingPlan}
            className="py-3 px-6 rounded-xl bg-black text-white font-oswald text-xs uppercase tracking-widest hover:bg-median-taupe transition-colors disabled:opacity-50"
          >
            {isSavingPlan ? 'Saving Package...' : '+ Create Project Payment Package →'}
          </button>
        </form>
      </div>

      {/* Filters & Payment Plans List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-oswald text-xl font-bold uppercase text-black">
            Client Payment Plans & Ledgers ({filteredPlans.length})
          </h3>
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <select
              value={filterClient}
              onChange={(e) => {
                setFilterClient(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-xl border border-median-taupe/30 bg-white text-black"
            >
              <option value="all">All Clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name || c.full_name}
                </option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-xl border border-median-taupe/30 bg-white text-black"
            >
              <option value="all">All Billing Models</option>
              <option value="one_time">One-Time</option>
              <option value="monthly">Monthly Recurring</option>
              <option value="installment">Multi-Month Installment</option>
            </select>
          </div>
        </div>

        {isSyncing ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2].map((n) => (
              <div key={n} className="h-44 rounded-2xl bg-white border border-median-taupe/15" />
            ))}
          </div>
        ) : pagedPlans.length === 0 ? (
          <div className="p-10 rounded-2xl bg-white border border-median-taupe/20 text-center text-xs font-mono text-median-taupe">
            No payment packages match the selected filters yet. Configure a client package above.
          </div>
        ) : (
          <div className="space-y-5">
            {pagedPlans.map((plan) => {
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
              const badge = getDueBadge(plan, remaining);
              const editClientProjects = projects.filter((p) => p.client_id === plan.client_id);

              return (
                <div
                  key={plan.id}
                  className="p-5 sm:p-6 rounded-2xl bg-white border border-median-taupe/20 shadow-sm space-y-5"
                >
                  {/* Card Top Header */}
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-median-taupe/15">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase">
                        <span className="px-2.5 py-0.5 rounded-full bg-black text-white font-bold">
                          {BILLING_TYPE_LABEL[plan.billing_type]}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full border font-bold ${badge.cls}`}>
                          {badge.label}
                        </span>
                        {plan.project_title ? (
                          <span className="px-2.5 py-0.5 rounded-full border border-median-taupe/30 bg-[#FAF8F5] text-black font-semibold">
                            Project: {plan.project_code ? `${plan.project_code} · ` : ''}
                            {plan.project_title}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full border border-median-taupe/20 text-median-taupe">
                            Standalone Package
                          </span>
                        )}
                      </div>
                      <h4 className="font-oswald text-xl sm:text-2xl font-bold uppercase text-black">
                        {plan.package_name}
                      </h4>
                      <div className="text-xs font-mono text-median-taupe">
                        Client: <strong className="text-black">{plan.client_name}</strong>
                        {plan.next_due_date && (
                          <>
                            {' · '}Next Due Date:{' '}
                            <strong className="text-black">{plan.next_due_date}</strong>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => openRecordPayment(plan)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-[11px] font-mono font-bold uppercase transition-colors"
                      >
                        {recordingForPlanId === plan.id ? 'Close Payment Form' : '+ Record Payment'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingPlan(editingPlan?.id === plan.id ? null : { ...plan })}
                        className="px-3 py-1.5 rounded-xl border border-black text-black hover:bg-black hover:text-white text-[11px] font-mono font-bold uppercase transition-colors"
                      >
                        {editingPlan?.id === plan.id ? 'Cancel Edit' : 'Adjust Package'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePlan(plan)}
                        className="px-3 py-1.5 rounded-xl border border-red-300 text-red-700 hover:bg-red-600 hover:text-white text-[11px] font-mono font-bold uppercase transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Balance & Progress Breakdown */}
                  <div className="p-4 rounded-xl bg-[#FAF8F5] border border-median-taupe/15 space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                      <div>
                        <span className="text-[10px] uppercase text-median-taupe block">
                          {plan.billing_type === 'monthly' ? 'Monthly Rate' : 'Package Total'}
                        </span>
                        <strong className="font-oswald text-lg text-black">
                          {plan.currency} {(plan.billing_type === 'monthly' ? plan.installment_amount || plan.total_amount : totalTarget).toLocaleString()}
                          {plan.billing_type === 'monthly' ? '/mo' : ''}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-median-taupe block">Paid So Far</span>
                        <strong className="font-oswald text-lg text-emerald-700">
                          {plan.currency} {paidSoFar.toLocaleString()}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-median-taupe block">
                          {plan.billing_type === 'monthly' ? 'Cycles Paid' : 'Balance Needed'}
                        </span>
                        <strong className={`font-oswald text-lg ${remaining > 0 ? 'text-amber-700' : 'text-black'}`}>
                          {plan.billing_type === 'monthly'
                            ? `${payments.length} Month${payments.length === 1 ? '' : 's'}`
                            : `${plan.currency} ${remaining.toLocaleString()}`}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-median-taupe block">
                          {plan.billing_type === 'installment' ? 'Installment Term' : 'Next Due Date'}
                        </span>
                        <strong className="font-oswald text-base text-black">
                          {plan.billing_type === 'installment'
                            ? `${payments.length} / ${plan.total_months} Mos (${plan.currency} ${Number(plan.installment_amount || 0).toLocaleString()}/mo)`
                            : plan.next_due_date || 'Flexible / On Receipt'}
                        </strong>
                      </div>
                    </div>

                    {plan.billing_type !== 'monthly' && (
                      <div>
                        <div className="flex justify-between text-[11px] font-mono mb-1">
                          <span className="text-median-taupe uppercase">Payment Progress</span>
                          <span className="font-bold text-black">{pct}% Paid</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-median-taupe/20 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              pct >= 100 ? 'bg-emerald-600' : 'bg-median-taupe'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {plan.notes && (
                      <p className="text-[11px] font-mono text-median-taupe/90 pt-1">
                        <strong>Terms:</strong> {plan.notes}
                      </p>
                    )}
                  </div>

                  {/* Inline Package Editor */}
                  {editingPlan?.id === plan.id && (
                    <form
                      onSubmit={handleSavePlanEdit}
                      className="p-4 sm:p-5 rounded-xl bg-median-taupe/5 border border-median-taupe/25 space-y-3 text-xs font-mono"
                    >
                      <div className="font-oswald text-sm uppercase font-bold text-black">
                        Adjust Payment Package Settings
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-median-taupe mb-1">Package Name</label>
                          <input
                            type="text"
                            required
                            value={editingPlan.package_name}
                            onChange={(e) => setEditingPlan({ ...editingPlan, package_name: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-white text-black"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-median-taupe mb-1">Linked Project</label>
                          <select
                            value={editingPlan.project_id || ''}
                            onChange={(e) => setEditingPlan({ ...editingPlan, project_id: e.target.value || undefined })}
                            className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-white text-black"
                          >
                            <option value="">Standalone Package</option>
                            {editClientProjects.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.code_name} · {p.title}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-median-taupe mb-1">Billing Model</label>
                          <select
                            value={editingPlan.billing_type}
                            onChange={(e) => setEditingPlan({ ...editingPlan, billing_type: e.target.value as BillingType })}
                            className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-white text-black"
                          >
                            <option value="one_time">One-Time Payment</option>
                            <option value="monthly">Monthly Recurring</option>
                            <option value="installment">Multi-Month Installment</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-median-taupe mb-1">Total Amount (LKR)</label>
                          <input
                            type="number"
                            value={editingPlan.total_amount}
                            onChange={(e) => setEditingPlan({ ...editingPlan, total_amount: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-white text-black"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-median-taupe mb-1">Monthly / Inst. (LKR)</label>
                          <input
                            type="number"
                            value={editingPlan.installment_amount}
                            onChange={(e) => setEditingPlan({ ...editingPlan, installment_amount: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-white text-black"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-median-taupe mb-1">Total Months</label>
                          <input
                            type="number"
                            min="0"
                            value={editingPlan.total_months}
                            onChange={(e) => setEditingPlan({ ...editingPlan, total_months: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-white text-black"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-median-taupe mb-1">Next Due Date</label>
                          <input
                            type="date"
                            value={editingPlan.next_due_date || ''}
                            onChange={(e) => setEditingPlan({ ...editingPlan, next_due_date: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-white text-black"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-median-taupe mb-1">Status</label>
                          <select
                            value={editingPlan.status}
                            onChange={(e) => setEditingPlan({ ...editingPlan, status: e.target.value as ProjectPaymentPlan['status'] })}
                            className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-white text-black"
                          >
                            <option value="active">Active</option>
                            <option value="overdue">Overdue</option>
                            <option value="completed">Completed / Settled</option>
                            <option value="paused">Paused</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold uppercase text-median-taupe mb-1">Notes</label>
                          <input
                            type="text"
                            value={editingPlan.notes || ''}
                            onChange={(e) => setEditingPlan({ ...editingPlan, notes: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-white text-black"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingPlan(null)}
                          className="px-3 py-1.5 rounded-lg border border-median-taupe/30 text-median-taupe hover:text-black uppercase"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-lg bg-black text-white font-bold uppercase hover:bg-median-taupe transition-colors"
                        >
                          Save Package Changes
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Inline Record New Payment Form */}
                  {recordingForPlanId === plan.id && (
                    <form
                      onSubmit={(e) => handleRecordPayment(e, plan)}
                      className="p-4 sm:p-5 rounded-xl bg-emerald-50/60 border border-emerald-300 space-y-3 text-xs font-mono"
                    >
                      <div className="font-oswald text-sm uppercase font-bold text-emerald-950">
                        Record Payment Received — {plan.package_name}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-emerald-900 mb-1">Amount Received (LKR) *</label>
                          <input
                            type="number"
                            min="1"
                            step="any"
                            required
                            value={payAmount}
                            onChange={(e) => setPayAmount(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-emerald-300 bg-white text-black font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-emerald-900 mb-1">Payment Date *</label>
                          <input
                            type="date"
                            required
                            value={payDate}
                            onChange={(e) => setPayDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-emerald-300 bg-white text-black"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-emerald-900 mb-1">Method</label>
                          <select
                            value={payMethod}
                            onChange={(e) => setPayMethod(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-emerald-300 bg-white text-black"
                          >
                            <option>Bank Transfer / CEFTS</option>
                            <option>Cash Settlement</option>
                            <option>Card / Online Gateway</option>
                            <option>Corporate Cheque</option>
                            <option>Invoice Settlement</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-emerald-900 mb-1">Reference / Receipt #</label>
                          <input
                            type="text"
                            value={payRef}
                            onChange={(e) => setPayRef(e.target.value)}
                            placeholder="e.g. CEFTS-9021 / INV-..."
                            className="w-full px-3 py-2 rounded-lg border border-emerald-300 bg-white text-black"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <input
                          type="text"
                          value={payNotes}
                          onChange={(e) => setPayNotes(e.target.value)}
                          placeholder="Optional payment note (e.g. Month 2 installment cleared)..."
                          className="flex-1 px-3 py-2 rounded-lg border border-emerald-300 bg-white text-black"
                        />
                        {plan.billing_type !== 'one_time' && (
                          <label className="inline-flex items-center gap-2 text-[11px] text-emerald-950 font-semibold cursor-pointer shrink-0">
                            <input
                              type="checkbox"
                              checked={advanceDue}
                              onChange={(e) => setAdvanceDue(e.target.checked)}
                              className="w-4 h-4 accent-emerald-700"
                            />
                            <span>Advance Next Due Date (+1 Mo)</span>
                          </label>
                        )}
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setRecordingForPlanId(null)}
                          className="px-3 py-1.5 rounded-lg border border-emerald-400 text-emerald-900 uppercase"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-lg bg-emerald-700 text-white font-bold uppercase hover:bg-emerald-800 transition-colors"
                        >
                          Confirm Payment ✓
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Past Payments History Ledger */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono uppercase">
                      <span className="font-bold text-black">
                        Past Payments History ({payments.length})
                      </span>
                    </div>

                    {payments.length === 0 ? (
                      <div className="p-3.5 rounded-xl border border-dashed border-median-taupe/25 text-xs font-mono text-median-taupe/80">
                        No payments logged yet for this package. Record a payment above or mark a linked project cover-up invoice as Paid.
                      </div>
                    ) : (
                      <div className="divide-y divide-median-taupe/15 rounded-xl border border-median-taupe/20 overflow-hidden">
                        {payments.map((rec) => (
                          <div key={rec.id} className="p-3.5 bg-white text-xs font-mono space-y-2">
                            {editingRecord?.id === rec.id ? (
                              <form onSubmit={handleSaveRecordEdit} className="space-y-2">
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                                  <input
                                    type="number"
                                    required
                                    value={editingRecord.amount}
                                    onChange={(e) => setEditingRecord({ ...editingRecord, amount: Number(e.target.value) })}
                                    className="px-2.5 py-1.5 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black font-bold"
                                  />
                                  <input
                                    type="date"
                                    required
                                    value={editingRecord.payment_date}
                                    onChange={(e) => setEditingRecord({ ...editingRecord, payment_date: e.target.value })}
                                    className="px-2.5 py-1.5 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                                  />
                                  <input
                                    type="text"
                                    value={editingRecord.payment_method}
                                    onChange={(e) => setEditingRecord({ ...editingRecord, payment_method: e.target.value })}
                                    className="px-2.5 py-1.5 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                                  />
                                  <input
                                    type="text"
                                    value={editingRecord.reference_number || ''}
                                    onChange={(e) => setEditingRecord({ ...editingRecord, reference_number: e.target.value })}
                                    placeholder="Reference #"
                                    className="px-2.5 py-1.5 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                                  />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <input
                                    type="text"
                                    value={editingRecord.notes || ''}
                                    onChange={(e) => setEditingRecord({ ...editingRecord, notes: e.target.value })}
                                    placeholder="Notes..."
                                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                                  />
                                  <div className="flex gap-1.5 justify-end">
                                    <button
                                      type="button"
                                      onClick={() => setEditingRecord(null)}
                                      className="px-2.5 py-1 rounded border border-median-taupe/30 text-median-taupe"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="submit"
                                      className="px-3 py-1 rounded bg-black text-white font-bold"
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>
                              </form>
                            ) : (
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="space-y-0.5">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <strong className="font-oswald text-base text-emerald-700">
                                      + {rec.currency || 'LKR'} {Number(rec.amount || 0).toLocaleString()}
                                    </strong>
                                    <span className="text-black font-semibold">{rec.payment_date}</span>
                                    <span className="px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-median-taupe/20 text-[10px] text-median-taupe">
                                      {rec.payment_method}
                                    </span>
                                    {rec.reference_number && (
                                      <span className="text-[10px] text-black/70">Ref: {rec.reference_number}</span>
                                    )}
                                  </div>
                                  {rec.notes && <div className="text-[11px] text-median-taupe/80">{rec.notes}</div>}
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => setEditingRecord({ ...rec })}
                                    className="px-2.5 py-1 rounded-lg border border-median-taupe/30 text-black hover:border-black text-[10px] font-bold uppercase"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteRecord(rec)}
                                    className="px-2.5 py-1 rounded-lg border border-red-200 text-red-700 hover:bg-red-600 hover:text-white text-[10px] font-bold uppercase transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pt-3 flex items-center justify-between text-xs font-mono border-t border-median-taupe/15">
            <span className="text-median-taupe">
              Page <strong className="text-black">{page}</strong> of <strong className="text-black">{totalPages}</strong>
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-lg border border-median-taupe/30 disabled:opacity-30"
              >
                ← Prev
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 rounded-lg border border-median-taupe/30 disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
