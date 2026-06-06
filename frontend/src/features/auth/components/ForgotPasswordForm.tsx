"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, Loader2, Mail, Send } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { authApi } from "@/features/auth/api/auth.api"
import { AuthTextInput } from "./AuthTextInput"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [submittedEmail, setSubmittedEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      await authApi.forgotPassword({ email: email.trim() })
      setSubmittedEmail(email.trim())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể gửi email đặt lại mật khẩu.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submittedEmail) {
    return (
      <div className="w-full text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-petcenter-success-bg text-petcenter-success-text">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h1 className="heading-md mt-6 text-petcenter-text">Kiểm tra email của bạn</h1>
        <p className="body-md mt-3 text-petcenter-text-secondary">
          Nếu <strong className="text-petcenter-text">{submittedEmail}</strong> được đăng ký tại PetCenter,
          bạn sẽ nhận được liên kết đặt lại mật khẩu.
        </p>
        <div className="mt-6 rounded-control border border-petcenter-border bg-petcenter-filter p-4 text-left">
          <p className="body-sm text-petcenter-text-secondary">
            Liên kết có hiệu lực trong 30 phút. Hãy kiểm tra cả thư mục Spam hoặc Quảng cáo nếu chưa thấy email.
          </p>
        </div>
        <Button
          className="mt-6 h-11 w-full rounded-control border-petcenter-border-strong"
          onClick={() => setSubmittedEmail("")}
          variant="outline"
        >
          Gửi lại bằng email khác
        </Button>
        <Link className="mt-5 inline-block text-sm font-semibold text-petcenter-primary hover:text-petcenter-primary-hover" href="/login">
          Quay lại đăng nhập
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full">
      <span className="flex h-12 w-12 items-center justify-center rounded-control bg-petcenter-primary/10 text-petcenter-primary">
        <Mail className="h-6 w-6" />
      </span>
      <h1 className="heading-lg mt-6 text-petcenter-text">Quên mật khẩu?</h1>
      <p className="body-md mt-2 text-petcenter-text-secondary">
        Nhập email đăng nhập. Chúng tôi sẽ gửi cho bạn một liên kết để tạo mật khẩu mới.
      </p>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <AuthTextInput
          autoComplete="email"
          icon={Mail}
          id="forgot-email"
          label="Email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Nhập địa chỉ email của bạn"
          required
          type="email"
          value={email}
        />
        <Button
          className="h-12 w-full rounded-control bg-petcenter-primary font-semibold text-white hover:bg-petcenter-primary-hover"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Gửi liên kết đặt lại
        </Button>
      </form>
    </div>
  )
}
