import React, { useEffect, useState } from 'react';

interface PreloaderProps {
  onComplete?: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [percent, setPercent] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isHidden, setIsHidden] = useState(() => {
    return !!sessionStorage.getItem('median_preloader_seen');
  });

  useEffect(() => {
    if (isHidden) {
      if (onComplete) onComplete();
      return;
    }

    const duration = 680; // Crisp, snappy GPU-driven counter
    let startTime: number | null = null;
    let rafId: number | null = null;
    let cancelled = false;

    const markDoneEarlyOnScroll = () => {
      if ((window.scrollY || window.pageYOffset) > 5) {
        cancelled = true;
        if (rafId) cancelAnimationFrame(rafId);
        setPercent(100);
        setIsExiting(true);
        (window as unknown as { __median_preloader_done?: boolean }).__median_preloader_done = true;
        window.dispatchEvent(new CustomEvent('median_preloader_done'));
      }
    };
    window.addEventListener('scroll', markDoneEarlyOnScroll, { passive: true });

    let lastShown = -1;
    const step = (timestamp: number) => {
      if (cancelled) return;
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic for silky counter momentum
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextVal = Math.min(100, Math.round(eased * 100));

      if (nextVal !== lastShown) {
        lastShown = nextVal;
        setPercent(nextVal);
      }

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', markDoneEarlyOnScroll);
    };
  }, [isHidden, onComplete]);

  useEffect(() => {
    if (percent === 100 && !isHidden) {
      let revealTimer: number | null = null;
      let hideTimer: number | null = null;

      const exitTimer = window.setTimeout(() => {
        setIsExiting(true);
        // Fire hero reveal slightly into the curtain lift so GPU never battles both simultaneously
        revealTimer = window.setTimeout(() => {
          (window as unknown as { __median_preloader_done?: boolean }).__median_preloader_done = true;
          window.dispatchEvent(new CustomEvent('median_preloader_done'));
        }, 120);

        hideTimer = window.setTimeout(() => {
          setIsHidden(true);
          sessionStorage.setItem('median_preloader_seen', 'true');
          if (onComplete) onComplete();
        }, 620);
      }, 140);

      return () => {
        window.clearTimeout(exitTimer);
        if (revealTimer) window.clearTimeout(revealTimer);
        if (hideTimer) window.clearTimeout(hideTimer);
      };
    }
  }, [percent, isHidden, onComplete]);

  if (isHidden) return null;

  const formatted = String(percent).padStart(3, '0');
  const d1 = formatted[0];
  const d2 = formatted[1];
  const d3 = formatted[2];

  return (
    <div
      className={`fixed inset-0 z-[9990] bg-median-taupe text-white flex flex-col justify-between p-6 sm:p-8 md:p-16 transition-transform duration-600 ease-[cubic-bezier(0.85,0,0.15,1)] will-change-transform select-none ${
        isExiting ? '-translate-y-full' : 'translate-y-0'
      }`}
      style={{ backfaceVisibility: 'hidden', transitionDuration: '600ms' }}
    >
      {/* Background Architectural Grid Lines */}
      <div className="absolute inset-0 pointer-events-none flex justify-between px-6 md:px-16 overflow-hidden opacity-25">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className={`w-[1px] h-full bg-white/40 ${
              i % 2 === 0 ? 'opacity-80' : 'opacity-40'
            }`}
          />
        ))}
      </div>

      {/* Top Header */}
      <div className="relative z-10 flex justify-between items-center text-xs tracking-widest font-semibold text-white/80">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>MONOLITH LK</span>
        </div>
        <div className="hidden sm:block">HAUTE EDITORIAL ENGINEERING</div>
        <div>2024–2026 EDITION</div>
      </div>

      {/* Center Big Rolling Numbers */}
      <div className="relative z-10 flex items-baseline justify-center font-oswald text-7xl sm:text-9xl md:text-[14rem] leading-none tracking-tight tabular-nums">
        <div className="relative h-[1em] overflow-hidden inline-flex">
          <span>{d1}</span>
        </div>
        <div className="relative h-[1em] overflow-hidden inline-flex">
          <span>{d2}</span>
        </div>
        <div className="relative h-[1em] overflow-hidden inline-flex">
          <span>{d3}</span>
        </div>
        <span className="text-3xl sm:text-5xl md:text-7xl font-light ml-2 text-white/70">
          %
        </span>
      </div>

      {/* Bottom Status Bar (Pure GPU scaleX bar instead of width layout reflow!) */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center text-xs tracking-wider text-white/80 gap-3 border-t border-white/20 pt-4">
        <div>
          <span>SOFTWARE ENGINEERING &amp; DIGITAL SYSTEMS</span>
        </div>
        <div className="w-48 bg-white/20 h-1 rounded-full overflow-hidden">
          <div
            className="bg-white h-full w-full origin-left will-change-transform"
            style={{ transform: `scaleX(${percent / 100})` }}
          />
        </div>
        <div>LOADING ASSETS &amp; MOTION TOKENS</div>
      </div>
    </div>
  );
};
