import * as React from "react"
import { OwnerSidebar } from "./OwnerSidebar"
import { OwnerHeader } from "./OwnerHeader"
import { RouteLoadingContent, RouteLoadingProvider } from "../shared/RouteLoadingContext"

export function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteLoadingProvider>
      <div className="flex h-screen w-full font-body-md antialiased overflow-hidden bg-petcenter-background text-petcenter-text">
        <OwnerSidebar />
        <main className="md:ml-[280px] flex-1 flex flex-col h-screen overflow-hidden w-[calc(100%-280px)]">
          <OwnerHeader />
          <RouteLoadingContent>{children}</RouteLoadingContent>
        </main>
      </div>
    </RouteLoadingProvider>
  )
}

