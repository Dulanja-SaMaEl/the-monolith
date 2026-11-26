import {
  PortalProject,
  ProjectPaymentPlan,
  BillingDocument,
  ExecutiveTask,
  ProjectChangeRequest,
  MeetingRequest,
  ContactInquiry,
  ProjectRequest,
} from '../../../lib/portalStore';
import { MonoMood } from './MonoCharacter';

export type MonoRole = 'admin' | 'client';

export interface MonoStop {
  id?: string;
  tab?: string;
  target: string;
  title: string;
  caption: string;
  mood?: MonoMood;
}

export interface MonoSuggestionCard {
  id: string;
  category: 'Action' | 'Update Idea' | 'Alert' | 'Guide';
  title: string;
  detail: string;
  mood: MonoMood;
  stop: MonoStop;
}

export interface MonoAskResult {
  reply: string;
  mood: MonoMood;
  suggestions: string[];
  stops: MonoStop[];
  ai_powered: boolean;
}

export interface AdminRadarInput {
  projects: PortalProject[];
  tasks: ExecutiveTask[];
  paymentPlans: ProjectPaymentPlan[];
  billingDocs: BillingDocument[];
  changeRequests: ProjectChangeRequest[];
  meetings: MeetingRequest[];
  inquiries: ContactInquiry[];
  requests: ProjectRequest[];
}

export interface ClientRadarInput {
  clientName: string;
  projects: PortalProject[];
  paymentPlans: ProjectPaymentPlan[];
  billingDocs: BillingDocument[];
  changeRequests: ProjectChangeRequest[];
  meetings: MeetingRequest[];
}

