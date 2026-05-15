import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[4px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,background-color,border-color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-primary/18 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--primary)_88%,white)_0%,var(--primary)_100%)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_12px_18px_-18px_rgba(37,99,235,0.45)] [a&]:hover:brightness-[1.02]',
        secondary:
          'border-primary/14 bg-[linear-gradient(180deg,rgba(96,165,250,0.17)_0%,rgba(37,99,235,0.09)_100%)] text-primary/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.76),0_10px_18px_-20px_rgba(37,99,235,0.28)] [a&]:hover:bg-primary/[0.14]',
        destructive:
          'border-destructive/20 bg-destructive/90 text-white [a&]:hover:bg-destructive/86 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border-border/80 bg-white/76 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] [a&]:hover:border-primary/18 [a&]:hover:bg-primary/[0.06] [a&]:hover:text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
