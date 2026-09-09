import { cva } from 'class-variance-authority';

export const appBadgeVariants = cva(
  'inline-flex h-5 items-center rounded-md px-1.5 font-mono text-[11px] leading-none tabular-nums',
  {
    variants: {
      tone: {
        neutral:
          'border-transparent bg-secondary text-muted-foreground shadow-none hover:bg-secondary',
        success:
          'border-transparent bg-emerald-500/15 text-emerald-400 shadow-none hover:bg-emerald-500/15',
        warning: 'border-transparent bg-warning/15 text-warning shadow-none hover:bg-warning/15',
        danger:
          'border-transparent bg-destructive/15 text-destructive shadow-none hover:bg-destructive/15',
        info: 'border-transparent bg-brand/15 text-brand shadow-none hover:bg-brand/15',
      },
    },
    defaultVariants: {
      tone: 'neutral',
    },
  },
);
