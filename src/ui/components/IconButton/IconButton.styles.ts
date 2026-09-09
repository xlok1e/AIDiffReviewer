import { cva } from 'class-variance-authority';

export const iconButtonVariants = cva(
  'inline-flex shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45',
  {
    variants: {
      size: {
        sm: 'size-7',
        md: 'size-8',
        rail: 'size-8',
      },
      tone: {
        quiet: 'bg-transparent p-0 shadow-none hover:bg-secondary hover:text-foreground',
        active:
          'relative bg-secondary p-0 text-brand shadow-none after:absolute after:-left-1 after:inset-y-1.5 after:w-0.5 after:rounded-full after:bg-brand hover:bg-secondary',
        primary: 'bg-primary p-0 text-primary-foreground shadow-none hover:bg-primary/90',
      },
    },
    defaultVariants: {
      size: 'sm',
      tone: 'quiet',
    },
  },
);
