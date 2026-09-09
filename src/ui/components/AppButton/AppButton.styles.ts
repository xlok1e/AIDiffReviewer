import { cva } from 'class-variance-authority';

export const appButtonVariants = cva(
  'inline-flex h-8 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      tone: {
        primary: 'bg-primary text-primary-foreground shadow-none hover:bg-primary/90',
        secondary:
          'bg-secondary text-secondary-foreground shadow-none hover:bg-secondary/80',
        ghost:
          'bg-transparent text-muted-foreground shadow-none hover:bg-secondary hover:text-foreground',
      },
    },
    defaultVariants: {
      tone: 'secondary',
    },
  },
);
