import React from 'react';
import { ScrollReveal } from './ScrollReveal';

interface FooterProps {
  navigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="bg-white text-median-taupe border-t border-median-taupe/20 pt-20 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-median-taupe/15">
          {/* Visit Us Column (8 cols) */}
          <div className="md:col-span-7 lg:col-span-8">
            <ScrollReveal variant="badge-drop" delay={0}>
              <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-median-taupe text-xs font-bold tracking-widest uppercase mb-8">
                Visit Us
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <ScrollReveal variant="card-flip-left" delay={100}>
                <div className="space-y-2">
                  <span className="font-oswald text-lg font-semibold text-black uppercase block border-b border-median-taupe/40 pb-1 w-fit">
                    Colombo
                  </span>
                  <p className="text-xs text-median-taupe/80 leading-relaxed font-normal">
                    148 Galle Road, Suite 5B
                    <br />
                    Colombo 03, Sri Lanka
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal variant="card-lift" delay={200}>
                <div className="space-y-2">
                  <span className="font-oswald text-lg font-semibold text-black uppercase block border-b border-median-taupe/40 pb-1 w-fit">
                    Dubai
                  </span>
                  <p className="text-xs text-median-taupe/80 leading-relaxed font-normal">
                    Business Bay, Bay Square 12
                    <br />
                    Level 14, Dubai, UAE
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal variant="card-flip-right" delay={300}>
                <div className="space-y-2">
                  <span className="font-oswald text-lg font-semibold text-black uppercase block border-b border-median-taupe/40 pb-1 w-fit">
                    London
                  </span>
                  <p className="text-xs text-median-taupe/80 leading-relaxed font-normal">
                    24 Old Street, Shoreditch
                    <br />
                    EC1V 9AB, London, UK
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>

          {/* Stay in Touch Column (4 cols) */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col justify-start">
            <ScrollReveal variant="badge-drop" delay={150}>
              <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-median-taupe text-xs font-bold tracking-widest uppercase mb-8 w-fit">
                Stay in Touch
              </div>
            </ScrollReveal>

            <div className="space-y-4">
              <ScrollReveal variant="horizontal-slide-right" delay={250}>
                <div>
                  <a
                    href="tel:+94765917189"
                    className="font-oswald text-2xl font-semibold text-black hover:text-median-taupe transition-colors block border-b border-median-taupe/40 pb-1 w-fit"
                  >
                    +94 76 591 7189
                  </a>
                </div>
              </ScrollReveal>
              <ScrollReveal variant="horizontal-slide-right" delay={340}>
                <div>
                  <a
                    href="mailto:contact@monolith.lk"
                    className="font-oswald text-2xl font-semibold text-black hover:text-median-taupe transition-colors block border-b border-median-taupe/40 pb-1 w-fit"
                  >
                    contact@monolith.lk
                  </a>
                </div>
              </ScrollReveal>
              <ScrollReveal variant="blur-focus" delay={420}>
                <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-median-taupe">
                  <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-black">
                    Twitter / X
                  </a>
                  <span>•</span>
                  <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-black">
                    LinkedIn
                  </a>
                  <span>•</span>
                  <a href="https://dribbble.com" target="_blank" rel="noreferrer" className="hover:text-black">
                    Dribbble
                  </a>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Legal Links */}
        <ScrollReveal variant="fade-up" delay={200} duration={650}>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-median-taupe/70 gap-4">
            <p>
              © 2026 Monolith LK Studio. Contemporary architectural design & digital engineering.
            </p>

            <div className="flex items-center gap-6">
              <button
                onClick={() => {
                  navigate('/style-guide');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                data-cursor="pointer"
                className="hover:text-black underline decoration-median-taupe transition-colors"
              >
                Style Guide
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  navigate('/pricing');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                data-cursor="pointer"
                className="hover:text-black underline decoration-median-taupe transition-colors"
              >
                Licensing & Pricing
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  navigate('/services');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                data-cursor="pointer"
                className="hover:text-black underline decoration-median-taupe transition-colors"
              >
                Services
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  navigate('/about');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                data-cursor="pointer"
                className="hover:text-black underline decoration-median-taupe transition-colors"
              >
                About Studio
              </button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
};
