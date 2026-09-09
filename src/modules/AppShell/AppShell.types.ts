import type {
  AgentConnectionStatus,
  AppTheme,
  MonacoTheme,
  ReviewWorkspaceStatus,
} from '@/shared/types';

export type ReviewFileStatus = 'pending' | 'partial' | 'accepted' | 'rejected';

export type ReviewFileChangeKind = 'created' | 'modified' | 'deleted';

export type ShellTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export interface ReviewFileSummary {
  id: string;
  filePath: string;
  fileName: string;
  folderPath: string;
  hunkCount: number;
  status: ReviewFileStatus;
  statusLabel: string;
  statusTone: ShellTone;
  changeKind: ReviewFileChangeKind;
  changeLabel: string;
  changeTone: ShellTone;
  isUnexpected: boolean;
}

export interface ShellStateOption {
  status: ReviewWorkspaceStatus;
  label: string;
}

export interface AppShellViewModel {
  workspaceStatus: ReviewWorkspaceStatus;
  agentConnectionStatus: AgentConnectionStatus;
  repositoryTitle: string;
  repositoryPath: string | null;
  currentFilePath: string | null;
  reviewedFileCount: number;
  totalFileCount: number;
  files: ReviewFileSummary[];
  isGraphSheetOpen: boolean;
  appTheme: AppTheme;
  monacoTheme: MonacoTheme;
  isThemeReady: boolean;
  shellStateOptions: ShellStateOption[];
  selectWorkspaceStatus: (status: ReviewWorkspaceStatus) => void;
  toggleGraphSheet: () => void;
  closeGraphSheet: () => void;
  setGraphSheetOpen: (isOpen: boolean) => void;
  openSettingsPlaceholder: () => void;
  toggleTheme: () => void;
}
