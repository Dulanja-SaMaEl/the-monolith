import React, { useState, useEffect, useCallback } from 'react';
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
  BillingLineItem,
  ContactInquiry,
  ExecutiveTask,
} from '../../../lib/portalStore';
import { portalApi } from '../../../lib/portalApi';
import { downloadBillingVoucherHtml, printBillingVoucherPdf } from '../../../lib/invoiceDownloader';

interface AdminPortalProps {
  navigate: (route: string) => void;
}

const AdminPagination: React.FC<{
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalItems, pageSize, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;
  const startIdx = (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-median-taupe/15 text-xs font-mono">
      <span className="text-median-taupe/80">
        Showing <strong className="text-black">{startIdx}</strong>–<strong className="text-black">{endIdx}</strong> of <strong className="text-black">{totalItems}</strong> entries
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-2.5 py-1 rounded-lg border border-median-taupe/30 hover:border-black disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          ← Prev
        </button>
        {[...Array(totalPages)].map((_, idx) => {
          const pageNum = idx + 1;
          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                currentPage === pageNum
                  ? 'bg-black text-white'
                  : 'border border-median-taupe/30 hover:border-black text-black'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-2.5 py-1 rounded-lg border border-median-taupe/30 hover:border-black disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

const AdminSkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-3 animate-pulse">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="p-5 rounded-2xl bg-white border border-median-taupe/10 shadow-sm space-y-3">
        <div className="flex justify-between items-start">
          <div className="space-y-2 w-2/3">
            <div className="h-2.5 bg-median-taupe/20 rounded w-1/4" />
            <div className="h-5 bg-median-taupe/25 rounded w-1/2" />
            <div className="h-3 bg-median-taupe/15 rounded w-3/4" />
          </div>
          <div className="h-6 w-16 bg-median-taupe/20 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

export const AdminPortal: React.FC<AdminPortalProps> = ({ navigate }) => {
  const { user, logout, switchDemoRole, isLiveAuth } = useAuth();

  // Active Admin View
  const [activeTab, setActiveTab] = useState<
    'overview' | 'tasks' | 'customers' | 'partners' | 'projects' | 'billing' | 'reviews' | 'blog' | 'requests'
  >('overview');
  const [isLiveDb, setIsLiveDb] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Live Data States
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [projects, setProjects] = useState<PortalProject[]>([]);
  const [billingDocs, setBillingDocs] = useState<BillingDocument[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [blogPosts, setBlogPosts] = useState<PortalBlogPost[]>([]);
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [meetings, setMeetings] = useState<MeetingRequest[]>([]);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [tasks, setTasks] = useState<ExecutiveTask[]>([]);

  // Feedback Notification
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const showAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(null), 4000);
  };

  // Executive Tasks Daily Sprint State
  const [taskFilterDate, setTaskFilterDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [taskFilterAssignee, setTaskFilterAssignee] = useState<string>('All');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('Dulanja Abeysinghe');
  const [newTaskCategory, setNewTaskCategory] = useState('Architecture');
  const [newTaskPriority, setNewTaskPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [editingTask, setEditingTask] = useState<ExecutiveTask | null>(null);

  // Customer Security State
  const [customerPasswordInputs, setCustomerPasswordInputs] = useState<Record<string, string>>({});

  // Project Edit State
  const [editingProject, setEditingProject] = useState<PortalProject | null>(null);

  // Form States
  // 1. New / Edit Customer
  const [newCustName, setNewCustName] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustCompany, setNewCustCompany] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustPassword, setNewCustPassword] = useState('MonolithClient2026!');
  const [editingCustomer, setEditingCustomer] = useState<UserProfile | null>(null);

  // 2. New Partner
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerCategory, setNewPartnerCategory] = useState('Cloud Infrastructure');
  const [newPartnerWebsite, setNewPartnerWebsite] = useState('');
  const [newPartnerDesc, setNewPartnerDesc] = useState('');

  // 3. New Project
  const [projClientId, setProjClientId] = useState('');
  const [projTitle, setProjTitle] = useState('');
  const [projCategory, setProjCategory] = useState('Custom Software Engineering');
  const [projCode, setProjCode] = useState('');
  const [projTargetDate, setProjTargetDate] = useState('2027-01-31');
  const [projSummary, setProjSummary] = useState('');

  // 4. Invoicing / Quotation Builder (Default Currency: LKR)
  const [billType, setBillType] = useState<'quotation' | 'invoice'>('invoice');
  const [billClientId, setBillClientId] = useState('');
  const [billProjectTitle, setBillProjectTitle] = useState('');
  const [billDueDate, setBillDueDate] = useState('');
  const [billNotes, setBillNotes] = useState('');
  const [lineItems, setLineItems] = useState<BillingLineItem[]>([
    { id: '1', description: 'Core Microservices Architecture & Redis Mutex Implementation', quantity: 1, unit_price: 950000, total: 950000 },
  ]);
  const [selectedBillingDoc, setSelectedBillingDoc] = useState<BillingDocument | null>(null);
  const [lastCreatedDoc, setLastCreatedDoc] = useState<BillingDocument | null>(null);

  // 5. Customer Review Form
  const [revName, setRevName] = useState('');
  const [revTitle, setRevTitle] = useState('');
  const [revCompany, setRevCompany] = useState('');
  const [revRating, setRevRating] = useState(5);
  const [revText, setRevText] = useState('');

  // 6. Blog Post Form
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState('Architecture');
  const [postAuthor, setPostAuthor] = useState('Dulanja Abeysinghe');
  const [postReadTime, setPostReadTime] = useState('5 min read');
  const [postCover, setPostCover] = useState('/assets/blog-1.jpg');
  const [postExcerpt, setPostExcerpt] = useState('');
  const [postContent, setPostContent] = useState('');

  // Pagination & Inline Edit States
  const PAGE_SIZE = 5;
  const [custPage, setCustPage] = useState(1);
  const [partPage, setPartPage] = useState(1);
  const [projPage, setProjPage] = useState(1);
  const [billPage, setBillPage] = useState(1);
  const [revPage, setRevPage] = useState(1);
  const [blogPage, setBlogPage] = useState(1);
  const [reqPage, setReqPage] = useState(1);

  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [editingReview, setEditingReview] = useState<CustomerReview | null>(null);
  const [editingPost, setEditingPost] = useState<PortalBlogPost | null>(null);

  // Reload all data from Render Backend / Supabase DB (with fallback to sandbox)
  const refreshData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const [clientsRes, partRes, projRes, billRes, revRes, blogRes, reqRes, meetRes, inqRes, taskRes] =
        await Promise.all([
          portalApi.getClients(),
          portalApi.getPartners(true),
          portalApi.getProjects(),
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
  }, [isLiveAuth]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleLogout = async () => {
    await logout();
    navigate('/portal/login');
  };

  // 1. Submit New Customer or Update Existing Customer
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustEmail) return;

    try {
      await portalApi.createClient({
        email: newCustEmail,
        password: newCustPassword || 'MonolithClient2026!',
        full_name: newCustName,
        company_name: newCustCompany || 'Enterprise Client',
        phone: newCustPhone,
      });

      setNewCustName('');
      setNewCustEmail('');
      setNewCustCompany('');
      setNewCustPhone('');
      await refreshData();
      showAlert('✓ Customer account registered and persisted.');
    } catch (err: any) {
      showAlert(`✕ Error creating customer: ${err.message}`);
    }
  };

  const handleSaveCustomerEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    try {
      await portalApi.updateClient(editingCustomer.id, {
        full_name: editingCustomer.full_name,
        company_name: editingCustomer.company_name,
        phone: editingCustomer.phone,
      });
      setEditingCustomer(null);
      await refreshData();
      showAlert('✓ Customer profile updated.');
    } catch (err: any) {
      showAlert(`✕ Update failed: ${err.message}`);
    }
  };

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (!window.confirm(`Permanently delete customer account for "${name}"? This action cannot be undone.`)) return;
    try {
      await portalApi.deleteClient(id);
      if (editingCustomer?.id === id) setEditingCustomer(null);
      await refreshData();
      showAlert(`✓ Deleted customer account for "${name}".`);
    } catch (err: any) {
      showAlert(`✕ Error deleting customer: ${err.message}`);
    }
  };

  const handleUpdateCustomerPassword = async (clientId: string, clientName: string) => {
    const newPass = customerPasswordInputs[clientId];
    if (!newPass || newPass.length < 6) {
      showAlert('✕ Password must be at least 6 characters long.');
      return;
    }
    try {
      await portalApi.updateClientPassword(clientId, newPass);
      setCustomerPasswordInputs((prev) => ({ ...prev, [clientId]: '' }));
      showAlert(`✓ Password updated for ${clientName}. Client can log in immediately.`);
    } catch (err: any) {
      showAlert(`✕ Error updating password: ${err.message}`);
    }
  };

  const handleToggleCustomerBlock = async (c: UserProfile) => {
    const nextBlocked = !c.is_blocked;
    const actionLabel = nextBlocked ? 'block & suspend' : 'unblock';
    if (!window.confirm(`Are you sure you want to ${actionLabel} client "${c.company_name || c.full_name}"?`)) return;
    try {
      await portalApi.toggleClientBlock(c.id, nextBlocked);
      setUsers((prev) =>
        prev.map((u) => (u.id === c.id ? { ...u, is_blocked: nextBlocked, status: nextBlocked ? 'suspended' : 'active' } : u))
      );
      showAlert(`✓ Client account "${c.company_name || c.full_name}" ${nextBlocked ? 'suspended & blocked' : 're-activated'}.`);
    } catch (err: any) {
      showAlert(`✕ Error toggling client status: ${err.message}`);
    }
  };

  const handleSavePartnerEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartner) return;
    try {
      await portalApi.updatePartner(editingPartner.id, {
        name: editingPartner.name,
        category: editingPartner.category,
        website_url: editingPartner.website_url,
        description: editingPartner.description,
        logo_url: editingPartner.logo_url,
        is_active: editingPartner.is_active,
      });
      setEditingPartner(null);
      await refreshData();
      showAlert(`✓ Strategic partner "${editingPartner.name}" updated.`);
    } catch (err: any) {
      showAlert(`✕ Update partner failed: ${err.message}`);
    }
  };

  const handleDeletePartner = async (id: string, name: string) => {
    if (!window.confirm(`Permanently remove partner "${name}" from ecosystem?`)) return;
    try {
      await portalApi.deletePartner(id);
      if (editingPartner?.id === id) setEditingPartner(null);
      await refreshData();
      showAlert(`✓ Removed partner "${name}".`);
    } catch (err: any) {
      showAlert(`✕ Error deleting partner: ${err.message}`);
    }
  };

  const handleSaveReviewEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;
    try {
      await portalApi.updateReview(editingReview.id, {
        client_name: editingReview.client_name,
        client_title: editingReview.client_title,
        company_name: editingReview.company_name,
        rating: editingReview.rating,
        review_text: editingReview.review_text,
        is_featured: editingReview.is_featured,
      });
      setEditingReview(null);
      await refreshData();
      showAlert(`✓ Testimonial from "${editingReview.client_name}" updated.`);
    } catch (err: any) {
      showAlert(`✕ Update review failed: ${err.message}`);
    }
  };

  const handleDeleteReview = async (id: string, name: string) => {
    if (!window.confirm(`Permanently delete review from "${name}"?`)) return;
    try {
      await portalApi.deleteReview(id);
      if (editingReview?.id === id) setEditingReview(null);
      await refreshData();
      showAlert(`✓ Deleted review from "${name}".`);
    } catch (err: any) {
      showAlert(`✕ Error deleting review: ${err.message}`);
    }
  };

  const handleSavePostEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    try {
      await portalApi.updateBlogPost(editingPost.id, {
        title: editingPost.title,
        category: editingPost.category,
        author: editingPost.author,
        read_time: editingPost.read_time,
        cover_image: editingPost.cover_image,
        excerpt: editingPost.excerpt,
        content: editingPost.content,
        is_published: editingPost.is_published,
      });
      setEditingPost(null);
      await refreshData();
      showAlert(`✓ Article "${editingPost.title}" updated.`);
    } catch (err: any) {
      showAlert(`✕ Update article failed: ${err.message}`);
    }
  };

  const handleDeletePost = async (id: string, title: string) => {
    if (!window.confirm(`Permanently delete article "${title}"?`)) return;
    try {
      await portalApi.deleteBlogPost(id);
      if (editingPost?.id === id) setEditingPost(null);
      await refreshData();
      showAlert(`✓ Deleted article "${title}".`);
    } catch (err: any) {
      showAlert(`✕ Error deleting article: ${err.message}`);
    }
  };

  // 2. Submit New Partner
  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerName) return;

    try {
      await portalApi.createPartner({
        name: newPartnerName,
        category: newPartnerCategory,
        website_url: newPartnerWebsite,
        description: newPartnerDesc,
        is_active: true,
      });

      setNewPartnerName('');
      setNewPartnerWebsite('');
      setNewPartnerDesc('');
      await refreshData();
      showAlert('✓ Strategic partner registered and published.');
    } catch (err: any) {
      showAlert(`✕ Error adding partner: ${err.message}`);
    }
  };

  // 3. Submit New Project
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle || !projClientId) return;

    const selectedClient = users.find((u) => u.id === projClientId);
    const clientName = selectedClient?.company_name || selectedClient?.full_name || 'Enterprise Client';

    try {
      await portalApi.createProject({
        client_id: projClientId,
        client_name: clientName,
        title: projTitle,
        code_name: projCode || `PRJ-${Math.floor(100 + Math.random() * 900)}`,
        category: projCategory,
        status: 'architecture',
        progress_percentage: 15,
        target_launch_date: projTargetDate,
        summary: projSummary || 'High-throughput enterprise service pipeline.',
        milestones: [
          { title: 'Architecture Schema & Core Protocol Design', is_completed: true },
          { title: 'Microservices & Idempotent Webhook Pipeline', is_completed: false },
          { title: 'Load Simulation & Multi-Region Cutover', is_completed: false },
        ],
      });

      setProjTitle('');
      setProjCode('');
      setProjSummary('');
      await refreshData();
      showAlert('✓ New project commissioned and assigned to client VIP portal.');
    } catch (err: any) {
      showAlert(`✕ Error creating project: ${err.message}`);
    }
  };

  // Project Progress Quick Update
  const handleUpdateProgress = async (projectId: string, delta: number) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;
    const nextVal = Math.min(100, Math.max(0, proj.progress_percentage + delta));
    const nextStatus = nextVal === 100 ? 'deployed' : nextVal > 70 ? 'qa_testing' : 'in_progress';
    await portalApi.updateProject(projectId, {
      progress_percentage: nextVal,
      status: nextStatus,
    });
    await refreshData();
  };

  const handleSaveProjectEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    try {
      await portalApi.updateProject(editingProject.id, {
        title: editingProject.title,
        code_name: editingProject.code_name,
        category: editingProject.category,
        status: editingProject.status,
        progress_percentage: editingProject.progress_percentage,
        target_launch_date: editingProject.target_launch_date,
        staging_url: editingProject.staging_url,
        summary: editingProject.summary,
      });
      setProjects((prev) => prev.map((p) => (p.id === editingProject.id ? editingProject : p)));
      setEditingProject(null);
      await refreshData();
      showAlert(`✓ Project "${editingProject.title}" updated successfully.`);
    } catch (err: any) {
      showAlert(`✕ Error updating project: ${err.message}`);
    }
  };

  const handleDeleteProject = async (id: string, title: string) => {
    if (!window.confirm(`Permanently delete project "${title}"? This will also remove all associated milestones.`)) return;
    try {
      await portalApi.deleteProject(id);
      if (editingProject?.id === id) setEditingProject(null);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      showAlert(`✓ Project "${title}" deleted.`);
    } catch (err: any) {
      showAlert(`✕ Error deleting project: ${err.message}`);
    }
  };

  // Executive Daily Tasks Handlers
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    try {
      const { task } = await portalApi.createTask({
        title: newTaskTitle,
        assignee: newTaskAssignee,
        category: newTaskCategory,
        priority: newTaskPriority,
        task_date: taskFilterDate,
        is_completed: false,
        notes: newTaskNotes || undefined,
      });
      setTasks((prev) => [task, ...prev]);
      setNewTaskTitle('');
      setNewTaskNotes('');
      showAlert(`✓ Task added for ${newTaskAssignee} on ${taskFilterDate}.`);
    } catch (err: any) {
      showAlert(`✕ Error adding task: ${err.message}`);
    }
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
      showAlert(
        nextCompleted
          ? `✓ Marked complete: "${t.title}". Remaining tasks shifted up.`
          : `↺ Restored "${t.title}" to active sprint.`
      );
    } catch (err: any) {
      showAlert(`✕ Error toggling task: ${err.message}`);
    }
  };

  const handleRolloverTask = async (t: ExecutiveTask) => {
    const d = new Date(t.task_date || taskFilterDate);
    d.setDate(d.getDate() + 1);
    const nextDate = d.toISOString().split('T')[0];
    try {
      await portalApi.updateTask(t.id, { task_date: nextDate });
      setTasks((prev) =>
        prev.map((item) => (item.id === t.id ? { ...item, task_date: nextDate } : item))
      );
      showAlert(`✓ Shifted "${t.title}" to tomorrow (${nextDate}).`);
    } catch (err: any) {
      showAlert(`✕ Error rolling over task: ${err.message}`);
    }
  };

  const handleBulkRollover = async () => {
    const d = new Date(taskFilterDate);
    d.setDate(d.getDate() + 1);
    const nextDate = d.toISOString().split('T')[0];
    try {
      const res = await portalApi.rolloverTasks(taskFilterDate, nextDate);
      await refreshData();
      showAlert(`✓ Rolled over ${res.count} incomplete tasks from ${taskFilterDate} to ${nextDate}.`);
    } catch (err: any) {
      showAlert(`✕ Error during rollover: ${err.message}`);
    }
  };

  const handleDeleteTask = async (id: string, title: string) => {
    if (!window.confirm(`Delete executive task "${title}"?`)) return;
    try {
      await portalApi.deleteTask(id);
      if (editingTask?.id === id) setEditingTask(null);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      showAlert(`✓ Task "${title}" deleted.`);
    } catch (err: any) {
      showAlert(`✕ Error deleting task: ${err.message}`);
    }
  };

  const handleSaveTaskEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    try {
      await portalApi.updateTask(editingTask.id, {
        title: editingTask.title,
        assignee: editingTask.assignee,
        category: editingTask.category,
        priority: editingTask.priority,
        notes: editingTask.notes,
        task_date: editingTask.task_date,
      });
      setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? editingTask : t)));
      setEditingTask(null);
      showAlert(`✓ Task "${editingTask.title}" updated.`);
    } catch (err: any) {
      showAlert(`✕ Error saving task: ${err.message}`);
    }
  };

  // 4. Invoicing Line Items Handlers
  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: String(Date.now()), description: '', quantity: 1, unit_price: 250000, total: 250000 },
    ]);
  };

  const updateLineItem = (id: string, field: keyof BillingLineItem, val: any) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: val };
          updated.total = Number(updated.quantity || 1) * Number(updated.unit_price || 0);
          return updated;
        }
        return item;
      })
    );
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((i) => i.id !== id));
  };

  const enrichBillingDoc = (doc: BillingDocument): BillingDocument => {
    const client = users.find((u) => u.id === doc.client_id);
    if (!client) return doc;
    return {
      ...doc,
      client_name: doc.client_name || client.company_name || client.full_name,
      client_contact_name: doc.client_contact_name || client.full_name,
      client_email: doc.client_email || client.email,
      client_phone: doc.client_phone || client.phone,
    };
  };

  const createBillingRecord = async (): Promise<BillingDocument | null> => {
    if (!billClientId || lineItems.length === 0) return null;

    const selectedClient = users.find((u) => u.id === billClientId);
    const subtotal = lineItems.reduce((acc, i) => acc + i.total, 0);

    try {
      const { document: created } = await portalApi.createBillingDocument({
        type: billType,
        client_id: billClientId,
        client_name: selectedClient?.company_name || selectedClient?.full_name || 'Client',
        client_contact_name: selectedClient?.full_name,
        client_email: selectedClient?.email,
        client_phone: selectedClient?.phone,
        project_title: billProjectTitle || 'Enterprise Architecture Sprints',
        status: 'sent',
        currency: 'LKR',
        line_items: lineItems,
        subtotal,
        tax: 0,
        total: subtotal,
        due_date: billDueDate || '2026-12-15',
        notes: billNotes || 'Settled in LKR via Sri Lanka CEFTS / Corporate Bank Wire.',
      });

      const enriched = enrichBillingDoc(created);
      setLastCreatedDoc(enriched);
      setBillProjectTitle('');
      setBillNotes('');
      await refreshData();
      showAlert(`✓ ${billType.toUpperCase()} (${created.document_number}) generated in LKR and ready to download.`);
      return enriched;
    } catch (err: any) {
      showAlert(`✕ Error creating billing document: ${err.message}`);
      return null;
    }
  };

  const handleCreateBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    await createBillingRecord();
  };

  const handleCreateAndDownload = async (format: 'html' | 'pdf') => {
    const created = await createBillingRecord();
    if (!created) {
      showAlert('Please select a client and add at least one deliverable item first.');
      return;
    }
    if (format === 'pdf') {
      printBillingVoucherPdf(created);
    } else {
      downloadBillingVoucherHtml(created);
    }
  };

  // 5. Submit Customer Review
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revName || !revCompany || !revText) return;

    try {
      await portalApi.addReview({
        client_name: revName,
        client_title: revTitle || 'Managing Director',
        company_name: revCompany,
        rating: revRating,
        review_text: revText,
        is_featured: true,
      });

      setRevName('');
      setRevTitle('');
      setRevCompany('');
      setRevText('');
      await refreshData();
      showAlert('✓ Testimonial approved and published to live website.');
    } catch (err: any) {
      showAlert(`✕ Error publishing review: ${err.message}`);
    }
  };

  // 6. Submit Blog Post
  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle || !postExcerpt || !postContent) return;

    const slug = postTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    try {
      await portalApi.addBlogPost({
        slug,
        title: postTitle,
        category: postCategory,
        author: postAuthor,
        read_time: postReadTime,
        cover_image: postCover,
        excerpt: postExcerpt,
        content_markdown: postContent,
        is_published: true,
      });

      setPostTitle('');
      setPostExcerpt('');
      setPostContent('');
      await refreshData();
      showAlert('✓ Editorial piece published to live "Latest News" & /blog.');
    } catch (err: any) {
      showAlert(`✕ Error publishing article: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-black font-inter selection:bg-median-taupe selection:text-white flex flex-col md:flex-row">
      {/* ================= LEFT HAUTE EDITORIAL ADMIN SIDEBAR ================= */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-median-taupe/20 p-4 sm:p-6 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo & Cluster Badge */}
          <div className="flex md:block items-center justify-between mb-4 md:mb-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 focus:outline-none group"
            >
              <span className="w-4 h-4 bg-black flex items-center justify-center text-white text-[9px] font-bold">
                ■
              </span>
              <span className="font-oswald text-xl font-bold tracking-[0.2em] text-black uppercase group-hover:text-median-taupe transition-colors">
                MONOLITH<span className="text-median-taupe ml-1">LK</span>
              </span>
            </button>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-median-taupe/80">
              <span className={`w-2 h-2 rounded-full animate-pulse ${isLiveDb ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{isLiveDb ? 'Live Supabase DB' : 'Offline Mode'}</span>
            </div>
          </div>

          {/* Nav List - Horizontal scroll on mobile / vertical stack on desktop */}
          <nav className="flex md:flex-col gap-1.5 md:space-y-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 no-scrollbar font-oswald text-xs sm:text-sm uppercase tracking-wider">
            {[
              { id: 'overview', label: 'Telemetry & HUD', count: null },
              { id: 'tasks', label: 'Executive Tasks', count: tasks.filter((t) => !t.is_completed).length },
              { id: 'customers', label: 'Customers Registry', count: users.filter((u) => u.role === 'client').length },
              { id: 'partners', label: 'Strategic Partners', count: partners.length },
              { id: 'projects', label: 'Projects & Progress', count: projects.length },
              { id: 'billing', label: 'Invoices & Quotations', count: billingDocs.length },
              { id: 'reviews', label: 'Customer Reviews', count: reviews.length },
              { id: 'blog', label: 'Editorial & News CMS', count: blogPosts.length },
              { id: 'requests', label: 'Inquiries & Meetings', count: requests.length + meetings.length + inquiries.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-3 md:py-2.5 md:px-3 rounded-xl flex items-center gap-2 md:justify-between transition-all shrink-0 md:shrink whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-black text-white font-bold shadow-sm'
                    : 'text-median-taupe hover:text-black hover:bg-median-taupe/10 bg-white md:bg-transparent border border-median-taupe/20 md:border-0'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-median-taupe/10 text-median-taupe'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Admin Mobile Quick Actions (visible only on mobile) */}
        <div className="flex md:hidden items-center justify-between gap-2 pt-3 border-t border-median-taupe/15 text-[11px] font-mono">
          <button
            onClick={() => {
              switchDemoRole('client');
              navigate('/portal/client');
            }}
            className="px-2.5 py-1.5 rounded-lg border border-median-taupe/30 hover:border-black text-black"
          >
            Client View ↗
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-2.5 py-1.5 rounded-lg border border-median-taupe/30 hover:border-black text-black"
          >
            Public Site
          </button>
          <button
            onClick={handleLogout}
            className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 font-bold"
          >
            Sign Out
          </button>
        </div>

        {/* Admin Desktop Sidebar Footer Actions (visible md and up) */}
        <div className="hidden md:block pt-6 border-t border-median-taupe/15 mt-6 space-y-2 text-xs font-mono">
          <div className="text-median-taupe/80 text-[10px] truncate">
            Architect: <strong>{user?.full_name || 'Dulanja Abeysinghe'}</strong>
          </div>
          <button
            onClick={() => {
              switchDemoRole('client');
              navigate('/portal/client');
            }}
            className="w-full py-2 px-3 rounded-lg border border-median-taupe/30 hover:border-black text-black text-center transition-colors"
          >
            Switch to Client View ↗
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full py-2 px-3 rounded-lg border border-median-taupe/30 hover:border-black text-black text-center transition-colors"
          >
            View Public Site
          </button>
          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-center transition-colors font-bold"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ================= MAIN EXECUTIVE CONTENT PANE ================= */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 max-h-screen overflow-y-auto w-full min-w-0">
        {/* Top Breadcrumb & Notification Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-median-taupe/20">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe font-bold block mb-1">
              Monolith LK / Admin Control Panel
            </span>
            <h1 className="font-oswald text-3xl sm:text-4xl font-bold uppercase text-black">
              {activeTab === 'overview' && 'Executive Telemetry HUD'}
              {activeTab === 'tasks' && 'Daily Executive Sprints & Tasks'}
              {activeTab === 'customers' && 'Customer & Enterprise Registry'}
              {activeTab === 'partners' && 'Strategic Academic & Tech Partners'}
              {activeTab === 'projects' && 'Projects & Engineering Progress'}
              {activeTab === 'billing' && 'Invoicing & Quotation Studio'}
              {activeTab === 'reviews' && 'Customer Reviews & Accreditations'}
              {activeTab === 'blog' && 'Editorial & "Latest News" CMS'}
              {activeTab === 'requests' && 'Client Requests & Consultation Sync'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full border border-median-taupe/30 bg-median-taupe/5 text-[10px] font-mono text-median-taupe">
              {isSyncing ? 'Syncing DB...' : isLiveDb ? 'Connected: Supabase + Render' : 'Offline Mode'}
            </span>
            <button
              type="button"
              onClick={refreshData}
              className="px-3 py-1 rounded-full border border-median-taupe/30 hover:border-black text-[10px] font-bold uppercase text-black transition-colors"
            >
              ↻ Sync
            </button>
          </div>
        </div>

        {/* Global Feedback & Live DB Mode Notice */}
        {!isLiveDb && !isSyncing && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <strong>Offline Cached Session:</strong> Edits are currently saving to local cache. Please verify your network connection or sign in with your admin credentials to sync directly with Supabase.
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-black text-white font-bold uppercase text-[10px] tracking-wider hover:bg-median-taupe transition-colors shrink-0"
            >
              Sign In to Live DB →
            </button>
          </div>
        )}

        {alertMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono font-semibold animate-fade-in">
            {alertMsg}
          </div>
        )}

        {/* ================= TAB 1: OVERVIEW HUD ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {[
                { label: 'Active Enterprise Clients', val: users.filter((u) => u.role === 'client').length, suffix: '+' },
                { label: 'Live Projects Dispatched', val: projects.length, suffix: '' },
                {
                  label: 'Total Billing Volume (LKR)',
                  val: `LKR ${(billingDocs.reduce((acc, d) => acc + d.total, 0) / 1000000).toFixed(2)}M`,
                  suffix: '',
                },
                { label: 'Pending Inquiries & Meetings', val: requests.length + meetings.length + inquiries.length, suffix: '' },
              ].map((card, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white border border-median-taupe/20 shadow-sm"
                >
                  <span className="text-[10px] font-mono uppercase tracking-wider text-median-taupe font-bold block mb-2">
                    {card.label}
                  </span>
                  <div className="font-oswald text-4xl sm:text-5xl font-bold text-median-taupe">
                    {card.val}{card.suffix}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Action Shortcuts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-median-taupe/20 shadow-sm">
                <h3 className="font-oswald text-lg font-bold uppercase text-black mb-2">Commission Project</h3>
                <p className="text-xs text-median-taupe/80 mb-4">
                  Spin up a new development pipeline for an enterprise customer with custom milestones.
                </p>
                <button
                  onClick={() => setActiveTab('projects')}
                  className="px-4 py-2 rounded-xl bg-black text-white text-xs font-oswald uppercase tracking-wider hover:bg-median-taupe transition-colors"
                >
                  Create Project →
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-median-taupe/20 shadow-sm">
                <h3 className="font-oswald text-lg font-bold uppercase text-black mb-2">Issue Billing Voucher</h3>
                <p className="text-xs text-median-taupe/80 mb-4">
                  Generate itemized formal quotations or invoices with auto-calculated Net terms.
                </p>
                <button
                  onClick={() => setActiveTab('billing')}
                  className="px-4 py-2 rounded-xl bg-black text-white text-xs font-oswald uppercase tracking-wider hover:bg-median-taupe transition-colors"
                >
                  New Quotation / Invoice →
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-median-taupe/20 shadow-sm">
                <h3 className="font-oswald text-lg font-bold uppercase text-black mb-2">Publish Editorial Post</h3>
                <p className="text-xs text-median-taupe/80 mb-4">
                  Publish technical whitepapers or engineering logs directly to the live homepage.
                </p>
                <button
                  onClick={() => setActiveTab('blog')}
                  className="px-4 py-2 rounded-xl bg-black text-white text-xs font-oswald uppercase tracking-wider hover:bg-median-taupe transition-colors"
                >
                  Write Article →
                </button>
              </div>
            </div>

            {/* Live Progress Pipeline Preview */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-median-taupe/20 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-oswald text-xl font-bold uppercase text-black">
                  Active Engineering Sprints
                </h3>
                <button
                  onClick={() => setActiveTab('projects')}
                  className="text-xs font-mono uppercase text-median-taupe hover:text-black transition-colors"
                >
                  View All Projects →
                </button>
              </div>

              <div className="space-y-4">
                {projects.slice(0, 3).map((p) => (
                  <div key={p.id} className="p-4 rounded-xl border border-median-taupe/15 bg-median-taupe/5">
                    <div className="flex justify-between items-center mb-2 text-xs font-mono">
                      <span className="font-bold text-black">{p.title} ({p.client_name})</span>
                      <span className="text-median-taupe font-bold">{p.progress_percentage}% · {p.status.toUpperCase()}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-median-taupe/20 overflow-hidden">
                      <div
                        className="h-full bg-median-taupe rounded-full"
                        style={{ width: `${p.progress_percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Executive Daily Sprints Widget */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-median-taupe/20 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-median-taupe/15">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe font-bold block">
                    Founders' Daily Execution
                  </span>
                  <h3 className="font-oswald text-xl font-bold uppercase text-black">
                    Today's Executive Tasks ({tasks.filter((t) => !t.is_completed).length} Remaining)
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="px-4 py-2 rounded-xl bg-black text-white text-xs font-oswald uppercase tracking-wider hover:bg-median-taupe transition-colors shrink-0"
                >
                  Manage Sprint Board →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tasks
                  .filter((t) => !t.is_completed)
                  .slice(0, 4)
                  .map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleToggleTask(t)}
                      className="p-3.5 rounded-xl border border-median-taupe/15 bg-median-taupe/5 hover:bg-white hover:border-black cursor-pointer transition-all flex items-start gap-3 group"
                    >
                      <span className="w-5 h-5 rounded-full border border-median-taupe flex items-center justify-center text-xs group-hover:border-black group-hover:bg-black group-hover:text-white shrink-0 mt-0.5">
                        ○
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-median-taupe/15 text-black font-semibold">
                            {t.assignee}
                          </span>
                          <span
                            className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                              t.priority === 'urgent'
                                ? 'bg-red-100 text-red-800'
                                : t.priority === 'high'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-median-taupe/10 text-median-taupe'
                            }`}
                          >
                            {t.priority}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-black truncate">{t.title}</p>
                      </div>
                    </div>
                  ))}
                {tasks.filter((t) => !t.is_completed).length === 0 && (
                  <div className="col-span-2 p-6 text-center text-xs font-mono text-median-taupe">
                    ✓ All executive sprint tasks completed today.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: DAILY EXECUTIVE TASKS & SPRINTS ================= */}
        {activeTab === 'tasks' && (
          <div className="space-y-8">
            {/* Date Navigation & Assignee Filter Bar */}
            <div className="p-6 rounded-2xl bg-white border border-median-taupe/20 shadow-sm space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Quick Date Selectors */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono uppercase font-bold text-median-taupe mr-1">Sprint Date:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(taskFilterDate);
                      d.setDate(d.getDate() - 1);
                      setTaskFilterDate(d.toISOString().split('T')[0]);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-median-taupe/30 hover:border-black text-xs font-mono font-semibold transition-colors"
                  >
                    ← Yesterday
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskFilterDate(new Date().toISOString().split('T')[0])}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                      taskFilterDate === new Date().toISOString().split('T')[0]
                        ? 'bg-black text-white'
                        : 'border border-median-taupe/30 hover:border-black text-black'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(taskFilterDate);
                      d.setDate(d.getDate() + 1);
                      setTaskFilterDate(d.toISOString().split('T')[0]);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-median-taupe/30 hover:border-black text-xs font-mono font-semibold transition-colors"
                  >
                    Tomorrow →
                  </button>
                  <input
                    type="date"
                    value={taskFilterDate}
                    onChange={(e) => setTaskFilterDate(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-xs font-mono text-black focus:outline-none focus:border-black"
                  />
                </div>

                {/* Assignee Filter Tabs */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <span className="uppercase font-bold text-median-taupe mr-1">Assignee:</span>
                  {['All', 'Dulanja Abeysinghe', 'Remashi Diyana'].map((person) => {
                    const count = tasks.filter(
                      (t) =>
                        (t.task_date || taskFilterDate) === taskFilterDate &&
                        (person === 'All' ? true : t.assignee.includes(person.split(' ')[0]))
                    ).length;
                    return (
                      <button
                        key={person}
                        type="button"
                        onClick={() => setTaskFilterAssignee(person)}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                          taskFilterAssignee === person
                            ? 'bg-black text-white'
                            : 'border border-median-taupe/30 hover:border-black text-black bg-white'
                        }`}
                      >
                        <span>{person}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            taskFilterAssignee === person
                              ? 'bg-white/20 text-white'
                              : 'bg-median-taupe/15 text-median-taupe'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Grid: Add Task (Left) + Active Tasks & Completed Tasks (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Add Daily Task Form */}
              <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-white border border-median-taupe/20 shadow-sm space-y-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe font-bold block mb-1">
                    Add Daily Sprint Task
                  </span>
                  <h3 className="font-oswald text-xl font-bold uppercase text-black">
                    New Executive Task
                  </h3>
                  <p className="text-xs text-median-taupe/80 mt-1">
                    Assign a priority objective for {taskFilterDate}. Once ticked, it shifts to completed and remaining tasks automatically move up.
                  </p>
                </div>

                <form onSubmit={handleCreateTask} className="space-y-4 text-xs font-mono">
                  <div>
                    <label className="block font-bold uppercase text-black mb-1">Task Title *</label>
                    <input
                      type="text"
                      required
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="e.g. Verify Redis Redlock mutex failover"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold uppercase text-black mb-1">Assignee *</label>
                      <select
                        value={newTaskAssignee}
                        onChange={(e) => setNewTaskAssignee(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-xs text-black"
                      >
                        <option value="Dulanja Abeysinghe">Dulanja Abeysinghe (Founder)</option>
                        <option value="Remashi Diyana">Remashi Diyana (Co-Founder)</option>
                        <option value="Both (Dulanja & Remashi)">Both (Dulanja & Remashi)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold uppercase text-black mb-1">Priority *</label>
                      <select
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-xs text-black"
                      >
                        <option value="normal">Normal Priority</option>
                        <option value="high">High Priority</option>
                        <option value="urgent">Urgent / Blocker</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-black mb-1">Category</label>
                    <select
                      value={newTaskCategory}
                      onChange={(e) => setNewTaskCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-xs text-black"
                    >
                      <option value="Architecture">Architecture</option>
                      <option value="UI/UX Design">UI/UX Design</option>
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Operations">Operations</option>
                      <option value="Fintech & Security">Fintech & Security</option>
                      <option value="Client Delivery">Client Delivery</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-black mb-1">Execution Notes (Optional)</label>
                    <textarea
                      rows={3}
                      value={newTaskNotes}
                      onChange={(e) => setNewTaskNotes(e.target.value)}
                      placeholder="Technical context, checklist points, or validation criteria..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-xs text-black focus:outline-none focus:border-black"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-black text-white font-oswald text-xs uppercase tracking-widest hover:bg-median-taupe transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>Add Daily Task to Sprint</span>
                    <span>+</span>
                  </button>
                </form>
              </div>

              {/* Task Lists: Active Sprints & Completed Tasks */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. Remaining Active Tasks */}
                <div className="p-6 rounded-2xl bg-white border border-median-taupe/20 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-median-taupe/15">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe font-bold block">
                        Active Execution
                      </span>
                      <h4 className="font-oswald text-xl font-bold uppercase text-black">
                        Remaining Tasks (
                        {
                          tasks.filter(
                            (t) =>
                              !t.is_completed &&
                              (t.task_date || taskFilterDate) === taskFilterDate &&
                              (taskFilterAssignee === 'All' ? true : t.assignee.includes(taskFilterAssignee.split(' ')[0]))
                          ).length
                        }
                        )
                      </h4>
                    </div>

                    {tasks.filter(
                      (t) =>
                        !t.is_completed &&
                        (t.task_date || taskFilterDate) === taskFilterDate &&
                        (taskFilterAssignee === 'All' ? true : t.assignee.includes(taskFilterAssignee.split(' ')[0]))
                    ).length > 0 && (
                      <button
                        type="button"
                        onClick={handleBulkRollover}
                        className="px-3 py-1.5 rounded-lg border border-median-taupe/30 text-median-taupe hover:text-black hover:border-black text-xs font-mono uppercase font-semibold transition-colors"
                        title="Shift all remaining tasks for this date to tomorrow"
                      >
                        Roll Over Incomplete to Tomorrow ➔
                      </button>
                    )}
                  </div>

                  {/* List of Incomplete Tasks */}
                  {(() => {
                    const activeTasks = tasks.filter(
                      (t) =>
                        !t.is_completed &&
                        (t.task_date || taskFilterDate) === taskFilterDate &&
                        (taskFilterAssignee === 'All' ? true : t.assignee.includes(taskFilterAssignee.split(' ')[0]))
                    );

                    if (activeTasks.length === 0) {
                      return (
                        <div className="p-8 text-center text-xs font-mono text-median-taupe rounded-xl bg-median-taupe/5 border border-median-taupe/10">
                          <p className="font-oswald text-base uppercase text-black mb-1">
                            All Tasks Completed For This Date
                          </p>
                          <span>Zero pending blockers. Outstanding execution.</span>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {activeTasks.map((t, idx) => (
                          <div
                            key={t.id}
                            className="p-4 rounded-xl border border-median-taupe/15 bg-white shadow-sm hover:border-black/40 transition-all space-y-2"
                          >
                            <div className="flex items-start justify-between gap-3">
                              {/* Checkbox Tick Button */}
                              <div className="flex items-start gap-3 min-w-0">
                                <button
                                  type="button"
                                  onClick={() => handleToggleTask(t)}
                                  className="w-5 h-5 rounded-full border-2 border-median-taupe flex items-center justify-center text-transparent hover:text-white hover:bg-black hover:border-black shrink-0 mt-0.5 transition-all text-xs font-bold"
                                  title="Tick to mark complete (will automatically move to Completed section)"
                                >
                                  ✓
                                </button>
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                    <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-black text-white">
                                      #{idx + 1}
                                    </span>
                                    <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-median-taupe/15 text-black">
                                      {t.assignee}
                                    </span>
                                    <span
                                      className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                                        t.priority === 'urgent'
                                          ? 'bg-red-100 text-red-800'
                                          : t.priority === 'high'
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-median-taupe/10 text-median-taupe'
                                      }`}
                                    >
                                      {t.priority}
                                    </span>
                                    {t.category && (
                                      <span className="text-[9px] font-mono uppercase text-median-taupe/80">
                                        · {t.category}
                                      </span>
                                    )}
                                  </div>
                                  <h5 className="font-oswald text-base font-bold text-black leading-snug">
                                    {t.title}
                                  </h5>
                                  {t.notes && (
                                    <p className="text-xs font-mono text-median-taupe/80 mt-1">
                                      {t.notes}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Task Actions */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleRolloverTask(t)}
                                  className="px-2.5 py-1 rounded border border-median-taupe/30 hover:border-black text-[10px] font-mono uppercase text-median-taupe hover:text-black transition-colors"
                                  title="Shift this task to tomorrow"
                                >
                                  Tomorrow →
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingTask(editingTask?.id === t.id ? null : t)}
                                  className="px-2.5 py-1 rounded border border-black text-black hover:bg-black hover:text-white text-[10px] font-bold uppercase transition-colors"
                                >
                                  {editingTask?.id === t.id ? 'Cancel' : 'Edit'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTask(t.id, t.title)}
                                  className="px-2.5 py-1 rounded border border-red-300 text-red-700 hover:bg-red-600 hover:text-white hover:border-red-600 text-[10px] font-bold uppercase transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>

                            {/* Inline Task Editor */}
                            {editingTask?.id === t.id && (
                              <form
                                onSubmit={handleSaveTaskEdit}
                                className="pt-3 border-t border-median-taupe/15 space-y-2 text-xs font-mono"
                              >
                                <input
                                  type="text"
                                  required
                                  value={editingTask.title}
                                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                                  className="w-full px-3 py-1.5 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  <select
                                    value={editingTask.assignee}
                                    onChange={(e) => setEditingTask({ ...editingTask, assignee: e.target.value })}
                                    className="px-3 py-1.5 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                                  >
                                    <option value="Dulanja Abeysinghe">Dulanja Abeysinghe</option>
                                    <option value="Remashi Diyana">Remashi Diyana</option>
                                    <option value="Both (Dulanja & Remashi)">Both</option>
                                  </select>
                                  <select
                                    value={editingTask.priority}
                                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as any })}
                                    className="px-3 py-1.5 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                                  >
                                    <option value="normal">Normal</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                  </select>
                                </div>
                                <div className="flex justify-end gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => setEditingTask(null)}
                                    className="px-3 py-1 rounded border border-median-taupe/30 text-median-taupe text-[10px] uppercase font-bold"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="submit"
                                    className="px-3 py-1 rounded bg-black text-white text-[10px] uppercase font-bold hover:bg-median-taupe"
                                  >
                                    Save Task
                                  </button>
                                </div>
                              </form>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* 2. Completed Tasks List */}
                <div className="p-6 rounded-2xl bg-white border border-median-taupe/20 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-median-taupe/15">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-700 font-bold block">
                        Verified Completion
                      </span>
                      <h4 className="font-oswald text-xl font-bold uppercase text-black">
                        Completed Tasks (
                        {
                          tasks.filter(
                            (t) =>
                              t.is_completed &&
                              (t.task_date || taskFilterDate) === taskFilterDate &&
                              (taskFilterAssignee === 'All' ? true : t.assignee.includes(taskFilterAssignee.split(' ')[0]))
                          ).length
                        }
                        )
                      </h4>
                    </div>
                  </div>

                  {(() => {
                    const completedTasks = tasks.filter(
                      (t) =>
                        t.is_completed &&
                        (t.task_date || taskFilterDate) === taskFilterDate &&
                        (taskFilterAssignee === 'All' ? true : t.assignee.includes(taskFilterAssignee.split(' ')[0]))
                    );

                    if (completedTasks.length === 0) {
                      return (
                        <div className="p-6 text-center text-xs font-mono text-median-taupe/60">
                          No completed tasks logged yet for this date.
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-2.5">
                        {completedTasks.map((t) => (
                          <div
                            key={t.id}
                            className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between gap-3 text-xs font-mono"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                ✓
                              </span>
                              <div className="min-w-0">
                                <span className="line-through text-black font-semibold block truncate">
                                  {t.title}
                                </span>
                                <span className="text-[10px] text-median-taupe/80">
                                  {t.assignee} · {t.category}
                                  {t.completed_at &&
                                    ` · Completed ${new Date(t.completed_at).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}`}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleToggleTask(t)}
                                className="px-2.5 py-1 rounded border border-median-taupe/30 hover:border-black text-[10px] uppercase font-bold text-median-taupe hover:text-black transition-colors"
                                title="Restore back to active sprint"
                              >
                                Restore
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTask(t.id, t.title)}
                                className="px-2 py-1 text-red-600 hover:text-red-900 text-xs"
                                title="Delete"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: CUSTOMERS REGISTRY ================= */}
        {activeTab === 'customers' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Add Customer Form */}
            <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-white border border-median-taupe/20 shadow-sm">
              <h3 className="font-oswald text-xl font-bold uppercase text-black mb-1">Add New Customer</h3>
              <p className="text-xs text-median-taupe/80 mb-6">
                Register an enterprise client. They can log in via `/portal/login` with this email.
              </p>

              <form onSubmit={handleAddCustomer} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block font-bold uppercase text-black mb-1">Company / Organization *</label>
                  <input
                    type="text"
                    required
                    value={newCustCompany}
                    onChange={(e) => setNewCustCompany(e.target.value)}
                    placeholder="e.g. ShadowTopup Global"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-black mb-1">Primary Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    placeholder="e.g. Marcus Vance"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-black mb-1">Authorized Email *</label>
                  <input
                    type="email"
                    required
                    value={newCustEmail}
                    onChange={(e) => setNewCustEmail(e.target.value)}
                    placeholder="client@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-black mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    placeholder="+94 76 123 4567"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-black mb-1">Initial Portal Password *</label>
                  <input
                    type="text"
                    required
                    value={newCustPassword}
                    onChange={(e) => setNewCustPassword(e.target.value)}
                    placeholder="MonolithClient2026!"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-black text-white font-oswald text-xs uppercase tracking-widest hover:bg-median-taupe transition-colors"
                >
                  Register Customer →
                </button>
              </form>
            </div>

            {/* Customers List + Inline Editor */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-oswald text-xl font-bold uppercase text-black">
                Registered Clients ({users.filter((u) => u.role === 'client').length})
              </h3>

              {isSyncing ? (
                <AdminSkeletonList count={3} />
              ) : (
                <div className="space-y-3">
                  {users
                    .filter((u) => u.role === 'client')
                    .slice((custPage - 1) * PAGE_SIZE, custPage * PAGE_SIZE)
                    .map((c) => (
                      <div
                        key={c.id}
                        className="p-5 rounded-2xl bg-white border border-median-taupe/20 shadow-sm space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe font-bold block">
                              {c.company_name}
                            </span>
                            <h4 className="font-oswald text-lg font-bold uppercase text-black">{c.full_name}</h4>
                            <div className="text-xs text-median-taupe/80 font-mono">
                              {c.email} {c.phone && `· ${c.phone}`}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                                c.is_blocked
                                  ? 'border border-red-300 bg-red-100 text-red-800'
                                  : 'border border-median-taupe/30 bg-median-taupe/5 text-median-taupe'
                              }`}
                            >
                              {c.is_blocked ? 'Blocked' : 'VIP Active'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleCustomerBlock(c)}
                              className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase transition-colors ${
                                c.is_blocked
                                  ? 'border-emerald-400 text-emerald-800 hover:bg-emerald-600 hover:text-white'
                                  : 'border-amber-400 text-amber-800 hover:bg-amber-600 hover:text-white'
                              }`}
                            >
                              {c.is_blocked ? 'Unblock' : 'Block'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCustomer(editingCustomer?.id === c.id ? null : c)}
                              className="px-3 py-1 rounded-full border border-black text-black hover:bg-black hover:text-white text-[10px] font-bold uppercase transition-colors"
                            >
                              {editingCustomer?.id === c.id ? 'Cancel' : 'Edit'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomer(c.id, c.company_name || c.full_name)}
                              className="px-3 py-1 rounded-full border border-red-300 text-red-700 hover:bg-red-600 hover:text-white hover:border-red-600 text-[10px] font-bold uppercase transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* Customer Password Reset Control */}
                        <div className="pt-2 border-t border-median-taupe/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                          <span className="text-[10px] uppercase font-bold text-median-taupe">
                            Admin Passkey Reset:
                          </span>
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <input
                              type="password"
                              placeholder="New passkey (min 6 chars)"
                              value={customerPasswordInputs[c.id] || ''}
                              onChange={(e) =>
                                setCustomerPasswordInputs({ ...customerPasswordInputs, [c.id]: e.target.value })
                              }
                              className="px-3 py-1.5 text-xs rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black w-full sm:w-48 focus:outline-none focus:border-black"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateCustomerPassword(c.id, c.company_name || c.full_name)}
                              className="px-3 py-1.5 rounded-lg bg-black text-white text-[10px] font-bold uppercase hover:bg-median-taupe transition-colors shrink-0"
                            >
                              Set Password
                            </button>
                          </div>
                        </div>

                        {editingCustomer?.id === c.id && (
                          <form
                            onSubmit={handleSaveCustomerEdit}
                            className="pt-3 border-t border-median-taupe/15 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs"
                          >
                            <input
                              type="text"
                              required
                              value={editingCustomer.full_name}
                              onChange={(e) => setEditingCustomer({ ...editingCustomer, full_name: e.target.value })}
                              placeholder="Contact Name"
                              className="px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                            />
                            <input
                              type="text"
                              value={editingCustomer.company_name || ''}
                              onChange={(e) => setEditingCustomer({ ...editingCustomer, company_name: e.target.value })}
                              placeholder="Company Name"
                              className="px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                            />
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={editingCustomer.phone || ''}
                                onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                                placeholder="Phone"
                                className="flex-1 px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black min-w-0"
                              />
                              <button
                                type="submit"
                                className="px-3 py-2 rounded-lg bg-black text-white font-bold uppercase hover:bg-median-taupe transition-colors shrink-0"
                              >
                                Save
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    ))}
                </div>
              )}

              <AdminPagination
                currentPage={custPage}
                totalItems={users.filter((u) => u.role === 'client').length}
                pageSize={PAGE_SIZE}
                onPageChange={setCustPage}
              />
            </div>
          </div>
        )}

        {/* ================= TAB 3: STRATEGIC PARTNERS ================= */}
        {activeTab === 'partners' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Add Partner Form */}
            <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-white border border-median-taupe/20 shadow-sm">
              <h3 className="font-oswald text-xl font-bold uppercase text-black mb-1">Add Strategic Partner</h3>
              <p className="text-xs text-median-taupe/80 mb-6">
                Publish university, cloud provider, or enterprise ecosystem partner.
              </p>

              <form onSubmit={handleAddPartner} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block font-bold uppercase text-black mb-1">Partner Organization Name *</label>
                  <input
                    type="text"
                    required
                    value={newPartnerName}
                    onChange={(e) => setNewPartnerName(e.target.value)}
                    placeholder="e.g. AWS Cloud Architecture"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-black mb-1">Category</label>
                  <select
                    value={newPartnerCategory}
                    onChange={(e) => setNewPartnerCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                  >
                    <option>Cloud Infrastructure</option>
                    <option>Academic & Research</option>
                    <option>Fintech & Security</option>
                    <option>Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-black mb-1">Website URL</label>
                  <input
                    type="url"
                    value={newPartnerWebsite}
                    onChange={(e) => setNewPartnerWebsite(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-black mb-1">Collaboration Scope</label>
                  <textarea
                    rows={3}
                    value={newPartnerDesc}
                    onChange={(e) => setNewPartnerDesc(e.target.value)}
                    placeholder="Brief description of the partnership..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-black text-white font-oswald text-xs uppercase tracking-widest hover:bg-median-taupe transition-colors"
                >
                  Publish Partner →
                </button>
              </form>
            </div>

            {/* Partners List */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-oswald text-xl font-bold uppercase text-black">
                Active Strategic Partners ({partners.length})
              </h3>

              {isSyncing ? (
                <AdminSkeletonList count={3} />
              ) : (
                <div className="space-y-3">
                  {partners
                    .slice((partPage - 1) * PAGE_SIZE, partPage * PAGE_SIZE)
                    .map((p) => (
                      <div
                        key={p.id}
                        className="p-5 rounded-2xl bg-white border border-median-taupe/20 shadow-sm space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe font-bold block">
                              {p.category}
                            </span>
                            <h4 className="font-oswald text-lg font-bold uppercase text-black">{p.name}</h4>
                            {p.description && (
                              <p className="text-xs text-median-taupe/80 font-mono mt-1">{p.description}</p>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={async () => {
                                await portalApi.togglePartner(p.id, !p.is_active);
                                await refreshData();
                              }}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                                p.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {p.is_active ? 'Active' : 'Paused'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingPartner(editingPartner?.id === p.id ? null : p)}
                              className="px-2.5 py-1 rounded border border-black text-black hover:bg-black hover:text-white text-[10px] font-bold uppercase transition-colors"
                            >
                              {editingPartner?.id === p.id ? 'Cancel' : 'Edit'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePartner(p.id, p.name)}
                              className="px-2.5 py-1 rounded border border-red-300 text-red-700 hover:bg-red-600 hover:text-white hover:border-red-600 text-[10px] font-bold uppercase transition-colors"
                            >
                              Delete
                            </button>
                            {p.website_url && (
                              <a
                                href={p.website_url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 rounded-lg border border-median-taupe/30 text-xs font-mono uppercase hover:border-black transition-colors"
                              >
                                Visit ↗
                              </a>
                            )}
                          </div>
                        </div>

                        {editingPartner?.id === p.id && (
                          <form
                            onSubmit={handleSavePartnerEdit}
                            className="pt-3 border-t border-median-taupe/15 space-y-3 text-xs"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-mono uppercase font-bold text-median-taupe mb-1">
                                  Partner Name
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={editingPartner.name}
                                  onChange={(e) => setEditingPartner({ ...editingPartner, name: e.target.value })}
                                  className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-mono uppercase font-bold text-median-taupe mb-1">
                                  Category
                                </label>
                                <select
                                  value={editingPartner.category}
                                  onChange={(e) => setEditingPartner({ ...editingPartner, category: e.target.value })}
                                  className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                                >
                                  <option>Cloud Infrastructure</option>
                                  <option>Design Systems & UI/UX</option>
                                  <option>Enterprise Architecture</option>
                                  <option>E-Commerce & Retail</option>
                                  <option>Healthcare & Clinical</option>
                                  <option>Fintech & Security</option>
                                  <option>AI & Machine Learning</option>
                                  <option>Academic & Research</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-mono uppercase font-bold text-median-taupe mb-1">
                                  Website URL
                                </label>
                                <input
                                  type="url"
                                  value={editingPartner.website_url || ''}
                                  onChange={(e) => setEditingPartner({ ...editingPartner, website_url: e.target.value })}
                                  placeholder="https://..."
                                  className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-mono uppercase font-bold text-median-taupe mb-1">
                                  Logo URL or Asset Path
                                </label>
                                <input
                                  type="text"
                                  value={editingPartner.logo_url || ''}
                                  onChange={(e) => setEditingPartner({ ...editingPartner, logo_url: e.target.value })}
                                  placeholder="/assets/partner-1.png"
                                  className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-mono uppercase font-bold text-median-taupe mb-1">
                                Collaboration Scope / Description
                              </label>
                              <textarea
                                rows={2}
                                value={editingPartner.description || ''}
                                onChange={(e) => setEditingPartner({ ...editingPartner, description: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                              />
                            </div>

                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingPartner(null)}
                                className="px-3 py-1.5 rounded-lg border border-median-taupe/30 text-median-taupe hover:text-black font-mono uppercase text-xs"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-4 py-1.5 rounded-lg bg-black text-white font-bold uppercase hover:bg-median-taupe transition-colors font-mono text-xs"
                              >
                                Save Partner Changes
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    ))}
                </div>
              )}

              <AdminPagination
                currentPage={partPage}
                totalItems={partners.length}
                pageSize={PAGE_SIZE}
                onPageChange={setPartPage}
              />
            </div>
          </div>
        )}

        {/* ================= TAB 4: PROJECTS & PROGRESS SLIDERS ================= */}
        {activeTab === 'projects' && (
          <div className="space-y-8">
            {/* Create Project Accordion / Form */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-median-taupe/20 shadow-sm">
              <h3 className="font-oswald text-xl font-bold uppercase text-black mb-1">Commission New Project</h3>
              <p className="text-xs text-median-taupe/80 mb-6">
                Assign an engineering project to a registered customer. Live status updates will reflect immediately in their VIP lounge.
              </p>

              <form onSubmit={handleAddProject} className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold uppercase text-black mb-1">Select Customer *</label>
                    <select
                      required
                      value={projClientId}
                      onChange={(e) => setProjClientId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                    >
                      <option value="">-- Choose Client --</option>
                      {users
                        .filter((u) => u.role === 'client')
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.company_name} ({c.full_name})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-black mb-1">Project Title *</label>
                    <input
                      type="text"
                      required
                      value={projTitle}
                      onChange={(e) => setProjTitle(e.target.value)}
                      placeholder="e.g. Sub-Second Forex Settlement Engine"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-black mb-1">Project Code</label>
                    <input
                      type="text"
                      value={projCode}
                      onChange={(e) => setProjCode(e.target.value)}
                      placeholder="PRJ-FX-01"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold uppercase text-black mb-1">Category</label>
                    <select
                      value={projCategory}
                      onChange={(e) => setProjCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                    >
                      <option>Custom Software Engineering</option>
                      <option>AI, Data, & Machine Learning</option>
                      <option>Cloud Infrastructure & DevOps</option>
                      <option>Cybersecurity & Risk Management</option>
                      <option>Fintech & Gaming API</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-black mb-1">Target Launch Date</label>
                    <input
                      type="date"
                      value={projTargetDate}
                      onChange={(e) => setProjTargetDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase text-black mb-1">Summary & Technical Scope</label>
                  <textarea
                    rows={2}
                    value={projSummary}
                    onChange={(e) => setProjSummary(e.target.value)}
                    placeholder="Brief description of requirements and deliverables..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                  />
                </div>

                <button
                  type="submit"
                  className="py-3 px-6 rounded-xl bg-black text-white font-oswald text-xs uppercase tracking-widest hover:bg-median-taupe transition-colors"
                >
                  Commission Project Now →
                </button>
              </form>
            </div>

            {/* Projects Management List with Live Velocity Adjusters */}
            <div className="space-y-4">
              <h3 className="font-oswald text-xl font-bold uppercase text-black">
                Active Projects & Progress Velocity ({projects.length})
              </h3>

              {isSyncing ? (
                <AdminSkeletonList count={2} />
              ) : (
                <div className="space-y-4">
                  {projects
                    .slice((projPage - 1) * PAGE_SIZE, projPage * PAGE_SIZE)
                    .map((proj) => (
                <div
                  key={proj.id}
                  className="p-6 rounded-2xl bg-white border border-median-taupe/20 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] font-bold uppercase text-median-taupe">
                          {proj.code_name}
                        </span>
                        <span className="text-median-taupe/40 font-mono text-xs">·</span>
                        <span className="text-xs font-mono font-semibold text-black">
                          Client: {proj.client_name}
                        </span>
                      </div>
                      <h4 className="font-oswald text-2xl font-bold uppercase text-black">
                        {proj.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                          proj.status === 'deployed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {proj.status.replace('_', ' ')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingProject(editingProject?.id === proj.id ? null : proj)}
                        className="px-3 py-1 rounded-full border border-black text-black hover:bg-black hover:text-white text-[10px] font-bold uppercase transition-colors"
                      >
                        {editingProject?.id === proj.id ? 'Cancel' : 'Edit'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(proj.id, proj.title)}
                        className="px-3 py-1 rounded-full border border-red-300 text-red-700 hover:bg-red-600 hover:text-white hover:border-red-600 text-[10px] font-bold uppercase transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Inline Project Editor */}
                  {editingProject?.id === proj.id && (
                    <form
                      onSubmit={handleSaveProjectEdit}
                      className="p-5 rounded-xl bg-median-taupe/5 border border-median-taupe/20 space-y-3 text-xs font-mono"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-median-taupe mb-1">
                            Project Title
                          </label>
                          <input
                            type="text"
                            required
                            value={editingProject.title}
                            onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-median-taupe mb-1">
                            Code Name
                          </label>
                          <input
                            type="text"
                            value={editingProject.code_name || ''}
                            onChange={(e) => setEditingProject({ ...editingProject, code_name: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-median-taupe mb-1">
                            Category
                          </label>
                          <input
                            type="text"
                            value={editingProject.category}
                            onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-median-taupe mb-1">
                            Target Launch Date
                          </label>
                          <input
                            type="date"
                            value={editingProject.target_launch_date || ''}
                            onChange={(e) =>
                              setEditingProject({ ...editingProject, target_launch_date: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-median-taupe mb-1">
                            Progress Percentage (0–100)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editingProject.progress_percentage}
                            onChange={(e) =>
                              setEditingProject({
                                ...editingProject,
                                progress_percentage: Number(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-median-taupe mb-1">
                          Executive Summary / Scope
                        </label>
                        <textarea
                          rows={2}
                          value={editingProject.summary || ''}
                          onChange={(e) => setEditingProject({ ...editingProject, summary: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-median-taupe mb-1">
                          Staging / Demo URL
                        </label>
                        <input
                          type="url"
                          value={editingProject.staging_url || ''}
                          onChange={(e) => setEditingProject({ ...editingProject, staging_url: e.target.value })}
                          placeholder="https://staging.monolith.lk/..."
                          className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingProject(null)}
                          className="px-3 py-1.5 rounded-lg border border-median-taupe/30 text-median-taupe hover:text-black font-mono uppercase text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-lg bg-black text-white font-bold uppercase hover:bg-median-taupe transition-colors font-mono text-xs"
                        >
                          Save Project Changes
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Progress Controls */}
                  <div className="p-4 rounded-xl bg-median-taupe/5 border border-median-taupe/15">
                    <div className="flex justify-between items-center text-xs font-mono mb-2">
                      <span className="text-black font-semibold">Delivery Progress: {proj.progress_percentage}%</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateProgress(proj.id, -5)}
                          className="w-7 h-7 rounded border border-median-taupe/30 hover:border-black font-bold flex items-center justify-center bg-white"
                        >
                          -5%
                        </button>
                        <button
                          onClick={() => handleUpdateProgress(proj.id, 5)}
                          className="w-7 h-7 rounded border border-median-taupe/30 hover:border-black font-bold flex items-center justify-center bg-white"
                        >
                          +5%
                        </button>
                        <button
                          onClick={() => handleUpdateProgress(proj.id, 100 - proj.progress_percentage)}
                          className="px-2 h-7 rounded bg-black text-white hover:bg-median-taupe text-[10px] font-bold"
                        >
                          Mark 100% Deployed
                        </button>
                      </div>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-median-taupe/20 overflow-hidden mb-3">
                      <div
                        className="h-full bg-median-taupe transition-all duration-300"
                        style={{ width: `${proj.progress_percentage}%` }}
                      />
                    </div>

                    {/* Status Selector & Milestones Toggle */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-median-taupe/15">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-black uppercase">Stage:</span>
                        <select
                          value={proj.status}
                          onChange={async (e) => {
                            await portalApi.updateProject(proj.id, {
                              status: e.target.value as PortalProject['status'],
                            });
                            await refreshData();
                            showAlert(`Updated ${proj.code_name} stage to ${e.target.value.replace('_', ' ').toUpperCase()}.`);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-median-taupe/30 bg-white text-xs text-black uppercase font-semibold"
                        >
                          <option value="discovery">Discovery</option>
                          <option value="architecture">Architecture</option>
                          <option value="in_progress">In Progress</option>
                          <option value="qa_testing">QA Testing</option>
                          <option value="deployed">Deployed</option>
                          <option value="maintenance">Maintenance</option>
                        </select>
                      </div>

                      {proj.milestones && proj.milestones.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {proj.milestones.map((ms) => (
                            <button
                              key={ms.id}
                              type="button"
                              onClick={async () => {
                                const updatedMilestones = proj.milestones.map((item) =>
                                  item.id === ms.id ? { ...item, is_completed: !item.is_completed } : item
                                );
                                await portalApi.toggleMilestone(proj.id, ms.id, !ms.is_completed, updatedMilestones);
                                await refreshData();
                              }}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors ${
                                ms.is_completed
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                  : 'bg-white border-median-taupe/30 text-median-taupe hover:border-black hover:text-black'
                              }`}
                            >
                              {ms.is_completed ? '✓ ' : '○ '}
                              {ms.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
                </div>
              )}

              <AdminPagination
                currentPage={projPage}
                totalItems={projects.length}
                pageSize={PAGE_SIZE}
                onPageChange={setProjPage}
              />
            </div>
          </div>
        )}

        {/* ================= TAB 5: BILLING & INVOICES CREATOR ================= */}
        {activeTab === 'billing' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Create Quotation / Invoice Form */}
            <div className="lg:col-span-6 p-6 sm:p-8 rounded-2xl bg-white border border-median-taupe/20 shadow-sm">
              <h3 className="font-oswald text-xl font-bold uppercase text-black mb-1">
                Create Quotation / Invoice
              </h3>
              <p className="text-xs text-median-taupe/80 mb-6">
                Issue a formal quotation or payment invoice. Auto-dispatches to client portal.
              </p>

              <form onSubmit={handleCreateBilling} className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold uppercase text-black mb-1">Document Type</label>
                    <select
                      value={billType}
                      onChange={(e) => setBillType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
                    >
                      <option value="invoice">Invoice (Payment Request)</option>
                      <option value="quotation">Formal Quotation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-black mb-1">Select Client *</label>
                    <select
                      required
                      value={billClientId}
                      onChange={(e) => setBillClientId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
                    >
                      <option value="">-- Choose Client --</option>
                      {users
                        .filter((u) => u.role === 'client')
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.company_name} ({c.full_name})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold uppercase text-black mb-1">Project Reference</label>
                    <input
                      type="text"
                      value={billProjectTitle}
                      onChange={(e) => setBillProjectTitle(e.target.value)}
                      placeholder="e.g. Phase 02 Redis Mutex Pipeline"
                      className="w-full px-3 py-2 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-black mb-1">Payment Due Date</label>
                    <input
                      type="date"
                      value={billDueDate}
                      onChange={(e) => setBillDueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
                    />
                  </div>
                </div>

                {/* Line Items Dynamic Builder */}
                <div className="pt-2 border-t border-median-taupe/15">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold uppercase text-black">Itemized Deliverables</span>
                    <button
                      type="button"
                      onClick={addLineItem}
                      className="text-[10px] text-median-taupe hover:text-black font-bold uppercase underline"
                    >
                      + Add Item Row
                    </button>
                  </div>

                  <div className="space-y-2">
                    {lineItems.map((item) => (
                      <div key={item.id} className="flex gap-2 items-center">
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                          placeholder="Deliverable item description..."
                          className="flex-1 px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-xs text-black"
                        />
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, 'quantity', Number(e.target.value))}
                          className="w-14 px-2 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-xs text-center text-black"
                        />
                        <input
                          type="number"
                          step="100"
                          value={item.unit_price}
                          onChange={(e) => updateLineItem(item.id, 'unit_price', Number(e.target.value))}
                          className="w-24 px-2 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-xs text-right text-black"
                        />
                        <button
                          type="button"
                          onClick={() => removeLineItem(item.id)}
                          className="text-red-500 hover:text-red-700 px-1 font-bold text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-3 rounded-lg bg-median-taupe/5 flex justify-between font-bold text-sm text-black">
                    <span>Total Calculation:</span>
                    <span className="font-oswald text-base text-median-taupe">
                      LKR {lineItems.reduce((acc, i) => acc + i.total, 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase text-black mb-1">Terms & Banking Notes</label>
                  <textarea
                    rows={2}
                    value={billNotes}
                    onChange={(e) => setBillNotes(e.target.value)}
                    placeholder="Wire instructions, Net-30 clauses..."
                    className="w-full px-3 py-2 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-black text-white font-oswald text-xs uppercase tracking-widest hover:bg-median-taupe transition-colors"
                  >
                    Generate & Send →
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCreateAndDownload('pdf')}
                    className="w-full py-3 rounded-xl border border-black text-black hover:bg-black hover:text-white font-oswald text-xs uppercase tracking-widest transition-colors"
                  >
                    Generate & Save PDF ↓
                  </button>
                </div>
              </form>

              {/* Quick Download Banner for Newly Generated Voucher */}
              {lastCreatedDoc && (
                <div className="mt-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-900 uppercase">
                      ✓ Ready: {lastCreatedDoc.document_number} ({lastCreatedDoc.type})
                    </span>
                    <button
                      type="button"
                      onClick={() => setLastCreatedDoc(null)}
                      className="text-emerald-700 hover:text-black font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedBillingDoc(lastCreatedDoc)}
                      className="px-3 py-1.5 rounded-lg border border-emerald-700 text-emerald-900 hover:bg-emerald-100 text-[11px] font-semibold uppercase"
                    >
                      Preview Voucher
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadBillingVoucherHtml(lastCreatedDoc)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-emerald-700 text-emerald-900 hover:bg-emerald-700 hover:text-white text-[11px] font-semibold uppercase transition-colors"
                    >
                      ↓ Download (.html)
                    </button>
                    <button
                      type="button"
                      onClick={() => printBillingVoucherPdf(lastCreatedDoc)}
                      className="px-3 py-1.5 rounded-lg bg-black text-white hover:bg-median-taupe text-[11px] font-semibold uppercase transition-colors"
                    >
                      Print / Save PDF ↗
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Issued Invoices & Status Adjusters */}
            <div className="lg:col-span-6 space-y-4">
              <h3 className="font-oswald text-xl font-bold uppercase text-black">
                Billing Registry ({billingDocs.length})
              </h3>

              {isSyncing ? (
                <AdminSkeletonList count={3} />
              ) : (
                <div className="space-y-3">
                  {billingDocs
                    .slice((billPage - 1) * PAGE_SIZE, billPage * PAGE_SIZE)
                    .map((rawDoc) => {
                  const doc = enrichBillingDoc(rawDoc);
                  return (
                  <div
                    key={doc.id}
                    className="p-5 rounded-2xl bg-white border border-median-taupe/20 shadow-sm flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe font-bold block">
                          {doc.type.toUpperCase()} · {doc.document_number}
                        </span>
                        <h4 className="font-oswald text-lg font-bold uppercase text-black">
                          {doc.client_name}
                          {doc.client_contact_name && doc.client_contact_name !== doc.client_name && (
                            <span className="text-sm font-normal text-median-taupe normal-case ml-2">
                              ({doc.client_contact_name})
                            </span>
                          )}
                        </h4>
                        <span className="text-xs font-mono text-median-taupe/80">
                          Total: <strong className="text-black font-semibold">{doc.currency || 'LKR'} {doc.total.toLocaleString()}</strong>
                        </span>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                          doc.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>

                    {/* Status Toggle, Download & Delete Buttons */}
                    <div className="pt-3 border-t border-median-taupe/15 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            await portalApi.updateBillingStatus(doc.id, 'paid');
                            await refreshData();
                            showAlert(`Marked ${doc.document_number} as PAID.`);
                          }}
                          className="px-3 py-1 rounded bg-emerald-600 text-white text-[10px] font-mono font-bold hover:bg-emerald-700 transition-colors"
                        >
                          Mark Paid ✓
                        </button>
                        <button
                          onClick={async () => {
                            await portalApi.updateBillingStatus(doc.id, 'approved');
                            await refreshData();
                            showAlert(`Marked ${doc.document_number} as APPROVED.`);
                          }}
                          className="px-3 py-1 rounded bg-blue-600 text-white text-[10px] font-mono font-bold hover:bg-blue-700 transition-colors"
                        >
                          Mark Approved
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedBillingDoc(doc)}
                          title="Preview Full Voucher"
                          className="px-2.5 py-1 rounded border border-median-taupe/40 text-median-taupe hover:border-black hover:text-black text-[10px] font-semibold uppercase transition-colors"
                        >
                          Preview
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadBillingVoucherHtml(doc)}
                          title="Download Voucher File (.html)"
                          className="px-2.5 py-1 rounded border border-median-taupe/40 text-black hover:border-black text-[10px] font-semibold uppercase transition-colors"
                        >
                          ↓ Download
                        </button>
                        <button
                          type="button"
                          onClick={() => printBillingVoucherPdf(doc)}
                          title="Print / Save as PDF"
                          className="px-2.5 py-1 rounded border border-black bg-black text-white hover:bg-median-taupe hover:border-median-taupe text-[10px] font-semibold uppercase transition-colors"
                        >
                          Save PDF ↗
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!window.confirm(`Delete ${doc.type} ${doc.document_number}? This action cannot be undone.`)) return;
                            try {
                              await portalApi.deleteBillingDocument(doc.id);
                              if (lastCreatedDoc?.id === doc.id) setLastCreatedDoc(null);
                              if (selectedBillingDoc?.id === doc.id) setSelectedBillingDoc(null);
                              await refreshData();
                              showAlert(`Deleted ${doc.document_number}.`);
                            } catch (err: any) {
                              showAlert(`✕ Error deleting document: ${err.message}`);
                            }
                          }}
                          title="Delete Invoice / Quotation"
                          className="px-2.5 py-1 rounded border border-red-300 text-red-700 hover:bg-red-600 hover:text-white hover:border-red-600 text-[10px] font-semibold uppercase transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })}
                </div>
              )}

              <AdminPagination
                currentPage={billPage}
                totalItems={billingDocs.length}
                pageSize={PAGE_SIZE}
                onPageChange={setBillPage}
              />
            </div>
          </div>
        )}

        {/* ================= TAB 6: CUSTOMER REVIEWS ================= */}
        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Add Review Form */}
            <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-white border border-median-taupe/20 shadow-sm">
              <h3 className="font-oswald text-xl font-bold uppercase text-black mb-1">Add Customer Review</h3>
              <p className="text-xs text-median-taupe/80 mb-6">
                Publish client testimonials to display on the public website.
              </p>

              <form onSubmit={handleAddReview} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block font-bold uppercase text-black mb-1">Client Full Name *</label>
                  <input
                    type="text"
                    required
                    value={revName}
                    onChange={(e) => setRevName(e.target.value)}
                    placeholder="e.g. Marcus Vance"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold uppercase text-black mb-1">Client Title</label>
                    <input
                      type="text"
                      value={revTitle}
                      onChange={(e) => setRevTitle(e.target.value)}
                      placeholder="VP of Engineering"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-black mb-1">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={revCompany}
                      onChange={(e) => setRevCompany(e.target.value)}
                      placeholder="ShadowTopup Global"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase text-black mb-1">Rating (1 to 5 Stars)</label>
                  <select
                    value={revRating}
                    onChange={(e) => setRevRating(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
                  >
                    <option value={5}>★★★★★ (5 Stars)</option>
                    <option value={4}>★★★★☆ (4 Stars)</option>
                    <option value={3}>★★★☆☆ (3 Stars)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-black mb-1">Testimonial Quote *</label>
                  <textarea
                    required
                    rows={4}
                    value={revText}
                    onChange={(e) => setRevText(e.target.value)}
                    placeholder="Describe their experience with Monolith LK architectures..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-black text-white font-oswald text-xs uppercase tracking-widest hover:bg-median-taupe transition-colors"
                >
                  Publish Testimonial →
                </button>
              </form>
            </div>

            {/* Existing Reviews */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-oswald text-xl font-bold uppercase text-black">
                Customer Testimonials ({reviews.length})
              </h3>

              {isSyncing ? (
                <AdminSkeletonList count={3} />
              ) : (
                <div className="space-y-3">
                  {reviews
                    .slice((revPage - 1) * PAGE_SIZE, revPage * PAGE_SIZE)
                    .map((r) => (
                      <div
                        key={r.id}
                        className="p-5 rounded-2xl bg-white border border-median-taupe/20 shadow-sm space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                          <div>
                            <h4 className="font-oswald text-lg font-bold uppercase text-black">{r.client_name}</h4>
                            <span className="text-xs font-mono text-median-taupe/80">
                              {r.client_title} · <strong>{r.company_name}</strong>
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-amber-500 text-sm">{'★'.repeat(r.rating)}</span>
                            <button
                              type="button"
                              onClick={async () => {
                                await portalApi.toggleReviewFeatured(r.id, !r.is_featured);
                                await refreshData();
                              }}
                              className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase ${
                                r.is_featured ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {r.is_featured ? 'Featured on Site' : 'Hidden'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingReview(editingReview?.id === r.id ? null : r)}
                              className="px-2.5 py-1 rounded border border-black text-black hover:bg-black hover:text-white text-[10px] font-bold uppercase transition-colors"
                            >
                              {editingReview?.id === r.id ? 'Cancel' : 'Edit'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteReview(r.id, r.client_name)}
                              className="px-2.5 py-1 rounded border border-red-300 text-red-700 hover:bg-red-600 hover:text-white hover:border-red-600 text-[10px] font-bold uppercase transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        <p className="text-xs font-mono text-black/80 italic bg-median-taupe/5 p-3 rounded-xl border border-median-taupe/15">
                          "{r.review_text}"
                        </p>

                        {editingReview?.id === r.id && (
                          <form
                            onSubmit={handleSaveReviewEdit}
                            className="pt-3 border-t border-median-taupe/15 space-y-3 text-xs"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div>
                                <label className="block text-[10px] font-mono uppercase font-bold text-median-taupe mb-1">
                                  Client Name
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={editingReview.client_name}
                                  onChange={(e) => setEditingReview({ ...editingReview, client_name: e.target.value })}
                                  className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-mono uppercase font-bold text-median-taupe mb-1">
                                  Title / Role
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={editingReview.client_title}
                                  onChange={(e) => setEditingReview({ ...editingReview, client_title: e.target.value })}
                                  className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-mono uppercase font-bold text-median-taupe mb-1">
                                  Company Name
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={editingReview.company_name}
                                  onChange={(e) => setEditingReview({ ...editingReview, company_name: e.target.value })}
                                  className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-mono uppercase font-bold text-median-taupe mb-1">
                                  Rating
                                </label>
                                <select
                                  value={editingReview.rating}
                                  onChange={(e) => setEditingReview({ ...editingReview, rating: Number(e.target.value) })}
                                  className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                                >
                                  <option value={5}>★★★★★ (5 Stars)</option>
                                  <option value={4}>★★★★☆ (4 Stars)</option>
                                  <option value={3}>★★★☆☆ (3 Stars)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-mono uppercase font-bold text-median-taupe mb-1">
                                  Featured on Public Site
                                </label>
                                <select
                                  value={editingReview.is_featured ? 'true' : 'false'}
                                  onChange={(e) => setEditingReview({ ...editingReview, is_featured: e.target.value === 'true' })}
                                  className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                                >
                                  <option value="true">Yes — Featured on Public Site</option>
                                  <option value="false">No — Hidden from Public Site</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-mono uppercase font-bold text-median-taupe mb-1">
                                Testimonial Text
                              </label>
                              <textarea
                                rows={3}
                                required
                                value={editingReview.review_text}
                                onChange={(e) => setEditingReview({ ...editingReview, review_text: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                              />
                            </div>

                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingReview(null)}
                                className="px-3 py-1.5 rounded-lg border border-median-taupe/30 text-median-taupe hover:text-black font-mono uppercase text-xs"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-4 py-1.5 rounded-lg bg-black text-white font-bold uppercase hover:bg-median-taupe transition-colors font-mono text-xs"
                              >
                                Save Review Changes
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    ))}
                </div>
              )}

              <AdminPagination
                currentPage={revPage}
                totalItems={reviews.length}
                pageSize={PAGE_SIZE}
                onPageChange={setRevPage}
              />
            </div>
          </div>
        )}

        {/* ================= TAB 7: EDITORIAL / NEWS CMS ================= */}
        {activeTab === 'blog' && (
          <div className="space-y-8">
            {/* Create Article Form */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-median-taupe/20 shadow-sm">
              <h3 className="font-oswald text-xl font-bold uppercase text-black mb-1">
                Publish Editorial Article / Latest News
              </h3>
              <p className="text-xs text-median-taupe/80 mb-6">
                Published articles will appear immediately in the "Latest News" section on the Homepage and `/blog`.
              </p>

              <form onSubmit={handleAddPost} className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block font-bold uppercase text-black mb-1">Article Headline *</label>
                    <input
                      type="text"
                      required
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      placeholder="e.g. Distributed Redis Mutex & Zero-Loss Ledger Locks at Scale"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-black mb-1">Category</label>
                    <input
                      type="text"
                      value={postCategory}
                      onChange={(e) => setPostCategory(e.target.value)}
                      placeholder="Architecture, Design Strategy, AI..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold uppercase text-black mb-1">Author Name</label>
                    <input
                      type="text"
                      value={postAuthor}
                      onChange={(e) => setPostAuthor(e.target.value)}
                      placeholder="Dulanja Abeysinghe"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-black mb-1">Estimated Read Time</label>
                    <input
                      type="text"
                      value={postReadTime}
                      onChange={(e) => setPostReadTime(e.target.value)}
                      placeholder="5 min read"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase text-black mb-1">Cover Image URL</label>
                    <input
                      type="url"
                      value={postCover}
                      onChange={(e) => setPostCover(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase text-black mb-1">Excerpt / Brief Summary *</label>
                  <textarea
                    required
                    rows={2}
                    value={postExcerpt}
                    onChange={(e) => setPostExcerpt(e.target.value)}
                    placeholder="Short teaser shown on homepage cards..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-black mb-1">Full Article Markdown Content *</label>
                  <textarea
                    required
                    rows={6}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Write the full technical article in Markdown format..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
                  />
                </div>

                <button
                  type="submit"
                  className="py-3 px-6 rounded-xl bg-black text-white font-oswald text-xs uppercase tracking-widest hover:bg-median-taupe transition-colors"
                >
                  Publish Article to Live Site →
                </button>
              </form>
            </div>

            {/* Published Articles List */}
            <div className="space-y-4">
              <h3 className="font-oswald text-xl font-bold uppercase text-black">
                Published Editorial Articles ({blogPosts.length})
              </h3>

              {isSyncing ? (
                <AdminSkeletonList count={2} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {blogPosts
                    .slice((blogPage - 1) * PAGE_SIZE, blogPage * PAGE_SIZE)
                    .map((post) => (
                      <div
                        key={post.id}
                        className="p-5 rounded-2xl bg-white border border-median-taupe/20 shadow-sm flex flex-col justify-between space-y-4"
                      >
                        <div>
                          <div className="flex justify-between items-center text-[10px] font-mono uppercase text-median-taupe mb-1">
                            <span>{post.category}</span>
                            <span>{post.read_time}</span>
                          </div>
                          <h4 className="font-oswald text-lg font-bold uppercase text-black mb-2">
                            {post.title}
                          </h4>
                          <p className="text-xs text-median-taupe/80 font-mono line-clamp-2 mb-4">
                            {post.excerpt}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-median-taupe/15 flex flex-wrap justify-between items-center gap-2 text-xs font-mono">
                          <span className="text-median-taupe/70">By {post.author}</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingPost(editingPost?.id === post.id ? null : post)}
                              className="px-2.5 py-1 rounded border border-black text-black hover:bg-black hover:text-white text-[10px] font-bold uppercase transition-colors"
                            >
                              {editingPost?.id === post.id ? 'Cancel' : 'Edit'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePost(post.id, post.title)}
                              className="px-2.5 py-1 rounded border border-red-300 text-red-700 hover:bg-red-600 hover:text-white hover:border-red-600 text-[10px] font-bold uppercase transition-colors"
                            >
                              Delete
                            </button>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                              Published
                            </span>
                          </div>
                        </div>

                        {editingPost?.id === post.id && (
                          <form
                            onSubmit={handleSavePostEdit}
                            className="pt-3 border-t border-median-taupe/15 space-y-3 text-xs"
                          >
                            <div>
                              <label className="block text-[10px] font-mono uppercase font-bold text-median-taupe mb-1">
                                Article Title
                              </label>
                              <input
                                type="text"
                                required
                                value={editingPost.title}
                                onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div>
                                <label className="block text-[10px] font-mono uppercase font-bold text-median-taupe mb-1">
                                  Category
                                </label>
                                <input
                                  type="text"
                                  value={editingPost.category}
                                  onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                                  className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-mono uppercase font-bold text-median-taupe mb-1">
                                  Author
                                </label>
                                <input
                                  type="text"
                                  value={editingPost.author}
                                  onChange={(e) => setEditingPost({ ...editingPost, author: e.target.value })}
                                  className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-mono uppercase font-bold text-median-taupe mb-1">
                                  Read Time
                                </label>
                                <input
                                  type="text"
                                  value={editingPost.read_time}
                                  onChange={(e) => setEditingPost({ ...editingPost, read_time: e.target.value })}
                                  className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-mono uppercase font-bold text-median-taupe mb-1">
                                Excerpt
                              </label>
                              <textarea
                                rows={2}
                                required
                                value={editingPost.excerpt}
                                onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-mono uppercase font-bold text-median-taupe mb-1">
                                Content (Markdown)
                              </label>
                              <textarea
                                rows={4}
                                required
                                value={editingPost.content}
                                onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                              />
                            </div>

                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingPost(null)}
                                className="px-3 py-1.5 rounded-lg border border-median-taupe/30 text-median-taupe hover:text-black font-mono uppercase text-xs"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-4 py-1.5 rounded-lg bg-black text-white font-bold uppercase hover:bg-median-taupe transition-colors font-mono text-xs"
                              >
                                Save Article Changes
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    ))}
                </div>
              )}

              <AdminPagination
                currentPage={blogPage}
                totalItems={blogPosts.length}
                pageSize={PAGE_SIZE}
                onPageChange={setBlogPage}
              />
            </div>
          </div>
        )}

        {/* ================= TAB 8: INQUIRIES & MEETINGS ================= */}
        {activeTab === 'requests' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Incoming Project Inquiries */}
            <div className="lg:col-span-6 space-y-4">
              <h3 className="font-oswald text-xl font-bold uppercase text-black">
                Project Commission Requests ({requests.length})
              </h3>

              {requests.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white border border-median-taupe/20 text-center text-xs font-mono text-median-taupe">
                  No pending commission requests.
                </div>
              ) : (
                requests.map((r) => (
                  <div
                    key={r.id}
                    className="p-5 rounded-2xl bg-white border border-median-taupe/20 shadow-sm space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-median-taupe font-bold block">
                          Client: {r.client_name}
                        </span>
                        <h4 className="font-oswald text-lg font-bold uppercase text-black">{r.project_title}</h4>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-mono font-bold uppercase">
                        {r.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-xs font-mono text-median-taupe/80">
                      Category: {r.service_category} · Budget: {r.estimated_budget} · Target: {r.target_timeline}
                    </div>

                    <p className="text-xs font-mono text-black/80 bg-median-taupe/5 p-3 rounded-lg border border-median-taupe/15">
                      {r.project_scope}
                    </p>

                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={async () => {
                          await portalApi.updateProjectRequestStatus(r.id, 'approved');
                          await refreshData();
                          showAlert(`Approved inquiry for ${r.project_title}.`);
                        }}
                        className="px-3 py-1 rounded bg-black text-white text-[10px] font-mono uppercase font-bold hover:bg-median-taupe transition-colors"
                      >
                        Approve Scope ✓
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Scheduled Consultation Sessions */}
            <div className="lg:col-span-6 space-y-4">
              <h3 className="font-oswald text-xl font-bold uppercase text-black">
                Requested Consultation Meetings ({meetings.length})
              </h3>

              {meetings.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white border border-median-taupe/20 text-center text-xs font-mono text-median-taupe">
                  No pending consultation bookings.
                </div>
              ) : (
                meetings.map((m) => (
                  <div
                    key={m.id}
                    className="p-5 rounded-2xl bg-white border border-median-taupe/20 shadow-sm space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-median-taupe font-bold block">
                          {m.meeting_type} · Client: {m.client_name}
                        </span>
                        <h4 className="font-oswald text-lg font-bold uppercase text-black">
                          {m.requested_date} @ {m.requested_time}
                        </h4>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          m.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>

                    <p className="text-xs font-mono text-black/80 bg-median-taupe/5 p-3 rounded-lg border border-median-taupe/15">
                      {m.agenda}
                    </p>

                    {m.status === 'pending' && (
                      <div className="pt-2">
                        <button
                          onClick={async () => {
                            await portalApi.updateMeetingStatus(
                              m.id,
                              'confirmed',
                              'https://meet.google.com/monolith-architecture-session'
                            );
                            await refreshData();
                            showAlert('Meeting confirmed and Google Meet room assigned.');
                          }}
                          className="px-3 py-1 rounded bg-black text-white text-[10px] font-mono uppercase font-bold hover:bg-median-taupe transition-colors"
                        >
                          Confirm & Assign Google Meet Room
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Public Contact Form Submissions */}
              <div className="pt-6 space-y-4">
                <h3 className="font-oswald text-xl font-bold uppercase text-black">
                  Public Contact Briefs ({inquiries.length})
                </h3>
                {isSyncing ? (
                  <AdminSkeletonList count={2} />
                ) : inquiries.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-white border border-median-taupe/20 text-center text-xs text-median-taupe">
                    No public contact inquiries submitted yet.
                  </div>
                ) : (
                  inquiries
                    .slice((reqPage - 1) * PAGE_SIZE, reqPage * PAGE_SIZE)
                    .map((inq) => (
                      <div
                        key={inq.id}
                        className="p-5 rounded-2xl bg-white border border-median-taupe/20 shadow-sm space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] uppercase text-median-taupe font-bold block">
                              {inq.service_need} · {inq.budget_tier || 'Budget Open'}
                            </span>
                            <h4 className="font-oswald text-lg font-bold uppercase text-black">
                              {inq.name} {inq.company && `(${inq.company})`}
                            </h4>
                            <span className="text-xs text-median-taupe">{inq.email}</span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-median-taupe/10 text-median-taupe text-[10px] font-bold uppercase">
                            {inq.status}
                          </span>
                        </div>
                        <p className="text-xs text-black/80 bg-median-taupe/5 p-3 rounded-lg border border-median-taupe/15">
                          {inq.brief}
                        </p>
                        {inq.status === 'new' && (
                          <button
                            onClick={async () => {
                              await portalApi.updateInquiryStatus(inq.id, 'contacted');
                              await refreshData();
                              showAlert(`Marked inquiry from ${inq.name} as CONTACTED.`);
                            }}
                            className="px-3 py-1 rounded bg-black text-white text-[10px] uppercase font-bold hover:bg-median-taupe transition-colors"
                          >
                            Mark Contacted ✓
                          </button>
                        )}
                      </div>
                    ))
                )}

                <AdminPagination
                  currentPage={reqPage}
                  totalItems={inquiries.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setReqPage}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Haute Editorial Admin Voucher Preview & Download Modal */}
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
                <span className="text-xs text-median-taupe">
                  Issued to: <strong className="text-black">{selectedBillingDoc.client_name}</strong>
                  {selectedBillingDoc.client_contact_name &&
                    selectedBillingDoc.client_contact_name !== selectedBillingDoc.client_name && (
                      <> · Client: <strong className="text-black">{selectedBillingDoc.client_contact_name}</strong></>
                    )}{' '}
                  · Due: {selectedBillingDoc.due_date}
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
                <table className="w-full min-w-[460px] text-xs">
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
                  className="px-5 py-2.5 rounded-xl border border-median-taupe text-black hover:border-black font-oswald text-xs uppercase tracking-wider transition-colors"
                >
                  ↓ Download Voucher (.html)
                </button>
                <button
                  type="button"
                  onClick={() => printBillingVoucherPdf(selectedBillingDoc)}
                  className="px-5 py-2.5 rounded-xl bg-black text-white font-oswald text-xs uppercase tracking-wider hover:bg-median-taupe transition-colors"
                >
                  Print / Save PDF ↗
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
