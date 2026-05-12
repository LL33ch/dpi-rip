'use client';
import { Button } from '@mantine/core';
import { GithubLogoIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function GithubButton() {
  const [stars, setStars] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('https://api.github.com/repos/LL33ch/dpi-rip')
      .then((r) => r.json())
      .then((json) => {
        const count = json.stargazers_count;
        if (typeof count === 'number') {
          setStars(String(count));
          setIsLoading(false);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <Button
      component={Link}
      size='compact-sm'
      color='blue'
      loading={isLoading}
      leftSection={<GithubLogoIcon weight='fill' />}
      rightSection={stars ? stars : '00'}
      href='https://github.com/LL33ch/dpi-rip'
      target='_blank'
    >
      Github
    </Button>
  );
}
