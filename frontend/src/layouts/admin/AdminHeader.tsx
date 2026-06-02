"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, Search, Settings, User } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authApi } from "@/features/auth/api/auth.api"
import { clearAuthSession } from "@/features/auth/api/auth-session"

export function AdminHeader() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } finally {
      clearAuthSession()
      router.replace("/")
      router.refresh()
    }
  }

  return (
    <header className="z-10 flex h-18 w-full shrink-0 items-center justify-between border-b border-petcenter-border-strong bg-[#FBFAEE] px-6 py-2">
      <div className="hidden items-center gap-2 text-sm text-petcenter-text-secondary sm:flex">
        <span>{"Qu\u1ea3n tr\u1ecb"}</span>
        <span>/</span>
        <span className="font-medium text-petcenter-text">{"T\u1ed5ng quan Dashboard"}</span>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        <label className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-petcenter-text-muted" />
          <input
            className="h-9 w-64 rounded-pill border border-petcenter-border-strong bg-petcenter-filter pl-9 pr-4 text-sm text-petcenter-text outline-none transition focus:border-petcenter-primary"
            placeholder={"T\u00ecm ki\u1ebfm..."}
            type="search"
          />
        </label>

        <button className="relative flex items-center justify-center rounded-full p-2 text-petcenter-text-secondary transition-colors hover:bg-petcenter-sidebar">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-petcenter-danger-text" />
        </button>

        <button className="flex items-center justify-center rounded-full p-2 text-petcenter-text-secondary transition-colors hover:bg-petcenter-sidebar">
          <Settings className="h-5 w-5" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="ml-1 h-10 w-10 cursor-pointer overflow-hidden rounded-full border border-petcenter-border-strong bg-petcenter-sidebar transition-opacity hover:opacity-90">
              <Avatar className="h-full w-full">
                <AvatarFallback className="bg-petcenter-primary text-white">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="z-50 w-56 rounded-xl border border-petcenter-border-strong bg-white shadow-xl"
          >
            <DropdownMenuLabel>{"T\u00e0i kho\u1ea3n qu\u1ea3n tr\u1ecb"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link className="w-full cursor-pointer" href="/admin/profile">
                {"H\u1ed3 s\u01a1 c\u00e1 nh\u00e2n"}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">{"\u0110\u1ed5i m\u1eadt kh\u1ea9u"}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600"
              onSelect={(event) => {
                event.preventDefault()
                void handleLogout()
              }}
            >
              {"\u0110\u0103ng xu\u1ea5t"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
