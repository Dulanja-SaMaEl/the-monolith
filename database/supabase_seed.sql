-- ====================================================================
-- MONOLITH LK — PRODUCTION SEED DATA (LKR CURRENCY)
-- Run AFTER database/supabase_schema.sql in Supabase SQL Editor.
-- All amounts are in LKR (Sri Lankan Rupees).
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Defensive Schema Upgrades: ensure any missing columns exist on existing tables
ALTER TABLE IF EXISTS public.partners ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE IF EXISTS public.partners ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Enterprise';
ALTER TABLE IF EXISTS public.partners ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE IF EXISTS public.partners ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE IF EXISTS public.partners ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE IF EXISTS public.partners ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

ALTER TABLE IF EXISTS public.customer_reviews ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE IF EXISTS public.customer_reviews ADD COLUMN IF NOT EXISTS client_title TEXT;
ALTER TABLE IF EXISTS public.customer_reviews ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE IF EXISTS public.customer_reviews ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 5;
ALTER TABLE IF EXISTS public.customer_reviews ADD COLUMN IF NOT EXISTS review_text TEXT;
ALTER TABLE IF EXISTS public.customer_reviews ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT TRUE;

ALTER TABLE IF EXISTS public.blog_posts ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE IF EXISTS public.blog_posts ADD COLUMN IF NOT EXISTS read_time TEXT;
ALTER TABLE IF EXISTS public.blog_posts ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;

ALTER TABLE IF EXISTS public.invoices ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE IF EXISTS public.quotations ADD COLUMN IF NOT EXISTS client_name TEXT;

ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

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

