import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { routing } from '@/src/shared/i18n/routing';
import { AppShellMain } from '@/src/widgets/appshell';

export const metadata: Metadata = {
  title: 'DPI.RIP | Internet Censorship & Blocking Detector | DPI-CHECKER',
  description: 'Crowdsourced detection of internet censorship and DPI blocking.',
  keywords: ['dpi.rip', 'dpi', 'dpi-check', 'dpi-checker', 'тспу'],
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(routing.locales as readonly string[]).includes(locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <AppShellMain>{children}</AppShellMain>
    </NextIntlClientProvider>
  );
}
