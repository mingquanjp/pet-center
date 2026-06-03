import { Suspense } from "react"

import { AdminUsersPage } from "@/features/users/pages/admin/AdminUsersPage"

export default function UsersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-petcenter-border bg-white p-8 text-center shadow-card">
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-petcenter-border border-t-petcenter-primary" />
          <h2 className="title-md text-petcenter-text">Đang tải người dùng...</h2>
          <p className="body-md mt-1 text-petcenter-text-secondary">
            Vui lòng đợi trong khi hệ thống tải danh sách tài khoản.
          </p>
        </div>
      }
    >
      <AdminUsersPage />
    </Suspense>
  )
}
