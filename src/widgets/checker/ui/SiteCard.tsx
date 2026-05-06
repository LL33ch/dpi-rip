'use client';

import { memo, useState } from 'react';
import Image from 'next/image';
import { Box, Flex, Group, Loader, Paper, Text } from '@mantine/core';
import ReactCountryFlag from 'react-country-flag';
import type { SiteResult } from '@shared/model';
import styles from './SiteCard.module.css';
import { useTranslations } from 'next-intl';

interface SiteCardProps {
  site: SiteResult;
  isGeoBlock?: boolean;
}

export const SiteCard = memo(function SiteCard({ site, isGeoBlock }: SiteCardProps) {
  const [showIp, setShowIp] = useState<boolean>(false);
  const t = useTranslations('SiteCard');

  const grayscale = site.status !== 'ok' ? 'grayscale(100%)' : 'none';

  if (isGeoBlock) {
    return (
      <Paper p={5} className={styles.card} data-status={site.status} radius='sm'>
        <Flex align='center' gap={6}>
          {site.logo ? (
            <Image
              src={site.logo}
              width={20}
              height={20}
              alt={site.name}
              style={{ filter: grayscale }}
            />
          ) : (
            site.flag && (
              <ReactCountryFlag
                countryCode={site.flag}
                svg
                style={{
                  filter: grayscale,
                  width: '1.25em',
                  height: '1.25em',
                }}
              />
            )
          )}
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
        {site.logo ? (
          <Image
            src={site.logo}
            width={20}
            height={20}
            alt={site.name}
            style={{ filter: grayscale }}
          />
        ) : (
          site.flag && (
            <ReactCountryFlag
              countryCode={site.flag}
              svg
              style={{
                filter: grayscale,
                width: '1.25em',
                height: '1.25em',
              }}
            />
          )
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
