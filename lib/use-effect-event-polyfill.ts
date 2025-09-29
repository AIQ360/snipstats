"use client"

import { useCallback, useRef } from "react"

// This is a polyfill for the useEffectEvent hook that's not yet available in React 18
export function useEffectEvent<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback)

  // Update the ref whenever the callback changes
  callbackRef.current = callback

  // Return a stable function that calls the latest callback
  return useCallback(((...args) => callbackRef.current(...args)) as T, [])
}
