import {
  CircleCheck,
  CircleDashed,
  CircleDotDashed,
  CircleX,
  FileMinus2,
  FilePenLine,
  FilePlus2,
} from 'lucide-react';

import type { ReviewFileChangeKind, ReviewFileStatus } from '../../../AppShell.types';
import type {
  FileStateBadgeViewModel,
  FileStateBadgesProps,
  FileStateBadgesViewModel,
} from './FileStateBadges.types';

const CHANGE_ICONS: Record<ReviewFileChangeKind, FileStateBadgeViewModel['icon']> = {
  created: FilePlus2,
  deleted: FileMinus2,
  modified: FilePenLine,
};

const STATUS_ICONS: Record<ReviewFileStatus, FileStateBadgeViewModel['icon']> = {
  accepted: CircleCheck,
  partial: CircleDotDashed,
  pending: CircleDashed,
  rejected: CircleX,
};

// Maps file state fields into stable badge view models.
export function useFileStateBadges({ file }: FileStateBadgesProps): FileStateBadgesViewModel {
  return {
    changeBadge: {
      icon: CHANGE_ICONS[file.changeKind],
      label: file.changeLabel,
      tone: file.changeTone,
    },
    statusBadge: {
      icon: STATUS_ICONS[file.status],
      label: file.statusLabel,
      tone: file.statusTone,
    },
  };
}
