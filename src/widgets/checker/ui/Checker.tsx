'use client';

import { useDeferredValue } from 'react';
import { Box, Button, Card, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { DonutChart } from '@mantine/charts';
import { useChecker } from '../model/useChecker';
import { CategorySection } from './CategorySection';
import { useTranslations } from 'next-intl';
import type { SiteResult } from '@shared/model';

const pct = (count: number, total: number) => (total > 0 ? Math.round((count / total) * 100) : 0);

function buildDonutData(arr: SiteResult[]) {
  const n = (pred: (r: SiteResult) => boolean) => arr.filter(pred).length;
  const ok = n((r) => r.status === 'ok');
  const dpi = n((r) => r.status === 'dpi' || r.status === 'suspicious');
  const geo = n((r) => r.status === 'geo-blocked');
  const blocked = n((r) => r.status === 'blocked');
  const checking = n((r) => r.status === 'checking');
  const total = arr.length;
  const started = ok + dpi + geo + blocked + checking > 0;

  const chart = started
    ? [
        { name: 'ok', value: ok, color: 'green' },
        { name: 'dpi', value: dpi, color: 'orange' },
        { name: 'geo', value: geo, color: 'yellow' },
        { name: 'blocked', value: blocked, color: 'red' },
        { name: 'checking', value: checking, color: 'dark.4' },
      ].filter((d) => d.value > 0)
    : [{ name: 'idle', value: 1, color: 'dark.5' }];

  return { chart, ok, dpi, geo, blocked, checking, total, okPct: pct(ok, total), started };
}

export function Checker() {
  const { categories: rawCategories, isChecking, runChecks } = useChecker();
  const categories = useDeferredValue(rawCategories);
  const t = useTranslations('Checker');

  const allResults = categories.flatMap((c) => c.results);
  const all = buildDonutData(allResults);
  return (
    <Stack>
      <Button onClick={runChecks} loading={isChecking} disabled={isChecking} fullWidth autoFocus>
        {t('runCheck')}
      </Button>

      {(isChecking || all.started) && (
        <Card>
          <Group justify='center' wrap='nowrap' gap='xl'>
            <DonutChart
              data={all.chart}
              size={130}
              thickness={24}
              withTooltip={false}
              chartLabel={`${all.okPct}%`}
            />
            <SimpleGrid cols={2} spacing='xs'>
              <StatRow label='OK' count={all.ok} total={all.total} color='green' />
              <StatRow label='Blocked' count={all.blocked} total={all.total} color='red' />
              <StatRow label='DPI' count={all.dpi} total={all.total} color='orange' />
              <StatRow label='Geo-block' count={all.geo} total={all.total} color='yellow' />
            </SimpleGrid>
          </Group>
        </Card>
      )}

      <Stack>
        {categories.map((cat) => (
          <CategorySection key={cat.id} cat={cat} />
        ))}
      </Stack>
    </Stack>
  );
}

interface StatRowProps {
  label: string;
  count: number;
  total: number;
  color: string;
}

function StatRow({ label, count, total, color }: StatRowProps) {
  return (
    <Card withBorder p='xs' style={{ minWidth: 110 }}>
      <Group gap={6} mb={4}>
        <Box w={10} h={10} bg={color} style={{ borderRadius: '25%', flexShrink: 0 }} />
        <Text size='xs' c='dimmed'>
          {label}
        </Text>
      </Group>
      <Group gap={6} align='baseline'>
        <Text size='lg' fw={700} lh={1}>
          {count}
        </Text>
        <Text size='xs' c={color}>
          {pct(count, total)}%
        </Text>
      </Group>
    </Card>
  );
}
