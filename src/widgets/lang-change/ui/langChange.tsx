'use client';

import { Button, Menu } from '@mantine/core';
import ReactCountryFlag from 'react-country-flag';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/src/shared/i18n/navigation';
import { routing, type Locale } from '@/src/shared/i18n/routing';

const LOCALE_META: Record<Locale, { label: string; flag: string }> = {
  en: { label: 'English', flag: 'GB' },
  ru: { label: 'Русский', flag: 'RU' },
};

export function LangChange() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const current = LOCALE_META[locale];

  function switchLocale(code: Locale) {
    localStorage.setItem('locale', code);
    router.replace(pathname, { locale: code });
  }

  return (
    <Menu shadow='md' position='bottom-end'>
      <Menu.Target>
        <Button
          size='compact-sm'
          color='dark'
          leftSection={<ReactCountryFlag countryCode={current.flag} svg />}
        >
          {current.label}
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        {routing.locales.map((code) => (
          <Menu.Item
            key={code}
            leftSection={<ReactCountryFlag countryCode={LOCALE_META[code].flag} svg />}
            onClick={() => switchLocale(code)}
            fw={code === locale ? 700 : undefined}
          >
            {LOCALE_META[code].label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
