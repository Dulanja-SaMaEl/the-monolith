import React, { useState } from 'react';
import { PROJECTS, CLIENT_LOGOS, TEAM_MEMBERS, BLOG_POSTS, SERVICES, Project, BlogPost, ServiceItem } from './siteData';
import { RotatingRibbons } from './RotatingRibbons';
import { ProjectDetailModal } from './ProjectDetailModal';
import { ArticleReaderModal } from './ArticleReaderModal';
import { ScrollReveal, CountingNumber, RevealVariant } from './ScrollReveal';

interface HomePageProps {
  navigate: (route: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [, setActiveTeamId] = useState<string>(TEAM_MEMBERS[0].id);

  const scrollToServices = () => {
    const el = document.getElementById('services-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative overflow-hidden bg-white">
      {/* Background Architectural Grid Lines */}
      <div className="absolute inset-0 pointer-events-none flex justify-between px-6 md:px-12 max-w-7xl mx-auto overflow-hidden opacity-10">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-[1px] h-full bg-median-taupe" />
        ))}
      </div>

      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[92vh] flex flex-col justify-center items-center text-center px-6 pt-32 pb-20">
        <ScrollReveal variant="blur-focus" duration={950} className="relative max-w-5xl w-full mx-auto">
          {/* Outer framing box with corner geometric markers */}
          <div className="relative py-12 md:py-20 px-6 sm:px-12 border border-median-taupe/20 rounded-2xl bg-white/50 backdrop-blur-[2px]">
            {/* 4 Corner Geometric Square Accents */}
            <span className="absolute -top-2.5 -left-2.5 w-5 h-5 border-2 border-median-taupe bg-white shadow-sm" />
            <span className="absolute -top-2.5 -right-2.5 w-5 h-5 border-2 border-median-taupe bg-white shadow-sm" />
            <span className="absolute -bottom-2.5 -left-2.5 w-5 h-5 border-2 border-median-taupe bg-white shadow-sm" />
            <span className="absolute -bottom-2.5 -right-2.5 w-5 h-5 border-2 border-median-taupe bg-white shadow-sm" />

            {/* Subtitle tag with smooth spring drop */}
            <ScrollReveal variant="badge-drop" delay={80} duration={800}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-median-taupe/40 text-xs font-semibold tracking-widest uppercase mb-8 text-median-taupe">
                <span className="w-2 h-2 rounded-full bg-median-taupe animate-pulse" />
                Independent Creative Agency & Studio
              </div>
            </ScrollReveal>

            {/* Massive Typographic Headline with Split-Mask Line Revelations */}
            <h1 className="font-oswald text-5xl sm:text-7xl md:text-9xl font-bold uppercase tracking-tight text-black leading-[0.9] select-none">
              <ScrollReveal variant="split-mask" delay={160} duration={850}>
                <span className="block hover:text-median-taupe transition-colors duration-300">The digital</span>
              </ScrollReveal>
              <ScrollReveal variant="split-mask" delay={280} duration={850}>
                <span className="block hover:text-median-taupe transition-colors duration-300">innovation</span>
              </ScrollReveal>
              <ScrollReveal variant="split-mask" delay={400} duration={850}>
                <span className="block hover:text-median-taupe transition-colors duration-300">studio</span>
              </ScrollReveal>
            </h1>

            {/* Action Button with spring scale */}
            <ScrollReveal variant="counter-pop" delay={520} duration={850}>
              <div className="mt-12 flex justify-center">
                <button
                  onClick={scrollToServices}
                  data-cursor="pointer"
                  className="group flex items-center gap-4 px-8 py-4 rounded-full bg-median-taupe hover:bg-black text-white text-xs font-bold tracking-widest uppercase transition-all duration-300 shadow-md hover:shadow-xl"
                >
                  <span>Discover Services</span>
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold group-hover:translate-y-1 transition-transform">
                    ↓
                  </span>
                </button>
              </div>
            </ScrollReveal>
          </div>
        </ScrollReveal>
      </section>

