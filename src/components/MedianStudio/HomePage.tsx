import React, { useState } from 'react';
import { PROJECTS, CLIENT_LOGOS, TEAM_MEMBERS, BLOG_POSTS, Project, BlogPost } from './siteData';
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

        {/* Mouse Scroll Indicator */}
        <ScrollReveal variant="fade-up" delay={620} duration={800}>
          <div
            onClick={scrollToServices}
            data-cursor="pointer"
            className="mt-12 flex flex-col items-center gap-2 cursor-pointer group opacity-75 hover:opacity-100 transition-opacity"
          >
            <div className="w-5 h-8 rounded-full border-2 border-median-taupe flex items-start justify-center p-1">
              <span className="w-1 h-2 rounded-full bg-median-taupe animate-bounce" />
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-median-taupe">
              Scroll
            </span>
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
                  Capabilities & Practices
                </span>
              </ScrollReveal>
              <ScrollReveal variant="split-mask" delay={100} duration={850}>
                <h2 className="font-oswald text-4xl sm:text-6xl font-bold uppercase tracking-tight text-black">
                  Thorough top quality solutions
                </h2>
              </ScrollReveal>
            </div>
            <ScrollReveal variant="horizontal-slide-right" delay={180} duration={850}>
              <p className="text-xs sm:text-sm text-median-taupe/80 max-w-md font-normal leading-relaxed">
                We engineer bespoke digital identities, robust technical architectures, and high-conversion e-commerce systems with obsessive attention to craftsmanship.
              </p>
            </ScrollReveal>
          </div>

          {/* 3 Service Columns - Outer 3D Cards + Inner Staggered Data Loading */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: '01',
                title: 'Product Design',
                variant: 'card-flip-left' as RevealVariant,
                icon: '/assets/ico-1.png',
                description: 'End-to-end design thinking from preliminary discovery and research to high-fidelity design systems and interactive prototypes.',
                bullets: ['Branding and Identity', 'Logo Design', 'User Interface Design', 'UX Architecture & Wireframing'],
              },
              {
                num: '02',
                title: 'Website Design',
                variant: 'card-lift' as RevealVariant,
                icon: '/assets/ico-2.png',
                description: 'Bespoke web platforms engineered with modern frameworks, silky smooth animations, fluid responsiveness, and high speed.',
                bullets: ['Responsive Web Design', 'Webflow & React Engineering', 'Creative GSAP Interactions', 'CMS & Store Integration'],
              },
              {
                num: '03',
                title: 'Marketing',
                variant: 'card-flip-right' as RevealVariant,
                icon: '/assets/ico-3.png',
                description: 'Strategic market positioning and campaign architecture designed to capture attention and convert audiences organically.',
                bullets: ['Brand Strategy', 'Digital Launch Campaigns', 'Content Direction', 'Organic Growth Engineering'],
              },
            ].map((srv, idx) => {
              const baseDelay = idx * 140;
              return (
                <ScrollReveal
                  key={srv.num}
                  variant={srv.variant}
                  delay={baseDelay}
                  duration={950}
                  className="h-full"
                >
                  <div className="group p-8 md:p-10 rounded-2xl border border-median-taupe/20 bg-white hover:border-median-taupe hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full">
                    <div>
                      <ScrollReveal variant="counter-pop" delay={baseDelay + 120} duration={800}>
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-median-taupe/15">
                          <span className="w-10 h-10 rounded-full border border-median-taupe text-xs font-bold flex items-center justify-center text-black group-hover:bg-median-taupe group-hover:text-white transition-colors">
                            {srv.num}
                          </span>
                          <img
                            src={srv.icon}
                            alt={srv.title}
                            className="w-10 h-10 object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                          />
                        </div>
                      </ScrollReveal>

                      <ScrollReveal variant="skew-up" delay={baseDelay + 200} duration={800}>
                        <h3 className="font-oswald text-2xl sm:text-3xl font-bold uppercase text-black mb-3">
                          {srv.title}
                        </h3>
                      </ScrollReveal>

                      <ScrollReveal variant="blur-focus" delay={baseDelay + 280} duration={850}>
                        <p className="text-xs sm:text-sm text-median-taupe/80 font-normal leading-relaxed mb-6">
                          {srv.description}
                        </p>
                      </ScrollReveal>
                    </div>

                    <ul className="space-y-2 border-t border-median-taupe/15 pt-6 text-xs text-black font-semibold uppercase">
                      {srv.bullets.map((b, bIdx) => (
                        <ScrollReveal
                          key={bIdx}
                          variant="horizontal-slide-left"
                          delay={baseDelay + 340 + bIdx * 70}
                          duration={750}
                        >
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-median-taupe" />
                            <span>{b}</span>
                          </li>
                        </ScrollReveal>
                      ))}
                    </ul>
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
                <span>Explore All Works</span>
                <span>→</span>
              </button>
            </ScrollReveal>
          </div>

          {/* 6 Projects Grid - Distinct Card & Inner Data Animations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PROJECTS.map((proj, idx) => {
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

          {/* 3 Team Members with 3D Tilt + Inner Portrait & Bio Data Animations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TEAM_MEMBERS.map((member, idx) => {
              const teamVariants: RevealVariant[] = [
                'card-flip-left',
                'card-lift',
                'card-flip-right',
              ];
              const variant = teamVariants[idx % teamVariants.length];
              const baseDelay = idx * 140;

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
                    <ScrollReveal variant="curtain-expand" delay={baseDelay + 120} duration={850}>
                      <div className="aspect-[4/5] w-full rounded-xl overflow-hidden bg-median-taupe/10 mb-6 border border-median-taupe/15">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    </ScrollReveal>

                    <div>
                      <ScrollReveal variant="skew-up" delay={baseDelay + 220} duration={800}>
                        <h3 className="font-oswald text-2xl font-bold uppercase text-black group-hover:text-median-taupe transition-colors">
                          {member.name}
                        </h3>
                      </ScrollReveal>
                      <ScrollReveal variant="horizontal-slide-left" delay={baseDelay + 300} duration={800}>
                        <span className="text-xs font-semibold uppercase text-median-taupe/80 block mt-1">
                          {member.role}
                        </span>
                      </ScrollReveal>
                      <ScrollReveal variant="blur-focus" delay={baseDelay + 380} duration={850}>
                        <p className="text-xs text-median-taupe/70 font-normal leading-relaxed mt-3">
                          {member.bio}
                        </p>
                      </ScrollReveal>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= AWARDS SECTION WITH ANIMATED COUNTERS ================= */}
      <section className="py-24 border-t border-median-taupe/20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <ScrollReveal variant="badge-drop" duration={750}>
              <span className="text-xs font-bold tracking-widest uppercase text-median-taupe/70 block mb-2">
                Industry Recognition
              </span>
            </ScrollReveal>
            <ScrollReveal variant="split-mask" delay={100} duration={850}>
              <h2 className="font-oswald text-4xl sm:text-6xl font-bold uppercase tracking-tight text-black">
                You get results, we get awards
              </h2>
            </ScrollReveal>
          </div>

          {/* Awards: Distinct Outer Card Physics + Inner Counter Pop & Description Blur */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { title: 'Awwards', count: 14, desc: 'Site of the Day & Developer Honors', variant: 'counter-pop' as RevealVariant },
              { title: 'CSS Design Awards', count: 34, desc: 'Special Kudos & Best UI/UX Innovation', variant: 'card-lift' as RevealVariant },
              { title: 'The FWA', count: 7, desc: 'FWA of the Day & Cutting-Edge Craft', variant: 'zoom-rotate' as RevealVariant },
            ].map((award, idx) => {
              const baseDelay = idx * 140;
              return (
                <ScrollReveal
                  key={idx}
                  variant={award.variant}
                  delay={baseDelay}
                  duration={950}
                  className="h-full"
                >
                  <div className="p-8 md:p-12 rounded-2xl border border-median-taupe/20 bg-median-taupe/5 hover:border-median-taupe hover:bg-white transition-all duration-300 group h-full">
                    <ScrollReveal variant="badge-drop" delay={baseDelay + 140} duration={750}>
                      <h3 className="font-oswald text-2xl font-bold uppercase text-black mb-4">
                        {award.title}
                      </h3>
                    </ScrollReveal>
                    <ScrollReveal variant="counter-pop" delay={baseDelay + 240} duration={850}>
                      <div className="font-oswald text-7xl sm:text-8xl font-bold text-median-taupe my-2 group-hover:scale-105 transition-transform">
                        <CountingNumber value={award.count} duration={1800} />
                      </div>
                    </ScrollReveal>
                    <ScrollReveal variant="blur-focus" delay={baseDelay + 340} duration={800}>
                      <p className="text-xs text-median-taupe/70 font-normal uppercase tracking-wider mt-2">
                        {award.desc}
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
