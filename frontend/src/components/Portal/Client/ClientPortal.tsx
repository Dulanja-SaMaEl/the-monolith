import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { PortalProject, MeetingRequest, ProjectRequest, BillingDocument } from '../../../lib/portalStore';
import { portalApi } from '../../../lib/portalApi';
import { downloadBillingVoucherHtml, printBillingVoucherPdf } from '../../../lib/invoiceDownloader';

interface ClientPortalProps {
  navigate: (route: string) => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({ navigate }) => {
  const { user, logout, isLiveAuth } = useAuth();
  const [activeTab, setActiveTab] = useState<'projects' | 'request' | 'meetings' | 'billing'>('projects');
  const [isLiveDb, setIsLiveDb] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Client Data States
  const [projects, setProjects] = useState<PortalProject[]>([]);
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [meetings, setMeetings] = useState<MeetingRequest[]>([]);
  const [billingDocs, setBillingDocs] = useState<BillingDocument[]>([]);
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

  const loadClientData = useCallback(async () => {
    if (!user?.id) return;
    setIsLoadingData(true);
    try {
      const [projRes, reqRes, meetRes, billRes] = await Promise.all([
        portalApi.getProjects(user.id),
        portalApi.getProjectRequests(user.id),
        portalApi.getMeetings(user.id),
        portalApi.getBillingDocuments(user.id),
      ]);
      setProjects(projRes.data);
      setRequests(reqRes.data);
      setMeetings(meetRes.data);
      setBillingDocs(billRes.data);
      setIsLiveDb(projRes.live || isLiveAuth);
    } finally {
      setIsLoadingData(false);
    }
  }, [user, isLiveAuth]);

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

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-black font-inter selection:bg-median-taupe selection:text-white pb-24">
      {/* Top Haute Editorial VIP Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-median-taupe/20 px-6 sm:px-12 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 group focus:outline-none"
            >
              <span className="w-4 h-4 bg-black flex items-center justify-center text-white text-[9px] font-bold">
                ■
              </span>
              <span className="font-oswald text-xl font-bold tracking-[0.2em] text-black uppercase group-hover:text-median-taupe transition-colors">
                MONOLITH<span className="text-median-taupe ml-1">LK</span>
              </span>
            </button>
            <span className="text-median-taupe/40 font-mono text-sm">/</span>
            <span className="font-mono text-xs uppercase tracking-wider text-median-taupe font-semibold">
              Client VIP Lounge
            </span>
          </div>

          {/* User profile & actions */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="hidden sm:block text-right">
              <span className="font-bold text-black block">{user?.company_name || user?.full_name}</span>
              <span className="text-median-taupe/70 text-[10px]">{user?.email}</span>
            </div>
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
      </header>

      {/* Main Hub Container */}
      <main className="max-w-7xl mx-auto px-6 sm:px-12 pt-8">
        {/* Welcome Greeting Banner */}
        <div className="mb-8 p-6 sm:p-8 rounded-2xl bg-white border border-median-taupe/20 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-median-taupe/30 bg-median-taupe/5 text-[10px] font-mono uppercase tracking-widest text-median-taupe mb-2">
              <span className={`w-2 h-2 rounded-full animate-pulse ${isLiveDb ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>
                {isLoadingData
                  ? 'Synchronizing Cluster...'
                  : isLiveDb
                  ? 'Live Supabase DB Sync · Nominal (99.98% SLA)'
                  : 'Offline Preview Sandbox · Local State'}
              </span>
            </div>
            <h1 className="font-oswald text-3xl sm:text-4xl font-bold uppercase tracking-tight text-black">
              Welcome, {user?.company_name || user?.full_name}
            </h1>
            <p className="text-xs sm:text-sm text-median-taupe/80 mt-1 max-w-xl">
              Track real-time engineering milestones, commission new architecture pipelines, and coordinate directly with Principal Systems Architects.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('request')}
              className="px-5 py-2.5 rounded-xl bg-black text-white font-oswald text-sm uppercase tracking-wider hover:bg-median-taupe transition-colors"
            >
              + Commission New Project
            </button>
            <button
              onClick={() => setActiveTab('meetings')}
              className="px-5 py-2.5 rounded-xl border border-median-taupe text-black font-oswald text-sm uppercase tracking-wider hover:bg-median-taupe hover:text-white transition-colors"
            >
              Book Architecture Session
            </button>
          </div>
        </div>

        {/* Portal Tabs Bar */}
        <div className="flex border-b border-median-taupe/20 mb-8 overflow-x-auto gap-2 sm:gap-6 font-oswald text-sm sm:text-base uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('projects')}
            className={`py-3 px-2 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'projects'
                ? 'border-black text-black font-bold'
                : 'border-transparent text-median-taupe/60 hover:text-black'
            }`}
          >
            <span>Active Projects & Milestones</span>
            <span className="w-5 h-5 rounded-full bg-median-taupe/10 text-median-taupe text-[10px] font-mono font-bold flex items-center justify-center">
              {projects.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('request')}
            className={`py-3 px-2 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'request'
                ? 'border-black text-black font-bold'
                : 'border-transparent text-median-taupe/60 hover:text-black'
            }`}
          >
            <span>Request New Project</span>
          </button>

          <button
            onClick={() => setActiveTab('meetings')}
            className={`py-3 px-2 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'meetings'
                ? 'border-black text-black font-bold'
                : 'border-transparent text-median-taupe/60 hover:text-black'
            }`}
          >
            <span>Schedule Meeting</span>
            {meetings.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-median-taupe/10 text-median-taupe text-[10px] font-mono font-bold flex items-center justify-center">
                {meetings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`py-3 px-2 border-b-2 transition-all flex items-center gap-2 ${
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
        </div>

        {/* ================= TAB 1: ACTIVE PROJECTS & MILESTONES ================= */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            {projects.length === 0 ? (
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
            ) : (
              projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-6 sm:p-8 rounded-2xl bg-white border border-median-taupe/20 hover:border-median-taupe shadow-sm transition-all"
                >
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
                </div>
              ))
            )}
          </div>
        )}

        {/* ================= TAB 2: REQUEST NEW PROJECT ================= */}
        {activeTab === 'request' && (
          <div className="max-w-3xl mx-auto">
            <div className="p-8 sm:p-10 rounded-2xl bg-white border border-median-taupe/20 shadow-sm">
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
            <div className="lg:col-span-6 p-8 sm:p-10 rounded-2xl bg-white border border-median-taupe/20 shadow-sm">
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

            {/* Scheduled Meetings List */}
            <div className="lg:col-span-6 space-y-4">
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
            </div>
          </div>
        )}

        {/* ================= TAB 4: BILLING & INVOICES ================= */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-oswald text-2xl sm:text-3xl font-bold uppercase text-black">
                  Invoices & Quotations
                </h2>
                <p className="text-xs text-median-taupe/80">
                  Itemized billing records and formal architecture quotations issued to {user?.company_name}.
                </p>
              </div>
            </div>

            {billingDocs.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white border border-median-taupe/20 text-xs font-mono text-median-taupe">
                No billing vouchers or quotations issued yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {billingDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-6 rounded-2xl bg-white border border-median-taupe/20 hover:border-median-taupe shadow-sm transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe font-bold block">
                            {doc.type.toUpperCase()}
                          </span>
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
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Haute Editorial Invoice / Quotation Modal */}
      {selectedBillingDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] max-w-2xl w-full rounded-2xl border border-median-taupe/30 shadow-2xl p-8 sm:p-10 max-h-[90vh] overflow-y-auto">
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
                className="w-9 h-9 rounded-full border border-median-taupe/40 flex items-center justify-center text-sm font-bold text-median-taupe hover:text-black hover:border-black transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Line items table */}
            <div className="space-y-4 mb-6">
              <table className="w-full text-xs font-mono">
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
