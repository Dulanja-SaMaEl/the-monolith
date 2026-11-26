import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { supabaseAdmin } from '../services/supabase';

const router = Router();

export interface MonoStopResponse {
  tab?: string;
  target: string;
  title: string;
  caption: string;
}

export interface MonoAskResponse {
  reply: string;
  mood: 'idle' | 'guiding' | 'thinking' | 'celebrate' | 'alert';
  suggestions: string[];
  stops: MonoStopResponse[];
  ai_powered: boolean;
}

// Simple per-user sliding-window rate limiter (1 hour window)
const RATE_WINDOW_MS = 60 * 60 * 1000;
const rateBuckets = new Map<string, number[]>();

function checkRateLimit(userId: string, isAdmin: boolean): boolean {
  const limit = isAdmin ? 150 : 40;
  const now = Date.now();
  const prev = (rateBuckets.get(userId) || []).filter((ts) => now - ts < RATE_WINDOW_MS);
  if (prev.length >= limit) {
    rateBuckets.set(userId, prev);
    return false;
  }
  prev.push(now);
  rateBuckets.set(userId, prev);
  return true;
}

async function safeQuery<T>(fn: () => PromiseLike<{ data: T | null; error: any }>): Promise<T | null> {
  try {
    const res = await fn();
    if (res.error) return null;
    return res.data;
  } catch {
    return null;
  }
}

async function loadAdminSnapshot() {
  const [clients, projects, tasks, plans, billing, changeRequests, meetings, inquiries, requests] = await Promise.all([
    safeQuery(() => supabaseAdmin.from('profiles').select('id, full_name, company_name, email, is_blocked').eq('role', 'client')),
    safeQuery(() =>
      supabaseAdmin
        .from('projects')
        .select('id, client_id, title, code_name, category, status, progress_percentage, production_url, domain_renewal_date, server_expiry_date, target_launch_date, client:profiles!client_id(company_name, full_name)')
    ),
    safeQuery(() => supabaseAdmin.from('executive_tasks').select('id, title, assignee, priority, task_date, is_completed')),
    safeQuery(() =>
      supabaseAdmin
        .from('project_payment_plans')
        .select('id, client_id, project_id, package_name, billing_type, currency, total_amount, installment_amount, next_due_date, status, payments:payment_records(amount)')
    ),
    safeQuery(() =>
      supabaseAdmin
        .from('documents_billing')
        .select('id, document_number, type, status, total, currency, due_date, billing_scope, client:profiles!client_id(company_name)')
    ),
    safeQuery(() =>
      supabaseAdmin
        .from('project_change_requests')
        .select('id, project_id, title, status, priority, estimated_cost, timeline_impact_days')
    ),
    safeQuery(() => supabaseAdmin.from('meeting_requests').select('id, requested_date, requested_time, meeting_type, status')),
    safeQuery(() => supabaseAdmin.from('contact_inquiries').select('id, name, company, service_need, status')),
    safeQuery(() => supabaseAdmin.from('project_requests').select('id, project_title, service_category, status')),
  ]);

  const today = new Date().toISOString().split('T')[0];
  const openTasks = (tasks || []).filter((t: any) => !t.is_completed);
  const overdueTasks = openTasks.filter((t: any) => t.task_date && t.task_date < today);
  const unquotedCRs = (changeRequests || []).filter((c: any) => c.status === 'requested');
  const unpaidInvoices = (billing || []).filter((b: any) => b.type === 'invoice' && b.status !== 'paid');
  const pendingQuotes = (billing || []).filter((b: any) => b.type === 'quotation' && b.status !== 'approved');
  const pendingMeetings = (meetings || []).filter((m: any) => m.status === 'pending');
  const newInquiries = (inquiries || []).filter((i: any) => i.status === 'new');
  const pendingProjectReqs = (requests || []).filter((r: any) => r.status === 'pending_review');

  const projectsWithoutHeartbeat = (projects || []).filter((p: any) => !p.production_url);
  const expiringAssets = (projects || [])
    .filter((p: any) => {
      const checkSoon = (d?: string) => {
        if (!d) return false;
        const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
        return diff <= 30;
      };
      return checkSoon(p.domain_renewal_date) || checkSoon(p.server_expiry_date);
    })
    .map((p: any) => ({
      title: p.title,
      domain_renewal_date: p.domain_renewal_date,
      server_expiry_date: p.server_expiry_date,
    }));

  const plansSummary = (plans || []).map((pl: any) => {
    const paid = (pl.payments || []).reduce((s: number, r: any) => s + Number(r.amount || 0), 0);
    return {
      package_name: pl.package_name,
      billing_type: pl.billing_type,
      total_amount: Number(pl.total_amount || 0),
      paid,
      remaining: pl.billing_type === 'monthly' ? 0 : Math.max(0, Number(pl.total_amount || 0) - paid),
      next_due_date: pl.next_due_date,
      status: pl.status,
    };
  });

  return {
    today,
    client_count: (clients || []).length,
    clients: (clients || []).slice(0, 12).map((c: any) => c.company_name || c.full_name),
    projects: (projects || []).slice(0, 12).map((p: any) => ({
      title: p.title,
      code: p.code_name,
      client: p.client?.company_name || p.client?.full_name,
      status: p.status,
      progress: p.progress_percentage,
      has_production_url: Boolean(p.production_url),
      target_launch_date: p.target_launch_date,
    })),
    open_tasks_count: openTasks.length,
    overdue_tasks_count: overdueTasks.length,
    open_tasks_sample: openTasks.slice(0, 8).map((t: any) => ({
      title: t.title,
      assignee: t.assignee,
      date: t.task_date,
      priority: t.priority,
    })),
    unquoted_change_requests: unquotedCRs.map((c: any) => ({ title: c.title, priority: c.priority })),
    unpaid_invoices: unpaidInvoices.slice(0, 8).map((i: any) => ({
      number: i.document_number,
      client: i.client?.company_name,
      total: Number(i.total || 0),
      currency: i.currency || 'LKR',
      due_date: i.due_date,
    })),
    pending_quotations_count: pendingQuotes.length,
    pending_meetings_count: pendingMeetings.length,
    new_inquiries_count: newInquiries.length,
    pending_project_requests_count: pendingProjectReqs.length,
    projects_without_heartbeat_count: projectsWithoutHeartbeat.length,
    expiring_assets: expiringAssets,
    payment_plans: plansSummary,
  };
}

