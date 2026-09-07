import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { AppProviders } from '@/shared/providers/AppProviders';

import './globals.css';

export const metadata: Metadata = {
  title: 'AI Diff Reviewer',
  description: 'Local desktop review layer for AI-generated code changes.',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): ReactNode {
  return (
    <html lang='en' suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
