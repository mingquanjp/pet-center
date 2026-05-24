import * as React from "react"
import { Metadata } from "next"
import { LoginForm } from "@/components/auth/LoginForm"
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel"

export const metadata: Metadata = {
  title: "Đăng nhập - PetCenter",
  description: "Đăng nhập vào hệ thống PetCenter",
}

export default function LoginPage() {
  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      {/* Left Side: Login Form */}
      <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center min-h-screen">
        <LoginForm />
      </div>

      {/* Right Side: Brand Illustration (Hidden on Mobile) */}
      <div className="hidden md:flex w-1/2 shrink-0 border-l border-petcenter-border">
        <AuthBrandPanel type="login" />
      </div>
    </div>
  )
}
