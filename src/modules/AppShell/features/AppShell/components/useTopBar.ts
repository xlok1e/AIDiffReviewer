import type { ChangeEvent } from 'react';

import type { ReviewWorkspaceStatus } from '@/shared/types';

interface UseTopBarOptions {
  onWorkspaceStatusSelect: (status: ReviewWorkspaceStatus) => void;
}

interface UseTopBarResult {
  selectWorkspaceStatus: (event: ChangeEvent<HTMLSelectElement>) => void;
}

const WORKSPACE_STATUSES: ReadonlySet<string> = new Set(['firstRun', 'empty', 'ready', 'error']);

function isReviewWorkspaceStatus(value: string): value is ReviewWorkspaceStatus {
  return WORKSPACE_STATUSES.has(value);
}

// Converts the temporary shell-state selector into a typed workspace status.
export function useTopBar(options: UseTopBarOptions): UseTopBarResult {
  return {
    selectWorkspaceStatus: event => {
      const selectedStatus = event.target.value;

      if (!isReviewWorkspaceStatus(selectedStatus)) {
        return;
      }

      options.onWorkspaceStatusSelect(selectedStatus);
    },
  };
}