ALTER TABLE IF EXISTS public.documents_billing ADD COLUMN IF NOT EXISTS payment_plan_id UUID REFERENCES public.project_payment_plans(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.documents_billing ADD COLUMN IF NOT EXISTS billing_scope TEXT DEFAULT 'separate';

ALTER TABLE IF EXISTS public.projects ADD COLUMN IF NOT EXISTS production_url TEXT;
ALTER TABLE IF EXISTS public.projects ADD COLUMN IF NOT EXISTS figma_url TEXT;
ALTER TABLE IF EXISTS public.projects ADD COLUMN IF NOT EXISTS api_docs_url TEXT;
ALTER TABLE IF EXISTS public.projects ADD COLUMN IF NOT EXISTS domain_renewal_date DATE;
ALTER TABLE IF EXISTS public.projects ADD COLUMN IF NOT EXISTS server_expiry_date DATE;
ALTER TABLE IF EXISTS public.projects ADD COLUMN IF NOT EXISTS vault_notes TEXT;

-- 1. Seed Auth Accounts & Profiles (Founder Admin + 3 Enterprise Clients)
DO $$
DECLARE
  v_admin_id UUID := '11111111-1111-4111-8111-111111111101';
  v_client_shadow_id UUID := '22222222-2222-4222-8222-222222222201';
  v_client_pharmacy_id UUID := '22222222-2222-4222-8222-222222222202';
  v_client_glaciar_id UUID := '22222222-2222-4222-8222-222222222203';
  v_proj_shadow UUID := '33333333-3333-4333-8333-333333333301';
  v_proj_pharmacy UUID := '33333333-3333-4333-8333-333333333302';
  v_proj_glaciar UUID := '33333333-3333-4333-8333-333333333303';
BEGIN
  -- Create Auth Users if they do not exist (explicit empty strings prevent GoTrue NULL scan errors)
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, confirmation_token, recovery_token,
    email_change_token_new, email_change, email_change_token_current,
    phone_change, phone_change_token, reauthentication_token,
    is_sso_user, is_anonymous,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  )
  VALUES
    (
      v_admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'admin@monolith.lk', crypt('MonolithAdmin2026!', gen_salt('bf')),
      NOW(), '', '', '', '', '', '', '', '', FALSE, FALSE,
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Dulanja Abeysinghe","company_name":"Monolith LK","role":"admin"}',
      NOW(), NOW()
    ),
    (
      v_client_shadow_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'client@shadowtopup.com', crypt('ShadowClient2026!', gen_salt('bf')),
      NOW(), '', '', '', '', '', '', '', '', FALSE, FALSE,
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Marcus Vance","company_name":"ShadowTopup Global","role":"client"}',
      NOW(), NOW()
    ),
    (
      v_client_pharmacy_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'director@pharmacyos.lk', crypt('PharmacyClient2026!', gen_salt('bf')),
      NOW(), '', '', '', '', '', '', '', '', FALSE, FALSE,
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Dr. H. Jayasuriya","company_name":"Teaching Hospitals Pharmacy OS","role":"client"}',
      NOW(), NOW()
    ),
    (
      v_client_glaciar_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'ops@glaciarwater.lk', crypt('GlaciarClient2026!', gen_salt('bf')),
      NOW(), '', '', '', '', '', '', '', '', FALSE, FALSE,
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Kasun Perera","company_name":"Glaciar Water Bottling & Distribution","role":"client"}',
      NOW(), NOW()
    )
  ON CONFLICT (id) DO NOTHING;

  -- Repair any existing SQL-inserted auth.users rows that had NULL token columns
  UPDATE auth.users
  SET
    confirmation_token = COALESCE(confirmation_token, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, ''),
    email_change = COALESCE(email_change, ''),
    email_change_token_current = COALESCE(email_change_token_current, ''),
    phone_change = COALESCE(phone_change, ''),
    phone_change_token = COALESCE(phone_change_token, ''),
    reauthentication_token = COALESCE(reauthentication_token, ''),
    is_sso_user = COALESCE(is_sso_user, FALSE),
    is_anonymous = COALESCE(is_anonymous, FALSE)
  WHERE email IN ('admin@monolith.lk', 'client@shadowtopup.com', 'director@pharmacyos.lk', 'ops@glaciarwater.lk');

  -- Ensure GoTrue email identities exist for SQL-seeded auth users
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  SELECT
    u.id, u.id, u.email,
    jsonb_build_object('sub', u.id::text, 'email', u.email),
    'email', NOW(), NOW(), NOW()
  FROM auth.users u
  WHERE u.id IN (v_admin_id, v_client_shadow_id, v_client_pharmacy_id, v_client_glaciar_id)
  ON CONFLICT DO NOTHING;

  -- Profiles (updated cleanly in case trigger ran)
  INSERT INTO public.profiles (id, email, full_name, role, company_name, phone)
  VALUES
    (v_admin_id, 'admin@monolith.lk', 'Dulanja Abeysinghe', 'admin', 'Monolith LK', '+94 76 591 7189'),
    (v_client_shadow_id, 'client@shadowtopup.com', 'Marcus Vance', 'client', 'ShadowTopup Global', '+94 77 450 8821'),
    (v_client_pharmacy_id, 'director@pharmacyos.lk', 'Dr. H. Jayasuriya', 'client', 'Teaching Hospitals Pharmacy OS', '+94 81 223 4567'),
    (v_client_glaciar_id, 'ops@glaciarwater.lk', 'Kasun Perera', 'client', 'Glaciar Water Bottling & Distribution', '+94 71 890 3312')
  ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    company_name = EXCLUDED.company_name,
    phone = EXCLUDED.phone;

  -- 2. Projects
  INSERT INTO public.projects (id, client_id, title, code_name, category, status, progress_percentage, staging_url, repository_or_demo_url, target_launch_date, summary)
  VALUES
    (
      v_proj_shadow, v_client_shadow_id,
      'ShadowTopup Engine (Fintech & Gaming API)', 'PRJ-SHADOW-01',
      'Fintech & Gaming API', 'in_progress', 85,
      'https://staging.shadowtopup.com', 'https://github.com/Dulanja-SaMaEl',
      '2026-12-15',
      'Automated digital gaming currency fulfillment platform connecting Next.js 14 and Laravel microservices with sub-second dispatching and Redis Redlock idempotency.'
    ),
    (
      v_proj_pharmacy, v_client_pharmacy_id,
      'Clinical Pharmacy OS', 'PRJ-CLINICAL-02',
      'Healthcare & Compliance', 'deployed', 100,
      'https://pharmacy.monolith.lk', 'https://github.com/Dulanja-SaMaEl',
      '2026-11-01',
      'Medical dispensary management system handling prescription auditing, real-time batch/expiry tracking, drug interaction guardrails, and hardware barcode scanning.'
    ),
    (
      v_proj_glaciar, v_client_glaciar_id,
      'Glaciar Water Logistics & Enterprise ERP', 'PRJ-GLACIAR-03',
      'Supply Chain & Logistics ERP', 'qa_testing', 72,
      'https://erp.glaciarwater.lk', NULL,
      '2027-01-15',
      'Resource management platform governing raw material procurement, automated batch bottling quotas, delivery fleet routing, and distributor ledger reconciliation.'
    )
  ON CONFLICT (code_name) DO NOTHING;

  -- 3. Project Milestones
  INSERT INTO public.project_milestones (project_id, title, description, due_date, is_completed, order_index)
  VALUES
    (v_proj_shadow, 'Architecture Blueprint & Garena API Bridge', 'Schema lock and player validation microservice', '2026-10-01', true, 1),
    (v_proj_shadow, 'Webhook Idempotency & Redis Redlock Mutex Locks', 'Zero-loss double-claim guardrails', '2026-10-25', true, 2),
    (v_proj_shadow, 'High-Frequency Load Stress Testing (50K+ Tx)', 'Sub-850ms dispatch benchmark validation', '2026-11-15', true, 3),
    (v_proj_shadow, 'Multi-Region Failover Cutover', 'Production DNS & zero-downtime switchover', '2026-12-10', false, 4),
    (v_proj_pharmacy, 'LIS Clinical Driver Bridging (C/C++)', 'ACL TOP & AU 480 clinical lab integration', '2026-08-01', true, 1),
    (v_proj_pharmacy, 'ACID Multi-Tier Inventory & Batch Expiry Ledger', 'Zero-discrepancy pharmaceutical billing', '2026-09-10', true, 2),
    (v_proj_pharmacy, 'Teaching Hospital On-Site Rollout', 'Peradeniya, Ragama & Kurunegala deployment', '2026-10-15', true, 3),
    (v_proj_glaciar, 'Depot Inventory & Fleet Telemetry Schema', 'PostgreSQL ACID multi-warehouse tables', '2026-10-20', true, 1),
    (v_proj_glaciar, 'Distributor Credit Control & Auto-Invoicing', 'LKR tax ledger & aging engine', '2026-11-28', true, 2),
    (v_proj_glaciar, 'Mobile Driver Proof-of-Delivery Sync', 'Offline-first PWA dispatcher', '2027-01-05', false, 3)
  ON CONFLICT DO NOTHING;

  -- 4. Invoices & Quotations (All in LKR)
  INSERT INTO public.documents_billing (document_number, type, client_id, project_id, status, currency, line_items, subtotal, tax, total, due_date, notes)
  VALUES
    (
      'INV-2026-104', 'invoice', v_client_shadow_id, v_proj_shadow, 'paid', 'LKR',
      '[{"id":"li-1","description":"Phase 02: Redis Redlock Mutex & Idempotent Webhook Pipeline","quantity":1,"unit_price":1150000,"total":1150000},{"id":"li-2","description":"Sub-Second Garena Dispatch Microservices","quantity":1,"unit_price":700000,"total":700000}]'::jsonb,
      1850000, 0, 1850000, '2026-11-05',
      'Settled via Commercial Bank Sri Lanka Corporate Wire Transfer.'
    ),
    (
      'QUO-2026-088', 'quotation', v_client_shadow_id, v_proj_shadow, 'sent', 'LKR',
      '[{"id":"li-3","description":"Zero-Downtime Multi-Region Failover Architecture","quantity":1,"unit_price":1350000,"total":1350000},{"id":"li-4","description":"Dedicated 24/7 SLA Telemetry & Emergency Triage (6 Months)","quantity":6,"unit_price":225000,"total":1350000}]'::jsonb,
      2700000, 0, 2700000, '2026-12-01',
      'Valid for 30 business days from date of issue. Quoted in LKR.'
    ),
    (
      'INV-2026-112', 'invoice', v_client_pharmacy_id, v_proj_pharmacy, 'paid', 'LKR',
      '[{"id":"li-5","description":"Clinical Pharmacy OS Multi-Station Licensing & Barcode Integration","quantity":1,"unit_price":950000,"total":950000}]'::jsonb,
      950000, 0, 950000, '2026-10-30',
      'Paid in full upon teaching hospital signoff.'
    ),
    (
      'QUO-2026-095', 'quotation', v_client_glaciar_id, v_proj_glaciar, 'approved', 'LKR',
      '[{"id":"li-6","description":"Glaciar Enterprise ERP & Fleet Routing Engine (Phase 03)","quantity":1,"unit_price":1450000,"total":1450000}]'::jsonb,
      1450000, 0, 1450000, '2026-12-20',
      'Approved by executive leadership; milestone billing in LKR.'
    )
  ON CONFLICT (document_number) DO NOTHING;

  -- 5. Client Project Requests (LKR Budgets)
  INSERT INTO public.project_requests (client_id, project_title, service_category, estimated_budget, target_timeline, project_scope, status)
  VALUES
    (
      v_client_shadow_id,
      'Automated Wallet & LKR Settlement Ramp Microservice',
      'Custom Software Engineering',
      'LKR 2,500,000 – 4,000,000',
      'Q1 2027',
      'Require sub-second multi-gateway Sri Lankan LKR & international wallet reconciliation with JA3/JA4 TLS anti-fraud checks.',
      'under_estimation'
    ),
    (
      v_client_glaciar_id,
      'AI Predictive Fleet Demand & Bottling Forecast Module',
      'AI, Data, & Machine Learning',
      'LKR 1,200,000 – 2,000,000',
      'Q2 2027',
      'Integrate regional weather and distributor historical orders to forecast 19L bottle dispatch inventory.',
      'pending_review'
    )
  ON CONFLICT DO NOTHING;

  -- 6. Meeting Requests
  INSERT INTO public.meeting_requests (client_id, requested_date, requested_time, timezone, meeting_type, agenda, meeting_link, status)
  VALUES
    (
      v_client_shadow_id,
      '2026-11-25', '15:30', 'Asia/Colombo (UTC+5:30)', 'Sprint Review',
      'Reviewing throughput metrics on the 50K API load test and signing off on production cutover schedule.',
      'https://meet.google.com/monolith-shadow-sprint',
      'confirmed'
    ),
    (
      v_client_glaciar_id,
      '2026-11-28', '10:00', 'Asia/Colombo (UTC+5:30)', 'Architecture Consultation',
      'Finalizing distributor credit limits and automated LKR VAT invoice generation rules.',
      NULL,
      'pending'
    )
  ON CONFLICT DO NOTHING;
