'use client';

import { useState } from 'react';
import { GitHubLink } from '@/components/GithubLink';
import { UserInfo } from '@/components/UserInfo';
import { CheckerView } from '@/components/CheckerView';
import { StatsView } from '@/components/StatsView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
  const [revealed, setRevealed] = useState(false);

  return (
    <main className='min-h-screen p-4 md:p-8'>
      <div className='max-w-4xl mx-auto space-y-4'>
        <div>
          <div className='flex items-center justify-between gap-2'>
            <h1 className='text-xl font-bold'>DPI-CHECKER</h1>
            <GitHubLink />
          </div>
          <p className='text-muted-foreground text-sm mt-1'>
            Internet Censorship & Blocking Detector
          </p>
        </div>

        <UserInfo revealed={revealed} onToggle={() => setRevealed((v) => !v)} />

        <Tabs defaultValue='checker'>
          <TabsList className='w-full'>
            <TabsTrigger value='checker' className='flex-1'>Checker</TabsTrigger>
            <TabsTrigger value='stats' className='flex-1'>Statistics</TabsTrigger>
          </TabsList>
          <TabsContent value='checker' className='mt-4'>
            <CheckerView revealed={revealed} />
          </TabsContent>
          <TabsContent value='stats' className='mt-4'>
            <StatsView />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
