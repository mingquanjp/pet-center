"use client"

import { useEffect, useState } from "react"
import { User } from "lucide-react"

import { authApi } from "@/features/auth/api/auth.api"
import { updateStoredUser } from "@/features/auth/api/auth-session"
import type { AuthUser } from "@/features/auth/types/auth.types"

export function CurrentUserAvatar() {
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const readStoredUser = () => {
      const storedUser = localStorage.getItem("currentUser")
      if (!storedUser) {
        setUser(null)
        return
      }

      try {
        setUser(JSON.parse(storedUser) as AuthUser)
      } catch {
        setUser(null)
      }
    }

    const timer = window.setTimeout(() => {
      readStoredUser()
      void authApi.me().then((currentUser) => {
        setUser(currentUser)
        updateStoredUser(currentUser)
      }).catch(() => {
        // Keep the last valid session value when the refresh request is unavailable.
      })
    }, 0)
    window.addEventListener("auth-user-updated", readStoredUser)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener("auth-user-updated", readStoredUser)
    }
  }, [])

  return (
    <div className="flex h-full w-full items-center justify-center bg-petcenter-primary text-sm font-bold text-white">
      {user?.fullName ? getInitials(user.fullName) : <User className="h-5 w-5" />}
    </div>
  )
}

function getInitials(fullName: string) {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part.charAt(0).toLocaleUpperCase("vi-VN"))
    .join("")
}
