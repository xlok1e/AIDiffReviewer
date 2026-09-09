export type AppTheme = 'light' | 'dark';

export type MonacoTheme = 'vs-light' | 'vs-dark';

export interface AppThemeSyncState {
  appTheme: AppTheme;
  monacoTheme: MonacoTheme;
  isThemeReady: boolean;
  setAppTheme: (theme: AppTheme) => void;
}
