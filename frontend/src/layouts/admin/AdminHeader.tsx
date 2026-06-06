"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { CurrentUserAvatar } from "@/features/profile/components/CurrentUserAvatar"


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
    <header className="h-18 bg-[#FBFAEE] border-b border-petcenter-border-strong flex justify-end items-center w-full px-6 py-2 shrink-0 z-10">
      <div className="flex items-center gap-4">


        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="ml-2 h-10 w-10 cursor-pointer overflow-hidden rounded-full border border-petcenter-border-strong bg-petcenter-sidebar transition-opacity hover:opacity-90">
              <CurrentUserAvatar />
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
            <DropdownMenuItem asChild>
              <Link className="w-full cursor-pointer" href="/admin/profile#security">{"\u0110\u1ed5i m\u1eadt kh\u1ea9u"}</Link>
            </DropdownMenuItem>
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
