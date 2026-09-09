import { cva } from 'class-variance-authority';

export const flexVariants = cva('flex', {
  variants: {
    direction: {
      row: 'flex-row',
      column: 'flex-col',
    },
    align: {
      center: 'items-center',
      flexStart: 'items-start',
      flexEnd: 'items-end',
      stretch: 'items-stretch',
    },
    justify: {
      center: 'justify-center',
      flexStart: 'justify-start',
      flexEnd: 'justify-end',
      spaceBetween: 'justify-between',
      spaceAround: 'justify-around',
      spaceEvenly: 'justify-evenly',
    },
    grow: {
      true: 'grow',
      false: '',
    },
    fullWidth: {
      true: 'w-full',
      false: '',
    },
    wrap: {
      true: 'flex-wrap',
      false: 'flex-nowrap',
    },
    cursor: {
      pointer: 'cursor-pointer',
      auto: 'cursor-auto',
    },
  },
  defaultVariants: {
    direction: 'row',
    align: 'stretch',
    justify: 'flexStart',
    grow: false,
    fullWidth: false,
    wrap: false,
    cursor: 'auto',
  },
});
