"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Lock, Mail, PawPrint } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { roleHomePath } from "@/constants/roles"
import { authApi } from "@/features/auth/api/auth.api"
import { saveAuthSession } from "@/features/auth/api/auth-session"
import { AuthTextInput } from "./AuthTextInput"

export const LoginForm = () => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = String(formData.get("email") ?? "")
    const password = String(formData.get("password") ?? "")

    try {
      setIsSubmitting(true)
      const auth = await authApi.login({ email, password })
      saveAuthSession(auth)
      toast.success("Đăng nhập thành công")
      router.replace(roleHomePath[auth.user.role])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đăng nhập thất bại")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[440px]">
      <div className="mb-10 flex items-center gap-2 text-petcenter-primary md:hidden">
        <PawPrint className="w-8 h-8 fill-current" />
        <span className="font-semibold text-xl">PetCenter</span>
      </div>

      <div className="mb-9">
        <h1 className="heading-lg mb-2 text-petcenter-text">Đăng nhập</h1>
        <p className="body-md text-petcenter-text-secondary">Chào mừng bạn quay trở lại PetCenter</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthTextInput
          id="email"
          name="email"
          label="Email"
          type="email"
          placeholder="Nhập địa chỉ email của bạn"
          icon={Mail}
          required
        />

        <AuthTextInput
          id="password"
          name="password"
          label="Mật khẩu"
          type="password"
          placeholder="Nhập mật khẩu"
          icon={Lock}
          required
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox id="remember-me" className="border-petcenter-border-strong data-[state=checked]:bg-petcenter-primary data-[state=checked]:border-petcenter-primary" />
            <Label htmlFor="remember-me" className="body-md text-petcenter-text-secondary cursor-pointer font-normal">
              Ghi nhớ đăng nhập
            </Label>
          </div>
          <Link href="/forgot-password" className="label-md text-petcenter-primary hover:text-petcenter-primary-hover font-semibold transition-colors">
            Quên mật khẩu?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 rounded-xl bg-petcenter-primary hover:bg-petcenter-primary-hover text-white label-md font-semibold"
        >
          {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </form>

      <div className="mt-10 border-t border-petcenter-border pt-6 text-center">
        <p className="body-md text-petcenter-text-secondary">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-semibold text-petcenter-primary hover:text-petcenter-primary-hover transition-colors underline">
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  )
}
