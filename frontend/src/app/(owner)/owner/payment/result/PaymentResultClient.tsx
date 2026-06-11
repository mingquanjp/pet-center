"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"

type PaymentResultContext = "spa" | "boarding"

const paymentResultContextKey = "pet_center_payment_result_context"

const paymentResultFallbackContext: PaymentResultContext = "spa"

const paymentResultRoutes = {
  spa: {
    bookingHref: "/owner/spa/booking",
    listHref: "/owner/spa",
    listLabel: "Về danh sách dịch vụ",
  },
  boarding: {
    bookingHref: "/owner/boarding/booking",
    listHref: "/owner/boarding",
    listLabel: "Về danh sách lưu trú",
  },
} satisfies Record<PaymentResultContext, { bookingHref: string; listHref: string; listLabel: string }>

function isPaymentResultContext(value: string | null): value is PaymentResultContext {
  return value === "spa" || value === "boarding"
}

function subscribePaymentResultContext() {
  return () => {}
}

function getPaymentResultContextSnapshot(): PaymentResultContext {
  if (typeof window === "undefined") {
    return paymentResultFallbackContext
  }

  const storedContext = window.sessionStorage.getItem(paymentResultContextKey)

  return isPaymentResultContext(storedContext) ? storedContext : paymentResultFallbackContext
}

export default function PaymentResultClient() {
  const searchParams = useSearchParams()
  const status = searchParams.get("status")
  const context = React.useSyncExternalStore(
    subscribePaymentResultContext,
    getPaymentResultContextSnapshot,
    () => paymentResultFallbackContext
  )

  const routes = paymentResultRoutes[context]

  if (status === "success") {
    return (
      <div className="w-full max-w-[460px] rounded-xl border border-[#B7D9D3] bg-white px-5 py-8 shadow-[0_12px_30px_rgba(0,0,0,0.12)] sm:px-8">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#E0F2F1] text-[#00796B] sm:size-[72px]">
            <Check className="size-9" aria-hidden="true" />
          </span>

          <h1 className="mt-5 text-2xl font-bold leading-8 tracking-[0] text-[#1B1C15] sm:text-[28px] sm:leading-9">
            Thanh toán thành công
          </h1>
          <p className="mt-2 max-w-[440px] break-words text-sm leading-6 text-[#3E4946] sm:text-base">
            Yêu cầu đã được gửi tới trung tâm và đang chờ xác nhận.
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              className="h-12 w-full rounded-lg bg-[#00796B] px-5 text-base font-semibold text-white hover:bg-[#00695C] sm:w-auto"
            >
              <Link href={routes.listHref}>
                {routes.listLabel}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 w-full rounded-lg border-[#6E7A76] px-5 text-base font-semibold text-[#1B1C15] hover:bg-[#FBFAEE] sm:w-auto"
            >
              <Link href={routes.listHref}>
                Tiếp tục xem trang
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Handle failed status
  if (status === "failed") {
    return (
      <div className="w-full max-w-[460px] rounded-xl border border-[#F8C7C7] bg-white px-5 py-8 shadow-[0_12px_30px_rgba(0,0,0,0.12)] sm:px-8">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#FFF5F5] text-[#C81E1E] sm:size-[72px]">
            <X className="size-9" aria-hidden="true" />
          </span>

          <h1 className="mt-5 text-2xl font-bold leading-8 tracking-[0] text-[#1B1C15] sm:text-[28px] sm:leading-9">
            Thanh toán thất bại
          </h1>
          <div className="mt-2 max-w-[440px] space-y-1 break-words text-sm leading-6 text-[#3E4946] sm:text-base">
            <p>Yêu cầu đặt dịch vụ chưa được ghi nhận. Vui lòng đặt lại nếu cần.</p>
            <p className="text-[13px] text-[#6E7A76]">Giao dịch không hoàn tất nên yêu cầu đã được hủy.</p>
          </div>

          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              className="h-12 w-full rounded-lg bg-[#00796B] px-5 text-base font-semibold text-white hover:bg-[#00695C] sm:w-auto"
            >
              <Link href={routes.bookingHref}>
                Đặt lại
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 w-full rounded-lg border-[#6E7A76] px-5 text-base font-semibold text-[#1B1C15] hover:bg-[#FBFAEE] sm:w-auto"
            >
              <Link href={routes.listHref}>
                {routes.listLabel}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Handle invalid or missing status
  return (
    <div className="w-full max-w-[460px] rounded-xl border border-[#E4E3D7] bg-white px-5 py-8 shadow-[0_12px_30px_rgba(0,0,0,0.12)] sm:px-8">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-2xl font-bold leading-8 tracking-[0] text-[#1B1C15] sm:text-[28px] sm:leading-9">
          Trạng thái không xác định
        </h1>
        <p className="mt-2 max-w-[440px] break-words text-sm leading-6 text-[#3E4946] sm:text-base">
          Không thể xác định kết quả giao dịch. Vui lòng kiểm tra lại dịch vụ trong danh sách của bạn.
        </p>

        <div className="mt-8 flex w-full justify-center">
          <Button
            asChild
            className="h-12 w-full rounded-lg bg-[#00796B] px-5 text-base font-semibold text-white hover:bg-[#00695C] sm:w-auto"
          >
            <Link href="/owner">
              Về trang tổng quan
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
