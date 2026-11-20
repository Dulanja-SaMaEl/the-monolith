import React, { useEffect } from 'react';
import { SERVICES } from './siteData';
import { ScrollReveal, StaggerContainer } from './ScrollReveal';

interface ServicesPageProps {
  navigate: (route: string) => void;
  initialSection?: string;
}

// Stack & Technical Arsenal tags mapped to each practice
const PRACTICE_TECH_STACK: Record<string, string[]> = {
  'custom-software-engineering': [
    'Laravel 11 (Core)',
    'Next.js 16 / React 19',
    'PostgreSQL ACID Transactions',
    'Redis Redlock Distributed Mutex',
    'BullMQ / Laravel Queues',
    'High-Concurrency Microservices',
    'REST & GraphQL APIs',
    'PWA & Zero-Reload State',
  ],
  'ai-data-machine-learning': [
    'Custom Vector RAG Pipelines',
    'PyTorch & Scikit-Learn',
    'Private Vector DBs (pgvector / Pinecone)',
    'Real-Time NLP & Sentiment Parsing',
    'Distributed Web Scraping & Crawling',
    'OCR & Edge Video Stream Ingestion',
    'Predictive Demand Regression',
    'Autonomous LLM Agent Triage',
  ],
  'cloud-infrastructure-devops': [
    'AWS / GCP / Azure Multi-Region',
    'Kubernetes (EKS / GKE) Self-Healing',
    'Docker Containerization',
    'GitHub Actions / GitLab CI',
    'Terraform Infrastructure as Code',
    'Zero-Downtime Blue/Green Deployments',
    'Serverless Event Topology',
    'Prometheus & Grafana Telemetry',
  ],
  'cybersecurity-risk-management': [
    'Zero-Trust Null-Field Perimeters',
    'JA3/JA4 TLS Fingerprint Mimicry',
    'Automated Red Teaming & Penetration',
    'Distributed Mutex Anti-Double-Claim',
    'HIPAA Clinical Data Compliance',
    'SOC2 & GDPR Immutable Audit Logs',
    'Hardware Token 2FA (TOTP Engine)',
    'WAF Bypasses & Anti-Bot Defense',
  ],
  'managed-it-post-launch': [
    '24/7 SLA Telemetry Clusters',
    '< 45 Min Critical Incident Response',
    'Encrypted Offsite Multi-Region Snapshots',
    'Automated Table Vacuuming & DB Tuning',
    'Live Dependency & CVE Patching',
    'Sub-Second Health Ping Heartbeats',
    'Continuous Feature Sprints',
    'Ledger Zero-Discrepancy Auditing',
  ],
  'strategy-ui-ux-consulting': [
    '8pt Swiss Spatial Grid System',
    'Tactile Glassmorphism & Micro-Depth',
    'WCAG AA Accessibility Compliance',
    'P99 Millisecond Latency Profiling',
    'Interactive Figma Prototypes',
    'Information Architecture & Journey Mapping',
    'Design Tokens & Typography Rules',
    'Monolith Studio OS Design Standards',
  ],
  'brand-growth-marketing-creative': [
    'Tactical Editorial Event Flyers',
    'Luxury Vector Brand Identity Systems',
    'High-Yield Meta (FB/IG) Ad Campaigns',
    'Google Ads & Search Conversion Funnels',
    'Canva (Advanced) & Adobe Illustrator',
    'Adobe Photoshop Commercial Retouching',
    'Print-Ready CMYK Press Specs',
    'Multi-Channel Growth Calendars',
  ],
};

const PRACTICE_ENGAGEMENT_MODELS: Record<string, { model: string; leadTime: string; sla: string }> = {
  'custom-software-engineering': {
    model: 'Bespoke Engineering Sprint or Dedicated Squad',
    leadTime: 'Immediate Architecture Kickoff (2-4 Weeks)',
    sla: '99.98% Transaction Uptime Guarantee',
  },
  'ai-data-machine-learning': {
    model: 'Iterative Vector Pipeline Proof of Concept + Production Scale',
    leadTime: 'Model Prototyping (1-3 Weeks)',
    sla: 'Sub-Second Token Inference Latency',
  },
  'cloud-infrastructure-devops': {
    model: 'Deterministic Migration Audit & Infrastructure as Code',
    leadTime: 'Cluster Provisioning (48-72 Hours)',
    sla: 'Zero-Cutover Downtime SLA',
  },
  'cybersecurity-risk-management': {
    model: 'Offensive Penetration Audit & Perimeter Hardening',
    leadTime: 'Comprehensive Vulnerability Dossier (5-10 Days)',
    sla: 'Zero-Exploit Guarantee & Remediation',
  },
  'managed-it-post-launch': {
    model: 'Around-the-Clock Managed SRE Contract',
    leadTime: 'Continuous 24/7 Monitoring',
    sla: 'Sub-45 Minute Critical Triage Response',
  },
  'strategy-ui-ux-consulting': {
    model: 'Interactive Prototype Sprint & Design System Handover',
    leadTime: 'Comprehensive Wireframes & Tokens (2 Weeks)',
    sla: '60fps Interaction & WCAG AA Compliance',
  },
  'brand-growth-marketing-creative': {
    model: 'Full Brand Identity Suite & Paid Acquisition Orchestration',
    leadTime: 'Campaign Creative Dispatch (3-7 Days)',
    sla: 'Guaranteed Positive ROAS & Editorial Parity',
  },
};

