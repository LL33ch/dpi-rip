import { getRequestConfig } from 'next-intl/server';
import { routing, type Locale } from './routing';
import enMessages from './messages/en.json';
import ruMessages from './messages/ru.json';

const messages = { en: enMessages, ru: ruMessages };

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: Locale = (routing.locales as readonly string[]).includes(requested ?? '')
    ? (requested as Locale)
    : routing.defaultLocale;

  return {
    locale,
    messages: messages[locale],
  };
});
