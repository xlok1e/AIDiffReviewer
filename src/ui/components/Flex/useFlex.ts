import type { CSSProperties } from 'react';

import { mergeClassNames } from '@/shared/helpers/classNames';

import { flexVariants } from './Flex.styles';
import type { FlexProps } from './Flex.types';

interface FlexViewModel {
  className: string;
  htmlProps: Omit<
    FlexProps,
    | 'align'
    | 'children'
    | 'className'
    | 'cursor'
    | 'direction'
    | 'fullWidth'
    | 'gap'
    | 'grow'
    | 'justify'
    | 'style'
    | 'wrap'
  >;
  style: CSSProperties | undefined;
}

// Builds stable Tailwind classes and runtime gap styles for the Flex wrapper.
export function useFlex(options: FlexProps): FlexViewModel {
  const {
    align,
    children,
    className,
    cursor,
    direction,
    fullWidth,
    gap,
    grow,
    justify,
    style,
    wrap,
    ...htmlProps
  } = options;

  const nextStyle: CSSProperties | undefined =
    gap === undefined ? style : { ...style, gap: `${gap}px` };
  void children;

  return {
    className: mergeClassNames(
      flexVariants({ align, cursor, direction, fullWidth, grow, justify, wrap }),
      className,
    ),
    htmlProps,
    style: nextStyle,
  };
}
