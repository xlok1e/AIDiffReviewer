import { useState } from 'react';

import { useAppTheme } from '@/shared/hooks/useAppTheme';
import type { ReviewWorkspaceStatus } from '@/shared/types';

import type { AppShellViewModel, ReviewFileSummary, ShellStateOption } from '../../AppShell.types';

const PLACEHOLDER_FILES: ReviewFileSummary[] = [
  {
    id: 'app-shell',
    filePath: 'src/modules/AppShell/features/AppShell/index.tsx',
    fileName: 'index.tsx',
    folderPath: 'src/modules/AppShell/features/AppShell',
    hunkCount: 4,
    status: 'partial',
    statusLabel: 'Partial',
    statusTone: 'warning',
    changeKind: 'modified',
    changeLabel: 'Modified',
    changeTone: 'warning',
    isUnexpected: false,
  },
  {
    id: 'diff-types',
    filePath: 'src/modules/DiffReview/DiffReview.types.ts',
    fileName: 'DiffReview.types.ts',
    folderPath: 'src/modules/DiffReview',
    hunkCount: 2,
    status: 'pending',
    statusLabel: 'Pending',
    statusTone: 'neutral',
    changeKind: 'created',
    changeLabel: 'Created',
    changeTone: 'success',
    isUnexpected: false,
  },
  {
    id: 'tauri-paths',
    filePath: 'src-tauri/src/shared/paths.rs',
    fileName: 'paths.rs',
    folderPath: 'src-tauri/src/shared',
    hunkCount: 8,
    status: 'accepted',
    statusLabel: 'Accepted',
    statusTone: 'success',
    changeKind: 'modified',
    changeLabel: 'Modified',
    changeTone: 'warning',
    isUnexpected: false,
  },
  {
    id: 'package',
    filePath: 'package.json',
    fileName: 'package.json',
    folderPath: '.',
    hunkCount: 1,
    status: 'rejected',
    statusLabel: 'Rejected',
    statusTone: 'danger',
    changeKind: 'deleted',
    changeLabel: 'Deleted',
    changeTone: 'danger',
    isUnexpected: true,
  },
];

const SHELL_STATE_OPTIONS: ShellStateOption[] = [
  { status: 'ready', label: 'AiDiffReviewer' },
  { status: 'firstRun', label: 'First run' },
  { status: 'empty', label: 'No repository' },
  { status: 'error', label: 'App error' },
];

function getShellFiles(workspaceStatus: ReviewWorkspaceStatus): ReviewFileSummary[] {
  return workspaceStatus === 'ready' ? PLACEHOLDER_FILES : [];
}

function getCurrentFilePath(files: ReviewFileSummary[]): string | null {
  return files[0]?.filePath ?? null;
}

export function useAppShell(): AppShellViewModel {
  const [workspaceStatus, setWorkspaceStatus] = useState<ReviewWorkspaceStatus>('ready');
  const [isGraphSheetOpen, setIsGraphSheetOpen] = useState(false);
  const { appTheme, isThemeReady, monacoTheme, setAppTheme } = useAppTheme();
  const files = getShellFiles(workspaceStatus);

  return {
    workspaceStatus,
    agentConnectionStatus: workspaceStatus === 'ready' ? 'connected' : 'notConfigured',
    repositoryTitle: workspaceStatus === 'ready' ? 'AiDiffReviewer' : 'Select repository',
    repositoryPath: workspaceStatus === 'ready' ? '~/Проекты/AiDiffReviewer' : null,
    currentFilePath: getCurrentFilePath(files),
    reviewedFileCount: files.filter(file => file.status === 'accepted').length,
    totalFileCount: files.length,
    files,
    isGraphSheetOpen,
    appTheme,
    monacoTheme,
    isThemeReady,
    shellStateOptions: SHELL_STATE_OPTIONS,
    selectWorkspaceStatus: setWorkspaceStatus,
    toggleGraphSheet: () => setIsGraphSheetOpen(isOpen => !isOpen),
    closeGraphSheet: () => setIsGraphSheetOpen(false),
    setGraphSheetOpen: setIsGraphSheetOpen,
    openSettingsPlaceholder: () => undefined,
    toggleTheme: () => setAppTheme(appTheme === 'dark' ? 'light' : 'dark'),
  };
}
