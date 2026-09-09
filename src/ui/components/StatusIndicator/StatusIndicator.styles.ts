import { cva } from 'class-variance-authority';

export const statusIndicatorVariants = cva(
  'inline-flex items-center gap-1.5 text-xs text-muted-foreground',
  {
    variants: {
      tone: {
        neutral: '[&>span]:bg-muted-foreground/50',
        success: '[&>span]:bg-emerald-500',
        warning: '[&>span]:bg-warning',
        danger: '[&>span]:bg-destructive',
        info: '[&>span]:bg-brand',
      },
    },
    defaultVariants: {
      tone: 'neutral',
    },
  },
);