async function loadClientSnapshot(clientId: string) {
  const [profile, projects, plans, billing, changeRequests, meetings] = await Promise.all([
    safeQuery(() => supabaseAdmin.from('profiles').select('full_name, company_name, email').eq('id', clientId).single()),
    safeQuery(() =>
      supabaseAdmin
        .from('projects')
        .select('id, title, code_name, category, status, progress_percentage, production_url, staging_url, domain_renewal_date, server_expiry_date, target_launch_date, milestones:project_milestones(title, is_completed)')
        .eq('client_id', clientId)
    ),
    safeQuery(() =>
      supabaseAdmin
        .from('project_payment_plans')
        .select('id, package_name, billing_type, currency, total_amount, installment_amount, next_due_date, status, payments:payment_records(amount, payment_date)')
        .eq('client_id', clientId)
    ),
    safeQuery(() =>
      supabaseAdmin
        .from('documents_billing')
        .select('document_number, type, status, total, currency, due_date, billing_scope')
        .eq('client_id', clientId)
    ),
    safeQuery(() =>
      supabaseAdmin
        .from('project_change_requests')
        .select('title, status, is_complimentary, estimated_cost, currency, timeline_impact_days')
        .eq('client_id', clientId)
    ),
    safeQuery(() =>
      supabaseAdmin
        .from('meeting_requests')
        .select('requested_date, requested_time, meeting_type, status')
        .eq('client_id', clientId)
    ),
  ]);

  const plansSummary = (plans || []).map((pl: any) => {
    const paid = (pl.payments || []).reduce((s: number, r: any) => s + Number(r.amount || 0), 0);
    return {
      package_name: pl.package_name,
      billing_type: pl.billing_type,
      currency: pl.currency || 'LKR',
      total_amount: Number(pl.total_amount || 0),
      paid,
      remaining: pl.billing_type === 'monthly' ? 0 : Math.max(0, Number(pl.total_amount || 0) - paid),
      next_due_date: pl.next_due_date,
      status: pl.status,
      receipts_count: (pl.payments || []).length,
    };
  });

  return {
    client_name: (profile as any)?.company_name || (profile as any)?.full_name || 'Valued Client',
    projects: (projects || []).map((p: any) => ({
      title: p.title,
      code: p.code_name,
      status: p.status,
      progress: p.progress_percentage,
      has_live_url: Boolean(p.production_url),
      domain_renewal_date: p.domain_renewal_date,
      server_expiry_date: p.server_expiry_date,
      target_launch_date: p.target_launch_date,
      milestones_done: (p.milestones || []).filter((m: any) => m.is_completed).length,
      milestones_total: (p.milestones || []).length,
    })),
    payment_plans: plansSummary,
    total_paid_lkr: plansSummary.reduce((s, p) => s + p.paid, 0),
    total_remaining_lkr: plansSummary.reduce((s, p) => s + p.remaining, 0),
    unpaid_invoices: (billing || []).filter((b: any) => b.type === 'invoice' && b.status !== 'paid'),
    total_documents: (billing || []).length,
    quoted_change_requests: (changeRequests || []).filter((c: any) => c.status === 'quoted'),
    change_requests_total: (changeRequests || []).length,
    upcoming_meetings: (meetings || []).filter((m: any) => m.status === 'pending' || m.status === 'confirmed'),
  };
}

