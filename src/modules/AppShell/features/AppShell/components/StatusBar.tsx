import { Circle } from 'lucide-react';
import type { ReactNode } from 'react';

import type { AgentConnectionStatus } from '@/shared/types/AppStatus.types';

interface StatusBarProps {
  agentConnectionStatus: AgentConnectionStatus;
  currentFilePath: string | null;
  reviewedFileCount: number;
  totalFileCount: number;
}

export function StatusBar({
  agentConnectionStatus,
  currentFilePath,
  reviewedFileCount,
  totalFileCount,
}: StatusBarProps): ReactNode {
  return (
    <footer className='flex items-center justify-between bg-muted px-3 font-mono text-xs text-muted-foreground'>
      <span className='truncate'>{currentFilePath ?? 'No active file'}</span>
      <div className='flex items-center gap-4'>
        <span className='tabular-nums'>
          {reviewedFileCount}/{totalFileCount} reviewed
        </span>
        <span className='inline-flex items-center gap-1.5'>
          <Circle size={8} />
          {agentConnectionStatus}
        </span>
      </div>
    </footer>
  );
}
