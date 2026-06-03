import * as React from "react"

import { RouteLoadingContent, RouteLoadingProvider } from "../shared/RouteLoadingContext"
import { AdminHeader } from "./AdminHeader"
import { AdminSidebar } from "./AdminSidebar"

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteLoadingProvider>
      <div className="flex h-screen w-full overflow-hidden bg-petcenter-background font-body-md text-petcenter-text antialiased">
        <AdminSidebar />
        <main className="flex h-screen w-[calc(100%-280px)] flex-1 flex-col overflow-hidden md:ml-[280px]">
          <AdminHeader />
          <RouteLoadingContent>{children}</RouteLoadingContent>
        </main>
      </div>
    </RouteLoadingProvider>
  )
}
