import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';

import { Inter } from 'next/font/google';
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html {...mantineHtmlProps} suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme='dark' />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
