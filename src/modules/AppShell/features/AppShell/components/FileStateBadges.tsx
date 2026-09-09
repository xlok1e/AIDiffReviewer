import type { ReactNode } from 'react';

import { AppBadge, Flex } from '@/ui/components';

import type { FileStateBadgesProps } from './FileStateBadges.types';
import { useFileStateBadges } from './useFileStateBadges';

export function FileStateBadges({ file }: FileStateBadgesProps): ReactNode {
  const badges = useFileStateBadges({ file });
  // const ChangeIcon = badges.changeBadge.icon;
  const StatusIcon = badges.statusBadge.icon;

  return (
    <Flex align='center' gap={6} justify='flexEnd'>
      <AppBadge
        aria-label={`Review status: ${badges.statusBadge.label}`}
        className='h-6 w-6 justify-center px-0'
        title={badges.statusBadge.label}
        tone={badges.statusBadge.tone}
      >
        <StatusIcon size={16} />
      </AppBadge>
      {/* <AppBadge
        className='gap-1.5'
        title={`File ${badges.changeBadge.label}`}
        tone={badges.changeBadge.tone}
      >
        <ChangeIcon size={12} />
        <span>{badges.changeBadge.label}</span>
      </AppBadge> */}
    </Flex>
  );
}
