'use client';

import Image from 'next/image';
import { useChecker } from '@/hooks/useChecker';
import { CategoryResult, SiteResult } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function flagToCode(flag: string): string {
  const chars = [...flag];
  if (chars.length >= 2) {
    const cp0 = chars[0].codePointAt(0) ?? 0;
    const cp1 = chars[1].codePointAt(0) ?? 0;
    if (cp0 >= 0x1f1e6 && cp0 <= 0x1f1ff && cp1 >= 0x1f1e6 && cp1 <= 0x1f1ff) {
      return (
        String.fromCharCode(cp0 - 0x1f1e6 + 65) + String.fromCharCode(cp1 - 0x1f1e6 + 65)
      ).toLowerCase();
    }
  }
  return '';
}

const isRuSite = (domain: string): boolean => domain.split('.').pop() === 'ru';

function pctColor(pct: number): string {
  const r = Math.round(255 * (1 - pct / 100));
  const g = Math.round(200 * (pct / 100));
  return `rgb(${r}, ${g}, 0)`;
}

function SiteCard({
  site,
  isGeoBlock,
  revealed,
}: {
  site: SiteResult;
  isGeoBlock?: boolean;
  revealed?: boolean;
}) {
  const cc = flagToCode(site.flag);

  if (isGeoBlock) {
    return (
      <div
        className={`flex items-center justify-between px-2 py-1.5 rounded-sm text-xs gap-2 ${
          site.status === 'checking'
            ? 'bg-muted/40 animate-pulse'
            : site.status === 'ok'
              ? 'bg-green-500/20'
              : site.status === 'geo-blocked'
                ? 'bg-orange-500/20'
                : site.status === 'blocked'
                  ? 'bg-destructive/20'
                  : ''
        }`}
      >
        <span className='flex items-center gap-1.5 min-w-0 shrink-0'>
          {site.logo && (
            <Image
              src={site.logo}
              width={16}
              height={16}
              alt={site.name}
              className={cn('shrink-0 rounded', site.status !== 'ok' && 'grayscale')}
            />
          )}
          <span className='font-medium'>{site.name}</span>
        </span>
        <div className='flex gap-2'>
          {(site.status === 'ok' || site.status === 'geo-blocked') && site.traceIp && (
            <span className='flex items-center gap-1.5 text-muted-foreground truncate'>
              <span
                className={`font-mono text-foreground transition-all ${!revealed ? 'blur-sm' : ''}`}
              >
                {site.traceIp}
              </span>
              {site.traceLoc && (
                <Image
                  src={`https://flagcdn.com/h20/${site.traceLoc.toLowerCase()}.webp`}
                  width={20}
                  height={20}
                  alt={site.traceLoc}
                  className='rounded-xs'
                />
              )}
              {site.traceWarp === 'on' && <span className='text-blue-400'>WARP</span>}
            </span>
          )}
          {site.status === 'geo-blocked' && (
            <span className='text-orange-400 shrink-0 font-bold'>GEOBLOCK</span>
          )}
          {site.status === 'blocked' && (
            <span className='text-destructive shrink-0 font-bold'>BLOCKED</span>
          )}
          {site.status === 'checking' && (
            <span className='text-muted-foreground shrink-0'>...</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-between px-2 py-1.5 rounded-sm text-xs gap-1 ${
        site.status === 'checking'
          ? 'bg-muted/40 animate-pulse'
          : site.status === 'ok'
            ? 'bg-green-500/20'
            : site.status === 'blocked'
              ? 'bg-destructive/20'
              : site.status === 'dpi'
                ? 'bg-orange-500/20'
                : site.status === 'suspicious'
                  ? 'bg-yellow-500/20'
                  : ''
      }`}
    >
      <span className='flex items-center gap-1.5 min-w-0'>
        {!site.logo ? (
          <Image
            src={`https://flagcdn.com/h20/${cc}.webp`}
            width={20}
            height={20}
            alt={cc}
            className='rounded-xs'
          />
        ) : (
          <Image
            src={site.logo}
            width={20}
            height={20}
            alt={cc}
            className={cn(
              'shrink-0 rounded',
              ['checking', 'blocked', 'dpi'].includes(site.status) && 'grayscale',
            )}
          />
        )}
        <span className='truncate'>{site.name}</span>
      </span>
      {site.status === 'dpi' && <span className='text-orange-500 shrink-0 font-bold'>DPI</span>}
      {site.status === 'suspicious' && <span className='text-yellow-500 shrink-0'>?</span>}
    </div>
  );
}

function CategorySection({ cat, revealed }: { cat: CategoryResult; revealed: boolean }) {
  const isGeoBlock = cat.id === 'geoblock';
  return (
    <div className='rounded-lg border bg-card p-3'>
      <h3 className='font-medium text-sm mb-2'>{cat.en}</h3>
      <div
        className={
          isGeoBlock
            ? 'flex flex-col gap-1'
            : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1'
        }
      >
        {cat.results.map((site) => (
          <SiteCard key={site.domain} site={site} isGeoBlock={isGeoBlock} revealed={revealed} />
        ))}
      </div>
    </div>
  );
}

export function CheckerView({ revealed }: { revealed: boolean }) {
  const { categories, isChecking, checkedCount, totalCount, runChecks } = useChecker();

  const hasStarted = isChecking || checkedCount > 0;

  const allResults = categories.flatMap((c) => c.results);
  const doneResults = allResults.filter(
    (r) =>
      r.status === 'ok' ||
      r.status === 'blocked' ||
      r.status === 'dpi' ||
      r.status === 'suspicious',
  );
  const ruDone = doneResults.filter((r) => isRuSite(r.domain));
  const foreignDone = doneResults.filter((r) => !isRuSite(r.domain));
  const ruOk = ruDone.filter((r) => r.status === 'ok').length;
  const foreignOk = foreignDone.filter((r) => r.status === 'ok').length;
  const ruPct = ruDone.length > 0 ? Math.round((ruOk / ruDone.length) * 100) : 0;
  const foreignPct =
    foreignDone.length > 0 ? Math.round((foreignOk / foreignDone.length) * 100) : 0;

  return (
    <div className='space-y-4'>
      <Button onClick={runChecks} disabled={isChecking} size='lg' className='w-full'>
        Run Check
      </Button>

      {isChecking && (
        <div className='space-y-1.5'>
          <p className='text-sm text-muted-foreground'>
            Checking...... {checkedCount}/{totalCount}
          </p>
          <div className='h-1 bg-muted rounded-full overflow-hidden'>
            <div
              className='h-full bg-primary transition-all duration-300'
              style={{ width: `${(checkedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      )}

      {doneResults.length > 0 && (
        <div className='grid grid-cols-2 gap-3'>
          <div className='rounded-lg border bg-card p-4 text-center'>
            <p className='text-3xl font-bold' style={{ color: pctColor(ruPct) }}>
              {ruPct}%
            </p>
            <p className='text-muted-foreground text-xs mt-1'>.ru sites availability</p>
            <p className='text-sm mt-1'>
              {ruOk}/{ruDone.length}
            </p>
          </div>
          <div className='rounded-lg border bg-card p-4 text-center'>
            <p className='text-3xl font-bold' style={{ color: pctColor(foreignPct) }}>
              {foreignPct}%
            </p>
            <p className='text-muted-foreground text-xs mt-1'>Foreign sites availability</p>
            <p className='text-sm mt-1'>
              {foreignOk}/{foreignDone.length}
            </p>
          </div>
        </div>
      )}

      {hasStarted && (
        <div className='space-y-2'>
          {categories.map((cat) => {
            const total = cat.results.length;
            const ok = cat.results.filter((r) => r.status === 'ok').length;
            const geoBlocked = cat.results.filter((r) => r.status === 'geo-blocked').length;
            const blocked = cat.results.filter(
              (r) => r.status === 'blocked' || r.status === 'dpi' || r.status === 'suspicious',
            ).length;
            const checking = cat.results.filter((r) => r.status === 'checking').length;
            const done = ok + geoBlocked + blocked;
            if (done === 0 && checking === 0) return null;
            const okPct = (ok / total) * 100;
            const geoBlockedPct = (geoBlocked / total) * 100;
            const blockedPct = (blocked / total) * 100;
            const checkingPct = (checking / total) * 100;
            return (
              <div key={cat.id} className='flex items-center gap-3'>
                <span className='text-xs text-muted-foreground w-52 shrink-0 truncate'>
                  {cat.en}
                </span>
                <div className='flex-1 h-3 bg-muted rounded overflow-hidden flex'>
                  <div
                    className='h-full bg-green-500 transition-all duration-300'
                    style={{ width: `${okPct}%` }}
                  />
                  <div
                    className='h-full bg-orange-500 transition-all duration-300'
                    style={{ width: `${geoBlockedPct}%` }}
                  />
                  <div
                    className='h-full bg-destructive transition-all duration-300'
                    style={{ width: `${blockedPct}%` }}
                  />
                  <div
                    className='h-full bg-muted-foreground/25 animate-pulse transition-all duration-300'
                    style={{ width: `${checkingPct}%` }}
                  />
                </div>
                <span className='text-xs text-muted-foreground w-10 text-right shrink-0'>
                  {ok}/{total}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {hasStarted && (
        <div className='space-y-3'>
          {categories.map((cat) => (
            <CategorySection key={cat.id} cat={cat} revealed={revealed} />
          ))}
        </div>
      )}
    </div>
  );
}
