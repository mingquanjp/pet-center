"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import { LoadingState } from "@/components/ui/loading-state"

type RouteLoadingContextValue = {
  isRouteLoading: boolean
  startRouteLoading: (href: string) => void
}

type PendingRoute = {
  from: string
  to: string
}

const RouteLoadingContext = React.createContext<RouteLoadingContextValue | null>(null)

export function RouteLoadingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [pendingRoute, setPendingRoute] = React.useState<PendingRoute | null>(null)

  const startRouteLoading = React.useCallback(
    (href: string) => {
      if (href === pathname || pathname.startsWith(`${href}/`)) return

      setPendingRoute({ from: pathname, to: href })
    },
    [pathname]
  )

  const isRouteLoading =
    pendingRoute !== null &&
    pathname === pendingRoute.from &&
    pathname !== pendingRoute.to &&
    !pathname.startsWith(`${pendingRoute.to}/`)
  const value = React.useMemo(() => ({ isRouteLoading, startRouteLoading }), [isRouteLoading, startRouteLoading])

  return <RouteLoadingContext.Provider value={value}>{children}</RouteLoadingContext.Provider>
}

export function useRouteLoading() {
  const context = React.useContext(RouteLoadingContext)

  if (!context) {
    throw new Error("useRouteLoading must be used within RouteLoadingProvider")
  }

  return context
}

export function RouteLoadingContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isRouteLoading } = useRouteLoading()

  return (
    <div className="flex-1 overflow-y-scroll p-8 [scrollbar-gutter:stable]">
      {isRouteLoading ? (
        <LoadingState description="Vui lòng chờ trong giây lát." title="Đang chuyển trang..." />
      ) : (
        <React.Fragment key={pathname}>{children}</React.Fragment>
      )}
    </div>
  )
}
