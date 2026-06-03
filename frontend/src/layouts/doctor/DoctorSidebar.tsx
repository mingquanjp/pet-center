"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SquarePlus } from "lucide-react"

import { cn } from "@/lib/utils"
import { useRouteLoading } from "../shared/RouteLoadingContext"
import { doctorSidebarConfig } from "./doctor-sidebar.config"

export function DoctorSidebar() {
  const pathname = usePathname()
  const { startRouteLoading } = useRouteLoading()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] md:w-[280px] bg-petcenter-sidebar border-r border-petcenter-border hidden md:flex flex-col py-6 z-50">
      <div className="px-6 mb-8 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-full bg-petcenter-primary flex items-center justify-center text-white">
          <SquarePlus className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-petcenter-primary leading-tight">PetCare Center</h1>
          <p className="text-sm text-petcenter-text-secondary leading-tight">{"B\u00e1c s\u0129 th\u00fa y"}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto flex flex-col gap-1 px-2">
        {doctorSidebarConfig.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
                startRouteLoading(item.href)
              }}
              className={cn(
                "flex items-center gap-3 px-4 py-3 mx-2 my-1 rounded-control text-sm font-medium transition-colors duration-200 ease-in-out",
                isActive
                  ? "bg-petcenter-primary text-white shadow-card"
                  : "text-petcenter-text-secondary hover:text-petcenter-text hover:bg-petcenter-card"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-petcenter-text-secondary")} />
              <span className="text-base">{item.title}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
