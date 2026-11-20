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

    // Fast counter up to 100
    const duration = 800; // 0.8 seconds
    const intervalTime = 20;
    const step = 100 / (duration / intervalTime);

    const markDoneEarlyOnScroll = () => {
      if ((window.scrollY || window.pageYOffset) > 5) {
        setPercent(100);
        setIsExiting(true);
        (window as unknown as { __median_preloader_done?: boolean }).__median_preloader_done = true;
        window.dispatchEvent(new CustomEvent('median_preloader_done'));
      }
    };
    window.addEventListener('scroll', markDoneEarlyOnScroll, { passive: true });

    const timer = setInterval(() => {
      setPercent((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return Math.floor(next);
      });
    }, intervalTime);

    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', markDoneEarlyOnScroll);
    };
  }, [isHidden]);

  useEffect(() => {
    if (percent === 100 && !isHidden) {
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
        // Start revealing hero content right as the preloader curtain starts sliding up
        (window as unknown as { __median_preloader_done?: boolean }).__median_preloader_done = true;
        window.dispatchEvent(new CustomEvent('median_preloader_done'));

        const hideTimer = setTimeout(() => {
          setIsHidden(true);
          sessionStorage.setItem('median_preloader_seen', 'true');
          if (onComplete) onComplete();
        }, 700);
        return () => clearTimeout(hideTimer);
      }, 250);
      return () => clearTimeout(exitTimer);
    }
  }, [percent, isHidden, onComplete]);

  if (isHidden) return null;

  // Format as 3 digits
  const formatted = String(percent).padStart(3, '0');
  const d1 = formatted[0];
  const d2 = formatted[1];
  const d3 = formatted[2];

  return (
    <div
      className={`fixed inset-0 z-[9990] bg-median-taupe text-white flex flex-col justify-between p-8 md:p-16 transition-transform duration-700 ease-[cubic-bezier(0.85,0,0.15,1)] select-none ${
        isExiting ? '-translate-y-full' : 'translate-y-0'
      }`}
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
        <div className="hidden sm:block">HAUTE EDITORIAL ARCHITECTURE</div>
        <div>2024–2026 EDITION</div>
      </div>

      {/* Center Big Rolling Numbers */}
      <div className="relative z-10 flex items-baseline justify-center font-oswald text-7xl sm:text-9xl md:text-[14rem] leading-none tracking-tight">
        {/* Rolling column 1 */}
        <div className="relative h-[1em] overflow-hidden inline-flex">
          <span className="transition-transform duration-200">{d1}</span>
        </div>
        {/* Rolling column 2 */}
        <div className="relative h-[1em] overflow-hidden inline-flex">
          <span className="transition-transform duration-200">{d2}</span>
        </div>
        {/* Rolling column 3 */}
        <div className="relative h-[1em] overflow-hidden inline-flex">
          <span className="transition-transform duration-200">{d3}</span>
        </div>
        <span className="text-3xl sm:text-5xl md:text-7xl font-light ml-2 text-white/70">
          %
        </span>
      </div>

      {/* Bottom Status Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center text-xs tracking-wider text-white/80 gap-3 border-t border-white/20 pt-4">
        <div>
          <span>CREATIVE DIRECTION & E-COMMERCE</span>
        </div>
        <div className="w-48 bg-white/20 h-1 rounded-full overflow-hidden">
          <div
            className="bg-white h-full transition-all duration-150 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div>LOADING ASSETS & MOTION TOKENS</div>
      </div>
    </div>
  );
};
