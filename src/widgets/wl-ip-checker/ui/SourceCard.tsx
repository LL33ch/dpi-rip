'use client';

import { Badge, Card, Group, Progress, Stack, Text, ThemeIcon } from '@mantine/core';
import { CheckCircleIcon, MinusCircleIcon, XCircleIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { scoreColor } from '../model';
import type { SourceResult } from '../model';

interface SourceCardProps {
  src: SourceResult;
}

export function SourceCard({ src }: SourceCardProps) {
  const t = useTranslations('WlIpChecker');

  return (
    <Card withBorder p='sm'>
      <Group justify='space-between' wrap='nowrap'>
        <Group gap={8} wrap='nowrap'>
          <ThemeIcon
            size='sm'
            variant='transparent'
            c={src.status === 'none' ? 'red' : src.status === 'direct' ? 'green' : 'yellow'}
          >
            {src.status === 'none' ? (
              <XCircleIcon weight='fill' size={16} />
            ) : src.status === 'direct' ? (
              <CheckCircleIcon weight='fill' size={16} />
            ) : (
              <MinusCircleIcon weight='fill' size={16} />
            )}
          </ThemeIcon>
          <Stack gap={0}>
            <Text size='sm' fw={500}>
              {t(src.name as 'sourceVerified' | 'sourceSubnetsVerified' | 'sourceSubnetsRaw')}
            </Text>
            {src.subnet && (
              <Text size='xs' c='dimmed'>
                {src.subnet.cidr} · {src.subnet.count}/{src.subnet.total} IP (
                {src.subnet.percent.toFixed(1)}%)
              </Text>
            )}
            {src.status === 'none' && (
              <Text size='xs' c='dimmed'>
                {t('statusNone')}
              </Text>
            )}
            {src.status === 'cidr' && (
              <Text size='xs' c='dimmed'>
                {t('statusCidr')}
              </Text>
            )}
            {src.status === 'direct' && (
              <Text size='xs' c='dimmed'>
                {t('statusDirect')}
              </Text>
            )}
          </Stack>
        </Group>
        {src.score > 0 && (
          <Badge size='sm' color={scoreColor(src.score)} variant='light'>
            +{src.score}%
          </Badge>
        )}
      </Group>
      {src.subnet && (
        <Progress
          mt={6}
          value={src.subnet.percent}
          color={scoreColor(src.subnet.percent >= 70 ? 80 : src.subnet.percent >= 40 ? 40 : 0)}
          size='xs'
        />
      )}
    </Card>
  );
}
