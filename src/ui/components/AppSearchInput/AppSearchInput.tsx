import { Search } from 'lucide-react';
import type { ReactNode } from 'react';

import { mergeClassNames } from '@/shared/helpers/classNames';
import { Input } from '@/ui/shadcn/input';

import type { AppSearchInputProps } from './AppSearchInput.types';

export function AppSearchInput({
  className,
  containerClassName,
  ...props
}: AppSearchInputProps): ReactNode {
  return (
    <div className={mergeClassNames('relative', containerClassName)}>
      <Search
        aria-hidden='true'
        className='pointer-events-none absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground'
      />
      <Input
        className={mergeClassNames(
          'h-8 appearance-none rounded-md border-border bg-secondary/40 pl-8 py-0 text-xs shadow-none placeholder:text-muted-foreground focus-visible:bg-secondary/60',
          className,
        )}
        type='text'
        {...props}
      />
    </div>
  );
}
