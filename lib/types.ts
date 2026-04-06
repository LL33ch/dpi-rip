export type SiteStatus = 'idle' | 'checking' | 'ok' | 'blocked' | 'dpi' | 'suspicious';

export interface SiteResult {
  domain: string;
  name: string;
  flag: string;
  status: SiteStatus;
  elapsed?: number;
  attempts?: number;
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
