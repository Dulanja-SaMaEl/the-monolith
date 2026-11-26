import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  UserProfile,
  Partner,
  PortalProject,
  BillingDocument,
  CustomerReview,
  PortalBlogPost,
  ProjectRequest,
  MeetingRequest,
  ContactInquiry,
  ExecutiveTask,
  ProjectPaymentPlan,
  ProjectChangeRequest,
} from '../../../lib/portalStore';
import { portalApi } from '../../../lib/portalApi';
import { downloadBillingVoucherHtml, printBillingVoucherPdf } from '../../../lib/invoiceDownloader';
import { usePwaInstall } from '../../../lib/usePwaInstall';
import { ScrollReveal } from '../../MedianStudio/ScrollReveal';

// Dedicated Modular Admin Page Views
import { AdminOverviewView } from './AdminOverviewView';
import { AdminTasksView } from './AdminTasksView';
import { AdminCustomersView } from './AdminCustomersView';
import { AdminProjectsView } from './AdminProjectsView';
import { AdminPaymentsPanel } from './AdminPaymentsPanel';
import { AdminBillingView } from './AdminBillingView';
import {
  AdminPartnersView,
  AdminReviewsView,
  AdminBlogView,
  AdminRequestsView,
} from './AdminBrandViews';
import { MonoCompanion } from '../MonoCompanion/MonoCompanion';
import { buildAdminProactiveRadar } from '../MonoCompanion/monoGuideEngine';

interface AdminPortalProps {
  navigate: (route: string) => void;
}

type AdminTabId =
  | 'overview'
  | 'tasks'
  | 'customers'
  | 'projects'
  | 'requests'
  | 'payments'
  | 'billing'
  | 'partners'
  | 'reviews'
  | 'blog';

const TAB_META: Record<AdminTabId, { group: string; title: string; subtitle: string }> = {
  overview: {
    group: 'Command',
    title: 'Executive Overview',
    subtitle: 'Cashflow telemetry, active delivery pulse, and open sprint tasks.',
  },
  tasks: {
    group: 'Command',
    title: 'Daily Tasks',
    subtitle: 'Focused daily sprint queue for Dulanja Abeysinghe & Remashi Diyana.',
  },
  customers: {
    group: 'Operations',
    title: 'Customers',
    subtitle: 'Client accounts, project & payment summaries, and portal security controls.',
  },
  projects: {
    group: 'Operations',
    title: 'Projects & Vault',
    subtitle: 'Delivery progress, milestones, live URLs, and domain/server renewal tracking.',
  },
  requests: {
    group: 'Operations',
    title: 'Inbox & Calls',
    subtitle: 'Public contact briefs, consultation bookings, and new project commissions.',
  },
  payments: {
    group: 'Finance',
    title: 'Payments & Plans',
    subtitle: 'Per-project packages (one-time, monthly, installment), due dates, and official receipts.',
  },
  billing: {
    group: 'Finance',
    title: 'Invoices & Quotes',
    subtitle: 'Issue LKR invoices/quotations, convert quotes in one click, and export PDFs.',
  },
  partners: {
    group: 'Brand & CMS',
    title: 'Partners',
    subtitle: 'Manage strategic partners displayed on the Monolith LK public homepage.',
  },
  reviews: {
    group: 'Brand & CMS',
    title: 'Reviews',
    subtitle: 'Curate verified enterprise endorsements showcased across the live site.',
  },
  blog: {
    group: 'Brand & CMS',
    title: 'Journal & News',
    subtitle: 'Publish and manage editorial articles for Latest News and /blog.',
  },
};

