import * as React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Xác thực - PetCenter",
  description: "Đăng nhập hoặc tạo tài khoản PetCenter",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white text-petcenter-text font-sans">
      {children}
    </div>
  )
}
