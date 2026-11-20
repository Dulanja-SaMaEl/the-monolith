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
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-20">
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
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-24">
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
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
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
        <div className="max-w-7xl mx-auto px-6 md:px-12">
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

      {/* Full Team Directory */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-28">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
          <ScrollReveal variant="fade-up" duration={800}>
            <span className="text-xs font-bold tracking-widest uppercase text-median-taupe/70 block mb-2">
              The Minds Behind Monolith LK
            </span>
            <h2 className="font-oswald text-4xl sm:text-6xl font-bold uppercase tracking-tight text-black">
              The Team
            </h2>
          </ScrollReveal>
        </div>

        <StaggerContainer
          staggerDelay={160}
          variant="scale-up"
          duration={850}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {TEAM_MEMBERS.map((member) => (
            <div
              key={member.id}
              className="p-8 rounded-2xl bg-white border border-median-taupe/20 hover:border-median-taupe transition-all shadow-sm h-full"
            >
              <div className="aspect-[4/5] rounded-xl overflow-hidden mb-6 bg-median-taupe/10 border border-median-taupe/15">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="font-oswald text-2xl font-bold uppercase text-black">
                {member.name}
              </h3>
              <span className="text-xs font-semibold text-median-taupe uppercase block mt-1">
                {member.role}
              </span>
              <p className="text-xs text-black/75 font-normal leading-relaxed mt-3">
                {member.bio}
              </p>
            </div>
          ))}
        </StaggerContainer>
      </section>

      {/* Rotating Ribbons Banner */}
      <ScrollReveal variant="scale-up" duration={1000}>
        <RotatingRibbons navigate={navigate} />
      </ScrollReveal>
    </div>
  );
};
