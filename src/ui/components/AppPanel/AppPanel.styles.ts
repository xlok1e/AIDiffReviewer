import { cva } from 'class-variance-authority';

export const appPanelVariants = cva('min-h-0 border-border', {
  variants: {
    tone: {
      plain: '',
      base: 'bg-panel',
      strong: 'bg-panel-strong',
      editor: 'bg-editor',
      activity: 'bg-activity',
    },
    edge: {
      none: '',
      right: 'border-r',
      left: 'border-l',
      bottom: 'border-b',
      top: 'border-t',
      x: 'border-x',
      y: 'border-y',
    },
  },
  defaultVariants: {
    tone: 'plain',
    edge: 'none',
  },
});
