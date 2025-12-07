import React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input type={type} className={cn('', className)} ref={ref} {...props} />
  );
});

Input.displayName = 'Input';
