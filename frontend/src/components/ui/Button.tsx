import clsx from 'clsx'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ children, icon, className, variant = 'primary', ...props }: Props) {
  return (
    <button
      className={clsx(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/20 hover:bg-cyan-200',
        variant === 'secondary' && 'border border-white/15 bg-white/8 text-white hover:bg-white/12',
        variant === 'ghost' && 'text-slate-200 hover:bg-white/8',
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
