import type { ReactNode } from 'react';

import { EmptyEditorPane } from './components/EmptyEditorPane';
import { FileSidebar } from './components/FileSidebar';
import { StatusBar } from './components/StatusBar';
import { TopBar } from './components/TopBar';
import { useAppShell } from './useAppShell';

export function AppShell(): ReactNode {
  const appShell = useAppShell();

  return (
    <main className='grid min-h-screen grid-rows-[40px_1fr_24px] bg-background text-foreground'>
      <TopBar agentConnectionStatus={appShell.agentConnectionStatus} />
      <section className='grid min-h-0 grid-cols-[280px_1fr] border-y'>
        <FileSidebar files={appShell.files} workspaceStatus={appShell.workspaceStatus} />
        <EmptyEditorPane currentFilePath={appShell.currentFilePath} />
      </section>
      <StatusBar
        agentConnectionStatus={appShell.agentConnectionStatus}
        currentFilePath={appShell.currentFilePath}
        reviewedFileCount={appShell.reviewedFileCount}
        totalFileCount={appShell.totalFileCount}
      />
    </main>
  );
}
