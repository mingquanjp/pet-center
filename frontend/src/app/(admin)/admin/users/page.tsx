import { Suspense } from "react"

import { LoadingState } from "@/components/ui/loading-state"
import { AdminUsersPage } from "@/features/users/pages/admin/AdminUsersPage"

export default function UsersPage() {
  return (
    <Suspense
      fallback={
        <LoadingState
          description="Vui lòng đợi trong khi hệ thống tải danh sách tài khoản."
          title="Đang tải người dùng..."
        />
      }
    >
      <AdminUsersPage />
    </Suspense>
  )
}
