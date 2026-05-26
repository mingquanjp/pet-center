import * as React from "react"
import { StaffHeader } from "./StaffHeader"
import { StaffSidebar } from "./StaffSidebar"

export function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full font-body-md antialiased overflow-hidden bg-petcenter-background text-petcenter-text">
      <StaffSidebar />
      <main className="md:ml-[280px] flex-1 flex flex-col h-screen overflow-hidden w-[calc(100%-280px)]">
        <StaffHeader />
        <div className="flex-1 overflow-y-scroll p-8 [scrollbar-gutter:stable]">
          {children}
        </div>
      </main>
    </div>
  )
}
