'use client';

import { useEffect, useState } from 'react';
import { Lock, LockOpen, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { UserInfo as UserInfoType } from '@/lib/types';

interface IpProbe {
  label: string;
  ip: string;
}

async function fetchUserInfo(): Promise<UserInfoType> {
  const RIPE_API = 'https://stat.ripe.net/data/';

  const ipRes = await fetch(RIPE_API + 'whats-my-ip/data.json');
  const ipData = await ipRes.json();
  const ip = ipData.data.ip;

  const [asnData, geoData] = await Promise.all([
    fetch(RIPE_API + `prefix-overview/data.json?resource=${ip}`).then((r) => r.json()),
    fetch(RIPE_API + `maxmind-geo-lite/data.json?resource=${ip}`).then((r) => r.json()),
  ]);

  const asn = asnData.data.asns[0];
  const geo = geoData.data.located_resources[0]?.locations[0] || {};

  return {
    ip,
    asn: asn.asn,
    holder: asn.holder,
    country: geo.country || 'Unknown',
    city: geo.city || 'Unknown',
  };
}

function parseCdnTraceIp(text: string): string | null {
  const match = text.match(/^ip=(.+)$/m);
  return match ? match[1].trim() : null;
}

async function probeOne(
  url: string,
  parse: (text: string) => string | null,
  label: string,
): Promise<IpProbe | null> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    const text = await res.text();
    const ip = parse(text);
    return ip ? { label, ip } : null;
  } catch {
    return null;
  }
}

async function fetchIpProbes(): Promise<IpProbe[]> {
  const settled = await Promise.allSettled([
    probeOne('https://1.1.1.1/cdn-cgi/trace', parseCdnTraceIp, 'Cloudflare'),
    probeOne('https://checkip.amazonaws.com', (t) => t.trim() || null, 'AWS'),
    probeOne('https://chatgpt.com/cdn-cgi/trace', parseCdnTraceIp, 'ChatGPT'),
  ]);

  return settled
    .filter(
      (r): r is PromiseFulfilledResult<IpProbe> => r.status === 'fulfilled' && r.value !== null,
    )
    .map((r) => r.value);
}

interface UserInfoProps {
  revealed: boolean;
  onToggle: () => void;
}

export function UserInfo({ revealed, onToggle }: UserInfoProps) {
  const [userInfo, setUserInfo] = useState<UserInfoType | null>(null);
  const [probes, setProbes] = useState<IpProbe[] | null>(null);

  useEffect(() => {
    fetchUserInfo()
      .then(setUserInfo)
      .catch((e) => console.error('Failed to fetch user info:', e));

    fetchIpProbes()
      .then(setProbes)
      .catch((e) => console.error('Failed to fetch IP probes:', e));
  }, []);

  const mainIp = userInfo?.ip ?? null;
  const splitProbes = probes?.filter((p) => p.ip !== mainIp) ?? [];
  const hasSplitRouting = probes !== null && splitProbes.length > 0;
  const allMatch = probes !== null && splitProbes.length === 0;

  return (
    <div className='space-y-1.5'>
      <div
        className='flex items-center gap-2 text-sm rounded-md border bg-card px-3 py-2 cursor-pointer select-none'
        onClick={onToggle}
      >
        <span className='w-2 h-2 rounded-full bg-green-500 shrink-0' />
        {userInfo ? (
          <span
            className={`truncate text-foreground flex-1 transition-all ${!revealed ? 'blur-sm' : ''}`}
          >
            {userInfo.ip} · {userInfo.city}, {userInfo.country} · ISP: AS{userInfo.asn}{' '}
            {userInfo.holder}
          </span>
        ) : (
          <Skeleton className='h-5 w-64 flex-1' />
        )}
        {revealed ? (
          <LockOpen className='w-3.5 h-3.5 text-muted-foreground shrink-0' />
        ) : (
          <Lock className='w-3.5 h-3.5 text-muted-foreground shrink-0' />
        )}
      </div>

      {/* IP probe sources row */}
      <div className='flex items-center gap-3 px-1 text-xs text-muted-foreground'>
        <span className='shrink-0'>IP sources:</span>
        <div className='flex items-center gap-2 flex-wrap'>
          {probes === null ? (
            <Skeleton className='h-3 w-48' />
          ) : (
            probes.map((p) => (
              <span key={p.label} className='flex items-center gap-1'>
                <span className='text-muted-foreground/60'>{p.label}</span>
                <span
                  className={`font-mono ${p.ip !== mainIp ? 'text-orange-400 font-bold' : 'text-foreground'}`}
                >
                  {revealed ? p.ip : '···'}
                </span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* VPN / split routing verdict */}
      {hasSplitRouting && (
        <div className='flex items-center gap-2 rounded-md border border-orange-500/40 bg-orange-500/10 px-3 py-2 text-xs text-orange-400'>
          <ShieldAlert className='w-3.5 h-3.5 shrink-0' />
          <span>Split tunneling / VPN detected</span>
        </div>
      )}

      {allMatch && probes.length > 0 && (
        <div className='flex items-center gap-2 rounded-md border border-green-500/20 bg-green-500/5 px-3 py-2 text-xs text-muted-foreground'>
          <ShieldCheck className='w-3.5 h-3.5 shrink-0 text-green-500' />
          <span>All sources report the same IP — no split routing detected</span>
        </div>
      )}
    </div>
  );
}
