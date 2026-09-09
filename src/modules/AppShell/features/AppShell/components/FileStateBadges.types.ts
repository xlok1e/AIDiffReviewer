import type { LucideIcon } from 'lucide-react';

import type { ReviewFileSummary, ShellTone } from '../../../AppShell.types';

export interface FileStateBadgesProps {
  file: Pick<
    ReviewFileSummary,
    'changeKind' | 'changeLabel' | 'changeTone' | 'status' | 'statusLabel' | 'statusTone'
  >;
}

export interface FileStateBadgeViewModel {
  icon: LucideIcon;
  label: string;
  tone: ShellTone;
}

export interface FileStateBadgesViewModel {
  changeBadge: FileStateBadgeViewModel;
  statusBadge: FileStateBadgeViewModel;
}
