import * as React from "react"

import { StaffHeader } from "./StaffHeader"
import { StaffSidebar } from "./StaffSidebar"

export function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#fbfaee] font-sans text-[#1b1c15] antialiased">
      <StaffSidebar />
      <main className="flex min-h-screen flex-col md:ml-[256px]">
        <StaffHeader />
        <div className="flex-1 p-6">{children}</div>
      </main>
    </div>
  )
}
