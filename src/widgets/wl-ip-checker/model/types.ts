export interface SubnetEntry {
  cidr: string;
  count: number;
  total: number;
  percent: number;
  ips: string[];
}

export interface SourceResult {
  name: string;
  status: 'direct' | 'cidr' | 'none';
  score: number;
  subnet: SubnetEntry | null;
}

export interface CheckResult {
  ip: string;
  sources: SourceResult[];
  finalScore: number;
  geo: { org: string; asn: string; domain: string; country: string; countryCode: string; city: string } | null;
}

export type Cache = { verified: Set<string>; subnetsC: SubnetEntry[]; subnetsRaw: SubnetEntry[] };
