'use client';

import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { BrandIcon } from './BrandIcon';
import { ButtonGroup } from './ui/button-group';
import Link from 'next/link';

export function GitHubLink() {
  const [stars, setStars] = useState<string | null>(null);

  useEffect(() => {
    fetch('https://api.github.com/repos/LL33ch/dpi-checker')
      .then((r) => r.json())
      .then((json) => {
        const count = json.stargazers_count;
        if (typeof count === 'number') {
          setStars(count >= 1000 ? `${Math.round(count / 1000)}k` : String(count));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <Link href='https://github.com/LL33ch/dpi-checker'>
      <ButtonGroup>
        <Button size='sm' variant='secondary'>
          <BrandIcon brand='siGithub' color='#fff' />
          Github
        </Button>
        <Button size='sm' variant='secondary'>
          {stars}
        </Button>
      </ButtonGroup>
    </Link>
  );
}
