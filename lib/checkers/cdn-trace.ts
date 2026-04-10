import type { SiteCheckResult } from './site';

const TIMEOUT_MS = 8000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

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

async function attemptCdnTrace(domain: string): Promise<Record<string, string> | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`https://${domain}/cdn-cgi/trace`, {
      signal: ctrl.signal,
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = parseCdnTrace(await res.text());
    return data.ip ? data : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function checkCdnTrace(
  domain: string,
  blockedIn: string[] = [],
): Promise<CdnTraceCheckResult> {
  const start = Date.now();

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    const data = await attemptCdnTrace(domain);
    if (data) {
      const loc = data.loc?.toUpperCase();
      const isGeoBlocked = blockedIn.length > 0 && !!loc && blockedIn.includes(loc);
      return {
        domain,
        status: isGeoBlocked ? 'geo-blocked' : 'ok',
        elapsed: Date.now() - start,
        attempts: attempt,
        traceIp: data.ip,
        traceLoc: loc,
        traceColo: data.colo,
        traceWarp: data.warp,
      };
    }
    if (attempt <= MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }
  }

  return { domain, status: 'blocked', elapsed: Date.now() - start, attempts: MAX_RETRIES + 1 };
}