function buildFallbackAdminResponse(question: string, snap: any): MonoAskResponse {
  const q = question.toLowerCase();

  if (q.includes('task') || q.includes('today') || q.includes('work') || q.includes('do next') || q.includes('priority')) {
    const stops: MonoStopResponse[] = [];
    if (snap.unquoted_change_requests.length > 0) {
      stops.push({
        tab: 'projects',
        target: 'admin-projects-list',
        title: 'Quote Pending Change Request',
        caption: `${snap.unquoted_change_requests.length} client tweak request(s) are waiting for your LKR & timeline Impact Card.`,
      });
    }
    if (snap.open_tasks_count > 0) {
      stops.push({
        tab: 'tasks',
        target: 'admin-task-rollover',
        title: `Clear ${snap.open_tasks_count} Open Sprint Tasks`,
        caption: 'Tick finished items or roll remaining ones forward to tomorrow in one tap.',
      });
    }
    if (snap.new_inquiries_count + snap.pending_meetings_count > 0) {
      stops.push({
        tab: 'requests',
        target: 'admin-nav-requests',
        title: 'Respond to Inbox & Calls',
        caption: `${snap.new_inquiries_count} new contact brief(s) and ${snap.pending_meetings_count} pending consultation call(s) need attention.`,
      });
    }
    if (stops.length === 0) {
      stops.push({
        tab: 'overview',
        target: 'admin-cashflow-hud',
        title: 'Review Studio Cashflow',
        caption: 'All urgent queues are clear! Review your 6-month revenue trajectory and plan upcoming retainers.',
      });
    }

    const summaryLines: string[] = [];
    if (snap.open_tasks_count > 0) {
      const sample = snap.open_tasks_sample
        .slice(0, 2)
        .map((t: any) => `"${t.title}" (${t.assignee.split(' ')[0]})`)
        .join(' and ');
      summaryLines.push(`You have ${snap.open_tasks_count} open task(s), starting with ${sample}.`);
    }
    if (snap.unquoted_change_requests.length > 0) {
      summaryLines.push(`${snap.unquoted_change_requests.length} Change Request(s) need an Impact Card quote.`);
    }
    if (snap.unpaid_invoices.length > 0) {
      summaryLines.push(`${snap.unpaid_invoices.length} unpaid invoice(s) are open for follow-up.`);
    }

    return {
      reply:
        summaryLines.length > 0
          ? `Here is your live priority flight plan for today: ${summaryLines.join(' ')} Let me guide you right to them!`
          : 'Your queues look super clean right now! Use this window to configure a monthly maintenance package or add a Production URL to enable live 24/7 Heartbeat monitoring.',
      mood: 'guiding',
      suggestions: [
        'Suggest new updates to pitch clients',
        'Show me unpaid invoices & cashflow',
        'How do I convert a quote to an invoice?',
      ],
      stops,
      ai_powered: false,
    };
  }

  if (q.includes('invoice') || q.includes('quote') || q.includes('bill') || q.includes('convert')) {
    return {
      reply: `You currently have ${snap.unpaid_invoices.length} unpaid invoice(s) and ${snap.pending_quotations_count} quotation(s). Open Invoices & Quotes to issue a new LKR voucher or click "Convert → Invoice" on any quotation without retyping line items.`,
      mood: 'guiding',
      suggestions: ['Check payment packages', 'What tasks are open today?', 'Suggest new updates to pitch clients'],
      stops: [
        {
          tab: 'billing',
          target: 'admin-billing-composer-btn',
          title: 'Invoices & Quotations Hub',
          caption: 'Switch to "+ Issue Invoice / Quote" to draft a new LKR document, or convert existing quotes in one click below.',
        },
      ],
      ai_powered: false,
    };
  }

  if (q.includes('payment') || q.includes('package') || q.includes('retainer') || q.includes('cashflow') || q.includes('money')) {
    return {
      reply: `You have ${snap.payment_plans.length} configured payment plan(s) and ${snap.unpaid_invoices.length} unpaid invoice(s). I'll take you straight to Payments & Plans so you can add a one-time, monthly, or installment package or log cleared payments.`,
      mood: 'guiding',
      suggestions: ['Show cashflow forecast HUD', 'Check open tasks', 'How to preview client portal?'],
      stops: [
        {
          tab: 'payments',
          target: 'admin-new-plan-btn',
          title: 'Manage Payment Packages',
          caption: 'Click "+ New Payment Package" to attach a one-time, monthly retainer, or installment schedule to any project.',
        },
      ],
      ai_powered: false,
    };
  }

  if (q.includes('update') || q.includes('idea') || q.includes('suggest') || q.includes('new thing') || q.includes('pitch') || q.includes('grow')) {
    const firstProj = snap.projects[0];
    const ideas: string[] = [];
    if (snap.projects_without_heartbeat_count > 0) {
      ideas.push(`Add the live Production URL in Project Vault (${snap.projects_without_heartbeat_count} project missing it) so clients see Monolith LK's 24/7 Heartbeat pulse.`);
    }
    if (firstProj) {
      ideas.push(`Pitch a Monthly Cloud & Maintenance Retainer for "${firstProj.title}" (${firstProj.progress}% complete) before launch.`);
    }
    ideas.push('Ask happy clients to submit a 5-star review inside their portal so it auto-showcases on the Monolith LK homepage.');

    return {
      reply: `High-impact moves for Monolith LK right now: 1) ${ideas.join(' 2) ')} Let me show you where to configure the Vault first.`,
      mood: 'celebrate',
      suggestions: ['What should we work on today?', 'Show unpaid invoices', 'How to preview a client portal?'],
      stops: [
        {
          tab: 'projects',
          target: 'admin-projects-list',
          title: 'Upgrade Project Vault & Heartbeat',
          caption: 'Click "Edit & Vault" on any project to add Production URL, Domain Renewal, and Server Expiry dates.',
        },
        {
          tab: 'payments',
          target: 'admin-new-plan-btn',
          title: 'Attach a Monthly Retainer Plan',
          caption: 'Set up recurring monthly maintenance billing so clients see transparent renewal cycles.',
        },
      ],
      ai_powered: false,
    };
  }

  if (q.includes('preview') || q.includes('client view') || q.includes('customer')) {
    return {
      reply: 'You can safely inspect any customer’s exact isolated portal without signing out! Let me point straight to the Client View button.',
      mood: 'guiding',
      suggestions: ['What should we work on today?', 'Suggest new updates to pitch clients'],
      stops: [
        {
          tab: 'overview',
          target: 'admin-client-preview-btn',
          title: 'Safe Admin Client Preview',
          caption: 'Click "Client View ↗" here to preview any customer’s portal with a live client switcher bar.',
        },
      ],
      ai_powered: false,
    };
  }

  return {
    reply: `Monolith LK snapshot: ${snap.client_count} clients, ${snap.projects.length} active project(s), ${snap.open_tasks_count} open task(s), and ${snap.unpaid_invoices.length} unpaid invoice(s). Ask me what to prioritize today, how to use any tool, or for new upgrade ideas to pitch clients!`,
    mood: 'idle',
    suggestions: [
      'What should we work on today?',
      'Suggest new updates to pitch clients',
      'Show me unpaid invoices & cashflow',
    ],
    stops: [
      {
        tab: 'overview',
        target: 'admin-cashflow-hud',
        title: 'Studio Command Telemetry',
        caption: 'Your live monthly collections, projected receivables, and overdue health are tracked right here.',
      },
    ],
    ai_powered: false,
  };
}

