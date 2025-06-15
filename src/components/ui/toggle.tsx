import * as React from 'react';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import { toggleVariants } from './toggleUtils';
import type { VariantProps } from './toggleUtils';
import { cn } from '@/lib/utils';

export interface ToggleProps
  extends React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>,
    VariantProps<typeof toggleVariants> {}

const Toggle = React.forwardRef<React.ElementRef<typeof TogglePrimitive.Root>, ToggleProps>(
  ({ className, variant, size, ...props }, ref) => (
    <TogglePrimitive.Root
      ref={ref}
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
);

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle };
export type { VariantProps };
