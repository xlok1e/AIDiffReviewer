import type { AgentConnectionStatus, ReviewWorkspaceStatus } from '@/shared/types/AppStatus.types';

export interface ReviewFileSummary {
  id: string;
  filePath: string;
  hunkCount: number;
  status: 'pending' | 'partial' | 'accepted' | 'rejected';
  isUnexpected: boolean;
}

export interface AppShellViewModel {
  workspaceStatus: ReviewWorkspaceStatus;
  agentConnectionStatus: AgentConnectionStatus;
  currentFilePath: string | null;
  reviewedFileCount: number;
  totalFileCount: number;
  files: ReviewFileSummary[];
}
