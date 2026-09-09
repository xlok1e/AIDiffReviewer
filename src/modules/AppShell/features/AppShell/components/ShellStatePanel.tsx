import { AlertTriangle, FolderOpen, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

import { mergeClassNames } from '@/shared/helpers/classNames';
import { AppButton, AppPanel } from '@/ui/components';

import type { ShellStatePanelProps } from './AppShellComponents.types';

const STATE_CONTENT = {
  firstRun: {
    icon: <Sparkles size={26} />,
    tone: 'brand' as const,
    title: 'Choose a repository',
    message: 'Select a local git repository to start reviewing AI-generated changes.',
  },
  empty: {
    icon: <FolderOpen size={26} />,
    tone: 'neutral' as const,
    title: 'No repository selected',
    message: 'Recent projects and the repository picker will mount here in the next step.',
  },
  error: {
    icon: <AlertTriangle size={26} />,
    tone: 'danger' as const,
    title: 'Shell error',
    message: 'A recoverable app error message will appear here with retry actions.',
  },
  ready: {
    icon: <FolderOpen size={26} />,
    tone: 'neutral' as const,
    title: 'No active diff',
    message: 'Select a changed file from the explorer to inspect its hunks.',
  },
};

const ICON_TONE_CLASSNAMES = {
  brand: 'bg-brand/10 text-brand',
  neutral: 'bg-secondary text-muted-foreground',
  danger: 'bg-destructive/10 text-destructive',
};

export function ShellStatePanel({ workspaceStatus }: ShellStatePanelProps): ReactNode {
  const content = STATE_CONTENT[workspaceStatus];

  return (
    <AppPanel className='grid h-full place-items-center px-8' tone='editor'>
      <AppPanel className='grid max-w-md justify-items-center gap-4 text-center'>
        <span
          className={mergeClassNames(
            'grid size-14 place-items-center rounded-2xl',
            ICON_TONE_CLASSNAMES[content.tone],
          )}
        >
          {content.icon}
        </span>
        <AppPanel className='grid gap-1.5'>
          <h2 className='text-lg font-semibold tracking-tight'>{content.title}</h2>
          <p className='text-sm leading-6 text-muted-foreground'>{content.message}</p>
        </AppPanel>
        <AppButton tone='primary'>Open repository</AppButton>
      </AppPanel>
    </AppPanel>
  );
}
