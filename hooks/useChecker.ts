'use client';

import { useState, useCallback } from 'react';
import { CategoryResult, SiteResult } from '@/lib/types';
import { CONFIG } from '@/lib/config';
import { checkSite } from '@/lib/checkers/site';
import { checkDpiProvider } from '@/lib/checkers/dpi-provider';

function makeInitialCategories(status: SiteResult['status']): CategoryResult[] {
  return CONFIG.map((cat) => ({
    id: cat.id,
    en: cat.en,
    results: cat.sites.map((site) => ({
      domain: site.d,
      name: site.name,
      flag: site.flag,
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

    const allChecks = CONFIG.flatMap((cat) =>
      cat.sites.map((site) =>
        (cat.id === 'providers' ? checkDpiProvider(site.d) : checkSite(site.d)).then((result) => {
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
