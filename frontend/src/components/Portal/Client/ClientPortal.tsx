import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  UserProfile,
  PortalProject,
  MeetingRequest,
  ProjectRequest,
  BillingDocument,
  CustomerReview,
  ProjectPaymentPlan,
} from '../../../lib/portalStore';
import { portalApi } from '../../../lib/portalApi';
import { downloadBillingVoucherHtml, printBillingVoucherPdf } from '../../../lib/invoiceDownloader';
import { ClientPaymentsTab } from './ClientPaymentsTab';
import { SystemHeartbeatMonitor } from '../SystemHeartbeatMonitor';
import { ScrollReveal, RevealVariant } from '../../MedianStudio/ScrollReveal';
import { usePwaInstall } from '../../../lib/usePwaInstall';

const getExpiryBadge = (dateStr?: string) => {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: `Expired ${Math.abs(diffDays)}d ago`, cls: 'bg-red-100 text-red-800 border-red-300' };
  if (diffDays <= 30) return { label: `Renew in ${diffDays}d`, cls: 'bg-amber-100 text-amber-800 border-amber-300' };
  return { label: `Active · ${diffDays}d left`, cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
};

interface ClientPortalProps {
  navigate: (route: string) => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({ navigate }) => {
  const { user, logout, isLiveAuth, previewClient, setPreviewClient } = useAuth();
  const { canInstall, promptInstall } = usePwaInstall();
  const isAdminPreview = user?.role === 'admin';
  const [previewClients, setPreviewClients] = useState<UserProfile[]>([]);
  const activeClient = isAdminPreview ? previewClient || previewClients[0] || null : user;
  const [activeTab, setActiveTab] = useState<'projects' | 'payments' | 'request' | 'meetings' | 'billing' | 'reviews' | 'security'>('projects');
  const [isLiveDb, setIsLiveDb] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Client Data States
  const [projects, setProjects] = useState<PortalProject[]>([]);
  const [paymentPlans, setPaymentPlans] = useState<ProjectPaymentPlan[]>([]);
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [meetings, setMeetings] = useState<MeetingRequest[]>([]);
  const [billingDocs, setBillingDocs] = useState<BillingDocument[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [selectedBillingDoc, setSelectedBillingDoc] = useState<BillingDocument | null>(null);

  // New Project Request Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Custom Software Engineering');
  const [newBudget, setNewBudget] = useState('LKR 500,000 - 1,500,000');
  const [newTimeline, setNewTimeline] = useState('Q1 2027');
  const [newScope, setNewScope] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // New Meeting Scheduler State
  const [meetDate, setMeetDate] = useState('');
  const [meetTime, setMeetTime] = useState('14:30');
  const [meetType, setMeetType] = useState<MeetingRequest['meeting_type']>('Sprint Review');
  const [meetAgenda, setMeetAgenda] = useState('');
  const [meetingBooked, setMeetingBooked] = useState(false);

  // Client Review Form State
  const [revRating, setRevRating] = useState(5);
  const [revTitle, setRevTitle] = useState('');
  const [revText, setRevText] = useState('');
  const [revSubmitted, setRevSubmitted] = useState(false);

  // Security / Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Load client directory when an Admin opens Client Preview Mode
  useEffect(() => {
    if (!isAdminPreview) return;
    let cancelled = false;
    portalApi.getClients().then(({ data }) => {
      if (cancelled) return;
      const clientList = data.filter((u) => u.role === 'client');
      setPreviewClients(clientList);
      if (!previewClient && clientList.length > 0) {
        setPreviewClient(clientList[0]);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isAdminPreview, previewClient, setPreviewClient]);

  const loadClientData = useCallback(async () => {
    if (!activeClient?.id) return;
    setIsLoadingData(true);
    try {
      const [projRes, payRes, reqRes, meetRes, billRes, revRes] = await Promise.all([
        portalApi.getProjects(activeClient.id),
        portalApi.getPaymentPlans(activeClient.id),
        portalApi.getProjectRequests(activeClient.id),
        portalApi.getMeetings(activeClient.id),
        portalApi.getBillingDocuments(activeClient.id),
        portalApi.getReviews(true),
      ]);
      setProjects(projRes.data);
      setPaymentPlans(payRes.data);
      setRequests(reqRes.data);
      setMeetings(meetRes.data);
      setBillingDocs(billRes.data);
      // Filter reviews relevant to this client
      const myReviews = revRes.data.filter(
        (r) =>
          (activeClient.company_name &&
            r.company_name?.toLowerCase().includes(activeClient.company_name.toLowerCase())) ||
          r.client_name?.toLowerCase() === activeClient.full_name?.toLowerCase()
      );
      setReviews(myReviews);
      setIsLiveDb(projRes.live || isLiveAuth);
    } finally {
      setIsLoadingData(false);
    }
  }, [activeClient, isLiveAuth]);

  useEffect(() => {
    loadClientData();
  }, [loadClientData]);

  const handleLogout = async () => {
    await logout();
    navigate('/portal/login');
  };

  const handleCreateProjectRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newScope || !user) return;

    const { request } = await portalApi.submitProjectRequest({
      client_id: user.id,
      client_name: user.company_name || user.full_name,
      project_title: newTitle,
      service_category: newCategory,
      estimated_budget: newBudget,
      target_timeline: newTimeline,
      project_scope: newScope,
    });

    setRequests([request, ...requests]);
    setRequestSubmitted(true);
    setNewTitle('');
    setNewScope('');
    setTimeout(() => setRequestSubmitted(false), 5000);
  };

  const handleBookMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetDate || !meetAgenda || !user) return;

    const { meeting } = await portalApi.scheduleMeeting({
      client_id: user.id,
      client_name: user.company_name || user.full_name,
      requested_date: meetDate,
      requested_time: meetTime,
      timezone: 'Asia/Colombo (UTC+5:30)',
      meeting_type: meetType,
      agenda: meetAgenda,
    });

    setMeetings([meeting, ...meetings]);
    setMeetingBooked(true);
    setMeetAgenda('');
    setTimeout(() => setMeetingBooked(false), 5000);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revText || !user) return;
    try {
      const { review } = await portalApi.addReview({
        client_name: user.full_name,
        client_title: revTitle || 'Managing Director',
        company_name: user.company_name || 'Enterprise Client',
        rating: revRating,
        review_text: revText,
        is_featured: true,
      });
      setReviews([review, ...reviews]);
      setRevSubmitted(true);
      setRevText('');
      setRevTitle('');
      setTimeout(() => setRevSubmitted(false), 5000);
    } catch (err: any) {
      alert(`Error submitting review: ${err.message}`);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg('✕ Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg('✕ Passwords do not match. Please re-enter.');
      return;
    }
    setIsUpdatingPassword(true);
    setPasswordMsg(null);
    try {
      await portalApi.changeMyPassword(newPassword);
      setPasswordMsg('✓ Passkey updated successfully. You can use this password on your next sign in.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMsg(`✕ Update error: ${err.message || 'Failed to update passkey'}`);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-black font-inter selection:bg-median-taupe selection:text-white pb-24">
      {/* Admin Client Preview Bar (Only visible when an Admin previews a client's portal) */}
      {isAdminPreview && (
        <div className="bg-black text-white px-4 sm:px-6 md:px-12 py-2.5 border-b border-white/15">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full bg-median-taupe text-white text-[10px] font-bold uppercase tracking-wider">
                Admin Preview Mode
              </span>
              <span className="text-white/75 hidden sm:inline">Inspecting strictly isolated portal for:</span>
              <select
                value={activeClient?.id || ''}
                onChange={(e) => {
                  const chosen = previewClients.find((c) => c.id === e.target.value) || null;
                  setPreviewClient(chosen);
                }}
                className="px-3 py-1 rounded-lg bg-white/10 border border-white/25 text-white text-xs font-mono focus:outline-none focus:border-median-taupe"
              >
                {previewClients.length === 0 ? (
                  <option value="" className="text-black">Loading clients...</option>
                ) : (
                  previewClients.map((c) => (
                    <option key={c.id} value={c.id} className="text-black">
                      {c.company_name || c.full_name} ({c.email})
                    </option>
                  ))
                )}
              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                setPreviewClient(null);
                navigate('/portal/admin');
              }}
              className="px-3.5 py-1 rounded-lg bg-white text-black hover:bg-median-taupe hover:text-white font-bold uppercase text-[10px] tracking-wider transition-colors"
            >
              ← Return to Admin Portal
            </button>
          </div>
        </div>
      )}

      {/* Top Haute Editorial VIP Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-median-taupe/20 px-4 sm:px-6 md:px-12 py-3.5 sm:py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center justify-between md:justify-start gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 group focus:outline-none"
              >
                <span className="w-4 h-4 bg-black flex items-center justify-center text-white text-[9px] font-bold">
                  ■
                </span>
                <span className="font-oswald text-lg sm:text-xl font-bold tracking-[0.2em] text-black uppercase group-hover:text-median-taupe transition-colors">
                  MONOLITH<span className="text-median-taupe ml-1">LK</span>
                </span>
              </button>
              <span className="text-median-taupe/40 font-mono text-sm">/</span>
              <span className="font-mono text-[11px] sm:text-xs uppercase tracking-wider text-median-taupe font-semibold">
                Client Portal
              </span>
            </div>
          </div>

          {/* User profile & actions */}
          <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-4 text-xs font-mono">
            <div className="text-left sm:text-right truncate max-w-[160px] sm:max-w-none">
              <span className="font-bold text-black block truncate">{activeClient?.company_name || activeClient?.full_name}</span>
              <span className="text-median-taupe/70 text-[10px] hidden sm:block">{activeClient?.email}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {canInstall && (
                <button
                  onClick={promptInstall}
                  className="px-3 py-1.5 rounded-lg border border-median-taupe bg-median-taupe/10 text-black hover:bg-median-taupe hover:text-white transition-colors font-semibold"
                >
                  + Install App
                </button>
              )}
              <button
                onClick={() => navigate('/')}
                className="px-3 py-1.5 rounded-lg border border-median-taupe/30 hover:border-black text-black transition-colors"
              >
                Public Site
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg border border-black bg-black text-white hover:bg-median-taupe hover:border-median-taupe transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Hub Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-6 sm:pt-8">
        {/* Welcome Greeting Banner with Haute Editorial Entrance */}
        <ScrollReveal variant="blur-focus" duration={800} once>
          <div className="mb-8 p-6 sm:p-8 rounded-2xl bg-white border border-median-taupe/20 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <ScrollReveal variant="badge-drop" delay={80} duration={700} once>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-median-taupe/30 bg-median-taupe/5 text-[10px] font-mono uppercase tracking-widest text-median-taupe mb-2">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${isLiveDb ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span>
                    {isLoadingData
                      ? 'Synchronizing Cluster...'
                      : isLiveDb
                      ? 'Live Supabase DB Sync · Nominal (99.98% SLA)'
                      : 'Monolith LK Portal · Local Cache'}
                  </span>
                </div>
              </ScrollReveal>
              <ScrollReveal variant="split-mask" delay={140} duration={750} once>
                <h1 className="font-oswald text-3xl sm:text-4xl font-bold uppercase tracking-tight text-black">
                  Welcome, {activeClient?.company_name || activeClient?.full_name}
                </h1>
              </ScrollReveal>
              <ScrollReveal variant="fade-up" delay={200} duration={700} once>
                <p className="text-xs sm:text-sm text-median-taupe/80 mt-1 max-w-xl">
                  Track real-time engineering milestones, payment packages, project deliverables vault, and coordinate directly with Monolith LK.
                </p>
              </ScrollReveal>
            </div>

            <ScrollReveal variant="horizontal-slide-right" delay={180} duration={750} once>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTab('payments')}
                  className="px-5 py-2.5 rounded-xl bg-black text-white font-oswald text-sm uppercase tracking-wider hover:bg-median-taupe transition-colors"
                >
                  Payment Progress →
                </button>
                <button
                  onClick={() => setActiveTab('meetings')}
                  className="px-5 py-2.5 rounded-xl border border-median-taupe text-black font-oswald text-sm uppercase tracking-wider hover:bg-median-taupe hover:text-white transition-colors"
                >
                  Book Session
                </button>
              </div>
            </ScrollReveal>
          </div>
        </ScrollReveal>

        {/* Portal Tabs Bar */}
        <div className="flex border-b border-median-taupe/20 mb-8 overflow-x-auto no-scrollbar gap-3 sm:gap-6 font-oswald text-sm sm:text-base uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('projects')}
            className={`py-3 px-2 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'projects'
                ? 'border-black text-black font-bold'
                : 'border-transparent text-median-taupe/60 hover:text-black'
            }`}
          >
            <span>Active Projects</span>
            <span className="w-5 h-5 rounded-full bg-median-taupe/10 text-median-taupe text-[10px] font-mono font-bold flex items-center justify-center">
              {projects.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`py-3 px-2 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'payments'
                ? 'border-black text-black font-bold'
                : 'border-transparent text-median-taupe/60 hover:text-black'
            }`}
          >
            <span>Payments & Packages</span>
            <span className="w-5 h-5 rounded-full bg-median-taupe/10 text-median-taupe text-[10px] font-mono font-bold flex items-center justify-center">
              {paymentPlans.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('request')}
            className={`py-3 px-2 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'request'
                ? 'border-black text-black font-bold'
                : 'border-transparent text-median-taupe/60 hover:text-black'
            }`}
          >
            <span>Request Project</span>
          </button>

          <button
            onClick={() => setActiveTab('meetings')}
            className={`py-3 px-2 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'meetings'
                ? 'border-black text-black font-bold'
                : 'border-transparent text-median-taupe/60 hover:text-black'
            }`}
          >
            <span>Meetings</span>
            {meetings.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-median-taupe/10 text-median-taupe text-[10px] font-mono font-bold flex items-center justify-center">
                {meetings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`py-3 px-2 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'billing'
                ? 'border-black text-black font-bold'
                : 'border-transparent text-median-taupe/60 hover:text-black'
            }`}
          >
            <span>Invoices & Quotations</span>
            <span className="w-5 h-5 rounded-full bg-median-taupe/10 text-median-taupe text-[10px] font-mono font-bold flex items-center justify-center">
              {billingDocs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-2 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'reviews'
                ? 'border-black text-black font-bold'
                : 'border-transparent text-median-taupe/60 hover:text-black'
            }`}
          >
            <span>Reviews</span>
            {reviews.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-median-taupe/10 text-median-taupe text-[10px] font-mono font-bold flex items-center justify-center">
                {reviews.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 px-2 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'security'
                ? 'border-black text-black font-bold'
                : 'border-transparent text-median-taupe/60 hover:text-black'
            }`}
          >
            <span>Security & Passkey</span>
          </button>
        </div>

        {/* ================= TAB 1: ACTIVE PROJECTS & MILESTONES ================= */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            {isLoadingData && projects.length === 0 ? (
              <div className="space-y-6 animate-pulse">
                {[1, 2].map((sk) => (
                  <div key={sk} className="p-6 sm:p-8 rounded-2xl bg-white border border-median-taupe/15 space-y-5">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 w-2/3">
                        <div className="h-3 w-28 bg-median-taupe/20 rounded-full" />
                        <div className="h-7 w-3/4 bg-median-taupe/25 rounded-lg" />
                      </div>
                      <div className="h-7 w-24 bg-median-taupe/20 rounded-full" />
                    </div>
                    <div className="h-3 w-full bg-median-taupe/15 rounded-full" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="h-12 bg-median-taupe/10 rounded-xl" />
                      <div className="h-12 bg-median-taupe/10 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <ScrollReveal variant="fade-up" duration={750} once>
                <div className="p-12 text-center rounded-2xl bg-white border border-median-taupe/20">
                  <p className="font-oswald text-xl uppercase text-black mb-2">No Active Projects Dispatched Yet</p>
                  <p className="text-xs text-median-taupe/80 max-w-md mx-auto mb-6">
                    You do not have any live engineering contracts active. Submit a project scope to initiate architecture discovery.
                  </p>
                  <button
                    onClick={() => setActiveTab('request')}
                    className="px-6 py-3 rounded-xl bg-black text-white font-oswald uppercase tracking-wider text-xs hover:bg-median-taupe transition-colors"
                  >
                    Commission Initial Project
                  </button>
                </div>
              </ScrollReveal>
            ) : (
              projects.map((proj, pIdx) => {
                const projVariants: RevealVariant[] = ['card-lift', 'card-flip-left', 'card-flip-right'];
                const hasVaultData = Boolean(
                  proj.production_url ||
                    proj.staging_url ||
                    proj.figma_url ||
                    proj.api_docs_url ||
                    proj.domain_renewal_date ||
                    proj.server_expiry_date ||
                    proj.vault_notes
                );
                const domainBadge = getExpiryBadge(proj.domain_renewal_date);
                const serverBadge = getExpiryBadge(proj.server_expiry_date);

                return (
                  <ScrollReveal
                    key={proj.id}
                    variant={projVariants[pIdx % projVariants.length]}
                    delay={pIdx * 110}
                    duration={850}
                    once
                  >
                    <div className="p-5 sm:p-8 rounded-2xl bg-white border border-median-taupe/20 hover:border-median-taupe shadow-sm hover:shadow-lg transition-all duration-300">
                  {/* Project Header Row */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-median-taupe/15">
                    <div>
                      <div className="flex items-center gap-2.5 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full border border-median-taupe/40 bg-median-taupe/5 text-[10px] font-mono uppercase tracking-wider text-median-taupe font-bold">
                          {proj.code_name}
                        </span>
                        <span className="text-xs font-mono uppercase text-median-taupe/80">
                          {proj.category}
                        </span>
                      </div>
                      <h2 className="font-oswald text-2xl sm:text-3xl font-bold uppercase tracking-tight text-black">
                        {proj.title}
                      </h2>
                    </div>

                    {/* Status Pill */}
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                          proj.status === 'deployed'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : proj.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        ● {proj.status.replace('_', ' ')}
                      </span>
                      {proj.staging_url && (
                        <a
                          href={proj.staging_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 rounded-xl border border-black text-black hover:bg-black hover:text-white text-xs font-mono uppercase font-semibold transition-colors flex items-center gap-1"
                        >
                          <span>Staging</span>
                          <span>↗</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Summary & Progress Meter */}
                  <div className="py-6 border-b border-median-taupe/15">
                    <p className="text-xs sm:text-sm text-black/80 mb-6 leading-relaxed">
                      {proj.summary}
                    </p>

                    <div>
                      <div className="flex justify-between items-center text-xs font-mono uppercase mb-2">
                        <span className="font-bold text-black">Engineering Velocity & Delivery Status</span>
                        <span className="text-median-taupe font-bold text-sm">{proj.progress_percentage}% COMPLETED</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-median-taupe/10 overflow-hidden">
                        <div
                          className="h-full bg-median-taupe rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${proj.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Milestones Checklist */}
                  <div className="pt-6">
                    <h3 className="font-oswald text-sm font-bold uppercase tracking-wider text-black mb-4">
                      Project Milestones & Deliverables
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {proj.milestones.map((m) => (
                        <div
                          key={m.id}
                          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-mono ${
                            m.is_completed
                              ? 'bg-emerald-50/50 border-emerald-200 text-black'
                              : 'bg-white border-median-taupe/20 text-median-taupe'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                m.is_completed
                                  ? 'bg-emerald-600 text-white'
                                  : 'border border-median-taupe/50 text-median-taupe'
                              }`}
                            >
                              {m.is_completed ? '✓' : '○'}
                            </span>
                            <span className={m.is_completed ? 'font-semibold' : ''}>{m.title}</span>
                          </div>
                          {m.due_date && (
                            <span className="text-[10px] text-median-taupe/70">{m.due_date}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Protected Project Deliverables & Infrastructure Vault */}
                  {hasVaultData && (
                    <div className="mt-6 pt-5 border-t border-median-taupe/15 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-oswald text-sm font-bold uppercase tracking-wider text-black flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>Project Deliverables &amp; Infrastructure Vault</span>
                        </h3>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe">
                          Managed by Monolith LK
                        </span>
                      </div>

                      {/* Live System Heartbeat Telemetry Monitor (tied to actual production_url) */}
                      {proj.production_url && (
                        <SystemHeartbeatMonitor
                          projectId={proj.id}
                          productionUrl={proj.production_url}
                          variant="vault"
                        />
                      )}

                      {/* Asset Quick-Access Links */}
                      {(proj.production_url || proj.staging_url || proj.figma_url || proj.api_docs_url) && (
                        <div className="flex flex-wrap gap-2">
                          {proj.production_url && (
                            <a
                              href={proj.production_url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3.5 py-2 rounded-xl bg-black text-white hover:bg-median-taupe text-xs font-mono uppercase font-semibold transition-colors inline-flex items-center gap-1.5"
                            >
                              <span>Live Production</span>
                              <span>↗</span>
                            </a>
                          )}
                          {proj.staging_url && (
                            <a
                              href={proj.staging_url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3.5 py-2 rounded-xl border border-black text-black hover:bg-black hover:text-white text-xs font-mono uppercase font-semibold transition-colors inline-flex items-center gap-1.5"
                            >
                              <span>Staging Preview</span>
                              <span>↗</span>
                            </a>
                          )}
                          {proj.figma_url && (
                            <a
                              href={proj.figma_url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3.5 py-2 rounded-xl border border-median-taupe/40 bg-[#FAF8F5] text-black hover:border-black text-xs font-mono uppercase font-semibold transition-colors inline-flex items-center gap-1.5"
                            >
                              <span>Figma Design Vault</span>
                              <span>↗</span>
                            </a>
                          )}
                          {proj.api_docs_url && (
                            <a
                              href={proj.api_docs_url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3.5 py-2 rounded-xl border border-median-taupe/40 bg-[#FAF8F5] text-black hover:border-black text-xs font-mono uppercase font-semibold transition-colors inline-flex items-center gap-1.5"
                            >
                              <span>API &amp; Technical Docs</span>
                              <span>↗</span>
                            </a>
                          )}
                        </div>
                      )}

                      {/* Domain & Server Renewal Timers */}
                      {(proj.domain_renewal_date || proj.server_expiry_date) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                          {proj.domain_renewal_date && (
                            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-median-taupe/20 flex items-center justify-between gap-2">
                              <div>
                                <span className="text-[10px] uppercase text-median-taupe block">Domain Renewal Date</span>
                                <strong className="font-oswald text-base text-black">{proj.domain_renewal_date}</strong>
                              </div>
                              {domainBadge && (
                                <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase ${domainBadge.cls}`}>
                                  {domainBadge.label}
                                </span>
                              )}
                            </div>
                          )}
                          {proj.server_expiry_date && (
                            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-median-taupe/20 flex items-center justify-between gap-2">
                              <div>
                                <span className="text-[10px] uppercase text-median-taupe block">Server / Cloud Expiry</span>
                                <strong className="font-oswald text-base text-black">{proj.server_expiry_date}</strong>
                              </div>
                              {serverBadge && (
                                <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase ${serverBadge.cls}`}>
                                  {serverBadge.label}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {proj.vault_notes && (
                        <div className="p-3 rounded-xl bg-median-taupe/5 border border-median-taupe/15 text-[11px] font-mono text-black/80">
                          <strong className="text-median-taupe uppercase">Infrastructure &amp; SLA Notes:</strong> {proj.vault_notes}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Per-Project Payment Progress Summary Strip */}
                  {(() => {
                    const projPlans = paymentPlans.filter((pl) => pl.project_id === proj.id);
                    if (projPlans.length === 0) return null;
                    return (
                      <div className="mt-6 pt-5 border-t border-median-taupe/15 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="font-oswald text-sm font-bold uppercase tracking-wider text-black">
                            Project Payment Progress
                          </h3>
                          <button
                            type="button"
                            onClick={() => setActiveTab('payments')}
                            className="text-[11px] font-mono font-bold uppercase text-median-taupe hover:text-black underline transition-colors"
                          >
                            View Full Payment Ledger →
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {projPlans.map((pl) => {
                            const paid = (pl.payments || []).reduce((s, r) => s + Number(r.amount || 0), 0);
                            const remaining = pl.billing_type === 'monthly' ? 0 : Math.max(0, pl.total_amount - paid);
                            const pct =
                              pl.billing_type === 'monthly'
                                ? 100
                                : pl.total_amount > 0
                                ? Math.min(100, Math.round((paid / pl.total_amount) * 100))
                                : 0;
                            return (
                              <div
                                key={pl.id}
                                className="p-4 rounded-xl bg-[#FAF8F5] border border-median-taupe/20 space-y-2 text-xs font-mono"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-1">
                                  <strong className="font-oswald text-sm uppercase text-black">{pl.package_name}</strong>
                                  <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-white border border-median-taupe/25 text-median-taupe font-bold">
                                    {pl.billing_type === 'monthly'
                                      ? `${pl.currency} ${pl.installment_amount.toLocaleString()}/mo`
                                      : `${pct}% Paid`}
                                  </span>
                                </div>
                                {pl.billing_type !== 'monthly' && (
                                  <div className="w-full h-2 rounded-full bg-median-taupe/15 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-700 ${
                                        pct >= 100 ? 'bg-emerald-600' : 'bg-median-taupe'
                                      }`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                )}
                                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                                  <span className="text-emerald-700 font-semibold">
                                    Paid: {pl.currency} {paid.toLocaleString()}
                                  </span>
                                  {pl.billing_type !== 'monthly' ? (
                                    <span className="text-black font-semibold">
                                      Needed: {pl.currency} {remaining.toLocaleString()}
                                    </span>
                                  ) : (
                                    <span className="text-median-taupe">
                                      {pl.payments.length} cycle{pl.payments.length === 1 ? '' : 's'} cleared
                                    </span>
                                  )}
                                  {pl.next_due_date && pl.status !== 'completed' && (
                                    <span className="text-median-taupe">Due: {pl.next_due_date}</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                    </div>
                  </ScrollReveal>
                );
              })
            )}
          </div>
        )}

        {/* ================= TAB 1B: PAYMENTS & PACKAGES ================= */}
        {activeTab === 'payments' && (
          <ClientPaymentsTab
            paymentPlans={paymentPlans}
            projects={projects}
            billingDocs={billingDocs}
            onViewInvoice={(doc) => setSelectedBillingDoc(doc)}
          />
        )}

        {/* ================= TAB 2: REQUEST NEW PROJECT ================= */}
        {activeTab === 'request' && (
          <div className="max-w-3xl mx-auto">
            <ScrollReveal variant="card-lift" duration={800} once>
            <div className="p-6 sm:p-10 rounded-2xl bg-white border border-median-taupe/20 shadow-sm">
              <div className="mb-6">
                <span className="text-xs font-mono uppercase tracking-widest text-median-taupe font-semibold block mb-1">
                  Commissioning Desk
                </span>
                <h2 className="font-oswald text-2xl sm:text-3xl font-bold uppercase text-black">
                  Request New Engineering Project
                </h2>
                <p className="text-xs text-median-taupe/80 mt-1">
                  Submit scope requirements. Our Principal Systems Architect will review throughput, infrastructure topology, and reply with itemized quotations.
                </p>
              </div>

              {requestSubmitted && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono">
                  ✓ Project request successfully received! Assigned to Monolith LK Review Queue. We will follow up via email and the portal.
                </div>
              )}

              <form onSubmit={handleCreateProjectRequest} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5 font-mono">
                    Project Working Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Next-Gen Contactless Payments Bridge"
                    className="w-full px-4 py-3 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5 font-mono">
                      Service Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                    >
                      <option>Custom Software Engineering</option>
                      <option>AI, Data, & Machine Learning</option>
                      <option>Cloud Infrastructure & DevOps</option>
                      <option>Cybersecurity & Risk Management</option>
                      <option>Managed IT & SLA Telemetry</option>
                      <option>Strategy, UI/UX, & Consulting</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5 font-mono">
                      Estimated Budget Window (LKR)
                    </label>
                    <select
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                    >
                      <option>LKR 250,000 - 500,000</option>
                      <option>LKR 500,000 - 1,500,000</option>
                      <option>LKR 1,500,000 - 3,500,000</option>
                      <option>LKR 3,500,000+ (Enterprise)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5 font-mono">
                    Target Delivery Quarter / Date
                  </label>
                  <input
                    type="text"
                    value={newTimeline}
                    onChange={(e) => setNewTimeline(e.target.value)}
                    placeholder="e.g. End of Q1 2027 or Mid-December"
                    className="w-full px-4 py-3 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5 font-mono">
                    Detailed Scope & Project Objectives *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={newScope}
                    onChange={(e) => setNewScope(e.target.value)}
                    placeholder="Describe specific features, database transaction volumes, integrations (e.g. Stripe, Redis, Webhooks), and compliance requirements..."
                    className="w-full px-4 py-3 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-black text-white font-oswald text-base uppercase tracking-widest hover:bg-median-taupe transition-colors"
                >
                  Submit Commission Request →
                </button>
              </form>
            </div>
            </ScrollReveal>

            {/* Past Requests History */}
            {requests.length > 0 && (
              <div className="mt-8 p-6 rounded-2xl bg-white border border-median-taupe/20">
                <h3 className="font-oswald text-lg font-bold uppercase text-black mb-4">
                  Past Project Requests
                </h3>
                <div className="space-y-3">
                  {requests.map((r) => (
                    <div
                      key={r.id}
                      className="p-4 rounded-xl border border-median-taupe/15 bg-median-taupe/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                    >
                      <div>
                        <span className="font-bold text-black block text-sm">{r.project_title}</span>
                        <span className="text-median-taupe/70">{r.service_category} · Budget: {r.estimated_budget}</span>
                      </div>
                      <span className="px-3 py-1 rounded-full border border-median-taupe/30 bg-white font-bold uppercase text-[10px]">
                        {r.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: SCHEDULE MEETING ================= */}
        {activeTab === 'meetings' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <ScrollReveal variant="card-flip-left" duration={800} once className="lg:col-span-6">
            <div className="p-6 sm:p-10 rounded-2xl bg-white border border-median-taupe/20 shadow-sm h-full">
              <div className="mb-6">
                <span className="text-xs font-mono uppercase tracking-widest text-median-taupe font-semibold block mb-1">
                  Architecture & Sprint Sync
                </span>
                <h2 className="font-oswald text-2xl font-bold uppercase text-black">
                  Schedule Direct Consultation
                </h2>
                <p className="text-xs text-median-taupe/80 mt-1">
                  Coordinate directly with Dulanja Abeysinghe (Principal Systems Architect) or Remashi Diyana (Head of Strategy).
                </p>
              </div>

              {meetingBooked && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono">
                  ✓ Consultation scheduled! Our team will confirm the video conference link shortly.
                </div>
              )}

              <form onSubmit={handleBookMeeting} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5 font-mono">
                    Consultation Type
                  </label>
                  <select
                    value={meetType}
                    onChange={(e) => setMeetType(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                  >
                    <option>Discovery Call</option>
                    <option>Sprint Review</option>
                    <option>Architecture Consultation</option>
                    <option>Emergency Triage</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5 font-mono">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={meetDate}
                      onChange={(e) => setMeetDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5 font-mono">
                      Time Slot (UTC+5:30)
                    </label>
                    <select
                      value={meetTime}
                      onChange={(e) => setMeetTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                    >
                      <option value="10:00">10:00 AM (Morning Sync)</option>
                      <option value="11:30">11:30 AM (Sprint Review)</option>
                      <option value="14:30">02:30 PM (Architecture Triage)</option>
                      <option value="16:00">04:00 PM (Executive Strategy)</option>
                      <option value="18:30">06:30 PM (Evening Deep Dive)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1.5 font-mono">
                    Agenda & Discussion Points *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={meetAgenda}
                    onChange={(e) => setMeetAgenda(e.target.value)}
                    placeholder="Specify the topics you wish to review during this session..."
                    className="w-full px-4 py-3 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-black text-white font-oswald text-sm uppercase tracking-widest hover:bg-median-taupe transition-colors"
                >
                  Confirm Meeting Request →
                </button>
              </form>
            </div>
            </ScrollReveal>

            {/* Scheduled Meetings List */}
            <ScrollReveal variant="card-flip-right" delay={120} duration={800} once className="lg:col-span-6 space-y-4">
              <h3 className="font-oswald text-xl font-bold uppercase text-black">
                Upcoming & Past Consultations
              </h3>
              {meetings.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white border border-median-taupe/20 text-center text-xs font-mono text-median-taupe">
                  No consultations booked yet.
                </div>
              ) : (
                meetings.map((m) => (
                  <div
                    key={m.id}
                    className="p-6 rounded-2xl bg-white border border-median-taupe/20 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-median-taupe font-bold block">
                          {m.meeting_type}
                        </span>
                        <h4 className="font-oswald text-lg font-bold uppercase text-black">
                          {m.requested_date} @ {m.requested_time} ({m.timezone.split(' ')[0]})
                        </h4>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                          m.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>

                    <p className="text-xs text-black/80 font-mono mb-4 bg-median-taupe/5 p-3 rounded-lg border border-median-taupe/15">
                      {m.agenda}
                    </p>

                    {m.meeting_link && (
                      <a
                        href={m.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white text-xs font-mono uppercase hover:bg-median-taupe transition-colors"
                      >
                        <span>Join Video Room</span>
                        <span>↗</span>
                      </a>
                    )}
                  </div>
                ))
              )}
            </ScrollReveal>
          </div>
        )}

        {/* ================= TAB 4: BILLING & INVOICES ================= */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <ScrollReveal variant="split-mask" duration={750} once>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-oswald text-2xl sm:text-3xl font-bold uppercase text-black">
                    Invoices &amp; Quotations
                  </h2>
                  <p className="text-xs text-median-taupe/80">
                    Itemized billing records and formal quotations issued to {user?.company_name}.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {billingDocs.length === 0 ? (
              <ScrollReveal variant="fade-up" duration={750} once>
                <div className="p-12 text-center rounded-2xl bg-white border border-median-taupe/20 text-xs font-mono text-median-taupe">
                  No billing vouchers or quotations issued yet.
                </div>
              </ScrollReveal>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {billingDocs.map((doc, idx) => (
                  <ScrollReveal
                    key={doc.id}
                    variant={idx % 2 === 0 ? 'card-flip-left' : 'card-flip-right'}
                    delay={(idx % 2) * 110}
                    duration={800}
                    once
                    className="h-full"
                  >
                  <div
                    className="p-6 rounded-2xl bg-white border border-median-taupe/20 hover:border-median-taupe shadow-sm hover:shadow-lg transition-all flex flex-col justify-between h-full"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe font-bold">
                              {doc.type.toUpperCase()}
                            </span>
                            {doc.type === 'invoice' && (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${
                                  doc.billing_scope === 'project_cover'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-[#FAF8F5] text-median-taupe border-median-taupe/25'
                                }`}
                              >
                                {doc.billing_scope === 'project_cover' ? 'Project Cover-Up' : 'Separate Charge'}
                              </span>
                            )}
                          </div>
                          <h3 className="font-oswald text-2xl font-bold uppercase text-black">
                            {doc.document_number}
                          </h3>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                            doc.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : doc.status === 'approved'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {doc.status}
                        </span>
                      </div>

                      {doc.project_title && (
                        <div className="text-xs font-mono text-black font-semibold mb-2">
                          Project: {doc.project_title}
                        </div>
                      )}

                      <div className="text-xs text-median-taupe/70 font-mono mb-4">
                        Due Date: {doc.due_date} · Issued: {new Date(doc.created_at).toLocaleDateString()}
                      </div>

                      {/* Items Preview */}
                      <div className="space-y-1.5 mb-6 border-t border-median-taupe/15 pt-3">
                        {doc.line_items.map((item) => (
                          <div key={item.id} className="flex justify-between text-xs font-mono">
                            <span className="text-black/80 truncate max-w-[220px]">{item.description}</span>
                            <span className="font-semibold text-black">
                              {doc.currency || 'LKR'} {item.total.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-median-taupe/15 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-median-taupe block">Total Amount</span>
                        <span className="font-oswald text-2xl font-bold text-median-taupe">
                          {doc.currency || 'LKR'} {doc.total.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => downloadBillingVoucherHtml(doc)}
                          title="Download Official Voucher File (.html)"
                          className="px-3 py-2 rounded-xl border border-median-taupe/40 text-black hover:border-black text-xs font-mono uppercase font-semibold transition-colors flex items-center gap-1"
                        >
                          <span>↓ Download</span>
                        </button>
                        <button
                          onClick={() => setSelectedBillingDoc(doc)}
                          className="px-4 py-2 rounded-xl border border-black text-black hover:bg-black hover:text-white text-xs font-mono uppercase font-semibold transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 5: TESTIMONIALS & REVIEWS ================= */}
        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Submit Review Form */}
            <ScrollReveal variant="card-flip-left" duration={800} once className="lg:col-span-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-median-taupe/20 shadow-sm space-y-6 h-full">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe font-bold block mb-1">
                  Public Architectural Accreditation
                </span>
                <h3 className="font-oswald text-2xl font-bold uppercase text-black">
                  Submit Client Testimonial
                </h3>
                <p className="text-xs text-median-taupe/80 mt-1">
                  Share your experience working with Monolith LK. Approved reviews are displayed on the public website homepage and client portfolio.
                </p>
              </div>

              {revSubmitted && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono font-semibold">
                  ✓ Thank you! Your testimonial has been submitted and published to the Monolith LK network.
                </div>
              )}

              <form onSubmit={handleSubmitReview} className="space-y-4 text-xs font-mono">
                {/* Auto-filled Client Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-median-taupe/5 border border-median-taupe/15">
                  <div>
                    <span className="text-[10px] uppercase text-median-taupe block">Client Executive</span>
                    <strong className="text-black text-xs font-mono">{user?.full_name}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-median-taupe block">Enterprise Partner</span>
                    <strong className="text-black text-xs font-mono">{user?.company_name || 'Enterprise Client'}</strong>
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase text-black mb-1.5">
                    Your Title / Executive Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={revTitle}
                    onChange={(e) => setRevTitle(e.target.value)}
                    placeholder="e.g. Managing Director / Chief Technology Officer"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                {/* Star Rating Selector */}
                <div>
                  <label className="block font-bold uppercase text-black mb-1.5">
                    Rating Classification *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRevRating(star)}
                        className={`text-2xl transition-transform hover:scale-125 focus:outline-none ${
                          star <= revRating ? 'text-amber-500' : 'text-median-taupe/30'
                        }`}
                        title={`${star} Star${star > 1 ? 's' : ''}`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-mono text-median-taupe font-bold">
                      {revRating === 5 && '5.0 / 5.0 — Exceptional Engineering & Delivery'}
                      {revRating === 4 && '4.0 / 5.0 — High-Grade Production Architecture'}
                      {revRating === 3 && '3.0 / 5.0 — Satisfactory Deliverable'}
                      {revRating < 3 && `${revRating}.0 / 5.0 — Needs Calibration`}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase text-black mb-1.5">
                    Your Testimonial & Review *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={revText}
                    onChange={(e) => setRevText(e.target.value)}
                    placeholder="Describe the speed, uptime, precision, and engineering quality Monolith LK delivered for your organization..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black transition-colors leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-black text-white font-oswald text-xs uppercase tracking-widest hover:bg-median-taupe transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Submit Accreditation Testimonial</span>
                  <span>→</span>
                </button>
              </form>
            </div>
            </ScrollReveal>

            {/* Client's Published Reviews */}
            <ScrollReveal variant="card-flip-right" delay={120} duration={800} once className="lg:col-span-6 space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe font-bold block mb-1">
                  Active Accreditations
                </span>
                <h3 className="font-oswald text-2xl font-bold uppercase text-black">
                  Your Published Endorsements ({reviews.length})
                </h3>
              </div>

              {reviews.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-white border border-median-taupe/20 text-median-taupe font-mono text-xs">
                  <p className="font-oswald text-lg uppercase text-black mb-1">No Endorsements Logged Yet</p>
                  <span>Submit your first review using the form on the left to be featured on Monolith LK.</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div
                      key={r.id}
                      className="p-6 rounded-2xl bg-white border border-median-taupe/20 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex text-amber-500 text-sm">
                          {[...Array(r.rating || 5)].map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>
                        <span className="px-2.5 py-1 rounded-full border border-emerald-300 bg-emerald-50 text-[10px] font-mono text-emerald-800 font-bold uppercase">
                          Live On Monolith LK
                        </span>
                      </div>
                      <blockquote className="text-sm text-black italic font-serif leading-relaxed">
                        "{r.review_text}"
                      </blockquote>
                      <div className="pt-2 border-t border-median-taupe/15 flex items-center justify-between text-xs font-mono">
                        <div>
                          <strong className="text-black font-semibold">{r.client_name}</strong>
                          <span className="text-median-taupe/80"> · {r.client_title}</span>
                        </div>
                        <span className="text-[10px] text-median-taupe font-semibold uppercase">{r.company_name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollReveal>
          </div>
        )}

        {/* ================= TAB 6: SECURITY & PASSKEY MANAGEMENT ================= */}
        {activeTab === 'security' && (
          <ScrollReveal variant="card-lift" duration={800} once>
          <div className="max-w-2xl mx-auto p-6 sm:p-10 rounded-2xl bg-white border border-median-taupe/20 shadow-sm space-y-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe font-bold block mb-1">
                Zero-Trust Credential Hardening
              </span>
              <h3 className="font-oswald text-2xl sm:text-3xl font-bold uppercase text-black">
                Update Portal Passkey & Password
              </h3>
              <p className="text-xs text-median-taupe/80 mt-1">
                Maintain cryptographic security over your enterprise account. Passkey updates take effect immediately across all sessions.
              </p>
            </div>

            {passwordMsg && (
              <div
                className={`p-4 rounded-xl text-xs font-mono font-semibold ${
                  passwordMsg.startsWith('✓')
                    ? 'bg-emerald-50 border border-emerald-300 text-emerald-800'
                    : 'bg-red-50 border border-red-300 text-red-800'
                }`}
              >
                {passwordMsg}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block font-bold uppercase text-black mb-1.5">
                  Authorized Account Email
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/20 bg-median-taupe/5 text-median-taupe text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-black mb-1.5">
                  New Security Passkey / Password *
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-black mb-1.5">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div className="p-4 rounded-xl bg-median-taupe/5 border border-median-taupe/15 space-y-1.5 text-[11px] text-median-taupe">
                <span className="font-bold text-black uppercase block">Security Safeguards:</span>
                <div>• Must contain at least 6 characters.</div>
                <div>• Synchronized to Supabase GoTrue Auth & offline fallback session.</div>
                <div>• If locked out, contact Monolith LK Executive Desk in Kurunegala directly.</div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full py-3.5 rounded-xl bg-black text-white font-oswald text-xs uppercase tracking-widest hover:bg-median-taupe transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
              >
                {isUpdatingPassword ? (
                  <span>Securing Credentials...</span>
                ) : (
                  <>
                    <span>Commit New Password</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </form>
          </div>
          </ScrollReveal>
        )}
      </main>

      {/* Haute Editorial Invoice / Quotation Modal */}
      {selectedBillingDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] max-w-2xl w-full rounded-2xl border border-median-taupe/30 shadow-2xl p-5 sm:p-8 md:p-10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-median-taupe/20 pb-6 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
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
                <span className="text-xs font-mono text-median-taupe">
                  Issued to: <strong className="text-black">{selectedBillingDoc.client_name}</strong>
                  {selectedBillingDoc.client_contact_name &&
                    selectedBillingDoc.client_contact_name !== selectedBillingDoc.client_name && (
                      <> · Client: <strong className="text-black">{selectedBillingDoc.client_contact_name}</strong></>
                    )}
                </span>
              </div>
              <button
                onClick={() => setSelectedBillingDoc(null)}
                className="w-9 h-9 rounded-full border border-median-taupe/40 flex items-center justify-center text-sm font-bold text-median-taupe hover:text-black hover:border-black transition-colors shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Line items table */}
            <div className="space-y-4 mb-6">
              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[460px] text-xs font-mono">
                  <thead>
                    <tr className="border-b border-median-taupe/20 text-median-taupe uppercase text-left">
                      <th className="py-2">Deliverable Item</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Unit Price</th>
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-median-taupe/15">
                    {selectedBillingDoc.line_items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-3 text-black font-semibold">{item.description}</td>
                        <td className="py-3 text-center">{item.quantity}</td>
                        <td className="py-3 text-right">
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

              <div className="border-t border-median-taupe/20 pt-4 flex flex-col items-end gap-1 font-mono text-xs">
                <div className="flex justify-between w-56 text-median-taupe">
                  <span>Subtotal:</span>
                  <span>{selectedBillingDoc.currency || 'LKR'} {selectedBillingDoc.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between w-56 text-median-taupe">
                  <span>Tax:</span>
                  <span>{selectedBillingDoc.currency || 'LKR'} {selectedBillingDoc.tax.toLocaleString()}</span>
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
              <div className="p-4 rounded-xl bg-median-taupe/5 border border-median-taupe/20 text-xs font-mono text-median-taupe mb-6">
                <strong>Voucher Notes:</strong> {selectedBillingDoc.notes}
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-median-taupe/20">
              <span className="text-[10px] font-mono text-median-taupe">
                Payment Status: <strong className="uppercase">{selectedBillingDoc.status}</strong>
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => downloadBillingVoucherHtml(selectedBillingDoc)}
                  className="px-5 py-2.5 rounded-xl border border-median-taupe text-black hover:border-black font-oswald text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5"
                >
                  <span>↓ Download Voucher (.html)</span>
                </button>
                <button
                  onClick={() => printBillingVoucherPdf(selectedBillingDoc)}
                  className="px-5 py-2.5 rounded-xl bg-black text-white font-oswald text-xs uppercase tracking-wider hover:bg-median-taupe transition-colors flex items-center gap-1.5"
                >
                  <span>Print / Save PDF</span>
                  <span>↗</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
