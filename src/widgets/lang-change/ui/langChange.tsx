'use client';

import { Button, Menu } from '@mantine/core';
import ReactCountryFlag from 'react-country-flag';
import { useLocaleSwitch, SUPPORTED_LOCALES, type Locale } from '@shared/i18n/LocaleProvider';

const LOCALE_META: Record<Locale, { label: string; flag: string }> = {
  en: { label: 'English', flag: 'GB' },
  ru: { label: 'Русский', flag: 'RU' },
};

export function LangChange() {
  const { locale, setLocale } = useLocaleSwitch();
  const current = LOCALE_META[locale];

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
        {SUPPORTED_LOCALES.map((code) => (
          <Menu.Item
            key={code}
            leftSection={<ReactCountryFlag countryCode={LOCALE_META[code].flag} svg />}
            onClick={() => setLocale(code)}
            fw={code === locale ? 700 : undefined}
          >
            {LOCALE_META[code].label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
