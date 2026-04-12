'use client';

import { useSyncExternalStore, useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { subscribeHistory, clearHistory, TestRun, STORAGE_KEY } from '@/lib/history';
import { Button } from '@/components/ui/button';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';

const chartConfig = {
  ok: { label: 'Accessible', color: '#22c55e' },
  blocked: { label: 'Blocked / DPI', color: '#ef4444' },
} satisfies ChartConfig;

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
    .map(([id, v]) => ({
      id,
      en: v.en,
      total: v.total,
      pct: v.total > 0 ? (v.ok / v.total) * 100 : 0,
    }))
    .sort((a, b) => a.pct - b.pct);

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
        <p className='text-lg mb-1'>No test history yet</p>
        <p className='text-sm'>Run a check in the Checker tab</p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
        <div className='rounded-lg border bg-card p-4 text-center'>
          <p className='text-3xl font-bold'>{history.length}</p>
          <p className='text-muted-foreground text-xs mt-1'>Total runs</p>
        </div>
        <div className='rounded-lg border bg-card p-4 text-center'>
          <p className='text-3xl font-bold' style={{ color: pctColor(overallPct) }}>
            {overallPct}%
          </p>
          <p className='text-muted-foreground text-xs mt-1'>Avg availability</p>
        </div>
        <div className='rounded-lg border bg-card p-4 text-center'>
          <p className='text-sm font-bold text-green-400 truncate'>{bestCat?.en ?? '—'}</p>
          <p className='text-muted-foreground text-xs mt-1'>
            Best · {bestCat ? Math.round(bestCat.pct) : 0}%
          </p>
        </div>
        <div className='rounded-lg border bg-card p-4 text-center'>
          <p className='text-sm font-bold text-destructive truncate'>{worstCat?.en ?? '—'}</p>
          <p className='text-muted-foreground text-xs mt-1'>
            Worst · {worstCat ? Math.round(worstCat.pct) : 0}%
          </p>
        </div>
      </div>

      <div className='rounded-lg border bg-card p-4 space-y-2'>
        <div className='flex items-center justify-between'>
          <h2 className='font-medium text-sm'>Availability per run</h2>
          <Button variant='outline' size='sm' onClick={clearHistory}>
            Clear history
          </Button>
        </div>
        <ChartContainer config={chartConfig} className='h-64 w-full'>
          <BarChart data={chartData} barCategoryGap='20%'>
            <CartesianGrid vertical={false} strokeOpacity={0.3} />
            <XAxis dataKey='label' tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              width={36}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name, item) => (
                    <span>
                      {name === 'ok' ? 'Accessible' : 'Blocked'}:{' '}
                      {item.payload[name as 'ok' | 'blocked']}%
                    </span>
                  )}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ''}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey='ok' stackId='a' fill='var(--color-ok)' radius={[0, 0, 0, 0]} />
            <Bar dataKey='blocked' stackId='a' fill='var(--color-blocked)' radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </div>

      <div className='rounded-lg border bg-card p-4 space-y-3'>
        <h2 className='font-medium text-sm'>Category Breakdown (avg across all runs)</h2>
        <div className='space-y-2'>
          {categoryStats.map((cat) => (
            <div key={cat.id} className='flex items-center gap-3'>
              <span className='text-xs text-muted-foreground w-48 shrink-0 truncate'>{cat.en}</span>
              <div className='flex-1 h-3 bg-muted rounded overflow-hidden'>
                <div
                  className='h-full bg-green-500 transition-all'
                  style={{ width: `${cat.pct}%` }}
                />
              </div>
              <span
                className='text-xs font-medium w-10 text-right shrink-0'
                style={{ color: pctColor(cat.pct) }}
              >
                {Math.round(cat.pct)}%
              </span>
            </div>
          ))}
        </div>
        <div className='flex gap-4 text-xs text-muted-foreground pt-1'>
          <span className='flex items-center gap-1.5'>
            <span className='inline-block w-3 h-3 rounded-sm bg-green-500' />
            Accessible
          </span>
          <span className='flex items-center gap-1.5'>
            <span className='inline-block w-3 h-3 rounded-sm bg-muted-foreground/30' />
            Blocked / DPI
          </span>
        </div>
      </div>
    </div>
  );
}
