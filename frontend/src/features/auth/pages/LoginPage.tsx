import * as React from "react"
import { LoginForm } from "@/features/auth/components/LoginForm"
import { AuthBrandPanel } from "@/features/auth/components/AuthBrandPanel"

export function LoginPage() {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-white md:h-dvh md:min-h-0 md:flex-row md:overflow-hidden">
      <div className="flex min-h-dvh w-full items-center justify-center px-6 py-10 sm:px-10 md:h-full md:min-h-0 md:w-1/2 md:overflow-y-auto md:px-12 lg:px-16">
        <LoginForm />
      </div>

      <div className="hidden h-full w-1/2 shrink-0 overflow-hidden border-l border-petcenter-border md:flex">
        <AuthBrandPanel type="login" />
      </div>
    </div>
  )
}
