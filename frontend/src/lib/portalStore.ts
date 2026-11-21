// ====================================================================
// MONOLITH LK PORTAL STORE (PERSISTENT STATE & DATA ENGINE)
// ====================================================================

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'client';
  company_name?: string;
  phone?: string;
  avatar_url?: string;
  is_blocked?: boolean;
  status?: 'active' | 'blocked';
  password?: string;
}

export interface ExecutiveTask {
  id: string;
  title: string;
  assignee: string; // 'Dulanja Abeysinghe' | 'Remashi Diyana' | 'Both'
  category: string;
  priority: 'urgent' | 'high' | 'normal';
  task_date: string; // YYYY-MM-DD
  is_completed: boolean;
  completed_at?: string;
  notes?: string;
  created_at: string;
}

export interface Partner {
  id: string;
  name: string;
  category: string;
  logo_url?: string;
  website_url?: string;
  description?: string;
  is_active: boolean;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  is_completed: boolean;
  due_date?: string;
}

export interface PortalProject {
  id: string;
  client_id: string;
  client_name: string;
  title: string;
  code_name: string;
  category: string;
  status: 'discovery' | 'architecture' | 'in_progress' | 'qa_testing' | 'deployed' | 'maintenance';
  progress_percentage: number;
  staging_url?: string;
  repository_or_demo_url?: string;
  target_launch_date?: string;
  summary: string;
  milestones: ProjectMilestone[];
  created_at: string;
}

export interface BillingLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface BillingDocument {
  id: string;
  document_number: string;
  type: 'quotation' | 'invoice';
  client_id: string;
  client_name: string;
  client_contact_name?: string;
  client_email?: string;
  client_phone?: string;
  project_title?: string;
  status: 'draft' | 'sent' | 'approved' | 'paid' | 'overdue';
  currency: string;
  line_items: BillingLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  due_date: string;
  notes?: string;
  created_at: string;
}

export interface ProjectRequest {
  id: string;
  client_id: string;
  client_name: string;
  project_title: string;
  service_category: string;
  estimated_budget: string;
  target_timeline: string;
  project_scope: string;
  status: 'pending_review' | 'under_estimation' | 'approved' | 'declined';
  created_at: string;
}

export interface MeetingRequest {
  id: string;
  client_id: string;
  client_name: string;
  requested_date: string;
  requested_time: string;
  timezone: string;
  meeting_type: 'Discovery Call' | 'Sprint Review' | 'Architecture Consultation' | 'Emergency Triage';
  agenda: string;
  meeting_link?: string;
  status: 'pending' | 'confirmed' | 'rescheduled' | 'completed' | 'cancelled';
  created_at: string;
}

export interface CustomerReview {
  id: string;
  client_name: string;
  client_title: string;
  company_name: string;
  rating: number;
  review_text: string;
  is_featured: boolean;
  created_at: string;
}

export interface PortalBlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  author: string;
  read_time: string;
  cover_image: string;
  excerpt: string;
  content_markdown: string;
  is_published: boolean;
  published_at: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  company?: string;
  service_need: string;
  budget_tier?: string;
  brief: string;
  status: 'new' | 'contacted' | 'converted' | 'archived';
  created_at: string;
}

// Initial Mock Seed Data
const initialUsers: UserProfile[] = [
  {
    id: 'user-admin-01',
    email: 'admin@monolith.lk',
    full_name: 'Dulanja Abeysinghe',
    role: 'admin',
    company_name: 'Monolith LK Executive Cluster',
    phone: '+94 76 591 7189',
  },
  {
    id: 'user-client-01',
    email: 'client@shadowtopup.com',
    full_name: 'Marcus Vance',
    role: 'client',
    company_name: 'ShadowTopup Global',
    phone: '+1 415 890 2314',
  },
  {
    id: 'user-client-02',
    email: 'director@pharmacyos.lk',
    full_name: 'Dr. H. Jayasuriya',
    role: 'client',
    company_name: 'Teaching Hospitals Pharmacy OS',
    phone: '+94 81 223 4567',
  },
];

