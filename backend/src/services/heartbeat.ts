import dns from 'dns';
import http from 'http';
import https from 'https';
import net from 'net';
import tls from 'tls';
import { performance } from 'perf_hooks';

export interface HeartbeatSslInfo {
  enabled: boolean;
  valid: boolean;
  days_remaining: number | null;
  expires_at: string | null;
  issuer: string | null;
  protocol: string | null;
}

export interface HeartbeatSample {
  status: 'online' | 'degraded' | 'offline';
  latency_ms: number | null;
  checked_at: string;
}

export interface HeartbeatResult {
  configured: boolean;
  project_id: string;
  url: string;
  hostname: string;
  status: 'online' | 'degraded' | 'offline' | 'unconfigured';
  http_status: number | null;
  latency_ms: number | null;
  ssl: HeartbeatSslInfo | null;
  checked_at: string;
  cached: boolean;
  error_detail: string | null;
  history: HeartbeatSample[];
}

interface CacheEntry {
  result: HeartbeatResult;
  fetchedAt: number;
}

const CACHE_TTL_MS = 60_000; // 60 seconds default cache
const FORCE_COOLDOWN_MS = 5_000; // 5 seconds minimum between manual probes
const PROBE_TIMEOUT_MS = 6_000;
const MAX_REDIRECTS = 3;
const MAX_HISTORY_SAMPLES = 12;
const MAX_CACHE_ENTRIES = 500;

const heartbeatCache = new Map<string, CacheEntry>();
const historyStore = new Map<string, HeartbeatSample[]>();

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map((p) => Number(p));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) {
    return true;
  }
  const [a, b] = parts;
  if (a === 0) return true; // 0.0.0.0/8
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 127) return true; // 127.0.0.0/8 loopback
  if (a === 169 && b === 254) return true; // 169.254.0.0/16 link-local & cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 CGNAT
  if (a === 198 && (b === 18 || b === 19)) return true; // Benchmark
  if (a >= 224) return true; // Multicast & reserved
  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === '::1' || normalized === '::') return true;
  if (normalized.startsWith('fe80:') || normalized.startsWith('fc') || normalized.startsWith('fd')) {
    return true;
  }
  if (normalized.startsWith('::ffff:')) {
    const mapped = normalized.replace('::ffff:', '');
    if (net.isIPv4(mapped)) return isPrivateIPv4(mapped);
  }
  return false;
}

function isPrivateOrReservedIp(ip: string): boolean {
  const ipVersion = net.isIP(ip);
  if (ipVersion === 4) return isPrivateIPv4(ip);
  if (ipVersion === 6) return isPrivateIPv6(ip);
  return true;
}

async function validateAndResolveTarget(rawUrl: string): Promise<{
  parsed: URL;
  resolvedIp: string;
  ipFamily: 4 | 6;
}> {
  let normalizedUrl = rawUrl.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(normalizedUrl);
  } catch {
    throw new Error('Invalid production URL format');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only HTTP and HTTPS endpoints are supported');
  }

  if (parsed.username || parsed.password) {
    throw new Error('Embedded credentials in URL are not allowed');
  }

  const hostname = parsed.hostname.toLowerCase();
  if (
    !hostname ||
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname === 'metadata.google.internal'
  ) {
    throw new Error('Private or internal hostnames cannot be monitored');
  }

  if (net.isIP(hostname)) {
    if (isPrivateOrReservedIp(hostname)) {
      throw new Error('Private or reserved IP addresses cannot be monitored');
    }
    return {
      parsed,
      resolvedIp: hostname,
      ipFamily: net.isIPv6(hostname) ? 6 : 4,
    };
  }

  const records = await dns.promises.lookup(hostname, { all: true, verbatim: false });
  if (!records || records.length === 0) {
    throw new Error('DNS resolution failed for host');
  }

  for (const rec of records) {
    if (isPrivateOrReservedIp(rec.address)) {
      throw new Error('Target resolves to a restricted private network');
    }
  }

  const preferred = records.find((r) => r.family === 4) || records[0];
  return {
    parsed,
    resolvedIp: preferred.address,
    ipFamily: preferred.family === 6 ? 6 : 4,
  };
}

function parseCertificate(cert: tls.PeerCertificate | null | undefined, authorized: boolean, protocol: string | null): HeartbeatSslInfo {
  if (!cert || !cert.valid_to) {
    return {
      enabled: true,
      valid: authorized,
      days_remaining: null,
      expires_at: null,
      issuer: null,
      protocol,
    };
  }

  const expiryMs = Date.parse(cert.valid_to);
  const daysRemaining = Number.isNaN(expiryMs)
    ? null
    : Math.floor((expiryMs - Date.now()) / (1000 * 60 * 60 * 24));
  const expiresAt = Number.isNaN(expiryMs) ? null : new Date(expiryMs).toISOString().split('T')[0];

  const issuerRaw = cert.issuer;
  const issuer =
    (typeof issuerRaw?.O === 'string' && issuerRaw.O) ||
    (typeof issuerRaw?.CN === 'string' && issuerRaw.CN) ||
    'Verified SSL Authority';

  return {
    enabled: true,
    valid: authorized && (daysRemaining === null || daysRemaining > 0),
    days_remaining: daysRemaining,
    expires_at: expiresAt,
    issuer,
    protocol,
  };
}

