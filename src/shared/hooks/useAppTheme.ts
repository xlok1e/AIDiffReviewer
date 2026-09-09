'use client';

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

import type { AppTheme, AppThemeSyncState, MonacoTheme } from '@/shared/types';

function mapResolvedTheme(resolvedTheme: string | undefined): AppTheme {
  return resolvedTheme === 'light' ? 'light' : 'dark';
}

function mapMonacoTheme(appTheme: AppTheme): MonacoTheme {
  return appTheme === 'dark' ? 'vs-dark' : 'vs-light';
}

function subscribeThemeReady(): () => void {
  return () => undefined;
}

function getClientThemeReady(): boolean {
  return true;
}

function getServerThemeReady(): boolean {
  return false;
}

// Exposes the persisted app theme and the Monaco theme name from one synced surface.
export function useAppTheme(): AppThemeSyncState {
  const { resolvedTheme, setTheme } = useTheme();
  const isThemeReady = useSyncExternalStore(
    subscribeThemeReady,
    getClientThemeReady,
    getServerThemeReady,
  );
  const appTheme = isThemeReady ? mapResolvedTheme(resolvedTheme) : 'dark';

  return {
    appTheme,
    monacoTheme: mapMonacoTheme(appTheme),
    isThemeReady,
    setAppTheme: setTheme,
  };
}
