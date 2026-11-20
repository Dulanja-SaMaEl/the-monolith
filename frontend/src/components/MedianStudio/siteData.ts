export interface Project {
  id: string;
  title: string;
  category: string;
  tag: string;
  image: string;
  year: string;
  client: string;
  description: string;
  deliverables: string[];
  challenge: string;
  solution: string;
  metrics?: string;
  stack?: string[];
  quote?: {
    text: string;
    author: string;
  };
}

export interface PricingPlan {
  id: string;
  title: string;
  priceMonthly: number;
  priceAnnual: number;
  tagline: string;
  popular?: boolean;
  features: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  date: string;
  image: string;
  readTime: string;
  summary: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  content: string[];
}

export interface ServiceCapability {
  title: string;
  description: string;
}

export interface ServiceItem {
  id: string;
  num: string;
  title: string;
  tagline: string;
  description: string;
  capabilities: ServiceCapability[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  coordinates: string;
  contact: {
    email: string;
    phone?: string;
  };
  profiles: {
    linkedin?: string;
    github?: string;
  };
  academic: string[];
  certifications?: string[];
  trackRecord: {
    company: string;
    role: string;
    description: string;
  }[];
  mastery: string[];
  bio: string;
}

export const PROJECTS: Project[] = [
  {
    id: 'shadowtopup-engine',
    title: 'ShadowTopup Engine',
    category: 'Fintech & Gaming API',
    tag: 'Fintech',
    image: '/assets/work-6.jpg',
    year: '2025',
    client: 'ShadowTopup Global',
    description: 'Automated digital gaming currency fulfillment platform connecting Next.js 14 and Laravel microservices. Automated Garena player validation, webhook reconciliations, and instant wallet balances with sub-second dispatching.',
    deliverables: [
      'Next.js 14 Player Portal',
      'Laravel 11 Microservices Dispatcher',
      'Garena API Player Validation',
      'Automated Webhook Reconciliation Engine',
      'Sub-Second Digital Fulfillment Core'
    ],
    challenge: 'High-frequency gaming flash sales causing player validation bottlenecks, race conditions on wallet balance deduction, and webhook state drift.',
    solution: 'Architected a decoupled microservices pipeline with Redis asynchronous queue workers and sub-second Garena API validation achieving sub-850ms turnaround.',
    metrics: '50,000+ Transactions • < 850 ms Dispatch Speed • 99.98% Fulfillment Reliability',
    stack: ['Next.js 14', 'Laravel 11', 'Garena API', 'MySQL', 'Webhooks', 'Tailwind CSS'],
    quote: {
      text: 'ShadowTopup handled tens of thousands of simultaneous flash top-ups without a single ledger discrepancy.',
      author: 'Operations Director, ShadowTopup Global'
    }
  },
  {
    id: 'nexustopup-gateway',
    title: 'NexusTopUp Automation Gateway',
    category: 'Distributed Microservices & Security',
    tag: 'Security & Infra',
    image: '/assets/work-4.jpg',
    year: '2025',
    client: 'NexusTopUp Infrastructure',
    description: 'Microservice gateway automating digital gaming top-ups. Features warm Redis session pools (12h TTL), 2FA TOTP generation from seed, distributed Redlock mutex locks, and Chrome JA3/JA4 TLS fingerprint mimicry bypassing strict WAF security.',
    deliverables: [
      'Warm Redis Session Pool Manager (12h TTL)',
      'Deterministic 2FA TOTP Seed Generator',
      'Distributed Redis Redlock Mutex Lock',
      'Chrome JA3/JA4 TLS Fingerprint Mimicry',
      'Prometheus Telemetry & Telegram Alerts'
    ],
    challenge: 'Bypassing aggressive Cloudflare/WAF anti-bot protections and mitigating double-claim race conditions across high-throughput distributed workers.',
    solution: 'Engineered Chrome TLS fingerprinting to pass browser integrity challenges alongside distributed Redis Redlock mutex locks to eliminate duplicate claims completely.',
    metrics: 'Session Latency 8s → 1.4s • 100% Automated 2FA TOTP • 0.00% Zero-Loss Double Claims',
    stack: ['Node.js / TypeScript', 'Docker Compose', 'Redis / Redlock', 'TLS Fingerprinting', 'Prometheus', 'Telegram Bot'],
    quote: {
      text: 'The JA3/JA4 fingerprinting engine unlocked uninterrupted automated fulfillment through strict enterprise WAFs.',
      author: 'Lead Infrastructure Engineer, NexusTopUp'
    }
  },
  {
    id: 'the-menu-enterprise',
    title: 'The Menu Enterprise',
    category: 'Enterprise SaaS & WebSockets',
    tag: 'Enterprise SaaS',
    image: '/assets/work-1.jpg',
    year: '2024',
    client: 'The Menu Hospitality Group',
    description: 'Multi-tenant contactless QR dining platform with zero-reload Alpine.js modals, Pusher/Laravel Echo WebSocket kitchen display system (KDS), and dynamic multi-tenant billing.',
    deliverables: [
      'Contactless QR Dine-in & Ordering UI',
      'Zero-Reload Alpine.js Cart & Modals',
      'Pusher / Laravel Echo WebSocket Kitchen Display',
      'Multi-Tenant Tenant Isolation & RBAC',
      'Dynamic Multi-Location Billing & POS Sync'
    ],
    challenge: 'Handling peak restaurant dinner rushes with dozens of diners ordering concurrently without page reloading or kitchen display synchronization delays.',
    solution: 'Combined lightweight reactive Alpine.js DOM states with sub-50ms WebSocket broadcasts via Pusher and Laravel Echo.',
    metrics: 'Real-time Pusher WS Engine • 0ms Dynamic Page Reload • Multi-Tenant RBAC Security',
    stack: ['Laravel 11', 'Vite', 'Alpine.js', 'Pusher WebSockets', 'Laravel Echo', 'Tailwind CSS']
  },
  {
    id: 'clinical-pharmacy-os',
    title: 'Clinical Pharmacy OS',
    category: 'Healthcare & Compliance',
    tag: 'Healthcare',
    image: '/assets/work-3.jpg',
    year: '2024',
    client: 'Healthcare & Clinical Centers',
    description: 'Medical dispensary management system handling prescription auditing, real-time batch and expiry tracking, drug interaction guardrails, barcode scanning, and multi-tier pharmaceutical billing with zero ledger discrepancies.',
    deliverables: [
      'Prescription Auditing & Doctor Verification',
      'Real-time Drug Batch & Expiry Tracker',
      'Automated Drug Interaction Guardrails',
      'Hardware Barcode Scanner Driver Bridge',
      'Multi-Tier Pharmaceutical Billing & Ledger'
    ],
    challenge: 'Preventing lethal drug interactions, eliminating expired medication inventory losses, and meeting strict clinical compliance standards.',
    solution: 'Built an ACID-compliant transaction pipeline with instant barcode hardware scanning, automatic batch FIFO rotation, and immutable audit logs.',
    metrics: '100% Verified Audit Trail • 0.00% Expiry Waste • HIPAA-Grade Compliance',
    stack: ['Laravel Core', 'MySQL ACID Transactions', 'Livewire / Alpine.js', 'Hardware Barcode Scanner', 'Audit Trail']
  },
  {
    id: 'old-devans-legacy-platform',
    title: 'Old Devans Legacy Platform & Museum',
    category: 'Digital Heritage & Realtime CMS',
    tag: 'Web Platform',
    image: '/assets/work-2.jpg',
    year: '2024',
    client: 'Old Devans Basketball Club',
    description: 'Living historical archive and alumni platform featuring interactive milestone timeline, 3D championship trophy room, yearbook Hall of Fame, memory wall, and authenticated CRUD studio.',
    deliverables: [
      'Historical Archival Timeline (1980s–Present)',
      'Interactive 3D Championship Trophy Room',
      'Alumni Hall of Fame & Yearbook Directory',
      'Digital Memory Wall & Media Gallery',
      'Authenticated Content Management Studio'
    ],
    challenge: 'Preserving 40+ years of high-resolution historical basketball media and trophies while maintaining sub-second load times on mobile devices.',
    solution: 'Engineered fluid Framer Motion animations with Supabase PostgreSQL caching and Next/Vite optimized media pipelines.',
    metrics: '1980s–2020s Archive Span • < 25ms P95 API Response • 100% Interactive Trophy Museum',
    stack: ['React 18', 'Vite', 'Tailwind CSS', 'Framer Motion', 'Express.js REST API', 'Supabase PostgreSQL', 'JWT Auth']
  },
  {
    id: 'engineering-os',
    title: 'Engineering OS',
    category: 'Developer Tooling & AI',
    tag: 'AI & Systems',
    image: '/assets/work-5.jpg',
    year: '2025',
    client: 'Personal Systems Architecture',
    description: 'Command center for senior software and AI engineers. Computes 168-hour weekly capacity budgets across 7 tracks, protected client buffers, SM-2 spaced repetition active recall, and analytics.',
    deliverables: [
      '168-Hour Weekly Capacity Engine',
      '7-Track Time & Focus Allocation Matrix',
      'SM-2 Spaced Repetition Active Recall Core',
      'Protected Client Buffer Scheduling System',
      'Deep Cognitive Performance & Burnout Telemetry'
    ],
    challenge: 'Optimizing cognitive focus across multi-client software architectures, open-source AI research, and high-frequency delivery cycles.',
    solution: 'Formulated an algorithmic scheduler with SuperMemo SM-2 spaced repetition, Recharts telemetry, and sub-10ms App Router transitions.',
    metrics: '168h Weekly Engine • SM-2 Spaced Repetition • < 10ms P99 Transitions',
    stack: ['Next.js 16 (App Router)', 'React 19', 'TypeScript', 'Tailwind CSS', 'Recharts', 'SM-2 Algorithm']
  },
  {
    id: 'glaciar-water-logistics',
    title: 'Glaciar Water Logistics & Enterprise ERP',
    category: 'Supply Chain & Logistics ERP',
    tag: 'Logistics & ERP',
    image: '/assets/work-6.jpg',
    year: '2024',
    client: 'Glaciar Water Bottling & Distribution',
    description: 'Resource management platform managing distribution fleets, customer deposit containers, dynamic route allocations, and automated DomPDF invoice dispatching.',
    deliverables: [
      'Fleet Distribution & Dynamic Route Matrix',
      'Reusable Deposit Container Reconciliation',
      'Automated DomPDF Quotation & Invoicing',
      'Driver Dispatch & Mobile Delivery Confirmation',
      'Commercial Credit Ledger & Depot Stock Balancing'
    ],
    challenge: 'Tracking tens of thousands of circulating 5-gallon water containers and preventing distribution fleet deadheads.',
    solution: 'Architected a PostgreSQL-backed dispatch system with automatic container deposit reconciliation and programmatic PDF invoicing.',
    metrics: 'Automated DomPDF Invoicing • Real-Time Route Dispatch • 100% Reconciled Container Parity',
    stack: ['Laravel 11', 'Laravel Sanctum', 'DomPDF Engine', 'PostgreSQL', 'Tailwind UI']
  },
  {
    id: 'harvard-centralized-inquiry',
    title: 'Harvard Centralized Inquiry',
    category: 'Distributed Ingestion',
    tag: 'Distributed Systems',
    image: '/assets/work-4.jpg',
    year: '2024',
    client: 'Academic & Higher Education',
    description: 'Multi-channel academic admissions inquiry system with automated department routing, SLA tracking, prioritized escalation matrix, and queue worker pipelines.',
    deliverables: [
      'Multi-Channel Ingestion (Email, Web, SMS)',
      'Algorithmic Department Routing Engine',
      'Dynamic SLA Violation Escalation Matrix',
      'Asynchronous Queue Worker Processing',
      'Executive Admissions Throughput Telemetry'
    ],
    challenge: 'Preventing admissions inquiry dropouts during international enrolment deadlines with massive traffic spikes.',
    solution: 'Constructed resilient asynchronous queue worker pipelines ensuring zero message loss and guaranteed sub-2h SLA response dispatching.',
    metrics: '< 2h Response SLA • Zero Dropout Queue Engine • Automated Priority Triage',
    stack: ['Laravel Architecture', 'Queue Workers', 'Relational DB', 'Tailwind UI']
  },
  {
    id: 'thiraplus-thirai-shorts',
    title: 'ThiraPlus & Thirai Shorts',
    category: 'Media Streaming & CDN',
    tag: 'Media & Video',
    image: '/assets/work-2.jpg',
    year: '2024',
    client: 'Digital Media & Entertainment',
    description: 'Distributed media delivery engine powering HD streaming and bite-sized vertical video feeds with edge caching, automated FFmpeg transcoding, and low-latency playback.',
    deliverables: [
      'Bite-Sized Vertical Video Feed Engine (Shorts)',
      'Adaptive Bitrate HLS / DASH Streaming',
      'Automated FFmpeg Video Transcoding Pipeline',
      'Edge CDN Caching & Pre-buffering Strategy',
      'Creator Monetization & Impression Analytics'
    ],
    challenge: 'Delivering instantaneous vertical short video transitions and HD video playback on variable mobile 4G networks.',
    solution: 'Engineered an automated server-side FFmpeg transcoding pipeline with edge CDN multi-resolution caching.',
    metrics: 'Sub-second Start Latency • Adaptive Bitrate Transcoding • Zero Buffering Playback',
    stack: ['Laravel Backend', 'Next.js App', 'FFmpeg Transcoding', 'Cloud Storage CDN']
  },
  {
    id: 'sagaki-supply-chain',
    title: 'Sagaki Supply Chain Engine',
    category: 'Supply Chain & ERP',
    tag: 'Logistics & ERP',
    image: '/assets/work-3.jpg',
    year: '2024',
    client: 'Sagaki Supply Chain Logistics',
    description: 'Wholesale logistics engine tracking multi-depot stock movements, automated invoice dispatching, distributor credit control, and predictive restock thresholds.',
    deliverables: [
      'Multi-Depot Stock Movement & Rebalance',
      'Distributor Credit Control & Aging Reports',
      'Predictive Restocking Threshold System',
      'Automated Invoicing & Tax Ledger Integration',
      'Warehouse Inventory Scanner Interface'
    ],
    challenge: 'Real-time inventory synchronization across geographically distributed warehouses with fluctuating supplier lead times.',
    solution: 'Deployed atomic database locks and automated distributor credit controls with predictive safety stock algorithms.',
    metrics: 'Live Multi-Depot Rebalance • Automated Invoice Dispatch • Real-Time Stock Audits',
    stack: ['Laravel Enterprise', 'PostgreSQL', 'Tailwind CSS', 'REST Services']
  },
  {
    id: 'canadian-talent-scraper',
    title: 'Canadian Talent Scraper',
    category: 'Distributed Web Crawling',
    tag: 'Data Engineering',
    image: '/assets/work-5.jpg',
    year: '2025',
    client: 'Market Intelligence & Data Mining',
    description: 'Distributed web scraping system indexing, deduplicating, and parsing job postings across top Canadian talent boards with heuristic salary normalization and anti-bot residential proxy rotation.',
    deliverables: [
      'Distributed Headless Browser Puppeteer Cluster',
      'Residential Proxy Rotation & Anti-Bot Bypasses',
      'Heuristic Salary & Location Normalization Engine',
      'PostgreSQL Data Lake with Full-Text Ingestion',
      'Automated Daily Deduplication Cron Pipelines'
    ],
    challenge: 'Overcoming sophisticated bot mitigation mechanisms (Cloudflare, PerimeterX) and deduplicating hundreds of thousands of cross-posted job listings.',
    solution: 'Engineered a distributed Python/Puppeteer crawler swarm with dynamic fingerprint rotation and sub-second deduplication hashing.',
    metrics: '100,000+ Daily Indexed Docs • 3,200 docs/min Pipeline Speed • 99.9% Validated Data Fidelity',
    stack: ['Node.js / Puppeteer', 'Python Crawlers', 'PostgreSQL Data Lake', 'Anti-Bot Bypasses']
  },
  {
    id: 'shopify-checkout-gateway',
    title: 'Shopify Checkout & Webhook Gateway',
    category: 'E-Commerce & Payment Consistency',
    tag: 'Fintech',
    image: '/assets/work-1.jpg',
    year: '2024',
    client: 'High-Volume E-Commerce',
    description: 'Resilient webhook listeners and custom checkout synchronizations resolving state drift between Shopify Admin APIs, payment gateways, and custom inventory databases using cryptographic HMAC verification and database idempotency keys.',
    deliverables: [
      'Cryptographic HMAC SHA256 Webhook Verification',
      'Database Idempotency Key Lock Engine',
      'Shopify Liquid & Admin API Sync Gateway',
      'Dead-Letter Queue with Exponential Backoff',
      'Automated ERP Inventory Re-allocation'
    ],
    challenge: 'Preventing phantom stockouts and duplicate payment captures during flash sales with delayed or duplicated webhook deliveries.',
    solution: 'Constructed an idempotent transactional middleware with cryptographic HMAC verification and atomic Redis locks.',
    metrics: '100% Cryptographic Idempotency • 0.00% Zero-Loss Double Charges • < 250 ms Callback ACK',
    stack: ['Shopify Admin API', 'Shopify Liquid', 'Laravel Middleware', 'HMAC Validation', 'MySQL']
  }
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'brand-digital-sprint',
    title: 'Brand & Digital Sprint',
    priceMonthly: 149000,
    priceAnnual: 119000,
    tagline: 'Essential high-speed digital foundation for emerging businesses',
    features: [
      'High-converting landing page (React / Next.js)',
      'Sub-1.2s page speed & Core Web Vitals 99+ guarantee',
      'Meta Pixel & Conversion API (CAPI) architecture',
      'Direct WhatsApp inquiry & lead capture integration',
      'Complete typography, palette & brand collateral assets',
      '30 days post-launch technical warranty'
    ]
  },
  {
    id: 'full-growth-engine',
    title: 'Full Growth Engine',
    priceMonthly: 389000,
    priceAnnual: 311000,
    tagline: 'Complete performance marketing & web engineering for scaling brands',
    popular: true,
    features: [
      'Bespoke multi-page high-conversion web platform',
      'Active Meta advertising management & ROAS scaling',
      'Continuous monthly creative refreshes & video ad scripts',
      'Weekly sprint reviews with Founder Dulanja Abeysinghe',
      'Private 24/7 Client Hub portal & live ROAS telemetry',
      'Direct WhatsApp emergency line & priority turnaround'
    ]
  },
  {
    id: 'enterprise-omnichannel',
    title: 'Enterprise Omnichannel',
    priceMonthly: 749000,
    priceAnnual: 599000,
    tagline: 'Full-spectrum growth engineering & production studio for market leaders',
    features: [
      'Custom headless web architecture & 3D WebGL scenes',
      'Full in-house 4K viral video reel & commercial production',
      'Dedicated marketing team & full ad spend stewardship',
      'Multivariate A/B copy and conversion testing suites',
      'Enterprise SLA with guaranteed response under 1 hour',
      'Quarterly executive growth strategy summit'
    ]
  }
];

