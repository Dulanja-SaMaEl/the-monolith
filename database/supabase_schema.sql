-- ====================================================================
-- MONOLITH LK DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- Enterprise Portal & Studio OS Schema with Grants, RLS, and Seed Data
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
  is_blocked BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Partners Table (Academic, Cloud & Enterprise Strategic Partners)
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
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
  production_url TEXT,
  figma_url TEXT,
  api_docs_url TEXT,
  domain_renewal_date DATE,
  server_expiry_date DATE,
  vault_notes TEXT,
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

-- 5. Invoices & Quotations Table (Default Currency: LKR)
CREATE TABLE IF NOT EXISTS public.documents_billing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_number TEXT UNIQUE NOT NULL,
  type TEXT CHECK (type IN ('quotation', 'invoice')) NOT NULL,
  client_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('draft', 'sent', 'approved', 'paid', 'overdue')) DEFAULT 'draft',
  currency TEXT DEFAULT 'LKR',
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0,
  tax NUMERIC(14, 2) DEFAULT 0,
  total NUMERIC(14, 2) NOT NULL DEFAULT 0,
  due_date DATE,
  notes TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure existing installs also update default currency to LKR
ALTER TABLE public.documents_billing ALTER COLUMN currency SET DEFAULT 'LKR';

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

-- 10. Public Contact Inquiries (Submitted from /contact -> Triaged by Admin)
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  service_need TEXT NOT NULL,
  budget_tier TEXT,
  brief TEXT NOT NULL,
  status TEXT CHECK (status IN ('new', 'contacted', 'converted', 'archived')) DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Executive Daily Tasks & Sprints (For Dulanja & Remashi)
CREATE TABLE IF NOT EXISTS public.executive_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  assignee TEXT NOT NULL DEFAULT 'Dulanja Abeysinghe',
  category TEXT DEFAULT 'Architecture',
  priority TEXT CHECK (priority IN ('urgent', 'high', 'normal')) DEFAULT 'normal',
  task_date DATE DEFAULT CURRENT_DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Project Payment Plans & Packages (Per-Project Billing Progress: One-Time, Monthly, Installment)
CREATE TABLE IF NOT EXISTS public.project_payment_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  package_name TEXT NOT NULL,
  billing_type TEXT CHECK (billing_type IN ('one_time', 'monthly', 'installment')) NOT NULL DEFAULT 'one_time',
  currency TEXT DEFAULT 'LKR',
  total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  installment_amount NUMERIC(14, 2) DEFAULT 0,
  total_months INTEGER DEFAULT 1,
  start_date DATE DEFAULT CURRENT_DATE,
  next_due_date DATE,
  status TEXT CHECK (status IN ('active', 'completed', 'overdue', 'paused')) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Payment Records (Past Payments Ledger linked to Payment Plans & Invoices)
