'use client';

import { clearHistory, STORAGE_KEY, subscribeHistory, TestRun } from '@/src/shared/lib';
import { CONFIG } from '@shared/config';
import { useLocaleSwitch } from '@shared/i18n/LocaleProvider';
import { BarChart, BarsList } from '@mantine/charts';
import { Button, Card, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { useSyncExternalStore, useMemo } from 'react';

function getSnapshot(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? '[]';
  } catch {
    return '[]';
  }
}

function getServerSnapshot(): string {
  return '[]';
}

function parseHistory(raw: string): TestRun[] {
  try {
    return JSON.parse(raw) as TestRun[];
  } catch {
    return [];
  }
}

function formatDateFull(ts: number): string {
  const d = new Date(ts);
  return (
    d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }) +
    ' ' +
    d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  );
}

function pctColor(pct: number): string {
  const r = Math.round(255 * (1 - pct / 100));
  const g = Math.round(200 * (pct / 100));
  return `rgb(${r}, ${g}, 0)`;
}

const MIN_SLOTS = 20;

function buildChartData(history: TestRun[]) {
  const runs = [...history].reverse().map((run, i) => {
    const total = run.categories.reduce((s, c) => s + c.total, 0);
    const ok = run.categories.reduce((s, c) => s + c.ok, 0);
    const okPct = total > 0 ? Math.round((ok / total) * 100) : 0;
    return {
      label: `#${i + 1}`,
      date: formatDateFull(run.timestamp),
      ok: okPct,
      blocked: 100 - okPct,
    };
  });

  const padding = Math.max(0, MIN_SLOTS - runs.length);
  const empty = Array.from({ length: padding }, () => ({
    label: '',
    date: '',
    ok: 0,
    blocked: 0,
  }));

  return [...empty, ...runs];
}

export function StatsView() {
  const t = useTranslations('Stats');
  const { locale } = useLocaleSwitch();

  const raw = useSyncExternalStore(subscribeHistory, getSnapshot, getServerSnapshot);
  const history = useMemo(() => parseHistory(raw), [raw]);

  const categoryMap = new Map<
    string,
    {
      en: string;
      ok: number;
      blocked: number;
      dpi: number;
      suspicious: number;
      geoBlocked: number;
      total: number;
    }
  >();
  for (const run of history) {
    for (const cat of run.categories) {
      const prev = categoryMap.get(cat.id) ?? {
        en: cat.en,
        ok: 0,
        blocked: 0,
        dpi: 0,
        suspicious: 0,
        geoBlocked: 0,
        total: 0,
      };
      categoryMap.set(cat.id, {
        en: cat.en,
        ok: prev.ok + cat.ok,
        blocked: prev.blocked + cat.blocked,
        dpi: prev.dpi + cat.dpi,
        suspicious: prev.suspicious + cat.suspicious,
        geoBlocked: prev.geoBlocked + cat.geoBlocked,
        total: prev.total + cat.total,
      });
    }
  }

  const categoryStats = [...categoryMap.entries()]
    .map(([id, v]) => {
      const configCat = CONFIG.find((c) => c.id === id);
      return {
        name: locale === 'ru' ? (configCat?.ru ?? v.en) : v.en,
        value: v.total > 0 ? Math.round((v.ok / v.total) * 100) : 0,
      };
    })
    .sort((a, b) => a.value - b.value);

  const overallOk = history.reduce((s, r) => s + r.categories.reduce((cs, c) => cs + c.ok, 0), 0);
  const overallTotal = history.reduce(
    (s, r) => s + r.categories.reduce((cs, c) => cs + c.total, 0),
    0,
  );
  const overallPct = overallTotal > 0 ? Math.round((overallOk / overallTotal) * 100) : 0;

  const worstCat = categoryStats[0];
  const bestCat = categoryStats[categoryStats.length - 1];
  const chartData = buildChartData(history);

  if (history.length === 0) {
    return (
      <div className='rounded-lg border bg-card p-12 text-center text-muted-foreground'>
        <p className='text-lg mb-1'>{t('empty')}</p>
        <p className='text-sm'>{t('emptyHint')}</p>
      </div>
    );
  }

  return (
    <Stack>
      <SimpleGrid cols={4}>
        <Card ta='center'>
          <Text fw={500}>{history.length}</Text>
          <Text>{t('totalRuns')}</Text>
        </Card>
        <Card ta='center'>
          <Text fw={500} style={{ color: pctColor(overallPct) }}>
            {overallPct}%
          </Text>
          <Text>{t('avgAvailability')}</Text>
        </Card>
        <Card ta='center'>
          <Text fw={500} c='green' truncate>
            {bestCat?.name ?? '—'}
          </Text>
          <Text>
            {t('best')} · {bestCat ? bestCat.value : 0}%
          </Text>
        </Card>
        <Card ta='center'>
          <Text fw={500} c='red' truncate>
            {worstCat?.name ?? '—'}
          </Text>
          <Text>
            {t('worst')} · {worstCat ? worstCat.value : 0}%
          </Text>
        </Card>
      </SimpleGrid>

      <Card>
        <Card.Section withBorder p='md'>
          <Group justify='space-between'>
            <Text>{t('availabilityPerRun')}</Text>
            <Button color='dark' size='xs' onClick={clearHistory}>
              {t('clearHistory')}
            </Button>
          </Group>
        </Card.Section>
        <Card.Section p='md'>
          <BarChart
            h={300}
            data={chartData}
            dataKey='label'
            type='stacked'
            unit='%'
            tooltipAnimationDuration={200}
            series={[
              { label: t('available'), name: 'ok', color: 'green' },
              { label: t('blocked'), name: 'blocked', color: 'red' },
            ]}
          />
        </Card.Section>
      </Card>

      <Card>
        <BarsList data={categoryStats} barColor='green' valueFormatter={(value) => `${value}%`} />
      </Card>
    </Stack>
  );
}
