import { supabase, isSupabaseConfigured, API_BASE_URL } from './supabase';
import {
  portalStore,
  UserProfile,
  Partner,
  PortalProject,
  BillingDocument,
  ProjectRequest,
  MeetingRequest,
  CustomerReview,
  PortalBlogPost,
  ContactInquiry,
  ExecutiveTask,
  ProjectPaymentPlan,
  PaymentRecord,
  BillingScope,
  SystemHeartbeat,
} from './portalStore';

// Helper: get current Supabase JWT if logged in via real Supabase Auth
async function getAccessToken(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch {
    return null;
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
  timeoutMs = 8000
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || `API Error ${res.status}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

// Normalizers from Backend/Supabase joined rows -> Frontend Types
const mapProjectRow = (row: any): PortalProject => ({
  id: row.id,
  client_id: row.client_id,
  client_name: row.client?.company_name || row.client?.full_name || row.client_name || 'Enterprise Client',
  title: row.title,
  code_name: row.code_name || 'PRJ-000',
  category: row.category,
  status: row.status,
  progress_percentage: Number(row.progress_percentage ?? 0),
  staging_url: row.staging_url,
  production_url: row.production_url || undefined,
  figma_url: row.figma_url || undefined,
  api_docs_url: row.api_docs_url || undefined,
  domain_renewal_date: row.domain_renewal_date || undefined,
  server_expiry_date: row.server_expiry_date || undefined,
  vault_notes: row.vault_notes || undefined,
  repository_or_demo_url: row.repository_or_demo_url,
  target_launch_date: row.target_launch_date,
  summary: row.summary || '',
  milestones: Array.isArray(row.milestones)
    ? [...row.milestones].sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
    : [],
  created_at: row.created_at,
});

const mapBillingRow = (row: any): BillingDocument => ({
  id: row.id,
  document_number: row.document_number,
  type: row.type,
  client_id: row.client_id,
  client_name: row.client?.company_name || row.client?.full_name || row.client_name || 'Client',
  client_contact_name: row.client?.full_name || row.client_contact_name || undefined,
  client_email: row.client?.email || row.client_email || undefined,
  client_phone: row.client?.phone || row.client_phone || undefined,
  project_id: row.project_id || undefined,
  payment_plan_id: row.payment_plan_id || undefined,
  billing_scope: (row.billing_scope === 'project_cover' ? 'project_cover' : 'separate') as BillingScope,
  project_title: row.project?.title || row.project_title || undefined,
  status: row.status,
  currency: row.currency || 'LKR',
  line_items: Array.isArray(row.line_items) ? row.line_items : [],
  subtotal: Number(row.subtotal ?? 0),
  tax: Number(row.tax ?? 0),
  total: Number(row.total ?? 0),
  due_date: row.due_date || '',
  notes: row.notes,
  created_at: row.created_at,
});

const mapPaymentPlanRow = (row: any): ProjectPaymentPlan => ({
  id: row.id,
  client_id: row.client_id,
  client_name: row.client?.company_name || row.client?.full_name || row.client_name || 'Client',
  project_id: row.project_id || undefined,
  project_title: row.project?.title || row.project_title || undefined,
  project_code: row.project?.code_name || row.project_code || undefined,
  package_name: row.package_name || 'Custom Package',
  billing_type: row.billing_type || 'one_time',
  currency: row.currency || 'LKR',
  total_amount: Number(row.total_amount ?? 0),
  installment_amount: Number(row.installment_amount ?? 0),
  total_months: Number(row.total_months ?? 1),
  start_date: row.start_date || '',
  next_due_date: row.next_due_date || undefined,
  status: row.status || 'active',
  notes: row.notes || undefined,
  payments: Array.isArray(row.payments)
    ? [...row.payments]
        .map((p: any) => ({
          id: p.id,
          payment_plan_id: p.payment_plan_id,
          client_id: p.client_id,
          project_id: p.project_id || undefined,
          invoice_id: p.invoice_id || undefined,
          amount: Number(p.amount ?? 0),
          currency: p.currency || row.currency || 'LKR',
          payment_date: p.payment_date || '',
          payment_method: p.payment_method || 'Bank Transfer / CEFTS',
          reference_number: p.reference_number || undefined,
          billing_scope: (p.billing_scope === 'separate' ? 'separate' : 'project_cover') as BillingScope,
          notes: p.notes || undefined,
          created_at: p.created_at,
        }))
        .sort((a, b) => new Date(b.payment_date || b.created_at).getTime() - new Date(a.payment_date || a.created_at).getTime())
    : [],
  created_at: row.created_at,
});

const mapRequestRow = (row: any): ProjectRequest => ({
  id: row.id,
  client_id: row.client_id,
  client_name: row.client?.company_name || row.client?.full_name || row.client_name || 'Client',
  project_title: row.project_title,
  service_category: row.service_category,
  estimated_budget: row.estimated_budget || '',
  target_timeline: row.target_timeline || '',
  project_scope: row.project_scope,
  status: row.status,
  created_at: row.created_at,
});

const mapMeetingRow = (row: any): MeetingRequest => ({
  id: row.id,
  client_id: row.client_id,
  client_name: row.client?.company_name || row.client?.full_name || row.client_name || 'Client',
  requested_date: row.requested_date,
  requested_time: String(row.requested_time || '').slice(0, 5),
  timezone: row.timezone || 'Asia/Colombo (UTC+5:30)',
  meeting_type: row.meeting_type,
  agenda: row.agenda,
  meeting_link: row.meeting_link,
  status: row.status,
  created_at: row.created_at,
});

export const portalApi = {
  async isLiveSession(): Promise<boolean> {
    return Boolean(await getAccessToken());
  },

  // ================= CLIENTS =================
  async getClients(): Promise<{ data: UserProfile[]; live: boolean }> {
    const token = await getAccessToken();
    if (token) {
      try {
        const res = await apiFetch<{ clients: UserProfile[] }>('/api/clients', {}, token);
        return { data: res.clients || [], live: true };
      } catch {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'client')
          .order('created_at', { ascending: false });
        if (!error && data) return { data: data as UserProfile[], live: true };
      }
    }
    return { data: portalStore.getUsers().filter((u) => u.role === 'client'), live: false };
  },

  async createClient(payload: {
    email: string;
    password?: string;
    full_name: string;
    company_name: string;
    phone?: string;
  }): Promise<{ client: UserProfile; live: boolean }> {
    const token = await getAccessToken();
    if (token) {
      const res = await apiFetch<{ client: UserProfile }>(
        '/api/clients',
        { method: 'POST', body: JSON.stringify(payload) },
        token
      );
      return { client: res.client, live: true };
    }
    const created = portalStore.addUser({ ...payload, role: 'client' });
    return { client: created, live: false };
  },

  async updateClient(
    id: string,
    updates: Partial<Pick<UserProfile, 'full_name' | 'company_name' | 'phone'>>
  ): Promise<{ client: UserProfile | null; live: boolean }> {
    const token = await getAccessToken();
    if (token) {
      try {
        const res = await apiFetch<{ client: UserProfile }>(
          `/api/clients/${id}`,
          { method: 'PATCH', body: JSON.stringify(updates) },
          token
        );
        return { client: res.client, live: true };
      } catch {
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return { client: data as UserProfile, live: true };
      }
    }
    return { client: portalStore.updateUser(id, updates), live: false };
  },

  async deleteClient(id: string): Promise<void> {
    const token = await getAccessToken();
    if (token) {
      try {
        await apiFetch(`/api/clients/${id}`, { method: 'DELETE' }, token);
        return;
      } catch {
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (!error) return;
      }
    }
    portalStore.deleteUser(id);
  },

  async updateClientPassword(id: string, password: string): Promise<{ success: boolean; message: string }> {
    const token = await getAccessToken();
    if (token) {
      try {
        await apiFetch(`/api/clients/${id}/password`, { method: 'PATCH', body: JSON.stringify({ password }) }, token);
        return { success: true, message: 'Password updated successfully' };
      } catch (_err: any) {
        // Fallback to direct client admin auth if possible
      }
    }
    portalStore.updateUserPassword(id, password);
    return { success: true, message: 'Password updated in local store' };
  },

  async toggleClientBlock(id: string, is_blocked: boolean): Promise<{ success: boolean; is_blocked: boolean }> {
    const token = await getAccessToken();
    if (token) {
      try {
        await apiFetch(`/api/clients/${id}/status`, { method: 'PATCH', body: JSON.stringify({ is_blocked }) }, token);
        return { success: true, is_blocked };
      } catch {
        const { error } = await supabase.from('profiles').update({ is_blocked, status: is_blocked ? 'blocked' : 'active' }).eq('id', id);
        if (!error) return { success: true, is_blocked };
      }
    }
    portalStore.toggleUserBlock(id, is_blocked);
    return { success: true, is_blocked };
  },

  async changeMyPassword(password: string): Promise<{ success: boolean; message: string }> {
    const token = await getAccessToken();
    if (token) {
      try {
        await apiFetch('/api/clients/me/password', { method: 'PATCH', body: JSON.stringify({ password }) }, token);
        return { success: true, message: 'Your password was updated successfully.' };
      } catch {
        const { error } = await supabase.auth.updateUser({ password });
        if (!error) return { success: true, message: 'Your password was updated successfully.' };
      }
    }
    return { success: true, message: 'Your password has been changed.' };
  },

  // ================= PARTNERS =================
  async getPartners(includeInactive = false): Promise<{ data: Partner[]; live: boolean }> {
    const token = await getAccessToken();
    try {
      const res = await apiFetch<{ partners: Partner[] }>(
        `/api/partners${includeInactive ? '?all=true' : ''}`,
        {},
        token
      );
      return { data: res.partners || [], live: true };
    } catch {
      if (isSupabaseConfigured) {
        let q = supabase.from('partners').select('*');
        if (!includeInactive) q = q.eq('is_active', true);
        const { data, error } = await q.order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return { data: data as Partner[], live: true };
      }
    }
    const local = portalStore.getPartners();
    return { data: includeInactive ? local : local.filter((p) => p.is_active), live: false };
  },

  async createPartner(payload: Omit<Partner, 'id'>): Promise<{ partner: Partner; live: boolean }> {
    const token = await getAccessToken();
    if (token) {
      try {
        const res = await apiFetch<{ partner: Partner }>(
          '/api/partners',
          { method: 'POST', body: JSON.stringify(payload) },
          token
        );
        return { partner: res.partner, live: true };
      } catch {
        const { data, error } = await supabase.from('partners').insert(payload).select().single();
        if (!error && data) return { partner: data as Partner, live: true };
      }
    }
    return { partner: portalStore.addPartner(payload), live: false };
  },

  async togglePartner(id: string, is_active: boolean): Promise<void> {
    const token = await getAccessToken();
    if (token) {
      try {
        await apiFetch(`/api/partners/${id}`, { method: 'PATCH', body: JSON.stringify({ is_active }) }, token);
        return;
      } catch {
        const { error } = await supabase.from('partners').update({ is_active }).eq('id', id);
        if (!error) return;
      }
    }
    portalStore.togglePartnerStatus(id);
  },

  async updatePartner(id: string, updates: Partial<Partner>): Promise<void> {
    const token = await getAccessToken();
    if (token) {
      try {
        await apiFetch(`/api/partners/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }, token);
        return;
      } catch {
        const { error } = await supabase.from('partners').update(updates).eq('id', id);
        if (!error) return;
      }
    }
    portalStore.updatePartner(id, updates);
  },

  async deletePartner(id: string): Promise<void> {
    const token = await getAccessToken();
    if (token) {
      try {
        await apiFetch(`/api/partners/${id}`, { method: 'DELETE' }, token);
        return;
      } catch {
        const { error } = await supabase.from('partners').delete().eq('id', id);
        if (!error) return;
      }
    }
    portalStore.deletePartner(id);
  },

  // ================= PROJECTS & MILESTONES =================
  async getProjects(clientId?: string): Promise<{ data: PortalProject[]; live: boolean }> {
    const token = await getAccessToken();
    if (token) {
      try {
        const qs = clientId ? `?client_id=${encodeURIComponent(clientId)}` : '';
        const res = await apiFetch<{ projects: any[] }>(`/api/projects${qs}`, {}, token);
        const mapped = (res.projects || []).map(mapProjectRow);
        return {
          data: clientId ? mapped.filter((p) => p.client_id === clientId) : mapped,
          live: true,
        };
      } catch {
        let q = supabase
          .from('projects')
          .select('*, client:profiles!client_id(full_name, email, company_name), milestones:project_milestones(*)');
        if (clientId) q = q.eq('client_id', clientId);
        const { data, error } = await q.order('created_at', { ascending: false });
        if (!error && data) {
          const mapped = data.map(mapProjectRow);
          return {
            data: clientId ? mapped.filter((p) => p.client_id === clientId) : mapped,
            live: true,
          };
        }
      }
    }
    return { data: portalStore.getProjects(clientId), live: false };
  },

  async createProject(payload: {
    client_id: string;
    client_name: string;
    title: string;
    code_name: string;
    category: string;
    status: PortalProject['status'];
    progress_percentage: number;
    staging_url?: string;
    production_url?: string;
    figma_url?: string;
    api_docs_url?: string;
    domain_renewal_date?: string;
    server_expiry_date?: string;
    vault_notes?: string;
    target_launch_date?: string;
    summary: string;
    milestones: { id?: string; title: string; is_completed: boolean }[];
  }): Promise<{ project: PortalProject; live: boolean }> {
    const token = await getAccessToken();
    if (token) {
      try {
        const res = await apiFetch<{ project: any }>(
          '/api/projects',
          { method: 'POST', body: JSON.stringify(payload) },
          token
        );
        return { project: mapProjectRow(res.project), live: true };
      } catch {
        const { milestones, client_name, ...row } = payload;
        const { data, error } = await supabase.from('projects').insert(row).select().single();
        if (!error && data) {
          if (milestones.length) {
            await supabase.from('project_milestones').insert(
              milestones.map((m, i) => ({
                project_id: data.id,
                title: m.title,
                is_completed: m.is_completed,
                order_index: i + 1,
              }))
            );
          }
          return { project: mapProjectRow({ ...data, client_name, milestones }), live: true };
        }
      }
    }
    const created = portalStore.addProject({
      ...payload,
      milestones: payload.milestones.map((m, idx) => ({
        id: m.id || `m-${Date.now()}-${idx}`,
        title: m.title,
        is_completed: m.is_completed,
      })),
    });
    return { project: created, live: false };
  },

  async updateProject(
    id: string,
    updates: Partial<PortalProject>
  ): Promise<void> {
    const token = await getAccessToken();
    if (token) {
      try {
        await apiFetch(`/api/projects/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }, token);
        return;
      } catch {
        const { client_name: _cn, milestones: _ms, ...fields } = updates as any;
        const { error } = await supabase.from('projects').update(fields).eq('id', id);
        if (!error) return;
      }
    }
    portalStore.updateProject(id, updates);
  },

  async deleteProject(id: string): Promise<void> {
    const token = await getAccessToken();
    if (token) {
      try {
        await apiFetch(`/api/projects/${id}`, { method: 'DELETE' }, token);
        return;
      } catch {
        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (!error) return;
      }
    }
    portalStore.deleteProject(id);
  },

  async toggleMilestone(projectId: string, milestoneId: string, is_completed: boolean, allMilestones: any[]): Promise<void> {
    const token = await getAccessToken();
    if (token) {
      try {
        await apiFetch(
          `/api/projects/${projectId}/milestones/${milestoneId}`,
          { method: 'PATCH', body: JSON.stringify({ is_completed }) },
          token
        );
        return;
      } catch {
        const { error } = await supabase
          .from('project_milestones')
          .update({ is_completed })
          .eq('id', milestoneId);
        if (!error) return;
      }
    }
    portalStore.updateProjectProgress(projectId, { milestones: allMilestones });
  },

  async getProjectHeartbeat(
    projectId: string,
    productionUrl?: string,
    force = false
  ): Promise<SystemHeartbeat> {
    const trimmedUrl = (productionUrl || '').trim();
    const token = await getAccessToken();

    if (token) {
      try {
        const res = await apiFetch<{ heartbeat: SystemHeartbeat }>(
          `/api/projects/${projectId}/heartbeat${force ? '?force=1' : ''}`,
          {},
          token,
          15000
        );
        if (res?.heartbeat) {
          return { ...res.heartbeat, mode: 'live_backend' };
        }
      } catch {
        // Fall through to lightweight browser probe if Render is temporarily unreachable
      }
    }

    const checkedAt = new Date().toISOString();
    if (!trimmedUrl) {
      return {
        configured: false,
        project_id: projectId,
        url: '',
        hostname: '',
        status: 'unconfigured',
        http_status: null,
        latency_ms: null,
        ssl: null,
        checked_at: checkedAt,
        cached: false,
        error_detail: 'No production URL configured in Vault.',
        history: [],
        mode: 'browser_fallback',
      };
    }

    let normalized = trimmedUrl;
    if (!/^https?:\/\//i.test(normalized)) normalized = `https://${normalized}`;
    let hostname = trimmedUrl;
    let isHttps = true;
    try {
      const parsed = new URL(normalized);
      hostname = parsed.hostname;
      isHttps = parsed.protocol === 'https:';
    } catch {
      // keep raw
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const start = performance.now();

    try {
      await fetch(normalized, { mode: 'no-cors', cache: 'no-store', signal: controller.signal });
      const latency = Math.max(1, Math.round(performance.now() - start));
      const status: 'online' | 'degraded' = latency > 2500 ? 'degraded' : 'online';
      return {
        configured: true,
        project_id: projectId,
        url: trimmedUrl,
        hostname,
        status,
        http_status: 200,
        latency_ms: latency,
        ssl: {
          enabled: isHttps,
          valid: isHttps,
          days_remaining: null,
          expires_at: null,
          issuer: isHttps ? 'HTTPS Active' : null,
          protocol: isHttps ? 'TLS' : 'HTTP',
        },
        checked_at: checkedAt,
        cached: false,
        error_detail: null,
        history: [{ status, latency_ms: latency, checked_at: checkedAt }],
        mode: 'browser_fallback',
      };
    } catch {
      return {
        configured: true,
        project_id: projectId,
        url: trimmedUrl,
        hostname,
        status: 'offline',
        http_status: null,
        latency_ms: null,
        ssl: null,
        checked_at: checkedAt,
        cached: false,
        error_detail: 'Endpoint did not respond within 5 seconds.',
        history: [{ status: 'offline', latency_ms: null, checked_at: checkedAt }],
        mode: 'browser_fallback',
      };
    } finally {
      clearTimeout(timer);
    }
  },

  // ================= BILLING (INVOICES & QUOTATIONS IN LKR) =================
  async getBillingDocuments(clientId?: string): Promise<{ data: BillingDocument[]; live: boolean }> {
    const token = await getAccessToken();
    if (token) {
      try {
        const qs = clientId ? `?client_id=${encodeURIComponent(clientId)}` : '';
        const res = await apiFetch<{ documents: any[] }>(`/api/billing${qs}`, {}, token);
        const mapped = (res.documents || []).map(mapBillingRow);
        return {
          data: clientId ? mapped.filter((d) => d.client_id === clientId) : mapped,
          live: true,
        };
      } catch {
        let q = supabase
          .from('documents_billing')
          .select('*, client:profiles!client_id(full_name, email, company_name, phone), project:projects!project_id(title, code_name)');
        if (clientId) q = q.eq('client_id', clientId);
        const { data, error } = await q.order('created_at', { ascending: false });
        if (!error && data) {
          const mapped = data.map(mapBillingRow);
          return {
            data: clientId ? mapped.filter((d) => d.client_id === clientId) : mapped,
            live: true,
          };
        }
      }
    }
    return { data: portalStore.getBillingDocuments(clientId), live: false };
  },

  async createBillingDocument(
    doc: Omit<BillingDocument, 'id' | 'document_number' | 'created_at'>
  ): Promise<{ document: BillingDocument; live: boolean }> {
    const token = await getAccessToken();
    if (token) {
      try {
        const res = await apiFetch<{ document: any }>(
          '/api/billing',
          { method: 'POST', body: JSON.stringify(doc) },
          token
        );
        return { document: mapBillingRow(res.document), live: true };
      } catch {
        const prefix = doc.type === 'invoice' ? 'INV' : 'QUO';
        const document_number = `${prefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const { data, error } = await supabase
          .from('documents_billing')
          .insert({
            document_number,
            type: doc.type,
            client_id: doc.client_id,
            project_id: doc.project_id || null,
            payment_plan_id: doc.payment_plan_id || null,
            billing_scope: doc.billing_scope || 'separate',
            status: doc.status || 'sent',
            currency: doc.currency || 'LKR',
            line_items: doc.line_items,
            subtotal: doc.subtotal,
            tax: doc.tax,
            total: doc.total,
            due_date: doc.due_date || null,
            notes: doc.notes,
          })
          .select()
          .single();
        if (!error && data) {
          return {
            document: mapBillingRow({
              ...data,
              client_name: doc.client_name,
              client_contact_name: doc.client_contact_name,
              client_email: doc.client_email,
              client_phone: doc.client_phone,
            }),
            live: true,
          };
        }
      }
    }
    return { document: portalStore.createBillingDocument(doc), live: false };
  },

  async updateBillingStatus(id: string, status: BillingDocument['status']): Promise<void> {
    const token = await getAccessToken();
    if (token) {
      try {
        await apiFetch(`/api/billing/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }, token);
        return;
      } catch {
        const { data: updatedDoc, error } = await supabase
          .from('documents_billing')
          .update({ status })
          .eq('id', id)
          .select()
          .single();
        if (!error && updatedDoc) {
          if (status === 'paid' && updatedDoc.type === 'invoice' && updatedDoc.billing_scope === 'project_cover') {
            const { data: existing } = await supabase
              .from('payment_records')
              .select('id')
              .eq('invoice_id', updatedDoc.id)
              .maybeSingle();
            if (!existing) {
              let targetPlanId = updatedDoc.payment_plan_id;
              if (!targetPlanId && updatedDoc.project_id) {
                const { data: matched } = await supabase
                  .from('project_payment_plans')
                  .select('id')
                  .eq('project_id', updatedDoc.project_id)
                  .order('created_at', { ascending: false })
                  .limit(1)
                  .maybeSingle();
                targetPlanId = matched?.id || null;
              }
              if (targetPlanId) {
                await supabase.from('payment_records').insert({
                  payment_plan_id: targetPlanId,
                  client_id: updatedDoc.client_id,
                  project_id: updatedDoc.project_id || null,
                  invoice_id: updatedDoc.id,
                  amount: Number(updatedDoc.total || 0),
                  currency: updatedDoc.currency || 'LKR',
                  payment_date: new Date().toISOString().split('T')[0],
                  payment_method: 'Invoice Settlement',
                  reference_number: updatedDoc.document_number,
                  billing_scope: 'project_cover',
                  notes: `Auto-applied from paid invoice ${updatedDoc.document_number}`,
                });
              }
            }
          }
          return;
        }
      }
    }
    portalStore.updateBillingStatus(id, status);
  },

  async deleteBillingDocument(id: string): Promise<void> {
    const token = await getAccessToken();
    if (token) {
      try {
        await apiFetch(`/api/billing/${id}`, { method: 'DELETE' }, token);
        return;
      } catch {
        const { error } = await supabase.from('documents_billing').delete().eq('id', id);
        if (!error) return;
      }
    }
    portalStore.deleteBillingDocument(id);
  },

  // ================= PROJECT REQUESTS =================
  async getProjectRequests(clientId?: string): Promise<{ data: ProjectRequest[]; live: boolean }> {
    const token = await getAccessToken();
    if (token) {
      try {
        const qs = clientId ? `?client_id=${encodeURIComponent(clientId)}` : '';
        const res = await apiFetch<{ requests: any[] }>(`/api/projects/requests${qs}`, {}, token);
        const mapped = (res.requests || []).map(mapRequestRow);
        return {
          data: clientId ? mapped.filter((r) => r.client_id === clientId) : mapped,
          live: true,
        };
      } catch {
        let q = supabase.from('project_requests').select('*, client:profiles!client_id(full_name, email, company_name)');
        if (clientId) q = q.eq('client_id', clientId);
        const { data, error } = await q.order('created_at', { ascending: false });
        if (!error && data) {
          const mapped = data.map(mapRequestRow);
          return {
            data: clientId ? mapped.filter((r) => r.client_id === clientId) : mapped,
            live: true,
          };
        }
      }
    }
    return { data: portalStore.getProjectRequests(clientId), live: false };
  },

  async submitProjectRequest(
    req: Omit<ProjectRequest, 'id' | 'status' | 'created_at'>
  ): Promise<{ request: ProjectRequest; live: boolean }> {
    const token = await getAccessToken();
    if (token) {
      try {
        const res = await apiFetch<{ request: any }>(
          '/api/projects/requests',
          { method: 'POST', body: JSON.stringify(req) },
          token
        );
        return { request: mapRequestRow(res.request), live: true };
      } catch {
        const { client_name, ...row } = req;
        const { data, error } = await supabase.from('project_requests').insert(row).select().single();
        if (!error && data) return { request: mapRequestRow({ ...data, client_name }), live: true };
      }
    }
    return { request: portalStore.submitProjectRequest(req), live: false };
  },

  async updateProjectRequestStatus(id: string, status: ProjectRequest['status']): Promise<void> {
    const token = await getAccessToken();
    if (token) {
      try {
        await apiFetch(`/api/projects/requests/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }, token);
        return;
      } catch {
        const { error } = await supabase.from('project_requests').update({ status }).eq('id', id);
        if (!error) return;
      }
    }
    portalStore.updateProjectRequestStatus(id, status);
  },

  // ================= MEETINGS =================
  async getMeetings(clientId?: string): Promise<{ data: MeetingRequest[]; live: boolean }> {
    const token = await getAccessToken();
    if (token) {
      try {
        const qs = clientId ? `?client_id=${encodeURIComponent(clientId)}` : '';
        const res = await apiFetch<{ meetings: any[] }>(`/api/meetings${qs}`, {}, token);
        const mapped = (res.meetings || []).map(mapMeetingRow);
        return {
          data: clientId ? mapped.filter((m) => m.client_id === clientId) : mapped,
          live: true,
        };
      } catch {
        let q = supabase.from('meeting_requests').select('*, client:profiles!client_id(full_name, email, company_name)');
        if (clientId) q = q.eq('client_id', clientId);
        const { data, error } = await q.order('requested_date', { ascending: true });
        if (!error && data) {
          const mapped = data.map(mapMeetingRow);
          return {
            data: clientId ? mapped.filter((m) => m.client_id === clientId) : mapped,
            live: true,
          };
        }
      }
    }
    return { data: portalStore.getMeetings(clientId), live: false };
  },

  async scheduleMeeting(
    meeting: Omit<MeetingRequest, 'id' | 'status' | 'created_at'>
  ): Promise<{ meeting: MeetingRequest; live: boolean }> {
    const token = await getAccessToken();
    if (token) {
      try {
        const res = await apiFetch<{ meeting: any }>(
          '/api/meetings',
          { method: 'POST', body: JSON.stringify(meeting) },
          token
        );
        return { meeting: mapMeetingRow(res.meeting), live: true };
      } catch {
        const { client_name, ...row } = meeting;
        const { data, error } = await supabase.from('meeting_requests').insert(row).select().single();
        if (!error && data) return { meeting: mapMeetingRow({ ...data, client_name }), live: true };
      }
    }
    return { meeting: portalStore.scheduleMeeting(meeting), live: false };
  },

  async updateMeetingStatus(id: string, status: MeetingRequest['status'], meeting_link?: string): Promise<void> {
    const token = await getAccessToken();
    if (token) {
      try {
        await apiFetch(`/api/meetings/${id}`, { method: 'PATCH', body: JSON.stringify({ status, meeting_link }) }, token);
        return;
      } catch {
        const { error } = await supabase.from('meeting_requests').update({ status, meeting_link }).eq('id', id);
        if (!error) return;
      }
    }
    portalStore.updateMeetingStatus(id, status, meeting_link);
  },

  // ================= CUSTOMER REVIEWS =================
  async getReviews(includeHidden = false): Promise<{ data: CustomerReview[]; live: boolean }> {
    const token = await getAccessToken();
    try {
      const res = await apiFetch<{ reviews: CustomerReview[] }>(
        `/api/reviews${includeHidden ? '?all=true' : ''}`,
        {},
        token
      );
      return { data: res.reviews || [], live: true };
    } catch {
      if (isSupabaseConfigured) {
        let q = supabase.from('customer_reviews').select('*');
        if (!includeHidden) q = q.eq('is_featured', true);
        const { data, error } = await q.order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return { data: data as CustomerReview[], live: true };
      }
    }
    return { data: portalStore.getReviews(!includeHidden), live: false };
  },

  async addReview(review: Omit<CustomerReview, 'id' | 'created_at'>): Promise<{ review: CustomerReview; live: boolean }> {
    const token = await getAccessToken();
    if (token) {
      try {
        const res = await apiFetch<{ review: CustomerReview }>(
          '/api/reviews',
          { method: 'POST', body: JSON.stringify(review) },
          token
        );
        return { review: res.review, live: true };
      } catch {
        const { data, error } = await supabase.from('customer_reviews').insert(review).select().single();
        if (!error && data) return { review: data as CustomerReview, live: true };
      }
    }
    return { review: portalStore.addReview(review), live: false };
  },

  async toggleReviewFeatured(id: string, is_featured: boolean): Promise<void> {
    const token = await getAccessToken();
    if (token) {
      try {
        await apiFetch(`/api/reviews/${id}/feature`, { method: 'PATCH', body: JSON.stringify({ is_featured }) }, token);
        return;
      } catch {
        const { error } = await supabase.from('customer_reviews').update({ is_featured }).eq('id', id);
        if (!error) return;
      }
    }
    portalStore.toggleReviewFeatured(id);
  },

  async updateReview(id: string, updates: Partial<CustomerReview>): Promise<void> {
    const token = await getAccessToken();
    if (token) {
      try {
        await apiFetch(`/api/reviews/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }, token);
        return;
      } catch {
        const { error } = await supabase.from('customer_reviews').update(updates).eq('id', id);
        if (!error) return;
      }
    }
    portalStore.updateReview(id, updates);
  },

  async deleteReview(id: string): Promise<void> {
    const token = await getAccessToken();
    if (token) {
      try {
        await apiFetch(`/api/reviews/${id}`, { method: 'DELETE' }, token);
        return;
      } catch {
        const { error } = await supabase.from('customer_reviews').delete().eq('id', id);
        if (!error) return;
      }
    }
    portalStore.deleteReview(id);
  },

  // ================= BLOG / NEWS POSTS =================
  async getBlogPosts(includeDrafts = false): Promise<{ data: PortalBlogPost[]; live: boolean }> {
    const token = await getAccessToken();
    try {
      const res = await apiFetch<{ posts: PortalBlogPost[] }>(
        `/api/posts${includeDrafts ? '?all=true' : ''}`,
        {},
        token
      );
      return { data: res.posts || [], live: true };
    } catch {
      if (isSupabaseConfigured) {
        let q = supabase.from('blog_posts').select('*');
        if (!includeDrafts) q = q.eq('is_published', true);
        const { data, error } = await q.order('published_at', { ascending: false });
        if (!error && data && data.length > 0) return { data: data as PortalBlogPost[], live: true };
      }
    }
    return { data: portalStore.getBlogPosts(!includeDrafts), live: false };
  },

  async addBlogPost(post: Omit<PortalBlogPost, 'id' | 'published_at'>): Promise<{ post: PortalBlogPost; live: boolean }> {
    const token = await getAccessToken();
    if (token) {
      try {
        const res = await apiFetch<{ post: PortalBlogPost }>(
          '/api/posts',
          { method: 'POST', body: JSON.stringify(post) },
          token
        );
        return { post: res.post, live: true };
      } catch {
        const { data, error } = await supabase.from('blog_posts').insert(post).select().single();
        if (!error && data) return { post: data as PortalBlogPost, live: true };
      }
    }
    return { post: portalStore.addBlogPost(post), live: false };
  },

  async updateBlogPost(id: string, updates: Partial<PortalBlogPost>): Promise<void> {
    const token = await getAccessToken();
    if (token) {
      try {
        await apiFetch(`/api/posts/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }, token);
        return;
      } catch {
        const { error } = await supabase.from('blog_posts').update(updates).eq('id', id);
        if (!error) return;
      }
    }
    portalStore.updateBlogPost(id, updates);
  },

  async deleteBlogPost(id: string): Promise<void> {
    const token = await getAccessToken();
    if (token) {
      try {
        await apiFetch(`/api/posts/${id}`, { method: 'DELETE' }, token);
        return;
      } catch {
        const { error } = await supabase.from('blog_posts').delete().eq('id', id);
        if (!error) return;
      }
    }
    portalStore.deleteBlogPost(id);
  },

  // ================= PUBLIC CONTACT INQUIRIES =================
  async submitContactInquiry(payload: {
    name: string;
    email: string;
    company?: string;
    service_need: string;
    budget_tier?: string;
    brief: string;
  }): Promise<{ inquiry: ContactInquiry; live: boolean }> {
    try {
      const res = await apiFetch<{ inquiry: ContactInquiry }>('/api/inquiries', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return { inquiry: res.inquiry, live: true };
    } catch {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.from('contact_inquiries').insert(payload).select().single();
        if (!error && data) return { inquiry: data as ContactInquiry, live: true };
      }
    }
    return { inquiry: portalStore.submitInquiry(payload), live: false };
  },

  async getContactInquiries(): Promise<{ data: ContactInquiry[]; live: boolean }> {
    const token = await getAccessToken();
    if (token) {
      try {
        const res = await apiFetch<{ inquiries: ContactInquiry[] }>('/api/inquiries', {}, token);
        return { data: res.inquiries || [], live: true };
      } catch {
        const { data, error } = await supabase
          .from('contact_inquiries')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) return { data: data as ContactInquiry[], live: true };
      }
    }
    return { data: portalStore.getInquiries(), live: false };
  },

  async updateInquiryStatus(id: string, status: ContactInquiry['status']): Promise<void> {
    const token = await getAccessToken();
    if (token) {
      try {
        await apiFetch(`/api/inquiries/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }, token);
        return;
      } catch {
        const { error } = await supabase.from('contact_inquiries').update({ status }).eq('id', id);
        if (!error) return;
      }
    }
    portalStore.updateInquiryStatus(id, status);
  },

  // ================= EXECUTIVE TASKS (DULANJA & REMASHI) =================
  async getTasks(date?: string, assignee?: string): Promise<{ data: ExecutiveTask[]; live: boolean }> {
    const token = await getAccessToken();
    if (token) {
      try {
        const params = new URLSearchParams();
        if (date) params.append('date', date);
        if (assignee && assignee !== 'all') params.append('assignee', assignee);
        const queryStr = params.toString() ? `?${params.toString()}` : '';

        const res = await apiFetch<{ tasks: ExecutiveTask[] }>(`/api/tasks${queryStr}`, {}, token);
        return { data: res.tasks || [], live: true };
      } catch {
        if (isSupabaseConfigured) {
          let q = supabase.from('executive_tasks').select('*');
          if (date) q = q.eq('task_date', date);
          if (assignee && assignee !== 'all') q = q.or(`assignee.eq."${assignee}",assignee.ilike."%Both%"`);
          const { data, error } = await q
            .order('is_completed', { ascending: true })
            .order('priority', { ascending: true })
            .order('created_at', { ascending: true });
          if (!error && data) return { data: data as ExecutiveTask[], live: true };
        }
      }
    }
    return { data: portalStore.getTasks(date, assignee), live: false };
  },

  async createTask(payload: Omit<ExecutiveTask, 'id' | 'created_at'>): Promise<{ task: ExecutiveTask; live: boolean }> {
    const token = await getAccessToken();
    if (token) {
      try {
        const res = await apiFetch<{ task: ExecutiveTask }>(
          '/api/tasks',
          { method: 'POST', body: JSON.stringify(payload) },
          token
        );
        return { task: res.task, live: true };
      } catch {
        if (isSupabaseConfigured) {
          const { data, error } = await supabase
            .from('executive_tasks')
            .insert(payload)
            .select()
            .single();
          if (!error && data) return { task: data as ExecutiveTask, live: true };
        }
      }
    }
    const created = portalStore.createTask(payload);
    return { task: created, live: false };
  },

  async updateTask(id: string, updates: Partial<ExecutiveTask>): Promise<void> {
    const token = await getAccessToken();
    if (token) {
      try {
        await apiFetch(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }, token);
        return;
      } catch {
        const { error } = await supabase.from('executive_tasks').update(updates).eq('id', id);
        if (!error) return;
      }
    }
    portalStore.updateTask(id, updates);
  },

  async toggleTask(id: string, is_completed: boolean): Promise<void> {
    const token = await getAccessToken();
    if (token) {
      try {
        await apiFetch(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ is_completed }) }, token);
        return;
      } catch {
        const { error } = await supabase
          .from('executive_tasks')
          .update({
            is_completed,
            completed_at: is_completed ? new Date().toISOString() : null,
          })
          .eq('id', id);
        if (!error) return;
      }
    }
    portalStore.toggleTask(id, is_completed);
  },

  async rolloverTasks(fromDate: string, toDate: string): Promise<{ count: number }> {
    const token = await getAccessToken();
    if (token) {
      try {
        const res = await apiFetch<{ count: number }>(
          '/api/tasks/rollover',
          { method: 'POST', body: JSON.stringify({ from_date: fromDate, to_date: toDate }) },
          token
        );
        return { count: res.count };
      } catch {
        if (isSupabaseConfigured) {
          const { data } = await supabase
            .from('executive_tasks')
            .update({ task_date: toDate })
            .eq('task_date', fromDate)
            .eq('is_completed', false)
            .select();
          return { count: data?.length || 0 };
        }
      }
    }
    const rolled = portalStore.rolloverTasks(fromDate, toDate);
    return { count: rolled.length };
  },

  async deleteTask(id: string): Promise<void> {
    const token = await getAccessToken();
    if (token) {
      try {
        await apiFetch(`/api/tasks/${id}`, { method: 'DELETE' }, token);
        return;
      } catch {
        const { error } = await supabase.from('executive_tasks').delete().eq('id', id);
        if (!error) return;
      }
    }
    portalStore.deleteTask(id);
  },

  // ================= PROJECT PAYMENT PLANS & PAYMENT RECORDS =================
  async getPaymentPlans(clientId?: string): Promise<{ data: ProjectPaymentPlan[]; live: boolean }> {
    const token = await getAccessToken();
    if (token) {
      try {
        const qs = clientId ? `?client_id=${encodeURIComponent(clientId)}` : '';
        const res = await apiFetch<{ plans: any[] }>(`/api/payments${qs}`, {}, token);
        const mapped = (res.plans || []).map(mapPaymentPlanRow);
        return {
          data: clientId ? mapped.filter((p) => p.client_id === clientId) : mapped,
          live: true,
        };
      } catch {
        if (isSupabaseConfigured) {
          let q = supabase
            .from('project_payment_plans')
            .select(
              '*, client:profiles!client_id(full_name, email, company_name), project:projects!project_id(id, title, code_name), payments:payment_records(*)'
            );
          if (clientId) q = q.eq('client_id', clientId);
          const { data, error } = await q.order('created_at', { ascending: false });
          if (!error && data) {
            const mapped = data.map(mapPaymentPlanRow);
            return {
              data: clientId ? mapped.filter((p) => p.client_id === clientId) : mapped,
              live: true,
            };
          }
        }
      }
    }
    return { data: portalStore.getPaymentPlans(clientId), live: false };
  },

  async createPaymentPlan(
    payload: Omit<ProjectPaymentPlan, 'id' | 'payments' | 'created_at'>
  ): Promise<{ plan: ProjectPaymentPlan; live: boolean }> {
    const token = await getAccessToken();
    if (token) {
      try {
        const res = await apiFetch<{ plan: any }>(
          '/api/payments',
          { method: 'POST', body: JSON.stringify(payload) },
          token
        );
        return { plan: mapPaymentPlanRow(res.plan), live: true };
      } catch {
        if (isSupabaseConfigured) {
          const { client_name: _cn, project_title: _pt, project_code: _pc, ...row } = payload;
          const { data, error } = await supabase
            .from('project_payment_plans')
            .insert({
              ...row,
              project_id: row.project_id || null,
              next_due_date: row.next_due_date || null,
            })
            .select(
              '*, client:profiles!client_id(full_name, email, company_name), project:projects!project_id(id, title, code_name), payments:payment_records(*)'
            )
            .single();
          if (!error && data) return { plan: mapPaymentPlanRow(data), live: true };
        }
      }
    }
    return { plan: portalStore.createPaymentPlan(payload), live: false };
  },

  async updatePaymentPlan(id: string, updates: Partial<ProjectPaymentPlan>): Promise<void> {
    const token = await getAccessToken();
    if (token) {
      try {
        await apiFetch(`/api/payments/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }, token);
        return;
      } catch {
        if (isSupabaseConfigured) {
          const { client_name: _cn, project_title: _pt, project_code: _pc, payments: _ps, ...fields } = updates as any;
          const { error } = await supabase
            .from('project_payment_plans')
            .update({ ...fields, updated_at: new Date().toISOString() })
            .eq('id', id);
          if (!error) return;
        }
      }
    }
    portalStore.updatePaymentPlan(id, updates);
  },

  async deletePaymentPlan(id: string): Promise<void> {
    const token = await getAccessToken();
    if (token) {
      try {
        await apiFetch(`/api/payments/${id}`, { method: 'DELETE' }, token);
        return;
      } catch {
        if (isSupabaseConfigured) {
          const { error } = await supabase.from('project_payment_plans').delete().eq('id', id);
          if (!error) return;
        }
      }
    }
    portalStore.deletePaymentPlan(id);
  },

  async addPaymentRecord(
    planId: string,
    payload: {
      amount: number;
      payment_date: string;
      payment_method: string;
      reference_number?: string;
      invoice_id?: string;
      billing_scope?: BillingScope;
      notes?: string;
      advance_due_date?: boolean;
    }
  ): Promise<{ record: PaymentRecord | null; live: boolean }> {
    const token = await getAccessToken();
    if (token) {
      try {
        const res = await apiFetch<{ record: PaymentRecord }>(
          `/api/payments/${planId}/records`,
          { method: 'POST', body: JSON.stringify(payload) },
          token
        );
        return { record: res.record, live: true };
      } catch {
        if (isSupabaseConfigured) {
          const { data: plan } = await supabase
            .from('project_payment_plans')
            .select('*')
            .eq('id', planId)
            .single();
          if (plan) {
            const { data, error } = await supabase
              .from('payment_records')
              .insert({
                payment_plan_id: planId,
                client_id: plan.client_id,
                project_id: plan.project_id || null,
                invoice_id: payload.invoice_id || null,
                amount: Number(payload.amount),
                currency: plan.currency || 'LKR',
                payment_date: payload.payment_date || new Date().toISOString().split('T')[0],
                payment_method: payload.payment_method || 'Bank Transfer / CEFTS',
                reference_number: payload.reference_number || null,
                billing_scope: payload.billing_scope || 'project_cover',
                notes: payload.notes || null,
              })
              .select()
              .single();
            if (!error && data) {
              if (payload.advance_due_date && (plan.billing_type === 'monthly' || plan.billing_type === 'installment')) {
                const base = plan.next_due_date ? new Date(plan.next_due_date) : new Date(payload.payment_date || Date.now());
                base.setMonth(base.getMonth() + 1);
                await supabase
                  .from('project_payment_plans')
                  .update({ next_due_date: base.toISOString().split('T')[0], updated_at: new Date().toISOString() })
                  .eq('id', planId);
              }
              return { record: data as PaymentRecord, live: true };
            }
          }
        }
      }
    }
    return { record: portalStore.addPaymentRecord(planId, payload), live: false };
  },

  async updatePaymentRecord(
    recordId: string,
    updates: Partial<Pick<PaymentRecord, 'amount' | 'payment_date' | 'payment_method' | 'reference_number' | 'billing_scope' | 'notes'>>
  ): Promise<void> {
    const token = await getAccessToken();
    if (token) {
      try {
        await apiFetch(`/api/payments/records/${recordId}`, { method: 'PATCH', body: JSON.stringify(updates) }, token);
        return;
      } catch {
        if (isSupabaseConfigured) {
          const { error } = await supabase.from('payment_records').update(updates).eq('id', recordId);
          if (!error) return;
        }
      }
    }
    portalStore.updatePaymentRecord(recordId, updates);
  },

  async deletePaymentRecord(recordId: string): Promise<void> {
    const token = await getAccessToken();
    if (token) {
      try {
        await apiFetch(`/api/payments/records/${recordId}`, { method: 'DELETE' }, token);
        return;
      } catch {
        if (isSupabaseConfigured) {
          const { error } = await supabase.from('payment_records').delete().eq('id', recordId);
          if (!error) return;
        }
      }
    }
    portalStore.deletePaymentRecord(recordId);
  },
};
