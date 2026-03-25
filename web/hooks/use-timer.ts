'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseTimerOptions {
  duration: number // in ms
  onTick?: (remaining: number) => void
  onComplete?: () => void
  autoStart?: boolean
}

export function useTimer({ duration, onTick, onComplete, autoStart = false }: UseTimerOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const remainingRef = useRef(duration)
  const isRunningRef = useRef(false)

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    isRunningRef.current = false
  }, [])

  const start = useCallback(() => {
    stop()
    remainingRef.current = duration
    isRunningRef.current = true

    intervalRef.current = setInterval(() => {
      remainingRef.current -= 100
      onTick?.(Math.max(0, remainingRef.current))

      if (remainingRef.current <= 0) {
        stop()
        onComplete?.()
      }
    }, 100)
  }, [duration, onTick, onComplete, stop])

  const reset = useCallback(() => {
    stop()
    remainingRef.current = duration
    onTick?.(duration)
  }, [duration, onTick, stop])

  useEffect(() => {
    if (autoStart) start()
    return stop
  }, [autoStart, start, stop])

  return { start, stop, reset, isRunning: isRunningRef.current }
}