export const SERVICES: ServiceItem[] = [
  {
    id: 'custom-software-engineering',
    num: '01',
    title: 'Custom Software Engineering',
    tagline: 'High-Concurrency Enterprise Multi-Tier Systems & ACID Reliability',
    description: 'Bespoke enterprise applications, scalable multi-tenant SaaS platforms, and modern zero-reload web & mobile architectures built for massive corporate workloads.',
    capabilities: [
      {
        title: 'Enterprise Application Development',
        description: 'Bespoke ERPs, CRMs, multi-station dispatch, and ACID transactional databases for massive corporate workflows.'
      },
      {
        title: 'SaaS Product Architecture',
        description: 'Subscription-based multi-tenant cloud platforms, dynamic billing, role-based access control (RBAC), and tenant isolation.'
      },
      {
        title: 'Web & Mobile Application Development',
        description: 'High-performance Progressive Web Apps (PWAs), Next.js 16 / React 19 web interfaces, zero-reload state updates.'
      },
      {
        title: 'Legacy System Modernization',
        description: 'Deconstructing outdated monolithic codebases into decoupled, high-throughput microservices and API gateways.'
      }
    ]
  },
  {
    id: 'ai-data-machine-learning',
    num: '02',
    title: 'AI, Data, & Machine Learning',
    tagline: 'Deterministic Predictive Models, Custom Vector RAG & Computer Vision',
    description: 'Harnessing predictive statistical models, private knowledge retrieval pipelines, and high-volume data engineering to automate mission-critical enterprise workflows.',
    capabilities: [
      {
        title: 'Predictive Analytics & Forecasting',
        description: 'Regression and classification models trained on historical data to predict market trends and inventory demand.'
      },
      {
        title: 'Generative AI & Custom RAG Pipelines',
        description: 'Custom vector embeddings, private knowledge bases, and LLM agent orchestration for automated workflow triage.'
      },
      {
        title: 'Data Engineering & Mass Pipelines',
        description: 'High-volume ETL/ELT pipelines, distributed web crawling, and relational data lakes.'
      },
      {
        title: 'Computer Vision & Real-Time NLP',
        description: 'Edge video stream parsing, OCR/barcode ingestion, and real-time semantic sentiment analysis.'
      }
    ]
  },
  {
    id: 'cloud-infrastructure-devops',
    num: '03',
    title: 'Cloud Infrastructure & DevOps',
    tagline: 'Zero-Downtime Migration, Self-Healing Kubernetes & Event Topology',
    description: 'Hardened infrastructure engineered for 99.99% availability, automated CI/CD deployment pipelines, and micro-functions that scale on demand.',
    capabilities: [
      {
        title: 'Cloud Architecture & Zero-Downtime Migration',
        description: 'Moving on-premise hardware to AWS/GCP/Azure with deterministic parity and zero cutover downtime.'
      },
      {
        title: 'DevOps & Automated CI/CD',
        description: 'Automated regression testing, GitHub Actions/GitLab CI, Docker containerization, and instant rollback protocols.'
      },
      {
        title: 'Kubernetes & Container Orchestration',
        description: 'Self-healing worker pods, automatic horizontal auto-scaling, and cluster load balancing.'
      },
      {
        title: 'Serverless & Event-Driven Topology',
        description: 'Zero-idle cost micro-functions that scale instantly to tens of thousands of concurrent requests.'
      }
    ]
  },
  {
    id: 'cybersecurity-risk-management',
    num: '04',
    title: 'Cybersecurity & Risk Management',
    tagline: 'Zero-Trust Perimeters, Low-Level Security Mimicry & Red Teaming',
    description: 'Proactive penetration testing, immutable audit trails, and distributed mutex security mechanisms defending mission-critical endpoints against sophisticated exploits.',
    capabilities: [
      {
        title: 'Zero-Trust Network Architecture',
        description: 'Null-field perimeters, hardware token verification, and strict boundary controls.'
      },
      {
        title: 'Penetration Testing (Red Teaming)',
        description: 'Probing application layers, API endpoints, and race conditions before exploitation.'
      },
      {
        title: 'Compliance & Regulatory Auditing',
        description: 'HIPAA clinical compliance, immutable audit trails, and SOC2/GDPR readiness.'
      },
      {
        title: 'Anti-WAF & Low-Level Security Mimicry',
        description: 'JA3/JA4 TLS fingerprint spoofing and Redis Redlock distributed mutexes to prevent bot blocking and duplicate execution.'
      }
    ]
  },
  {
    id: 'managed-it-post-launch',
    num: '05',
    title: 'Managed IT & Post-Launch Support',
    tagline: '24/7 SLA Telemetry, Embedded Sprints & Multi-Region Disaster Recovery',
    description: 'Continuous operational vigilance, around-the-clock cluster telemetry, sub-hour emergency response, and proactive zero-downtime kernel patching.',
    capabilities: [
      {
        title: '24/7 SLA Telemetry & Emergency Triage',
        description: 'Around-the-clock cluster monitoring, automated anomaly alerts, sub-hour critical response.'
      },
      {
        title: 'Continuous Feature Iteration',
        description: 'Embedded engineering sprints for performance improvements and rapid feature rollouts.'
      },
      {
        title: 'Database Maintenance & Offsite Snapshots',
        description: 'Zero-downtime maintenance, automated table vacuuming, and encrypted offsite multi-region disaster backups.'
      },
      {
        title: 'Security Patching & Kernel Upgrades',
        description: 'Proactive CVE patching and dependency hardening without service interruption.'
      }
    ]
  },
  {
    id: 'strategy-ui-ux-consulting',
    num: '06',
    title: 'Strategy, UI/UX, & Consulting',
    tagline: 'Human-Centered Research, Tactile Spatial Depth & P99 Profiling',
    description: 'Uniting human-centered research with Swiss typographic restraint, rapid interactive prototyping, and deep architectural performance audits.',
    capabilities: [
      {
        title: 'Digital Transformation Consulting',
        description: 'Guiding legacy leadership on eliminating manual operational bottlenecks and digitizing workflows.'
      },
      {
        title: 'Product Discovery & Prototyping',
        description: 'Clickable prototypes, user journey mapping, and technical feasibility stress-testing.'
      },
      {
        title: 'Bespoke UI/UX Design Systems',
        description: 'Brutalist, high-craft editorial interfaces, tactile glassmorphism, 8pt spatial grid, WCAG AA compliance.'
      },
      {
        title: 'Systems & Performance Auditing',
        description: 'P99 latency profiling, database query optimization, and structural refactoring roadmaps.'
      }
    ]
  },
  {
    id: 'brand-growth-marketing-creative',
    num: '07',
    title: 'Brand Growth, Social Media Marketing & Creative Studio',
    tagline: 'Tactical Editorial Collateral, High-Yield Paid Acquisition & Identity',
    description: 'Crafting scroll-stopping multi-channel visual campaigns, high-impact editorial print collateral, and precision Meta/Google paid acquisition funnels.',
    capabilities: [
      {
        title: 'Social Media Marketing & Brand Strategy',
        description: 'Multi-platform growth campaigns, content calendars, and brand voice guidelines.'
      },
      {
        title: 'Tactical Flyer & Collateral Design',
        description: 'High-impact editorial event flyers, product launch banners, pitch decks, and commercial brochures.'
      },
      {
        title: 'Paid Ad Campaign Orchestration',
        description: 'Data-driven conversion funnels on Meta (Facebook/Instagram Ads), Google Ads, and LinkedIn Ads with continuous ROAS tracking.'
      },
      {
        title: 'Brand Identity & Visual Positioning',
        description: 'Monochromatic and luxury vector logos, typography systems, and comprehensive brand guidelines.'
      }
    ]
  }
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'dulanja-abeysinghe',
    name: 'Dulanja Abeysinghe',
    role: 'Founder & Principal Systems Architect',
    image: '/dulanja.webp',
    coordinates: 'Kurunegala, Sri Lanka (7.4863° N, 80.3623° E · UTC+5:30)',
    contact: {
      email: 'dulanja150abeysinghe@gmail.com',
      phone: '+94 76 591 7189',
    },
    profiles: {
      linkedin: 'https://linkedin.com/in/dulanja-abeysinghe',
      github: 'https://github.com/Dulanja-SaMaEl',
    },
    academic: [
      'BSc (Hons) in Software Engineering — Second Upper Division (Birmingham City University, UK delivered via Java Institute)',
      'Professional Higher Diploma in Software Engineering (Skills & Educational Group Awards, UK, 2025)',
    ],
    certifications: [
      'Deep Learning A-Z',
      'Machine Learning Specialist',
      'The AI Engineer',
      'Ethical Hacking',
    ],
    trackRecord: [
      {
        company: 'Biotech Software Solutions',
        role: 'Junior Software Engineer',
        description: 'On-site hospital LIS engineering (Peradeniya, Ragama, Kurunegala Teaching Hospitals); OPD Pharmacy Management System integration; direct C/C++ driver bridging for ACL TOP and AU 480 clinical laboratory analyzers.',
      },
      {
        company: 'GrayNode DevOps / NerdTech Labs',
        role: 'Co-Founder & Lead Developer',
        description: 'Microservices architecture, high-availability cloud deployments, LLM automated customer FAQ intelligence.',
      },
      {
        company: 'r-pac Printcare Lanka',
        role: 'Software Developer & Automation',
        description: 'Java/MySQL production scheduling optimization, internal C#/ASP.NET/PHP decision tooling.',
      },
      {
        company: 'Dula AI',
        role: 'Founder & Technical Author',
        description: 'Technical content authoring structured learning roadmaps across ML, Data Science, and LLMs.',
      },
    ],
    mastery: [
      'High-Concurrency Multi-Tier Arch',
      'Gaming Fintech Payment Gateways',
      'Redis Redlock Distributed Mutex',
      'Idempotent Webhook Engines',
      'BullMQ / Laravel Queue Pipelines',
      'Docker & Microservices',
      'RAG LLM Pipelines',
      'Prometheus & Grafana Telemetry',
    ],
    bio: 'Principal systems architect specializing in high-concurrency enterprise multi-tier infrastructure, clinical lab analyzer driver engineering, gaming fintech transaction gateways, distributed Redis Redlock mutex locks, and production RAG LLM pipelines.',
  },
  {
    id: 'remashi-diyana',
    name: 'Remashi Diyana',
    role: 'Co-Founder & Head of Creative Strategy & UI/UX',
    image: '/remashi.jpg',
    coordinates: 'Giriulla / Kurunegala, Sri Lanka (7.3333° N, 80.1333° E · UTC+5:30)',
    contact: {
      email: 'diyanamashi@gmail.com',
      phone: '+94 76 591 7189',
    },
    profiles: {
      linkedin: 'https://linkedin.com/in/remashi-diyana-b332a3272',
    },
    academic: [
      'Bachelor of Social Work (Honours) — Second-Year Undergraduate (National Institute of Social Development, NISD, Sri Lanka)',
      'Diploma in International Studies (University of Kelaniya, Sri Lanka)',
      'Higher National Diploma (HND) in Software Engineering & BEng (Hons) studies (ESOFT Metro Campus / London Metropolitan University, UK)',
    ],
    trackRecord: [
      {
        company: 'The Volunteers Academy',
        role: 'Primary Graphic Designer',
        description: 'High-engagement promotional flyers, social campaigns, event branding, driving national volunteer recruitment.',
      },
      {
        company: 'The Movement Projects',
        role: 'Visual Campaign Strategist',
        description: 'Advocacy visual campaigns, editorial social media layouts, community outreach collateral.',
      },
      {
        company: 'DIA Academy',
        role: 'Founder & Lead Educator',
        description: 'Complete brand identity, educational flyer series, promotional graphics, operations.',
      },
      {
        company: 'Silvermill Group',
        role: 'Application Developer Intern',
        description: 'Internal software workflow alignment and digital optimization.',
      },
    ],
    mastery: [
      'Tactical Editorial Flyer Design',
      'Visual Brand Identity Systems',
      'Social Media Marketing Funnels',
      'Canva (Fluent)',
      'Adobe Illustrator & Photoshop',
      'Human-Centered UI/UX Wireframing',
      'Design Thinking & User Research',
      'Haute Editorial Front-End Styling',
    ],
    bio: 'Head of creative strategy and UI/UX uniting human-centered social sciences with software engineering foundations. Spearheads tactical editorial design, high-converting social campaigns, and luxury brand identity systems.',
  },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'sub-1-second-ecommerce-architecture',
    title: 'The Architecture of a Sub-1.2s High-Conversion E-Commerce Experience',
    category: 'Engineering',
    date: 'March 14, 2026',
    image: '/assets/blog-1.jpg',
    readTime: '6 min read',
    summary: 'Why latency kills conversions, and how we engineer modern React and headless Shopify architectures that maintain 99+ Lighthouse speed.',
    author: {
      name: 'Dulanja Abeysinghe',
      role: 'Founder & Principal Systems Architect',
      avatar: '/dulanja.webp'
    },
    content: [
      'Every 100 milliseconds of latency costs up to 7% in checkout drop-off. In contemporary digital commerce, speed is not an optimization checklist item—it is the bedrock of consumer trust.',
      'Most agencies bloat customer codebases with twenty unvetted Shopify apps, slow third-party scripts, and heavy uncompressed hero images. We take the inverse approach: rigorous architectural pruning.',
      'By utilizing modern headless React and Next.js static asset pipelines with edge caching, our platforms deliver instantaneous, app-like page transitions on ordinary 4G connections.',
      'When your platform loads instantly, users browse deeper, cart abandonment plummets, and your return on ad spend rises exponentially.'
    ]
  },
  {
    id: 'server-side-meta-capi-scaling',
    title: 'Why Server-Side Meta CAPI is Mandatory for 4x+ ROAS in 2026',
    category: 'Performance',
    date: 'April 02, 2026',
    image: '/assets/blog-2.jpg',
    readTime: '5 min read',
    summary: 'Browser cookie loss costs brands up to 35% of their ad attribution data. Here is how server-side Conversion API restores mathematical tracking certainty.',
    author: {
      name: 'Remashi Diyana',
      role: 'Co-Founder & Head of Creative Strategy & UI/UX',
      avatar: '/remashi.jpg'
    },
    content: [
      'Standard browser pixels are losing visibility every month due to privacy sandboxes, ad blockers, and mobile operating system restrictions.',
      'Without accurate server-side signal feeding Meta\'s machine learning algorithms, the platform delivers impressions to low-intent users, burning through ad budgets.',
      'At Monolith LK, every ad account and platform we manage is backed by a server-side Conversion API (CAPI) infrastructure that captures 100% of purchase and lead events with deduplicated server hashing.',
      'The result is clear: higher Event Match Quality scores, lower Cost Per Acquisition (CPA), and the ability to scale budgets aggressively with compounding returns.'
    ]
  }
];

