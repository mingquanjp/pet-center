"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, User } from "lucide-react"

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
        <button className="relative p-2 text-petcenter-text-secondary hover:bg-petcenter-sidebar rounded-full transition-all duration-150 flex items-center justify-center">
          <Bell className="w-5 h-5" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="w-10 h-10 rounded-full bg-petcenter-sidebar border border-petcenter-border-strong overflow-hidden cursor-pointer hover:opacity-90 transition-opacity ml-2">
              <Avatar className="w-full h-full">
                <AvatarFallback className="bg-petcenter-primary text-white">
                  <User className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
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
