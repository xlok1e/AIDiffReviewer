import type { ReactNode } from 'react';

import { Flex, StatusIndicator } from '@/ui/components';

import type { StatusBarProps } from './AppShellComponents.types';

export function StatusBar({ viewModel }: StatusBarProps): ReactNode {
  const {
    agentConnectionStatus,
    currentFilePath,
    monacoTheme,
    reviewedFileCount,
    totalFileCount,
    workspaceStatus,
  } = viewModel;

  return (
    <footer className='grid h-[26px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t bg-panel-strong px-3 font-mono text-[11px] text-muted-foreground'>
      <span className='truncate'>{currentFilePath ?? 'No active file'}</span>
      <Flex align='center' gap={16}>
        <span className='tabular-nums'>
          {reviewedFileCount}/{totalFileCount} reviewed
        </span>
        <span>{monacoTheme}</span>
        <StatusIndicator
          label={workspaceStatus}
          tone={workspaceStatus === 'ready' ? 'success' : 'neutral'}
        />
        <StatusIndicator
          label={agentConnectionStatus}
          tone={agentConnectionStatus === 'connected' ? 'success' : 'neutral'}
        />
      </Flex>
    </footer>
  );
}
