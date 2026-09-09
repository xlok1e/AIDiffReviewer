import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { TooltipContentProps } from '@radix-ui/react-tooltip';
import type { VariantProps } from 'class-variance-authority';

import type { iconButtonVariants } from './IconButton.styles';

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof iconButtonVariants> {
  label: string;
  icon: ReactNode;
  tooltipSide?: TooltipContentProps['side'];
}
