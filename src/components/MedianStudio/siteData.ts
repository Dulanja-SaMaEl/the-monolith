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
    id: 'apex-global-ecommerce',
    title: 'Apex Global Commerce',
    category: 'Meta Ads & Headless Web',
    tag: 'E-Commerce',
    image: '/assets/work-6.jpg',
    year: '2024',
    client: 'Apex International',
    metrics: '5.8x ROAS • $840K Client Revenue',
    description: 'An avant-garde headless commerce architecture pairing sub-1.1s page speeds with precision Meta CAPI advertising across international markets.',
    deliverables: ['Headless React Store', 'Conversion API (CAPI) Pixel', 'Multivariate Creative Funnels', 'Stripe & Regional Checkout'],
    challenge: 'Scaling international checkout conversion while maintaining lightning-fast load speeds across high-latency mobile networks.',
    solution: 'Designed an ultra-lightweight React commerce stack with edge-cached product catalogs and automated retargeting loops.',
    quote: {
      text: 'Monolith LK transformed our digital storefront into our highest-yield sales engine within 60 days.',
      author: 'Marcus Sterling, Chief Commercial Officer'
    }
  },
  {
    id: 'neurosync-ai-platform',
    title: 'NeuroSync AI Platform',
    category: 'Web App & B2B Lead Funnel',
    tag: 'SaaS Platform',
    image: '/assets/work-4.jpg',
    year: '2024',
    client: 'NeuroSync Labs USA',
    metrics: '+340% Pipeline • $1.2M Contract Value',
    description: 'A tactile, interactive SaaS platform designed to capture high-intent enterprise buyers and turn casual traffic into booked sales calls.',
    deliverables: ['Next.js Interactive Platform', 'Tactile 3D Motion Core', 'B2B Funnel Optimization', 'Enterprise Lead Routing'],
    challenge: 'Explaining a complex multi-agent neural network architecture to enterprise decision-makers without friction.',
    solution: 'Built interactive 3D WebGL visualizations and streamlined single-action consultation flows that increased booking rates by 340%.'
  },
  {
    id: 'solaris-luxury-villas',
    title: 'Solaris Luxury Villas',
    category: 'Cinematic Branding & Web',
    tag: 'Hospitality',
    image: '/assets/work-2.jpg',
    year: '2024',
    client: 'Solaris Retreats Global',
    metrics: '$1.8M Direct Bookings • Zero OTA Fees',
    description: 'A luxury architectural portfolio and direct-booking portal for ultra-high-net-worth travelers, bypassing third-party OTA commissions entirely.',
    deliverables: ['3D Spatial Villa Walkthrough', 'Direct Booking Architecture', '4K Drone Media Production', 'High-Intent Meta Ad Suite'],
    challenge: 'Eliminating the 20% commission fee levied by Booking.com and Airbnb while attracting discerning direct luxury travelers.',
    solution: 'Engineered an opulent, tactile editorial booking site powered by targeted Meta paid acquisition in high-income international corridors.'
  },
  {
    id: 'beauty-basket-cosmetics',
    title: 'Beauty Basket Cosmetics',
    category: 'Paid Acquisition & Viral Media',
    tag: 'Meta Ads',
    image: '/assets/work-5.jpg',
    year: '2023',
    client: 'Beauty Basket Sri Lanka',
    metrics: '4.8x ROAS • Rs. 12M+ Revenue Tracked',
    description: 'High-growth cosmetic brand scaling through scroll-stopping short-form UGC reels, influencer integration, and dynamic retargeting.',
    deliverables: ['Viral Reels & TikTok Studio', 'Meta Ad Account Scaling', 'CAPI Server-Side Tracking', 'Abandon-Cart Recovery System'],
    challenge: 'Rising acquisition costs and heavy competition in the South Asian personal care and cosmetics market.',
    solution: 'Created continuous creative refreshes and tiered offer funnels, maintaining a profitable 4.8x blended ROAS across all seasons.'
  },
  {
    id: 'holistica-herbal-wellness',
    title: 'Holistica Herbal Wellness',
    category: 'Full-Stack E-Commerce',
    tag: 'Development',
    image: '/assets/work-1.jpg',
    year: '2024',
    client: 'Holistica Herbal Health',
    metrics: '99+ Lighthouse Score • +210% Conversion',
    description: 'Modern botanical wellness platform featuring frictionless 1-page checkout, localized currency routing, and certified organic storytelling.',
    deliverables: ['Custom Web Architecture', 'Core Web Vitals 99+ Audit', 'Automated WhatsApp Cart Sync', 'SEO Knowledge Hub'],
    challenge: 'A bloated legacy WooCommerce setup causing 6-second load times and severe mobile bounce rates.',
    solution: 'Rebuilt ground-up with modern high-speed React engineering, reducing latency to 0.9s and boosting mobile conversion by 210%.'
  },
  {
    id: 'ceylon-retail-group',
    title: 'Ceylon Retail Enterprise',
    category: 'Brand Identity & Lead Engine',
    tag: 'Growth System',
    image: '/assets/work-3.jpg',
    year: '2024',
    client: 'Ceylon Retail Conglomerate',
    metrics: '15+ Retail Locations Synced',
    description: 'A cohesive digital ecosystem unifying physical retail branches across Sri Lanka with an omnichannel customer inquiry and loyalty engine.',
    deliverables: ['Brand Design System', 'Branch Locator & Inquiries', 'Targeted Local Meta Ads', 'Lead Distribution Pipeline'],
    challenge: 'Inconsistent brand representation across regional stores and lost customer inquiries without centralized tracking.',
    solution: 'Established a strict editorial design system paired with automated WhatsApp customer support routing.'
  }
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'brand-digital-sprint',
    title: 'Brand & Digital Sprint',
    priceMonthly: 499,
    priceAnnual: 399,
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
    priceMonthly: 1299,
    priceAnnual: 1049,
    tagline: 'Complete performance marketing & web engineering for scaling brands',
    popular: true,
    features: [
      'Bespoke multi-page high-conversion web platform',
      'Active Meta advertising management & ROAS scaling',
      'Continuous monthly creative refreshes & video ad scripts',
      'Weekly sprint reviews with Founder Dulan',
      'Private 24/7 Client Hub portal & live ROAS telemetry',
      'Direct WhatsApp emergency line & priority turnaround'
    ]
  },
  {
    id: 'enterprise-omnichannel',
    title: 'Enterprise Omnichannel',
    priceMonthly: 2499,
    priceAnnual: 1999,
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
    role: 'Co-Founder & Principal Systems Architect',
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
      role: 'Co-Founder & Principal Systems Architect',
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
    answer: 'We eliminate the disconnect between pretty design and ruthless performance. You do not get passed off to junior account managers—you get direct WhatsApp communication with Co-Founders Dulanja Abeysinghe & Remashi Diyana, weekly sprint reviews, and 24/7 access to your private Client Hub.'
  },
  {
    question: 'What is your Meta Ads management framework?',
    answer: 'We begin with a full audit of your Conversion API pixel tracking, construct high-intent custom demographics, produce scroll-stopping creative hooks, conduct multivariate A/B tests, and scale budgets strictly on winning ROAS campaigns.'
  },
  {
    question: 'Where is Monolith LK based and do you work internationally?',
    answer: 'Our primary studio is located in Kurunegala / Colombo, Sri Lanka, with global operating hubs in Dubai and London. We work with clients across Sri Lanka, Australia, the United States, the UK, and the Middle East.'
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
    city: 'Kurunegala / Colombo',
    address: 'Monolith Architecture Labs, Central Hub',
    region: 'Kurunegala & Colombo, Sri Lanka (7.4863° N, 80.3623° E)',
    phone: '+94 76 591 7189'
  },
  {
    city: 'Dubai',
    address: 'Business Bay, Bay Square 12',
    region: 'Level 14, Dubai, UAE',
    phone: '+971 4 230 8910'
  },
  {
    city: 'London',
    address: '24 Old Street, Shoreditch',
    region: 'EC1V 9AB, London, UK',
    phone: '+44 20 7946 0912'
  }
];
