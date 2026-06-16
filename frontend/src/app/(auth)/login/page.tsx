import * as React from "react"
import { Metadata } from "next"
import { LoginPage } from "@/features/auth/pages/LoginPage"

export const metadata: Metadata = {
  title: "Đăng nhập - PetCenter",
  description: "Đăng nhập vào hệ thống PetCenter",
}

export default function LoginPageRoute() {
  return <LoginPage />
}