END $$;

-- 7. Strategic Partners (Featured on Live Homepage)
INSERT INTO public.partners (name, category, logo_url, website_url, description, is_active)
VALUES
  ('Italic Systems', 'Design Systems & UI/UX', '/assets/partner-1.png', 'https://italic.com', 'High-craft design systems and Haute Editorial typography standards', true),
  ('Theo Architecture', 'Enterprise Architecture', '/assets/partner-2.png', 'https://theo.com', 'Mission-critical distributed infrastructure and micro-tier orchestration', true),
  ('Hues Cloud Platform', 'Cloud Infrastructure', '/assets/partner-3.png', 'https://hues.com', 'Zero-downtime container clusters and multi-region event pipelines', true),
  ('Beauty Basket Global', 'E-Commerce & Retail', '/client-logo-1.webp', 'https://beautybasket.lk', 'Omnichannel retail inventory and sub-second checkout pipelines', true),
  ('Holistica Herbal OS', 'Healthcare & Clinical', '/client-logo-2.webp', 'https://holistica.lk', 'Clinical batch verification and pharmaceutical tracking systems', true),
  ('Apex Global Security', 'Fintech & Security', '/assets/partner-4.png', 'https://apex.com', 'Distributed Redis mutex locking and fraud prevention engines', true),
  ('Sphere Tech Labs', 'AI & Machine Learning', '/assets/partner-5.png', 'https://sphere.com', 'Custom vector RAG pipelines and automated LLM triage nodes', true)
