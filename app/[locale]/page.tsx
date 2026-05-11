import { setRequestLocale } from 'next-intl/server';
import { CheckerPage } from '@/src/pages/checker';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CheckerPage />;
}
