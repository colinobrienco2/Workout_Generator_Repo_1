import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "premium-interactive inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border text-sm font-medium transition-[color,background-color,border-color,box-shadow,transform] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[4px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'border-primary/85 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--primary)_90%,white)_0%,var(--primary)_58%,color-mix(in_oklab,var(--primary)_82%,black)_100%)] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_18px_26px_-18px_rgba(37,99,235,0.6),0_12px_20px_-16px_rgba(15,23,42,0.24)] hover:-translate-y-[1.5px] hover:brightness-[1.03] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_22px_32px_-18px_rgba(37,99,235,0.62),0_16px_22px_-16px_rgba(15,23,42,0.26)] active:scale-[0.995] active:brightness-[0.99] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_10px_14px_-14px_rgba(37,99,235,0.4)]',
        destructive:
          'border-destructive/80 bg-destructive text-white hover:-translate-y-px hover:bg-destructive/92 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'control-surface border-border/80 bg-background text-foreground hover:-translate-y-px hover:border-primary/25 hover:bg-white hover:text-foreground hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.88),0_18px_24px_-22px_rgba(15,23,42,0.3)] active:scale-[0.995] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.84),0_10px_14px_-18px_rgba(15,23,42,0.2)] dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'border-border/70 bg-secondary/95 text-secondary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] hover:-translate-y-px hover:bg-secondary hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.84),0_16px_24px_-22px_rgba(15,23,42,0.26)] active:translate-y-0',
        ghost:
          'border-transparent bg-transparent text-muted-foreground hover:border-primary/12 hover:bg-primary/6 hover:text-foreground dark:hover:bg-accent/50',
        link: 'border-transparent bg-transparent text-primary underline-offset-4 hover:text-primary/80 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2 has-[>svg]:px-3.5',
        sm: 'h-8 rounded-full gap-1.5 px-3.5 has-[>svg]:px-3',
        lg: 'h-11 rounded-xl px-6 has-[>svg]:px-4.5',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