export const AdminPortal: React.FC<AdminPortalProps> = ({ navigate }) => {
  const { user, logout, setPreviewClient, isLiveAuth } = useAuth();
  const { canInstall, promptInstall } = usePwaInstall();
  const mainScrollRef = useRef<HTMLElement | null>(null);

  const [activeTab, setActiveTab] = useState<AdminTabId>('overview');
  const [isLiveDb, setIsLiveDb] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Live Data States
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [projects, setProjects] = useState<PortalProject[]>([]);
  const [changeRequests, setChangeRequests] = useState<ProjectChangeRequest[]>([]);
  const [paymentPlans, setPaymentPlans] = useState<ProjectPaymentPlan[]>([]);
  const [billingDocs, setBillingDocs] = useState<BillingDocument[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [blogPosts, setBlogPosts] = useState<PortalBlogPost[]>([]);
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [meetings, setMeetings] = useState<MeetingRequest[]>([]);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [tasks, setTasks] = useState<ExecutiveTask[]>([]);

  // Shared Modal & Toast
  const [selectedBillingDoc, setSelectedBillingDoc] = useState<BillingDocument | null>(null);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [monoCelebrateCount, setMonoCelebrateCount] = useState<number>(0);
  const showAlert = useCallback((msg: string) => {
    setAlertMsg(msg);
    if (msg.startsWith('✓')) {
      setMonoCelebrateCount((c) => c + 1);
    }
    window.setTimeout(() => setAlertMsg(null), 4000);
  }, []);

  const monoSuggestions = useMemo(
    () =>
      buildAdminProactiveRadar({
        projects,
        tasks,
        paymentPlans,
        billingDocs,
        changeRequests,
        meetings,
        inquiries,
        requests,
      }),
    [projects, tasks, paymentPlans, billingDocs, changeRequests, meetings, inquiries, requests]
  );

  const refreshData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const [clientsRes, partRes, projRes, crRes, payRes, billRes, revRes, blogRes, reqRes, meetRes, inqRes, taskRes] =
        await Promise.all([
          portalApi.getClients(),
          portalApi.getPartners(true),
          portalApi.getProjects(),
          portalApi.getChangeRequests(),
          portalApi.getPaymentPlans(),
          portalApi.getBillingDocuments(),
          portalApi.getReviews(true),
          portalApi.getBlogPosts(true),
          portalApi.getProjectRequests(),
          portalApi.getMeetings(),
          portalApi.getContactInquiries(),
          portalApi.getTasks(),
        ]);

      setUsers(clientsRes.data);
      setPartners(partRes.data);
      setProjects(projRes.data);
      setChangeRequests(crRes.data);
      setPaymentPlans(payRes.data);
      setBillingDocs(billRes.data);
      setReviews(revRes.data);
      setBlogPosts(blogRes.data);
      setRequests(reqRes.data);
      setMeetings(meetRes.data);
      setInquiries(inqRes.data);
      setTasks(taskRes.data);
      setIsLiveDb(clientsRes.live || isLiveAuth);
    } catch (err: any) {
      showAlert(`⚠ Sync notice: ${err?.message || 'Using cached state'}`);
    } finally {
      setIsSyncing(false);
    }
  }, [isLiveAuth, showAlert]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleLogout = async () => {
    await logout();
    navigate('/portal/login');
  };

  const handleSelectTab = (tab: AdminTabId) => {
    setActiveTab(tab);
    mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleTask = async (t: ExecutiveTask) => {
    const nextCompleted = !t.is_completed;
    try {
      await portalApi.toggleTask(t.id, nextCompleted);
      setTasks((prev) =>
        prev.map((item) =>
          item.id === t.id
            ? {
                ...item,
                is_completed: nextCompleted,
                completed_at: nextCompleted ? new Date().toISOString() : undefined,
              }
            : item
        )
      );
      showAlert(nextCompleted ? `✓ Completed: "${t.title}"` : `↺ Restored: "${t.title}"`);
    } catch (err: any) {
      showAlert(`✕ Error updating task: ${err.message}`);
    }
  };

  const pendingChangeRequestsCount = changeRequests.filter((cr) => cr.status === 'requested').length;

  // Grouped Minimalist Sidebar Structure
  const navGroups: { label: string; items: { id: AdminTabId; label: string; count: number | null; badge?: string }[] }[] = [
    {
      label: 'Command',
      items: [
        { id: 'overview', label: 'Overview', count: null },
        { id: 'tasks', label: 'Daily Tasks', count: tasks.filter((t) => !t.is_completed).length },
      ],
    },
    {
      label: 'Operations',
      items: [
        { id: 'customers', label: 'Customers', count: users.filter((u) => u.role === 'client').length },
        {
          id: 'projects',
          label: 'Projects',
          count: projects.length,
          badge: pendingChangeRequestsCount > 0 ? `${pendingChangeRequestsCount} CR` : undefined,
        },
        { id: 'requests', label: 'Inbox & Calls', count: requests.length + meetings.length + inquiries.length },
      ],
    },
    {
      label: 'Finance',
      items: [
        { id: 'payments', label: 'Payments & Plans', count: paymentPlans.length },
        { id: 'billing', label: 'Invoices & Quotes', count: billingDocs.length },
      ],
    },
    {
      label: 'Brand & CMS',
      items: [
        { id: 'partners', label: 'Partners', count: partners.length },
        { id: 'reviews', label: 'Reviews', count: reviews.length },
        { id: 'blog', label: 'Journal / Blog', count: blogPosts.length },
      ],
    },
  ];

  const allNavItems = navGroups.flatMap((g) => g.items);
  const currentMeta = TAB_META[activeTab];

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden w-full max-w-full overflow-x-hidden bg-[#FAF8F5] text-black font-inter selection:bg-median-taupe selection:text-white flex flex-col md:flex-row">
      {/* ================= MINIMALIST GROUPED ADMIN SIDEBAR ================= */}
      <aside className="w-full md:w-64 md:h-screen bg-white border-b md:border-b-0 md:border-r border-median-taupe/20 p-4 sm:p-5 flex flex-col shrink-0">
        {/* Top Brand Header (Pinned) */}
        <div className="flex md:block items-center justify-between mb-3 md:mb-5 shrink-0">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 focus:outline-none group">
            <span className="w-4 h-4 bg-black flex items-center justify-center text-white text-[9px] font-bold">
              ■
            </span>
            <span className="font-oswald text-xl font-bold tracking-[0.2em] text-black uppercase group-hover:text-median-taupe transition-colors">
              MONOLITH<span className="text-median-taupe ml-1">LK</span>
            </span>
          </button>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-median-taupe/80 md:mt-1">
            <span className={`w-2 h-2 rounded-full animate-pulse ${isLiveDb ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>{isLiveDb ? 'Live Supabase DB' : 'Local Cache'}</span>
          </div>
        </div>

        {/* Mobile Horizontal Pill Nav */}
        <nav className="flex md:hidden gap-1.5 overflow-x-auto pb-2 no-scrollbar font-oswald text-xs uppercase tracking-wider shrink-0">
          {allNavItems.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleSelectTab(tab.id)}
              className={`py-1.5 px-3 rounded-xl flex items-center gap-1.5 transition-all shrink-0 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-black text-white font-bold shadow-sm'
                  : 'text-median-taupe bg-[#FAF8F5] border border-median-taupe/20'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-median-taupe/10 text-median-taupe'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Desktop Grouped Nav (Internally scrollable, zero clipping) */}
        <nav className="hidden md:flex flex-col gap-4 overflow-y-auto flex-1 min-h-0 pr-1 no-scrollbar">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <div className="px-2.5 text-[9px] font-mono font-bold uppercase tracking-[0.18em] text-median-taupe/60">
                {group.label}
              </div>
              {group.items.map((tab) => (
                <button
                  key={tab.id}
                  data-guide={`admin-nav-${tab.id}`}
                  onClick={() => handleSelectTab(tab.id)}
                  className={`w-full py-2 px-3 rounded-xl flex items-center justify-between font-oswald text-[13px] uppercase tracking-wider transition-all ${
                    activeTab === tab.id
                      ? 'bg-black text-white font-bold shadow-sm'
                      : 'text-median-taupe hover:text-black hover:bg-[#FAF8F5]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="flex items-center gap-1.5">
                    {tab.badge && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-amber-400 text-black font-bold">
                        {tab.badge}
                      </span>
                    )}
                    {tab.count !== null && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-median-taupe/10 text-median-taupe'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Mobile Quick Actions */}
        <div className="flex md:hidden items-center justify-between gap-2 pt-2.5 border-t border-median-taupe/15 text-[11px] font-mono shrink-0">
          <button
            onClick={() => {
              const firstClient = users.find((u) => u.role === 'client') || null;
              setPreviewClient(firstClient);
              navigate('/portal/client');
            }}
            className="px-2.5 py-1.5 rounded-lg border border-median-taupe/30 text-black"
          >
            Client View ↗
          </button>
          <button onClick={() => navigate('/')} className="px-2.5 py-1.5 rounded-lg border border-median-taupe/30 text-black">
            Public Site
          </button>
          <button onClick={handleLogout} className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 font-bold">
            Sign Out
          </button>
        </div>

        {/* Desktop Footer Actions (Pinned) */}
        <div className="hidden md:block pt-3 border-t border-median-taupe/15 mt-2 space-y-1.5 text-xs font-mono shrink-0">
          <div className="text-median-taupe/80 text-[10px] truncate mb-1">
            Admin: <strong className="text-black">{user?.full_name || 'Dulanja Abeysinghe'}</strong>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              data-guide="admin-client-preview-btn"
              onClick={() => {
                const firstClient = users.find((u) => u.role === 'client') || null;
                setPreviewClient(firstClient);
                navigate('/portal/client');
              }}
              className="py-1.5 px-2 rounded-lg border border-median-taupe/30 hover:border-black text-black text-[10px] text-center transition-colors"
            >
              Client View ↗
            </button>
            <button
              onClick={() => navigate('/')}
              className="py-1.5 px-2 rounded-lg border border-median-taupe/30 hover:border-black text-black text-[10px] text-center transition-colors"
            >
              Public Site
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-1.5 px-3 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-[11px] text-center transition-colors font-bold"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ================= MAIN EXECUTIVE CONTENT PANE ================= */}
      <main ref={mainScrollRef} className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 md:h-screen overflow-x-hidden md:overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
          {/* Animated Minimalist Page Header */}
          <ScrollReveal key={`header-${activeTab}`} variant="fade-up" duration={500} once>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-median-taupe/20">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-median-taupe font-bold block mb-1">
                  Monolith LK · {currentMeta.group}
                </span>
                <h1 className="font-oswald text-3xl sm:text-4xl font-bold uppercase tracking-tight text-black leading-none">
                  {currentMeta.title}
                </h1>
                <p className="text-xs text-median-taupe/85 mt-1.5">{currentMeta.subtitle}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {canInstall && (
                  <button
                    type="button"
                    onClick={promptInstall}
                    className="px-3 py-1.5 rounded-full border border-median-taupe bg-median-taupe/10 hover:bg-median-taupe hover:text-white text-[10px] font-mono font-bold uppercase text-black transition-colors"
                  >
                    + Install App
                  </button>
                )}
                <span className="px-3 py-1.5 rounded-full border border-median-taupe/25 bg-white text-[10px] font-mono text-median-taupe">
                  {isSyncing ? 'Syncing...' : isLiveDb ? '● Live Sync' : '● Offline Cache'}
                </span>
                <button
                  type="button"
                  onClick={refreshData}
                  className="px-3 py-1.5 rounded-full border border-median-taupe/30 bg-white hover:border-black text-[10px] font-mono font-bold uppercase text-black transition-colors"
                >
                  ↻ Sync
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* Offline Notice */}
          {!isLiveDb && !isSyncing && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span>
                <strong>Local Cache Mode:</strong> Sign in with your live admin credentials to sync with Supabase.
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3.5 py-1.5 rounded-lg bg-black text-white font-bold uppercase text-[10px] tracking-wider hover:bg-median-taupe shrink-0"
              >
                Sign In to Live DB →
              </button>
            </div>
          )}

          {/* Live Toast Banner */}
          {alertMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-mono font-semibold animate-fade-in">
              {alertMsg}
            </div>
          )}

          {/* Dedicated Active Page View */}
          <div key={activeTab}>
            {activeTab === 'overview' && (
              <AdminOverviewView
                users={users}
                projects={projects}
                paymentPlans={paymentPlans}
                billingDocs={billingDocs}
                requests={requests}
                meetings={meetings}
                inquiries={inquiries}
                tasks={tasks}
                onNavigateTab={handleSelectTab}
                onToggleTask={handleToggleTask}
              />
            )}

            {activeTab === 'tasks' && (
              <AdminTasksView
                tasks={tasks}
                onRefresh={refreshData}
                onToggleTask={handleToggleTask}
                showAlert={showAlert}
              />
            )}

            {activeTab === 'customers' && (
              <AdminCustomersView
                users={users}
                projects={projects}
                paymentPlans={paymentPlans}
                isSyncing={isSyncing}
                onRefresh={refreshData}
                showAlert={showAlert}
              />
            )}

            {activeTab === 'projects' && (
              <AdminProjectsView
                users={users}
                projects={projects}
                changeRequests={changeRequests}
                isSyncing={isSyncing}
                onRefresh={refreshData}
                showAlert={showAlert}
              />
            )}

            {activeTab === 'payments' && (
              <AdminPaymentsPanel
                users={users}
                projects={projects}
                paymentPlans={paymentPlans}
                isSyncing={isSyncing}
                onRefresh={refreshData}
                showAlert={showAlert}
              />
            )}

            {activeTab === 'billing' && (
              <AdminBillingView
                users={users}
                projects={projects}
                paymentPlans={paymentPlans}
                billingDocs={billingDocs}
                isSyncing={isSyncing}
                onRefresh={refreshData}
                onPreviewDoc={(doc) => setSelectedBillingDoc(doc)}
                showAlert={showAlert}
              />
            )}

            {activeTab === 'partners' && (
              <AdminPartnersView
                partners={partners}
                isSyncing={isSyncing}
                onRefresh={refreshData}
                showAlert={showAlert}
              />
            )}

            {activeTab === 'reviews' && (
              <AdminReviewsView
                reviews={reviews}
                isSyncing={isSyncing}
                onRefresh={refreshData}
                showAlert={showAlert}
              />
            )}

            {activeTab === 'blog' && (
              <AdminBlogView
                blogPosts={blogPosts}
                isSyncing={isSyncing}
                onRefresh={refreshData}
                showAlert={showAlert}
              />
            )}

            {activeTab === 'requests' && (
              <AdminRequestsView
                requests={requests}
                meetings={meetings}
                inquiries={inquiries}
                isSyncing={isSyncing}
                onRefresh={refreshData}
                showAlert={showAlert}
              />
            )}
          </div>
        </div>
      </main>

      {/* Shared Haute Editorial Voucher Preview Modal */}
      {selectedBillingDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] max-w-2xl w-full rounded-2xl border border-median-taupe/30 shadow-2xl p-5 sm:p-8 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex justify-between items-start border-b border-median-taupe/20 pb-5 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-3.5 h-3.5 bg-black flex items-center justify-center text-white text-[8px] font-bold">
                    ■
                  </span>
                  <span className="font-oswald text-lg font-bold tracking-[0.2em] text-black uppercase">
                    MONOLITH<span className="text-median-taupe ml-1">LK</span>
                  </span>
                </div>
                <h3 className="font-oswald text-2xl font-bold uppercase text-black">
                  {selectedBillingDoc.type.toUpperCase()}: {selectedBillingDoc.document_number}
                </h3>
                <span className="text-xs text-median-taupe">
                  Issued to: <strong className="text-black">{selectedBillingDoc.client_name}</strong>
                  {selectedBillingDoc.client_contact_name &&
                    selectedBillingDoc.client_contact_name !== selectedBillingDoc.client_name && (
                      <> · Client: <strong className="text-black">{selectedBillingDoc.client_contact_name}</strong></>
                    )}{' '}
                  · Due: {selectedBillingDoc.due_date || 'Upon Receipt'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBillingDoc(null)}
                className="w-9 h-9 rounded-full border border-median-taupe/40 flex items-center justify-center text-sm font-bold text-median-taupe hover:text-black hover:border-black transition-colors shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[440px] text-xs">
                  <thead>
                    <tr className="border-b border-median-taupe/20 text-median-taupe uppercase text-left">
                      <th className="py-2 font-oswald tracking-wider">Deliverable Item</th>
                      <th className="py-2 text-center font-oswald tracking-wider">Qty</th>
                      <th className="py-2 text-right font-oswald tracking-wider">Unit Price</th>
                      <th className="py-2 text-right font-oswald tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-median-taupe/15">
                    {selectedBillingDoc.line_items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3 text-black font-semibold">{item.description}</td>
                        <td className="py-3 text-center text-black/80">{item.quantity}</td>
                        <td className="py-3 text-right text-black/80">
                          {selectedBillingDoc.currency || 'LKR'} {item.unit_price.toLocaleString()}
                        </td>
                        <td className="py-3 text-right font-bold text-black">
                          {selectedBillingDoc.currency || 'LKR'} {item.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-median-taupe/20 pt-4 flex flex-col items-end gap-1 text-xs">
                <div className="flex justify-between w-56 text-median-taupe">
                  <span>Subtotal:</span>
                  <span>
                    {selectedBillingDoc.currency || 'LKR'} {selectedBillingDoc.subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between w-56 text-median-taupe">
                  <span>Tax:</span>
                  <span>
                    {selectedBillingDoc.currency || 'LKR'} {selectedBillingDoc.tax.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between w-56 font-bold text-sm text-black pt-2 border-t border-median-taupe/20">
                  <span>Total Amount:</span>
                  <span className="font-oswald text-lg text-median-taupe">
                    {selectedBillingDoc.currency || 'LKR'} {selectedBillingDoc.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {selectedBillingDoc.notes && (
              <div className="p-4 rounded-xl bg-median-taupe/5 border border-median-taupe/20 text-xs text-median-taupe mb-6">
                <strong className="text-black">Voucher Notes:</strong> {selectedBillingDoc.notes}
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-median-taupe/20">
              <span className="text-xs text-median-taupe">
                Status: <strong className="uppercase text-black">{selectedBillingDoc.status}</strong>
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => downloadBillingVoucherHtml(selectedBillingDoc)}
                  className="px-4 py-2 rounded-xl border border-median-taupe text-black hover:border-black font-oswald text-xs uppercase tracking-wider transition-colors"
                >
                  ↓ Download (.html)
                </button>
                <button
                  type="button"
                  onClick={() => printBillingVoucherPdf(selectedBillingDoc)}
                  className="px-5 py-2 rounded-xl bg-black text-white font-oswald text-xs uppercase tracking-wider hover:bg-median-taupe transition-colors"
                >
                  Print / Save PDF ↗
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* MONO Living Spatial AI Companion (Admin Executive Copilot) */}
      <MonoCompanion
        role="admin"
        activeTab={activeTab}
        onNavigateTab={(tab) => handleSelectTab(tab as AdminTabId)}
        suggestions={monoSuggestions}
        userName={user?.full_name || 'Dulanja Abeysinghe'}
        celebrateTrigger={monoCelebrateCount}
      />
    </div>
  );
};
