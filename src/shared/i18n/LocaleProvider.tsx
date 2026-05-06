'use client';

import { createContext, startTransition, useContext, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import ruMessages from './messages/ru.json';
import enMessages from './messages/en.json';

const allMessages = { en: enMessages, ru: ruMessages } as const;
export type Locale = keyof typeof allMessages;
export const SUPPORTED_LOCALES: Locale[] = ['en', 'ru'];

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
}>({ locale: 'en', setLocale: () => {} });

export function useLocaleSwitch() {
  return useContext(LocaleContext);
}

function switchLocale(newLocale: Locale, setLocaleState: (l: Locale) => void) {
  document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
  startTransition(() => setLocaleState(newLocale));
}

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  return (
    <LocaleContext.Provider value={{ locale, setLocale: (l) => switchLocale(l, setLocaleState) }}>
      <NextIntlClientProvider locale={locale} messages={allMessages[locale]}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
