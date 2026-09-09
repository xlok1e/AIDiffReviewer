import type { ReactNode } from 'react';

import { Button } from '@/ui/shadcn/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/ui/shadcn/tooltip';
import { mergeClassNames } from '@/shared/helpers/classNames';

import { iconButtonVariants } from './IconButton.styles';
import type { IconButtonProps } from './IconButton.types';

export function IconButton({
  className,
  icon,
  label,
  size,
  tone,
  tooltipSide = 'right',
  ...props
}: IconButtonProps): ReactNode {
  return (
    <TooltipProvider delayDuration={250}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-label={label}
            className={mergeClassNames(iconButtonVariants({ size, tone }), className)}
            type='button'
            {...props}
          >
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent side={tooltipSide}>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
