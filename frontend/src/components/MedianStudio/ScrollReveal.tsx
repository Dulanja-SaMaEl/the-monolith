import React, { useEffect, useRef, useState } from 'react';

export type RevealVariant =
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'scale-up'
  | 'fade'
  | 'line-wipe'
  | 'split-mask'
  | 'card-flip-left'
  | 'card-flip-right'
  | 'card-lift'
  | 'blur-focus'
  | 'curtain-expand'
  | 'horizontal-slide-left'
  | 'horizontal-slide-right'
  | 'counter-pop'
  | 'ribbon-twist'
  | 'badge-drop'
  | 'zoom-rotate'
  | 'skew-up';

interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number; // in ms
  duration?: number; // in ms
  threshold?: number;
  className?: string;
  as?: React.ElementType;
  style?: React.CSSProperties;
  once?: boolean;
}

interface ViewportSnapshot {
  vh: number;
  vw: number;
  scrollY: number;
  docHeight: number;
  remainingScroll: number;
}

const getViewportSnapshot = (): ViewportSnapshot => {
  const vh = window.innerHeight || document.documentElement.clientHeight;
  const vw = window.innerWidth || document.documentElement.clientWidth;
  const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
  const docHeight = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight
  );
  const remainingScroll = Math.max(0, docHeight - (scrollY + vh));
  return { vh, vw, scrollY, docHeight, remainingScroll };
};

// Shared module-level registry & single scroll/resize listener to eliminate per-element listener overhead
const activeEvaluators = new Set<(snap: ViewportSnapshot) => void>();
let cascadeTimers: number[] = [];
let sharedListenersBound = false;
let sharedTicking = false;

function runAllEvaluators() {
  if (activeEvaluators.size === 0) return;
  const snap = getViewportSnapshot();
  activeEvaluators.forEach((fn) => fn(snap));
}

function onSharedScrollOrResize() {
  if (!sharedTicking) {
    sharedTicking = true;
    requestAnimationFrame(() => {
      sharedTicking = false;
      runAllEvaluators();
    });
  }
}

function onSharedPreloaderDone() {
  requestAnimationFrame(() => {
    runAllEvaluators();
  });
}

function ensureSharedListeners() {
  if (sharedListenersBound || typeof window === 'undefined') return;
  sharedListenersBound = true;
  window.addEventListener('scroll', onSharedScrollOrResize, { passive: true, capture: true });
  window.addEventListener('resize', onSharedScrollOrResize, { passive: true });
  window.addEventListener('median_preloader_done', onSharedPreloaderDone);
}