function buildFallbackClientResponse(question: string, snap: any): MonoAskResponse {
  const q = question.toLowerCase();

  if (q.includes('pay') || q.includes('due') || q.includes('balance') || q.includes('receipt') || q.includes('money') || q.includes('lkr')) {
    const nextDue = snap.payment_plans.find((p: any) => p.next_due_date)?.next_due_date;
    return {
      reply: `You have paid LKR ${snap.total_paid_lkr.toLocaleString()} so far${
        snap.total_remaining_lkr > 0 ? `, with LKR ${snap.total_remaining_lkr.toLocaleString()} remaining` : ''
      }${nextDue ? `. Your next scheduled due date is ${nextDue}.` : '.'} Let me fly you to Payments & Packages where you can view progress, download Official Payment Receipt PDFs, and sync due dates to your calendar!`,
      mood: 'guiding',
      suggestions: ['Where are my invoices?', 'Check my project progress', 'How do I request a new feature?'],
      stops: [
        {
          tab: 'payments',
          target: 'client-payment-summary',
          title: 'Payment Progress & Official Receipts',
          caption: 'View paid vs. remaining LKR balances, download Official Receipt PDFs, and tap "+ Calendar" on due dates.',
        },
      ],
      ai_powered: false,
    };
  }

  if (q.includes('tweak') || q.includes('feature') || q.includes('change') || q.includes('add') || q.includes('update')) {
    return {
      reply: 'Want to add a new feature or tweak? Use the "+ Request Tweak / New Feature" button right inside your project! Monolith LK will reply with a transparent Impact Card showing exact LKR cost (or Complimentary) and launch impact before any work starts.',
      mood: 'guiding',
      suggestions: ['Check my payment balance', 'Book a meeting with Monolith LK', 'Check live system health'],
      stops: [
        {
          tab: 'projects',
          target: 'client-change-request-btn',
          title: 'Request Tweak / New Feature',
          caption: 'Click here to describe any tweak or upgrade and receive a transparent Cost & Timeline Impact Card.',
        },
      ],
      ai_powered: false,
    };
  }

  if (q.includes('online') || q.includes('server') || q.includes('ssl') || q.includes('health') || q.includes('heartbeat') || q.includes('domain') || q.includes('calendar')) {
    return {
      reply: 'Your Project Deliverables & Infrastructure Vault monitors your live Production URL (response latency + SSL certificate days remaining) and lets you save Domain & Server renewal dates to Apple or Google Calendar in 1 tap!',
      mood: 'guiding',
      suggestions: ['How much balance is remaining?', 'How do I request a new feature?'],
      stops: [
        {
          tab: 'projects',
          target: 'client-heartbeat-monitor',
          title: '24/7 Live System Heartbeat',
          caption: 'Live response time, SSL validity days, and 1-tap "+ Calendar" renewal reminders live right inside your Vault.',
        },
      ],
      ai_powered: false,
    };
  }

  if (q.includes('invoice') || q.includes('quotation') || q.includes('pdf') || q.includes('download')) {
    return {
      reply: `You have ${snap.total_documents} billing document(s) (${snap.unpaid_invoices.length} unpaid invoice(s)). I'll take you right to Invoices & Quotations where you can preview, print to PDF, or download with meaningful filenames!`,
      mood: 'guiding',
      suggestions: ['Show my payment progress', 'Book a consultation call'],
      stops: [
        {
          tab: 'billing',
          target: 'client-tab-billing',
          title: 'Invoices & Quotations Vault',
          caption: 'Download itemized LKR invoices/quotations or sync unpaid due dates straight to your calendar.',
        },
      ],
      ai_powered: false,
    };
  }

  if (q.includes('meeting') || q.includes('call') || q.includes('book') || q.includes('talk')) {
    return {
      reply: 'Need a quick Sprint Review or Architecture Call with Dulanja & Remashi? Let me fly you straight to the Meetings scheduler!',
      mood: 'guiding',
      suggestions: ['Check my project milestones', 'View payment progress'],
      stops: [
        {
          tab: 'meetings',
          target: 'client-tab-meetings',
          title: 'Book a Live Session',
          caption: 'Pick a Sri Lanka (UTC+5:30) slot and add confirmed calls straight to your calendar.',
        },
      ],
      ai_powered: false,
    };
  }

  const firstProj = snap.projects[0];
  return {
    reply: firstProj
      ? `Welcome ${snap.client_name}! Your project "${firstProj.title}" is currently ${firstProj.progress}% complete (${firstProj.milestones_done}/${firstProj.milestones_total} milestones done). Ask me about payments, receipts, live server health, or how to request a feature upgrade!`
      : `Welcome ${snap.client_name}! I'm MONO, your Monolith LK portal guide. Ask me anything about your projects, payments, invoices, or click below for a guided tour!`,
    mood: 'idle',
    suggestions: [
      'How much balance do I need to pay?',
      'How do I request a new feature?',
      'Where do I check server & domain renewals?',
    ],
    stops: [
      {
        tab: 'projects',
        target: 'client-tab-projects',
        title: 'Your Live Engineering Hub',
        caption: 'Track live build milestones, 24/7 system heartbeat, renewal dates, and Change Request Impact Cards here.',
      },
    ],
    ai_powered: false,
  };
}

