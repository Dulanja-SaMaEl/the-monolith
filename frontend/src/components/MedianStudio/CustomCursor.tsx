import React, { useEffect, useState, useRef } from 'react';

export const CustomCursor: React.FC = () => {
  const [cursorType, setCursorType] = useState<'default' | 'pointer' | 'work'>('default');
  const [isVisible, setIsVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  // Zero-rerender coordinate refs for 120fps GPU cursor tracking
  const mousePos = useRef({ x: -100, y: -100 });
  const circlePos = useRef({ x: -100, y: -100 });
  const cursorTypeRef = useRef<'default' | 'pointer' | 'work'>('default');
  const isVisibleRef = useRef(false);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const followerRef = useRef<HTMLDivElement | null>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: coarse), (hover: none), (max-width: 1023px)');
    if (mediaQuery.matches) {
      setIsTouch(true);
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;

      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        circlePos.current.x = e.clientX;
        circlePos.current.y = e.clientY;
        setIsVisible(true);
      }

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const workEl = target.closest('[data-cursor="work"]');
      const pointerEl = target.closest('a, button, [role="button"], input, select, textarea, [data-cursor="pointer"]');

      const nextType: 'default' | 'pointer' | 'work' = workEl ? 'work' : pointerEl ? 'pointer' : 'default';
      if (nextType !== cursorTypeRef.current) {
        cursorTypeRef.current = nextType;
        setCursorType(nextType);
      }
    };

    const onMouseLeave = () => {
      isVisibleRef.current = false;
      setIsVisible(false);
    };
    const onMouseEnter = () => {
      isVisibleRef.current = true;
      setIsVisible(true);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    const animate = () => {
      const factor = cursorTypeRef.current === 'work' ? 0.14 : 0.22;
      circlePos.current.x += (mousePos.current.x - circlePos.current.x) * factor;
      circlePos.current.y += (mousePos.current.y - circlePos.current.y) * factor;

      if (followerRef.current) {
        followerRef.current.style.transform = `translate3d(${circlePos.current.x}px, ${circlePos.current.y}px, 0) translate(-50%, -50%)`;
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  if (isTouch) return null;

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-[9999] overflow-hidden transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Center pinpoint */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 w-2 h-2 rounded-full bg-median-taupe pointer-events-none transition-opacity duration-150 will-change-transform ${
          cursorType === 'work' ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ transform: 'translate3d(-100px, -100px, 0) translate(-50%, -50%)' }}
      />

      {/* Trailing follower */}
      <div
        ref={followerRef}
        id="cursor-follower"
        className={`fixed top-0 left-0 pointer-events-none transition-[width,height,background-color,border-color,border-radius] duration-300 ease-out flex items-center justify-center select-none will-change-transform ${
          cursorType === 'work'
            ? 'w-32 h-32 rounded-full bg-median-taupe text-white shadow-2xl scale-100'
            : cursorType === 'pointer'
            ? 'w-12 h-12 rounded-full border border-median-taupe bg-median-taupe/10 scale-110'
            : 'w-8 h-8 rounded-full border border-median-taupe/50 bg-transparent'
        }`}
        style={{ transform: 'translate3d(-100px, -100px, 0) translate(-50%, -50%)' }}
      >
        {cursorType === 'work' && (
          <div className="text-center font-inter font-bold text-xs uppercase tracking-wider text-white leading-tight animate-fade-in">
            View
            <br />
            Project
          </div>
        )}
      </div>
    </div>
  );
};
