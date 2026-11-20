import dotenv from 'dotenv';
import { supabaseAdmin, isBackendSupabaseConfigured } from './services/supabase';

dotenv.config();

async function ensureAuthUser(
  email: string,
  password: string,
  meta: { full_name: string; company_name: string; role: 'admin' | 'client'; phone?: string }
): Promise<string> {
  const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
  const existing = listData?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  let userId: string;
  if (existing) {
    userId = existing.id;
  } else {
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: meta.full_name,
        company_name: meta.company_name,
        role: meta.role,
      },
    });
    if (error || !created.user) {
      throw new Error(`Failed to create user ${email}: ${error?.message}`);
    }
    userId = created.user.id;
  }

  const { error: profError } = await supabaseAdmin.from('profiles').upsert({
    id: userId,
    email,
    full_name: meta.full_name,
    company_name: meta.company_name,
    role: meta.role,
    phone: meta.phone || null,
  });

  if (profError) {
    throw new Error(`Failed to upsert profile for ${email}: ${profError.message}`);
  }

  return userId;
}

async function runSeed() {
  if (!isBackendSupabaseConfigured) {
    console.error('❌ SUPABASE_URL or SUPABASE_SECRET_KEY is not configured in backend/.env');
    process.exit(1);
  }

  console.log('⚡ Starting Monolith LK Supabase Production Seed (LKR)...');

  // 1. Auth Users & Profiles
  const adminId = await ensureAuthUser('admin@monolith.lk', 'MonolithAdmin2026!', {
    full_name: 'Dulanja Abeysinghe',
    company_name: 'Monolith LK',
    role: 'admin',
    phone: '+94 76 591 7189',
  });

  const shadowClientId = await ensureAuthUser('client@shadowtopup.com', 'ShadowClient2026!', {
    full_name: 'Marcus Vance',
    company_name: 'ShadowTopup Global',
    role: 'client',
    phone: '+94 77 450 8821',
  });

  const pharmacyClientId = await ensureAuthUser('director@pharmacyos.lk', 'PharmacyClient2026!', {
    full_name: 'Dr. H. Jayasuriya',
    company_name: 'Teaching Hospitals Pharmacy OS',
    role: 'client',
    phone: '+94 81 223 4567',
  });

  const glaciarClientId = await ensureAuthUser('ops@glaciarwater.lk', 'GlaciarClient2026!', {
    full_name: 'Kasun Perera',
    company_name: 'Glaciar Water Bottling & Distribution',
    role: 'client',
    phone: '+94 71 890 3312',
  });

  console.log('✓ Auth users ready:', { adminId, shadowClientId, pharmacyClientId, glaciarClientId });

  // 2. Strategic Partners
  const { count: partnerCount } = await supabaseAdmin.from('partners').select('*', { count: 'exact', head: true });
  if (!partnerCount) {
    await supabaseAdmin.from('partners').insert([
      {
        name: 'AWS Cloud Architecture',
        category: 'Cloud Infrastructure',
        logo_url: '/assets/partner-1.png',
        website_url: 'https://aws.amazon.com',
        description: 'High-throughput container clusters & multi-region failover',
        is_active: true,
      },
      {
        name: 'Java Institute for Advanced Technology',
        category: 'Academic & Research',
        logo_url: '/assets/partner-2.png',
        website_url: 'https://javainstitute.edu.lk',
        description: 'Advanced Software Engineering research & academic collaboration',
        is_active: true,
      },
      {
        name: 'Redis Enterprise',
        category: 'Fintech & Security',
        logo_url: '/assets/partner-3.png',
        website_url: 'https://redis.io',
        description: 'Distributed mutex locks (Redlock) and sub-millisecond session pools',
        is_active: true,
      },
      {
        name: 'Birmingham City University, UK',
        category: 'Academic & Research',
        logo_url: '/assets/partner-4.png',
        website_url: 'https://bcu.ac.uk',
        description: 'International software engineering curriculum alignment',
        is_active: true,
      },
    ]);
    console.log('✓ Partners seeded');
  }

  // 3. Projects & Milestones
  const projectSeeds = [
    {
      client_id: shadowClientId,
      title: 'ShadowTopup Engine (Fintech & Gaming API)',
      code_name: 'PRJ-SHADOW-01',
      category: 'Fintech & Gaming API',
      status: 'in_progress',
      progress_percentage: 85,
      staging_url: 'https://staging.shadowtopup.com',
      repository_or_demo_url: 'https://github.com/Dulanja-SaMaEl',
      target_launch_date: '2026-12-15',
      summary:
        'Automated digital gaming currency fulfillment platform connecting Next.js 14 and Laravel microservices with sub-second dispatching and Redis Redlock idempotency.',
      milestones: [
        { title: 'Architecture Blueprint & Garena API Bridge', is_completed: true, due_date: '2026-10-01', order_index: 1 },
        { title: 'Webhook Idempotency & Redis Redlock Mutex Locks', is_completed: true, due_date: '2026-10-25', order_index: 2 },
        { title: 'High-Frequency Load Stress Testing (50K+ Tx)', is_completed: true, due_date: '2026-11-15', order_index: 3 },
        { title: 'Multi-Region Failover Cutover', is_completed: false, due_date: '2026-12-10', order_index: 4 },
      ],
    },
    {
      client_id: pharmacyClientId,
      title: 'Clinical Pharmacy OS',
      code_name: 'PRJ-CLINICAL-02',
      category: 'Healthcare & Compliance',
      status: 'deployed',
      progress_percentage: 100,
      staging_url: 'https://pharmacy.monolith.lk',
      repository_or_demo_url: null as string | null,
      target_launch_date: '2026-11-01',
      summary:
        'Medical dispensary management system handling prescription auditing, real-time batch/expiry tracking, drug interaction guardrails, and hardware barcode scanning.',
      milestones: [
        { title: 'LIS Clinical Driver Bridging (C/C++)', is_completed: true, due_date: '2026-08-01', order_index: 1 },
        { title: 'ACID Multi-Tier Inventory & Batch Expiry Ledger', is_completed: true, due_date: '2026-09-10', order_index: 2 },
        { title: 'Teaching Hospital On-Site Rollout', is_completed: true, due_date: '2026-10-15', order_index: 3 },
      ],
    },
    {
      client_id: glaciarClientId,
      title: 'Glaciar Water Logistics & Enterprise ERP',
      code_name: 'PRJ-GLACIAR-03',
      category: 'Supply Chain & Logistics ERP',
      status: 'qa_testing',
      progress_percentage: 72,
      staging_url: 'https://erp.glaciarwater.lk',
      repository_or_demo_url: null as string | null,
      target_launch_date: '2027-01-15',
      summary:
        'Resource management platform governing raw material procurement, automated batch bottling quotas, delivery fleet routing, and distributor ledger reconciliation.',
      milestones: [
        { title: 'Depot Inventory & Fleet Telemetry Schema', is_completed: true, due_date: '2026-10-20', order_index: 1 },
        { title: 'Distributor Credit Control & Auto-Invoicing', is_completed: true, due_date: '2026-11-28', order_index: 2 },
        { title: 'Mobile Driver Proof-of-Delivery Sync', is_completed: false, due_date: '2027-01-05', order_index: 3 },
      ],
    },
  ];

  const projectIdMap: Record<string, string> = {};
  for (const p of projectSeeds) {
    const { milestones, ...projRow } = p;
    const { data: existingProj } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('code_name', p.code_name)
      .maybeSingle();

    if (existingProj) {
      projectIdMap[p.code_name] = existingProj.id;
    } else {
      const { data: insertedProj, error } = await supabaseAdmin
        .from('projects')
        .insert(projRow)
        .select('id')
        .single();
      if (error) throw error;
      projectIdMap[p.code_name] = insertedProj.id;
      await supabaseAdmin.from('project_milestones').insert(
        milestones.map((m) => ({ ...m, project_id: insertedProj.id }))
      );
    }
  }
  console.log('✓ Projects & milestones seeded');

  // 4. Billing Documents (LKR)
  const billingSeeds = [
    {
      document_number: 'INV-2026-104',
      type: 'invoice',
      client_id: shadowClientId,
      project_id: projectIdMap['PRJ-SHADOW-01'],
      status: 'paid',
      currency: 'LKR',
      line_items: [
        { id: 'li-1', description: 'Phase 02: Redis Redlock Mutex & Idempotent Webhook Pipeline', quantity: 1, unit_price: 1150000, total: 1150000 },
        { id: 'li-2', description: 'Sub-Second Garena Dispatch Microservices', quantity: 1, unit_price: 700000, total: 700000 },
      ],
      subtotal: 1850000,
      tax: 0,
      total: 1850000,
      due_date: '2026-11-05',
      notes: 'Settled via Commercial Bank Sri Lanka Corporate Wire Transfer.',
    },
    {
      document_number: 'QUO-2026-088',
      type: 'quotation',
      client_id: shadowClientId,
      project_id: projectIdMap['PRJ-SHADOW-01'],
      status: 'sent',
      currency: 'LKR',
      line_items: [
        { id: 'li-3', description: 'Zero-Downtime Multi-Region Failover Architecture', quantity: 1, unit_price: 1350000, total: 1350000 },
        { id: 'li-4', description: 'Dedicated 24/7 SLA Telemetry & Emergency Triage (6 Months)', quantity: 6, unit_price: 225000, total: 1350000 },
      ],
      subtotal: 2700000,
      tax: 0,
      total: 2700000,
      due_date: '2026-12-01',
      notes: 'Valid for 30 business days from date of issue. Quoted in LKR.',
    },
    {
      document_number: 'INV-2026-112',
      type: 'invoice',
      client_id: pharmacyClientId,
      project_id: projectIdMap['PRJ-CLINICAL-02'],
      status: 'paid',
      currency: 'LKR',
      line_items: [
        { id: 'li-5', description: 'Clinical Pharmacy OS Multi-Station Licensing & Barcode Integration', quantity: 1, unit_price: 950000, total: 950000 },
      ],
      subtotal: 950000,
      tax: 0,
      total: 950000,
      due_date: '2026-10-30',
      notes: 'Paid in full upon teaching hospital signoff.',
    },
    {
      document_number: 'QUO-2026-095',
      type: 'quotation',
      client_id: glaciarClientId,
      project_id: projectIdMap['PRJ-GLACIAR-03'],
      status: 'approved',
      currency: 'LKR',
      line_items: [
        { id: 'li-6', description: 'Glaciar Enterprise ERP & Fleet Routing Engine (Phase 03)', quantity: 1, unit_price: 1450000, total: 1450000 },
      ],
      subtotal: 1450000,
      tax: 0,
      total: 1450000,
      due_date: '2026-12-20',
      notes: 'Approved by executive leadership; milestone billing in LKR.',
    },
  ];

  for (const doc of billingSeeds) {
    await supabaseAdmin.from('documents_billing').upsert(doc, { onConflict: 'document_number' });
  }
  console.log('✓ Invoices & Quotations (LKR) seeded');

  // 5. Project Requests & Meetings
  const { count: reqCount } = await supabaseAdmin.from('project_requests').select('*', { count: 'exact', head: true });
  if (!reqCount) {
    await supabaseAdmin.from('project_requests').insert([
      {
        client_id: shadowClientId,
        project_title: 'Automated Wallet & LKR Settlement Ramp Microservice',
        service_category: 'Custom Software Engineering',
        estimated_budget: 'LKR 2,500,000 – 4,000,000',
        target_timeline: 'Q1 2027',
        project_scope: 'Require sub-second multi-gateway Sri Lankan LKR & international wallet reconciliation with JA3/JA4 TLS anti-fraud checks.',
        status: 'under_estimation',
      },
      {
        client_id: glaciarClientId,
        project_title: 'AI Predictive Fleet Demand & Bottling Forecast Module',
        service_category: 'AI, Data, & Machine Learning',
        estimated_budget: 'LKR 1,200,000 – 2,000,000',
        target_timeline: 'Q2 2027',
        project_scope: 'Integrate regional weather and distributor historical orders to forecast 19L bottle dispatch inventory.',
        status: 'pending_review',
      },
    ]);
    console.log('✓ Project requests seeded');
  }

  const { count: meetCount } = await supabaseAdmin.from('meeting_requests').select('*', { count: 'exact', head: true });
  if (!meetCount) {
    await supabaseAdmin.from('meeting_requests').insert([
      {
        client_id: shadowClientId,
        requested_date: '2026-11-25',
        requested_time: '15:30',
        timezone: 'Asia/Colombo (UTC+5:30)',
        meeting_type: 'Sprint Review',
        agenda: 'Reviewing throughput metrics on the 50K API load test and signing off on production cutover schedule.',
        meeting_link: 'https://meet.google.com/monolith-shadow-sprint',
        status: 'confirmed',
      },
      {
        client_id: glaciarClientId,
        requested_date: '2026-11-28',
        requested_time: '10:00',
        timezone: 'Asia/Colombo (UTC+5:30)',
        meeting_type: 'Architecture Consultation',
        agenda: 'Finalizing distributor credit limits and automated LKR VAT invoice generation rules.',
        status: 'pending',
      },
    ]);
    console.log('✓ Meetings seeded');
  }

  // 6. Customer Reviews
  const { count: revCount } = await supabaseAdmin.from('customer_reviews').select('*', { count: 'exact', head: true });
  if (!revCount) {
    await supabaseAdmin.from('customer_reviews').insert([
      {
        client_name: 'Marcus Vance',
        client_title: 'VP of Global Operations',
        company_name: 'ShadowTopup Global',
        rating: 5,
        review_text: 'Monolith LK transformed our fulfillment architecture. Sub-second API dispatches and zero double-claim errors across 50,000+ live transactions.',
        is_featured: true,
      },
      {
        client_name: 'Dr. H. Jayasuriya',
        client_title: 'Chief Medical Director',
        company_name: 'Clinical Pharmacy OS',
        rating: 5,
        review_text: 'The zero-leak prescription and batch-tracking system completely eliminated drug expiry waste across all teaching hospitals. Uncompromising precision.',
        is_featured: true,
      },
      {
        client_name: 'Damian Cruz',
        client_title: 'Managing Director',
        company_name: 'The Menu Enterprise',
        rating: 5,
        review_text: 'Real-time WebSocket kitchen display systems with zero reload latency. The Haute Editorial styling gave our brand the prestige we required.',
        is_featured: true,
      },
      {
        client_name: 'Kasun Perera',
        client_title: 'Operations Director',
        company_name: 'Glaciar Water Logistics',
        rating: 5,
        review_text: 'Our multi-depot inventory and automated LKR billing went from manual spreadsheets to deterministic real-time control.',
        is_featured: true,
      },
    ]);
    console.log('✓ Customer reviews seeded');
  }

  // 7. Blog Posts
  const blogSeeds = [
    {
      slug: 'distributed-redis-mutex-zero-loss',
      title: 'Distributed Redis Mutex & Zero-Loss Ledger Locks at Scale',
      category: 'Architecture',
      author: 'Dulanja Abeysinghe',
      read_time: '6 min read',
      cover_image: '/assets/blog-1.jpg',
      excerpt: 'How we engineered sub-second idempotent transaction pipelines handling 50K+ live requests with zero duplicate fulfillments.',
      content_markdown:
        'When operating high-frequency gaming fulfillment and fintech bridges, race conditions are the number one failure point. A client double-clicking a payout or a transient network retry can easily result in duplicate disbursements.\n\nIn this deep dive, we explore how Monolith LK implements Redlock distributed mutexes across Redis clusters with TTL guards, ensuring absolute idempotency even under chaotic peak loads.',
      is_published: true,
    },
    {
      slug: 'haute-editorial-digital-spaces',
      title: 'Haute Editorial: Bringing Tactile Print Restraint to High-Performance Web',
      category: 'Design Strategy',
      author: 'Remashi Diyana',
      read_time: '4 min read',
      cover_image: '/assets/blog-2.jpg',
      excerpt: 'Why enterprise interfaces must transcend generic templates in favor of structured typography and architectural hairline precision.',
      content_markdown:
        'Modern web interfaces have largely collapsed into generic tropes: rounded colorful blobs, unstyled cards, and noisy micro-interactions.\n\nHaute Editorial rejects the noise. By applying an 8pt architectural grid, warm monochromatic hues, and calculated typography inspired by high fashion print periodicals, we create software that feels authoritative and enduring.',
      is_published: true,
    },
  ];
  for (const post of blogSeeds) {
    await supabaseAdmin.from('blog_posts').upsert(post, { onConflict: 'slug' });
  }
  console.log('✓ Blog posts seeded');

  // 8. Contact Inquiries
  const { count: inqCount } = await supabaseAdmin.from('contact_inquiries').select('*', { count: 'exact', head: true });
  if (!inqCount) {
    await supabaseAdmin.from('contact_inquiries').insert([
      {
        name: 'Nimali Fernando',
        email: 'nimali@ceylonlogistics.lk',
        company: 'Ceylon Express Logistics',
        service_need: 'Custom Software Engineering',
        budget_tier: 'LKR 750,000 – 2,000,000',
        brief: 'Looking to modernize our legacy dispatch portal into a real-time multi-station web platform with automated LKR invoicing.',
        status: 'new',
      },
    ]);
    console.log('✓ Contact inquiries seeded');
  }

  console.log('🎉 Monolith LK Production Seed complete!');
}

runSeed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
