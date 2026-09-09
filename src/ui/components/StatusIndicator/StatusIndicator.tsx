import type { ReactNode } from 'react';

import { mergeClassNames } from '@/shared/helpers/classNames';

import { statusIndicatorVariants } from './StatusIndicator.styles';
import type { StatusIndicatorProps } from './StatusIndicator.types';

export function StatusIndicator({
  className,
  label,
  tone,
  ...props
}: StatusIndicatorProps): ReactNode {
  return (
    <span className={mergeClassNames(statusIndicatorVariants({ tone }), className)} {...props}>
      <span aria-hidden='true' className='size-1.5 rounded-full' />
      {label}
    </span>
  );
}
