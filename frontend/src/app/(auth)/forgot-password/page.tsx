import type { Metadata } from "next"

import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm"
import { PasswordRecoveryShell } from "@/features/auth/components/PasswordRecoveryShell"

export const metadata: Metadata = {
  title: "Quên mật khẩu - PetCenter",
  description: "Yêu cầu liên kết đặt lại mật khẩu PetCenter",
}

export default function Page() {
  return (
    <PasswordRecoveryShell>
      <ForgotPasswordForm />
    </PasswordRecoveryShell>
  )
}
