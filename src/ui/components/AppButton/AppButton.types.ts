import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { VariantProps } from 'class-variance-authority';

import type { appButtonVariants } from './AppButton.styles';

export interface AppButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof appButtonVariants> {
  children: ReactNode;
}
