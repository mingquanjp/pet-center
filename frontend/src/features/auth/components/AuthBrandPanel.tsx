import * as React from "react"
import { PawPrint, Check } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface AuthBrandPanelProps {
  type: "login" | "register"
  className?: string
}

export const AuthBrandPanel = ({ type, className }: AuthBrandPanelProps) => {
  const isLogin = type === "login"

  const headline = isLogin
    ? "Đồng hành cùng bạn trong hành trình chăm sóc thú cưng"
    : "Chăm sóc thú cưng dễ dàng và toàn diện"

  const description = isLogin
    ? "Theo dõi lịch khám, sức khỏe, dịch vụ spa và lưu trú cho thú cưng một cách thuận tiện."
    : "Quản lý hồ sơ thú cưng, đặt lịch khám, sử dụng dịch vụ và theo dõi sức khỏe mọi lúc mọi nơi."

  const benefits = isLogin
    ? [
        "Theo dõi sức khỏe",
        "Quản lý lịch hẹn",
        "Nhận thông báo nhắc lịch",
      ]
    : [
        "Quản lý hồ sơ thú cưng",
        "Đặt lịch khám nhanh chóng",
        "Theo dõi dịch vụ và sức khỏe",
      ]

  return (
    <div
      className={cn(
        "relative h-full min-h-0 w-full overflow-hidden p-8 md:p-10 xl:p-14",
        className
      )}
      style={{ background: "linear-gradient(180deg, #D8F3EE 0%, #FBFAF2 100%)" }}
    >
      <div className="relative z-10 grid h-full min-h-0 grid-rows-[auto_auto_minmax(0,1fr)_auto] gap-y-6">
        <div className="flex items-center gap-3">
          <PawPrint className="w-8 h-8 text-petcenter-primary fill-petcenter-primary" />
          <span className="font-bold text-2xl text-petcenter-primary">PetCenter</span>
        </div>

        <div className="max-w-lg">
          <h1 className="font-bold text-4xl leading-tight text-petcenter-text">
            {headline}
          </h1>
          <p className="mt-4 text-petcenter-text-secondary body-lg">
            {description}
          </p>

          {/* Bullet List */}
          <ul className="mt-8 space-y-4">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-4 text-petcenter-text-secondary">
                <div className="w-6 h-6 rounded-full bg-petcenter-primary/10 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-petcenter-primary" strokeWidth={3} />
                </div>
                <span className="font-medium body-md">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex min-h-0 w-full items-center justify-center overflow-hidden">
          <div className="flex h-full max-h-[420px] w-full max-w-[420px] items-center justify-center drop-shadow-2xl">
            <Image
              src="/meo_auth.png"
              alt="Pet Illustration"
              width={420}
              height={420}
              className="h-full min-h-0 w-full object-contain"
              priority
            />
          </div>
        </div>

        <div className="min-h-4 text-sm text-petcenter-text-muted label-md">
          {isLogin ? "© 2026 PetCenter Management System." : null}
        </div>
      </div>
    </div>
  )
}
