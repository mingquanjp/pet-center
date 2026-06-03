"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { PawPrint } from "lucide-react"

import { cn } from "@/lib/utils"
import { useRouteLoading } from "../shared/RouteLoadingContext"
import { adminSidebarConfig } from "./admin-sidebar.config"

export function AdminSidebar() {
  const pathname = usePathname()
  const { startRouteLoading } = useRouteLoading()

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-50 hidden w-[260px] flex-col border-r border-petcenter-border bg-petcenter-sidebar py-6 md:flex md:w-[280px]">
      <div className="mb-8 flex shrink-0 items-center gap-3 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-petcenter-primary text-white">
          <PawPrint className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold leading-tight text-petcenter-primary">PetCenter</h1>
          <p className="text-sm leading-tight text-petcenter-text-secondary">{"Qu\u1ea3n tr\u1ecb vi\u00ean"}</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2">
        {adminSidebarConfig.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon

          return (
            <Link
              className={cn(
                "mx-2 my-1 flex items-center gap-3 rounded-control px-4 py-3 text-sm font-medium transition-colors duration-200 ease-in-out",
                isActive
                  ? "bg-petcenter-primary text-white shadow-card"
                  : "text-petcenter-text-secondary hover:bg-petcenter-card hover:text-petcenter-text"
              )}
              href={item.href}
              key={item.href}
              onClick={(event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
                startRouteLoading(item.href)
              }}
            >
              <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-petcenter-text-secondary")} />
              <span className="text-base">{item.title}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
