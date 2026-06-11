import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const subscribe = React.useCallback((onStoreChange: () => void) => {
    if (typeof window === "undefined") {
      return () => undefined
    }

    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    mediaQuery.addEventListener("change", onStoreChange)
    return () => mediaQuery.removeEventListener("change", onStoreChange)
  }, [])

  return React.useSyncExternalStore(
    subscribe,
    () =>
      typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT,
    () => false
  )
}
