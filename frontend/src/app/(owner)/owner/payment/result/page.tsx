import { Suspense } from "react"
import PaymentResultClient from "./PaymentResultClient"

export default function PaymentResultPage() {
  return (
    <div className="flex w-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="flex h-[400px] items-center justify-center text-sm text-[#3E4946]">Đang tải kết quả xử lý...</div>}>
        <PaymentResultClient />
      </Suspense>
    </div>
  )
}
