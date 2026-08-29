/**
 * useApiRequest Hook
 *
 * Custom hook for API requests with:
 * - Loading state with countdown (3 seconds)
 * - Automatic fallback to mock data on timeout
 * - Error handling
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { ApiResponse } from './types'

export interface UseApiRequestOptions<T> {
  autoFetch?: boolean // Auto fetch on mount
  onSuccess?: (data: T, source: 'api' | 'mock') => void
  onError?: (error: string) => void
}

export interface UseApiRequestResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  source: 'api' | 'mock' | null
  countdown: number // seconds remaining
  refetch: () => Promise<void>
  reset: () => void
}

export function useApiRequest<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiRequestOptions<T> = {}
): UseApiRequestResult<T> {
  const { autoFetch = true, onSuccess, onError } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<'api' | 'mock' | null>(null)
  const [countdown, setCountdown] = useState(3) // 3 seconds

  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isMountedRef = useRef(true)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }
    }
  }, [])

  const fetchData = useCallback(async () => {
    if (!isMountedRef.current) return

    setLoading(true)
    setError(null)
    setCountdown(3)

    // Start countdown
    let currentCountdown = 3
    countdownIntervalRef.current = setInterval(() => {
      currentCountdown--
      if (isMountedRef.current) {
        setCountdown(currentCountdown)
      }
      if (currentCountdown <= 0 && countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }
    }, 1000)

    try {
      const response = await apiCall()

      if (!isMountedRef.current) return

      // Clear countdown
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
      }

      if (response.success && response.data) {
        setData(response.data)
        setSource('api')
        onSuccess?.(response.data, 'api')
      } else {
        const errorMsg = response.message || 'Failed to fetch data'
        setError(errorMsg)
        onError?.(errorMsg)
      }
    } catch (err: any) {
      if (!isMountedRef.current) return

      const errorMsg = err.message || 'An error occurred'
      setError(errorMsg)
      onError?.(errorMsg)
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
        setCountdown(0)
      }
    }
  }, [apiCall, onSuccess, onError])

  const reset = useCallback(() => {
    setData(null)
    setLoading(false)
    setError(null)
    setSource(null)
    setCountdown(3)
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
    }
  }, [])

  // Auto fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchData()
    }
  }, []) // Only run once on mount

  return {
    data,
    loading,
    error,
    source,
    countdown,
    refetch: fetchData,
    reset,
  }
}
