"use client"

import * as React from "react"
import Link from "next/link"
import { User, Mail, Smartphone, Lock, PawPrint } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { AuthTextInput } from "./AuthTextInput"
import { SocialLoginButton } from "./SocialLoginButton"
import { Label } from "@/components/ui/label"

export const RegisterForm = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: implement logic
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Mobile Logo (Hidden on Desktop) */}
      <div className="md:hidden flex items-center gap-2 mb-8 text-petcenter-primary">
        <PawPrint className="w-8 h-8 fill-current" />
        <span className="font-semibold text-xl">PetCenter</span>
      </div>

      <div className="mb-8">
        <h1 className="heading-lg text-petcenter-text mb-2">Tạo tài khoản</h1>
        <p className="body-md text-petcenter-text-secondary">Vui lòng điền thông tin để tạo tài khoản mới</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthTextInput
          id="fullname"
          label="Họ và tên"
          type="text"
          placeholder="Nhập họ và tên của bạn"
          icon={User}
          required
        />

        <AuthTextInput
          id="email"
          label="Email"
          type="email"
          placeholder="ví dụ: tenban@email.com"
          icon={Mail}
          required
        />

        <AuthTextInput
          id="phone"
          label="Số điện thoại"
          type="tel"
          placeholder="Nhập số điện thoại"
          icon={Smartphone}
          required
        />

        <AuthTextInput
          id="password"
          label="Mật khẩu"
          type="password"
          placeholder="Tạo mật khẩu"
          icon={Lock}
          required
        />

        <AuthTextInput
          id="confirm_password"
          label="Xác nhận mật khẩu"
          type="password"
          placeholder="Nhập lại mật khẩu"
          icon={Lock}
          required
        />

        <div className="flex items-start gap-3 pt-2">
          <Checkbox id="terms" className="mt-1 border-petcenter-border-strong data-[state=checked]:bg-petcenter-primary data-[state=checked]:border-petcenter-primary" />
          <Label
            htmlFor="terms"
            className="body-md text-petcenter-text-secondary font-normal cursor-pointer leading-tight"
          >
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
          className="w-full h-12 rounded-xl bg-petcenter-primary hover:bg-petcenter-primary-hover text-white label-md font-semibold mt-4"
        >
          Đăng ký
        </Button>
      </form>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-petcenter-border-strong"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white label-md text-petcenter-text-secondary">
              Hoặc đăng ký bằng
            </span>
          </div>
        </div>

        <div className="mt-6">
          <SocialLoginButton provider="google" />
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="body-md text-petcenter-text-secondary">
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            className="font-semibold text-petcenter-primary hover:text-petcenter-primary-hover transition-colors underline"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}
