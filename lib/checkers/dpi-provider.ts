import type { SiteCheckResult } from './site';

const TIMEOUT_ALIVE_MS = 5000;
const TIMEOUT_POST_MS = 12000;
const TIMEOUT_HEAD_MS = 8000;
const DPI_BODY_SIZE = 64 * 1024; // 64KB POST body
const URI_CHUNK_SIZE = 7 * 1024; // 7KB per HEAD request
const URI_ITERATIONS = 9; // ~63KB total URI data

function randomSafeString(len: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const buf = new Uint8Array(len);
  crypto.getRandomValues(buf);
  return Array.from(buf, (b) => chars[b % chars.length]).join('');
}

function uniqueUrl(domain: string, path = '/'): string {
  return `https://${domain}${path}?t=${Math.random()}`;
}

const NO_CORS_OPT = {
  mode: 'no-cors' as const,
  credentials: 'omit' as const,
  cache: 'no-store' as const,
};

async function aliveCheck(domain: string): Promise<boolean> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_ALIVE_MS);
  try {
    await fetch(uniqueUrl(domain), { method: 'HEAD', ...NO_CORS_OPT, signal: ctrl.signal });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function postCheck(domain: string): Promise<'ok' | 'timeout' | 'error'> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_POST_MS);
  try {
    const body = new Uint8Array(DPI_BODY_SIZE);
    crypto.getRandomValues(body);
    await fetch(uniqueUrl(domain), { method: 'POST', ...NO_CORS_OPT, signal: ctrl.signal, body });
    return 'ok';
  } catch (e: unknown) {
    return e instanceof Error && e.name === 'AbortError' ? 'timeout' : 'error';
  } finally {
    clearTimeout(timer);
  }
}

async function headUriCheck(domain: string): Promise<'ok' | 'timeout' | 'error'> {
  for (let i = 0; i < URI_ITERATIONS; i++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_HEAD_MS);
    try {
      const x = randomSafeString(URI_CHUNK_SIZE);
      await fetch(`https://${domain}/?x=${x}&t=${Math.random()}`, {
        method: 'HEAD',
        ...NO_CORS_OPT,
        signal: ctrl.signal,
      });
    } catch (e: unknown) {
      clearTimeout(timer);
      return e instanceof Error && e.name === 'AbortError' ? 'timeout' : 'error';
    }
    clearTimeout(timer);
  }
  return 'ok';
}

export async function checkDpiProvider(domain: string): Promise<SiteCheckResult> {
  const start = Date.now();

  const alive = await aliveCheck(domain);
  if (!alive) {
    return { domain, status: 'blocked', elapsed: Date.now() - start, attempts: 1 };
  }

  const post = await postCheck(domain);
  if (post === 'timeout') {
    return { domain, status: 'dpi', elapsed: Date.now() - start, attempts: 1 };
  }

  const head = await headUriCheck(domain);
  if (head === 'timeout') {
    return { domain, status: 'suspicious', elapsed: Date.now() - start, attempts: 1 };
  }

  return { domain, status: 'ok', elapsed: Date.now() - start, attempts: 1 };
}
