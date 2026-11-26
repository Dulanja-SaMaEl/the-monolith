import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { MonoCharacter, MonoMood } from './MonoCharacter';
import {
  MonoRole,
  MonoStop,
  MonoSuggestionCard,
  resolveOfflineMonoQuery,
} from './monoGuideEngine';
import { portalApi } from '../../../lib/portalApi';

interface MonoCompanionProps {
  role: MonoRole;
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  suggestions: MonoSuggestionCard[];
  clientId?: string;
  userName?: string;
  /** Increment to trigger a brief celebratory emerald pulse (e.g., task completed) */
  celebrateTrigger?: number;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  stops?: MonoStop[];
  aiPowered?: boolean;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const SLEEP_KEY = (role: MonoRole) => `monolith_mono_sleep_${role}`;
const INTRO_KEY = (role: MonoRole) => `monolith_mono_intro_${role}`;

export const MonoCompanion: React.FC<MonoCompanionProps> = ({
  role,
  activeTab,
  onNavigateTab,
  suggestions,
  clientId,
  userName,
  celebrateTrigger = 0,
}) => {
  const [mode, setMode] = useState<'docked' | 'hub' | 'guiding' | 'sleeping'>(() => {
    try {
      return localStorage.getItem(SLEEP_KEY(role)) === '1' ? 'sleeping' : 'docked';
    } catch {
      return 'docked';
    }
  });
  const [mood, setMood] = useState<MonoMood>('idle');
  const [showIntroTeaser, setShowIntroTeaser] = useState<boolean>(() => {
    try {
      return localStorage.getItem(INTRO_KEY(role)) !== '1';
    } catch {
      return false;
    }
  });

  // Flight tour state
  const [tourStops, setTourStops] = useState<MonoStop[]>([]);
  const [stopIndex, setStopIndex] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [viewport, setViewport] = useState<{ w: number; h: number }>(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : 1280,
    h: typeof window !== 'undefined' ? window.innerHeight : 800,
  }));

  // Ask MONO interactive chat state
  const [hubTab, setHubTab] = useState<'radar' | 'ask'>('radar');
  const [question, setQuestion] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [followUpChips, setFollowUpChips] = useState<string[]>(() =>
    role === 'admin'
      ? [
          'What should we work on today?',
          'Suggest new updates to pitch clients',
          'Show unpaid invoices & cashflow',
        ]
      : [
          'How much balance do I need to pay?',
          'How do I request a new feature?',
          'Check my live system & renewals',
        ]
  );

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const activeStop = mode === 'guiding' ? tourStops[stopIndex] || null : null;

  // Auto-hide intro teaser cleanly after 10 seconds
  useEffect(() => {
    if (!showIntroTeaser || mode !== 'docked') return;
    const t = window.setTimeout(() => {
      setShowIntroTeaser(false);
      try {
        localStorage.setItem(INTRO_KEY(role), '1');
      } catch {
        // ignore
      }
    }, 10000);
    return () => window.clearTimeout(t);
  }, [showIntroTeaser, mode, role]);

  // Brief emerald celebration pulse when user completes an action
  useEffect(() => {
    if (!celebrateTrigger || mode === 'sleeping') return;
    setMood('celebrate');
    const t = window.setTimeout(() => {
      setMood(mode === 'guiding' ? 'guiding' : 'idle');
    }, 1800);
    return () => window.clearTimeout(t);
  }, [celebrateTrigger, mode]);

  // Track viewport resize
  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Esc key smoothly closes Hub or Flight Tour
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (mode === 'hub' || mode === 'guiding')) {
        setMode('docked');
        setTargetRect(null);
        setMood('idle');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode]);

  // Auto-scroll chat feed
  useEffect(() => {
    if (hubTab === 'ask') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, hubTab, isThinking]);

  // Locate and track live DOM rect for the active flight stop
  const measureActiveTarget = useCallback((selectorTarget: string, shouldScroll = false) => {
    const el = document.querySelector(`[data-guide="${selectorTarget}"]`) as HTMLElement | null;
    if (!el) {
      setTargetRect(null);
      return false;
    }

    if (shouldScroll) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }

    const updateBox = () => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) {
        setTargetRect(null);
        return;
      }
      setTargetRect({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
      });
    };

    updateBox();
    if (shouldScroll) {
      window.setTimeout(updateBox, 320);
      window.setTimeout(updateBox, 650);
    }
    return true;
  }, []);

  // Fly to the current stop whenever mode === 'guiding' or stopIndex changes
  useEffect(() => {
    if (mode !== 'guiding' || !activeStop) {
      setTargetRect(null);
      return;
    }

    setMood(activeStop.mood || 'guiding');

    let timerA: number | undefined;
    let timerB: number | undefined;

    if (activeStop.tab && activeStop.tab !== activeTab) {
      onNavigateTab(activeStop.tab);
      timerA = window.setTimeout(() => {
        measureActiveTarget(activeStop.target, true);
      }, 320);
      timerB = window.setTimeout(() => {
        measureActiveTarget(activeStop.target, false);
      }, 750);
    } else {
      timerA = window.setTimeout(() => {
        measureActiveTarget(activeStop.target, true);
      }, 60);
    }

    const handleReposition = () => measureActiveTarget(activeStop.target, false);
    window.addEventListener('scroll', handleReposition, { passive: true, capture: true });
    window.addEventListener('resize', handleReposition, { passive: true });

    return () => {
      if (timerA) window.clearTimeout(timerA);
      if (timerB) window.clearTimeout(timerB);
      window.removeEventListener('scroll', handleReposition, { capture: true } as any);
      window.removeEventListener('resize', handleReposition);
    };
  }, [mode, activeStop, activeTab, onNavigateTab, measureActiveTarget]);

  const startFlight = useCallback((stops: MonoStop[], startIdx = 0) => {
    if (!stops.length) return;
    setShowIntroTeaser(false);
    try {
      localStorage.setItem(INTRO_KEY(role), '1');
      localStorage.removeItem(SLEEP_KEY(role));
    } catch {
      // ignore
    }
    setTourStops(stops);
    setStopIndex(startIdx);
    setMode('guiding');
    setMood(stops[startIdx]?.mood || 'guiding');
  }, [role]);

  const handleToggleSleep = () => {
    const nextSleep = mode !== 'sleeping';
    setMode(nextSleep ? 'sleeping' : 'docked');
    setMood(nextSleep ? 'sleeping' : 'idle');
    setTargetRect(null);
    setShowIntroTeaser(false);
    try {
      if (nextSleep) localStorage.setItem(SLEEP_KEY(role), '1');
      else localStorage.removeItem(SLEEP_KEY(role));
    } catch {
      // ignore
    }
  };

  const handleCharacterClick = () => {
    setShowIntroTeaser(false);
    try {
      localStorage.setItem(INTRO_KEY(role), '1');
      localStorage.removeItem(SLEEP_KEY(role));
    } catch {
      // ignore
    }
    if (mode === 'sleeping' || mode === 'docked') {
      setMode('hub');
      setMood('idle');
    } else if (mode === 'hub') {
      setMode('docked');
      setMood('idle');
    } else if (mode === 'guiding') {
      setMode('hub');
      setHubTab('ask');
      setTargetRect(null);
      setMood('idle');
    }
  };

  const handleAsk = async (rawPrompt?: string) => {
    const q = (rawPrompt ?? question).trim();
    if (!q || isThinking) return;

    setHubTab('ask');
    setQuestion('');
    setIsThinking(true);
    setMood('thinking');

    const userMsg: ChatMessage = { role: 'user', text: q };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);

    try {
      const liveRes = await portalApi.askMono({
        question: q,
        mode: role,
        currentTab: activeTab,
        clientId: role === 'client' ? clientId : undefined,
        history: nextHistory.slice(-6).map((m) => ({ role: m.role, text: m.text })),
      });

      const resolved = liveRes || resolveOfflineMonoQuery(role, q, suggestions);
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: resolved.reply,
          stops: resolved.stops,
          aiPowered: resolved.ai_powered,
        },
      ]);
      if (resolved.suggestions && resolved.suggestions.length > 0) {
        setFollowUpChips(resolved.suggestions);
      }
      setMood(resolved.mood || 'guiding');

      // Auto-fly if user explicitly asked "where", "show me", "guide", or "how do i"
      const wantsFlight =
        resolved.stops.length > 0 &&
        /\b(show|where|guide|point|take me|how do i|how to)\b/i.test(q);
      if (wantsFlight) {
        window.setTimeout(() => {
          startFlight(resolved.stops, 0);
        }, 700);
      }
    } catch {
      const fallback = resolveOfflineMonoQuery(role, q, suggestions);
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: fallback.reply, stops: fallback.stops, aiPowered: false },
      ]);
      setMood('idle');
    } finally {
      setIsThinking(false);
    }
  };

  // Compute MONO's smooth screen-space flight coordinates (pure GPU translate3d!)
  const isMobile = viewport.w < 768;
  const charSize = mode === 'sleeping' ? 46 : 54;
  const dockX = Math.max(16, viewport.w - charSize - (isMobile ? 16 : 26));
  const dockY = Math.max(16, viewport.h - charSize - (isMobile ? 20 : 28));

  const flightLayout = useMemo(() => {
    if (mode !== 'guiding' || !targetRect || isMobile) {
      return {
        charX: dockX,
        charY: dockY,
        cardLeft: Math.max(12, viewport.w - Math.min(350, viewport.w - 24) - 16),
        cardBottom: charSize + 36,
        useBottomAnchor: true,
        lookAt: targetRect
          ? { x: targetRect.left + targetRect.width / 2, y: targetRect.top + targetRect.height / 2 }
          : null,
      };
    }

    const cardW = 310;
    const cardH = 195;
    const gap = 18;
    const targetCenterY = targetRect.top + targetRect.height / 2;

    // Prefer placing MONO + speech card to the right of the element; fallback left -> bottom -> top
    const spaceRight = viewport.w - (targetRect.left + targetRect.width);
    const spaceLeft = targetRect.left;

    let charX = dockX;
    let charY = dockY;
    let cardLeft = 16;
    let cardTop = 16;

    if (spaceRight >= charSize + cardW + gap * 2) {
      charX = targetRect.left + targetRect.width + gap;
      charY = Math.min(Math.max(20, targetCenterY - charSize / 2), viewport.h - charSize - 24);
      cardLeft = charX + charSize + 12;
      cardTop = Math.min(Math.max(16, charY - 24), viewport.h - cardH - 16);
    } else if (spaceLeft >= charSize + cardW + gap * 2) {
      charX = targetRect.left - charSize - gap;
      charY = Math.min(Math.max(20, targetCenterY - charSize / 2), viewport.h - charSize - 24);
      cardLeft = charX - cardW - 12;
      cardTop = Math.min(Math.max(16, charY - 24), viewport.h - cardH - 16);
    } else {
      // Place below or above target cleanly
      const spaceBelow = viewport.h - (targetRect.top + targetRect.height);
      const placeBelow = spaceBelow >= cardH + 24;
      charX = Math.min(Math.max(20, targetRect.left), viewport.w - charSize - cardW - 32);
      charY = placeBelow
        ? Math.min(viewport.h - charSize - 24, targetRect.top + targetRect.height + 16)
        : Math.max(20, targetRect.top - charSize - 16);
      cardLeft = Math.min(Math.max(16, charX + charSize + 12), viewport.w - cardW - 16);
      cardTop = placeBelow
        ? Math.min(viewport.h - cardH - 16, targetRect.top + targetRect.height + 14)
        : Math.max(16, targetRect.top - cardH - 14);
    }

    return {
      charX,
      charY,
      cardLeft,
      cardTop,
      useBottomAnchor: false,
      lookAt: {
        x: targetRect.left + targetRect.width / 2,
        y: targetRect.top + targetRect.height / 2,
      },
    };
  }, [mode, targetRect, isMobile, dockX, dockY, viewport, charSize]);

  const urgentCount = suggestions.filter((s) => s.category === 'Alert' || s.category === 'Action').length;
  const displayBadge = mode === 'docked' ? urgentCount || suggestions.length : 0;

  return (
    <div className="fixed inset-0 pointer-events-none z-[90]" aria-live="polite">
      {/* 1. LIVE SPOTLIGHT HALO OVER THE TARGET ELEMENT (never blocks real clicks!) */}
      {mode === 'guiding' && targetRect && (
        <div
          className="fixed rounded-2xl pointer-events-none transition-all duration-500 ease-out mono-spotlight"
          style={{
            top: `${Math.max(4, targetRect.top - 6)}px`,
            left: `${Math.max(4, targetRect.left - 6)}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
          }}
        >
          {/* Editorial Corner Ticks */}
          <span className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-black rounded-tl-md" />
          <span className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-black rounded-tr-md" />
          <span className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-black rounded-bl-md" />
          <span className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-black rounded-br-md" />
        </div>
      )}

      {/* 2. THE FLYING OBSIDIAN MONOLITH CHARACTER (60fps GPU translate3d) */}
      <div
        className="fixed top-0 left-0 pointer-events-auto transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
        style={{
          transform: `translate3d(${Math.round(flightLayout.charX)}px, ${Math.round(flightLayout.charY)}px, 0)`,
        }}
      >
        {/* Subtle Intro Teaser Bubble (Only on first visit, auto-dismisses) */}
        {mode === 'docked' && showIntroTeaser && suggestions.length > 0 && (
          <div className="absolute bottom-full right-0 mb-3 w-64 p-3 rounded-2xl bg-black text-white border border-median-taupe/40 shadow-2xl text-[11px] font-mono animate-fade-in">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-median-taupe font-bold block">
                  ✦ Meet MONO
                </span>
                <p className="text-white/90 mt-0.5 leading-snug">
                  {role === 'admin'
                    ? `Hi ${userName?.split(' ')[0] || 'Dulanja'}! I spotted ${suggestions.length} smart actions & ideas. Tap me to fly through them.`
                    : `Welcome! Tap me anytime — I’ll fly across the screen to show you live server health, receipts & updates.`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowIntroTeaser(false)}
                className="text-white/60 hover:text-white text-xs leading-none"
                aria-label="Dismiss teaser"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <MonoCharacter
          mood={mode === 'sleeping' ? 'sleeping' : mood}
          size={charSize}
          badgeCount={displayBadge}
          lookAtPoint={flightLayout.lookAt}
          onClick={handleCharacterClick}
          ariaLabel={mode === 'sleeping' ? 'Wake MONO companion' : 'Open MONO spatial guide'}
        />
      </div>

      {/* 3. LIVE FLIGHT SPEECH CARD (Anchored cleanly beside MONO during a guided stop) */}
      {mode === 'guiding' && activeStop && (
        <div
          className="fixed pointer-events-auto w-[310px] max-w-[calc(100vw-24px)] rounded-2xl bg-white border border-black/15 shadow-2xl p-4 font-mono text-xs transition-all duration-500 ease-out"
          style={
            flightLayout.useBottomAnchor
              ? { left: `${flightLayout.cardLeft}px`, bottom: `${flightLayout.cardBottom}px` }
              : { left: `${flightLayout.cardLeft}px`, top: `${flightLayout.cardTop}px` }
          }
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-median-taupe animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest text-median-taupe font-bold">
                MONO Guide · {stopIndex + 1} / {tourStops.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setMode('docked');
                setTargetRect(null);
                setMood('idle');
              }}
              className="w-6 h-6 rounded-full hover:bg-[#FAF8F5] text-median-taupe hover:text-black flex items-center justify-center text-sm"
              title="Close guide (Esc)"
            >
              ×
            </button>
          </div>

          <h4 className="font-oswald text-base font-bold uppercase text-black leading-tight">
            {activeStop.title}
          </h4>
          <p className="text-[11px] text-black/80 mt-1.5 leading-relaxed">{activeStop.caption}</p>

          <div className="mt-3.5 pt-3 border-t border-median-taupe/15 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setMode('hub');
                setHubTab('ask');
                setTargetRect(null);
                setMood('idle');
              }}
              className="text-[10px] uppercase font-bold text-median-taupe hover:text-black underline"
            >
              Ask MONO
            </button>

            <div className="flex items-center gap-1.5">
              {stopIndex > 0 && (
                <button
                  type="button"
                  onClick={() => setStopIndex((i) => Math.max(0, i - 1))}
                  className="px-2.5 py-1.5 rounded-lg border border-median-taupe/35 text-black hover:border-black text-[10px] font-bold uppercase"
                >
                  ← Prev
                </button>
              )}
              {stopIndex < tourStops.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setStopIndex((i) => i + 1)}
                  className="px-3.5 py-1.5 rounded-lg bg-black text-white hover:bg-median-taupe text-[10px] font-bold uppercase transition-colors"
                >
                  Next Stop →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMood('celebrate');
                    setMode('docked');
                    setTargetRect(null);
                    window.setTimeout(() => setMood('idle'), 1500);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 text-[10px] font-bold uppercase transition-colors"
                >
                  Got It ✓
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. MONO COMMAND HUB (Proactive Suggestions + Guided Tour + Ask Anything) */}
      {mode === 'hub' && (
        <div
          className="fixed pointer-events-auto w-[370px] max-w-[calc(100vw-24px)] rounded-2xl bg-white border border-black/15 shadow-2xl overflow-hidden flex flex-col max-h-[min(560px,calc(100vh-120px))] font-mono text-xs"
          style={{
            right: isMobile ? '12px' : '26px',
            bottom: `${charSize + (isMobile ? 32 : 42)}px`,
          }}
        >
          {/* Editorial Top Header */}
          <div className="px-4 py-3 bg-black text-white flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-6 h-6 rounded-md bg-white/10 border border-median-taupe/60 flex items-center justify-center gap-1 shrink-0">
                <span className="w-1 h-2 rounded-full bg-[#FAF8F5]" />
                <span className="w-1 h-2 rounded-full bg-[#FAF8F5]" />
              </span>
              <div className="min-w-0">
                <div className="font-oswald text-sm font-bold uppercase tracking-wider leading-none">
                  MONO · {role === 'admin' ? 'Executive Copilot' : 'Client Concierge'}
                </div>
                <span className="text-[9px] text-median-taupe uppercase tracking-widest block mt-0.5">
                  Spatial Guide &amp; Live Suggestions
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleToggleSleep}
                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[9px] uppercase font-bold text-white/85"
                title="Put MONO to sleep in the corner"
              >
                ☾ Sleep
              </button>
              <button
                type="button"
                onClick={() => setMode('docked')}
                className="w-6 h-6 rounded-lg hover:bg-white/15 text-white/80 hover:text-white flex items-center justify-center text-sm"
                title="Minimize"
              >
                ×
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs: Smart Radar vs Ask MONO */}
          <div className="px-3 pt-2.5 pb-2 bg-[#FAF8F5] border-b border-median-taupe/15 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-median-taupe/20">
              <button
                type="button"
                onClick={() => setHubTab('radar')}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                  hubTab === 'radar' ? 'bg-black text-white' : 'text-median-taupe hover:text-black'
                }`}
              >
                Smart Radar ({suggestions.length})
              </button>
              <button
                type="button"
                onClick={() => setHubTab('ask')}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                  hubTab === 'ask' ? 'bg-black text-white' : 'text-median-taupe hover:text-black'
                }`}
              >
                Ask MONO
              </button>
            </div>

            {suggestions.length > 0 && (
              <button
                type="button"
                onClick={() => startFlight(suggestions.map((s) => s.stop), 0)}
                className="px-2.5 py-1.5 rounded-xl bg-median-taupe text-white hover:bg-black text-[10px] font-bold uppercase transition-colors whitespace-nowrap"
              >
                ✦ Fly Tour
              </button>
            )}
          </div>

          {/* TAB 1: PROACTIVE RADAR (Live Suggestions — Click any card to make MONO fly there!) */}
          {hubTab === 'radar' && (
            <div className="p-3.5 overflow-y-auto space-y-2.5 flex-1 bg-[#FAF8F5]/60">
              <p className="text-[11px] text-median-taupe leading-snug">
                Tap any card — MONO will <strong className="text-black">fly right to that button</strong> and spotlight what to do next.
              </p>

              {suggestions.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => startFlight([card.stop], 0)}
                  className="w-full text-left p-3 rounded-xl bg-white border border-median-taupe/20 hover:border-black hover:shadow-md transition-all group space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                        card.category === 'Alert'
                          ? 'bg-amber-50 text-amber-900 border-amber-300'
                          : card.category === 'Update Idea'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-[#FAF8F5] text-median-taupe border-median-taupe/30'
                      }`}
                    >
                      {card.category}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-median-taupe group-hover:text-black transition-colors">
                      Show Me ↗
                    </span>
                  </div>
                  <div className="font-oswald text-sm font-bold uppercase text-black leading-snug">
                    {card.title}
                  </div>
                  <p className="text-[11px] text-black/70 leading-snug">{card.detail}</p>
                </button>
              ))}
            </div>
          )}

          {/* TAB 2: INTERACTIVE ASK MONO (AI Q&A + Live Flight Stops) */}
          {hubTab === 'ask' && (
            <div className="p-3.5 overflow-y-auto space-y-3 flex-1 bg-[#FAF8F5]/60">
              {messages.length === 0 ? (
                <div className="p-3.5 rounded-xl bg-white border border-median-taupe/20 space-y-2">
                  <div className="font-oswald text-sm font-bold uppercase text-black">
                    Ask Me Anything About Your Portal
                  </div>
                  <p className="text-[11px] text-black/75 leading-relaxed">
                    {role === 'admin'
                      ? 'Ask what to prioritize today, request new feature/update ideas to pitch clients, or ask me to fly you to any admin tool.'
                      : 'Ask about your project progress, remaining LKR balance, receipts, renewals, or how to request a new feature.'}
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[90%] p-3 rounded-xl text-[11px] leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-black text-white rounded-br-sm'
                          : 'bg-white border border-median-taupe/25 text-black rounded-bl-sm shadow-sm'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>

                      {msg.role === 'model' && msg.stops && msg.stops.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-median-taupe/15 flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => startFlight(msg.stops!, 0)}
                            className="px-3 py-1.5 rounded-lg bg-black text-white hover:bg-median-taupe text-[10px] font-bold uppercase transition-colors inline-flex items-center gap-1"
                          >
                            <span>✦ Fly &amp; Show Me ({msg.stops.length})</span>
                            <span>→</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {isThinking && (
                <div className="p-3 rounded-xl bg-white border border-median-taupe/20 text-[11px] text-median-taupe animate-pulse inline-flex items-center gap-2">
                  <span>MONO is scanning live telemetry...</span>
                </div>
              )}

              {/* Quick Ask Chips */}
              {!isThinking && followUpChips.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {followUpChips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleAsk(chip)}
                      className="px-2.5 py-1 rounded-full bg-white border border-median-taupe/30 hover:border-black text-[10px] text-black transition-colors text-left"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}

          {/* Persistent Quick Ask Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="p-2.5 bg-white border-t border-median-taupe/20 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={
                role === 'admin'
                  ? 'Ask MONO: What to do next? Pitch ideas?'
                  : 'Ask MONO: Balance? Where to click?'
              }
              className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-median-taupe/30 bg-[#FAF8F5] text-xs text-black placeholder:text-median-taupe/70 focus:outline-none focus:border-black"
            />
            <button
              type="submit"
              disabled={!question.trim() || isThinking}
              className="px-3.5 py-2 rounded-xl bg-black text-white hover:bg-median-taupe text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-40 shrink-0"
            >
              Ask →
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
