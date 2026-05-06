'use client';
import { useState } from 'react';
import { Checker } from '@widgets/checker';
import { UserInfo } from '@widgets/user-info';
import { Stack } from '@mantine/core';

export function CheckerPage() {
  const [revealed, setRevealed] = useState(false);

  return (
    <Stack>
      <UserInfo revealed={revealed} onToggle={() => setRevealed((v) => !v)} />
      <Checker revealed={revealed} />
    </Stack>
  );
}
