/**
 * useDebounce Hook
 * 
 * Custom hook để debounce một giá trị
 * Giúp giảm số lần re-render hoặc API calls khi user đang typing
 */

import { useState, useEffect } from 'react'

/**
 * Hook debounce một giá trị
 * @param value - Giá trị cần debounce
 * @param delay - Thời gian delay (ms)
 * @returns Giá trị đã được debounce
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set timeout để update giá trị sau delay
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup function: clear timeout nếu value thay đổi trước khi delay hết
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