const getTodayLocalYmd = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export function buildAdminProactiveRadar(data: AdminRadarInput): MonoSuggestionCard[] {
  const cards: MonoSuggestionCard[] = [];
  const today = getTodayLocalYmd();

  // 1. Unquoted Client Change Requests (Highest priority — revenue + trust)
  const unquotedCrs = data.changeRequests.filter((cr) => cr.status === 'requested');
  if (unquotedCrs.length > 0) {
    cards.push({
      id: `admin-cr-${unquotedCrs.length}`,
      category: 'Alert',
      title: `${unquotedCrs.length} Change Request${unquotedCrs.length > 1 ? 's' : ''} Need an Impact Card`,
      detail: `"${unquotedCrs[0].title}" is waiting for your LKR cost & timeline quote.`,
      mood: 'alert',
      stop: {
        tab: 'projects',
        target: 'admin-projects-list',
        title: 'Send Change Request Impact Card',
        caption: `Open "${unquotedCrs[0].project_title || 'the project'}" and tap "Send Impact Card" so the client can approve in 1 click.`,
        mood: 'alert',
      },
    });
  }

  // 2. Unfinished / Past-Due Daily Sprint Tasks
  const openTasks = data.tasks.filter((t) => !t.is_completed);
  const pastOpen = openTasks.filter((t) => t.task_date && t.task_date < today);
  if (pastOpen.length > 0) {
    cards.push({
      id: `admin-past-tasks-${pastOpen.length}`,
      category: 'Action',
      title: `Roll Over ${pastOpen.length} Unfinished Task${pastOpen.length > 1 ? 's' : ''}`,
      detail: `Carry incomplete tasks from earlier dates into today's sprint cleanly.`,
      mood: 'guiding',
      stop: {
        tab: 'tasks',
        target: 'admin-task-rollover',
        title: 'Clear or Roll Over Sprint Queue',
        caption: 'Use "Roll Over Remaining →" or "Tomorrow →" to move pending tasks cleanly to the next day.',
        mood: 'guiding',
      },
    });
  } else if (openTasks.length > 0) {
    cards.push({
      id: `admin-open-tasks-${openTasks.length}`,
      category: 'Action',
      title: `${openTasks.length} Open Sprint Task${openTasks.length > 1 ? 's' : ''} Active`,
      detail: `Next up: "${openTasks[0].title}" (${openTasks[0].assignee.split(' ')[0]}).`,
      mood: 'guiding',
      stop: {
        tab: 'tasks',
        target: 'admin-add-task-btn',
        title: 'Daily Executive Sprint Queue',
        caption: 'Tick off completed tasks for Dulanja & Remashi, or add new deliverables right here.',
        mood: 'guiding',
      },
    });
  }

  // 3. Pending Inbox (New Inquiries / Meetings / Commissions)
  const pendingInbox =
    data.inquiries.filter((i) => i.status === 'new').length +
    data.meetings.filter((m) => m.status === 'pending').length +
    data.requests.filter((r) => r.status === 'pending_review').length;
  if (pendingInbox > 0) {
    cards.push({
      id: `admin-inbox-${pendingInbox}`,
      category: 'Alert',
      title: `${pendingInbox} New Inbox / Call Item${pendingInbox > 1 ? 's' : ''}`,
      detail: 'Unanswered contact briefs, consultation bookings, or project commissions are waiting.',
      mood: 'alert',
      stop: {
        tab: 'requests',
        target: 'admin-nav-requests',
        title: 'Triage Inbox & Calls',
        caption: 'Confirm meeting links and respond to new client inquiries from this unified 3-tab inbox.',
        mood: 'alert',
      },
    });
  }

  // 4. Projects missing Live Production URL (suggest activating 24/7 Heartbeat!)
  const missingProd = data.projects.filter((p) => !p.production_url);
  if (missingProd.length > 0) {
    cards.push({
      id: `admin-heartbeat-setup-${missingProd[0].id}`,
      category: 'Update Idea',
      title: `Enable 24/7 Heartbeat on ${missingProd[0].code_name}`,
      detail: `Add a Production URL inside Edit & Vault so ${missingProd[0].client_name} sees live SSL & uptime telemetry.`,
      mood: 'guiding',
      stop: {
        tab: 'projects',
        target: 'admin-projects-list',
        title: 'Configure Project Vault & Heartbeat',
        caption: `Click "Edit & Vault" on "${missingProd[0].title}" and paste its live https:// URL to activate 24/7 monitoring.`,
        mood: 'guiding',
      },
    });
  }

  // 5. Projects without a Payment Package yet (Upsell / Billing Hygiene)
  const projWithoutPlan = data.projects.find(
    (p) => !data.paymentPlans.some((pl) => pl.project_id === p.id)
  );
  if (projWithoutPlan) {
    cards.push({
      id: `admin-plan-idea-${projWithoutPlan.id}`,
      category: 'Update Idea',
      title: `Attach a Payment Plan to ${projWithoutPlan.code_name}`,
      detail: `Let ${projWithoutPlan.client_name} track paid vs. remaining LKR, due dates, and official receipts.`,
      mood: 'guiding',
      stop: {
        tab: 'payments',
        target: 'admin-new-plan-btn',
        title: 'Create Project Payment Package',
        caption: `Click "+ New Payment Package" to set up a One-Time, Monthly Retainer, or Installment schedule for ${projWithoutPlan.title}.`,
        mood: 'guiding',
      },
    });
  }

  // 6. Quotations ready to convert to Invoices
  const openQuotes = data.billingDocs.filter((d) => d.type === 'quotation' && d.status !== 'paid');
  if (openQuotes.length > 0) {
    cards.push({
      id: `admin-quote-convert-${openQuotes[0].id}`,
      category: 'Guide',
      title: `1-Click Convert Quote ${openQuotes[0].document_number}`,
      detail: 'Turn any approved quotation directly into an LKR Invoice without retyping line items.',
      mood: 'guiding',
      stop: {
        tab: 'billing',
        target: 'admin-billing-composer-btn',
        title: 'Invoices & Quotations Hub',
        caption: 'Click "Convert → Invoice" on any quotation below, or click here to issue a fresh LKR voucher.',
        mood: 'guiding',
      },
    });
  }

  // Always include a clean Cashflow HUD check if list is short
  if (cards.length < 3) {
    cards.push({
      id: 'admin-cashflow-tour',
      category: 'Guide',
      title: 'Review 6-Month Cashflow Forecast',
      detail: 'See collected LKR this month, expected upcoming due dates, and overdue receivables.',
      mood: 'idle',
      stop: {
        tab: 'overview',
        target: 'admin-cashflow-hud',
        title: 'Cashflow Forecast HUD',
        caption: 'Track monthly collections and projected receivables at a glance right here.',
        mood: 'guiding',
      },
    });
  }

  return cards.slice(0, 5);
}

