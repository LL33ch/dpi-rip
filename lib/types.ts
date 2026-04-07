export type SiteStatus = 'idle' | 'checking' | 'ok' | 'blocked' | 'dpi' | 'suspicious' | 'geo-blocked';

export interface SiteResult {
  domain: string;
  name: string;
  flag: string;
  logo?: string;
  status: SiteStatus;
  elapsed?: number;
  attempts?: number;
  // cdn-cgi/trace fields (AI services)
  traceIp?: string;
  traceLoc?: string;
  traceColo?: string;
  traceWarp?: string;
}

export interface CategoryResult {
  id: string;
  en: string;
  results: SiteResult[];
}

export interface UserInfo {
  ip: string;
  asn: number;
  holder: string;
  country: string;
  city: string;
}

export interface CdnTraceInfo {
  ip: string;
  loc: string;
  colo: string;
  warp: string;
}
