'use client';

import { useState } from 'react';
import { inCidr } from '@shared/lib';
import type { Cache, CheckResult, SourceResult, SubnetEntry } from './types';

const BASE = 'https://raw.githubusercontent.com/openlibrecommunity/twl/refs/heads/main';
const VERIFIED_URL = `${BASE}/code/scan/out/verify/verified.txt`;
const SUBNETS_C_URL = `${BASE}/code/subnet/out/subnets.c.json`;
const SUBNETS_RAW_URL = `${BASE}/code/subnet/out/subnets.json`;

let cache: Cache | null = null;

function checkSubnets(
  ip: string,
  subnets: SubnetEntry[],
  name: string,
  maxScore: number,
  cidrBase: number,
): SourceResult {
  const subnet = subnets.find((s) => inCidr(ip, s.cidr));
  if (!subnet) return { name, status: 'none', score: 0, subnet: null };
  if (subnet.ips.includes(ip)) return { name, status: 'direct', score: maxScore, subnet };
  const cidrScore = Math.round(maxScore * (cidrBase + 0.4 * (subnet.percent / 100)));
  return { name, status: 'cidr', score: cidrScore, subnet };
}

export function verdictKey(score: number): string {
  if (score >= 90) return 'verdictConfirmed';
  if (score >= 70) return 'verdictHigh';
  if (score >= 40) return 'verdictMedium';
  if (score >= 10) return 'verdictLow';
  return 'verdictNone';
}

export function scoreColor(score: number): string {
  if (score >= 70) return 'green';
  if (score >= 30) return 'yellow';
  return 'red';
}

export function useWlIpChecker() {
  const [ip, setIp] = useState('');
  const [result, setResult] = useState<CheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [stepKey, setStepKey] = useState('');
  const [errorKey, setErrorKey] = useState('');

  async function check() {
    const trimmed = ip.trim();
    if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(trimmed)) {
      setErrorKey('errorInvalidIp');
      return;
    }

    setErrorKey('');
    setResult(null);
    setLoading(true);

    try {
      if (!cache) {
        setStepKey('stepLoading');
        const [verifiedText, subnetsC, subnetsRaw] = await Promise.all([
          fetch(VERIFIED_URL).then((r) => r.text()),
          fetch(SUBNETS_C_URL).then((r) => r.json()),
          fetch(SUBNETS_RAW_URL).then((r) => r.json()),
        ]);
        cache = {
          verified: new Set(
            verifiedText
              .split('\n')
              .map((l) => l.trim())
              .filter(Boolean),
          ),
          subnetsC,
          subnetsRaw,
        };
      }

      setStepKey('stepAnalyzing');

      const inVerified = cache.verified.has(trimmed);
      const sources: SourceResult[] = [
        {
          name: 'sourceVerified',
          status: inVerified ? 'direct' : 'none',
          score: inVerified ? 95 : 0,
          subnet: null,
        },
        checkSubnets(trimmed, cache.subnetsC, 'sourceSubnetsVerified', 90, 0.5),
        checkSubnets(trimmed, cache.subnetsRaw, 'sourceSubnetsRaw', 70, 0.3),
      ];

      const finalScore = Math.max(...sources.map((s) => s.score), 2);

      let geo = null;
      try {
        const geoRes = await fetch(`https://api.ipapi.is/?ip=${trimmed}`);
        const g = await geoRes.json();
        if (!g.error && (g.asn || g.company)) {
          geo = {
            asn: `AS${g.asn?.asn ?? ''}`,
            org: g.asn?.org ?? g.company?.name ?? '',
            domain: g.asn?.domain ?? g.company?.domain ?? '',
            country: g.location?.country ?? '',
            countryCode: g.location?.country_code ?? '',
            city: g.location?.city ?? '',
          };
        }
      } catch {}

      setResult({ ip: trimmed, sources, finalScore, geo });
    } catch {
      setErrorKey('errorLoadFailed');
    } finally {
      setLoading(false);
      setStepKey('');
    }
  }

  return { ip, setIp, result, loading, stepKey, errorKey, check };
}
