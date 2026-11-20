-- ====================================================================
-- MONOLITH LK DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- Enterprise Portal & Studio OS Schema with RLS and Seed Data
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Linked to Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'client')) DEFAULT 'client',
  company_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Partners Table (Academic, Cloud & Enterprise Strategic Partners)
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'Academic & Research', 'Cloud Infrastructure', 'Fintech & Security', 'Enterprise'
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  code_name TEXT UNIQUE,
  category TEXT NOT NULL,
  status TEXT CHECK (status IN ('discovery', 'architecture', 'in_progress', 'qa_testing', 'deployed', 'maintenance')) DEFAULT 'discovery',
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  repository_or_demo_url TEXT,
  staging_url TEXT,
  target_launch_date DATE,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Project Milestones Table
CREATE TABLE IF NOT EXISTS public.project_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Invoices & Quotations Table
CREATE TABLE IF NOT EXISTS public.documents_billing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_number TEXT UNIQUE NOT NULL, -- e.g. 'INV-2026-001', 'QUO-2026-002'
  type TEXT CHECK (type IN ('quotation', 'invoice')) NOT NULL,
  client_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('draft', 'sent', 'approved', 'paid', 'overdue')) DEFAULT 'draft',
  currency TEXT DEFAULT 'USD',
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of { description, quantity, unit_price, total }
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tax NUMERIC(12, 2) DEFAULT 0,
  total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  due_date DATE,
  notes TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Project Requests Table (Submitted by Clients)
CREATE TABLE IF NOT EXISTS public.project_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_title TEXT NOT NULL,
  service_category TEXT NOT NULL,
  estimated_budget TEXT,
  target_timeline TEXT,
  project_scope TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  status TEXT CHECK (status IN ('pending_review', 'under_estimation', 'approved', 'declined')) DEFAULT 'pending_review',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Meeting Requests Table (Booked by Clients)
CREATE TABLE IF NOT EXISTS public.meeting_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  requested_date DATE NOT NULL,
  requested_time TIME NOT NULL,
  timezone TEXT DEFAULT 'Asia/Colombo (UTC+5:30)',
  meeting_type TEXT CHECK (meeting_type IN ('Discovery Call', 'Sprint Review', 'Architecture Consultation', 'Emergency Triage')) DEFAULT 'Architecture Consultation',
  agenda TEXT NOT NULL,
  meeting_link TEXT,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'rescheduled', 'completed', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Customer Reviews & Testimonials (Managed by Admin -> Shown on Live Site)
CREATE TABLE IF NOT EXISTS public.customer_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT NOT NULL,
  client_avatar_url TEXT,
  is_featured BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. News & Blog Posts (Managed by Admin -> Shown on /blog & Home)
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  author TEXT DEFAULT 'Monolith LK Editorial',
  read_time TEXT DEFAULT '5 min read',
  cover_image TEXT,
  excerpt TEXT NOT NULL,
  content_markdown TEXT NOT NULL,
  is_published BOOLEAN DEFAULT TRUE,
  published_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Helper function: Is Admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public Profiles: User can view their own profile, Admins can view all
CREATE POLICY "Profiles are viewable by user and admins"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update their own profile; admins can update all"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- Partners: Publicly readable; Admins can modify
CREATE POLICY "Partners are viewable by everyone"
  ON public.partners FOR SELECT
  USING (true);

CREATE POLICY "Admins have full access to partners"
  ON public.partners FOR ALL
  USING (public.is_admin());

