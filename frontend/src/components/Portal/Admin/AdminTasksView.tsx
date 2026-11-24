import React, { useState, useMemo } from 'react';
import { ExecutiveTask } from '../../../lib/portalStore';
import { portalApi } from '../../../lib/portalApi';
import { ScrollReveal } from '../../MedianStudio/ScrollReveal';

interface AdminTasksViewProps {
  tasks: ExecutiveTask[];
  onRefresh: () => Promise<void>;
  onToggleTask: (t: ExecutiveTask) => Promise<void>;
  showAlert: (msg: string) => void;
}

export const AdminTasksView: React.FC<AdminTasksViewProps> = ({
  tasks,
  onRefresh,
  onToggleTask,
  showAlert,
}) => {
  const [taskDate, setTaskDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [assigneeFilter, setAssigneeFilter] = useState<string>('All');
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);

  // New task form
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('Dulanja Abeysinghe');
  const [category, setCategory] = useState('Architecture');
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [notes, setNotes] = useState('');
  const [editingTask, setEditingTask] = useState<ExecutiveTask | null>(null);

  const shiftDate = (days: number) => {
    const d = new Date(taskDate + 'T00:00:00');
    d.setDate(d.getDate() + days);
    setTaskDate(d.toISOString().split('T')[0]);
  };

  const dayTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.task_date !== taskDate) return false;
      if (assigneeFilter !== 'All' && !t.assignee.includes(assigneeFilter) && !t.assignee.includes('Both')) {
        return false;
      }
      return true;
    });
  }, [tasks, taskDate, assigneeFilter]);

  const activeTasks = dayTasks.filter((t) => !t.is_completed);
  const completedTasks = dayTasks.filter((t) => t.is_completed);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await portalApi.createTask({
        title: title.trim(),
        assignee,
        category,
        priority,
        task_date: taskDate,
        is_completed: false,
        notes: notes.trim() || undefined,
      });
      setTitle('');
      setNotes('');
      setShowCreateForm(false);
      await onRefresh();
      showAlert(`✓ Task added for ${assignee} (${taskDate}).`);
    } catch (err: any) {
      showAlert(`✕ Error adding task: ${err.message}`);
    }
  };

  const handleRolloverSingle = async (t: ExecutiveTask) => {
    const d = new Date((t.task_date || taskDate) + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    const nextDate = d.toISOString().split('T')[0];
    try {
      await portalApi.updateTask(t.id, { task_date: nextDate });
      await onRefresh();
      showAlert(`✓ Moved "${t.title}" to ${nextDate}.`);
    } catch (err: any) {
      showAlert(`✕ Error rolling over task: ${err.message}`);
    }
  };

  const handleBulkRollover = async () => {
    const d = new Date(taskDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    const nextDate = d.toISOString().split('T')[0];
    try {
      const res = await portalApi.rolloverTasks(taskDate, nextDate);
      await onRefresh();
      showAlert(`✓ Rolled over ${res.count} incomplete task(s) to ${nextDate}.`);
    } catch (err: any) {
      showAlert(`✕ Error rolling over: ${err.message}`);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
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
      setEditingTask(null);
      await onRefresh();
      showAlert(`✓ Updated "${editingTask.title}".`);
    } catch (err: any) {
      showAlert(`✕ Error saving task: ${err.message}`);
    }
  };

  const handleDelete = async (id: string, taskTitle: string) => {
    if (!window.confirm(`Delete task "${taskTitle}"?`)) return;
    try {
      await portalApi.deleteTask(id);
      if (editingTask?.id === id) setEditingTask(null);
      await onRefresh();
      showAlert(`✓ Deleted "${taskTitle}".`);
    } catch (err: any) {
      showAlert(`✕ Error deleting task: ${err.message}`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Minimalist Date & Filter Bar */}
      <ScrollReveal variant="fade-up" duration={550} once>
        <div className="p-4 rounded-2xl bg-white border border-median-taupe/20 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => shiftDate(-1)}
              className="px-2.5 py-1.5 rounded-lg border border-median-taupe/30 hover:border-black"
            >
              ← Prev
            </button>
            <input
              type="date"
              value={taskDate}
              onChange={(e) => setTaskDate(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black font-bold"
            />
            <button
              type="button"
              onClick={() => setTaskDate(new Date().toISOString().split('T')[0])}
              className="px-2.5 py-1.5 rounded-lg border border-median-taupe/30 hover:border-black uppercase text-[10px] font-bold"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => shiftDate(1)}
              className="px-2.5 py-1.5 rounded-lg border border-median-taupe/30 hover:border-black"
            >
              Next →
            </button>

            <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-median-taupe/20 ml-0 sm:ml-2">
              {['All', 'Dulanja', 'Remashi'].map((person) => (
                <button
                  key={person}
                  type="button"
                  onClick={() => setAssigneeFilter(person)}
                  className={`px-2.5 py-1 rounded-lg uppercase text-[10px] font-bold transition-all ${
                    assigneeFilter === person ? 'bg-black text-white' : 'text-median-taupe hover:text-black'
                  }`}
                >
                  {person}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeTasks.length > 0 && (
              <button
                type="button"
                onClick={handleBulkRollover}
                className="px-3 py-2 rounded-xl border border-median-taupe/40 text-black hover:border-black text-[10px] font-bold uppercase transition-colors"
              >
                Roll Over Remaining ({activeTasks.length}) →
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowCreateForm((s) => !s)}
              className={`px-4 py-2 rounded-xl font-oswald text-xs uppercase tracking-wider font-bold transition-all ${
                showCreateForm
                  ? 'border border-black text-black bg-white'
                  : 'bg-black text-white hover:bg-median-taupe'
              }`}
            >
              {showCreateForm ? '✕ Close Form' : '+ Add Daily Task'}
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* Collapsible New Task Form */}
      {showCreateForm && (
        <ScrollReveal variant="card-lift" duration={500} once>
          <form
            onSubmit={handleCreate}
            className="p-5 sm:p-6 rounded-2xl bg-white border border-black/15 shadow-md space-y-3.5 text-xs font-mono"
          >
            <h3 className="font-oswald text-lg font-bold uppercase text-black">
              New Executive Task ({taskDate})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <label className="block font-bold uppercase text-black mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Deploy Menu Pvt Ltd production update"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
                />
              </div>
              <div>
                <label className="block font-bold uppercase text-black mb-1">Assignee</label>
                <select
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
                >
                  <option value="Dulanja Abeysinghe">Dulanja Abeysinghe</option>
                  <option value="Remashi Diyana">Remashi Diyana</option>
                  <option value="Both (Dulanja & Remashi)">Both</option>
                </select>
              </div>
              <div>
                <label className="block font-bold uppercase text-black mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
              >
                <option>Architecture</option>
                <option>UI/UX Design</option>
                <option>Operations</option>
                <option>Client Delivery</option>
                <option>Infrastructure</option>
              </select>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes..."
                className="sm:col-span-2 px-3 py-2 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
              />
            </div>

            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-black text-white font-oswald text-xs uppercase tracking-widest hover:bg-median-taupe transition-colors"
            >
              Add to Sprint →
            </button>
          </form>
        </ScrollReveal>
      )}

      {/* Active Sprint Tasks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono uppercase">
          <h3 className="font-oswald text-lg font-bold text-black">
            Active Queue ({activeTasks.length})
          </h3>
          <span className="text-median-taupe">{completedTasks.length} completed today</span>
        </div>

        {activeTasks.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-median-taupe/20 text-center text-xs font-mono text-median-taupe">
            No pending tasks on {taskDate}. Enjoy the clear queue or add a task above.
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeTasks.map((t, idx) => (
              <ScrollReveal key={t.id} variant="fade-up" delay={idx * 45} duration={500} once>
                <div className="p-4 rounded-2xl bg-white border border-median-taupe/20 hover:border-median-taupe/50 shadow-sm space-y-2.5 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => onToggleTask(t)}
                        title="Tick to mark completed"
                        className="mt-0.5 w-5 h-5 rounded-md border-2 border-median-taupe/60 hover:border-emerald-600 hover:bg-emerald-50 flex items-center justify-center shrink-0 transition-colors"
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-0.5 text-[10px] font-mono">
                          <span className="px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-median-taupe/25 text-black font-semibold">
                            {t.assignee}
                          </span>
                          <span className="text-median-taupe uppercase">{t.category}</span>
                          {t.priority !== 'normal' && (
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                                t.priority === 'urgent'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {t.priority}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-black break-words">{t.title}</p>
                        {t.notes && <p className="text-xs font-mono text-median-taupe/80 mt-0.5">{t.notes}</p>}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 shrink-0 pl-8 sm:pl-0">
                      <button
                        type="button"
                        onClick={() => handleRolloverSingle(t)}
                        className="px-2.5 py-1 rounded-lg border border-median-taupe/30 text-black hover:border-black text-[10px] font-mono font-bold uppercase"
                      >
                        Tomorrow →
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingTask(editingTask?.id === t.id ? null : { ...t })}
                        className="px-2.5 py-1 rounded-lg border border-black text-black hover:bg-black hover:text-white text-[10px] font-mono font-bold uppercase"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(t.id, t.title)}
                        className="px-2.5 py-1 rounded-lg border border-red-200 text-red-700 hover:bg-red-600 hover:text-white text-[10px] font-mono font-bold uppercase"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {editingTask?.id === t.id && (
                    <form
                      onSubmit={handleSaveEdit}
                      className="pt-3 border-t border-median-taupe/15 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono"
                    >
                      <input
                        type="text"
                        required
                        value={editingTask.title}
                        onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                        className="sm:col-span-2 px-3 py-1.5 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                      />
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
                      <input
                        type="date"
                        value={editingTask.task_date}
                        onChange={(e) => setEditingTask({ ...editingTask, task_date: e.target.value })}
                        className="px-3 py-1.5 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                      />
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingTask(null)}
                          className="px-2.5 py-1 rounded border border-median-taupe/30 text-median-taupe"
                        >
                          Cancel
                        </button>
                        <button type="submit" className="px-3 py-1 rounded bg-black text-white font-bold">
                          Save
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="pt-4 border-t border-median-taupe/20 space-y-2.5">
          <h3 className="font-oswald text-base font-bold uppercase text-emerald-800">
            Completed ({completedTasks.length})
          </h3>
          {completedTasks.map((t) => (
            <div
              key={t.id}
              className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-200/70 flex items-center justify-between gap-3 text-xs font-mono"
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => onToggleTask(t)}
                  title="Restore to active queue"
                  className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0"
                >
                  ✓
                </button>
                <div className="min-w-0">
                  <span className="line-through text-black/70 font-semibold block truncate">{t.title}</span>
                  <span className="text-[10px] text-median-taupe">{t.assignee}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(t.id, t.title)}
                className="text-[10px] text-red-600 hover:underline font-bold uppercase shrink-0"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