const initialPartners: Partner[] = [
  {
    id: 'part-01',
    name: 'Italic Systems',
    category: 'Design Systems & UI/UX',
    logo_url: '/assets/partner-1.png',
    website_url: 'https://italic.com',
    description: 'High-craft design systems and Haute Editorial typography standards',
    is_active: true,
  },
  {
    id: 'part-02',
    name: 'Theo Architecture',
    category: 'Enterprise Architecture',
    logo_url: '/assets/partner-2.png',
    website_url: 'https://theo.com',
    description: 'Mission-critical distributed infrastructure and micro-tier orchestration',
    is_active: true,
  },
  {
    id: 'part-03',
    name: 'Hues Cloud Platform',
    category: 'Cloud Infrastructure',
    logo_url: '/assets/partner-3.png',
    website_url: 'https://hues.com',
    description: 'Zero-downtime container clusters and multi-region event pipelines',
    is_active: true,
  },
  {
    id: 'part-04',
    name: 'Beauty Basket Global',
    category: 'E-Commerce & Retail',
    logo_url: '/client-logo-1.webp',
    website_url: 'https://beautybasket.lk',
    description: 'Omnichannel retail inventory and sub-second checkout pipelines',
    is_active: true,
  },
  {
    id: 'part-05',
    name: 'Holistica Herbal OS',
    category: 'Healthcare & Clinical',
    logo_url: '/client-logo-2.webp',
    website_url: 'https://holistica.lk',
    description: 'Clinical batch verification and pharmaceutical tracking systems',
    is_active: true,
  },
  {
    id: 'part-06',
    name: 'Apex Global Security',
    category: 'Fintech & Security',
    logo_url: '/assets/partner-4.png',
    website_url: 'https://apex.com',
    description: 'Distributed Redis mutex locking and fraud prevention engines',
    is_active: true,
  },
  {
    id: 'part-07',
    name: 'Sphere Tech Labs',
    category: 'AI & Machine Learning',
    logo_url: '/assets/partner-5.png',
    website_url: 'https://sphere.com',
    description: 'Custom vector RAG pipelines and automated LLM triage nodes',
    is_active: true,
  },
];

const initialProjects: PortalProject[] = [
  {
    id: 'proj-01',
    client_id: 'user-client-01',
    client_name: 'ShadowTopup Global',
    title: 'ShadowTopup Engine (Fintech & Gaming API)',
    code_name: 'PRJ-SHADOW-01',
    category: 'Fintech & Gaming API',
    status: 'in_progress',
    progress_percentage: 85,
    staging_url: 'https://staging.shadowtopup.com',
    repository_or_demo_url: 'https://github.com/Dulanja-SaMaEl',
    target_launch_date: '2026-12-15',
    summary: 'Automated digital gaming currency fulfillment platform connecting Next.js 14 and Laravel microservices with sub-second dispatching.',
    milestones: [
      { id: 'm-1', title: 'Architecture Blueprint & Garena API Bridge', is_completed: true, due_date: '2026-10-01' },
      { id: 'm-2', title: 'Webhook Idempotency & Redis Mutex Locks', is_completed: true, due_date: '2026-10-25' },
      { id: 'm-3', title: 'High-Frequency Load Stress Testing (50K Tx)', is_completed: true, due_date: '2026-11-15' },
      { id: 'm-4', title: 'Multi-Region Failover Cutover', is_completed: false, due_date: '2026-12-10' },
    ],
    created_at: '2026-09-15T08:00:00Z',
  },
  {
    id: 'proj-02',
    client_id: 'user-client-02',
    client_name: 'Teaching Hospitals Pharmacy OS',
    title: 'Clinical Pharmacy OS',
    code_name: 'PRJ-CLINICAL-02',
    category: 'Healthcare & Compliance',
    status: 'deployed',
    progress_percentage: 100,
    staging_url: 'https://pharmacy.monolith.lk',
    target_launch_date: '2026-11-01',
    summary: 'Prescription auditing, real-time batch and expiry tracking with hardware barcode scanning across teaching hospital dispensaries.',
    milestones: [
      { id: 'm-5', title: 'LIS Clinical Driver Bridging', is_completed: true, due_date: '2026-08-01' },
      { id: 'm-6', title: 'ACID Multi-Tier Inventory Ledger', is_completed: true, due_date: '2026-09-10' },
      { id: 'm-7', title: 'On-Site Hospital Staff Deployment', is_completed: true, due_date: '2026-10-15' },
    ],
    created_at: '2026-07-10T09:30:00Z',
  },
];

