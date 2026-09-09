import type {
  AgentConnectionStatus,
  AppTheme,
  MonacoTheme,
  ReviewWorkspaceStatus,
} from '@/shared/types';

import type { ReviewFileSummary, ShellStateOption } from '../../../AppShell.types';

export interface TopBarViewModel {
  agentConnectionStatus: AgentConnectionStatus;
  appTheme: AppTheme;
  repositoryPath: string | null;
  repositoryTitle: string;
  shellStateOptions: ShellStateOption[];
  workspaceStatus: ReviewWorkspaceStatus;
}

export interface TopBarActions {
  onGraphToggle: () => void;
  onSettingsClick: () => void;
  onThemeToggle: () => void;
  onWorkspaceStatusSelect: (status: ReviewWorkspaceStatus) => void;
}

export interface TopBarProps {
  actions: TopBarActions;
  viewModel: TopBarViewModel;
}

export interface ActivityRailViewModel {
  workspaceStatus: ReviewWorkspaceStatus;
}

export interface ActivityRailProps {
  viewModel: ActivityRailViewModel;
}

export interface FileSidebarViewModel {
  files: ReviewFileSummary[];
  workspaceStatus: ReviewWorkspaceStatus;
}

export interface FileSidebarProps {
  viewModel: FileSidebarViewModel;
}

export interface FileRowProps {
  file: ReviewFileSummary;
  isActive: boolean;
}

export interface EditorRegionViewModel {
  currentFilePath: string | null;
  monacoTheme: MonacoTheme;
  workspaceStatus: ReviewWorkspaceStatus;
}

export interface EditorRegionProps {
  viewModel: EditorRegionViewModel;
}

export interface SideSheetRegionViewModel {
  isOpen: boolean;
}

export interface SideSheetRegionActions {
  onOpenChange: (isOpen: boolean) => void;
}

export interface SideSheetRegionProps {
  actions: SideSheetRegionActions;
  viewModel: SideSheetRegionViewModel;
}

export interface StatusBarViewModel {
  agentConnectionStatus: AgentConnectionStatus;
  currentFilePath: string | null;
  monacoTheme: MonacoTheme;
  reviewedFileCount: number;
  totalFileCount: number;
  workspaceStatus: ReviewWorkspaceStatus;
}

export interface StatusBarProps {
  viewModel: StatusBarViewModel;
}

export interface ShellStatePanelProps {
  workspaceStatus: ReviewWorkspaceStatus;
}
