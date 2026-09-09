import type { ReactNode } from 'react';

import { mergeClassNames } from '@/shared/helpers/classNames';

import { appPanelVariants } from './AppPanel.styles';
import type { AppPanelProps } from './AppPanel.types';

export function AppPanel({ children, className, tone, edge, ...props }: AppPanelProps): ReactNode {
  return (
    <div className={mergeClassNames(appPanelVariants({ tone, edge }), className)} {...props}>
      {children}
    </div>
  );
}
