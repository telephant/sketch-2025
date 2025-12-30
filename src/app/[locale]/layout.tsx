import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { AnswersProvider } from '@/hooks/useAnswers';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '2025 简笔画 | Sketch 2025',
  description: '解压式年度回顾 - Interactive Year-End Review',
  keywords: ['年度回顾', '简笔画', '2025', 'year review', 'sketch', 'interactive'],
  authors: [{ name: '2025 Sketch' }],
  openGraph: {
    title: '2025 简笔画',
    description: '回答 9 个问题，看看你的年度状态',
    type: 'website',
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Get messages for the current locale
  const messages = await getMessages();

  return (
    <html lang={locale} className={inter.variable}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <AnswersProvider>
            {children}
          </AnswersProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