async function callGeminiMono(
  role: 'admin' | 'client',
  question: string,
  currentTab: string,
  snapshot: any,
  history: { role: string; text: string }[]
): Promise<MonoAskResponse | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const allowedAnchors =
    role === 'admin'
      ? `Valid tabs: "overview", "tasks", "customers", "projects", "requests", "payments", "billing", "partners", "reviews", "blog".
Valid target data-guide anchors:
- "admin-cashflow-hud" (tab: "overview") - 6-month revenue & expected receivables HUD
- "admin-open-tasks" (tab: "overview") - Open sprint tasks pulse on overview
- "admin-client-preview-btn" (tab: "overview") - Safe Client View preview button
- "admin-task-rollover" (tab: "tasks") - Roll Over Remaining tasks button
- "admin-add-task-btn" (tab: "tasks") - + Add Daily Task button
- "admin-projects-list" (tab: "projects") - Projects, Vault, Live Heartbeat & Change Request Impact Cards
- "admin-new-plan-btn" (tab: "payments") - + New Payment Package button
- "admin-billing-composer-btn" (tab: "billing") - + Issue Invoice / Quote button
- "admin-nav-customers" (tab: "customers") - Customer registry & security
- "admin-nav-requests" (tab: "requests") - Contact briefs, meetings & project commissions
- "admin-nav-reviews" (tab: "reviews") - Client testimonials`
      : `Valid tabs: "projects", "payments", "request", "meetings", "billing", "reviews", "security".
Valid target data-guide anchors:
- "client-tab-projects" (tab: "projects") - Active Projects & Milestones
- "client-heartbeat-monitor" (tab: "projects") - 24/7 Live System Heartbeat & SSL monitor inside Vault
- "client-change-request-btn" (tab: "projects") - + Request Tweak / New Feature button
- "client-payment-summary" (tab: "payments") - Payment Progress, Remaining LKR, Official Receipts & Calendar Sync
- "client-tab-billing" (tab: "billing") - Invoices & Quotations download/PDF
- "client-tab-meetings" (tab: "meetings") - Book a consultation call
- "client-tab-request" (tab: "request") - Commission a new project
- "client-tab-reviews" (tab: "reviews") - Submit verified client endorsement
- "client-tab-security" (tab: "security") - Update portal passkey`;

  const systemInstruction = `You are MONO, the living minimalist architectural AI companion of Monolith LK (a luxury software engineering studio in Kurunegala/Colombo, Sri Lanka led by Founders Dulanja Abeysinghe & Remashi Diyana).
Current Mode: ${role === 'admin' ? 'ADMIN EXECUTIVE COPILOT (assisting Dulanja & Remashi)' : 'CLIENT CONCIERGE (assisting a Monolith LK client — NEVER reveal other clients or internal admin operations)'}.
Current Active Tab: "${currentTab}".
Currency: LKR. Tone: crisp, warm, ultra-helpful, concise (2-4 sentences max for reply).
You physically fly across the screen and point at exact UI elements! Whenever relevant, include 1 to 3 "stops" using ONLY valid tabs and target anchors from this list:
${allowedAnchors}

LIVE DATABASE SNAPSHOT (truthful — do NOT invent numbers not present here):
${JSON.stringify(snapshot)}

Respond ONLY with valid JSON matching this exact schema:
{
  "reply": "Short, clear, actionable response using live facts.",
  "mood": "guiding" | "celebrate" | "alert" | "idle",
  "suggestions": ["2 to 3 short follow-up prompt chips (max 7 words each)"],
  "stops": [
    { "tab": "valid_tab", "target": "valid_target_anchor", "title": "Short 3-5 word step title", "caption": "1 concise sentence telling user what to click or review here." }
  ]
}`;

  const contents = [
    ...(Array.isArray(history) ? history.slice(-6) : []).map((h) => ({
      role: h.role === 'model' ? 'model' : 'user',
      parts: [{ text: String(h.text || '').slice(0, 500) }],
    })),
    { role: 'user', parts: [{ text: question.slice(0, 800) }] },
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model
    )}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.4,
          maxOutputTokens: 650,
        },
      }),
    });

    if (!res.ok) return null;
    const data: any = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const parsed = JSON.parse(rawText);
    const validMoods = ['idle', 'guiding', 'thinking', 'celebrate', 'alert'];
    return {
      reply: String(parsed.reply || 'Here is what I found for you.'),
      mood: validMoods.includes(parsed.mood) ? parsed.mood : 'guiding',
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions.slice(0, 3).map((s: any) => String(s))
        : [],
      stops: Array.isArray(parsed.stops)
        ? parsed.stops
            .slice(0, 3)
            .filter((s: any) => s && typeof s.target === 'string')
            .map((s: any) => ({
              tab: typeof s.tab === 'string' ? s.tab : undefined,
              target: String(s.target),
              title: String(s.title || 'Next Step'),
              caption: String(s.caption || ''),
            }))
        : [],
      ai_powered: true,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// POST /api/ai/ask - MONO Spatial Companion live AI query + guided flight stops
router.post('/ask', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id || 'anon';
    const isAdminUser = req.user?.role === 'admin';

    if (!checkRateLimit(userId, isAdminUser)) {
      res.status(429).json({ error: 'MONO hourly query limit reached. Please try again shortly.' });
      return;
    }

    const question = String(req.body?.question || '').trim();
    const currentTab = String(req.body?.currentTab || (isAdminUser ? 'overview' : 'projects'));
    const history = Array.isArray(req.body?.history) ? req.body.history : [];

    if (!question) {
      res.status(400).json({ error: 'question is required' });
      return;
    }

    // Strict tenant isolation: clients can NEVER request admin mode or another client's ID
    const requestedMode = req.body?.mode === 'client' ? 'client' : 'admin';
    const effectiveMode: 'admin' | 'client' = isAdminUser ? requestedMode : 'client';
    const targetClientId =
      effectiveMode === 'client'
        ? isAdminUser && typeof req.body?.clientId === 'string' && req.body.clientId.trim()
          ? req.body.clientId.trim()
          : userId
        : null;

    const snapshot =
      effectiveMode === 'admin'
        ? await loadAdminSnapshot()
        : await loadClientSnapshot(targetClientId!);

    const geminiAnswer = await callGeminiMono(effectiveMode, question, currentTab, snapshot, history);
    if (geminiAnswer) {
      res.json(geminiAnswer);
      return;
    }

    const fallback =
      effectiveMode === 'admin'
        ? buildFallbackAdminResponse(question, snapshot)
        : buildFallbackClientResponse(question, snapshot);

    res.json(fallback);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'MONO assistant failed' });
  }
});

export default router;
