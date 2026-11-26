import React, { useEffect, useState, useRef } from 'react';

export type MonoMood = 'idle' | 'guiding' | 'thinking' | 'celebrate' | 'alert' | 'sleeping';

interface MonoCharacterProps {
  mood: MonoMood;
  size?: number;
  badgeCount?: number;
  /** Optional screen-space point MONO should look toward (e.g., highlighted button center) */
  lookAtPoint?: { x: number; y: number } | null;
  onClick?: () => void;
  ariaLabel?: string;
}

export const MonoCharacter: React.FC<MonoCharacterProps> = ({
  mood,
  size = 54,
  badgeCount = 0,
  lookAtPoint = null,
  onClick,
  ariaLabel = 'MONO AI Companion',
}) => {
  const cubeRef = useRef<HTMLButtonElement | null>(null);
  const [gaze, setGaze] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  // Natural randomized blink cycle (paused when sleeping)
  useEffect(() => {
    if (mood === 'sleeping') {
      setIsBlinking(false);
      return;
    }
    let timeoutId: number;
    let unblinkId: number;

    const scheduleBlink = () => {
      const wait = 3200 + Math.random() * 3400;
      timeoutId = window.setTimeout(() => {
        setIsBlinking(true);
        unblinkId = window.setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 135);
      }, wait);
    };

    scheduleBlink();
    return () => {
      window.clearTimeout(timeoutId);
      window.clearTimeout(unblinkId);
    };
  }, [mood]);

  // Smooth cursor or target eye tracking
  useEffect(() => {
    if (mood === 'sleeping') {
      setGaze({ x: 0, y: 0 });
      return;
    }

    const computeGazeTo = (tx: number, ty: number) => {
      const el = cubeRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = tx - cx;
      const dy = ty - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const maxShift = 3.5;
      const factor = Math.min(1, dist / 240);
      setGaze({
        x: (dx / dist) * maxShift * factor,
        y: (dy / dist) * maxShift * factor,
      });
    };

    if (lookAtPoint) {
      computeGazeTo(lookAtPoint.x, lookAtPoint.y);
      return;
    }

    let rafId = 0;
    const handleMove = (e: MouseEvent) => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        computeGazeTo(e.clientX, e.clientY);
      });
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMove);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [mood, lookAtPoint]);

  const isSleeping = mood === 'sleeping';
  const isThinking = mood === 'thinking';
  const isCelebrate = mood === 'celebrate';
  const isAlert = mood === 'alert';
  const isGuiding = mood === 'guiding';

  const eyeColor = isCelebrate
    ? '#34D399'
    : isAlert
    ? '#FBBF24'
    : isSleeping
    ? 'rgba(159, 129, 112, 0.7)'
    : '#FAF8F5';

  const eyeGlow = isCelebrate
    ? '0 0 10px rgba(52, 211, 153, 0.85)'
    : isAlert
    ? '0 0 10px rgba(251, 191, 36, 0.85)'
    : isSleeping
    ? 'none'
    : '0 0 8px rgba(250, 248, 245, 0.7)';

  const auraClass = isCelebrate
    ? 'shadow-[0_10px_28px_rgba(16,185,129,0.38),0_0_0_1px_rgba(52,211,153,0.55)]'
    : isAlert
    ? 'shadow-[0_10px_28px_rgba(245,158,11,0.34),0_0_0_1px_rgba(251,191,36,0.55)]'
    : isGuiding
    ? 'shadow-[0_14px_34px_rgba(0,0,0,0.38),0_0_0_1.5px_rgba(159,129,112,0.85)]'
    : 'shadow-[0_12px_28px_rgba(0,0,0,0.3),0_0_0_1px_rgba(159,129,112,0.5)]';

  const eyeHeight = isSleeping ? 2 : isBlinking ? 1.5 : isCelebrate ? 6 : 9;

  return (
    <div className="relative inline-flex flex-col items-center select-none">
      {/* Floating Obsidian Monolith Cube */}
      <button
        ref={cubeRef}
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
        className={`relative rounded-[14px] flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-median-taupe transition-transform duration-300 ${
          isSleeping ? 'scale-[0.84] opacity-85 hover:opacity-100 hover:scale-95' : 'mono-float hover:scale-105 active:scale-95'
        } ${isThinking ? '-rotate-6' : ''} ${auraClass}`}
      >
        {/* Obsidian Architectural Body */}
        <span
          className="absolute inset-0 rounded-[14px] overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #1E1D1C 0%, #090909 55%, #000000 100%)',
          }}
        >
          {/* Subtle top specular hairline */}
          <span
            className="absolute inset-x-2 top-[2px] h-[1px] rounded-full opacity-55"
            style={{ background: 'linear-gradient(90deg, transparent, #9F8170, transparent)' }}
          />
          {/* Subtle inner architectural frame */}
          <span className="absolute inset-[4px] rounded-[10px] border border-median-taupe/20" />
        </span>

        {/* Expressive Minimalist Light-Bar Eyes */}
        <span
          className="relative z-10 flex items-center justify-center gap-[9px] transition-transform duration-150 ease-out"
          style={{
            transform: `translate3d(${gaze.x}px, ${gaze.y}px, 0)`,
          }}
        >
          <span
            className={`block rounded-full transition-all duration-150 ${isThinking ? 'animate-pulse' : ''}`}
            style={{
              width: isCelebrate ? '8px' : '6px',
              height: `${eyeHeight}px`,
              backgroundColor: eyeColor,
              boxShadow: eyeGlow,
              borderRadius: isCelebrate ? '999px 999px 2px 2px' : '999px',
            }}
          />
          <span
            className={`block rounded-full transition-all duration-150 ${isThinking ? 'animate-pulse' : ''}`}
            style={{
              width: isCelebrate ? '8px' : '6px',
              height: `${eyeHeight}px`,
              backgroundColor: eyeColor,
              boxShadow: eyeGlow,
              borderRadius: isCelebrate ? '999px 999px 2px 2px' : '999px',
              animationDelay: isThinking ? '180ms' : '0ms',
            }}
          />
        </span>

        {/* Subtle Bottom Warm-Taupe Status Accent Bar */}
        <span
          className="absolute bottom-[5px] w-4 h-[2px] rounded-full opacity-70"
          style={{
            backgroundColor: isCelebrate ? '#34D399' : isAlert ? '#FBBF24' : '#9F8170',
          }}
        />

        {/* Proactive Suggestion Notification Pip */}
        {badgeCount > 0 && !isSleeping && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 rounded-full bg-median-taupe text-white border-2 border-[#FAF8F5] text-[10px] font-mono font-bold flex items-center justify-center shadow-sm">
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        )}
      </button>

      {/* Weightless Ground Levitation Shadow */}
      {!isSleeping && (
        <span
          className="mt-1.5 h-[5px] rounded-full bg-black/20 blur-[3px] mono-shadow pointer-events-none"
          style={{ width: `${Math.round(size * 0.68)}px` }}
        />
      )}
    </div>
  );
};
