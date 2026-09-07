'use client';

import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps): ReactNode {
  return (
    <ThemeProvider attribute='class' defaultTheme='dark' enableSystem storageKey='ai-diff-theme'>
      {children}
    </ThemeProvider>
  );
}