const initialBilling: BillingDocument[] = [
  {
    id: 'bill-01',
    document_number: 'INV-2026-104',
    type: 'invoice',
    client_id: 'user-client-01',
    client_name: 'ShadowTopup Global',
    project_title: 'ShadowTopup Engine',
    status: 'paid',
    currency: 'LKR',
    line_items: [
      { id: 'li-1', description: 'Phase 02: Redis Redlock Mutex & Webhook Pipeline', quantity: 1, unit_price: 1150000, total: 1150000 },
      { id: 'li-2', description: 'Sub-Second Garena Dispatch Microservices', quantity: 1, unit_price: 700000, total: 700000 },
    ],
    subtotal: 1850000,
    tax: 0,
    total: 1850000,
    due_date: '2026-11-05',
    notes: 'Paid via Commercial Bank Corporate Wire Transfer with zero ledger discrepancies.',
    created_at: '2026-10-25T10:00:00Z',
  },
  {
    id: 'bill-02',
    document_number: 'QUO-2026-088',
    type: 'quotation',
    client_id: 'user-client-01',
    client_name: 'ShadowTopup Global',
    project_title: 'Phase 03 High-Availability Cloud Cluster',
    status: 'sent',
    currency: 'LKR',
    line_items: [
      { id: 'li-3', description: 'Zero-Downtime AWS Multi-Region Failover Architecture', quantity: 1, unit_price: 1350000, total: 1350000 },
      { id: 'li-4', description: 'Dedicated SLA Telemetry & Emergency Triage (6 Months)', quantity: 6, unit_price: 225000, total: 1350000 },
    ],
    subtotal: 2700000,
    tax: 0,
    total: 2700000,
    due_date: '2026-12-01',
    notes: 'Quotation valid for 30 business days from issue date. Quoted in LKR.',
    created_at: '2026-11-18T14:20:00Z',
  },
];

const initialMeetings: MeetingRequest[] = [
  {
    id: 'meet-01',
    client_id: 'user-client-01',
    client_name: 'ShadowTopup Global',
    requested_date: '2026-11-25',
    requested_time: '15:30',
    timezone: 'Asia/Colombo (UTC+5:30)',
    meeting_type: 'Sprint Review',
    agenda: 'Reviewing throughput metrics on the 50K API load test and signing off on cutover schedule.',
    meeting_link: 'https://meet.google.com/monolith-shadow-sprint',
    status: 'confirmed',
    created_at: '2026-11-19T06:00:00Z',
  },
];

const initialRequests: ProjectRequest[] = [
  {
    id: 'req-01',
    client_id: 'user-client-01',
    client_name: 'ShadowTopup Global',
    project_title: 'Automated Wallet & LKR Settlement Ramp Microservice',
    service_category: 'Fintech & Security',
    estimated_budget: 'LKR 2,500,000 - 4,000,000',
    target_timeline: 'Q1 2027',
    project_scope: 'Require sub-second multi-currency LKR settlement gateway with JA3/JA4 TLS anti-fraud checks.',
    status: 'under_estimation',
    created_at: '2026-11-17T11:00:00Z',
  },
];

const initialReviews: CustomerReview[] = [
  {
    id: 'rev-01',
    client_name: 'Marcus Vance',
    client_title: 'VP of Global Operations',
    company_name: 'ShadowTopup Global',
    rating: 5,
    review_text: 'Monolith LK transformed our fulfillment architecture. Sub-second API dispatches and zero double-claim errors across 50,000+ live transactions.',
    is_featured: true,
    created_at: '2026-11-10T12:00:00Z',
  },
  {
    id: 'rev-02',
    client_name: 'Dr. H. Jayasuriya',
    client_title: 'Chief Medical Director',
    company_name: 'Clinical Pharmacy OS',
    rating: 5,
    review_text: 'The zero-leak prescription and batch-tracking system completely eliminated drug expiry waste across all teaching hospitals. Uncompromising precision.',
    is_featured: true,
    created_at: '2026-11-05T09:00:00Z',
  },
  {
    id: 'rev-03',
    client_name: 'Damian Cruz',
    client_title: 'Managing Director',
    company_name: 'The Menu Enterprise',
    rating: 5,
    review_text: 'Real-time WebSocket kitchen display systems with zero reload latency. The Haute Editorial styling gave our brand the premium prestige we required.',
    is_featured: true,
    created_at: '2026-10-28T15:00:00Z',
  },
];

