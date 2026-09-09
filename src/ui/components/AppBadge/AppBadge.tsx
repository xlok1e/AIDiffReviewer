import type { ReactNode } from 'react';

import { Badge } from '@/ui/shadcn/badge';
import { mergeClassNames } from '@/shared/helpers/classNames';

import { appBadgeVariants } from './AppBadge.styles';
import type { AppBadgeProps } from './AppBadge.types';

export function AppBadge({ children, className, tone, ...props }: AppBadgeProps): ReactNode {
  return (
    <Badge className={mergeClassNames(appBadgeVariants({ tone }), className)} {...props}>
      {children}
    </Badge>
  );
}
