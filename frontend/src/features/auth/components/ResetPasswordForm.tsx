"use client"

import { useState } from "react"
import Link from "next/link"
import { AlertCircle, CheckCircle2, KeyRound, Loader2, LockKeyhole } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { authApi } from "@/features/auth/api/auth.api"
import { AuthTextInput } from "./AuthTextInput"

export function ResetPasswordForm({ token }: { token: string }) {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  if (!token) {
    return <InvalidResetLink />
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.")
      return
    }

    setIsSubmitting(true)
    try {
      await authApi.resetPassword({ token, newPassword, confirmPassword })
      setIsCompleted(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể đặt lại mật khẩu.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isCompleted) {
    return (
      <div className="w-full text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-petcenter-success-bg text-petcenter-success-text">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h1 className="heading-md mt-6 text-petcenter-text">Mật khẩu đã được cập nhật</h1>
        <p className="body-md mt-3 text-petcenter-text-secondary">
          Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ.
        </p>
        <Button asChild className="mt-7 h-12 w-full rounded-control bg-petcenter-primary font-semibold text-white hover:bg-petcenter-primary-hover">
          <Link href="/login">Đăng nhập</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full">
      <span className="flex h-12 w-12 items-center justify-center rounded-control bg-petcenter-primary/10 text-petcenter-primary">
        <KeyRound className="h-6 w-6" />
      </span>
      <h1 className="heading-lg mt-6 text-petcenter-text">Đặt lại mật khẩu</h1>
      <p className="body-md mt-2 text-petcenter-text-secondary">
        Tạo mật khẩu mới cho tài khoản của bạn.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <AuthTextInput
          autoComplete="new-password"
          icon={LockKeyhole}
          id="new-password"
          label="Mật khẩu mới"
          minLength={8}
          onChange={(event) => setNewPassword(event.target.value)}
          placeholder="Ít nhất 8 ký tự"
          required
          type="password"
          value={newPassword}
        />
        <AuthTextInput
          autoComplete="new-password"
          icon={LockKeyhole}
          id="confirm-password"
          label="Xác nhận mật khẩu mới"
          minLength={8}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Nhập lại mật khẩu mới"
          required
          type="password"
          value={confirmPassword}
        />
        <div className="rounded-control border border-petcenter-primary/15 bg-petcenter-primary/5 p-4">
          <p className="body-sm text-petcenter-text-secondary">
            Mật khẩu phải có ít nhất 8 ký tự và khác mật khẩu hiện tại.
          </p>
        </div>
        <Button
          className="h-12 w-full rounded-control bg-petcenter-primary font-semibold text-white hover:bg-petcenter-primary-hover"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
          Lưu mật khẩu mới
        </Button>
      </form>
    </div>
  )
}

function InvalidResetLink() {
  return (
    <div className="w-full text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-petcenter-danger-bg text-petcenter-danger-text">
        <AlertCircle className="h-8 w-8" />
      </span>
      <h1 className="heading-md mt-6 text-petcenter-text">Liên kết không hợp lệ</h1>
      <p className="body-md mt-3 text-petcenter-text-secondary">
        Liên kết đặt lại mật khẩu bị thiếu hoặc không đúng. Hãy yêu cầu một liên kết mới.
      </p>
      <Button asChild className="mt-7 h-12 w-full rounded-control bg-petcenter-primary font-semibold text-white hover:bg-petcenter-primary-hover">
        <Link href="/forgot-password">Yêu cầu liên kết mới</Link>
      </Button>
    </div>
  )
}
