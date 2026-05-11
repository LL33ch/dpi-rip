'use client';

import { useEffect, useState } from 'react';
import {
  Badge,
  Card,
  Flex,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { GlobeIcon, MapPinIcon, NetworkIcon } from '@phosphor-icons/react';
import ReactCountryFlag from 'react-country-flag';
import Image from 'next/image';
import type { UserInfo as UserInfoModel } from '@shared/model';
import { useLocale, useTranslations } from 'next-intl';
import { SiteLogo } from '../../site-logo';

interface IpProbe {
  label: string;
  ip: string;
}

async function fetchUserInfo(): Promise<UserInfoModel> {
  const res = await fetch('https://api.ipapi.is/', { cache: 'no-store' });
  const data = await res.json();
  return {
    ip: data.ip,
    asn: data.asn?.asn ?? 0,
    holder: data.company?.name ?? data.asn?.org ?? '',
    domain: data.company?.domain ?? data.asn?.domain,
    country: data.location?.country_code ?? '',
    city: data.location?.city ?? '',
  };
}

function parseCdnTraceIp(text: string): string | null {
  const match = text.match(/^ip=(.+)$/m);
  return match ? match[1].trim() : null;
}

async function probeOne(
  url: string,
  parse: (t: string) => string | null,
  label: string,
): Promise<IpProbe | null> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    const ip = parse(await res.text());
    return ip ? { label, ip } : null;
  } catch {
    return null;
  }
}

async function fetchIpProbes(): Promise<IpProbe[]> {
  const settled = await Promise.allSettled([
    probeOne('https://1.1.1.1/cdn-cgi/trace', parseCdnTraceIp, 'Cloudflare'),
    probeOne('https://checkip.amazonaws.com', (t) => t.trim() || null, 'AWS'),
    probeOne('https://chatgpt.com/cdn-cgi/trace', parseCdnTraceIp, 'ChatGPT'),
  ]);
  return settled
    .filter(
      (r): r is PromiseFulfilledResult<IpProbe> => r.status === 'fulfilled' && r.value !== null,
    )
    .map((r) => r.value);
}

export function UserInfo() {
  const [userInfo, setUserInfo] = useState<UserInfoModel | null>(null);
  const [probes, setProbes] = useState<IpProbe[] | null>(null);
  const [showIp, setShowIp] = useState(false);
  const [showCountry, setShowCountry] = useState(false);
  const [showProvider, setShowProvider] = useState(false);

  const t = useTranslations('UserInfo');
  const locale = useLocale();

  useEffect(() => {
    fetchUserInfo().then(setUserInfo).catch(console.error);
    fetchIpProbes().then(setProbes).catch(console.error);
  }, []);

  const mainIp = userInfo?.ip ?? null;
  const splitProbes = probes?.filter((p) => p.ip !== mainIp) ?? [];
  const hasSplitRouting = probes !== null && splitProbes.length > 0;

  function getCountry(code: string) {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(code);
  }

  return (
    <Stack align='stretch' justify='center' gap='md'>
      <SimpleGrid minColWidth='220px' autoFlow='auto-fit' spacing='sm'>
        <Card>
          <Group gap='md' wrap='nowrap'>
            <ThemeIcon
              color={hasSplitRouting ? 'orange' : 'indigo'}
              radius='lg'
              size='xl'
              variant='soft'
            >
              <GlobeIcon size={25} />
            </ThemeIcon>
            <Stack gap={0} miw={0} flex={1}>
              <Flex align='center' gap={10}>
                <Text size='sm' truncate='end' c='dark.2'>
                  {t('ip')}
                </Text>
                {hasSplitRouting && (
                  <Badge variant='light' color='orange' size='sm'>
                    {t('splitTunneling')}
                  </Badge>
                )}
              </Flex>
              {userInfo ? (
                <Text
                  size='sm'
                  truncate='end'
                  style={{ filter: !showIp ? 'blur(4px)' : 'none', cursor: 'pointer' }}
                  onClick={() => setShowIp(!showIp)}
                >
                  {mainIp}
                </Text>
              ) : (
                <Skeleton height={20} />
              )}
            </Stack>
          </Group>
        </Card>

        <Card>
          <Group gap='md' wrap='nowrap'>
            <ThemeIcon color='teal' radius='lg' size='xl' variant='soft'>
              <NetworkIcon size={25} />
            </ThemeIcon>
            <Stack gap={0} miw={0} flex={1}>
              <Text size='sm' truncate='end' c='dark.2'>
                {t('provider')}
              </Text>
              {userInfo ? (
                <Group
                  gap={4}
                  wrap='nowrap'
                  style={{ filter: !showProvider ? 'blur(4px)' : 'none', cursor: 'pointer' }}
                  onClick={() => setShowProvider(!showProvider)}
                >
                  {userInfo.domain && showProvider && <SiteLogo d={userInfo.domain} />}
                  <Text size='sm' truncate='end'>
                    {userInfo.holder}
                  </Text>
                </Group>
              ) : (
                <Skeleton height={20} />
              )}
            </Stack>
          </Group>
        </Card>

        <Card>
          <Group gap='md' wrap='nowrap'>
            <ThemeIcon color='violet' radius='lg' size='xl' variant='soft'>
              <MapPinIcon size={25} />
            </ThemeIcon>
            <Stack gap={0} miw={0} flex={1}>
              <Text size='sm' truncate='end' c='dark.2'>
                {t('country')}
              </Text>
              {userInfo ? (
                <Flex
                  align='center'
                  gap={4}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowCountry(!showCountry)}
                >
                  {showCountry && userInfo.country && (
                    <ReactCountryFlag countryCode={userInfo.country} title={userInfo.country} svg />
                  )}
                  <Text
                    size='sm'
                    truncate='end'
                    style={{ filter: !showCountry ? 'blur(4px)' : 'none' }}
                  >
                    {getCountry(userInfo.country)}
                  </Text>
                </Flex>
              ) : (
                <Skeleton height={20} />
              )}
            </Stack>
          </Group>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}
