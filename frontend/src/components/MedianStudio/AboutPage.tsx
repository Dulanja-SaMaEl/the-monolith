import React from 'react';
import { TEAM_MEMBERS } from './siteData';
import { RotatingRibbons } from './RotatingRibbons';
import { ScrollReveal, StaggerContainer, CountingNumber } from './ScrollReveal';

interface AboutPageProps {
  navigate: (route: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ navigate }) => {
  return (
    <div className="pt-32 pb-16 bg-white text-median-taupe">
      {/* Hero Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 mb-20">
        <ScrollReveal variant="scale-up" duration={900}>
          <div className="border border-median-taupe/20 rounded-2xl p-8 sm:p-16 relative bg-median-taupe/5">
            {/* Corner markers */}
            <span className="absolute -top-2.5 -left-2.5 w-5 h-5 border-2 border-median-taupe bg-white shadow-sm" />
            <span className="absolute -top-2.5 -right-2.5 w-5 h-5 border-2 border-median-taupe bg-white shadow-sm" />
            <span className="absolute -bottom-2.5 -left-2.5 w-5 h-5 border-2 border-median-taupe bg-white shadow-sm" />
            <span className="absolute -bottom-2.5 -right-2.5 w-5 h-5 border-2 border-median-taupe bg-white shadow-sm" />

            <span className="text-xs font-bold tracking-widest uppercase text-median-taupe block mb-4">
              Studio Identity & Manifesto
            </span>
            <h1 className="font-oswald text-5xl sm:text-7xl md:text-8xl font-bold uppercase tracking-tight text-black leading-none mb-6">
              About Monolith LK
            </h1>
            <p className="text-sm sm:text-lg text-black/85 max-w-2xl font-normal leading-relaxed">
              We are an independent creative agency and digital innovation studio dedicated to high-craft typography, spatial UI hierarchy, and performance-first web development.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* Metrics Grid with Animated Counters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 mb-24">
        <StaggerContainer
          staggerDelay={140}
          variant="scale-up"
          duration={800}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
        >
          {[
            { num: 14, suffix: '', label: 'International Design Honors' },
            { num: 120, suffix: '+', label: 'Delivered Flagship Systems' },
            { num: 99, suffix: '%', label: 'Long-Term Client Retention' },
            { num: 8, suffix: '', label: 'Years of Creative Engineering' },
          ].map((metric, idx) => (
            <div
              key={idx}
              className="p-8 rounded-2xl border border-median-taupe/20 bg-white shadow-sm hover:border-median-taupe transition-all group"
            >
              <div className="font-oswald text-5xl sm:text-6xl font-bold text-median-taupe mb-2 group-hover:scale-105 transition-transform">
                <CountingNumber value={metric.num} suffix={metric.suffix} duration={1600} />
              </div>
              <div className="text-xs font-semibold uppercase text-black">
                {metric.label}
              </div>
            </div>
          ))}
        </StaggerContainer>
      </section>

      {/* Story & Philosophy */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 mb-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6">
          <ScrollReveal variant="fade-down" duration={700}>
            <span className="px-4 py-1.5 rounded-full border border-median-taupe text-xs font-bold tracking-widest uppercase inline-block">
              Our Foundation
            </span>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={100} duration={800}>
            <h2 className="font-oswald text-4xl sm:text-5xl font-bold uppercase text-black leading-tight">
              Digital Visual Mastery
            </h2>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={200} duration={800}>
            <p className="text-sm sm:text-base text-black/80 font-normal leading-relaxed">
              Founded with the belief that modern software should feel tactile, editorial, and weightless, Monolith LK bridges the gap between Swiss typographic restraint and fluid motion graphics.
            </p>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={300} duration={800}>
            <p className="text-sm sm:text-base text-black/80 font-normal leading-relaxed">
              Every project begins by peeling back unnecessary fluff. We eliminate AI slop, bloated script libraries, and generic templates to architect timeless digital assets.
            </p>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={400} duration={800}>
            <div className="pt-4">
              <button
                onClick={() => {
                  navigate('/contact');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                data-cursor="pointer"
                className="px-8 py-4 rounded-full bg-median-taupe hover:bg-black text-white text-xs font-bold tracking-widest uppercase transition-all shadow-md"
              >
                Partner with Monolith LK
              </button>
            </div>
          </ScrollReveal>
        </div>

        <div className="lg:col-span-6">
          <ScrollReveal variant="fade-left" delay={250} duration={900}>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-median-taupe/20 shadow-2xl bg-median-taupe/10">
              <img
                src="/assets/photo-1.jpg"
                alt="Monolith LK Studio Workspace"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Pillars with Staggered Entrance */}
      <section className="bg-median-taupe/5 py-24 border-y border-median-taupe/20 mb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <ScrollReveal variant="fade-up" duration={800} className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest uppercase text-median-taupe/70 block mb-2">
              Our Methodology
            </span>
            <h2 className="font-oswald text-4xl sm:text-5xl font-bold uppercase text-black">
              Three Guiding Pillars
            </h2>
          </ScrollReveal>

          <StaggerContainer
            staggerDelay={160}
            variant="scale-up"
            duration={850}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                num: '01',
                title: 'Human-Centered Emotion',
                desc: 'Technology is cold until human intuition guides the pen. We create interfaces that evoke tactile joy, confidence, and calm.',
              },
              {
                num: '02',
                title: 'Zero-Lag Engineering',
                desc: 'Speed is UX. We adhere to 60fps animations, 99+ Core Web Vitals, and lightweight component structures without bloated third-party trackers.',
              },
              {
                num: '03',
                title: 'Commercial Longevity',
                desc: 'We do not chase fleeting micro-trends. We engineer cohesive visual languages that remain fresh and authoritative for years.',
              },
            ].map((pillar) => (
              <div
                key={pillar.num}
                className="p-8 sm:p-10 rounded-2xl bg-white border border-median-taupe/20 hover:border-median-taupe transition-all shadow-sm flex flex-col justify-between h-full"
              >
                <div>
                  <span className="w-10 h-10 rounded-full border border-median-taupe text-xs font-bold flex items-center justify-center text-median-taupe mb-6">
                    {pillar.num}
                  </span>
                  <h3 className="font-oswald text-2xl font-bold uppercase text-black mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-black/75 font-normal leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Full Team Directory & Founding Dossier */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 mb-28">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
          <ScrollReveal variant="fade-up" duration={800}>
            <span className="text-xs font-bold tracking-widest uppercase text-median-taupe/70 block mb-2">
              The Minds Behind Monolith LK
            </span>
            <h2 className="font-oswald text-4xl sm:text-6xl font-bold uppercase tracking-tight text-black">
              Founding Leadership
            </h2>
          </ScrollReveal>
          <ScrollReveal variant="horizontal-slide-right" delay={180} duration={850}>
            <p className="text-xs sm:text-sm text-median-taupe/80 max-w-sm font-normal">
              Direct-to-architect access. No account management layers, no generic templates, absolute engineering and creative fidelity.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {TEAM_MEMBERS.map((member, idx) => (
            <ScrollReveal
              key={member.id}
              variant={idx === 0 ? 'card-flip-left' : 'card-flip-right'}
              delay={idx * 160}
              duration={900}
              className="h-full"
            >
              <div className="p-8 sm:p-10 rounded-3xl bg-white border border-median-taupe/20 hover:border-median-taupe transition-all duration-300 shadow-sm hover:shadow-2xl flex flex-col justify-between h-full relative">
                {/* Architectural Corner Markers */}
                <span className="absolute -top-2.5 -left-2.5 w-4 h-4 border-2 border-median-taupe bg-white" />
                <span className="absolute -top-2.5 -right-2.5 w-4 h-4 border-2 border-median-taupe bg-white" />

                <div>
                  {/* Portrait & Identity Header */}
                  <div className="relative aspect-[16/11] rounded-2xl overflow-hidden mb-8 bg-median-taupe/10 border border-median-taupe/15">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest text-median-taupe border border-median-taupe/30 shadow-sm">
                      {member.id === 'dulanja-abeysinghe' ? 'Founder' : 'Co-Founder'}
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-black/75 backdrop-blur-md text-white text-[11px] font-mono tracking-wider flex items-center justify-between border border-white/10">
                      <span className="flex items-center gap-2 truncate">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span className="truncate">{member.coordinates}</span>
                      </span>
                    </div>
                  </div>

                  {/* Name & Role */}
                  <div className="mb-6">
                    <h3 className="font-oswald text-3xl sm:text-4xl font-bold uppercase text-black">
                      {member.name}
                    </h3>
                    <span className="text-xs sm:text-sm font-semibold text-median-taupe uppercase tracking-wider block mt-1">
                      {member.role}
                    </span>
                  </div>

                  {/* Contact Channels & Social Profiles */}
                  <div className="flex flex-wrap items-center gap-3 pb-6 border-b border-median-taupe/15">
                    <a
                      href={`mailto:${member.contact.email}`}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-median-taupe/40 hover:border-median-taupe hover:bg-median-taupe hover:text-white text-xs font-semibold text-black transition-colors"
                    >
                      <span>✉</span>
                      <span>{member.contact.email}</span>
                    </a>
                    {member.contact.phone && (
                      <a
                        href={`tel:${member.contact.phone.replace(/\s+/g, '')}`}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-median-taupe/40 hover:border-median-taupe hover:bg-median-taupe hover:text-white text-xs font-semibold text-black transition-colors"
                      >
                        <span>☎</span>
                        <span>{member.contact.phone}</span>
                      </a>
                    )}
                    {member.profiles.linkedin && (
                      <a
                        href={member.profiles.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-full bg-median-taupe/10 hover:bg-median-taupe hover:text-white text-xs font-bold uppercase tracking-wider text-median-taupe transition-colors"
                      >
                        LinkedIn ↗
                      </a>
                    )}
                    {member.profiles.github && (
                      <a
                        href={member.profiles.github}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-full bg-median-taupe/10 hover:bg-median-taupe hover:text-white text-xs font-bold uppercase tracking-wider text-median-taupe transition-colors"
                      >
                        GitHub ↗
                      </a>
                    )}
                  </div>

                  {/* Bio Prose */}
                  <div className="py-6 border-b border-median-taupe/15">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-median-taupe/70 block mb-2">
                      Architectural Profile
                    </span>
                    <p className="text-xs sm:text-sm text-black/80 font-normal leading-relaxed">
                      {member.bio}
                    </p>
                  </div>

                  {/* Academic Credentials & Honors */}
                  <div className="py-6 border-b border-median-taupe/15 space-y-3">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-median-taupe/70 block">
                      Academic Credentials & Honors
                    </span>
                    <ul className="space-y-2">
                      {member.academic.map((deg, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-2.5 text-xs text-black/85 font-normal leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-median-taupe mt-1.5 flex-shrink-0" />
                          <span>{deg}</span>
                        </li>
                      ))}
                    </ul>
                    {member.certifications && member.certifications.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {member.certifications.map((cert, cIdx) => (
                          <span
                            key={cIdx}
                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-median-taupe/5 border border-median-taupe/20 text-median-taupe"
                          >
                            ✓ {cert}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Career & Industry Track Record */}
                  <div className="py-6 border-b border-median-taupe/15 space-y-4">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-median-taupe/70 block">
                      Career & Industry Track Record
                    </span>
                    <div className="space-y-3">
                      {member.trackRecord.map((tr, tIdx) => (
                        <div
                          key={tIdx}
                          className="p-3.5 rounded-xl bg-median-taupe/5 border border-median-taupe/15 hover:border-median-taupe/40 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                            <h4 className="font-oswald text-sm font-bold uppercase text-black">
                              {tr.company}
                            </h4>
                            <span className="text-[11px] font-semibold text-median-taupe uppercase">
                              {tr.role}
                            </span>
                          </div>
                          <p className="text-[11px] sm:text-xs text-black/75 font-normal leading-relaxed">
                            {tr.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mastery Skills Cloud */}
                  <div className="pt-6">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-median-taupe/70 block mb-3">
                      Core Mastery & Domains
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {member.mastery.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[11px] font-semibold uppercase px-3 py-1 rounded-full border border-median-taupe/30 hover:border-median-taupe text-black bg-white hover:bg-median-taupe hover:text-white transition-all shadow-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Rotating Ribbons Banner */}
      <ScrollReveal variant="scale-up" duration={1000}>
        <RotatingRibbons navigate={navigate} />
      </ScrollReveal>
    </div>
  );
};
