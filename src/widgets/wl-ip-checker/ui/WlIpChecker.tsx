'use client';

import {
  Anchor,
  Badge,
  Button,
  Card,
  Group,
  Input,
  Loader,
  RingProgress,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import ReactCountryFlag from 'react-country-flag';
import { useWlIpChecker, verdictKey, scoreColor } from '../model';
import { SourceCard } from './SourceCard';

export function WlIpChecker() {
  const t = useTranslations('WlIpChecker');
  const locale = useLocale();
  const { ip, setIp, result, loading, stepKey, errorKey, check } = useWlIpChecker();

  return (
    <Stack gap='lg' maw={470} w='100%' mx='auto'>
      <Stack gap={4}>
        <Title order={3}>{t('title')}</Title>
        <Text c='dimmed' size='sm'>
          {t('base')}{' '}
          <Anchor href='https://github.com/openlibrecommunity/twl' target='_blank' component={Link}>
            zarazaex/TWL
          </Anchor>{' '}
          · {t('subtitle')}
        </Text>
      </Stack>

      <Group gap='sm' align='flex-start'>
        <TextInput
          flex={1}
          placeholder='1.2.3.4'
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && check()}
          error={errorKey ? t(errorKey as 'errorInvalidIp' | 'errorLoadFailed') : undefined}
          disabled={loading}
          rightSection={
            ip ? <Input.ClearButton aria-label='Clear input' onClick={() => setIp('')} /> : null
          }
        />
        <Button onClick={check} loading={loading}>
          {t('checkButton')}
        </Button>
      </Group>

      {loading && (
        <Group gap='sm'>
          <Loader size='xs' />
          <Text size='sm' c='dimmed'>
            {stepKey ? t(stepKey as 'stepLoading' | 'stepAnalyzing') : ''}
          </Text>
        </Group>
      )}

      {result && (
        <Card>
          <Stack gap='md'>
            <Group justify='space-between' align='flex-start' wrap='nowrap'>
              <Stack gap={2}>
                <Text fw={700} size='xl'>
                  {result.ip}
                </Text>
                {result.geo && (
                  <Stack gap={2} mt={4}>
                    <Group gap={6}>
                      <Text size='xs' c='dimmed' fw={500} style={{ minWidth: 28 }}>
                        {t('labelAs')}
                      </Text>
                      {result.geo.domain ? (
                        <>
                          <Image
                            src={`https://www.google.com/s2/favicons?domain=${result.geo.domain}&sz=16`}
                            width={14}
                            height={14}
                            alt=''
                            style={{ borderRadius: 3 }}
                          />
                          <Anchor
                            size='xs'
                            href={`https://${result.geo.domain}`}
                            target='_blank'
                            component={Link}
                          >
                            {result.geo.org}
                          </Anchor>
                        </>
                      ) : (
                        <Text size='xs'>{result.geo.org}</Text>
                      )}
                    </Group>
                    <Group gap={6}>
                      <Text size='xs' c='dimmed' fw={500} style={{ minWidth: 28 }}>
                        {t('labelAsn')}
                      </Text>
                      <Text size='xs'>{result.geo.asn}</Text>
                    </Group>
                    {result.geo.country && (
                      <Group gap={6}>
                        <Text size='xs' c='dimmed' fw={500} style={{ minWidth: 28 }}>
                          {t('labelLoc')}
                        </Text>
                        {result.geo.countryCode && (
                          <Text size='xs'>
                            <ReactCountryFlag countryCode={result.geo.countryCode} svg />
                          </Text>
                        )}
                        <Text size='xs'>
                          {new Intl.DisplayNames([locale], { type: 'region' }).of(
                            result.geo.countryCode,
                          )}
                          {result.geo.city && `, ${result.geo.city}`}
                        </Text>
                      </Group>
                    )}
                  </Stack>
                )}
              </Stack>
              <RingProgress
                size={90}
                thickness={8}
                sections={[{ value: result.finalScore, color: scoreColor(result.finalScore) }]}
                label={
                  <Text ta='center' fw={700} size='sm'>
                    {result.finalScore}%
                  </Text>
                }
              />
            </Group>

            <Badge variant='light' size='lg' color={scoreColor(result.finalScore)}>
              {t(verdictKey(result.finalScore))}
            </Badge>

            <Stack gap={6}>
              {result.sources.map((src) => (
                <SourceCard key={src.name} src={src} />
              ))}
            </Stack>

            <Text size='xs' c='dimmed'>
              {t('footer')}
            </Text>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
