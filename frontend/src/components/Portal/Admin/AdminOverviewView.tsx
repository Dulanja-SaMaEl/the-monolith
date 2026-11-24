import React from 'react';
import {
  UserProfile,
  PortalProject,
  BillingDocument,
  ProjectRequest,
  MeetingRequest,
  ContactInquiry,
  ExecutiveTask,
  ProjectPaymentPlan,
} from '../../../lib/portalStore';
import { AdminCashflowHud } from './AdminCashflowHud';
import { ScrollReveal, CountingNumber } from '../../MedianStudio/ScrollReveal';

interface AdminOverviewViewProps {
  users: UserProfile[];
  projects: PortalProject[];
  paymentPlans: ProjectPaymentPlan[];
  billingDocs: BillingDocument[];
  requests: ProjectRequest[];
  meetings: MeetingRequest[];
  inquiries: ContactInquiry[];
  tasks: ExecutiveTask[];
  onNavigateTab: (tab: any) => void;
  onToggleTask: (task: ExecutiveTask) => void;
}

export const AdminOverviewView: React.FC<AdminOverviewViewProps> = ({
  users,
  projects,
  paymentPlans,
  billingDocs,
  requests,
  meetings,
  inquiries,
  tasks,
  onNavigateTab,
  onToggleTask,
}) => {
  const clientCount = users.filter((u) => u.role === 'client').length;
  const totalBillingLkr = billingDocs.reduce((acc, d) => acc + Number(d.total || 0), 0);
  const pendingQueue =
    requests.filter((r) => r.status !== 'approved' && r.status !== 'declined').length +
    meetings.filter((m) => m.status === 'pending').length +
    inquiries.filter((i) => i.status === 'new').length;
  const openTasks = tasks.filter((t) => !t.is_completed);

  return (
    <div className="space-y-6">
      {/* Minimalist Top 4 KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <ScrollReveal variant="card-flip-left" delay={0} duration={650} once className="h-full">
          <button
            type="button"
            onClick={() => onNavigateTab('customers')}
            className="w-full text-left p-5 rounded-2xl bg-white border border-median-taupe/20 hover:border-black shadow-sm transition-all h-full group"
          >
            <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe font-bold block mb-1.5">
              Active Clients
            </span>
            <div className="font-oswald text-3xl sm:text-4xl font-bold text-black group-hover:text-median-taupe transition-colors">
              <CountingNumber value={clientCount} duration={900} />
            </div>
            <span className="text-[10px] font-mono text-median-taupe/75">Manage registry →</span>
          </button>
        </ScrollReveal>

        <ScrollReveal variant="card-lift" delay={70} duration={650} once className="h-full">
          <button
            type="button"
            onClick={() => onNavigateTab('projects')}
            className="w-full text-left p-5 rounded-2xl bg-white border border-median-taupe/20 hover:border-black shadow-sm transition-all h-full group"
          >
            <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe font-bold block mb-1.5">
              Live Projects
            </span>
            <div className="font-oswald text-3xl sm:text-4xl font-bold text-black group-hover:text-median-taupe transition-colors">
              <CountingNumber value={projects.length} duration={900} />
            </div>
            <span className="text-[10px] font-mono text-median-taupe/75">
              {projects.filter((p) => p.status === 'deployed').length} deployed · View all →
            </span>
          </button>
        </ScrollReveal>

        <ScrollReveal variant="card-flip-right" delay={140} duration={650} once className="h-full">
          <button
            type="button"
            onClick={() => onNavigateTab('billing')}
            className="w-full text-left p-5 rounded-2xl bg-white border border-median-taupe/20 hover:border-black shadow-sm transition-all h-full group"
          >
            <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe font-bold block mb-1.5">
              Total Billed Volume
            </span>
            <div className="font-oswald text-3xl sm:text-4xl font-bold text-median-taupe truncate">
              LKR {(totalBillingLkr / 1_000_000).toFixed(2)}M
            </div>
            <span className="text-[10px] font-mono text-median-taupe/75">
              {billingDocs.length} documents issued →
            </span>
          </button>
        </ScrollReveal>

        <ScrollReveal variant="zoom-rotate" delay={210} duration={650} once className="h-full">
          <button
            type="button"
            onClick={() => onNavigateTab('requests')}
            className="w-full text-left p-5 rounded-2xl bg-white border border-median-taupe/20 hover:border-black shadow-sm transition-all h-full group"
          >
            <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe font-bold block mb-1.5">
              Inbox &amp; Requests
            </span>
            <div className="font-oswald text-3xl sm:text-4xl font-bold text-black group-hover:text-median-taupe transition-colors">
              <CountingNumber value={pendingQueue} duration={900} />
            </div>
            <span className="text-[10px] font-mono text-median-taupe/75">
              {openTasks.length} open tasks · Review →
            </span>
          </button>
        </ScrollReveal>
      </div>

      {/* Cashflow Forecast HUD */}
      <ScrollReveal variant="fade-up" delay={120} duration={700} once>
        <AdminCashflowHud
          paymentPlans={paymentPlans}
          billingDocs={billingDocs}
          onOpenPayments={() => onNavigateTab('payments')}
          onOpenBilling={() => onNavigateTab('billing')}
        />
      </ScrollReveal>

      {/* Focused 2-Column Pulse: Projects + Today's Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Active Projects Pulse */}
        <ScrollReveal variant="card-flip-left" delay={160} duration={700} once className="lg:col-span-7">
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-median-taupe/20 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe font-bold block">
                  Delivery Pipeline
                </span>
                <h3 className="font-oswald text-xl font-bold uppercase text-black">Active Projects</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('projects')}
                className="text-[11px] font-mono uppercase text-median-taupe hover:text-black font-semibold transition-colors"
              >
                All Projects →
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#FAF8F5] text-center text-xs font-mono text-median-taupe">
                No active projects yet.
              </div>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl bg-[#FAF8F5] border border-median-taupe/15 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                      <div className="min-w-0">
                        <span className="font-bold text-black block truncate">{p.title}</span>
                        <span className="text-[10px] text-median-taupe">{p.client_name}</span>
                      </div>
                      <span className="text-[11px] font-bold text-median-taupe uppercase shrink-0">
                        {p.progress_percentage}% · {p.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-median-taupe/20 overflow-hidden">
                      <div
                        className="h-full bg-median-taupe rounded-full transition-all duration-700"
                        style={{ width: `${p.progress_percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Open Executive Tasks Pulse */}
        <ScrollReveal variant="card-flip-right" delay={200} duration={700} once className="lg:col-span-5">
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-median-taupe/20 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe font-bold block">
                  Dulanja &amp; Remashi
                </span>
                <h3 className="font-oswald text-xl font-bold uppercase text-black">
                  Open Sprint Tasks ({openTasks.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('tasks')}
                className="text-[11px] font-mono uppercase text-median-taupe hover:text-black font-semibold transition-colors"
              >
                Task Board →
              </button>
            </div>

            {openTasks.length === 0 ? (
              <div className="p-6 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center text-xs font-mono text-emerald-800">
                ✓ All executive tasks cleared!
              </div>
            ) : (
              <div className="space-y-2.5">
                {openTasks.slice(0, 5).map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-[#FAF8F5] border border-median-taupe/15 flex items-center gap-3 hover:border-median-taupe/40 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => onToggleTask(t)}
                      title="Mark task completed"
                      className="w-5 h-5 rounded-md border-2 border-median-taupe/50 hover:border-emerald-600 hover:bg-emerald-50 flex items-center justify-center shrink-0 transition-colors"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-black truncate">{t.title}</div>
                      <div className="text-[10px] font-mono text-median-taupe flex items-center gap-1.5">
                        <span>{t.assignee.split(' ')[0]}</span>
                        <span>·</span>
                        <span>{t.task_date}</span>
                        {t.priority === 'urgent' && (
                          <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-bold uppercase text-[9px]">
                            Urgent
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};
