import { FolderOpen } from 'lucide-react'
import type { ReactNode } from 'react'

import type { ReviewWorkspaceStatus } from '@/shared/types/AppStatus.types'

import type { ReviewFileSummary } from '../../../AppShell.types'

interface FileSidebarProps {
  files: ReviewFileSummary[]
  workspaceStatus: ReviewWorkspaceStatus
}

export function FileSidebar({ files, workspaceStatus }: FileSidebarProps): ReactNode {
  const hasFiles = files.length > 0

  return (
    <aside className="min-h-0 border-r bg-muted/20">
      <div className="flex h-9 items-center justify-between border-b px-3 text-xs text-muted-foreground">
        <span>Changed files</span>
        <span>{files.length}</span>
      </div>
      <div className="flex h-full min-h-0 items-center justify-center px-6 text-center text-sm text-muted-foreground">
        {!hasFiles && (
          <div className="grid justify-items-center gap-3">
            <FolderOpen size={24} />
            <p>{workspaceStatus === 'empty' ? 'Open a git repository to start review.' : 'No files to review.'}</p>
          </div>
        )}
      </div>
    </aside>
  )
}
