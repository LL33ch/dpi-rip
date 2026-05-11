'use client';

import { memo } from 'react';
import { Card, SimpleGrid, Stack, Text } from '@mantine/core';
import { SiteCard } from './SiteCard';
import type { CategoryResult } from '@shared/model';
import { useLocale } from 'next-intl';

interface CategorySectionProps {
  cat: CategoryResult;
}

export const CategorySection = memo(function CategorySection({ cat }: CategorySectionProps) {
  const locale = useLocale();
  const label = locale === 'ru' ? (cat.ru ?? cat.en) : cat.en;

  return (
    <Card>
      <Text fw={500} mb='sm'>
        {label}
      </Text>
      {cat.id === 'geoblock' ? (
        <Stack gap={4}>
          {cat.results.map((site) => (
            <SiteCard key={site.domain} site={site} categoryId={cat.id} />
          ))}
        </Stack>
      ) : (
        <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing={4}>
          {cat.results.map((site) => (
            <SiteCard key={site.domain} site={site} categoryId={cat.id} />
          ))}
        </SimpleGrid>
      )}
    </Card>
  );
});
