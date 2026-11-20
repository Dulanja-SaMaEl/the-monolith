import React from 'react';
import { RotatingRibbons } from './RotatingRibbons';
import { ScrollReveal, StaggerContainer } from './ScrollReveal';

interface StyleGuidePageProps {
  navigate: (route: string) => void;
}

export const StyleGuidePage: React.FC<StyleGuidePageProps> = ({ navigate }) => {
  return (
    <div className="pt-32 pb-16 bg-white text-median-taupe">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-16">
        <ScrollReveal variant="scale-up" duration={900}>
          <div className="border border-median-taupe/20 rounded-2xl p-8 sm:p-16 relative bg-median-taupe/5">
            <span className="absolute -top-2.5 -left-2.5 w-5 h-5 border-2 border-median-taupe bg-white shadow-sm" />
            <span className="absolute -top-2.5 -right-2.5 w-5 h-5 border-2 border-median-taupe bg-white shadow-sm" />
            <span className="absolute -bottom-2.5 -left-2.5 w-5 h-5 border-2 border-median-taupe bg-white shadow-sm" />
            <span className="absolute -bottom-2.5 -right-2.5 w-5 h-5 border-2 border-median-taupe bg-white shadow-sm" />

            <span className="text-xs font-bold tracking-widest uppercase text-median-taupe block mb-4">
              Design Tokens & Primitives
            </span>
            <h1 className="font-oswald text-5xl sm:text-7xl md:text-8xl font-bold uppercase tracking-tight text-black leading-none mb-6">
              Style Guide
            </h1>
            <p className="text-sm sm:text-lg text-black/85 max-w-2xl font-normal leading-relaxed">
              The foundational design system powering Monolith LK: curated color swatches, typographic hierarchy, button tokens, and structural components.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* ================= 1. COLOR TOKENS ================= */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-24">
        <ScrollReveal variant="fade-up" duration={700}>
          <div className="pb-4 mb-8 border-b border-median-taupe/20">
            <h2 className="font-oswald text-3xl font-bold uppercase text-black">
              01. Color Palette
            </h2>
          </div>
        </ScrollReveal>

        <StaggerContainer
          staggerDelay={120}
          variant="scale-up"
          duration={750}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            {
              name: 'Monolith Taupe / Bronze',
              hex: '#9F8170',
              bg: 'bg-median-taupe',
              text: 'text-white',
              role: 'Primary Brand Token (--color)',
            },
            {
              name: 'Pure Canvas White',
              hex: '#FFFFFF',
              bg: 'bg-white',
              text: 'text-black',
              border: 'border border-median-taupe/30',
              role: 'Surface Background (--black)',
            },
            {
              name: 'Stark Editorial Black',
              hex: '#000000',
              bg: 'bg-black',
              text: 'text-white',
              role: 'High Contrast Lines (--black-2)',
            },
            {
              name: 'Subtle Cream Tint',
              hex: '#FAF8F5',
              bg: 'bg-[#FAF8F5]',
              text: 'text-black',
              border: 'border border-median-taupe/30',
              role: 'Secondary Card Surfaces',
            },
          ].map((c) => (
            <div
              key={c.name}
              className="p-5 rounded-2xl border border-median-taupe/20 bg-white shadow-sm space-y-4 h-full"
            >
              <div
                className={`h-24 rounded-xl flex items-end p-3 ${c.bg} ${c.text} ${
                  c.border || ''
                } font-mono text-xs font-bold`}
              >
                {c.hex}
              </div>
              <div>
                <h4 className="font-oswald text-lg font-bold uppercase text-black">
                  {c.name}
                </h4>
                <p className="text-[11px] text-median-taupe/70 font-semibold uppercase mt-0.5">
                  {c.role}
                </p>
              </div>
            </div>
          ))}
        </StaggerContainer>
      </section>

      {/* ================= 2. TYPOGRAPHY SCALE ================= */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-24">
        <ScrollReveal variant="fade-up" duration={700}>
          <div className="pb-4 mb-8 border-b border-median-taupe/20">
            <h2 className="font-oswald text-3xl font-bold uppercase text-black">
              02. Typography Hierarchy
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={150} duration={850}>
          <div className="space-y-8 p-8 rounded-2xl border border-median-taupe/20 bg-median-taupe/5">
            <div className="border-b border-median-taupe/15 pb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-median-taupe/70 block mb-1">
                Heading 1 (Oswald Bold Uppercase) — 80px / 96px
              </span>
              <div className="font-oswald text-5xl sm:text-7xl font-bold uppercase text-black tracking-tight leading-none">
                The Digital Innovation Studio
              </div>
            </div>

            <div className="border-b border-median-taupe/15 pb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-median-taupe/70 block mb-1">
                Heading 2 (Oswald Bold Uppercase) — 48px / 56px
              </span>
              <div className="font-oswald text-4xl sm:text-5xl font-bold uppercase text-black tracking-tight">
                Thorough Top Quality Solutions
              </div>
            </div>

            <div className="border-b border-median-taupe/15 pb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-median-taupe/70 block mb-1">
                Heading 3 (Oswald SemiBold Uppercase) — 28px / 36px
              </span>
              <div className="font-oswald text-2xl sm:text-3xl font-bold uppercase text-black">
                01. Product Design & Design Systems
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-median-taupe/70 block mb-1">
                Body Text (Inter Tight Medium) — 16px / 1.6
              </span>
              <p className="text-base text-black/85 font-normal leading-relaxed max-w-3xl normal-case">
                Intuition and strategy integrate the research methodology that we also apply to traditional media. We believe that the human dimension is essential to start any successful project and that this is where true creativity thrives.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ================= 3. BUTTONS & PRIMITIVES ================= */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-28">
        <ScrollReveal variant="fade-up" duration={700}>
          <div className="pb-4 mb-8 border-b border-median-taupe/20">
            <h2 className="font-oswald text-3xl font-bold uppercase text-black">
              03. Buttons & Interactive Primitives
            </h2>
          </div>
        </ScrollReveal>

        <StaggerContainer
          staggerDelay={120}
          variant="scale-up"
          duration={750}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-center"
        >
          {/* Primary Button */}
          <div className="p-6 rounded-2xl border border-median-taupe/20 bg-white text-center space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-median-taupe/70 block">
              Primary Solid
            </span>
            <button
              data-cursor="pointer"
              className="w-full py-3.5 px-6 rounded-full bg-median-taupe hover:bg-black text-white text-xs font-bold uppercase tracking-widest transition-colors shadow-sm"
            >
              Discover Services
            </button>
          </div>

          {/* Secondary Button */}
          <div className="p-6 rounded-2xl border border-median-taupe/20 bg-white text-center space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-median-taupe/70 block">
              Inverted Contrast
            </span>
            <button
              data-cursor="pointer"
              className="w-full py-3.5 px-6 rounded-full bg-black hover:bg-median-taupe text-white text-xs font-bold uppercase tracking-widest transition-colors shadow-sm"
            >
              Explore Works
            </button>
          </div>

          {/* Outlined Pill */}
          <div className="p-6 rounded-2xl border border-median-taupe/20 bg-white text-center space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-median-taupe/70 block">
              Bordered Tag Pill
            </span>
            <button
              data-cursor="pointer"
              className="w-full py-3 px-6 rounded-full border border-median-taupe hover:bg-median-taupe hover:text-white text-black text-xs font-bold uppercase tracking-widest transition-colors"
            >
              UI/UX Design
            </button>
          </div>

          {/* Underlined Link */}
          <div className="p-6 rounded-2xl border border-median-taupe/20 bg-white text-center space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-median-taupe/70 block">
              Editorial Underline
            </span>
            <button
              data-cursor="pointer"
              className="text-xs font-bold uppercase tracking-wider text-black hover:text-median-taupe underline decoration-median-taupe underline-offset-4"
            >
              View Case Study →
            </button>
          </div>
        </StaggerContainer>
      </section>

      {/* Rotating Ribbons */}
      <ScrollReveal variant="scale-up" duration={1000}>
        <RotatingRibbons navigate={navigate} />
      </ScrollReveal>
    </div>
  );
};
