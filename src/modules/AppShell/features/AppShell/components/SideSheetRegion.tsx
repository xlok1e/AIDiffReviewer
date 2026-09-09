import { GitBranch, Info } from 'lucide-react';
import type { ReactNode } from 'react';

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/ui/shadcn/sheet';
import { AppBadge, Flex, StatusIndicator } from '@/ui/components';

import type { SideSheetRegionProps } from './AppShellComponents.types';

export function SideSheetRegion({ actions, viewModel }: SideSheetRegionProps): ReactNode {
  const { isOpen } = viewModel;
  const { onOpenChange } = actions;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className='w-[360px] rounded-l-xl border-border bg-panel-strong p-0 sm:max-w-[420px]'>
        <SheetHeader className='border-b px-4 py-3 text-left'>
          <SheetTitle className='text-sm'>
            <Flex align='center' gap={8}>
              <GitBranch size={16} />
              Dependency graph
            </Flex>
          </SheetTitle>
          <SheetDescription>Changed file relationships and review order.</SheetDescription>
        </SheetHeader>
        <div className='grid gap-3 p-4'>
          <div className='rounded-lg border bg-editor p-3.5'>
            <Flex align='center' justify='spaceBetween'>
              <StatusIndicator label='Graph placeholder' tone='info' />
              <AppBadge tone='neutral'>1 hop</AppBadge>
            </Flex>
            <p className='mt-3 text-sm leading-6 text-muted-foreground'>
              Changed files, imports, and unexpected nodes share this panel.
            </p>
          </div>
          <Flex align='center' className='text-xs text-muted-foreground' gap={8}>
            <Info size={14} />
            Node focus will follow the active diff selection.
          </Flex>
        </div>
      </SheetContent>
    </Sheet>
  );
}
