import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';

import { Inter } from 'next/font/google';
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import { Providers } from './providers';
import { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { LocaleProvider, type Locale } from '@/src/shared/i18n/LocaleProvider';
import { AppShellMain } from '@/src/widgets/appshell';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'DPI.RIP | Internet Censorship & Blocking Detector | DPI-CHECKER',
  description: 'Crowdsourced detection of internet censorship and DPI blocking.',
  keywords: ['dpi.rip', 'dpi', 'dpi-check', 'dpi-checker', 'тспу'],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = (await getLocale()) as Locale;

  return (
    <html lang={locale} {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme='dark' />
      </head>
      <body className={inter.className}>
        <Providers>
          <LocaleProvider initialLocale={locale}>
            <AppShellMain>{children}</AppShellMain>
          </LocaleProvider>
        </Providers>
      </body>
    </html>
  );
}
