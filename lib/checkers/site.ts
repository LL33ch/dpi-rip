const TIMEOUT_MS = 10000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

export interface SiteCheckResult {
  domain: string;
  status: 'ok' | 'blocked' | 'dpi' | 'suspicious';
  elapsed: number;
  attempts: number;
}

async function attemptFetch(domain: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    await fetch(`https://${domain}`, {
      mode: 'no-cors',
      signal: controller.signal,
    });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export async function checkSite(domain: string): Promise<SiteCheckResult> {
  const start = Date.now();

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    const ok = await attemptFetch(domain);
    if (ok) {
      return { domain, status: 'ok', elapsed: Date.now() - start, attempts: attempt };
    }
    if (attempt <= MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }
  }

  return { domain, status: 'blocked', elapsed: Date.now() - start, attempts: MAX_RETRIES + 1 };
}
