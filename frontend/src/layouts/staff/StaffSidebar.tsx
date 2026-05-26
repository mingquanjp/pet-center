"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Headphones } from "lucide-react"

import { cn } from "@/lib/utils"
import { staffSidebarConfig } from "./staff-sidebar.config"

export function StaffSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-[256px] flex-col justify-between border-r border-[#bdc9c5] bg-[#f5f4e8] py-2 pr-px md:flex">
      <div className="w-full">
        <div className="pb-4">
          <div className="w-full p-6">
            <div className="whitespace-nowrap text-2xl font-bold leading-8 tracking-[-0.24px] text-[#005e53]">
              PetCare
            </div>
            <div className="pt-1">
              <div className="whitespace-nowrap text-xs font-medium uppercase leading-4 tracking-[0.6px] text-[#3e4946]">
                MANAGEMENT SYSTEM
              </div>
            </div>
          </div>
        </div>

        <nav className="flex h-[840px] w-full flex-col gap-2">
          {staffSidebarConfig.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon

            return (
              <div key={item.href} className="w-full px-2">
                <Link
                  href={item.href}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-[12px] px-4 py-3 text-xs leading-4 transition-colors",
                    isActive
                      ? "bg-[#00796b] font-bold text-[#a1feec]"
                      : "font-medium text-[#3e4946] hover:bg-white"
                  )}
                >
                  <Icon className={cn("size-5 shrink-0", isActive ? "text-[#a1feec]" : "text-[#3e4946]")} />
                  <span className="whitespace-nowrap">{item.title}</span>
                </Link>
              </div>
            )
          })}
        </nav>
      </div>

      <div className="min-h-9 w-full pb-4">
        <div className="w-full px-4">
          <button className="flex w-full items-center justify-center gap-2 rounded-[12px] border border-[#bdc9c5] bg-[#fbfaee] px-[17px] py-[9px] text-xs font-medium leading-4 text-[#005e53]">
            <Headphones className="h-[13.5px] w-[15px]" />
            <span className="whitespace-nowrap">Hỗ trợ kỹ thuật</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
