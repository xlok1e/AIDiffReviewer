import type { ReactNode } from 'react';

import { mergeClassNames } from '@/shared/helpers/classNames';

import type { FileRowProps } from './AppShellComponents.types';
import { FileStateBadges } from './FileStateBadges';
import { useFileTypeIcon } from './useFileTypeIcon';

const ROOT_FOLDER_PATH = '.';

// Directory prefix shown before the always-visible file name; empty for root-level files.
function getFolderPrefix(folderPath: string): string {
  return folderPath === ROOT_FOLDER_PATH ? '' : `${folderPath}/`;
}

export function FileRow({ file, isActive }: FileRowProps): ReactNode {
  const { Icon, colorClassName } = useFileTypeIcon({ file });

  return (
    <button
      className={mergeClassNames(
        'relative grid w-full grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-2.5 rounded-md px-2.5 py-2 text-left',
        'transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        isActive &&
          'bg-secondary after:absolute after:inset-y-1.5 after:left-0.5 after:w-0.5 after:rounded-full after:bg-brand',
      )}
      type='button'
    >
      <Icon className={colorClassName} size={15} />
      <span className='flex min-w-0 text-sm'>
        <span className='truncate text-muted-foreground'>{getFolderPrefix(file.folderPath)}</span>
        <span className='shrink-0 font-medium text-foreground'>{file.fileName}</span>
      </span>
      <FileStateBadges file={file} />
    </button>
  );
}
