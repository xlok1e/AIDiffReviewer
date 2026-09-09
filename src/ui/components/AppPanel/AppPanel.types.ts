import type { HTMLAttributes, ReactNode } from 'react';
import type { VariantProps } from 'class-variance-authority';

import type { appPanelVariants } from './AppPanel.styles';

export interface AppPanelProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof appPanelVariants> {
  children: ReactNode;
}
