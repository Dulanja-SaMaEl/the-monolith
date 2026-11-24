import React, { useState, useMemo } from 'react';
import {
  Partner,
  CustomerReview,
  PortalBlogPost,
  ProjectRequest,
  MeetingRequest,
  ContactInquiry,
} from '../../../lib/portalStore';
import { portalApi } from '../../../lib/portalApi';
import { AdminPagination, AdminSkeletonList, AdminToolbar } from './AdminUiPrimitives';
import { ScrollReveal } from '../../MedianStudio/ScrollReveal';

// ====================================================================
// 1. STRATEGIC PARTNERS VIEW
// ====================================================================
export const AdminPartnersView: React.FC<{
  partners: Partner[];
  isSyncing: boolean;
  onRefresh: () => Promise<void>;
  showAlert: (msg: string) => void;
}> = ({ partners, isSyncing, onRefresh, showAlert }) => {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Cloud Infrastructure');
  const [website, setWebsite] = useState('');
  const [desc, setDesc] = useState('');
  const [editing, setEditing] = useState<Partner | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? partners.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.category || '').toLowerCase().includes(q) ||
            (p.description || '').toLowerCase().includes(q)
        )
      : partners;
  }, [partners, search]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await portalApi.createPartner({
        name: name.trim(),
        category,
        website_url: website,
        description: desc,
        is_active: true,
      });
      setName('');
      setWebsite('');
      setDesc('');
      setShowCreate(false);
      await onRefresh();
      showAlert('✓ Strategic partner published.');
    } catch (err: any) {
      showAlert(`✕ Error adding partner: ${err.message}`);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      await portalApi.updatePartner(editing.id, {
        name: editing.name,
        category: editing.category,
        website_url: editing.website_url,
        description: editing.description,
        logo_url: editing.logo_url,
        is_active: editing.is_active,
      });
      setEditing(null);
      await onRefresh();
      showAlert(`✓ Partner "${editing.name}" updated.`);
    } catch (err: any) {
      showAlert(`✕ Error updating partner: ${err.message}`);
    }
  };

  const handleDelete = async (id: string, pName: string) => {
    if (!window.confirm(`Remove partner "${pName}"?`)) return;
    try {
      await portalApi.deletePartner(id);
      if (editing?.id === id) setEditing(null);
      await onRefresh();
      showAlert(`✓ Removed partner "${pName}".`);
    } catch (err: any) {
      showAlert(`✕ Error deleting partner: ${err.message}`);
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
          searchPlaceholder="Search partner name or category..."
          actionLabel="+ Add Partner"
          actionOpen={showCreate}
          onActionToggle={() => setShowCreate((s) => !s)}
        />
      </ScrollReveal>

      {showCreate && (
        <ScrollReveal variant="card-lift" duration={500} once>
          <form
            onSubmit={handleAdd}
            className="p-5 sm:p-6 rounded-2xl bg-white border border-black/15 shadow-md space-y-3.5 text-xs font-mono"
          >
            <h3 className="font-oswald text-lg font-bold uppercase text-black">Add Strategic Partner</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Partner Name *"
                className="px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
              />
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category (e.g. Cloud Infrastructure)"
                className="px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
              />
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="Website URL (https://...)"
                className="px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Short partner description..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
              />
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-black text-white font-oswald text-xs uppercase tracking-widest hover:bg-median-taupe transition-colors shrink-0"
              >
                Publish Partner →
              </button>
            </div>
          </form>
        </ScrollReveal>
      )}

      {isSyncing ? (
        <AdminSkeletonList count={4} />
      ) : (
        <div className="space-y-3">
          {filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((p, idx) => (
            <ScrollReveal key={p.id} variant="fade-up" delay={idx * 45} duration={500} once>
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-median-taupe/20 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe font-bold block">
                      {p.category}
                    </span>
                    <h4 className="font-oswald text-lg font-bold uppercase text-black break-words">{p.name}</h4>
                    {p.description && <p className="text-xs font-mono text-median-taupe/80 mt-0.5 break-words">{p.description}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={async () => {
                        await portalApi.togglePartner(p.id, !p.is_active);
                        await onRefresh();
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase ${
                        p.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {p.is_active ? 'Active' : 'Paused'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(editing?.id === p.id ? null : { ...p })}
                      className="px-2.5 py-1 rounded-lg border border-black text-black hover:bg-black hover:text-white text-[10px] font-mono font-bold uppercase"
                    >
                      {editing?.id === p.id ? 'Close' : 'Edit'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id, p.name)}
                      className="px-2.5 py-1 rounded-lg border border-red-200 text-red-700 hover:bg-red-600 hover:text-white text-[10px] font-mono font-bold uppercase"
                    >
                      Delete
                    </button>
                    {p.website_url && (
                      <a
                        href={p.website_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg border border-median-taupe/30 text-[10px] font-mono font-bold uppercase hover:border-black"
                      >
                        Visit ↗
                      </a>
                    )}
                  </div>
                </div>

                {editing?.id === p.id && (
                  <form
                    onSubmit={handleSaveEdit}
                    className="pt-3 border-t border-median-taupe/15 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono"
                  >
                    <input
                      type="text"
                      required
                      value={editing.name}
                      onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                    />
                    <input
                      type="text"
                      value={editing.category}
                      onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                    />
                    <input
                      type="text"
                      value={editing.website_url || ''}
                      onChange={(e) => setEditing({ ...editing, website_url: e.target.value })}
                      placeholder="Website URL"
                      className="px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                    />
                    <input
                      type="text"
                      value={editing.logo_url || ''}
                      onChange={(e) => setEditing({ ...editing, logo_url: e.target.value })}
                      placeholder="Logo URL (/assets/partner-1.png)"
                      className="px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                    />
                    <input
                      type="text"
                      value={editing.description || ''}
                      onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                      placeholder="Description"
                      className="sm:col-span-2 px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                    />
                    <div className="sm:col-span-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing(null)}
                        className="px-3 py-1.5 rounded-lg border border-median-taupe/30 text-median-taupe"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="px-4 py-1.5 rounded-lg bg-black text-white font-bold uppercase">
                        Save Partner
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      )}

      <AdminPagination currentPage={page} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </div>
  );
};

// ====================================================================
// 2. CUSTOMER REVIEWS VIEW
// ====================================================================
export const AdminReviewsView: React.FC<{
  reviews: CustomerReview[];
  isSyncing: boolean;
  onRefresh: () => Promise<void>;
  showAlert: (msg: string) => void;
}> = ({ reviews, isSyncing, onRefresh, showAlert }) => {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [editing, setEditing] = useState<CustomerReview | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? reviews.filter(
          (r) =>
            r.client_name.toLowerCase().includes(q) ||
            r.company_name.toLowerCase().includes(q) ||
            r.review_text.toLowerCase().includes(q)
        )
      : reviews;
  }, [reviews, search]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !company || !text) return;
    try {
      await portalApi.addReview({
        client_name: name,
        client_title: title || 'Managing Director',
        company_name: company,
        rating,
        review_text: text,
        is_featured: true,
      });
      setName('');
      setTitle('');
      setCompany('');
      setText('');
      setShowCreate(false);
      await onRefresh();
      showAlert('✓ Testimonial published to live homepage.');
    } catch (err: any) {
      showAlert(`✕ Error publishing review: ${err.message}`);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      await portalApi.updateReview(editing.id, {
        client_name: editing.client_name,
        client_title: editing.client_title,
        company_name: editing.company_name,
        rating: editing.rating,
        review_text: editing.review_text,
        is_featured: editing.is_featured,
      });
      setEditing(null);
      await onRefresh();
      showAlert(`✓ Updated testimonial from "${editing.client_name}".`);
    } catch (err: any) {
      showAlert(`✕ Error updating review: ${err.message}`);
    }
  };

  const handleDelete = async (id: string, rName: string) => {
    if (!window.confirm(`Delete review from "${rName}"?`)) return;
    try {
      await portalApi.deleteReview(id);
      if (editing?.id === id) setEditing(null);
      await onRefresh();
      showAlert(`✓ Deleted review from "${rName}".`);
    } catch (err: any) {
      showAlert(`✕ Error deleting review: ${err.message}`);
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
          searchPlaceholder="Search client, company, or quote..."
          actionLabel="+ Add Testimonial"
          actionOpen={showCreate}
          onActionToggle={() => setShowCreate((s) => !s)}
        />
      </ScrollReveal>

      {showCreate && (
        <ScrollReveal variant="card-lift" duration={500} once>
          <form
            onSubmit={handleAdd}
            className="p-5 sm:p-6 rounded-2xl bg-white border border-black/15 shadow-md space-y-3.5 text-xs font-mono"
          >
            <h3 className="font-oswald text-lg font-bold uppercase text-black">Publish Client Testimonial</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Client Full Name *"
                className="px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
              />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Role / Designation"
                className="px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
              />
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company Name *"
                className="px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
              />
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
              >
                <option value={5}>★★★★★ (5 Stars)</option>
                <option value={4}>★★★★☆ (4 Stars)</option>
                <option value={3}>★★★☆☆ (3 Stars)</option>
              </select>
            </div>
            <textarea
              required
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Client endorsement quote..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-black text-white font-oswald text-xs uppercase tracking-widest hover:bg-median-taupe transition-colors"
            >
              Publish Testimonial →
            </button>
          </form>
        </ScrollReveal>
      )}

      {isSyncing ? (
        <AdminSkeletonList count={3} />
      ) : (
        <div className="space-y-3">
          {filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((r, idx) => (
            <ScrollReveal key={r.id} variant="fade-up" delay={idx * 50} duration={500} once>
              <div className="p-5 rounded-2xl bg-white border border-median-taupe/20 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-amber-500 text-xs mb-1">{'★'.repeat(r.rating || 5)}</div>
                    <h4 className="font-oswald text-lg font-bold uppercase text-black">{r.client_name}</h4>
                    <span className="text-[11px] font-mono text-median-taupe uppercase">
                      {r.client_title} · {r.company_name}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={async () => {
                        await portalApi.toggleReviewFeatured(r.id, !r.is_featured);
                        await onRefresh();
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase ${
                        r.is_featured ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {r.is_featured ? 'Live on Site' : 'Hidden'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(editing?.id === r.id ? null : { ...r })}
                      className="px-2.5 py-1 rounded-lg border border-black text-black hover:bg-black hover:text-white text-[10px] font-mono font-bold uppercase"
                    >
                      {editing?.id === r.id ? 'Close' : 'Edit'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id, r.client_name)}
                      className="px-2.5 py-1 rounded-lg border border-red-200 text-red-700 hover:bg-red-600 hover:text-white text-[10px] font-mono font-bold uppercase"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-black/85 leading-relaxed bg-[#FAF8F5] p-3.5 rounded-xl border border-median-taupe/15">
                  &ldquo;{r.review_text}&rdquo;
                </p>

                {editing?.id === r.id && (
                  <form onSubmit={handleSaveEdit} className="pt-2 space-y-2.5 text-xs font-mono">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        required
                        value={editing.client_name}
                        onChange={(e) => setEditing({ ...editing, client_name: e.target.value })}
                        className="px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                      />
                      <input
                        type="text"
                        value={editing.client_title}
                        onChange={(e) => setEditing({ ...editing, client_title: e.target.value })}
                        className="px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                      />
                      <input
                        type="text"
                        required
                        value={editing.company_name}
                        onChange={(e) => setEditing({ ...editing, company_name: e.target.value })}
                        className="px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                      />
                    </div>
                    <textarea
                      rows={3}
                      required
                      value={editing.review_text}
                      onChange={(e) => setEditing({ ...editing, review_text: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing(null)}
                        className="px-3 py-1.5 rounded-lg border border-median-taupe/30 text-median-taupe"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="px-4 py-1.5 rounded-lg bg-black text-white font-bold uppercase">
                        Save Review
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      )}

      <AdminPagination currentPage={page} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </div>
  );
};

// ====================================================================
// 3. EDITORIAL / BLOG CMS VIEW
// ====================================================================
export const AdminBlogView: React.FC<{
  blogPosts: PortalBlogPost[];
  isSyncing: boolean;
  onRefresh: () => Promise<void>;
  showAlert: (msg: string) => void;
}> = ({ blogPosts, isSyncing, onRefresh, showAlert }) => {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Architecture');
  const [author, setAuthor] = useState('Dulanja Abeysinghe');
  const [readTime, setReadTime] = useState('5 min read');
  const [cover, setCover] = useState('/assets/blog-1.jpg');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [editing, setEditing] = useState<PortalBlogPost | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? blogPosts.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            (p.category || '').toLowerCase().includes(q) ||
            (p.author || '').toLowerCase().includes(q)
        )
      : blogPosts;
  }, [blogPosts, search]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !excerpt || !content) return;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    try {
      await portalApi.addBlogPost({
        slug,
        title,
        category,
        author,
        read_time: readTime,
        cover_image: cover,
        excerpt,
        content_markdown: content,
        is_published: true,
      });
      setTitle('');
      setExcerpt('');
      setContent('');
      setShowCreate(false);
      await onRefresh();
      showAlert('✓ Article published to homepage & /blog.');
    } catch (err: any) {
      showAlert(`✕ Error publishing article: ${err.message}`);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      await portalApi.updateBlogPost(editing.id, {
        title: editing.title,
        category: editing.category,
        author: editing.author,
        read_time: editing.read_time,
        cover_image: editing.cover_image,
        excerpt: editing.excerpt,
        content_markdown: editing.content_markdown,
        is_published: editing.is_published,
      });
      setEditing(null);
      await onRefresh();
      showAlert(`✓ Article "${editing.title}" updated.`);
    } catch (err: any) {
      showAlert(`✕ Error updating article: ${err.message}`);
    }
  };

  const handleDelete = async (id: string, pTitle: string) => {
    if (!window.confirm(`Delete article "${pTitle}"?`)) return;
    try {
      await portalApi.deleteBlogPost(id);
      if (editing?.id === id) setEditing(null);
      await onRefresh();
      showAlert(`✓ Deleted article "${pTitle}".`);
    } catch (err: any) {
      showAlert(`✕ Error deleting article: ${err.message}`);
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
          searchPlaceholder="Search articles, category, author..."
          actionLabel="+ Write Article"
          actionOpen={showCreate}
          onActionToggle={() => setShowCreate((s) => !s)}
        />
      </ScrollReveal>

      {showCreate && (
        <ScrollReveal variant="card-lift" duration={500} once>
          <form
            onSubmit={handleAdd}
            className="p-5 sm:p-6 rounded-2xl bg-white border border-black/15 shadow-md space-y-3.5 text-xs font-mono"
          >
            <h3 className="font-oswald text-lg font-bold uppercase text-black">Publish Editorial Article</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Article Headline *"
                className="sm:col-span-2 px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
              />
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category"
                className="px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author"
                className="px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
              />
              <input
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="Read time (e.g. 5 min read)"
                className="px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
              />
              <input
                type="text"
                value={cover}
                onChange={(e) => setCover(e.target.value)}
                placeholder="Cover Image URL"
                className="px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
              />
            </div>
            <input
              type="text"
              required
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short executive summary / excerpt *"
              className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
            />
            <textarea
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Full article body (separate paragraphs with blank lines) *"
              className="w-full px-3.5 py-2.5 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-sm text-black"
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-black text-white font-oswald text-xs uppercase tracking-widest hover:bg-median-taupe transition-colors"
            >
              Publish Article Live →
            </button>
          </form>
        </ScrollReveal>
      )}

      {isSyncing ? (
        <AdminSkeletonList count={3} />
      ) : (
        <div className="space-y-3">
          {filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((post, idx) => (
            <ScrollReveal key={post.id} variant="fade-up" delay={idx * 50} duration={500} once>
              <div className="p-5 rounded-2xl bg-white border border-median-taupe/20 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-median-taupe font-bold block">
                      {post.category} · {post.author} · {post.read_time}
                    </span>
                    <h4 className="font-oswald text-xl font-bold uppercase text-black break-words">{post.title}</h4>
                    <p className="text-xs text-median-taupe/85 mt-1">{post.excerpt}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={async () => {
                        await portalApi.updateBlogPost(post.id, { is_published: !post.is_published });
                        await onRefresh();
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase ${
                        post.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {post.is_published ? 'Published' : 'Draft'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(editing?.id === post.id ? null : { ...post })}
                      className="px-2.5 py-1 rounded-lg border border-black text-black hover:bg-black hover:text-white text-[10px] font-mono font-bold uppercase"
                    >
                      {editing?.id === post.id ? 'Close' : 'Edit'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(post.id, post.title)}
                      className="px-2.5 py-1 rounded-lg border border-red-200 text-red-700 hover:bg-red-600 hover:text-white text-[10px] font-mono font-bold uppercase"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {editing?.id === post.id && (
                  <form onSubmit={handleSaveEdit} className="pt-3 border-t border-median-taupe/15 space-y-2.5 text-xs font-mono">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        value={editing.title}
                        onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                        className="px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                      />
                      <input
                        type="text"
                        value={editing.category}
                        onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                        className="px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                      />
                    </div>
                    <input
                      type="text"
                      value={editing.excerpt}
                      onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                    />
                    <textarea
                      rows={4}
                      value={editing.content_markdown}
                      onChange={(e) => setEditing({ ...editing, content_markdown: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-median-taupe/30 bg-[#FAF8F5] text-black"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing(null)}
                        className="px-3 py-1.5 rounded-lg border border-median-taupe/30 text-median-taupe"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="px-4 py-1.5 rounded-lg bg-black text-white font-bold uppercase">
                        Save Article
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>
      )}

      <AdminPagination currentPage={page} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </div>
  );
};

// ====================================================================
// 4. CLEAN SEGMENTED INBOX: REQUESTS, MEETINGS & PUBLIC INQUIRIES
// ====================================================================
export const AdminRequestsView: React.FC<{
  requests: ProjectRequest[];
  meetings: MeetingRequest[];
  inquiries: ContactInquiry[];
  isSyncing: boolean;
  onRefresh: () => Promise<void>;
  showAlert: (msg: string) => void;
}> = ({ requests, meetings, inquiries, isSyncing, onRefresh, showAlert }) => {
  const [subTab, setSubTab] = useState<'inquiries' | 'meetings' | 'scopes'>('inquiries');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  return (
    <div className="space-y-5">
      {/* Clean 3-Way Inbox Switcher */}
      <ScrollReveal variant="fade-up" duration={500} once>
        <div className="p-2 rounded-2xl bg-white border border-median-taupe/20 shadow-sm inline-flex flex-wrap gap-1.5 font-oswald text-xs sm:text-sm uppercase tracking-wider">
          {[
            { id: 'inquiries', label: 'Public Contact Briefs', count: inquiries.length },
            { id: 'meetings', label: 'Consultation Meetings', count: meetings.length },
            { id: 'scopes', label: 'Project Commissions', count: requests.length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setSubTab(tab.id as any);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                subTab === tab.id ? 'bg-black text-white font-bold shadow-sm' : 'text-median-taupe hover:text-black'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  subTab === tab.id ? 'bg-white/20 text-white' : 'bg-median-taupe/10 text-median-taupe'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </ScrollReveal>

      {isSyncing ? (
        <AdminSkeletonList count={3} />
      ) : (
        <>
          {subTab === 'inquiries' && (
            <div className="space-y-3">
              {inquiries.length === 0 ? (
                <div className="p-10 rounded-2xl bg-white border border-median-taupe/20 text-center text-xs font-mono text-median-taupe">
                  No public contact briefs yet.
                </div>
              ) : (
                inquiries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((inq, idx) => (
                  <ScrollReveal key={inq.id} variant="fade-up" delay={idx * 45} duration={500} once>
                    <div className="p-5 rounded-2xl bg-white border border-median-taupe/20 shadow-sm space-y-2.5">
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] font-mono uppercase text-median-taupe font-bold block">
                            {inq.service_need} · {inq.budget_tier || 'Budget Open'}
                          </span>
                          <h4 className="font-oswald text-lg font-bold uppercase text-black">
                            {inq.name} {inq.company && `(${inq.company})`}
                          </h4>
                          <span className="text-xs font-mono text-median-taupe">{inq.email}</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-median-taupe/10 text-median-taupe text-[10px] font-mono font-bold uppercase">
                          {inq.status}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-black/80 bg-[#FAF8F5] p-3.5 rounded-xl border border-median-taupe/15">
                        {inq.brief}
                      </p>
                      {inq.status === 'new' && (
                        <button
                          type="button"
                          onClick={async () => {
                            await portalApi.updateInquiryStatus(inq.id, 'contacted');
                            await onRefresh();
                            showAlert(`Marked inquiry from ${inq.name} as CONTACTED.`);
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-black text-white text-[10px] font-mono uppercase font-bold hover:bg-median-taupe transition-colors"
                        >
                          Mark Contacted ✓
                        </button>
                      )}
                    </div>
                  </ScrollReveal>
                ))
              )}
              <AdminPagination currentPage={page} totalItems={inquiries.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
            </div>
          )}

          {subTab === 'meetings' && (
            <div className="space-y-3">
              {meetings.length === 0 ? (
                <div className="p-10 rounded-2xl bg-white border border-median-taupe/20 text-center text-xs font-mono text-median-taupe">
                  No consultation requests booked yet.
                </div>
              ) : (
                meetings.map((m, idx) => (
                  <ScrollReveal key={m.id} variant="fade-up" delay={idx * 45} duration={500} once>
                    <div className="p-5 rounded-2xl bg-white border border-median-taupe/20 shadow-sm space-y-2.5">
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-median-taupe font-bold block">
                            {m.meeting_type} · {m.client_name}
                          </span>
                          <h4 className="font-oswald text-lg font-bold uppercase text-black">
                            {m.requested_date} @ {m.requested_time}
                          </h4>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            m.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-black/80 bg-[#FAF8F5] p-3.5 rounded-xl border border-median-taupe/15">
                        {m.agenda}
                      </p>
                      {m.status === 'pending' && (
                        <button
                          type="button"
                          onClick={async () => {
                            await portalApi.updateMeetingStatus(
                              m.id,
                              'confirmed',
                              'https://meet.google.com/monolith-architecture-session'
                            );
                            await onRefresh();
                            showAlert('Meeting confirmed and Google Meet room assigned.');
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-black text-white text-[10px] font-mono uppercase font-bold hover:bg-median-taupe transition-colors"
                        >
                          Confirm &amp; Assign Google Meet Room
                        </button>
                      )}
                    </div>
                  </ScrollReveal>
                ))
              )}
            </div>
          )}

          {subTab === 'scopes' && (
            <div className="space-y-3">
              {requests.length === 0 ? (
                <div className="p-10 rounded-2xl bg-white border border-median-taupe/20 text-center text-xs font-mono text-median-taupe">
                  No project commission scopes submitted yet.
                </div>
              ) : (
                requests.map((r, idx) => (
                  <ScrollReveal key={r.id} variant="fade-up" delay={idx * 45} duration={500} once>
                    <div className="p-5 rounded-2xl bg-white border border-median-taupe/20 shadow-sm space-y-2.5">
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-median-taupe font-bold block">
                            Client: {r.client_name} · {r.service_category}
                          </span>
                          <h4 className="font-oswald text-lg font-bold uppercase text-black">{r.project_title}</h4>
                          <span className="text-[11px] font-mono text-median-taupe">
                            Budget: {r.estimated_budget} · Target: {r.target_timeline}
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-mono font-bold uppercase">
                          {r.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-black/80 bg-[#FAF8F5] p-3.5 rounded-xl border border-median-taupe/15">
                        {r.project_scope}
                      </p>
                      {r.status !== 'approved' && (
                        <button
                          type="button"
                          onClick={async () => {
                            await portalApi.updateProjectRequestStatus(r.id, 'approved');
                            await onRefresh();
                            showAlert(`Approved scope for ${r.project_title}.`);
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-black text-white text-[10px] font-mono uppercase font-bold hover:bg-median-taupe transition-colors"
                        >
                          Approve Scope ✓
                        </button>
                      )}
                    </div>
                  </ScrollReveal>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
