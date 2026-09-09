import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import type { VariantProps } from 'class-variance-authority';

import type { flexVariants } from './Flex.styles';

export interface FlexProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'style'>, VariantProps<typeof flexVariants> {
  children?: ReactNode;
  gap?: number;
  style?: CSSProperties;
}
