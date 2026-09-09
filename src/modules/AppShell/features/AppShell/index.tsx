'use client';

import type { ReactNode } from 'react';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/ui/shadcn/resizable';

import { ActivityRail } from './components/ActivityRail';
import { EditorRegion } from './components/EditorRegion';
import { FileSidebar } from './components/FileSidebar';
import { SideSheetRegion } from './components/SideSheetRegion';
import { StatusBar } from './components/StatusBar';
import { TopBar } from './components/TopBar';
import { useAppShell } from './useAppShell';

export function AppShell(): ReactNode {
  const appShell = useAppShell();

  return (
    <main className='grid h-screen min-h-[520px] grid-rows-[48px_1fr_26px] overflow-hidden bg-background text-foreground'>
      <TopBar
        actions={{
          onGraphToggle: appShell.toggleGraphSheet,
          onSettingsClick: appShell.openSettingsPlaceholder,
          onThemeToggle: appShell.toggleTheme,
          onWorkspaceStatusSelect: appShell.selectWorkspaceStatus,
        }}
        viewModel={{
          agentConnectionStatus: appShell.agentConnectionStatus,
          appTheme: appShell.appTheme,
          repositoryPath: appShell.repositoryPath,
          repositoryTitle: appShell.repositoryTitle,
          shellStateOptions: appShell.shellStateOptions,
          workspaceStatus: appShell.workspaceStatus,
        }}
      />
      <section className='grid min-h-0 grid-cols-[40px_minmax(0,1fr)]'>
        <ActivityRail viewModel={{ workspaceStatus: appShell.workspaceStatus }} />
        <ResizablePanelGroup direction='horizontal'>
          <ResizablePanel defaultSize={18} maxSize={50} minSize={18}>
            <FileSidebar
              viewModel={{
                files: appShell.files,
                workspaceStatus: appShell.workspaceStatus,
              }}
            />
          </ResizablePanel>
          <ResizableHandle className='cursor-col-resize' />
          <ResizablePanel defaultSize={82} minSize={56}>
            <EditorRegion
              viewModel={{
                currentFilePath: appShell.currentFilePath,
                monacoTheme: appShell.monacoTheme,
                workspaceStatus: appShell.workspaceStatus,
              }}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </section>
      <SideSheetRegion
        actions={{ onOpenChange: appShell.setGraphSheetOpen }}
        viewModel={{ isOpen: appShell.isGraphSheetOpen }}
      />
      <StatusBar
        viewModel={{
          agentConnectionStatus: appShell.agentConnectionStatus,
          currentFilePath: appShell.currentFilePath,
          monacoTheme: appShell.monacoTheme,
          reviewedFileCount: appShell.reviewedFileCount,
          totalFileCount: appShell.totalFileCount,
          workspaceStatus: appShell.workspaceStatus,
        }}
      />
    </main>
  );
}
