import { useRef, useEffect } from "react"

/**
 * Hook that returns a ref to attach to an element at the bottom of a scrollable container.
 * Automatically scrolls to that element when dependencies change.
 */
export function useScrollToBottom<T extends HTMLElement = HTMLDivElement>(
  deps: unknown[] = []
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "instant" })
  }, deps)

  return ref
}
