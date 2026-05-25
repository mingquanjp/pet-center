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
        "flex-col justify-between overflow-hidden relative w-full h-full p-8 md:p-16",
        className
      )}
      style={{ background: "linear-gradient(180deg, #D8F3EE 0%, #FBFAF2 100%)" }}
    >
      <div className="flex flex-col h-full z-10 relative">
        {/* Logo Area */}
        <div className="flex items-center gap-3 mb-12">
          <PawPrint className="w-8 h-8 text-petcenter-primary fill-petcenter-primary" />
          <span className="font-bold text-2xl text-petcenter-primary">PetCenter</span>
        </div>

        {/* Text Content */}
        <div className="flex-grow flex flex-col justify-start max-w-lg">
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

        {/* Illustration Image */}
        <div className="mt-12 flex justify-center w-full">
          <div className="w-[420px] max-w-full drop-shadow-2xl flex justify-center">
            <Image
              src="/meo_auth.png"
              alt="Pet Illustration"
              width={420}
              height={420}
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        </div>

        {isLogin && (
          <div className="mt-12 text-sm text-petcenter-text-muted label-md">
            © 2024 PetCenter Management System.
          </div>
        )}
      </div>
    </div>
  )
}
