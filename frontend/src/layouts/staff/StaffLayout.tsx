import * as React from "react";

import { StaffHeader } from "./StaffHeader";
import { StaffSidebar } from "./StaffSidebar";

export function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-petcenter-background text-petcenter-text antialiased">
      <StaffSidebar />
      <main className="flex h-screen w-full flex-1 flex-col overflow-hidden md:ml-[280px] md:w-[calc(100%-280px)]">
        <StaffHeader />
        <div className="flex-1 overflow-y-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
