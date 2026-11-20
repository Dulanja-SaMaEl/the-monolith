import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { supabaseAdmin } from '../services/supabase';

const router = Router();

// GET /api/posts - Public retrieves published posts (Admin retrieves all)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { all } = req.query;
    let query = supabaseAdmin.from('blog_posts').select('*');

    if (!all) {
      query = query.eq('is_published', true);
    }

    const { data, error } = await query.order('published_at', { ascending: false });

    if (error) throw error;
    res.json({ posts: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/posts - Admin creates a new blog post
router.post('/', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title,
      slug,
      category,
      author,
      read_time,
      cover_image,
      excerpt,
      content_markdown,
      is_published = true,
    } = req.body;

    if (!title || !excerpt || !content_markdown) {
      res.status(400).json({ error: 'title, excerpt, and content_markdown are required' });
      return;
    }

    const cleanSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .insert({
        slug: cleanSlug,
        title,
        category: category || 'Engineering',
        author: author || 'Monolith LK Editorial',
        read_time: read_time || '5 min read',
        cover_image: cover_image || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
        excerpt,
        content_markdown,
        is_published,
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ post: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/posts/:id - Admin updates a blog post
router.put('/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, category, read_time, cover_image, excerpt, content_markdown, is_published } = req.body;

    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .update({
        title,
        category,
        read_time,
        cover_image,
        excerpt,
        content_markdown,
        is_published,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ post: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/posts/:id - Admin updates a blog post (alias for PUT)
router.patch('/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, slug, category, author, read_time, cover_image, excerpt, content_markdown, is_published } = req.body;

    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .update({
        ...(title !== undefined ? { title } : {}),
        ...(slug !== undefined ? { slug } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(author !== undefined ? { author } : {}),
        ...(read_time !== undefined ? { read_time } : {}),
        ...(cover_image !== undefined ? { cover_image } : {}),
        ...(excerpt !== undefined ? { excerpt } : {}),
        ...(content_markdown !== undefined ? { content_markdown } : {}),
        ...(is_published !== undefined ? { is_published } : {}),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ post: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/posts/:id - Admin deletes a blog post
router.delete('/:id', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, deleted: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