export function buildClientProactiveRadar(data: ClientRadarInput): MonoSuggestionCard[] {
  const cards: MonoSuggestionCard[] = [];

  // 1. Change Request Impact Cards awaiting client approval
  const quotedCrs = data.changeRequests.filter((cr) => cr.status === 'quoted');
  if (quotedCrs.length > 0) {
    cards.push({
      id: `client-cr-ready-${quotedCrs[0].id}`,
      category: 'Alert',
      title: `Impact Card Ready: "${quotedCrs[0].title}"`,
      detail: `${
        quotedCrs[0].is_complimentary
          ? 'Complimentary (LKR 0)'
          : `${quotedCrs[0].currency} ${quotedCrs[0].estimated_cost.toLocaleString()}`
      } · ${
        quotedCrs[0].timeline_impact_days > 0 ? `+${quotedCrs[0].timeline_impact_days} Days` : 'No Delay'
      }. Ready for 1-tap approval.`,
      mood: 'alert',
      stop: {
        tab: 'projects',
        target: 'client-change-request-btn',
        title: 'Review Your Impact Card',
        caption: 'Inspect the exact LKR cost and timeline impact below, then tap "Approve & Add to Build ✓" when ready.',
        mood: 'alert',
      },
    });
  }

  // 2. Live System Heartbeat highlight (when a project has production_url)
  const liveProj = data.projects.find((p) => Boolean(p.production_url));
  if (liveProj) {
    cards.push({
      id: `client-heartbeat-${liveProj.id}`,
      category: 'Guide',
      title: 'Check Your 24/7 Live System Heartbeat',
      detail: `See real-time response speed & SSL validity for ${liveProj.title}.`,
      mood: 'celebrate',
      stop: {
        tab: 'projects',
        target: 'client-heartbeat-monitor',
        title: '24/7 Live System Heartbeat',
        caption: 'Monolith LK monitors your live production endpoint & SSL certificate here — tap "Check Now" anytime!',
        mood: 'celebrate',
      },
    });
  }

  // 3. Payment Progress & Renewal Shield Calendar Sync
  if (data.paymentPlans.length > 0) {
    const nextDue = data.paymentPlans.find((p) => p.next_due_date && p.status !== 'completed');
    cards.push({
      id: 'client-payments-guide',
      category: nextDue ? 'Action' : 'Guide',
      title: nextDue ? `Sync Due Date (${nextDue.next_due_date}) to Calendar` : 'View Payment Progress & Receipts',
      detail: nextDue
        ? '1-tap "+ Calendar" saves automatic reminders to Apple or Google Calendar.'
        : 'Download Official Payment Receipt PDFs for your records anytime.',
      mood: 'guiding',
      stop: {
        tab: 'payments',
        target: 'client-payment-summary',
        title: 'Payments, Receipts & Calendar Sync',
        caption: 'Track your paid vs. remaining LKR balance, download Official Receipts, and tap "+ Calendar" on due dates.',
        mood: 'guiding',
      },
    });
  }

  // 4. Request a Tweak / Feature Upgrade
  if (data.projects.length > 0) {
    cards.push({
      id: 'client-request-tweak',
      category: 'Update Idea',
      title: 'Need a Tweak or New Feature?',
      detail: 'Request any enhancement inside your project and get a transparent LKR & timeline card first.',
      mood: 'guiding',
      stop: {
        tab: 'projects',
        target: 'client-change-request-btn',
        title: 'Zero-Surprise Feature Add-Ons',
        caption: 'Click "+ Request Tweak / New Feature" to ask for any upgrade — you approve cost & days before work starts.',
        mood: 'guiding',
      },
    });
  }

  // 5. Invoices & Quotations PDF Download
  if (data.billingDocs.length > 0) {
    cards.push({
      id: 'client-billing-docs',
      category: 'Guide',
      title: `Access ${data.billingDocs.length} Invoice / Quotation File${data.billingDocs.length > 1 ? 's' : ''}`,
      detail: 'Preview or save clean PDF vouchers with meaningful filenames.',
      mood: 'idle',
      stop: {
        tab: 'billing',
        target: 'client-tab-billing',
        title: 'Invoices & Quotations',
        caption: 'Open this tab to view, print to PDF, or sync unpaid invoice due dates to your phone calendar.',
        mood: 'guiding',
      },
    });
  }

  // 6. Book a Sprint Review / Consultation
  if (cards.length < 3) {
    cards.push({
      id: 'client-meetings-guide',
      category: 'Guide',
      title: 'Book a Live Session with Monolith LK',
      detail: 'Schedule a Sprint Review or Architecture Call in Sri Lanka time (UTC+5:30).',
      mood: 'idle',
      stop: {
        tab: 'meetings',
        target: 'client-tab-meetings',
        title: 'Schedule Consultation',
        caption: 'Pick a slot with Dulanja & Remashi and add confirmed calls straight to your calendar.',
        mood: 'guiding',
      },
    });
  }

  return cards.slice(0, 5);
}

