'use client';

import { memo, useState } from 'react';
import { Box, Flex, Group, Loader, Paper, Text } from '@mantine/core';
import ReactCountryFlag from 'react-country-flag';
import type { SiteResult } from '@shared/model';
import styles from './SiteCard.module.css';
import { useTranslations } from 'next-intl';
import { SiteLogo } from '../../site-logo';

interface SiteCardProps {
  site: SiteResult;
  categoryId?: string;
}

export const SiteCard = memo(function SiteCard({ site, categoryId }: SiteCardProps) {
  const [showIp, setShowIp] = useState<boolean>(false);
  const t = useTranslations('SiteCard');

  if (categoryId === 'geoblock') {
    return (
      <Paper p={5} className={styles.card} data-status={site.status} radius='sm'>
        <Flex align='center' gap={6}>
          <SiteLogo d={site.domain} />

          <Text size='xs' truncate>
            {site.name}
          </Text>
          <Flex gap={10} ms='auto'>
            {(site.status === 'ok' || site.status === 'geo-blocked') && site.traceIp && (
              <Group gap={6} wrap='nowrap'>
                <Text
                  size='xs'
                  ff='monospace'
                  style={{ filter: !showIp ? 'blur(4px)' : 'none', cursor: 'pointer' }}
                  onClick={() => setShowIp(!showIp)}
                >
                  {site.traceIp}
                </Text>
                {site.traceLoc && (
                  <ReactCountryFlag
                    countryCode={site.traceLoc}
                    style={{
                      width: '1.25em',
                      height: '1.25em',
                    }}
                    svg
                  />
                )}
                {site.traceWarp === 'on' && (
                  <Text size='xs' c='blue.4'>
                    {t('warp')}
                  </Text>
                )}
              </Group>
            )}
            {site.status === 'geo-blocked' && (
              <Text size='xs' c='orange.4' fw={700}>
                {t('geoblock')}
              </Text>
            )}
            {site.status === 'blocked' && (
              <Text size='xs' c='red.4' fw={700}>
                {t('blocked')}
              </Text>
            )}
            {site.status === 'checking' && <Loader size='xs' type='dots' />}
          </Flex>
        </Flex>
      </Paper>
    );
  }

  return (
    <Paper p={5} className={styles.card} data-status={site.status} radius='sm'>
      <Flex align='center' gap={6}>
        {categoryId === 'providers' ? (
          <ReactCountryFlag
            countryCode={site.flag}
            svg
            style={{
              width: '1.25em',
              height: '1.25em',
            }}
          />
        ) : (
          <SiteLogo d={site.domain} />
        )}

        <Text size='xs' truncate>
          {site.name}
        </Text>
        <Box ms='auto'>
          {site.status === 'dpi' && (
            <Text size='xs' c='orange.4' fw={700} style={{ flexShrink: 0 }}>
              {t('dpi')}
            </Text>
          )}
          {site.status === 'suspicious' && (
            <Text size='xs' c='yellow.4' style={{ flexShrink: 0 }}>
              ?
            </Text>
          )}
        </Box>
      </Flex>
    </Paper>
  );
});