const initialBlogPosts: PortalBlogPost[] = [
  {
    id: 'post-01',
    slug: 'distributed-redis-mutex-zero-loss',
    title: 'Distributed Redis Mutex & Zero-Loss Ledger Locks at Scale',
    category: 'Architecture',
    author: 'Dulanja Abeysinghe',
    read_time: '6 min read',
    cover_image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
    excerpt: 'How we engineered sub-second idempotent transaction pipelines handling 50K+ live requests with zero duplicate fulfillments.',
    content_markdown: `When operating high-frequency gaming fulfillment and fintech bridges, race conditions are the number one failure point. A client double-clicking a payout or a transient network retry can easily result in duplicate disbursements.

In this deep dive, we explore how Monolith LK implements Redlock distributed mutexes across Redis clusters with TTL guards, ensuring absolute idempotency even under chaotic peak loads.`,
    is_published: true,
    published_at: '2026-11-15T10:00:00Z',
  },
  {
    id: 'post-02',
    slug: 'haute-editorial-digital-spaces',
    title: 'Haute Editorial: Bringing Tactile Print Restraint to High-Performance Web',
    category: 'Design Strategy',
    author: 'Remashi Diyana',
    read_time: '4 min read',
    cover_image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80',
    excerpt: 'Why enterprise interfaces must transcend generic purple-gradient templates in favor of structured Swiss typography and architectural hairline precision.',
    content_markdown: `Modern web interfaces have largely collapsed into generic tropes: rounded colorful blobs, unstyled cards, and noisy micro-interactions.

Haute Editorial rejects the noise. By applying an 8pt architectural grid, warm monochromatic hues, and calculated typography inspired by high fashion print periodicals, we create software that feels authoritative and enduring.`,
    is_published: true,
    published_at: '2026-11-10T14:30:00Z',
  },
];

// Local Storage Helper (v2 key namespace clears pre-LKR cached items cleanly)
const getStored = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(`monolith_v2_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Failed to load ${key} from storage:`, e);
    return fallback;
  }
};

