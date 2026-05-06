import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

const SUPPORTED = ['ru', 'en'] as const;
type Locale = (typeof SUPPORTED)[number];

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const raw = cookieStore.get('NEXT_LOCALE')?.value;
  const locale: Locale = SUPPORTED.includes(raw as Locale) ? (raw as Locale) : 'en';

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
