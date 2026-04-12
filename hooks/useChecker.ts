'use client';

import { useState, useCallback } from 'react';
import { CategoryResult, SiteResult, SiteStatus } from '@/lib/types';
import { CONFIG } from '@/lib/config';
import { checkSite } from '@/lib/checkers/site';
import { checkDpiProvider } from '@/lib/checkers/dpi-provider';
import { checkCdnTrace } from '@/lib/checkers/cdn-trace';
import { saveTestRun } from '@/lib/history';

function makeInitialCategories(status: SiteResult['status']): CategoryResult[] {
  return CONFIG.map((cat) => ({
    id: cat.id,
    en: cat.en,
    results: cat.sites.map((site) => ({
      domain: site.d,
      name: site.name,
      flag: site.flag,
      logo: site.logo,
      status,
    })),
  }));
}

export function useChecker() {
  const [categories, setCategories] = useState<CategoryResult[]>(() =>
    makeInitialCategories('idle'),
  );
  const [isChecking, setIsChecking] = useState(false);
  const [checkedCount, setCheckedCount] = useState(0);

  const totalCount = CONFIG.reduce((sum, cat) => sum + cat.sites.length, 0);

  const runChecks = useCallback(async () => {
    setIsChecking(true);
    setCheckedCount(0);
    setCategories(makeInitialCategories('checking'));

    const resultMap = new Map<string, SiteStatus>();

    const allChecks = CONFIG.flatMap((cat) =>
      cat.sites.map((site) =>
        (cat.id === 'providers'
          ? checkDpiProvider(site.d)
          : cat.id === 'geoblock'
            ? checkCdnTrace(site.d, 'blockedIn' in site ? site.blockedIn : [])
            : checkSite(site.d)
        ).then((result) => {
          resultMap.set(site.d, result.status as SiteStatus);
          setCheckedCount((prev) => prev + 1);
          setCategories((prev) =>
            prev.map((c) =>
              c.id !== cat.id
                ? c
                : {
                    ...c,
                    results: c.results.map((r) =>
                      r.domain === site.d
                        ? {
                            ...r,
                            status: result.status,
                            elapsed: result.elapsed,
                            attempts: result.attempts,
                            traceIp: 'traceIp' in result ? result.traceIp : undefined,
                            traceLoc: 'traceLoc' in result ? result.traceLoc : undefined,
                            traceColo: 'traceColo' in result ? result.traceColo : undefined,
                            traceWarp: 'traceWarp' in result ? result.traceWarp : undefined,
                          }
                        : r,
                    ),
                  },
            ),
          );
        }),
      ),
    );

    await Promise.all(allChecks);

    saveTestRun({
      timestamp: Date.now(),
      categories: CONFIG.map((cat) => {
        const statuses = cat.sites.map((s) => resultMap.get(s.d) ?? 'blocked');
        return {
          id: cat.id,
          en: cat.en,
          ok: statuses.filter((s) => s === 'ok').length,
          blocked: statuses.filter((s) => s === 'blocked').length,
          dpi: statuses.filter((s) => s === 'dpi').length,
          suspicious: statuses.filter((s) => s === 'suspicious').length,
          geoBlocked: statuses.filter((s) => s === 'geo-blocked').length,
          total: statuses.length,
        };
      }),
    });

    setIsChecking(false);
  }, []);

  return {
    categories,
    isChecking,
    checkedCount,
    totalCount,
    runChecks,
  };
}
