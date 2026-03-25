import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
  {
    variants: {
      variant: {
        default: 'bg-brand-100 text-brand-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-amber-100 text-amber-800',
        danger: 'bg-red-100 text-red-800',
        info: 'bg-sky-100 text-sky-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode
  className?: string
}

export function Badge({ variant, className, children }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)}>
      {children}
    </span>
  )
}
