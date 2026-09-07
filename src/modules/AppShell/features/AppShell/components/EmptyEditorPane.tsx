import { GitPullRequestArrow } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyEditorPaneProps {
  currentFilePath: string | null;
}

export function EmptyEditorPane({ currentFilePath }: EmptyEditorPaneProps): ReactNode {
  return (
    <section className='flex min-h-0 items-center justify-center bg-background'>
      <div className='grid max-w-sm justify-items-center gap-3 px-6 text-center text-sm text-muted-foreground'>
        <GitPullRequestArrow size={28} />
        <p>{currentFilePath ?? 'Diff viewer will appear after a repository is selected.'}</p>
      </div>
    </section>
  );
}