function inspectTlsFallback(ip: string, port: number, servername: string): Promise<HeartbeatSslInfo | null> {
  return new Promise((resolve) => {
    const socket = tls.connect(
      {
        host: ip,
        port,
        servername,
        rejectUnauthorized: false,
        timeout: 3_000,
      },
      () => {
        try {
          const cert = socket.getPeerCertificate(false);
          const protocol = socket.getProtocol?.() || null;
          const info = parseCertificate(cert, socket.authorized, protocol);
          socket.destroy();
          resolve(info);
        } catch {
          socket.destroy();
          resolve(null);
        }
      }
    );

    socket.on('timeout', () => {
      socket.destroy();
      resolve(null);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(null);
    });
  });
}

interface RawProbeResponse {
  httpStatus: number;
  latencyMs: number;
  locationHeader?: string;
  ssl: HeartbeatSslInfo | null;
}

function runSingleProbe(
  parsed: URL,
  resolvedIp: string,
  ipFamily: 4 | 6,
  method: 'HEAD' | 'GET'
): Promise<RawProbeResponse> {
  return new Promise((resolve, reject) => {
    const isHttps = parsed.protocol === 'https:';
    const port = parsed.port ? Number(parsed.port) : isHttps ? 443 : 80;
    const pathWithQuery = `${parsed.pathname || '/'}${parsed.search || ''}`;
    const start = performance.now();

    const requestOptions: https.RequestOptions = {
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      port,
      path: pathWithQuery,
      method,
      timeout: PROBE_TIMEOUT_MS,
      headers: {
        Host: parsed.host,
        'User-Agent': 'MonolithLK-Heartbeat/1.0 (+https://monolith.lk)',
        Accept: 'text/html,application/json;q=0.9,*/*;q=0.8',
        Connection: 'close',
      },
      lookup: ((_hostname: string, _options: any, cb: any) => {
        if (typeof _options === 'function') {
          _options(null, resolvedIp, ipFamily);
          return;
        }
        if (_options && _options.all) {
          cb(null, [{ address: resolvedIp, family: ipFamily }]);
          return;
        }
        cb(null, resolvedIp, ipFamily);
      }) as any,
      ...(isHttps ? { servername: parsed.hostname, rejectUnauthorized: true } : {}),
    };

    const transport = isHttps ? https : http;
    let settled = false;

    const req = transport.request(requestOptions, (res) => {
      const latencyMs = Math.max(1, Math.round(performance.now() - start));
      let sslInfo: HeartbeatSslInfo | null = null;

      if (isHttps) {
        const tlsSocket = res.socket as tls.TLSSocket;
        if (tlsSocket && typeof tlsSocket.getPeerCertificate === 'function') {
          sslInfo = parseCertificate(
            tlsSocket.getPeerCertificate(false),
            Boolean(tlsSocket.authorized),
            tlsSocket.getProtocol?.() || null
          );
        }
      } else {
        sslInfo = {
          enabled: false,
          valid: false,
          days_remaining: null,
          expires_at: null,
          issuer: null,
          protocol: 'HTTP (No TLS)',
        };
      }

      const status = res.statusCode ?? 0;
      const locationHeader = typeof res.headers.location === 'string' ? res.headers.location : undefined;

      // Immediately close stream — we only need status headers & TLS metadata
      res.resume();
      res.destroy();

      if (!settled) {
        settled = true;
        resolve({
          httpStatus: status,
          latencyMs,
          locationHeader,
          ssl: sslInfo,
        });
      }
    });

    req.on('timeout', () => {
      req.destroy(new Error('Connection timed out after 6s'));
    });

    req.on('error', (err) => {
      if (!settled) {
        settled = true;
        reject(err);
      }
    });

    req.end();
  });
}

function classifyStatus(
  httpStatus: number | null,
  latencyMs: number | null,
  ssl: HeartbeatSslInfo | null
): { status: 'online' | 'degraded' | 'offline'; errorDetail: string | null } {
  if (httpStatus === null || httpStatus === 0) {
    return { status: 'offline', errorDetail: 'Endpoint unreachable' };
  }
  if (httpStatus >= 500) {
    return { status: 'offline', errorDetail: `Server returned HTTP ${httpStatus}` };
  }
  if (httpStatus >= 400 && httpStatus !== 401 && httpStatus !== 403) {
    return { status: 'degraded', errorDetail: `Endpoint returned HTTP ${httpStatus}` };
  }
  if (ssl?.enabled && ssl.valid === false) {
    return { status: 'degraded', errorDetail: 'SSL certificate invalid or expired' };
  }
  if (latencyMs !== null && latencyMs > 2500) {
    return { status: 'degraded', errorDetail: `Elevated response time (${latencyMs}ms)` };
  }
  return { status: 'online', errorDetail: null };
}

