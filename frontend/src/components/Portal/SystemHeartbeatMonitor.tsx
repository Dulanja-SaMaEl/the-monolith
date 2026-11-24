import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SystemHeartbeat } from '../../lib/portalStore';
import { portalApi } from '../../lib/portalApi';

interface SystemHeartbeatMonitorProps {
  projectId: string;
  productionUrl?: string;
  variant?: 'vault' | 'compact';
}

function formatRelativeTime(isoDate?: string, nowMs = Date.now()): string {
  if (!isoDate) return 'Just now';
  const diffSec = Math.max(0, Math.floor((nowMs - new Date(isoDate).getTime()) / 1000));
  if (diffSec < 15) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

function getLatencyGrade(ms: number | null): { label: string; cls: string } {
  if (ms === null) return { label: 'No Signal', cls: 'text-red-700' };
  if (ms <= 350) return { label: 'Optimal', cls: 'text-emerald-700' };
  if (ms <= 1000) return { label: 'Healthy', cls: 'text-emerald-700' };
  if (ms <= 2500) return { label: 'Moderate', cls: 'text-amber-700' };
  return { label: 'Elevated', cls: 'text-red-700' };
}

export const SystemHeartbeatMonitor: React.FC<SystemHeartbeatMonitorProps> = ({
  projectId,
  productionUrl,
  variant = 'vault',
}) => {
  const [heartbeat, setHeartbeat] = useState<SystemHeartbeat | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const mountedRef = useRef(true);

  const runCheck = useCallback(
    async (force = false) => {
      if (!productionUrl?.trim()) return;
      setIsChecking(true);
      try {
        const result = await portalApi.getProjectHeartbeat(projectId, productionUrl, force);
        if (!mountedRef.current) return;
        setHeartbeat((prev) => {
          // Preserve accumulated client-side history if backend returned a shorter list
          const incomingHistory = result.history || [];
          const mergedHistory =
            incomingHistory.length >= (prev?.history?.length || 0)
              ? incomingHistory
              : [
                  ...(prev?.history || []),
                  {
                    status: result.status === 'unconfigured' ? 'offline' : result.status,
                    latency_ms: result.latency_ms,
                    checked_at: result.checked_at,
                  },
                ].slice(-12);
          return { ...result, history: mergedHistory };
        });
        setNowMs(Date.now());
      } finally {
        if (mountedRef.current) setIsChecking(false);
      }
    },
    [projectId, productionUrl]
  );

  useEffect(() => {
    mountedRef.current = true;
    if (!productionUrl?.trim()) return;

    runCheck(false);

    // Quiet auto-heartbeat every 2 minutes while the portal tab is open
    const autoProbeInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        runCheck(false);
      }
    }, 120_000);

    // Refresh the "Last Checked Xm ago" relative clock every 15 seconds
    const clockInterval = setInterval(() => {
      setNowMs(Date.now());
    }, 15_000);

    return () => {
      mountedRef.current = false;
      clearInterval(autoProbeInterval);
      clearInterval(clockInterval);
    };
  }, [productionUrl, runCheck]);

  if (!productionUrl?.trim()) return null;

  const status = heartbeat?.status;
  const isOnline = status === 'online';
  const isDegraded = status === 'degraded';
  const isOffline = status === 'offline';

  const statusConfig = !heartbeat
    ? {
        dot: 'bg-median-taupe',
        ping: 'bg-median-taupe/50',
        pill: 'bg-median-taupe/10 text-median-taupe border-median-taupe/30',
        label: 'PROBING',
      }
    : isOnline
    ? {
        dot: 'bg-emerald-500',
        ping: 'bg-emerald-400',
        pill: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        label: 'ONLINE',
      }
    : isDegraded
    ? {
        dot: 'bg-amber-500',
        ping: 'bg-amber-400',
        pill: 'bg-amber-50 text-amber-800 border-amber-200',
        label: 'DEGRADED',
      }
    : {
        dot: 'bg-red-500',
        ping: 'bg-red-400',
        pill: 'bg-red-50 text-red-800 border-red-200',
        label: 'OFFLINE',
      };

  const ssl = heartbeat?.ssl;
  const sslSummary = !heartbeat
    ? 'Checking SSL...'
    : !ssl
    ? 'SSL Unavailable'
    : !ssl.enabled
    ? 'HTTP Only (No SSL)'
    : ssl.valid === false
    ? ssl.days_remaining !== null && ssl.days_remaining <= 0
      ? `SSL Expired (${Math.abs(ssl.days_remaining)}d ago)`
      : 'SSL Invalid'
    : ssl.days_remaining !== null
    ? `SSL Valid ${ssl.days_remaining} Days`
    : 'SSL Active (HTTPS)';

  const sslBadgeClass = !heartbeat
    ? 'text-median-taupe'
    : !ssl || !ssl.enabled || ssl.valid === false
    ? 'text-red-700'
    : ssl.days_remaining !== null && ssl.days_remaining <= 21
    ? 'text-amber-700'
    : 'text-emerald-700';

  const latencyGrade = getLatencyGrade(heartbeat?.latency_ms ?? null);
  const relativeChecked = heartbeat ? formatRelativeTime(heartbeat.checked_at, nowMs) : 'Connecting...';

  // ==================== COMPACT VARIANT (ADMIN PROJECTS) ====================
  if (variant === 'compact') {
    return (
      <div className="px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-median-taupe/20 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border font-bold uppercase text-[10px] ${statusConfig.pill}`}>
            <span className="relative flex h-2 w-2">
              {(isOnline || !heartbeat) && (
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusConfig.ping}`} />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${statusConfig.dot}`} />
            </span>
            <span>{statusConfig.label}</span>
          </span>

          {heartbeat?.latency_ms !== null && heartbeat?.latency_ms !== undefined && (
            <span className="font-semibold text-black">
              {heartbeat.latency_ms}ms
            </span>
          )}

          <span className="text-median-taupe/40 hidden sm:inline">·</span>

          <span className={`font-semibold ${sslBadgeClass}`}>
            {sslSummary}
          </span>

          <span className="text-median-taupe/40 hidden md:inline">·</span>

          <a
            href={productionUrl}
            target="_blank"
            rel="noreferrer"
            className="text-median-taupe hover:text-black truncate max-w-[200px] underline decoration-median-taupe/40"
            title={productionUrl}
          >
            {heartbeat?.hostname || productionUrl.replace(/^https?:\/\//i, '')}
          </a>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-[10px] text-median-taupe/80">
            Checked {relativeChecked}
          </span>
          <button
            type="button"
            disabled={isChecking}
            onClick={() => runCheck(true)}
            className="px-2.5 py-1 rounded-lg border border-median-taupe/30 bg-white hover:border-black text-[10px] font-bold uppercase text-black transition-colors disabled:opacity-50 inline-flex items-center gap-1"
            title="Run live production heartbeat check"
          >
            <span className={isChecking ? 'inline-block animate-spin' : ''}>↻</span>
            <span>{isChecking ? 'Checking' : 'Ping'}</span>
          </button>
        </div>
      </div>
    );
  }

  // ==================== FULL VAULT VARIANT (CLIENT PORTAL) ====================
  const historyBars = heartbeat?.history || [];
  const paddedSlots = Math.max(0, 12 - historyBars.length);

  return (
    <div className="rounded-2xl bg-[#FAF8F5] border border-median-taupe/25 overflow-hidden">
      {/* Top Live Telemetry Pulse Header */}
      <div className="px-4 sm:px-5 py-3.5 bg-white border-b border-median-taupe/15 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          {/* Live Pulsing Status Badge */}
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider ${statusConfig.pill}`}
          >
            <span className="relative flex h-2.5 w-2.5">
              {(isOnline || !heartbeat) && (
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusConfig.ping}`}
                />
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${statusConfig.dot}`} />
            </span>
            <span>{statusConfig.label}</span>
          </span>

          {/* Headline Telemetry Readout */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] sm:text-xs text-black/85">
            {heartbeat ? (
              <>
                <span className="font-semibold text-black">
                  {heartbeat.latency_ms !== null ? `${heartbeat.latency_ms}ms Response` : 'No Response'}
                </span>
                <span className="text-median-taupe/50">·</span>
                <span className={`font-semibold ${sslBadgeClass}`}>{sslSummary}</span>
                <span className="text-median-taupe/50">·</span>
                <span className="text-median-taupe">Last Checked {relativeChecked}</span>
              </>
            ) : (
              <span className="text-median-taupe animate-pulse">
                Running live production telemetry &amp; SSL certificate verification...
              </span>
            )}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center justify-between lg:justify-end gap-2.5 shrink-0">
          <span className="px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-median-taupe/25 text-[10px] font-mono uppercase tracking-wider text-median-taupe font-semibold">
            24/7 Watch · Monolith LK
          </span>
          <button
            type="button"
            disabled={isChecking}
            onClick={() => runCheck(true)}
            className="px-3 py-1.5 rounded-xl border border-black bg-white hover:bg-black hover:text-white text-[10px] font-mono font-bold uppercase tracking-wider text-black transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <span className={isChecking ? 'inline-block animate-spin' : ''}>↻</span>
            <span>{isChecking ? 'Checking...' : 'Check Now'}</span>
          </button>
        </div>
      </div>

      {/* Detailed 3-Metric Telemetry Grid */}
      <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
        {/* Metric 1: Live Latency & HTTP */}
        <div className="p-3.5 rounded-xl bg-white border border-median-taupe/15 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase tracking-wider text-median-taupe">Response Latency</span>
            {heartbeat?.http_status && (
              <span className="px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-median-taupe/20 text-[10px] font-bold text-black">
                HTTP {heartbeat.http_status}
              </span>
            )}
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <strong className="font-oswald text-2xl font-bold text-black tracking-tight">
              {!heartbeat ? '—' : heartbeat.latency_ms !== null ? `${heartbeat.latency_ms}ms` : 'Timeout'}
            </strong>
            <span className={`text-[10px] font-bold uppercase ${latencyGrade.cls}`}>
              {!heartbeat ? 'Measuring' : latencyGrade.label}
            </span>
          </div>
        </div>

        {/* Metric 2: SSL Certificate Health */}
        <div className="p-3.5 rounded-xl bg-white border border-median-taupe/15 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase tracking-wider text-median-taupe">SSL / TLS Security</span>
            {ssl?.protocol && (
              <span className="px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-median-taupe/20 text-[10px] font-bold text-black">
                {ssl.protocol}
              </span>
            )}
          </div>
          <div>
            <strong className={`font-oswald text-2xl font-bold tracking-tight block ${sslBadgeClass}`}>
              {!heartbeat
                ? '—'
                : ssl?.enabled && ssl.valid
                ? ssl.days_remaining !== null
                  ? `${ssl.days_remaining} Days`
                  : 'Verified'
                : ssl?.enabled
                ? 'Action Needed'
                : 'No SSL'}
            </strong>
            <span className="text-[10px] text-median-taupe block truncate mt-0.5">
              {ssl?.issuer
                ? `${ssl.issuer}${ssl.expires_at ? ` · Exp ${ssl.expires_at}` : ''}`
                : 'Live X.509 Certificate Monitor'}
            </span>
          </div>
        </div>

        {/* Metric 3: Monitored Endpoint & Pulse History */}
        <div className="p-3.5 rounded-xl bg-white border border-median-taupe/15 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase tracking-wider text-median-taupe">Live Pulse Stream</span>
            <span className="text-[10px] text-median-taupe/80 truncate max-w-[140px]" title={productionUrl}>
              {heartbeat?.hostname || productionUrl.replace(/^https?:\/\//i, '')}
            </span>
          </div>

          {/* 12-Slot Minimalist Uptime Bar */}
          <div className="flex items-end gap-1 h-7 pt-1" aria-label="Recent system heartbeat checks">
            {Array.from({ length: paddedSlots }).map((_, idx) => (
              <span
                key={`pad-${idx}`}
                className="flex-1 h-2.5 rounded-sm bg-median-taupe/15"
                title="Awaiting scheduled probe"
              />
            ))}
            {historyBars.map((sample, idx) => {
              const barColor =
                sample.status === 'online'
                  ? 'bg-emerald-500'
                  : sample.status === 'degraded'
                  ? 'bg-amber-500'
                  : 'bg-red-500';
              const heightCls =
                sample.status === 'offline'
                  ? 'h-3'
                  : sample.latency_ms && sample.latency_ms > 1000
                  ? 'h-4'
                  : sample.latency_ms && sample.latency_ms > 400
                  ? 'h-5'
                  : 'h-6';
              return (
                <span
                  key={`${sample.checked_at}-${idx}`}
                  className={`flex-1 rounded-sm transition-all duration-300 ${barColor} ${heightCls}`}
                  title={`${sample.status.toUpperCase()}${
                    sample.latency_ms !== null ? ` · ${sample.latency_ms}ms` : ''
                  } · ${formatRelativeTime(sample.checked_at, nowMs)}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Anomaly Alert Strip (Only shown if degraded or offline) */}
      {(isDegraded || isOffline) && heartbeat?.error_detail && (
        <div
          className={`px-4 sm:px-5 py-2.5 border-t text-[11px] font-mono flex flex-wrap items-center justify-between gap-2 ${
            isOffline
              ? 'bg-red-50 border-red-200 text-red-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <span>
            <strong>Telemetry Notice:</strong> {heartbeat.error_detail}
          </span>
          <span className="text-[10px] uppercase font-bold opacity-80">
            Monolith LK SRE Desk Notified Under Active SLA
          </span>
        </div>
      )}
    </div>
  );
};
