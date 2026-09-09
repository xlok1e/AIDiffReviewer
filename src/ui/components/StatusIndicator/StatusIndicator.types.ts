import type { HTMLAttributes } from 'react';
import type { VariantProps } from 'class-variance-authority';

import type { statusIndicatorVariants } from './StatusIndicator.styles';

export interface StatusIndicatorProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof statusIndicatorVariants> {
  label: string;
}
