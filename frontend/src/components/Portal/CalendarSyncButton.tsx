import React, { useState, useRef, useEffect } from 'react';
import {
  CalendarReminderEvent,
  downloadIcsReminder,
  buildGoogleCalendarUrl,
} from '../../lib/calendarSync';

interface CalendarSyncButtonProps {
  event: CalendarReminderEvent;
  label?: string;
  size?: 'xs' | 'sm';
  align?: 'left' | 'right';
}

export const CalendarSyncButton: React.FC<CalendarSyncButtonProps> = ({
  event,
  label = '+ Calendar',
  size = 'xs',
  align = 'right',
}) => {
  const [open, setOpen] = useState(false);
  const [synced, setSynced] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  if (!event.date) return null;

  const handleIcs = () => {
    downloadIcsReminder(event);
    setSynced(true);
    setOpen(false);
    setTimeout(() => setSynced(false), 3000);
  };

  const googleUrl = buildGoogleCalendarUrl(event);
  const paddingCls = size === 'sm' ? 'px-3 py-1.5 text-[11px]' : 'px-2.5 py-1 text-[10px]';

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${paddingCls} rounded-full border font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors whitespace-nowrap ${
          synced
            ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
            : 'border-median-taupe/35 bg-white text-black hover:border-black hover:bg-black hover:text-white'
        }`}
        title="Renewal Shield — Add automatic reminder to Apple or Google Calendar"
      >
        <svg
          className="w-3 h-3 shrink-0"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <rect x="2" y="3" width="12" height="11" rx="2" />
          <path d="M5 1.5v3M11 1.5v3M2 6.5h12" />
        </svg>
        <span>{synced ? 'Saved ✓' : label}</span>
      </button>

      {open && (
        <div
          className={`absolute z-50 mt-1.5 w-56 rounded-xl bg-white border border-black/15 shadow-xl p-1.5 text-left font-mono text-[11px] ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <div className="px-2.5 py-1.5 border-b border-median-taupe/15 mb-1">
            <span className="text-[9px] uppercase tracking-widest text-median-taupe font-bold block">
              Renewal Shield Sync
            </span>
            <span className="text-[10px] text-black/75 block truncate">{event.date}</span>
          </div>

          <button
            type="button"
            onClick={handleIcs}
            className="w-full px-2.5 py-2 rounded-lg text-left hover:bg-[#FAF8F5] text-black flex items-center justify-between gap-2 transition-colors"
          >
            <div>
              <span className="font-bold block text-[11px]">Apple / iPhone / Outlook</span>
              <span className="text-[9px] text-median-taupe">Downloads .ics with auto alerts</span>
            </div>
            <span className="text-xs font-bold">↓</span>
          </button>

          <a
            href={googleUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              setSynced(true);
              setOpen(false);
              setTimeout(() => setSynced(false), 3000);
            }}
            className="w-full px-2.5 py-2 rounded-lg text-left hover:bg-[#FAF8F5] text-black flex items-center justify-between gap-2 transition-colors"
          >
            <div>
              <span className="font-bold block text-[11px]">Google Calendar</span>
              <span className="text-[9px] text-median-taupe">1-tap web &amp; Android sync</span>
            </div>
            <span className="text-xs font-bold">↗</span>
          </a>
        </div>
      )}
    </div>
  );
};
