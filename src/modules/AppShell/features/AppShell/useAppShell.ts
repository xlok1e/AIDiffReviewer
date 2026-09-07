import type { AppShellViewModel } from '../../AppShell.types';

export function useAppShell(): AppShellViewModel {
  return {
    workspaceStatus: 'empty',
    agentConnectionStatus: 'notConfigured',
    currentFilePath: null,
    reviewedFileCount: 0,
    totalFileCount: 0,
    files: [],
  };
}