-- Projects: Clients can view their own projects; Admins can do everything
CREATE POLICY "Clients can view their own projects"
  ON public.projects FOR SELECT
  USING (client_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins have full access to projects"
  ON public.projects FOR ALL
  USING (public.is_admin());

-- Project Milestones: Inherit view rights from projects
CREATE POLICY "Milestones viewable by project client and admins"
  ON public.project_milestones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_milestones.project_id
      AND (projects.client_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Admins have full access to project milestones"
  ON public.project_milestones FOR ALL
  USING (public.is_admin());

-- Documents Billing: Clients view their own invoices/quotes; Admins manage all
CREATE POLICY "Clients view own billing documents"
  ON public.documents_billing FOR SELECT
  USING (client_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins manage billing documents"
  ON public.documents_billing FOR ALL
  USING (public.is_admin());

-- Project Requests: Clients create and view their own; Admins manage all
CREATE POLICY "Clients create project requests"
  ON public.project_requests FOR INSERT
  WITH CHECK (client_id = auth.uid() OR public.is_admin());

CREATE POLICY "Clients view own project requests"
  ON public.project_requests FOR SELECT
  USING (client_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins manage all project requests"
  ON public.project_requests FOR ALL
  USING (public.is_admin());

-- Meeting Requests: Clients book and view their own; Admins manage all
CREATE POLICY "Clients create meeting requests"
  ON public.meeting_requests FOR INSERT
  WITH CHECK (client_id = auth.uid() OR public.is_admin());

CREATE POLICY "Clients view own meeting requests"
  ON public.meeting_requests FOR SELECT
  USING (client_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins manage all meeting requests"
  ON public.meeting_requests FOR ALL
  USING (public.is_admin());

-- Customer Reviews: Publicly readable if featured; Admins manage all
CREATE POLICY "Featured reviews viewable by everyone"
  ON public.customer_reviews FOR SELECT
  USING (is_featured = true OR public.is_admin());

CREATE POLICY "Admins manage all customer reviews"
  ON public.customer_reviews FOR ALL
  USING (public.is_admin());

-- Blog Posts: Publicly readable if published; Admins manage all
CREATE POLICY "Published blogs viewable by everyone"
  ON public.blog_posts FOR SELECT
  USING (is_published = true OR public.is_admin());

CREATE POLICY "Admins manage all blog posts"
  ON public.blog_posts FOR ALL
  USING (public.is_admin());

-- ====================================================================
-- SEED DATA (Demonstration Data for Development & Testing)
-- ====================================================================

-- Strategic Partners
INSERT INTO public.partners (name, category, logo_url, website_url, description) VALUES
('AWS Cloud Architecture', 'Cloud Infrastructure', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=120&auto=format&fit=crop&q=80', 'https://aws.amazon.com', 'High-throughput container clusters & multi-region failover'),
('Java Institute for Advanced Technology', 'Academic & Research', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=120&auto=format&fit=crop&q=80', 'https://javainstitute.edu.lk', 'Advanced Software Engineering research & academic collaboration'),
('Redis Enterprise', 'Fintech & Security', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80', 'https://redis.io', 'Distributed mutex locks (Redlock) and sub-millisecond session pools'),
('Birmingham City University, UK', 'Academic & Research', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=120&auto=format&fit=crop&q=80', 'https://bcu.ac.uk', 'International software engineering curriculum alignment')
ON CONFLICT DO NOTHING;

-- Initial Customer Reviews
INSERT INTO public.customer_reviews (client_name, client_title, company_name, rating, review_text, is_featured) VALUES
('Marcus Vance', 'VP of Global Operations', 'ShadowTopup Global', 5, 'Monolith LK transformed our fulfillment architecture. Sub-second API dispatches and zero double-claim errors across 50,000+ live transactions.', true),
('Dr. H. Jayasuriya', 'Chief Medical Director', 'Clinical Pharmacy OS', 5, 'The zero-leak prescription and batch-tracking system completely eliminated drug expiry waste across all teaching hospitals. Uncompromising precision.', true),
('Damian Cruz', 'Managing Director', 'The Menu Enterprise', 5, 'Real-time WebSocket kitchen display systems with zero reload latency. The Haute Editorial styling gave our brand the premium prestige we required.', true)
ON CONFLICT DO NOTHING;
