'use client'

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

import { cn } from '@/lib/utils'

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input/90 focus-visible:border-ring focus-visible:ring-ring/40 dark:data-[state=unchecked]:bg-input/80 inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-primary/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.56),0_10px_16px_-16px_rgba(15,23,42,0.28)] transition-all outline-none focus-visible:ring-[4px] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 shadow-[0_1px_3px_rgba(15,23,42,0.22)] transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
