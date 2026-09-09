import { ChevronDown, FolderGit2, GitBranch, Moon, PlugZap, Settings, Sun } from 'lucide-react';
import type { ReactNode } from 'react';

import { Flex, IconButton, StatusIndicator } from '@/ui/components';

import type { TopBarProps } from './AppShellComponents.types';
import { useTopBar } from './useTopBar';

export function TopBar({ actions, viewModel }: TopBarProps): ReactNode {
  const {
    agentConnectionStatus,
    appTheme,
    repositoryPath,
    repositoryTitle,
    shellStateOptions,
    workspaceStatus,
  } = viewModel;
  const { onGraphToggle, onSettingsClick, onThemeToggle, onWorkspaceStatusSelect } = actions;
  const topBar = useTopBar({ onWorkspaceStatusSelect });

  return (
    <header className='grid h-12 grid-cols-[minmax(240px,1fr)_auto] items-center border-b bg-panel-strong px-3 text-sm'>
      <Flex align='center' className='min-w-0' gap={8}>
        <FolderGit2 className='shrink-0 text-brand' size={16} />
        <label className='relative min-w-0'>
          <span className='sr-only'>Repository state</span>
          <select
            className='h-8 max-w-[280px] appearance-none truncate rounded-md border border-transparent bg-transparent py-0 pl-2.5 pr-6 text-sm font-medium tracking-tight text-foreground outline-none transition-colors hover:bg-secondary focus-visible:border-ring'
            title={repositoryTitle}
            value={workspaceStatus}
            onChange={topBar.selectWorkspaceStatus}
          >
            {shellStateOptions.map(option => (
              <option key={option.status} value={option.status}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden='true'
            className='pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground'
            size={13}
          />
        </label>
        <span className='hidden min-w-0 truncate font-mono text-xs text-muted-foreground md:block'>
          {repositoryPath ?? 'No repository selected'}
        </span>
      </Flex>
      <Flex align='center' gap={6} justify='flexEnd'>
        <StatusIndicator
          className='mr-2 hidden md:inline-flex'
          label={agentConnectionStatus}
          tone={agentConnectionStatus === 'connected' ? 'success' : 'neutral'}
        />
        <IconButton
          disabled={workspaceStatus !== 'ready'}
          icon={<GitBranch />}
          label='Open graph'
          onClick={onGraphToggle}
          tooltipSide='bottom'
        />
        <IconButton
          icon={appTheme === 'dark' ? <Moon /> : <Sun />}
          label='Toggle theme'
          onClick={onThemeToggle}
          tooltipSide='bottom'
        />
        <IconButton icon={<PlugZap />} label='Agent status' tooltipSide='bottom' />
        <IconButton
          icon={<Settings />}
          label='Settings'
          onClick={onSettingsClick}
          tooltipSide='bottom'
        />
      </Flex>
    </header>
  );
}