      {/* ================= SECTION 1: SERVICES ================= */}
      <section id="services-section" className="py-24 md:py-32 border-t border-median-taupe/20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Header with Distinct Eyebrow, Split-Mask Title, and Opposing Slide Intro */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <ScrollReveal variant="badge-drop" duration={750}>
                <span className="text-xs font-bold tracking-widest uppercase text-median-taupe/70 block mb-2">
                  Capabilities & Architectural Practices
                </span>
              </ScrollReveal>
              <ScrollReveal variant="split-mask" delay={100} duration={850}>
                <h2 className="font-oswald text-4xl sm:text-6xl font-bold uppercase tracking-tight text-black">
                  Our Services & Practices
                </h2>
              </ScrollReveal>
            </div>
            <ScrollReveal variant="horizontal-slide-right" delay={180} duration={850}>
              <p className="text-xs sm:text-sm text-median-taupe/80 max-w-md font-normal leading-relaxed">
                From bespoke enterprise transactional applications and custom generative AI/RAG models to zero-downtime cloud infrastructure, low-level security mimicry, and high-impact editorial brand marketing.
              </p>
            </ScrollReveal>
          </div>

          {/* 7 Comprehensive Practice Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((srv, idx) => {
              const baseDelay = (idx % 3) * 120;
              const isFullSpan = idx === 6; // 7th service spans full row on large screens for editorial balance

              return (
                <ScrollReveal
                  key={srv.id}
                  variant="fade-up"
                  delay={baseDelay}
                  duration={900}
                  className={isFullSpan ? 'md:col-span-2 lg:col-span-3' : 'h-full'}
                >
                  <div className="group p-8 md:p-10 rounded-3xl border border-median-taupe/20 bg-white hover:border-median-taupe hover:shadow-2xl transition-all duration-300 flex flex-col justify-between h-full relative">
                    {/* Architectural Corner Accents */}
                    <span className="absolute -top-2 -left-2 w-3.5 h-3.5 border-2 border-median-taupe bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="absolute -top-2 -right-2 w-3.5 h-3.5 border-2 border-median-taupe bg-white opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div>
                      {/* Top Header Pill */}
                      <div className="flex items-center justify-between mb-6 pb-4 border-b border-median-taupe/15">
                        <span className="w-10 h-10 rounded-full border border-median-taupe text-xs font-bold flex items-center justify-center text-black group-hover:bg-median-taupe group-hover:text-white transition-colors">
                          {srv.num}
                        </span>
                        <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-median-taupe/70 bg-median-taupe/5 border border-median-taupe/20 px-3 py-1 rounded-full">
                          Practice {srv.num}
                        </span>
                      </div>

                      {/* Title & Tagline */}
                      <h3 className="font-oswald text-2xl sm:text-3xl font-bold uppercase text-black group-hover:text-median-taupe transition-colors mb-2">
                        {srv.title}
                      </h3>
                      <span className="text-[11px] font-mono font-semibold text-median-taupe uppercase tracking-wider block mb-4">
                        {srv.tagline}
                      </span>

                      {/* Overview Paragraph */}
                      <p className="text-xs sm:text-sm text-median-taupe/85 font-normal leading-relaxed mb-6">
                        {srv.description}
                      </p>

