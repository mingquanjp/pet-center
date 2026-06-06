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
import { NotificationBell } from "@/features/notifications/components/NotificationBell"
import { CurrentUserAvatar } from "@/features/profile/components/CurrentUserAvatar"

export function DoctorHeader() {
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
        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="w-10 h-10 rounded-full bg-petcenter-sidebar border border-petcenter-border-strong overflow-hidden cursor-pointer hover:opacity-90 transition-opacity ml-2">
              <CurrentUserAvatar />
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56 bg-white border border-petcenter-border-strong shadow-xl rounded-xl z-50"
          >
            <DropdownMenuLabel>{"T\u00e0i kho\u1ea3n b\u00e1c s\u0129"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/doctor/profile" className="cursor-pointer w-full">
                {"H\u1ed3 s\u01a1 c\u00e1 nh\u00e2n"}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/doctor/profile#security" className="cursor-pointer w-full">{"\u0110\u1ed5i m\u1eadt kh\u1ea9u"}</Link>
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
