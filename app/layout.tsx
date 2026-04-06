import type { Metadata } from 'next';
import { Inter, Geist } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'DPI-CHECKER | Internet Censorship & Blocking Detector',
  description: 'Crowdsourced detection of internet censorship and DPI blocking.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={inter.className}>
        <ThemeProvider attribute='class' defaultTheme='dark' enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