function recordHistorySample(cacheKey: string, sample: HeartbeatSample): HeartbeatSample[] {
  const existing = historyStore.get(cacheKey) || [];
  const next = [...existing, sample].slice(-MAX_HISTORY_SAMPLES);
  historyStore.set(cacheKey, next);
  if (historyStore.size > MAX_CACHE_ENTRIES) {
    const oldestKey = historyStore.keys().next().value;
    if (oldestKey) historyStore.delete(oldestKey);
  }
  return next;
}

export async function checkSystemHeartbeat(
  projectId: string,
  rawUrl: string,
  force = false
): Promise<HeartbeatResult> {
  const trimmedUrl = (rawUrl || '').trim();
  const cacheKey = `${projectId}::${trimmedUrl}`;
  const now = Date.now();
  const existing = heartbeatCache.get(cacheKey);

  if (existing) {
    const age = now - existing.fetchedAt;
    if ((!force && age < CACHE_TTL_MS) || (force && age < FORCE_COOLDOWN_MS)) {
      return {
        ...existing.result,
        cached: true,
        history: historyStore.get(cacheKey) || existing.result.history,
      };
    }
  }

  const checkedAt = new Date().toISOString();
  let targetUrl = trimmedUrl;
  let lastHostname = '';
  let lastResolvedIp = '';
  let lastParsed: URL | null = null;

  try {
    let currentResponse: RawProbeResponse | null = null;
    let redirects = 0;

    while (redirects <= MAX_REDIRECTS) {
      const { parsed, resolvedIp, ipFamily } = await validateAndResolveTarget(targetUrl);
      lastParsed = parsed;
      lastHostname = parsed.hostname;
      lastResolvedIp = resolvedIp;

      let probe = await runSingleProbe(parsed, resolvedIp, ipFamily, 'HEAD');
      if (probe.httpStatus === 405 || probe.httpStatus === 501 || probe.httpStatus === 400) {
        probe = await runSingleProbe(parsed, resolvedIp, ipFamily, 'GET');
      }

      if (
        probe.httpStatus >= 300 &&
        probe.httpStatus < 400 &&
        probe.locationHeader &&
        redirects < MAX_REDIRECTS
      ) {
        targetUrl = new URL(probe.locationHeader, parsed).toString();
        redirects += 1;
        continue;
      }

      currentResponse = probe;
      break;
    }

    if (!currentResponse) {
      throw new Error('Too many redirects while probing endpoint');
    }

    const { status, errorDetail } = classifyStatus(
      currentResponse.httpStatus,
      currentResponse.latencyMs,
      currentResponse.ssl
    );

    const history = recordHistorySample(cacheKey, {
      status,
      latency_ms: currentResponse.latencyMs,
      checked_at: checkedAt,
    });

    const result: HeartbeatResult = {
      configured: true,
      project_id: projectId,
      url: trimmedUrl,
      hostname: lastHostname || trimmedUrl,
      status,
      http_status: currentResponse.httpStatus,
      latency_ms: currentResponse.latencyMs,
      ssl: currentResponse.ssl,
      checked_at: checkedAt,
      cached: false,
      error_detail: errorDetail,
      history,
    };

    if (heartbeatCache.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = heartbeatCache.keys().next().value;
      if (oldestKey) heartbeatCache.delete(oldestKey);
    }
    heartbeatCache.set(cacheKey, { result, fetchedAt: now });
    return result;
  } catch (err: any) {
    const code = err?.code || '';
    const isCertError =
      typeof code === 'string' &&
      (code.includes('CERT') || code.includes('TLS') || code.includes('SSL') || code === 'DEPTH_ZERO_SELF_SIGNED_CERT');

    let fallbackSsl: HeartbeatSslInfo | null = null;
    if (isCertError && lastParsed && lastResolvedIp && lastParsed.protocol === 'https:') {
      const port = lastParsed.port ? Number(lastParsed.port) : 443;
      fallbackSsl = await inspectTlsFallback(lastResolvedIp, port, lastParsed.hostname);
    }

    const status: 'degraded' | 'offline' = isCertError ? 'degraded' : 'offline';
    const history = recordHistorySample(cacheKey, {
      status,
      latency_ms: null,
      checked_at: checkedAt,
    });

    const result: HeartbeatResult = {
      configured: true,
      project_id: projectId,
      url: trimmedUrl,
      hostname: lastHostname || trimmedUrl,
      status,
      http_status: null,
      latency_ms: null,
      ssl: fallbackSsl,
      checked_at: checkedAt,
      cached: false,
      error_detail: err?.message || 'Unable to reach production endpoint',
      history,
    };

    heartbeatCache.set(cacheKey, { result, fetchedAt: now });
    return result;
  }
}
