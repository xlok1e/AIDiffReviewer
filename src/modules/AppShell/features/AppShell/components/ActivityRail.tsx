import { Bot, Files, GitBranch, Search } from 'lucide-react';
import type { ReactNode } from 'react';

import { AppPanel, Flex, IconButton } from '@/ui/components';

import type { ActivityRailProps } from './AppShellComponents.types';

export function ActivityRail({ viewModel }: ActivityRailProps): ReactNode {
  const { workspaceStatus } = viewModel;

  return (
    <AppPanel
      className='grid h-full grid-rows-[1fr_auto] justify-items-center py-3'
      edge='right'
      tone='activity'
    >
      <nav>
        <Flex direction='column' gap={6}>
          <IconButton icon={<Files />} label='Explorer' size='rail' tone='active' />
          <IconButton icon={<Search />} label='Search' size='rail' />
          <IconButton icon={<GitBranch />} label='Review graph' size='rail' />
          <IconButton
            disabled={workspaceStatus !== 'ready'}
            icon={<Bot />}
            label='Agent'
            size='rail'
          />
        </Flex>
      </nav>
    </AppPanel>
  );
}
