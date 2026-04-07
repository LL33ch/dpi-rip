import type { SiteCheckResult } from './site';

const TIMEOUT_MS = 8000;

function parseCdnTrace(text: string): Record<string, string> {
  return Object.fromEntries(
    text
      .split('\n')
      .map((line) => line.split('='))
      .filter((parts) => parts.length === 2)
      .map(([k, v]) => [k.trim(), v.trim()]),
  );
}

export interface CdnTraceCheckResult extends Omit<SiteCheckResult, 'status'> {
  status: SiteCheckResult['status'] | 'geo-blocked';
  traceIp?: string;
  traceLoc?: string;
  traceColo?: string;
  traceWarp?: string;
}

export async function checkCdnTrace(
  domain: string,
  blockedIn: string[] = [],
): Promise<CdnTraceCheckResult> {
  const start = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`https://${domain}/cdn-cgi/trace`, {
      signal: ctrl.signal,
      cache: 'no-store',
    });

    if (!res.ok) {
      return { domain, status: 'blocked', elapsed: Date.now() - start, attempts: 1 };
    }

    const text = await res.text();
    const data = parseCdnTrace(text);

    if (!data.ip) {
      return { domain, status: 'blocked', elapsed: Date.now() - start, attempts: 1 };
    }

    const loc = data.loc?.toUpperCase();
    const isGeoBlocked = blockedIn.length > 0 && !!loc && blockedIn.includes(loc);

    return {
      domain,
      status: isGeoBlocked ? 'geo-blocked' : 'ok',
      elapsed: Date.now() - start,
      attempts: 1,
      traceIp: data.ip,
      traceLoc: loc,
      traceColo: data.colo,
      traceWarp: data.warp,
    };
  } catch {
    return { domain, status: 'blocked', elapsed: Date.now() - start, attempts: 1 };
  } finally {
    clearTimeout(timer);
  }
}
