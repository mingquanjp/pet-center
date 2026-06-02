import * as React from "react"

import { RouteLoadingContent, RouteLoadingProvider } from "../shared/RouteLoadingContext"
import { DoctorHeader } from "./DoctorHeader"
import { DoctorSidebar } from "./DoctorSidebar"

export function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteLoadingProvider>
      <div className="flex h-screen w-full font-body-md antialiased overflow-hidden bg-petcenter-background text-petcenter-text">
        <DoctorSidebar />
        <main className="md:ml-[280px] flex-1 flex flex-col h-screen overflow-hidden w-[calc(100%-280px)]">
          <DoctorHeader />
          <RouteLoadingContent>{children}</RouteLoadingContent>
        </main>
      </div>
    </RouteLoadingProvider>
  )
}
