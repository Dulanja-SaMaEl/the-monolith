import React, { useState, useMemo } from 'react';
import { UserProfile, PortalProject } from '../../../lib/portalStore';
import { portalApi } from '../../../lib/portalApi';
import { AdminPagination, AdminSkeletonList, AdminToolbar } from './AdminUiPrimitives';
import { SystemHeartbeatMonitor } from '../SystemHeartbeatMonitor';
import { ScrollReveal } from '../../MedianStudio/ScrollReveal';

interface AdminProjectsViewProps {
  users: UserProfile[];
  projects: PortalProject[];
  isSyncing: boolean;
  onRefresh: () => Promise<void>;
  showAlert: (msg: string) => void;
}

export const AdminProjectsView: React.FC<AdminProjectsViewProps> = ({
  users,
  projects,
  isSyncing,
  onRefresh,
  showAlert,
}) => {
  const clients = useMemo(() => users.filter((u) => u.role === 'client'), [users]);

  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  // Create form state
  const [clientId, setClientId] = useState('');
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('Custom Software Engineering');
  const [targetDate, setTargetDate] = useState('2027-01-31');
  const [summary, setSummary] = useState('');

  // Inline editor state
  const [editingProject, setEditingProject] = useState<PortalProject | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (stageFilter !== 'all' && p.status !== stageFilter) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        (p.code_name || '').toLowerCase().includes(q) ||
        (p.client_name || '').toLowerCase().includes(q)
      );
    });
  }, [projects, search, stageFilter]);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !clientId) return;
    const selectedClient = clients.find((c) => c.id === clientId);
    try {
      await portalApi.createProject({
        client_id: clientId,
        client_name: selectedClient?.company_name || selectedClient?.full_name || 'Enterprise Client',
        title,
        code_name: code || `PRJ-${Math.floor(100 + Math.random() * 900)}`,
        category,
        status: 'architecture',
        progress_percentage: 15,
        target_launch_date: targetDate,
        summary: summary || 'Custom enterprise software platform.',
        milestones: [
          { title: 'Architecture Schema & Core Protocol Design', is_completed: true },
          { title: 'Core Application & Integration Pipeline', is_completed: false },
          { title: 'QA Stress Testing & Production Cutover', is_completed: false },
        ],
      });
      setTitle('');
      setCode('');
      setSummary('');
      setShowCreateForm(false);
      await onRefresh();
      showAlert('✓ Project commissioned and published to client portal.');
    } catch (err: any) {
      showAlert(`✕ Error creating project: ${err.message}`);
    }
  };

  const handleDeltaProgress = async (proj: PortalProject, delta: number) => {
    const nextVal = Math.min(100, Math.max(0, proj.progress_percentage + delta));
    const nextStatus = nextVal === 100 ? 'deployed' : nextVal > 70 ? 'qa_testing' : 'in_progress';
    await portalApi.updateProject(proj.id, { progress_percentage: nextVal, status: nextStatus });
    await onRefresh();
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
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
        production_url: editingProject.production_url,
        figma_url: editingProject.figma_url,
        api_docs_url: editingProject.api_docs_url,
        domain_renewal_date: editingProject.domain_renewal_date,
        server_expiry_date: editingProject.server_expiry_date,
        vault_notes: editingProject.vault_notes,
        summary: editingProject.summary,
      });
      setEditingProject(null);
      await onRefresh();
      showAlert(`✓ Project "${editingProject.title}" updated.`);
    } catch (err: any) {
      showAlert(`✕ Error updating project: ${err.message}`);
    }
  };

  const handleDelete = async (id: string, projTitle: string) => {
    if (!window.confirm(`Permanently delete project "${projTitle}" and its milestones?`)) return;
    try {
      await portalApi.deleteProject(id);
      if (editingProject?.id === id) setEditingProject(null);
      await onRefresh();
      showAlert(`✓ Deleted project "${projTitle}".`);
    } catch (err: any) {
      showAlert(`✕ Error deleting project: ${err.message}`);
    }
  };

  return (
    <div className="space-y-5">
      <ScrollReveal variant="fade-up" duration={550} once>
        <AdminToolbar
          searchValue={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder="Search project, code, or client..."
          actionLabel="+ Commission Project"
          actionOpen={showCreateForm}
          onActionToggle={() => setShowCreateForm((s) => !s)}
          extraControls={
            <select
              value={stageFilter}
              onChange={(e) => {
                setStageFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-median-taupe/25 bg-[#FAF8F5] text-xs font-mono text-black"
            >
              <option value="all">All Stages</option>
              <option value="discovery">Discovery</option>
              <option value="architecture">Architecture</option>
              <option value="in_progress">In Progress</option>
              <option value="qa_testing">QA Testing</option>
              <option value="deployed">Deployed</option>
              <option value="maintenance">Maintenance</option>
            </select>
          }
        />
      </ScrollReveal>

      {/* Collapsible Commission Form */}
      {showCreateForm && (
        <ScrollReveal variant="card-lift" duration={500} once>
          <form
            onSubmit={handleAddProject}
            className="p-5 sm:p-6 rounded-2xl bg-white border border-black/15 shadow-md space-y-4 text-xs font-mono"
          >
            <div>
              <h3 className="font-oswald text-lg font-bold uppercase text-black">Commission New Project</h3>
              <p className="text-[11px] text-median-taupe/80">
                Assign a project directly to a client&apos;s portal with default milestones.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div>
                <label className="block font-bold uppercase text-black mb-1">Assign to Client *</label>
                <select
                  required
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
                >
                  <option value="">-- Select Customer --</option>
                  {clients.map((c) => (
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
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Enterprise POS & Web Platform"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
                />
              </div>
              <div>
                <label className="block font-bold uppercase text-black mb-1">Code Name</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="PRJ-MENU-01"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block font-bold uppercase text-black mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
                >
                  <option>Custom Software Engineering</option>
                  <option>AI, Data, &amp; Machine Learning</option>
                  <option>Cloud Infrastructure &amp; DevOps</option>
                  <option>Cybersecurity &amp; Risk Management</option>
                  <option>Fintech &amp; Gaming API</option>
                </select>
              </div>
              <div>
                <label className="block font-bold uppercase text-black mb-1">Target Launch</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
                />
              </div>
              <div>
                <label className="block font-bold uppercase text-black mb-1">Summary</label>
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Brief technical scope..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
                />
              </div>
            </div>

            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-black text-white font-oswald text-xs uppercase tracking-widest hover:bg-median-taupe transition-colors"
            >
              Commission Project Now →
            </button>
          </form>
        </ScrollReveal>
      )}

      {/* Projects List */}
      {isSyncing ? (
        <AdminSkeletonList count={3} />
      ) : filtered.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white border border-median-taupe/20 text-center text-xs font-mono text-median-taupe">
          No projects found. Click <strong>+ Commission Project</strong> above to start one.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((proj, idx) => (
            <ScrollReveal key={proj.id} variant="fade-up" delay={idx * 65} duration={600} once>
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-median-taupe/20 hover:border-median-taupe/50 shadow-sm space-y-4 transition-all">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono mb-0.5">
                      <span className="font-bold uppercase text-median-taupe">{proj.code_name}</span>
                      <span className="text-median-taupe/40">·</span>
                      <span className="font-semibold text-black">{proj.client_name}</span>
                      {(proj.production_url || proj.domain_renewal_date || proj.server_expiry_date) && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[9px] font-bold uppercase">
                          Vault Configured
                        </span>
                      )}
                    </div>
                    <h4 className="font-oswald text-xl sm:text-2xl font-bold uppercase text-black break-words">
                      {proj.title}
                    </h4>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                        proj.status === 'deployed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {proj.status.replace('_', ' ')}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingProject(editingProject?.id === proj.id ? null : { ...proj })}
                      className="px-3 py-1 rounded-full border border-black text-black hover:bg-black hover:text-white text-[10px] font-mono font-bold uppercase transition-colors"
                    >
                      {editingProject?.id === proj.id ? 'Close' : 'Edit & Vault'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(proj.id, proj.title)}
                      className="px-3 py-1 rounded-full border border-red-200 text-red-700 hover:bg-red-600 hover:text-white text-[10px] font-mono font-bold uppercase transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Live Production System Heartbeat Strip (when production_url is configured) */}
                {proj.production_url && (
                  <SystemHeartbeatMonitor
                    projectId={proj.id}
                    productionUrl={proj.production_url}
                    variant="compact"
                  />
                )}

                {/* Inline Full Project & Deliverables Vault Editor */}
                {editingProject?.id === proj.id && (
                  <form
                    onSubmit={handleSaveEdit}
                    className="p-4 sm:p-5 rounded-xl bg-[#FAF8F5] border border-median-taupe/25 space-y-3 text-xs font-mono"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        required
                        value={editingProject.title}
                        onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                        placeholder="Project Title"
                        className="px-3 py-2 rounded-lg border border-median-taupe/30 bg-white text-black"
                      />
                      <input
                        type="text"
                        value={editingProject.code_name || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, code_name: e.target.value })}
                        placeholder="Code Name"
                        className="px-3 py-2 rounded-lg border border-median-taupe/30 bg-white text-black"
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editingProject.progress_percentage}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, progress_percentage: Number(e.target.value) })
                        }
                        placeholder="Progress %"
                        className="px-3 py-2 rounded-lg border border-median-taupe/30 bg-white text-black"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={editingProject.category}
                        onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                        placeholder="Category"
                        className="px-3 py-2 rounded-lg border border-median-taupe/30 bg-white text-black"
                      />
                      <input
                        type="date"
                        value={editingProject.target_launch_date || ''}
                        onChange={(e) =>
                          setEditingProject({ ...editingProject, target_launch_date: e.target.value })
                        }
                        className="px-3 py-2 rounded-lg border border-median-taupe/30 bg-white text-black"
                      />
                    </div>

                    <textarea
                      rows={2}
                      value={editingProject.summary || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, summary: e.target.value })}
                      placeholder="Executive summary..."
                      className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-white text-black"
                    />

                    {/* Vault Fields */}
                    <div className="pt-2 border-t border-median-taupe/20 space-y-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-black block">
                        Deliverables &amp; Infrastructure Vault
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <input
                          type="url"
                          value={editingProject.production_url || ''}
                          onChange={(e) => setEditingProject({ ...editingProject, production_url: e.target.value })}
                          placeholder="Production URL (https://...)"
                          className="px-3 py-2 rounded-lg border border-median-taupe/30 bg-white text-black"
                        />
                        <input
                          type="url"
                          value={editingProject.staging_url || ''}
                          onChange={(e) => setEditingProject({ ...editingProject, staging_url: e.target.value })}
                          placeholder="Staging URL (https://...)"
                          className="px-3 py-2 rounded-lg border border-median-taupe/30 bg-white text-black"
                        />
                        <input
                          type="url"
                          value={editingProject.figma_url || ''}
                          onChange={(e) => setEditingProject({ ...editingProject, figma_url: e.target.value })}
                          placeholder="Figma Link (https://figma.com/...)"
                          className="px-3 py-2 rounded-lg border border-median-taupe/30 bg-white text-black"
                        />
                        <input
                          type="url"
                          value={editingProject.api_docs_url || ''}
                          onChange={(e) => setEditingProject({ ...editingProject, api_docs_url: e.target.value })}
                          placeholder="API Docs URL (https://...)"
                          className="px-3 py-2 rounded-lg border border-median-taupe/30 bg-white text-black"
                        />
                        <div>
                          <label className="block text-[9px] uppercase text-median-taupe mb-0.5">Domain Renewal Date</label>
                          <input
                            type="date"
                            value={editingProject.domain_renewal_date || ''}
                            onChange={(e) =>
                              setEditingProject({ ...editingProject, domain_renewal_date: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-white text-black"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase text-median-taupe mb-0.5">Server / Cloud Expiry</label>
                          <input
                            type="date"
                            value={editingProject.server_expiry_date || ''}
                            onChange={(e) =>
                              setEditingProject({ ...editingProject, server_expiry_date: e.target.value })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-white text-black"
                          />
                        </div>
                      </div>
                      <input
                        type="text"
                        value={editingProject.vault_notes || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, vault_notes: e.target.value })}
                        placeholder="Infrastructure / DNS / Hosting Notes..."
                        className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-white text-black"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingProject(null)}
                        className="px-3 py-1.5 rounded-lg border border-median-taupe/30 text-median-taupe hover:text-black uppercase"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-black text-white font-bold uppercase hover:bg-median-taupe transition-colors"
                      >
                        Save Project Changes
                      </button>
                    </div>
                  </form>
                )}

                {/* Progress Bar & Controls */}
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-median-taupe/15 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <span className="font-semibold text-black">Progress: {proj.progress_percentage}%</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDeltaProgress(proj, -5)}
                        className="px-2 py-1 rounded border border-median-taupe/30 bg-white hover:border-black font-bold"
                      >
                        -5%
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeltaProgress(proj, 5)}
                        className="px-2 py-1 rounded border border-median-taupe/30 bg-white hover:border-black font-bold"
                      >
                        +5%
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeltaProgress(proj, 100 - proj.progress_percentage)}
                        className="px-2.5 py-1 rounded bg-black text-white hover:bg-median-taupe text-[10px] font-bold uppercase"
                      >
                        100% Deployed
                      </button>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-median-taupe/20 overflow-hidden">
                    <div
                      className="h-full bg-median-taupe rounded-full transition-all duration-500"
                      style={{ width: `${proj.progress_percentage}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-median-taupe/15 text-xs font-mono">
                    <select
                      value={proj.status}
                      onChange={async (e) => {
                        await portalApi.updateProject(proj.id, { status: e.target.value as PortalProject['status'] });
                        await onRefresh();
                        showAlert(`Updated ${proj.code_name} stage.`);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-median-taupe/30 bg-white text-black uppercase font-semibold text-[11px]"
                    >
                      <option value="discovery">Discovery</option>
                      <option value="architecture">Architecture</option>
                      <option value="in_progress">In Progress</option>
                      <option value="qa_testing">QA Testing</option>
                      <option value="deployed">Deployed</option>
                      <option value="maintenance">Maintenance</option>
                    </select>

                    {proj.milestones && proj.milestones.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {proj.milestones.map((ms) => (
                          <button
                            key={ms.id}
                            type="button"
                            onClick={async () => {
                              const nextMs = proj.milestones.map((m) =>
                                m.id === ms.id ? { ...m, is_completed: !m.is_completed } : m
                              );
                              await portalApi.toggleMilestone(proj.id, ms.id, !ms.is_completed, nextMs);
                              await onRefresh();
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
            </ScrollReveal>
          ))}
        </div>
      )}

      <AdminPagination
        currentPage={page}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
};
