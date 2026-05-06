import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  images: {
    loader: 'custom',
    loaderFile: './src/shared/lib/image-loader.ts',
    remotePatterns: [
      {
        hostname: 'www.google.com',
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin('./src/shared/i18n/config.ts');
export default withNextIntl(nextConfig);
