import React, { useState, useMemo } from 'react';
import { UserProfile, PortalProject, ProjectPaymentPlan } from '../../../lib/portalStore';
import { portalApi } from '../../../lib/portalApi';
import { AdminPagination, AdminSkeletonList, AdminToolbar } from './AdminUiPrimitives';
import { ScrollReveal } from '../../MedianStudio/ScrollReveal';

interface AdminCustomersViewProps {
  users: UserProfile[];
  projects: PortalProject[];
  paymentPlans: ProjectPaymentPlan[];
  isSyncing: boolean;
  onRefresh: () => Promise<void>;
  showAlert: (msg: string) => void;
}

export const AdminCustomersView: React.FC<AdminCustomersViewProps> = ({
  users,
  projects,
  paymentPlans,
  isSyncing,
  onRefresh,
  showAlert,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  // Create customer form state
  const [company, setCompany] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('MonolithClient2026!');
  const [isCreating, setIsCreating] = useState(false);

  // Inline states
  const [editingCustomer, setEditingCustomer] = useState<UserProfile | null>(null);
  const [securityOpenId, setSecurityOpenId] = useState<string | null>(null);
  const [passwordInputs, setPasswordInputs] = useState<Record<string, string>>({});

  const clients = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users
      .filter((u) => u.role === 'client')
      .filter((c) => {
        if (statusFilter === 'active' && c.is_blocked) return false;
        if (statusFilter === 'blocked' && !c.is_blocked) return false;
        if (!q) return true;
        return (
          (c.company_name || '').toLowerCase().includes(q) ||
          (c.full_name || '').toLowerCase().includes(q) ||
          (c.email || '').toLowerCase().includes(q) ||
          (c.phone || '').toLowerCase().includes(q)
        );
      });
  }, [users, search, statusFilter]);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;
    setIsCreating(true);
    try {
      await portalApi.createClient({
        email,
        password: password || 'MonolithClient2026!',
        full_name: fullName,
        company_name: company || 'Enterprise Client',
        phone,
      });
      setCompany('');
      setFullName('');
      setEmail('');
      setPhone('');
      setShowCreateForm(false);
      await onRefresh();
      showAlert('✓ Customer account registered and synced.');
    } catch (err: any) {
      showAlert(`✕ Error creating customer: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    try {
      await portalApi.updateClient(editingCustomer.id, {
        full_name: editingCustomer.full_name,
        company_name: editingCustomer.company_name,
        phone: editingCustomer.phone,
      });
      setEditingCustomer(null);
      await onRefresh();
      showAlert('✓ Customer profile updated.');
    } catch (err: any) {
      showAlert(`✕ Update failed: ${err.message}`);
    }
  };

  const handleUpdatePassword = async (clientId: string, clientLabel: string) => {
    const newPass = passwordInputs[clientId];
    if (!newPass || newPass.length < 6) {
      showAlert('✕ Password must be at least 6 characters long.');
      return;
    }
    try {
      await portalApi.updateClientPassword(clientId, newPass);
      setPasswordInputs((prev) => ({ ...prev, [clientId]: '' }));
      showAlert(`✓ Passkey updated for ${clientLabel}. Client can log in immediately.`);
    } catch (err: any) {
      showAlert(`✕ Error updating password: ${err.message}`);
    }
  };

  const handleToggleBlock = async (c: UserProfile) => {
    const nextBlocked = !c.is_blocked;
    const label = nextBlocked ? 'block & suspend' : 'unblock';
    if (!window.confirm(`Are you sure you want to ${label} "${c.company_name || c.full_name}"?`)) return;
    try {
      await portalApi.toggleClientBlock(c.id, nextBlocked);
      await onRefresh();
      showAlert(`✓ Client "${c.company_name || c.full_name}" ${nextBlocked ? 'blocked' : 're-activated'}.`);
    } catch (err: any) {
      showAlert(`✕ Error updating status: ${err.message}`);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Permanently delete customer "${name}"? This cannot be undone.`)) return;
    try {
      await portalApi.deleteClient(id);
      if (editingCustomer?.id === id) setEditingCustomer(null);
      await onRefresh();
      showAlert(`✓ Deleted customer "${name}".`);
    } catch (err: any) {
      showAlert(`✕ Error deleting customer: ${err.message}`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Minimalist Top Toolbar */}
      <ScrollReveal variant="fade-up" duration={550} once>
        <AdminToolbar
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder="Search company, name, email..."
          actionLabel="+ Register Customer"
          actionOpen={showCreateForm}
          onActionToggle={() => setShowCreateForm((s) => !s)}
          extraControls={
            <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-median-taupe/20 text-[11px] font-mono">
              {(['all', 'active', 'blocked'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setStatusFilter(st);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg uppercase font-semibold transition-all ${
                    statusFilter === st ? 'bg-black text-white' : 'text-median-taupe hover:text-black'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          }
        />
      </ScrollReveal>

      {/* Collapsible Minimalist Add Customer Form */}
      {showCreateForm && (
        <ScrollReveal variant="card-lift" duration={500} once>
          <form
            onSubmit={handleAddCustomer}
            className="p-5 sm:p-6 rounded-2xl bg-white border border-black/15 shadow-md space-y-4 text-xs font-mono"
          >
            <div>
              <h3 className="font-oswald text-lg font-bold uppercase text-black">Register New Customer</h3>
              <p className="text-[11px] text-median-taupe/80">
                Clients sign in via `/portal/login` using this email and initial passkey.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <div>
                <label className="block font-bold uppercase text-black mb-1">Company / Organization *</label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Menu Pvt Ltd"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block font-bold uppercase text-black mb-1">Primary Contact Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Prasad Sandaruwan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block font-bold uppercase text-black mb-1">Authorized Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@company.lk"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block font-bold uppercase text-black mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+94 76 123 4567"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block font-bold uppercase text-black mb-1">Initial Portal Password *</label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black focus:outline-none focus:border-black"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full py-2.5 px-4 rounded-xl bg-black text-white font-oswald text-xs uppercase tracking-widest hover:bg-median-taupe transition-colors disabled:opacity-50"
                >
                  {isCreating ? 'Registering...' : 'Register Customer →'}
                </button>
              </div>
            </div>
          </form>
        </ScrollReveal>
      )}

      {/* Full-Width Minimalist, Informative Customer Cards */}
      {isSyncing ? (
        <AdminSkeletonList count={4} />
      ) : clients.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white border border-median-taupe/20 text-center text-xs font-mono text-median-taupe">
          No customers match your filter. Click <strong>+ Register Customer</strong> above to add one.
        </div>
      ) : (
        <div className="space-y-3">
          {clients.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((c, idx) => {
            const clientProjects = projects.filter((p) => p.client_id === c.id);
            const clientPlans = paymentPlans.filter((pl) => pl.client_id === c.id);
            const totalPaid = clientPlans.reduce(
              (acc, pl) => acc + (pl.payments || []).reduce((s, r) => s + Number(r.amount || 0), 0),
              0
            );
            const totalDue = clientPlans.reduce((acc, pl) => {
              if (pl.billing_type === 'monthly') return acc;
              const pPaid = (pl.payments || []).reduce((s, r) => s + Number(r.amount || 0), 0);
              return acc + Math.max(0, Number(pl.total_amount || 0) - pPaid);
            }, 0);

            return (
              <ScrollReveal key={c.id} variant="fade-up" delay={idx * 55} duration={550} once>
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-median-taupe/20 hover:border-median-taupe/50 shadow-sm transition-all space-y-3">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    {/* Identity */}
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${c.is_blocked ? 'bg-red-500' : 'bg-emerald-500'}`}
                          title={c.is_blocked ? 'Blocked' : 'Active'}
                        />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe font-bold truncate">
                          {c.company_name || 'Enterprise Client'}
                        </span>
                        {c.is_blocked && (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[9px] font-mono font-bold uppercase">
                            Suspended
                          </span>
                        )}
                      </div>
                      <h4 className="font-oswald text-lg sm:text-xl font-bold uppercase text-black break-words">
                        {c.full_name}
                      </h4>
                      <div className="text-xs font-mono text-median-taupe/80 break-all">
                        {c.email}
                        {c.phone ? ` · ${c.phone}` : ''}
                      </div>
                    </div>

                    {/* Informative Mini Telemetry + Clean Actions */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono mr-1">
                        <span className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-median-taupe/20 text-black font-semibold">
                          {clientProjects.length} Project{clientProjects.length === 1 ? '' : 's'}
                        </span>
                        {totalPaid > 0 && (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
                            Paid LKR {totalPaid.toLocaleString()}
                          </span>
                        )}
                        {totalDue > 0 && (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-semibold">
                            Due LKR {totalDue.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setSecurityOpenId(securityOpenId === c.id ? null : c.id)}
                        className={`px-3 py-1.5 rounded-xl border text-[10px] font-mono font-bold uppercase transition-colors ${
                          securityOpenId === c.id
                            ? 'bg-black text-white border-black'
                            : 'border-median-taupe/35 text-black hover:border-black'
                        }`}
                      >
                        Security
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCustomer(editingCustomer?.id === c.id ? null : { ...c })}
                        className="px-3 py-1.5 rounded-xl border border-black text-black hover:bg-black hover:text-white text-[10px] font-mono font-bold uppercase transition-colors"
                      >
                        {editingCustomer?.id === c.id ? 'Close' : 'Edit'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id, c.company_name || c.full_name)}
                        className="px-2.5 py-1.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-600 hover:text-white text-[10px] font-mono font-bold uppercase transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* On-Demand Security Drawer (Password Reset & Block) */}
                  {securityOpenId === c.id && (
                    <div className="pt-3 border-t border-median-taupe/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono bg-[#FAF8F5] -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 p-4 rounded-b-2xl">
                      <div className="flex flex-wrap items-center gap-2 flex-1">
                        <input
                          type="password"
                          placeholder="New passkey (min 6 chars)"
                          value={passwordInputs[c.id] || ''}
                          onChange={(e) => setPasswordInputs({ ...passwordInputs, [c.id]: e.target.value })}
                          className="px-3 py-1.5 rounded-lg border border-median-taupe/30 bg-white text-black w-full sm:w-52 focus:outline-none focus:border-black"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdatePassword(c.id, c.company_name || c.full_name)}
                          className="px-3 py-1.5 rounded-lg bg-black text-white text-[10px] font-bold uppercase hover:bg-median-taupe transition-colors"
                        >
                          Reset Password
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleBlock(c)}
                        className={`px-3.5 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-colors shrink-0 ${
                          c.is_blocked
                            ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                            : 'border-amber-400 text-amber-800 bg-white hover:bg-amber-600 hover:text-white'
                        }`}
                      >
                        {c.is_blocked ? 'Unblock Account ✓' : 'Block / Suspend Access'}
                      </button>
                    </div>
                  )}

                  {/* Inline Edit Form */}
                  {editingCustomer?.id === c.id && (
                    <form
                      onSubmit={handleSaveEdit}
                      className="pt-3 border-t border-median-taupe/15 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono"
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
                          className="px-4 py-2 rounded-lg bg-black text-white font-bold uppercase hover:bg-median-taupe transition-colors shrink-0"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      )}

      <AdminPagination
        currentPage={page}
        totalItems={clients.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
};
