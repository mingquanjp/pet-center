"use client"

import * as React from "react"
import Link from "next/link"
import { Mail, Lock, PawPrint } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { AuthTextInput } from "./AuthTextInput"
import { SocialLoginButton } from "./SocialLoginButton"
import { Label } from "@/components/ui/label"

export const LoginForm = () => {
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
        <h1 className="heading-lg text-petcenter-text mb-2">Đăng nhập</h1>
        <p className="body-md text-petcenter-text-secondary">Chào mừng bạn quay trở lại</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthTextInput
          id="email"
          label="Email"
          type="email"
          placeholder="Nhập địa chỉ email của bạn"
          icon={Mail}
          required
        />

        <AuthTextInput
          id="password"
          label="Mật khẩu"
          type="password"
          placeholder="Nhập mật khẩu"
          icon={Lock}
          required
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox id="remember-me" className="border-petcenter-border-strong data-[state=checked]:bg-petcenter-primary data-[state=checked]:border-petcenter-primary" />
            <Label
              htmlFor="remember-me"
              className="body-md text-petcenter-text-secondary cursor-pointer font-normal"
            >
              Ghi nhớ đăng nhập
            </Label>
          </div>
          <Link
            href="/forgot-password"
            className="label-md text-petcenter-primary hover:text-petcenter-primary-hover font-semibold transition-colors"
          >
            Quên mật khẩu?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full h-12 rounded-xl bg-petcenter-primary hover:bg-petcenter-primary-hover text-white label-md font-semibold"
        >
          Đăng nhập
        </Button>
      </form>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-petcenter-border-strong"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white label-md text-petcenter-text-secondary">
              Hoặc tiếp tục với
            </span>
          </div>
        </div>

        <div className="mt-6">
          <SocialLoginButton provider="google" />
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="body-md text-petcenter-text-secondary">
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="font-semibold text-petcenter-primary hover:text-petcenter-primary-hover transition-colors underline"
          >
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  )
}