ON CONFLICT DO NOTHING;

-- 8. Customer Reviews (Featured on Live Homepage)
INSERT INTO public.customer_reviews (client_name, client_title, company_name, rating, review_text, is_featured)
VALUES
  ('Marcus Vance', 'VP of Global Operations', 'ShadowTopup Global', 5, 'Monolith LK transformed our fulfillment architecture. Sub-second API dispatches and zero double-claim errors across 50,000+ live transactions.', true),
  ('Dr. H. Jayasuriya', 'Chief Medical Director', 'Clinical Pharmacy OS', 5, 'The zero-leak prescription and batch-tracking system completely eliminated drug expiry waste across all teaching hospitals. Uncompromising precision.', true),
  ('Damian Cruz', 'Managing Director', 'The Menu Enterprise', 5, 'Real-time WebSocket kitchen display systems with zero reload latency. The Haute Editorial styling gave our brand the prestige we required.', true),
  ('Kasun Perera', 'Operations Director', 'Glaciar Water Logistics', 5, 'Our multi-depot inventory and automated LKR billing went from manual spreadsheets to deterministic real-time control.', true)
ON CONFLICT DO NOTHING;

-- 9. News / Blog Posts (Displayed on Live Homepage & /blog)
INSERT INTO public.blog_posts (slug, title, category, author, read_time, cover_image, excerpt, content_markdown, is_published)
VALUES
  (
    'distributed-redis-mutex-zero-loss',
    'Distributed Redis Mutex & Zero-Loss Ledger Locks at Scale',
    'Architecture',
    'Dulanja Abeysinghe',
    '6 min read',
    '/assets/blog-1.jpg',
    'How we engineered sub-second idempotent transaction pipelines handling 50K+ live requests with zero duplicate fulfillments.',
    E'When operating high-frequency gaming fulfillment and fintech bridges, race conditions are the number one failure point. A client double-clicking a payout or a transient network retry can easily result in duplicate disbursements.\n\nIn this deep dive, we explore how Monolith LK implements Redlock distributed mutexes across Redis clusters with TTL guards, ensuring absolute idempotency even under chaotic peak loads.',
    true
  ),
  (
    'haute-editorial-digital-spaces',
    'Haute Editorial: Bringing Tactile Print Restraint to High-Performance Web',
    'Design Strategy',
    'Remashi Diyana',
    '4 min read',
    '/assets/blog-2.jpg',
    'Why enterprise interfaces must transcend generic templates in favor of structured typography and architectural hairline precision.',
    E'Modern web interfaces have largely collapsed into generic tropes: rounded colorful blobs, unstyled cards, and noisy micro-interactions.\n\nHaute Editorial rejects the noise. By applying an 8pt architectural grid, warm monochromatic hues, and calculated typography inspired by high fashion print periodicals, we create software that feels authoritative and enduring.',
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- 10. Sample Public Contact Inquiry
INSERT INTO public.contact_inquiries (name, email, company, service_need, budget_tier, brief, status)
VALUES
  (
    'Nimali Fernando',
    'nimali@ceylonlogistics.lk',
    'Ceylon Express Logistics',
    'Custom Software Engineering',
    'LKR 750,000 – 2,000,000',
    'Looking to modernize our legacy dispatch portal into a real-time multi-station web platform with automated LKR invoicing.',
    'new'
  )
ON CONFLICT DO NOTHING;

-- 11. Initial Executive Tasks (Dulanja Abeysinghe & Remashi Diyana)
INSERT INTO public.executive_tasks (title, assignee, category, priority, task_date, is_completed, notes)
VALUES
  ('Review ShadowTopup high-concurrency Redis mutex stress tests', 'Dulanja Abeysinghe', 'Architecture', 'urgent', CURRENT_DATE, false, 'Verify zero double-claim locks during 50,000 throughput test.'),
  ('Audit Haute Editorial component tokens & responsive breakpoints', 'Remashi Diyana', 'UI/UX Design', 'high', CURRENT_DATE, false, 'Verify mobile 8pt spatial grid adherence on all viewport widths.'),
  ('Finalize Teaching Hospitals Pharmacy OS cold-storage deployment brief', 'Both (Dulanja & Remashi)', 'Operations', 'high', CURRENT_DATE, false, 'Coordinate with Dr. Jayasuriya on regional hardware cutover schedule.'),
  ('Verify LKR VAT invoice calculation engine with CEFTS narrative routing', 'Dulanja Abeysinghe', 'Infrastructure', 'normal', CURRENT_DATE, false, 'Check automatic invoice PDF generator formatting.'),
  ('Review new inbound project commission inquiries from Ceylon Logistics', 'Remashi Diyana', 'Operations', 'normal', CURRENT_DATE, false, 'Prepare formal quotation scope document.')
ON CONFLICT DO NOTHING;