function triggerCascadeReevaluation() {
  queueMicrotask(() => {
    runAllEvaluators();
  });
  requestAnimationFrame(() => {
    runAllEvaluators();
  });
  cascadeTimers.forEach((id) => window.clearTimeout(id));
  cascadeTimers = [80, 220, 480, 850].map((ms) =>
    window.setTimeout(() => {
      runAllEvaluators();
    }, ms)
  );
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 900,
  className = '',
  as: Component = 'div',
  style = {},
  once = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLElement | null>(null);
  const animRef = useRef<Animation | null>(null);
  const hasRevealedOnceRef = useRef(false);
  const isVisibleRef = useRef(false);

  // Initial (hidden) transform — bold, unmistakable spatial displacements
  const getInitialTransform = () => {
    switch (variant) {
      case 'split-mask':
        return 'translate3d(0, 115%, 0) rotateZ(2deg)';
      case 'card-flip-left':
        return 'perspective(1100px) rotateY(-28deg) rotateX(10deg) translate3d(-65px, 75px, 0) scale3d(0.86, 0.86, 1)';
      case 'card-flip-right':
        return 'perspective(1100px) rotateY(28deg) rotateX(10deg) translate3d(65px, 75px, 0) scale3d(0.86, 0.86, 1)';
      case 'card-lift':
        return 'perspective(1100px) rotateX(24deg) translate3d(0, 95px, 0) scale3d(0.85, 0.85, 1)';
      case 'blur-focus':
        return 'translate3d(0, 60px, 0) scale3d(0.90, 0.90, 1)';
      case 'curtain-expand':
        return 'scale3d(0.80, 0.80, 1) translate3d(0, 75px, 0)';
      case 'horizontal-slide-left':
        return 'translate3d(-115px, 25px, 0) scale3d(0.94, 0.94, 1)';
      case 'horizontal-slide-right':
        return 'translate3d(115px, 25px, 0) scale3d(0.94, 0.94, 1)';
      case 'counter-pop':
        return 'scale3d(0.55, 0.55, 1) translate3d(0, 75px, 0)';
      case 'ribbon-twist':
        return 'scale3d(0.78, 0.78, 1) rotate(-7deg) translate3d(0, 85px, 0)';
      case 'badge-drop':
        return 'translate3d(0, -55px, 0) scale3d(0.78, 0.78, 1)';
      case 'zoom-rotate':
        return 'scale3d(0.74, 0.74, 1) rotate(-6deg) translate3d(0, 65px, 0)';
      case 'skew-up':
        return 'translate3d(0, 75px, 0) skewY(6deg)';
      case 'fade-up':
        return 'translate3d(0, 75px, 0)';
      case 'fade-down':
        return 'translate3d(0, -75px, 0)';
      case 'fade-left':
        return 'translate3d(-85px, 0, 0)';
      case 'fade-right':
        return 'translate3d(85px, 0, 0)';
      case 'scale-up':
        return 'scale3d(0.82, 0.82, 1) translate3d(0, 65px, 0)';
      case 'line-wipe':
        return 'scaleX(0)';
      case 'fade':
      default:
        return 'translate3d(0, 35px, 0)';
    }
  };

  // Active (revealed) transform
  const getActiveTransform = () => {
    switch (variant) {
      case 'split-mask':
        return 'translate3d(0, 0%, 0) rotateZ(0deg)';
      case 'card-flip-left':
      case 'card-flip-right':
        return 'perspective(1100px) rotateY(0deg) rotateX(0deg) translate3d(0, 0, 0) scale3d(1, 1, 1)';
      case 'card-lift':
        return 'perspective(1100px) rotateX(0deg) translate3d(0, 0, 0) scale3d(1, 1, 1)';
      case 'blur-focus':
      case 'curtain-expand':
      case 'horizontal-slide-left':
      case 'horizontal-slide-right':
      case 'counter-pop':
      case 'badge-drop':
      case 'scale-up':
        return 'scale3d(1, 1, 1) translate3d(0, 0, 0)';
      case 'ribbon-twist':
      case 'zoom-rotate':
        return 'scale3d(1, 1, 1) rotate(0deg) translate3d(0, 0, 0)';
      case 'skew-up':
        return 'translate3d(0, 0, 0) skewY(0deg)';
      case 'line-wipe':
        return 'scaleX(1)';
      case 'fade':
      default:
        return 'translate3d(0, 0, 0)';
    }
  };

  const getInitialFilter = () => {
    if (variant === 'blur-focus') return 'blur(16px)';
    if (variant === 'curtain-expand' || variant === 'card-lift') return 'blur(6px)';
    return undefined;
  };

  const getActiveFilter = () => {
    if (variant === 'blur-focus' || variant === 'curtain-expand' || variant === 'card-lift') {
      return 'blur(0px)';
    }
    return undefined;
  };

  const getInitialClipPath = () => {
    if (variant === 'curtain-expand') return 'inset(18% 14% 18% 14% round 24px)';
    return undefined;
  };

  const getActiveClipPath = () => {
    if (variant === 'curtain-expand') return 'inset(0% 0% 0% 0% round 16px)';
    return undefined;
  };

  const appliedDelay = isVisible ? Math.min(delay, 750) : 0;
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
  const activeDuration = isVisible ? (isDesktop ? Math.round(duration * 1.12) : duration) : 320;

  const easing =
    variant === 'counter-pop' || variant === 'badge-drop' || variant === 'zoom-rotate'
      ? 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      : 'cubic-bezier(0.22, 1, 0.36, 1)';

  // Drive explicit Web Animations API keyframes whenever visibility changes so PC browsers
  // (including high-refresh monitors and reduced-motion OS settings) NEVER skip a frame.
  useEffect(() => {
    const innerEl = innerRef.current;
    if (!innerEl || typeof innerEl.animate !== 'function') return;

    if (isVisible) {
      animRef.current?.cancel();
      const fromFrame: Keyframe = {
        opacity: 0,
        transform: getInitialTransform(),
      };
      const toFrame: Keyframe = {
        opacity: 1,
        transform: getActiveTransform(),
      };

      const initFilter = getInitialFilter();
      const actFilter = getActiveFilter();
      if (initFilter && actFilter) {
        fromFrame.filter = initFilter;
        toFrame.filter = actFilter;
      }

      const initClip = getInitialClipPath();
      const actClip = getActiveClipPath();
      if (initClip && actClip) {
        fromFrame.clipPath = initClip;
        toFrame.clipPath = actClip;
      }

      animRef.current = innerEl.animate([fromFrame, toFrame], {
        duration: activeDuration,
        delay: appliedDelay,
        easing,
        fill: 'both',
      });
    } else {
      if (animRef.current) {
        animRef.current.cancel();
        animRef.current = null;
      }
    }
  }, [isVisible, variant]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    let raf1: number | null = null;
    let mountTimer: number | null = null;
    let isMountedAndPainted = false;

    const isPreloaderActive = () => {
      if (typeof window === 'undefined') return false;
      if ((window.scrollY || window.pageYOffset) >= 15) return false;
      const seen = sessionStorage.getItem('median_preloader_seen');
      const done = (window as unknown as { __median_preloader_done?: boolean }).__median_preloader_done;
      return !seen && !done;
    };

    const evaluateVisibility = (snap?: ViewportSnapshot) => {
      if (!el || !isMountedAndPainted) return;
      if (once && hasRevealedOnceRef.current) return;

      const rect = el.getBoundingClientRect();
      const { vh, vw, scrollY, remainingScroll } = snap || getViewportSnapshot();

      const ancestorReveal = el.parentElement?.closest('[data-scroll-reveal]');
      const isAncestorVisible =
        ancestorReveal?.getAttribute('data-reveal-state') === 'visible';

      // Determine if element belongs to the initial top hero area
      const docTop = rect.top + scrollY;
      const isHeroElement = docTop < vh * 0.85;

      // On PC (vw >= 768), 3-column grids make sections shorter than the monitor height.
      // Use a tighter trigger zone (68% from top, plus a 22% element-entry offset) so sections
      // only animate when they have actually scrolled into the user's line of sight on PC,
      // while keeping Mobile (< 768px) at 85%.
      const baseTriggerRatio = isHeroElement ? 0.92 : vw >= 768 ? 0.68 : 0.85;
      let triggerLine = vh * baseTriggerRatio;

      // Smoothly expand trigger line down to the bottom of the screen when approaching page bottom
      if (remainingScroll < 360) {
        const bottomFactor = 1 - remainingScroll / 360;
        triggerLine = triggerLine + (vh - 8 - triggerLine) * bottomFactor;
      }

      // Require larger cards on PC to have at least 22% (up to 75px) inside the trigger line
      const entryOffset =
        !isHeroElement && vw >= 768 && !ancestorReveal
          ? Math.min(rect.height * 0.22, 75)
          : 0;

      const isDirectInView =
        rect.top + entryOffset <= triggerLine && rect.bottom >= 24;
      const isChildInView =
        isAncestorVisible && (rect.top <= vh * 0.90 || remainingScroll < 120);

      const isEnteringViewingZone = isDirectInView || isChildInView;

      if (isEnteringViewingZone) {
        if (isPreloaderActive() && rect.top < vh) {
          return;
        }
        if (!isVisibleRef.current) {
          hasRevealedOnceRef.current = true;
          isVisibleRef.current = true;
          el.setAttribute('data-reveal-state', 'visible');
          setIsVisible(true);
          triggerCascadeReevaluation();
        }
      } else if (!once) {
        // Reset when element leaves the viewport or when its parent card resets
        const isOutBottom = rect.top >= (vw >= 768 ? vh * 0.90 : vh * 0.95);
        const isOutTop = rect.bottom <= -10;
        const isParentHidden = ancestorReveal !== null && !isAncestorVisible;

        if (isOutBottom || isOutTop || isParentHidden) {
          if (isVisibleRef.current) {
            isVisibleRef.current = false;
            el.setAttribute('data-reveal-state', 'hidden');
            setIsVisible(false);
            triggerCascadeReevaluation();
          }
        }
      }
    };

    ensureSharedListeners();
    activeEvaluators.add(evaluateVisibility);

    // Ensure initial hidden state is committed to DOM & GPU before evaluating visibility
    mountTimer = window.setTimeout(() => {
      raf1 = requestAnimationFrame(() => {
        isMountedAndPainted = true;
        evaluateVisibility();
      });
    }, 35);

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        () => {
          evaluateVisibility();
        },
        { threshold: [0, 0.1, 0.3, 0.6] }
      );
      observer.observe(el);
    }

    return () => {
      activeEvaluators.delete(evaluateVisibility);
      if (mountTimer) window.clearTimeout(mountTimer);
      if (raf1) cancelAnimationFrame(raf1);
      if (observer) observer.disconnect();
    };
  }, [once]);

  const transitionStyles: React.CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? getActiveTransform() : getInitialTransform(),
    filter: isVisible ? getActiveFilter() : getInitialFilter(),
    clipPath: isVisible ? getActiveClipPath() : getInitialClipPath(),
    transformOrigin:
      variant === 'line-wipe'
        ? 'left center'
        : variant === 'card-flip-left'
        ? 'left center'
        : variant === 'card-flip-right'
        ? 'right center'
        : 'center center',
    transition: `opacity ${activeDuration}ms ${easing} ${appliedDelay}ms, transform ${activeDuration}ms ${easing} ${appliedDelay}ms, filter ${activeDuration}ms ease-out ${appliedDelay}ms, clip-path ${activeDuration}ms ${easing} ${appliedDelay}ms`,
    willChange: isVisible ? 'auto' : 'opacity, transform',
    ...style,
  };

  return (
    <div
      ref={wrapperRef}
      data-scroll-reveal={variant}
      data-reveal-state={isVisible ? 'visible' : 'hidden'}
      className={`${variant === 'split-mask' ? 'overflow-hidden ' : ''}${className}`}
    >
      <Component
        ref={innerRef}
        className="h-full w-full"
        style={transitionStyles}
      >
        {children}
      </Component>
    </div>
  );
};

interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  initialDelay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  variant?: RevealVariant;
  once?: boolean;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerDelay = 120,
  initialDelay = 0,
  duration = 900,
  className = '',
  variant = 'scale-up',
  once = false,
}) => {
  const variantsCycle: RevealVariant[] = [
    'card-flip-left',
    'card-lift',
    'card-flip-right',
    'curtain-expand',
    'zoom-rotate',
    'counter-pop',
  ];

  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        const delay = initialDelay + Math.min(index * staggerDelay, 600);
        const childVariant = variant === 'scale-up' ? variantsCycle[index % variantsCycle.length] : variant;

        return (
          <ScrollReveal
            variant={childVariant}
            delay={delay}
            duration={duration}
            className="h-full"
            once={once}
          >
            {child}
          </ScrollReveal>
        );
      })}
    </div>
  );
};

interface CountingNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export const CountingNumber: React.FC<CountingNumberProps> = ({
  value,
  duration = 1800,
  prefix = '',
  suffix = '',
  decimals,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const vw = window.innerWidth || document.documentElement.clientWidth;
      const triggerRatio = vw >= 768 ? 0.72 : 0.85;
      if (rect.top <= vh * triggerRatio && rect.bottom >= 20) {
        setIsActive(true);
      } else if (rect.top >= vh * 0.92 || rect.bottom <= -10) {
        setIsActive(false);
        setDisplayValue(0);
      }
    };

    check();
    window.addEventListener('scroll', check, { passive: true, capture: true });
    window.addEventListener('resize', check, { passive: true });
    return () => {
      window.removeEventListener('scroll', check, true);
      window.removeEventListener('resize', check);
    };
  }, []);

  useEffect(() => {
    if (!isActive) return;

    let animId: number;
    const startTime = performance.now();

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = decimals !== undefined
        ? Number((easedProgress * value).toFixed(decimals))
        : Math.floor(easedProgress * value);

      setDisplayValue(currentVal);

      if (progress < 1) {
        animId = requestAnimationFrame(updateCounter);
      } else {
        setDisplayValue(value);
      }
    };

    animId = requestAnimationFrame(updateCounter);
    return () => cancelAnimationFrame(animId);
  }, [isActive, value, duration, decimals]);

  const formatted = decimals !== undefined
    ? displayValue.toFixed(decimals)
    : (value < 10 ? String(displayValue).padStart(2, '0') : String(displayValue));

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};
