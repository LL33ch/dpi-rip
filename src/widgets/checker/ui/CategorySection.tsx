'use client';

import { memo } from 'react';
import { Card, SimpleGrid, Stack, Text } from '@mantine/core';
import { SiteCard } from './SiteCard';
import type { CategoryResult } from '@shared/model';
import { useLocaleSwitch } from '@shared/i18n/LocaleProvider';

interface CategorySectionProps {
  cat: CategoryResult;
  revealed: boolean;
}

export const CategorySection = memo(function CategorySection({ cat, revealed }: CategorySectionProps) {
  const isGeoBlock = cat.id === 'geoblock';
  const { locale } = useLocaleSwitch();
  const label = locale === 'ru' ? (cat.ru ?? cat.en) : cat.en;

  return (
    <Card>
      <Text fw={500} mb='sm'>
        {label}
      </Text>
      {isGeoBlock ? (
        <Stack gap={4}>
          {cat.results.map((site) => (
            <SiteCard key={site.domain} site={site} isGeoBlock revealed={revealed} />
          ))}
        </Stack>
      ) : (
        <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing={4}>
          {cat.results.map((site) => (
            <SiteCard key={site.domain} site={site} />
          ))}
        </SimpleGrid>
      )}
    </Card>
  );
});
