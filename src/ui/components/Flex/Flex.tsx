import type { ReactNode } from 'react';

import type { FlexProps } from './Flex.types';
import { useFlex } from './useFlex';

export function Flex({ children, ...props }: FlexProps): ReactNode {
  const flex = useFlex(props);

  return (
    <div className={flex.className} style={flex.style} {...flex.htmlProps}>
      {children}
    </div>
  );
}
