'use client';

import { useEffect, useState } from 'react';
import { Lock, LockOpen } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { UserInfo as UserInfoType } from '@/lib/types';

async function fetchUserInfo(): Promise<UserInfoType> {
  const RIPE_API = 'https://stat.ripe.net/data/';

  const ipRes = await fetch(RIPE_API + 'whats-my-ip/data.json');
  const ipData = await ipRes.json();
  const ip = ipData.data.ip;

  const asnRes = await fetch(RIPE_API + `prefix-overview/data.json?resource=${ip}`);
  const asnData = await asnRes.json();
  const asn = asnData.data.asns[0];

  const geoRes = await fetch(RIPE_API + `maxmind-geo-lite/data.json?resource=${ip}`);
  const geoData = await geoRes.json();
  const geo = geoData.data.located_resources[0]?.locations[0] || {};

  return {
    ip,
    asn: asn.asn,
    holder: asn.holder,
    country: geo.country || 'Unknown',
    city: geo.city || 'Unknown',
  };
}

export function UserInfo() {
  const [userInfo, setUserInfo] = useState<UserInfoType | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    fetchUserInfo()
      .then(setUserInfo)
      .catch((e) => console.error('Failed to fetch user info:', e));
  }, []);

  return (
    <div
      className='flex items-center gap-2 text-sm rounded-md border bg-card px-3 py-2 cursor-pointer select-none'
      onClick={() => setRevealed((v) => !v)}
    >
      <span className='w-2 h-2 rounded-full bg-green-500 shrink-0' />
      {userInfo ? (
        <span className={`truncate text-foreground flex-1 transition-all ${!revealed ? 'blur-sm' : ''}`}>
          {userInfo.ip} · {userInfo.city}, {userInfo.country} · ISP: AS{userInfo.asn}{' '}
          {userInfo.holder}
        </span>
      ) : (
        <Skeleton className='h-5 w-64 flex-1' />
      )}
      {revealed
        ? <LockOpen className='w-3.5 h-3.5 text-muted-foreground shrink-0' />
        : <Lock className='w-3.5 h-3.5 text-muted-foreground shrink-0' />
      }
    </div>
  );
}