export function resolveOfflineMonoQuery(
  role: MonoRole,
  question: string,
  suggestions: MonoSuggestionCard[]
): MonoAskResult {
  const q = question.toLowerCase();
  const matched = suggestions.find(
    (s) =>
      s.title.toLowerCase().includes(q) ||
      s.detail.toLowerCase().includes(q) ||
      (q.includes('task') && s.stop.tab === 'tasks') ||
      ((q.includes('pay') || q.includes('receipt') || q.includes('due')) && s.stop.tab === 'payments') ||
      ((q.includes('invoice') || q.includes('quote')) && s.stop.tab === 'billing') ||
      ((q.includes('tweak') || q.includes('feature') || q.includes('change') || q.includes('heartbeat') || q.includes('vault')) &&
        s.stop.tab === 'projects') ||
      ((q.includes('meeting') || q.includes('call') || q.includes('inbox')) &&
        (s.stop.tab === 'meetings' || s.stop.tab === 'requests'))
  );

  if (matched) {
    return {
      reply: `${matched.title}: ${matched.detail} Let me fly right over and show you!`,
      mood: matched.mood,
      suggestions:
        role === 'admin'
          ? ['What should we work on today?', 'Suggest new updates to pitch clients']
          : ['How much balance is remaining?', 'How do I request a new feature?'],
      stops: [matched.stop],
      ai_powered: false,
    };
  }

  const first = suggestions[0];
  return {
    reply: first
      ? `Here's the top thing I recommend checking right now — "${first.title}". Follow me!`
      : 'I’m MONO, your Monolith LK spatial guide! Pick any suggestion below or ask where to find a feature.',
    mood: 'guiding',
    suggestions:
      role === 'admin'
        ? ['What should we work on today?', 'Suggest new updates to pitch clients', 'Show unpaid invoices']
        : ['How much balance is remaining?', 'How do I request a new feature?', 'Check live server health'],
    stops: first ? [first.stop] : [],
    ai_powered: false,
  };
}