const setStored = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`monolith_v2_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
};

const todayDate = new Date().toISOString().split('T')[0];

const initialTasks: ExecutiveTask[] = [
  {
    id: 'task-01',
    title: 'Review ShadowTopup high-concurrency Redis mutex stress tests',
    assignee: 'Dulanja Abeysinghe',
    category: 'Architecture',
    priority: 'urgent',
    task_date: todayDate,
    is_completed: false,
    notes: 'Verify zero double-claim locks during 50,000 throughput test.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'task-02',
    title: 'Audit Haute Editorial component tokens & responsive breakpoints',
    assignee: 'Remashi Diyana',
    category: 'UI/UX Design',
    priority: 'high',
    task_date: todayDate,
    is_completed: false,
    notes: 'Verify mobile 8pt spatial grid adherence on all viewport widths.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'task-03',
    title: 'Finalize Teaching Hospitals Pharmacy OS cold-storage deployment brief',
    assignee: 'Both',
    category: 'Operations',
    priority: 'high',
    task_date: todayDate,
    is_completed: false,
    notes: 'Coordinate with Dr. Jayasuriya on regional hardware cutover schedule.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'task-04',
    title: 'Verify LKR VAT invoice calculation engine with CEFTS narrative routing',
    assignee: 'Dulanja Abeysinghe',
    category: 'Infrastructure',
    priority: 'normal',
    task_date: todayDate,
    is_completed: false,
    notes: 'Check automatic invoice PDF generator formatting.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'task-05',
    title: 'Review new inbound project commission inquiries from Ceylon Logistics',
    assignee: 'Remashi Diyana',
    category: 'Operations',
    priority: 'normal',
    task_date: todayDate,
    is_completed: false,
    notes: 'Prepare formal quotation scope document.',
    created_at: new Date().toISOString(),
  },
];

// Data Store API
export const portalStore = {
  // Users & Profiles
  getUsers: (): UserProfile[] => getStored('users', initialUsers),
  addUser: (user: Omit<UserProfile, 'id'>): UserProfile => {
    const users = portalStore.getUsers();
    const newUser: UserProfile = { ...user, id: `user-${Date.now()}` };
    setStored('users', [newUser, ...users]);
    return newUser;
  },
  updateUser: (id: string, updates: Partial<Pick<UserProfile, 'full_name' | 'company_name' | 'phone' | 'is_blocked' | 'status'>>): UserProfile | null => {
    let updated: UserProfile | null = null;
    const list = portalStore.getUsers().map((u) => {
      if (u.id === id) {
        updated = { ...u, ...updates };
        return updated;
      }
      return u;
    });
    setStored('users', list);
    return updated;
  },
  updateUserPassword: (id: string, newPassword: string): boolean => {
    const list = portalStore.getUsers().map((u) => {
      if (u.id === id) {
        return { ...u, password: newPassword };
      }
      return u;
    });
    setStored('users', list);
    return true;
  },
  toggleUserBlock: (id: string, is_blocked: boolean): UserProfile | null => {
    let updated: UserProfile | null = null;
    const list = portalStore.getUsers().map((u) => {
      if (u.id === id) {
        updated = {
          ...u,
          is_blocked,
          status: is_blocked ? 'blocked' : 'active',
        };
        return updated;
      }
      return u;
    });
    setStored('users', list);
    return updated;
  },
  deleteUser: (id: string): void => {
    const list = portalStore.getUsers().filter((u) => u.id !== id);
    setStored('users', list);
  },

  // Partners
  getPartners: (): Partner[] => getStored('partners', initialPartners),
  addPartner: (partner: Omit<Partner, 'id'>): Partner => {
    const list = portalStore.getPartners();
    const newPartner: Partner = { ...partner, id: `part-${Date.now()}` };
    setStored('partners', [newPartner, ...list]);
    return newPartner;
  },
  updatePartner: (id: string, updates: Partial<Partner>): Partner | null => {
    let updated: Partner | null = null;
    const list = portalStore.getPartners().map((p) => {
      if (p.id === id) {
        updated = { ...p, ...updates };
        return updated;
      }
      return p;
    });
    setStored('partners', list);
    return updated;
  },
  deletePartner: (id: string): void => {
    const list = portalStore.getPartners().filter((p) => p.id !== id);
    setStored('partners', list);
  },
  togglePartnerStatus: (id: string): void => {
    const list = portalStore.getPartners().map((p) =>
      p.id === id ? { ...p, is_active: !p.is_active } : p
    );
    setStored('partners', list);
  },

  // Projects
  getProjects: (clientId?: string): PortalProject[] => {
    const list = getStored('projects', initialProjects);
    return clientId ? list.filter((p) => p.client_id === clientId) : list;
  },
  addProject: (project: Omit<PortalProject, 'id' | 'created_at'>): PortalProject => {
    const list = portalStore.getProjects();
    const newProject: PortalProject = {
      ...project,
      id: `proj-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setStored('projects', [newProject, ...list]);
    return newProject;
  },
  updateProjectProgress: (
    id: string,
    updates: Partial<Pick<PortalProject, 'status' | 'progress_percentage' | 'staging_url' | 'summary' | 'milestones'>>
  ): PortalProject | null => {
    const list = portalStore.getProjects();
    let updated: PortalProject | null = null;
    const newList = list.map((p) => {
      if (p.id === id) {
        updated = { ...p, ...updates };
        return updated;
      }
      return p;
    });
    setStored('projects', newList);
    return updated;
  },
  updateProject: (id: string, updates: Partial<PortalProject>): PortalProject | null => {
    const list = portalStore.getProjects();
    let updated: PortalProject | null = null;
    const newList = list.map((p) => {
      if (p.id === id) {
        updated = { ...p, ...updates };
        return updated;
      }
      return p;
    });
    setStored('projects', newList);
    return updated;
  },
  deleteProject: (id: string): void => {
    const list = portalStore.getProjects().filter((p) => p.id !== id);
    setStored('projects', list);
  },

  // Billing Documents (Invoices & Quotations)
  getBillingDocuments: (clientId?: string): BillingDocument[] => {
    const users = portalStore.getUsers();
    const list = getStored('billing', initialBilling).map((d) => {
      if (d.client_contact_name && d.client_email) return d;
      const client = users.find((u) => u.id === d.client_id);
      if (!client) return d;
      return {
        ...d,
        client_contact_name: d.client_contact_name || client.full_name,
        client_email: d.client_email || client.email,
        client_phone: d.client_phone || client.phone,
      };
    });
    return clientId ? list.filter((d) => d.client_id === clientId) : list;
  },
  createBillingDocument: (
    doc: Omit<BillingDocument, 'id' | 'document_number' | 'created_at'>
  ): BillingDocument => {
    const list = portalStore.getBillingDocuments();
    const prefix = doc.type === 'invoice' ? 'INV' : 'QUO';
    const rand = Math.floor(100 + Math.random() * 900);
    const document_number = `${prefix}-2026-${rand}`;
    const newDoc: BillingDocument = {
      ...doc,
      id: `bill-${Date.now()}`,
      document_number,
      created_at: new Date().toISOString(),
    };
    setStored('billing', [newDoc, ...list]);
    return newDoc;
  },
  updateBillingStatus: (id: string, status: BillingDocument['status']): void => {
    const list = portalStore.getBillingDocuments().map((d) =>
      d.id === id ? { ...d, status } : d
    );
    setStored('billing', list);
  },
  deleteBillingDocument: (id: string): void => {
    const list = portalStore.getBillingDocuments().filter((d) => d.id !== id);
    setStored('billing', list);
  },

  // Project Requests
  getProjectRequests: (clientId?: string): ProjectRequest[] => {
    const list = getStored('requests', initialRequests);
    return clientId ? list.filter((r) => r.client_id === clientId) : list;
  },
  submitProjectRequest: (
    req: Omit<ProjectRequest, 'id' | 'status' | 'created_at'>
  ): ProjectRequest => {
    const list = portalStore.getProjectRequests();
    const newReq: ProjectRequest = {
      ...req,
      id: `req-${Date.now()}`,
      status: 'pending_review',
      created_at: new Date().toISOString(),
    };
    setStored('requests', [newReq, ...list]);
    return newReq;
  },
  updateProjectRequestStatus: (id: string, status: ProjectRequest['status']): void => {
    const list = portalStore.getProjectRequests().map((r) =>
      r.id === id ? { ...r, status } : r
    );
    setStored('requests', list);
  },

  // Meetings
  getMeetings: (clientId?: string): MeetingRequest[] => {
    const list = getStored('meetings', initialMeetings);
    return clientId ? list.filter((m) => m.client_id === clientId) : list;
  },
  scheduleMeeting: (
    meeting: Omit<MeetingRequest, 'id' | 'status' | 'created_at'>
  ): MeetingRequest => {
    const list = portalStore.getMeetings();
    const newMeeting: MeetingRequest = {
      ...meeting,
      id: `meet-${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    setStored('meetings', [newMeeting, ...list]);
    return newMeeting;
  },
  updateMeetingStatus: (id: string, status: MeetingRequest['status'], meeting_link?: string): void => {
    const list = portalStore.getMeetings().map((m) =>
      m.id === id ? { ...m, status, ...(meeting_link ? { meeting_link } : {}) } : m
    );
    setStored('meetings', list);
  },

  // Customer Reviews
  getReviews: (featuredOnly = false): CustomerReview[] => {
    const list = getStored('reviews', initialReviews);
    return featuredOnly ? list.filter((r) => r.is_featured) : list;
  },
  addReview: (review: Omit<CustomerReview, 'id' | 'created_at'>): CustomerReview => {
    const list = portalStore.getReviews();
    const newReview: CustomerReview = {
      ...review,
      id: `rev-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setStored('reviews', [newReview, ...list]);
    return newReview;
  },
  toggleReviewFeatured: (id: string): void => {
    const list = portalStore.getReviews().map((r) =>
      r.id === id ? { ...r, is_featured: !r.is_featured } : r
    );
    setStored('reviews', list);
  },
  updateReview: (id: string, updates: Partial<CustomerReview>): CustomerReview | null => {
    let updated: CustomerReview | null = null;
    const list = portalStore.getReviews().map((r) => {
      if (r.id === id) {
        updated = { ...r, ...updates };
        return updated;
      }
      return r;
    });
    setStored('reviews', list);
    return updated;
  },
  deleteReview: (id: string): void => {
    const list = portalStore.getReviews().filter((r) => r.id !== id);
    setStored('reviews', list);
  },

  // Blog Posts
  getBlogPosts: (publishedOnly = false): PortalBlogPost[] => {
    const list = getStored('blog_posts', initialBlogPosts);
    return publishedOnly ? list.filter((b) => b.is_published) : list;
  },
  addBlogPost: (post: Omit<PortalBlogPost, 'id' | 'published_at'>): PortalBlogPost => {
    const list = portalStore.getBlogPosts();
    const newPost: PortalBlogPost = {
      ...post,
      id: `post-${Date.now()}`,
      published_at: new Date().toISOString(),
    };
    setStored('blog_posts', [newPost, ...list]);
    return newPost;
  },
  updateBlogPost: (id: string, updates: Partial<PortalBlogPost>): void => {
    const list = portalStore.getBlogPosts().map((b) =>
      b.id === id ? { ...b, ...updates } : b
    );
    setStored('blog_posts', list);
  },
  deleteBlogPost: (id: string): void => {
    const list = portalStore.getBlogPosts().filter((b) => b.id !== id);
    setStored('blog_posts', list);
  },

  // Contact Inquiries
  getInquiries: (): ContactInquiry[] => getStored('inquiries', []),
  submitInquiry: (inquiry: Omit<ContactInquiry, 'id' | 'status' | 'created_at'>): ContactInquiry => {
    const list = portalStore.getInquiries();
    const newInq: ContactInquiry = {
      ...inquiry,
      id: `inq-${Date.now()}`,
      status: 'new',
      created_at: new Date().toISOString(),
    };
    setStored('inquiries', [newInq, ...list]);
    return newInq;
  },
  updateInquiryStatus: (id: string, status: ContactInquiry['status']): void => {
    const list = portalStore.getInquiries().map((i) =>
      i.id === id ? { ...i, status } : i
    );
    setStored('inquiries', list);
  },

  // Executive Daily Tasks (Dulanja Abeysinghe & Remashi Diyana)
  getTasks: (date?: string, assignee?: string): ExecutiveTask[] => {
    let list = getStored('tasks', initialTasks);
    if (date) {
      list = list.filter((t) => t.task_date === date);
    }
    if (assignee && assignee !== 'all') {
      list = list.filter((t) => t.assignee === assignee || t.assignee.includes('Both'));
    }
    return list;
  },
  createTask: (task: Omit<ExecutiveTask, 'id' | 'created_at'>): ExecutiveTask => {
    const list = getStored('tasks', initialTasks);
    const newTask: ExecutiveTask = {
      ...task,
      id: `task-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setStored('tasks', [newTask, ...list]);
    return newTask;
  },
  updateTask: (id: string, updates: Partial<ExecutiveTask>): ExecutiveTask | null => {
    const list = getStored('tasks', initialTasks);
    let updated: ExecutiveTask | null = null;
    const newList = list.map((t) => {
      if (t.id === id) {
        updated = { ...t, ...updates };
        return updated;
      }
      return t;
    });
    setStored('tasks', newList);
    return updated;
  },
  toggleTask: (id: string, is_completed: boolean): ExecutiveTask | null => {
    const list = getStored('tasks', initialTasks);
    let updated: ExecutiveTask | null = null;
    const newList = list.map((t) => {
      if (t.id === id) {
        updated = {
          ...t,
          is_completed,
          completed_at: is_completed ? new Date().toISOString() : undefined,
        };
        return updated;
      }
      return t;
    });
    setStored('tasks', newList);
    return updated;
  },
  rolloverTasks: (fromDate: string, toDate: string): ExecutiveTask[] => {
    const list = getStored('tasks', initialTasks);
    const rolledOver: ExecutiveTask[] = [];
    const newList = list.map((t) => {
      if (t.task_date === fromDate && !t.is_completed) {
        const u = { ...t, task_date: toDate };
        rolledOver.push(u);
        return u;
      }
      return t;
    });
    setStored('tasks', newList);
    return rolledOver;
  },
  deleteTask: (id: string): void => {
    const list = getStored('tasks', initialTasks).filter((t) => t.id !== id);
    setStored('tasks', list);
  },
};