export const ServicesPage: React.FC<ServicesPageProps> = ({ navigate, initialSection }) => {
  useEffect(() => {
    const targetId =
      initialSection ||
      (typeof window !== 'undefined' && window.location.hash.includes('#/services#')
        ? window.location.hash.split('#/services#')[1]
        : '');
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 250);
      }
    }
  }, [initialSection]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="pt-32 pb-24 bg-white text-median-taupe font-inter selection:bg-median-taupe selection:text-white">
      {/* ================= HERO HEADER ================= */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-16">
        <ScrollReveal variant="scale-up" duration={900}>
          <div className="border border-median-taupe/20 rounded-3xl p-8 sm:p-16 relative bg-median-taupe/5">
            {/* Architectural Corner Accents */}
            <span className="absolute -top-2.5 -left-2.5 w-5 h-5 border-2 border-median-taupe bg-white shadow-sm" />
            <span className="absolute -top-2.5 -right-2.5 w-5 h-5 border-2 border-median-taupe bg-white shadow-sm" />
            <span className="absolute -bottom-2.5 -left-2.5 w-5 h-5 border-2 border-median-taupe bg-white shadow-sm" />
            <span className="absolute -bottom-2.5 -right-2.5 w-5 h-5 border-2 border-median-taupe bg-white shadow-sm" />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <span className="text-xs font-bold tracking-widest uppercase text-median-taupe block mb-4">
                  Engineering Capabilities & Practice Specifications
                </span>
                <h1 className="font-oswald text-5xl sm:text-7xl md:text-8xl font-bold uppercase tracking-tight text-black leading-none mb-6">
                  Our Services
                </h1>
                <p className="text-sm sm:text-lg text-black/85 max-w-2xl font-normal leading-relaxed">
                  In-depth architectural breakdown across Monolith LK's seven multidisciplinary divisions: high-concurrency transactional systems, private vector RAG models, zero-downtime cloud infrastructure, low-level security mimicry, managed SLA telemetry, Swiss typographic UI/UX, and tactical editorial marketing.
                </p>
              </div>

              {/* Quick Commission CTA */}
              <div className="shrink-0">
                <button
                  onClick={() => {
                    navigate('/contact');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-6 py-3.5 rounded-full border border-black bg-black text-white hover:bg-median-taupe hover:border-median-taupe font-oswald text-xs sm:text-sm uppercase tracking-wider font-bold transition-all shadow-md flex items-center gap-2"
                >
                  <span>Inquire Architecture Sprint</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ================= PRACTICE JUMP BAR (FAST-NAVIGATION) ================= */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-20 sticky top-20 z-30 pointer-events-auto">
        <div className="p-3 rounded-2xl bg-white/90 backdrop-blur-md border border-median-taupe/20 shadow-lg shadow-median-taupe/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-median-taupe px-3 shrink-0 hidden md:block">
            Jump to Practice:
          </span>
          {SERVICES.map((srv) => (
            <button
              key={srv.id}
              onClick={() => scrollToSection(srv.id)}
              className="px-3.5 py-1.5 rounded-xl border border-median-taupe/20 hover:border-median-taupe bg-median-taupe/5 hover:bg-white text-xs font-mono font-semibold uppercase text-black hover:text-median-taupe transition-colors shrink-0 flex items-center gap-1.5"
            >
              <span className="text-median-taupe font-bold">{srv.num}</span>
              <span className="truncate max-w-[140px] sm:max-w-none">{srv.title.split(',')[0]}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ================= DETAILED SERVICES BREAKDOWN ================= */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 space-y-24">
        {SERVICES.map((srv, idx) => {
          const stack = PRACTICE_TECH_STACK[srv.id] || [];
          const engagement = PRACTICE_ENGAGEMENT_MODELS[srv.id] || {
            model: 'Custom Engineering Contract',
            leadTime: 'Immediate Triage',
            sla: 'Guaranteed Delivery',
          };

          return (
            <div
              key={srv.id}
              id={srv.id}
              className="scroll-mt-36 p-8 sm:p-14 rounded-3xl border border-median-taupe/20 bg-white shadow-xl shadow-median-taupe/5 relative"
            >
              {/* Practice Watermark Number */}
              <span className="absolute top-6 right-8 font-oswald text-8xl sm:text-9xl font-bold text-median-taupe/10 select-none pointer-events-none">
                {srv.num}
              </span>

              {/* Practice Header */}
              <div className="relative z-10 max-w-4xl mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-10 h-10 rounded-full border border-median-taupe text-xs font-bold flex items-center justify-center text-median-taupe bg-median-taupe/5 font-mono">
                    {srv.num}
                  </span>
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-median-taupe/70 bg-median-taupe/5 border border-median-taupe/20 px-3.5 py-1 rounded-full">
                    Core Division {srv.num} / 07
                  </span>
                </div>

                <h2 className="font-oswald text-3xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tight text-black mb-3">
                  {srv.title}
                </h2>
                <span className="text-xs sm:text-sm font-mono font-bold text-median-taupe uppercase tracking-wider block mb-6">
                  {srv.tagline}
                </span>

                <p className="text-sm sm:text-base text-black/85 leading-relaxed font-normal">
                  {srv.description}
                </p>
              </div>

              {/* Specialized Practice Modules (In-Depth Grid) */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-median-taupe/15">
                  <h3 className="font-oswald text-xl sm:text-2xl font-bold uppercase text-black">
                    Specialized Practice Modules
                  </h3>
                  <span className="text-xs font-mono text-median-taupe/70 uppercase">
                    4 Modular Workstreams
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {srv.capabilities.map((cap, cIdx) => (
                    <div
                      key={cIdx}
                      className="p-6 rounded-2xl border border-median-taupe/20 bg-[#FAF8F5] hover:border-median-taupe hover:bg-white transition-all duration-300 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-mono font-bold text-median-taupe bg-white border border-median-taupe/30 px-2 py-0.5 rounded">
                            MODULE {srv.num}.{cIdx + 1}
                          </span>
                          <span className="text-[10px] font-mono uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                            Production Ready
                          </span>
                        </div>

                        <h4 className="font-oswald text-xl font-bold uppercase text-black mb-2">
                          {cap.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-black/80 font-normal leading-relaxed">
                          {cap.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-median-taupe/15 text-[10px] font-mono text-median-taupe/70 uppercase">
                        Zero-Loss Handover · Deterministic Quality Gate
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Arsenal & Infrastructure Stack */}
              <div className="mb-12 p-6 rounded-2xl bg-median-taupe/5 border border-median-taupe/20">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-black block mb-3">
                  Technical Arsenal & Infrastructure Topology
                </span>
                <div className="flex flex-wrap gap-2">
                  {stack.map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-3 py-1.5 rounded-xl border border-median-taupe/30 bg-white text-xs font-mono font-semibold text-black uppercase shadow-2xs hover:border-black transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Engagement Model & Bottom Actions */}
              <div className="pt-6 border-t border-median-taupe/15 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-median-taupe/70 block uppercase text-[10px] font-bold">Engagement Model</span>
                    <span className="font-semibold text-black">{engagement.model}</span>
                  </div>
                  <div>
                    <span className="text-median-taupe/70 block uppercase text-[10px] font-bold">Deployment Lead Time</span>
                    <span className="font-semibold text-black">{engagement.leadTime}</span>
                  </div>
                  <div>
                    <span className="text-median-taupe/70 block uppercase text-[10px] font-bold">Operational Guarantee</span>
                    <span className="font-semibold text-black">{engagement.sla}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => {
                      navigate('/portal/login');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-4 py-2.5 rounded-xl border border-median-taupe text-black hover:bg-median-taupe hover:text-white font-oswald text-xs uppercase tracking-wider transition-colors font-bold"
                  >
                    Open Client Portal
                  </button>
                  <button
                    onClick={() => {
                      navigate('/contact');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-5 py-2.5 rounded-xl bg-black text-white hover:bg-median-taupe font-oswald text-xs uppercase tracking-wider transition-colors font-bold flex items-center gap-1.5"
                  >
                    <span>Commission Practice</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* ================= FINAL ARCHITECTURAL CONVERSION BANNER ================= */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mt-24">
        <ScrollReveal variant="badge-drop" duration={800}>
          <div className="rounded-3xl border border-median-taupe/30 bg-[#FAF8F5] p-10 sm:p-16 text-center shadow-lg relative overflow-hidden">
            <span className="text-xs font-bold tracking-widest uppercase text-median-taupe block mb-4">
              Direct Architectural Engagement
            </span>
            <h2 className="font-oswald text-4xl sm:text-6xl font-bold uppercase tracking-tight text-black mb-6 max-w-2xl mx-auto">
              Ready to Architect Your Enterprise Infrastructure?
            </h2>
            <p className="text-xs sm:text-base text-black/80 max-w-xl mx-auto leading-relaxed mb-8">
              Speak directly with Dulanja Abeysinghe (Principal Systems Architect) and Remashi Diyana (Head of Creative Strategy) to scope your technical pipeline.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => {
                  navigate('/contact');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-8 py-4 rounded-xl bg-black text-white font-oswald text-sm uppercase tracking-widest hover:bg-median-taupe transition-colors shadow-md"
              >
                Schedule Architecture Consultation →
              </button>
              <button
                onClick={() => {
                  navigate('/work');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-8 py-4 rounded-xl border border-median-taupe text-black font-oswald text-sm uppercase tracking-widest hover:bg-median-taupe hover:text-white transition-colors"
              >
                Explore 12 Live Case Studies
              </button>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
};
