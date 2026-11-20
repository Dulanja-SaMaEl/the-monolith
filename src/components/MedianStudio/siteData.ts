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

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
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

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'dulan-founder',
    name: 'Dulan',
    role: 'Founder & Growth Architect',
    image: '/founder.webp',
    bio: 'Visionary engineer & performance strategist with over 45 successful growth systems deployed across Sri Lanka, UAE, and the USA.'
  },
  {
    id: 'sithum-perera-creative-tech',
    name: 'Sithum Perera',
    role: 'Lead Creative Technologist',
    image: '/3d-developer.webp',
    bio: 'Specialist in hardware-accelerated 3D graphics, Three.js shaders, and buttery-smooth spatial web interfaces.'
  },
  {
    id: 'kavinda-fernando-media',
    name: 'Kavinda Fernando',
    role: 'Head of Media & Ads',
    image: '/assets/team-2.jpg',
    bio: 'Direct-response performance marketing lead with an average 4.8X blended ROAS across e-commerce and high-ticket B2B.'
  }
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
      name: 'Dulan',
      role: 'Founder & Growth Architect',
      avatar: '/founder.webp'
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
      name: 'Kavinda Fernando',
      role: 'Head of Media & Ads',
      avatar: '/assets/team-2.jpg'
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
    answer: 'Monolith LK provides full-spectrum digital growth systems: High-Performance Web & E-Commerce Engineering (React, Next.js, Headless Shopify), Performance Meta Advertising, Cinematic Video Production, and Haute Editorial Brand Design.'
  },
  {
    question: 'How long does a website take to build and launch?',
    answer: 'High-converting single-page landing experiences and conversion funnels launch within 1 to 2 weeks. Comprehensive multi-page platforms and custom e-commerce stores take between 3 to 5 weeks, complete with SEO foundations and sub-1.2s speed audits.'
  },
  {
    question: 'What makes Monolith LK different from traditional agencies?',
    answer: 'We eliminate the disconnect between pretty design and ruthless performance. You do not get passed off to junior account managers—you get direct WhatsApp communication with Founder Dulan, weekly sprint reviews, and 24/7 access to your private Client Hub.'
  },
  {
    question: 'What is your Meta Ads management framework?',
    answer: 'We begin with a full audit of your Conversion API pixel tracking, construct high-intent custom demographics, produce scroll-stopping creative hooks, conduct multivariate A/B tests, and scale budgets strictly on winning ROAS campaigns.'
  },
  {
    question: 'Where is Monolith LK based and do you work internationally?',
    answer: 'Our primary studio is located in Colombo, Sri Lanka, with global operating hubs in Dubai and London. We work with clients across Sri Lanka, Australia, the United States, the UK, and the Middle East.'
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
    city: 'Colombo',
    address: '148 Galle Road, Suite 5B',
    region: 'Colombo 03, Sri Lanka',
    phone: '+94 76 096 7884'
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
