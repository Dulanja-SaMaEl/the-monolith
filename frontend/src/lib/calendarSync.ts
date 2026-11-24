// ====================================================================
// MONOLITH LK — "RENEWAL SHIELD" 1-TAP CALENDAR SYNC (.ICS + GOOGLE)
// Generates RFC 5545 .ics files with automatic VALARM reminders
// ====================================================================

export interface CalendarReminderEvent {
  uid: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time?: string; // Optional HH:MM (Asia/Colombo UTC+5:30)
  durationMinutes?: number;
  location?: string;
  reminderDaysBefore?: number[]; // e.g. [7, 1] for renewals, [3, 1] for payments
  filename?: string;
}

function escapeIcsText(input: string): string {
  return String(input || '')
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\r|\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

function formatUtcStamp(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

function addDaysToYmd(ymd: string, days: number): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return ymd;
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

function toCompactDate(ymd: string): string {
  return ymd.replace(/-/g, '');
}

/**
 * Convert an Asia/Colombo (UTC+5:30) date + HH:MM into UTC YYYYMMDDTHHMMSSZ
 */
function colomboToUtcStamp(ymd: string, hhmm: string, addMinutes = 0): string {
  const [hStr, mStr] = hhmm.split(':');
  const hours = Number(hStr) || 9;
  const minutes = Number(mStr) || 0;
  const baseUtc = new Date(`${ymd}T00:00:00Z`);
  // Subtract 5h 30m (330 min) to convert UTC+5:30 local time to UTC
  const totalMinutes = hours * 60 + minutes - 330 + addMinutes;
  baseUtc.setUTCMinutes(baseUtc.getUTCMinutes() + totalMinutes);
  return formatUtcStamp(baseUtc);
}

export function buildIcsContent(event: CalendarReminderEvent): string {
  const nowStamp = formatUtcStamp(new Date());
  const safeUid = `${event.uid.replace(/[^a-zA-Z0-9._-]/g, '-')}@monolith.lk`;
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Monolith LK//Renewal Shield Calendar Sync//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${safeUid}`,
    `DTSTAMP:${nowStamp}`,
  ];

  if (event.time && /^\d{1,2}:\d{2}/.test(event.time)) {
    const startUtc = colomboToUtcStamp(event.date, event.time, 0);
    const endUtc = colomboToUtcStamp(event.date, event.time, event.durationMinutes || 60);
    lines.push(`DTSTART:${startUtc}`);
    lines.push(`DTEND:${endUtc}`);
  } else {
    const startDay = toCompactDate(event.date);
    const nextDay = toCompactDate(addDaysToYmd(event.date, 1));
    lines.push(`DTSTART;VALUE=DATE:${startDay}`);
    lines.push(`DTEND;VALUE=DATE:${nextDay}`);
  }

  lines.push(`SUMMARY:${escapeIcsText(event.title)}`);
  lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
  if (event.location) {
    lines.push(`LOCATION:${escapeIcsText(event.location)}`);
  }

  // Automatic VALARM reminders
  if (event.time) {
    lines.push(
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeIcsText(`Upcoming: ${event.title}`)}`,
      'TRIGGER:-PT30M',
      'END:VALARM'
    );
  } else {
    const daysList = event.reminderDaysBefore && event.reminderDaysBefore.length > 0 ? event.reminderDaysBefore : [7, 1];
    for (const d of daysList) {
      lines.push(
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:${escapeIcsText(`Reminder (${d}d before): ${event.title}`)}`,
        `TRIGGER:-P${Math.max(1, Math.round(d))}D`,
        'END:VALARM'
      );
    }
  }

  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadIcsReminder(event: CalendarReminderEvent): void {
  const ics = buildIcsContent(event);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const slug = (event.filename || event.title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${slug || 'monolith-lk-reminder'}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function buildGoogleCalendarUrl(event: CalendarReminderEvent): string {
  let datesParam = '';
  if (event.time && /^\d{1,2}:\d{2}/.test(event.time)) {
    const startUtc = colomboToUtcStamp(event.date, event.time, 0);
    const endUtc = colomboToUtcStamp(event.date, event.time, event.durationMinutes || 60);
    datesParam = `${startUtc}/${endUtc}`;
  } else {
    const startDay = toCompactDate(event.date);
    const nextDay = toCompactDate(addDaysToYmd(event.date, 1));
    datesParam = `${startDay}/${nextDay}`;
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: datesParam,
    details: event.description,
    location: event.location || 'Monolith LK Client Portal',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
