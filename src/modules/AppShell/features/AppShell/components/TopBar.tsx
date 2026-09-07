import { Moon, PlugZap, Settings } from 'lucide-react';
import type { ReactNode } from 'react';

import type { AgentConnectionStatus } from '@/shared/types/AppStatus.types';

interface TopBarProps {
  agentConnectionStatus: AgentConnectionStatus;
}

export function TopBar({ agentConnectionStatus }: TopBarProps): ReactNode {
  return (
    <header className='flex items-center justify-between border-b bg-muted/35 px-3 text-sm'>
      <div className='flex min-w-0 items-center gap-2'>
        <span className='font-medium'>AI Diff Reviewer</span>
        <span className='truncate text-muted-foreground'>No repository selected</span>
      </div>
      <div className='flex items-center gap-1.5 text-muted-foreground'>
        <button
          aria-label={`Agent status: ${agentConnectionStatus}`}
          className='inline-flex size-7 items-center justify-center rounded-md hover:bg-muted'
          type='button'
        >
          <PlugZap size={15} />
        </button>
        <button
          aria-label='Theme'
          className='inline-flex size-7 items-center justify-center rounded-md hover:bg-muted'
          type='button'
        >
          <Moon size={15} />
        </button>
        <button
          aria-label='Settings'
          className='inline-flex size-7 items-center justify-center rounded-md hover:bg-muted'
          type='button'
        >
          <Settings size={15} />
        </button>
      </div>
    </header>
  );
}
