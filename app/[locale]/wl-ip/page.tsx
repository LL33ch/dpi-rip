import { setRequestLocale } from 'next-intl/server';
import { WlIpPage } from '@/src/pages/wl-ip';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <WlIpPage />;
}