export const FAQS = [
  {
    question: 'What core services does Monolith LK provide?',
    answer: 'Monolith LK operates across 7 core practices: (1) Custom Software Engineering (ERPs, SaaS, Next.js/React 19 PWAs, legacy modernization), (2) AI, Data & Machine Learning (Predictive models, custom RAG LLMs, ETL pipelines, computer vision), (3) Cloud Infrastructure & DevOps (Zero-downtime migration, CI/CD, Kubernetes, serverless), (4) Cybersecurity & Risk Management (Zero-trust, penetration testing, clinical HIPAA compliance, anti-WAF/Redis Redlock), (5) Managed IT & Post-Launch Support (24/7 SLA telemetry, continuous sprints, disaster recovery), (6) Strategy, UI/UX & Consulting (Design systems, P99 profiling, prototyping), and (7) Brand Growth, Marketing & Creative Studio (Social campaigns, tactical editorial flyers, paid acquisition, luxury brand identity).'
  },
  {
    question: 'How long does a website take to build and launch?',
    answer: 'High-converting single-page landing experiences and conversion funnels launch within 1 to 2 weeks. Comprehensive multi-page platforms and custom e-commerce stores take between 3 to 5 weeks, complete with SEO foundations and sub-1.2s speed audits.'
  },
  {
    question: 'What makes Monolith LK different from traditional agencies?',
    answer: 'We eliminate the disconnect between pretty design and ruthless performance. You do not get passed off to junior account managers—you get direct WhatsApp communication with Founder Dulanja Abeysinghe & Co-Founder Remashi Diyana, weekly sprint reviews, and 24/7 access to your private Client Hub.'
  },
  {
    question: 'What is your Meta Ads management framework?',
    answer: 'We begin with a full audit of your Conversion API pixel tracking, construct high-intent custom demographics, produce scroll-stopping creative hooks, conduct multivariate A/B tests, and scale budgets strictly on winning ROAS campaigns.'
  },
  {
    question: 'Where is Monolith LK based and do you work internationally?',
    answer: 'Monolith LK is headquartered in Kurunegala, Sri Lanka, with regional engineering hubs in Giriulla and Colombo. We architect high-throughput digital systems for clients across Sri Lanka, Australia, the United States, the UK, and globally.'
  }
];

export const CLIENT_LOGOS = [
  { name: 'Beauty Basket', image: '/client-logo-1.webp' },
  { name: 'Holistica Herbal', image: '/client-logo-2.webp' },
  { name: 'Apex Global', image: '/assets/partner-1.png' },
  { name: 'Meta Partner', image: '/assets/partner-2.png' },
  { name: 'Shopify Plus', image: '/assets/partner-3.png' }
];

export const STUDIO_OFFICES = [
  {
    city: 'Kurunegala (HQ)',
    address: 'Central Architecture Labs, Negombo Road',
    region: 'Kurunegala, Sri Lanka (7.4863° N, 80.3623° E)',
    phone: '+94 76 591 7189'
  },
  {
    city: 'Giriulla',
    address: 'Engineering & Distributed Systems Hub',
    region: 'Giriulla, Sri Lanka (7.3297° N, 80.1260° E)',
    phone: '+94 76 591 7189'
  },
  {
    city: 'Colombo',
    address: '148 Galle Road, Suite 5B',
    region: 'Colombo 03, Sri Lanka (6.9271° N, 79.8612° E)',
    phone: '+94 76 591 7189'
  }
];
