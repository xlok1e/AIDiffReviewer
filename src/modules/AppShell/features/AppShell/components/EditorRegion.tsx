import { GitPullRequestArrow } from 'lucide-react';
import type { ReactNode } from 'react';

import { AppPanel, Flex } from '@/ui/components';

import type { EditorRegionProps } from './AppShellComponents.types';
import { ShellStatePanel } from './ShellStatePanel';

export function EditorRegion({ viewModel }: EditorRegionProps): ReactNode {
  const { currentFilePath, monacoTheme, workspaceStatus } = viewModel;

  if (workspaceStatus !== 'ready' || currentFilePath === null) {
    return <ShellStatePanel workspaceStatus={workspaceStatus} />;
  }

  return (
    <AppPanel className='grid h-full grid-rows-[40px_1fr]' tone='editor'>
      <Flex align='center' className='min-w-0 border-b bg-panel-strong px-3' gap={8}>
        <span className='truncate font-mono text-sm'>{currentFilePath}</span>
        <span className='ml-auto text-xs text-muted-foreground'>{monacoTheme}</span>
      </Flex>
      <AppPanel className='grid min-h-0 place-items-center px-8' tone='editor'>
        <AppPanel className='grid max-w-lg justify-items-center gap-4 text-center text-muted-foreground'>
          <span className='grid size-14 place-items-center rounded-2xl bg-secondary text-muted-foreground'>
            <GitPullRequestArrow size={26} />
          </span>
          <AppPanel className='grid gap-1.5'>
            <h2 className='text-base font-medium tracking-tight text-foreground'>
              Monaco diff surface
            </h2>
            <p className='text-sm leading-6'>
              Ready for side-by-side review with synced theme state.
            </p>
          </AppPanel>
        </AppPanel>
      </AppPanel>
    </AppPanel>
  );
}
