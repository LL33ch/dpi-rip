'use client';
import { Checker } from '@widgets/checker';
import { UserInfo } from '@widgets/user-info';
import { Stack } from '@mantine/core';

export function CheckerPage() {
  return (
    <Stack>
      <UserInfo />
      <Checker />
    </Stack>
  );
}
