"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Lock, Mail, PawPrint, Smartphone, User } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { roleHomePath } from "@/constants/roles"
import { authApi } from "@/features/auth/api/auth.api"
import { saveAuthSession } from "@/features/auth/api/auth-session"
import { AuthTextInput } from "./AuthTextInput"
import { SocialLoginButton } from "./SocialLoginButton"

export const RegisterForm = () => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const fullName = String(formData.get("fullName") ?? "")
    const email = String(formData.get("email") ?? "")
    const phoneNumber = String(formData.get("phoneNumber") ?? "")
    const password = String(formData.get("password") ?? "")
    const confirmPassword = String(formData.get("confirmPassword") ?? "")
    const acceptedTerms = formData.get("terms") === "on"

    if (password.length < 8) {
      toast.error("Mật khẩu phải có ít nhất 8 ký tự")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp")
      return
    }

    if (!/^[0-9+() .-]{8,20}$/.test(phoneNumber)) {
      toast.error("Số điện thoại không hợp lệ")
      return
    }

    if (!acceptedTerms) {
      toast.error("Vui lòng đồng ý điều khoản sử dụng")
      return
    }

    try {
      setIsSubmitting(true)
      const auth = await authApi.register({ fullName, email, phoneNumber, password })
      saveAuthSession(auth)
      toast.success("Đăng ký thành công")
      router.replace(roleHomePath[auth.user.role])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đăng ký thất bại")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="md:hidden flex items-center gap-2 mb-8 text-petcenter-primary">
        <PawPrint className="w-8 h-8 fill-current" />
        <span className="font-semibold text-xl">PetCenter</span>
      </div>

      <div className="mb-8">
        <h1 className="heading-lg text-petcenter-text mb-2">Tạo tài khoản</h1>
        <p className="body-md text-petcenter-text-secondary">Vui lòng điền thông tin để tạo tài khoản mới</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthTextInput id="fullname" name="fullName" label="Họ và tên" type="text" placeholder="Nhập họ và tên của bạn" icon={User} required />
        <AuthTextInput id="email" name="email" label="Email" type="email" placeholder="vi du: tenban@email.com" icon={Mail} required />
        <AuthTextInput id="phone" name="phoneNumber" label="Số điện thoại" type="tel" placeholder="Nhập số điện thoại" icon={Smartphone} required />
        <AuthTextInput id="password" name="password" label="Mật khẩu" type="password" placeholder="Tạo mật khẩu" icon={Lock} required />
        <AuthTextInput id="confirm_password" name="confirmPassword" label="Xác nhận mật khẩu" type="password" placeholder="Nhập lại mật khẩu" icon={Lock} required />

        <div className="flex items-start gap-3 pt-2">
          <Checkbox id="terms" name="terms" className="mt-1 border-petcenter-border-strong data-[state=checked]:bg-petcenter-primary data-[state=checked]:border-petcenter-primary" />
          <Label htmlFor="terms" className="body-md text-petcenter-text-secondary font-normal cursor-pointer leading-tight">
            Tôi đồng ý với{" "}
            <Link href="#" className="text-petcenter-primary hover:underline font-medium">
              Điều khoản sử dụng
            </Link>{" "}
            và{" "}
            <Link href="#" className="text-petcenter-primary hover:underline font-medium">
              Chính sách bảo mật
            </Link>
          </Label>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 rounded-xl bg-petcenter-primary hover:bg-petcenter-primary-hover text-white label-md font-semibold mt-4"
        >
          {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
        </Button>
      </form>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-petcenter-border-strong"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white label-md text-petcenter-text-secondary">Hoặc đăng ký bằng</span>
          </div>
        </div>

        <div className="mt-6">
          <SocialLoginButton provider="google" />
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="body-md text-petcenter-text-secondary">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-semibold text-petcenter-primary hover:text-petcenter-primary-hover transition-colors underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}
