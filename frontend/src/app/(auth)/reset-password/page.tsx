import type { Metadata } from "next"

import { PasswordRecoveryShell } from "@/features/auth/components/PasswordRecoveryShell"
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm"

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu - PetCenter",
  description: "Tạo mật khẩu mới cho tài khoản PetCenter",
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token = "" } = await searchParams

  return (
    <PasswordRecoveryShell>
      <ResetPasswordForm token={token} />
    </PasswordRecoveryShell>
  )
}
