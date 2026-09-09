import type { HTMLAttributes, ReactNode } from 'react';
import type { VariantProps } from 'class-variance-authority';

import type { appBadgeVariants } from './AppBadge.styles';

export interface AppBadgeProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof appBadgeVariants> {
  children: ReactNode;
}
