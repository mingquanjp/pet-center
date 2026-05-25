import * as React from "react"
import { RegisterForm } from "@/features/auth/components/RegisterForm"
import { AuthBrandPanel } from "@/features/auth/components/AuthBrandPanel"

export function RegisterPage() {
  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      {/* Left Side: Brand Illustration (Hidden on Mobile) */}
      <div className="hidden md:flex w-1/2 shrink-0 border-r border-petcenter-border">
        <AuthBrandPanel type="register" />
      </div>

      {/* Right Side: Registration Form */}
      <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center min-h-screen">
        <RegisterForm />
      </div>
    </div>
  )
}
