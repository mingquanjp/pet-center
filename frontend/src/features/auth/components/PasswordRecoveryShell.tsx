import Link from "next/link"
import { ArrowLeft, Check, PawPrint, ShieldCheck } from "lucide-react"

export function PasswordRecoveryShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.82fr)]">
      <section className="flex min-h-screen flex-col px-6 py-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between">
          <Link className="flex items-center gap-2 font-bold text-petcenter-primary" href="/">
            <PawPrint className="h-7 w-7 fill-current" />
            <span className="text-xl">PetCenter</span>
          </Link>
          <Link
            className="flex items-center gap-2 text-sm font-semibold text-petcenter-text-secondary transition-colors hover:text-petcenter-primary"
            href="/login"
          >
            <ArrowLeft className="h-4 w-4" />
            Đăng nhập
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 items-center py-12">
          {children}
        </div>
      </section>

      <aside className="hidden min-h-screen border-l border-petcenter-border bg-petcenter-filter p-12 lg:flex lg:flex-col lg:justify-center">
        <div className="mx-auto w-full max-w-md">
          <span className="flex h-14 w-14 items-center justify-center rounded-card bg-petcenter-primary text-white shadow-sm">
            <ShieldCheck className="h-7 w-7" />
          </span>
          <h2 className="heading-md mt-7 text-petcenter-text">Khôi phục tài khoản an toàn</h2>
          <p className="body-lg mt-3 text-petcenter-text-secondary">
            Liên kết được gửi trực tiếp đến email của bạn và chỉ có hiệu lực trong thời gian giới hạn.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              "Token được mã hóa và chỉ sử dụng một lần",
              "Liên kết tự động hết hạn sau 30 phút",
              "Mật khẩu cũ không thay đổi cho đến khi hoàn tất",
            ].map((item) => (
              <li className="flex items-start gap-3 text-sm text-petcenter-text-secondary" key={item}>
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-petcenter-success-bg text-petcenter-success-text">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </main>
  )
}
