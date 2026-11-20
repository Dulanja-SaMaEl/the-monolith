import React, { useEffect, useState, useRef } from 'react';

export const CustomCursor: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [cursorType, setCursorType] = useState<'default' | 'pointer' | 'work'>('default');
  const [isVisible, setIsVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  // Smooth lerp coordinates
  const circlePos = useRef({ x: -100, y: -100 });
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    // Detect touch device
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouch(true);
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Check hovered element
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const workEl = target.closest('[data-cursor="work"]');
      const pointerEl = target.closest('a, button, [role="button"], input, select, textarea, [data-cursor="pointer"]');

      if (workEl) {
        setCursorType('work');
      } else if (pointerEl) {
        setCursorType('pointer');
      } else {
        setCursorType('default');
      }
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    // Animation loop for smooth trailing
    const animate = () => {
      // Lerp
      const factor = cursorType === 'work' ? 0.12 : 0.2;
      circlePos.current.x += (mousePos.x - circlePos.current.x) * factor;
      circlePos.current.y += (mousePos.y - circlePos.current.y) * factor;

      const follower = document.getElementById('cursor-follower');
      if (follower) {
        follower.style.transform = `translate3d(${circlePos.current.x}px, ${circlePos.current.y}px, 0)`;
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
  }, [mousePos, isVisible, cursorType]);

  if (isTouch || !isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {/* Center pinpoint */}
      <div
        className={`fixed top-0 left-0 w-2 h-2 rounded-full bg-median-taupe pointer-events-none transition-opacity duration-150 -translate-x-1/2 -translate-y-1/2 ${
          cursorType === 'work' ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
        }}
      />

      {/* Trailing follower */}
      <div
        id="cursor-follower"
        className={`fixed top-0 left-0 pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-[width,height,background-color,border-color,border-radius] duration-300 ease-out flex items-center justify-center select-none ${
          cursorType === 'work'
            ? 'w-32 h-32 rounded-full bg-median-taupe text-white shadow-2xl scale-100'
            : cursorType === 'pointer'
            ? 'w-12 h-12 rounded-full border border-median-taupe bg-median-taupe/10 scale-110'
            : 'w-8 h-8 rounded-full border border-median-taupe/50 bg-transparent'
        }`}
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
