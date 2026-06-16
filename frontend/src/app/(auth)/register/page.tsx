import * as React from "react"
import { Metadata } from "next"
import { RegisterPage } from "@/features/auth/pages/RegisterPage"

export const metadata: Metadata = {
  title: "Tạo tài khoản - PetCenter",
  description: "Tạo tài khoản mới tại PetCenter",
}

export default function RegisterPageRoute() {
  return <RegisterPage />
}