                      {/* Sub-Capabilities List */}
                      <div className="pt-6 border-t border-median-taupe/15">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-median-taupe/70 block mb-3">
                          Specialized Practice Modules:
                        </span>
                        <div className={isFullSpan ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3' : 'space-y-3'}>
                          {srv.capabilities.map((cap, cIdx) => (
                            <div
                              key={cIdx}
                              className="p-3.5 rounded-xl bg-median-taupe/5 border border-median-taupe/15 hover:border-median-taupe/40 transition-colors"
                            >
                              <h4 className="font-oswald text-sm font-bold uppercase text-black mb-1">
                                {cap.title}
                              </h4>
                              <p className="text-[11px] text-black/75 font-normal leading-relaxed">
                                {cap.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="mt-8 pt-5 border-t border-median-taupe/15 flex items-center justify-between">
                      <button
                        onClick={() => {
                          navigate('/contact');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-xs font-bold uppercase text-black hover:text-median-taupe underline decoration-median-taupe flex items-center gap-1.5 transition-colors"
                      >
                        <span>Scope Practice Inquiries</span>
                        <span>→</span>
                      </button>
                      <span className="font-mono text-[11px] text-median-taupe/60 font-semibold">
                        {srv.num} / 07
                      </span>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= SECTION 2: FEATURED WORK ================= */}
      <section className="py-24 md:py-32 bg-median-taupe/5 border-t border-median-taupe/20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
            <div>
              <ScrollReveal variant="badge-drop" duration={750}>
                <span className="text-xs font-bold tracking-widest uppercase text-median-taupe/70 block mb-2">
                  Selected Work
                </span>
              </ScrollReveal>
              <ScrollReveal variant="split-mask" delay={100} duration={850}>
                <h2 className="font-oswald text-4xl sm:text-6xl font-bold uppercase tracking-tight text-black">
                  Featured Projects
                </h2>
              </ScrollReveal>
            </div>

            <ScrollReveal variant="horizontal-slide-right" delay={180} duration={800}>
              <button
                onClick={() => {
                  navigate('/work');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                data-cursor="pointer"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black hover:text-median-taupe underline decoration-median-taupe"
              >
                <span>Explore All 12 Works</span>
                <span>→</span>
              </button>
            </ScrollReveal>
          </div>

          {/* 6 Featured Flagships Grid - Distinct Card & Inner Data Animations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PROJECTS.slice(0, 6).map((proj, idx) => {
              const projectVariants: RevealVariant[] = [
                'curtain-expand',
                'card-lift',
                'zoom-rotate',
                'horizontal-slide-left',
                'counter-pop',
                'horizontal-slide-right',
              ];
              const cardVariant = projectVariants[idx % projectVariants.length];
              const colDelay = (idx % 3) * 130;

              return (
                <ScrollReveal
                  key={proj.id}
                  variant={cardVariant}
                  delay={colDelay}
                  duration={950}
                  className="h-full"
                >
                  <div
                    onClick={() => setSelectedProject(proj)}
                    data-cursor="work"
                    className="group cursor-pointer flex flex-col justify-between rounded-2xl bg-white border border-median-taupe/20 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 h-full"
                  >
                    {/* Image Wrap */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-median-taupe/10">
                      <img
                        src={proj.image}
                        alt={proj.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4">
                        <ScrollReveal variant="badge-drop" delay={colDelay + 180} duration={750}>
                          <span className="inline-block px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[11px] font-bold uppercase text-median-taupe shadow-sm">
                            {proj.tag}
                          </span>
                        </ScrollReveal>
                      </div>
                    </div>

                    {/* Info Card Data */}
                    <div className="p-6 sm:p-8 flex flex-col justify-between flex-1">
                      <div>
                        <ScrollReveal variant="fade-left" delay={colDelay + 220} duration={750}>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-median-taupe/70 block mb-1">
                            {proj.category}
                          </span>
                        </ScrollReveal>
                        <ScrollReveal variant="skew-up" delay={colDelay + 280} duration={800}>
                          <h3 className="font-oswald text-2xl font-bold uppercase text-black group-hover:text-median-taupe transition-colors">
                            {proj.title}
                          </h3>
                        </ScrollReveal>
                        {proj.metrics && (
                          <div className="mt-2 text-[10px] font-mono font-semibold text-median-taupe/90 bg-median-taupe/5 border border-median-taupe/20 px-2.5 py-1 rounded-md line-clamp-1">
                            ⚡ {proj.metrics.split('•')[0]}
                          </div>
                        )}
                      </div>

                      <ScrollReveal variant="fade-up" delay={colDelay + 360} duration={750}>
                        <div className="mt-6 pt-4 border-t border-median-taupe/15 flex items-center justify-between text-xs text-median-taupe/80">
                          <span>{proj.client}</span>
                          <span className="font-bold text-black font-oswald text-sm">
                            {proj.year}
                          </span>
                        </div>
                      </ScrollReveal>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= SECTION 3: FEATURED CLIENTS ================= */}
      <section className="py-20 border-y border-median-taupe/20 bg-white">
        <ScrollReveal variant="split-mask" duration={850} className="max-w-7xl mx-auto px-6 md:px-12 text-center mb-10">
          <h2 className="font-oswald text-2xl font-bold uppercase tracking-widest text-median-taupe">
            Featured Clients & Partners
          </h2>
        </ScrollReveal>

        {/* Continuous Logo Carousel with Focus Dissolve Entrance */}
        <ScrollReveal variant="blur-focus" delay={160} duration={950} className="relative overflow-hidden py-4 select-none">
          <div className="flex whitespace-nowrap animate-marquee-left hover:[animation-play-state:paused]">
            {[...CLIENT_LOGOS, ...CLIENT_LOGOS, ...CLIENT_LOGOS].map((client, idx) => (
              <div
                key={idx}
                className="inline-flex items-center justify-center px-10 sm:px-16 opacity-75 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
              >
                <img
                  src={client.image}
                  alt={client.name}
                  className="h-8 sm:h-10 object-contain max-w-[140px]"
                />
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* ================= SECTION 4: PHILOSOPHY & TESTIMONIAL ================= */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <ScrollReveal variant="badge-drop" duration={750}>
              <span className="inline-flex items-center px-4 py-1.5 rounded-full border border-median-taupe text-xs font-bold tracking-widest uppercase">
                Philosophy
              </span>
            </ScrollReveal>

            <ScrollReveal variant="split-mask" delay={100} duration={850}>
              <h3 className="font-oswald text-4xl sm:text-6xl font-bold uppercase tracking-tight text-black leading-tight">
                Digital Visual Mastery
              </h3>
            </ScrollReveal>

            <ScrollReveal variant="horizontal-slide-left" delay={180} duration={850}>
              <p className="text-sm sm:text-base text-median-taupe/90 font-normal leading-relaxed">
                We believe that the human dimension is essential to start any successful project and that this is where authentic innovation takes root.
              </p>
            </ScrollReveal>

            <ScrollReveal variant="blur-focus" delay={260} duration={850}>
              <p className="text-sm sm:text-base text-median-taupe/90 font-normal leading-relaxed">
                Intuition and strategy integrate the research methodology that we also apply to traditional media, synthesizing architectural clarity with high tactile digital motion.
              </p>
            </ScrollReveal>

            {/* Testimonial Quote - 3D Perspective Angle Flip + Inner Data Reveal */}
            <ScrollReveal variant="card-flip-left" delay={340} duration={950}>
              <blockquote className="mt-8 p-8 border-l-4 border-median-taupe bg-median-taupe/5 rounded-r-2xl space-y-3 shadow-sm">
                <ScrollReveal variant="skew-up" delay={440} duration={800}>
                  <p className="font-oswald text-2xl sm:text-3xl text-black font-normal leading-snug">
                    “Monolith LK is an absolute game changer in high-performance digital architecture.”
                  </p>
                </ScrollReveal>
                <ScrollReveal variant="horizontal-slide-right" delay={520} duration={800}>
                  <div className="flex items-center gap-3 pt-2">
                    <img
                      src="/assets/ceo.png"
                      alt="Jackson Doe"
                      className="w-10 h-10 rounded-full object-cover border border-median-taupe"
                    />
                    <div>
                      <h4 className="font-oswald text-base font-bold uppercase text-black">
                        Jackson Doe
                      </h4>
                      <span className="text-xs text-median-taupe/70 font-semibold uppercase">
                        CEO & Founder, Horizon Studio
                      </span>
                    </div>
                  </div>
                </ScrollReveal>
              </blockquote>
            </ScrollReveal>
          </div>

          {/* Right Image Feature - Curtain Shutter Expand */}
          <div className="lg:col-span-5 relative">
            <ScrollReveal variant="curtain-expand" delay={180} duration={950}>
              <div className="relative rounded-2xl overflow-hidden border border-median-taupe/20 shadow-2xl aspect-[4/5] bg-median-taupe/10">
                <img
                  src="/assets/photo-1.jpg"
                  alt="Philosophy Craft"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-8 text-white">
                  <ScrollReveal variant="fade-up" delay={420} duration={800}>
                    <span className="font-oswald text-lg uppercase tracking-wide block">
                      Obsession with every pixel & hairline
                    </span>
                  </ScrollReveal>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ================= TEAM SECTION ================= */}
      <section className="py-24 border-t border-median-taupe/20 bg-median-taupe/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
            <div>
              <ScrollReveal variant="badge-drop" duration={750}>
                <span className="text-xs font-bold tracking-widest uppercase text-median-taupe/70 block mb-2">
                  Leadership
                </span>
              </ScrollReveal>
              <ScrollReveal variant="split-mask" delay={100} duration={850}>
                <h2 className="font-oswald text-4xl sm:text-6xl font-bold uppercase tracking-tight text-black">
                  The Team
                </h2>
              </ScrollReveal>
            </div>
            <ScrollReveal variant="horizontal-slide-right" delay={180} duration={850}>
              <p className="text-xs sm:text-sm text-median-taupe/80 max-w-sm font-normal">
                A tight-knit collective of multidisciplinary architects, designers, and creative engineers.
              </p>
            </ScrollReveal>
          </div>

          {/* 2 Co-Founders with High-Craft Architectural Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {TEAM_MEMBERS.map((member, idx) => {
              const teamVariants: RevealVariant[] = [
                'card-flip-left',
                'card-flip-right',
              ];
              const variant = teamVariants[idx % teamVariants.length];
              const baseDelay = idx * 160;

              return (
                <ScrollReveal
                  key={member.id}
                  variant={variant}
                  delay={baseDelay}
                  duration={950}
                  className="h-full"
                >
                  <div
                    onMouseEnter={() => setActiveTeamId(member.id)}
                    className="group p-6 sm:p-8 rounded-2xl bg-white border border-median-taupe/20 hover:border-median-taupe transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between h-full"
                  >
                    <div>
                      <ScrollReveal variant="curtain-expand" delay={baseDelay + 120} duration={850}>
                        <div className="aspect-[4/5] w-full rounded-xl overflow-hidden bg-median-taupe/10 mb-6 border border-median-taupe/15 relative">
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest text-median-taupe border border-median-taupe/30 shadow-sm">
                            Co-Founder
                          </span>
                        </div>
                      </ScrollReveal>

                      <ScrollReveal variant="skew-up" delay={baseDelay + 220} duration={800}>
                        <div className="text-[11px] font-mono tracking-wider text-median-taupe/70 mb-1.5 uppercase flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-median-taupe animate-pulse" />
                          <span>{member.coordinates}</span>
                        </div>
                        <h3 className="font-oswald text-2xl sm:text-3xl font-bold uppercase text-black group-hover:text-median-taupe transition-colors">
                          {member.name}
                        </h3>
                      </ScrollReveal>
                      <ScrollReveal variant="horizontal-slide-left" delay={baseDelay + 300} duration={800}>
                        <span className="text-xs font-semibold uppercase text-median-taupe block mt-1">
                          {member.role}
                        </span>
                      </ScrollReveal>

                      {/* Primary Academic Badge */}
                      {member.academic && member.academic[0] && (
                        <div className="mt-3 text-[11px] text-black/80 bg-median-taupe/5 border border-median-taupe/20 px-3 py-1.5 rounded-lg font-normal leading-relaxed">
                          {member.academic[0]}
                        </div>
                      )}

                      <ScrollReveal variant="blur-focus" delay={baseDelay + 380} duration={850}>
                        <p className="text-xs text-median-taupe/80 font-normal leading-relaxed mt-3">
                          {member.bio}
                        </p>
                      </ScrollReveal>

                      {/* Mastery Pill Preview */}
                      <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-median-taupe/15">
                        {member.mastery.slice(0, 4).map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border border-median-taupe/30 text-median-taupe bg-median-taupe/5"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer link to full dossier */}
                    <div className="mt-6 pt-4 border-t border-median-taupe/15 flex items-center justify-between text-xs font-bold uppercase text-black">
                      <button
                        onClick={() => {
                          navigate('/about');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="hover:text-median-taupe underline decoration-median-taupe flex items-center gap-1.5 transition-colors"
                      >
                        <span>Full Architectural Dossier</span>
                        <span>→</span>
                      </button>
                      <span className="font-mono text-[10px] text-median-taupe/60">
                        0{idx + 1} / 02
                      </span>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= SECTION: OUR RESULTS WITH ANIMATED COUNTERS ================= */}
      <section className="py-24 border-t border-median-taupe/20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <ScrollReveal variant="badge-drop" duration={750}>
              <span className="text-xs font-bold tracking-widest uppercase text-median-taupe/70 block mb-2">
                Measurable Impact
              </span>
            </ScrollReveal>
            <ScrollReveal variant="split-mask" delay={100} duration={850}>
              <h2 className="font-oswald text-4xl sm:text-6xl font-bold uppercase tracking-tight text-black">
                Our Results
              </h2>
            </ScrollReveal>
          </div>

          {/* Results: Distinct Outer Card Physics + Inner Counter Pop & Description Blur */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              {
                title: 'Customers',
                count: 15,
                suffix: '+',
                desc: 'Active Enterprise Clients & Strategic Partners',
                variant: 'counter-pop' as RevealVariant,
              },
              {
                title: 'Transactions Processed',
                count: 50,
                suffix: 'K+',
                desc: 'Sub-Second Top-ups & High-Frequency API Dispatches',
                variant: 'card-lift' as RevealVariant,
              },
              {
                title: 'System Uptime & Integrity',
                count: 99.98,
                decimals: 2,
                suffix: '%',
                desc: 'Fault-Tolerant Microservices & Zero-Loss Ledger Locks',
                variant: 'zoom-rotate' as RevealVariant,
              },
            ].map((result, idx) => {
              const baseDelay = idx * 140;
              return (
                <ScrollReveal
                  key={idx}
                  variant={result.variant}
                  delay={baseDelay}
                  duration={950}
                  className="h-full"
                >
                  <div className="p-8 md:p-12 rounded-2xl border border-median-taupe/20 bg-median-taupe/5 hover:border-median-taupe hover:bg-white transition-all duration-300 group h-full flex flex-col justify-between">
                    <div>
                      <ScrollReveal variant="badge-drop" delay={baseDelay + 140} duration={750}>
                        <h3 className="font-oswald text-xl sm:text-2xl font-bold uppercase text-black mb-4">
                          {result.title}
                        </h3>
                      </ScrollReveal>
                      <ScrollReveal variant="counter-pop" delay={baseDelay + 240} duration={850}>
                        <div className="font-oswald text-6xl sm:text-7xl lg:text-8xl font-bold text-median-taupe my-2 group-hover:scale-105 transition-transform">
                          <CountingNumber
                            value={result.count}
                            suffix={result.suffix}
                            decimals={result.decimals}
                            duration={1800}
                          />
                        </div>
                      </ScrollReveal>
                    </div>
                    <ScrollReveal variant="blur-focus" delay={baseDelay + 340} duration={800}>
                      <p className="text-xs text-median-taupe/70 font-normal uppercase tracking-wider mt-4">
                        {result.desc}
                      </p>
                    </ScrollReveal>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= LATEST NEWS (BLOG) ================= */}
      <section className="py-24 border-t border-median-taupe/20 bg-median-taupe/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
            <div>
              <ScrollReveal variant="badge-drop" duration={750}>
                <span className="text-xs font-bold tracking-widest uppercase text-median-taupe/70 block mb-2">
                  Insights & Discourse
                </span>
              </ScrollReveal>
              <ScrollReveal variant="split-mask" delay={100} duration={850}>
                <h2 className="font-oswald text-4xl sm:text-6xl font-bold uppercase tracking-tight text-black">
                  Latest News
                </h2>
              </ScrollReveal>
            </div>

            <ScrollReveal variant="horizontal-slide-right" delay={180} duration={800}>
              <button
                onClick={() => {
                  navigate('/blog');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                data-cursor="pointer"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black hover:text-median-taupe underline decoration-median-taupe"
              >
                <span>View All Articles</span>
                <span>→</span>
              </button>
            </ScrollReveal>
          </div>

          {/* Article 1 slides from Left, Article 2 slides from Right + Inner Content Cascade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {BLOG_POSTS.map((post, idx) => {
              const articleVariant: RevealVariant = idx % 2 === 0 ? 'horizontal-slide-left' : 'horizontal-slide-right';
              const baseDelay = idx * 150;

              return (
                <ScrollReveal
                  key={post.id}
                  variant={articleVariant}
                  delay={baseDelay}
                  duration={950}
                  className="h-full"
                >
                  <article
                    onClick={() => setSelectedPost(post)}
                    data-cursor="pointer"
                    className="group cursor-pointer rounded-2xl bg-white border border-median-taupe/20 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full"
                  >
                    <ScrollReveal variant="curtain-expand" delay={baseDelay + 120} duration={850}>
                      <div className="aspect-[16/9] w-full overflow-hidden bg-median-taupe/10">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    </ScrollReveal>

                    <div className="p-8">
                      <ScrollReveal variant="badge-drop" delay={baseDelay + 220} duration={750}>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="px-3 py-1 rounded-full border border-median-taupe text-[10px] font-bold uppercase text-median-taupe">
                            {post.category}
                          </span>
                          <span className="text-xs text-median-taupe/60 font-semibold uppercase">
                            {post.date}
                          </span>
                        </div>
                      </ScrollReveal>

                      <ScrollReveal variant="skew-up" delay={baseDelay + 300} duration={800}>
                        <h3 className="font-oswald text-2xl sm:text-3xl font-bold uppercase text-black group-hover:text-median-taupe transition-colors mb-3">
                          {post.title}
                        </h3>
                      </ScrollReveal>

                      <ScrollReveal variant="blur-focus" delay={baseDelay + 380} duration={850}>
                        <p className="text-xs sm:text-sm text-median-taupe/80 font-normal leading-relaxed line-clamp-2">
                          {post.summary}
                        </p>
                      </ScrollReveal>

                      <ScrollReveal variant="fade-up" delay={baseDelay + 450} duration={750}>
                        <div className="mt-6 pt-4 border-t border-median-taupe/15 flex items-center justify-between text-xs font-bold uppercase text-black">
                          <span>Read Article</span>
                          <span className="group-hover:translate-x-2 transition-transform">→</span>
                        </div>
                      </ScrollReveal>
                    </div>
                  </article>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= ROTATING RIBBONS BANNER ================= */}
      <ScrollReveal variant="ribbon-twist" duration={950}>
        <RotatingRibbons navigate={navigate} />
      </ScrollReveal>

      {/* Modals */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
      <ArticleReaderModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </div>
  );
};
