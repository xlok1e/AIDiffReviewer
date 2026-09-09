import { FolderOpen } from 'lucide-react';
import type { ReactNode } from 'react';

import { AppPanel, AppSearchInput, Flex } from '@/ui/components';

import type { FileSidebarProps } from './AppShellComponents.types';
import { FileRow } from './FileRow';
import { useFileSidebar } from './useFileSidebar';

export function FileSidebar({ viewModel }: FileSidebarProps): ReactNode {
  const { files, workspaceStatus } = viewModel;
  const hasFiles = files.length > 0;
  const { filteredFiles, searchQuery, setSearchQuery } = useFileSidebar({ files });
  const hasMatches = filteredFiles.length > 0;

  return (
    <AppPanel className='flex flex-col h-full' edge='right' tone='base'>
      <div className='flex min-h-0 flex-1 flex-col overflow-y-auto p-2'>
        <Flex align='center' className='mb-2 px-2 py-1.5 text-xs text-muted-foreground' gap={8}>
          <FolderOpen size={14} />
          <span className='truncate'>Changed files</span>
        </Flex>
        {hasFiles && (
          <AppSearchInput
            aria-label='Search changed files'
            containerClassName='mb-2'
            onChange={setSearchQuery}
            placeholder='Search files'
            value={searchQuery}
          />
        )}
        {hasFiles && hasMatches && (
          <div className='grid gap-1'>
            {filteredFiles.map((file, index) => (
              <FileRow file={file} isActive={index === 0} key={file.id} />
            ))}
          </div>
        )}
        {hasFiles && !hasMatches && (
          <p className='px-2 py-4 text-center text-sm text-muted-foreground'>
            No files match &ldquo;{searchQuery}&rdquo;.
          </p>
        )}
        {!hasFiles && (
          <div className='flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center text-sm text-muted-foreground'>
            <FolderOpen size={24} />
            <p>
              {workspaceStatus === 'error'
                ? 'Repository state is unavailable.'
                : 'No files to review.'}
            </p>
          </div>
        )}
      </div>
    </AppPanel>
  );
}