CREATE TABLE IF NOT EXISTS public.payment_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_plan_id UUID REFERENCES public.project_payment_plans(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES public.documents_billing(id) ON DELETE SET NULL,
  amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'LKR',
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT DEFAULT 'Bank Transfer / CEFTS',
  reference_number TEXT,
  billing_scope TEXT CHECK (billing_scope IN ('project_cover', 'separate')) DEFAULT 'project_cover',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- SAFE COLUMN MIGRATIONS (Upgrades pre-existing tables cleanly)
-- ====================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.partners
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Enterprise',
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS code_name TEXT,
  ADD COLUMN IF NOT EXISTS repository_or_demo_url TEXT,
  ADD COLUMN IF NOT EXISTS staging_url TEXT,
  ADD COLUMN IF NOT EXISTS production_url TEXT,
  ADD COLUMN IF NOT EXISTS figma_url TEXT,
  ADD COLUMN IF NOT EXISTS api_docs_url TEXT,
  ADD COLUMN IF NOT EXISTS domain_renewal_date DATE,
  ADD COLUMN IF NOT EXISTS server_expiry_date DATE,
  ADD COLUMN IF NOT EXISTS vault_notes TEXT,
  ADD COLUMN IF NOT EXISTS target_launch_date DATE,
  ADD COLUMN IF NOT EXISTS summary TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.project_milestones
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS due_date DATE,
  ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

ALTER TABLE public.documents_billing
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS payment_plan_id UUID REFERENCES public.project_payment_plans(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS billing_scope TEXT DEFAULT 'separate',
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'LKR',
  ADD COLUMN IF NOT EXISTS tax NUMERIC(14, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS due_date DATE,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS pdf_url TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.project_requests
  ADD COLUMN IF NOT EXISTS estimated_budget TEXT,
  ADD COLUMN IF NOT EXISTS target_timeline TEXT,
  ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.meeting_requests
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Colombo (UTC+5:30)',
  ADD COLUMN IF NOT EXISTS meeting_type TEXT DEFAULT 'Architecture Consultation',
  ADD COLUMN IF NOT EXISTS meeting_link TEXT;

ALTER TABLE public.customer_reviews
  ADD COLUMN IF NOT EXISTS client_avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT TRUE;

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'Monolith LK Editorial',
  ADD COLUMN IF NOT EXISTS read_time TEXT DEFAULT '5 min read',
  ADD COLUMN IF NOT EXISTS cover_image TEXT,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;

ALTER TABLE public.contact_inquiries
  ADD COLUMN IF NOT EXISTS company TEXT,
  ADD COLUMN IF NOT EXISTS budget_tier TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';

-- ====================================================================
-- SCHEMA & ROLE PERMISSIONS (Fixes 42501 permission denied errors)
-- ====================================================================

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON public.partners, public.customer_reviews, public.blog_posts TO anon;
GRANT INSERT ON public.contact_inquiries TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO postgres, anon, authenticated, service_role;

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
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

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

-- Auto-create profile row when a new Supabase Auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, company_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Public Profiles Policies
DROP POLICY IF EXISTS "Profiles are viewable by user and admins" ON public.profiles;
CREATE POLICY "Profiles are viewable by user and admins"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update their own profile; admins can update all" ON public.profiles;
CREATE POLICY "Users can update their own profile; admins can update all"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.is_admin());

-- Partners Policies
DROP POLICY IF EXISTS "Partners are viewable by everyone" ON public.partners;
CREATE POLICY "Partners are viewable by everyone"
  ON public.partners FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins have full access to partners" ON public.partners;
CREATE POLICY "Admins have full access to partners"
  ON public.partners FOR ALL
  USING (public.is_admin());

-- Projects Policies
DROP POLICY IF EXISTS "Clients can view their own projects" ON public.projects;
CREATE POLICY "Clients can view their own projects"
  ON public.projects FOR SELECT
  USING (client_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to projects" ON public.projects;
CREATE POLICY "Admins have full access to projects"
  ON public.projects FOR ALL
  USING (public.is_admin());

-- Project Milestones Policies
DROP POLICY IF EXISTS "Milestones viewable by project client and admins" ON public.project_milestones;
CREATE POLICY "Milestones viewable by project client and admins"
  ON public.project_milestones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_milestones.project_id
      AND (projects.client_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Admins have full access to project milestones" ON public.project_milestones;
CREATE POLICY "Admins have full access to project milestones"
  ON public.project_milestones FOR ALL
  USING (public.is_admin());

-- Documents Billing Policies
DROP POLICY IF EXISTS "Clients view own billing documents" ON public.documents_billing;
CREATE POLICY "Clients view own billing documents"
  ON public.documents_billing FOR SELECT
  USING (client_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage billing documents" ON public.documents_billing;
CREATE POLICY "Admins manage billing documents"
  ON public.documents_billing FOR ALL
  USING (public.is_admin());

-- Project Requests Policies
DROP POLICY IF EXISTS "Clients create project requests" ON public.project_requests;
CREATE POLICY "Clients create project requests"
  ON public.project_requests FOR INSERT
  WITH CHECK (client_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Clients view own project requests" ON public.project_requests;
CREATE POLICY "Clients view own project requests"
  ON public.project_requests FOR SELECT
  USING (client_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage all project requests" ON public.project_requests;
CREATE POLICY "Admins manage all project requests"
  ON public.project_requests FOR ALL
  USING (public.is_admin());

-- Meeting Requests Policies
DROP POLICY IF EXISTS "Clients create meeting requests" ON public.meeting_requests;
CREATE POLICY "Clients create meeting requests"
  ON public.meeting_requests FOR INSERT
  WITH CHECK (client_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Clients view own meeting requests" ON public.meeting_requests;
CREATE POLICY "Clients view own meeting requests"
  ON public.meeting_requests FOR SELECT
  USING (client_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage all meeting requests" ON public.meeting_requests;
CREATE POLICY "Admins manage all meeting requests"
  ON public.meeting_requests FOR ALL
  USING (public.is_admin());

-- Customer Reviews Policies
DROP POLICY IF EXISTS "Featured reviews viewable by everyone" ON public.customer_reviews;
CREATE POLICY "Featured reviews viewable by everyone"
  ON public.customer_reviews FOR SELECT
  USING (is_featured = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage all customer reviews" ON public.customer_reviews;
CREATE POLICY "Admins manage all customer reviews"
  ON public.customer_reviews FOR ALL
  USING (public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can submit customer reviews" ON public.customer_reviews;
CREATE POLICY "Authenticated users can submit customer reviews"
  ON public.customer_reviews FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Executive Tasks Policies (Dulanja & Remashi)
DROP POLICY IF EXISTS "Admins manage executive tasks" ON public.executive_tasks;
CREATE POLICY "Admins manage executive tasks"
  ON public.executive_tasks FOR ALL
  USING (public.is_admin());

-- Blog Posts Policies
DROP POLICY IF EXISTS "Published blogs viewable by everyone" ON public.blog_posts;
CREATE POLICY "Published blogs viewable by everyone"
  ON public.blog_posts FOR SELECT
  USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage all blog posts" ON public.blog_posts;
CREATE POLICY "Admins manage all blog posts"
  ON public.blog_posts FOR ALL
  USING (public.is_admin());

-- Contact Inquiries Policies
DROP POLICY IF EXISTS "Anyone can submit contact inquiry" ON public.contact_inquiries;
CREATE POLICY "Anyone can submit contact inquiry"
  ON public.contact_inquiries FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins manage contact inquiries" ON public.contact_inquiries;
CREATE POLICY "Admins manage contact inquiries"
  ON public.contact_inquiries FOR ALL
  USING (public.is_admin());

-- Project Payment Plans Policies
DROP POLICY IF EXISTS "Clients view own payment plans" ON public.project_payment_plans;
CREATE POLICY "Clients view own payment plans"
  ON public.project_payment_plans FOR SELECT
  USING (client_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage all payment plans" ON public.project_payment_plans;
CREATE POLICY "Admins manage all payment plans"
  ON public.project_payment_plans FOR ALL
  USING (public.is_admin());

-- Payment Records Policies
DROP POLICY IF EXISTS "Clients view own payment records" ON public.payment_records;
CREATE POLICY "Clients view own payment records"
  ON public.payment_records FOR SELECT
  USING (client_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage all payment records" ON public.payment_records;
CREATE POLICY "Admins manage all payment records"
  ON public.payment_records FOR ALL
  USING (public.is_admin());
