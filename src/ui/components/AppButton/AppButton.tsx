import type { ReactNode } from 'react';

import { Button } from '@/ui/shadcn/button';
import { mergeClassNames } from '@/shared/helpers/classNames';

import { appButtonVariants } from './AppButton.styles';
import type { AppButtonProps } from './AppButton.types';

export function AppButton({ children, className, tone, ...props }: AppButtonProps): ReactNode {
  return (
    <Button className={mergeClassNames(appButtonVariants({ tone }), className)} {...props}>
      {children}
    </Button>
  );
}
