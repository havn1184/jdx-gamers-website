import * as React from 'react'
import { useCallback } from 'react'

import { cn } from './utils'

type InputProps = React.ComponentProps<'input'> & {
  /**
   * Khi focus vào input → tự động select toàn bộ giá trị để dễ sửa.
   * Mặc định true. Set false cho search/filter nếu không muốn select-all.
   */
  selectOnFocus?: boolean
}

function Input({ className, type, selectOnFocus = true, onFocus, ...props }: InputProps) {
  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    if (selectOnFocus) {
      e.target.select()
    }
    onFocus?.(e)
  }, [selectOnFocus, onFocus])

  return (
    <input
      type={type}
      data-slot='input'
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-300 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[1px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className
      )}
      onFocus={handleFocus}
      {...props}
    />
  )
}

export { Input }
