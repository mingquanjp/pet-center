# HƯỚNG DẪN KIẾN TRÚC FRONTEND PETCARE / VETCLINIC MANAGER

> **Frontend:** Next.js App Router  
> **Backend:** Express.js  
> **Mục tiêu tài liệu:** Thống nhất kiến trúc folder, cách chia feature, cách đặt tên file, cách gọi API, cách phân quyền, cách viết component để toàn bộ team code theo cùng một chuẩn.

---

## 1. Tư duy kiến trúc tổng thể

Dự án PetCenter có nhiều vai trò và nhiều nghiệp vụ khác nhau. Vì vậy frontend không nên chia folder đơn giản kiểu `pages`, `components`, `services` rồi nhét mọi thứ vào chung. Cách đó ban đầu nhanh nhưng càng làm càng rối.

Kiến trúc đề xuất dùng 3 lớp chính:

```txt
app/        -> Định nghĩa routing theo Next.js, chia theo role.
layouts/    -> Layout riêng cho từng role: sidebar, header, khung màn hình.
features/   -> Chia theo domain nghiệp vụ: thú cưng, lịch hẹn, spa, lưu trú, hóa đơn...
```

Công thức dễ nhớ:

```txt
Route chia theo role.
Feature chia theo nghiệp vụ.
Bên trong feature chỉ chia role khi UI hoặc flow khác nhau.
```

Ví dụ:

```txt
app/(staff)/staff/boarding/page.tsx
```

là route của nhân viên vào màn lưu trú.

Nhưng UI chính của màn đó nằm trong:

```txt
features/boarding/pages/staff/StaffBoardingListPage.tsx
```

Như vậy `app/` chỉ làm nhiệm vụ routing, còn nghiệp vụ thật nằm trong `features/`.

---

## 2. Các role chính trong hệ thống

Dự án nên thống nhất 4 role chính:

```txt
OWNER   -> Chủ nuôi
STAFF   -> Nhân viên trung tâm
DOCTOR  -> Bác sĩ
ADMIN   -> Quản trị viên
```

### 2.1. OWNER / Chủ nuôi

Chủ nuôi là người dùng dịch vụ. Họ có thể:

```txt
- Xem thú cưng của mình
- Đặt lịch hẹn
- Xem hồ sơ sức khỏe
- Đặt dịch vụ spa
- Đặt lưu trú
- Xem hóa đơn
- Nhận thông báo qua icon chuông trên header
- Cập nhật hồ sơ cá nhân thông qua menu avatar trên header
```

Sidebar gợi ý:

```txt
1. Tổng quan
2. Thú cưng
3. Lịch hẹn
4. Sổ sức khỏe
5. Dịch vụ spa
6. Lưu trú
7. Hóa đơn
```

Thông báo **không đặt trong sidebar**. Thông báo nằm trên header dưới dạng icon chuông.

Hồ sơ cá nhân của Chủ nuôi cũng **không đặt trong sidebar**. Hồ sơ cá nhân nằm trong menu avatar trên header. Khi click avatar/tên người dùng, mở dropdown gồm:

```txt
- Hồ sơ cá nhân
- Đổi mật khẩu
- Đăng xuất
```

Click “Hồ sơ cá nhân” thì điều hướng tới route:

```txt
/owner/profile
```

### 2.2. STAFF / Nhân viên

Nhân viên xử lý vận hành tại trung tâm. Họ có thể:

```txt
- Xem dashboard công việc trong ngày
- Tiếp nhận và xử lý lịch hẹn
- Tạo / tra cứu / cập nhật hồ sơ thú cưng cơ bản
- Tiếp nhận và hoàn tất dịch vụ spa
- Xác nhận lưu trú, check-in, cập nhật chăm sóc, check-out
- Xem và xác nhận thanh toán hóa đơn tại quầy
- Nhận thông báo qua icon chuông trên header
```

Sidebar chốt cho nhân viên:

```txt
1. Tổng quan
2. Lịch hẹn
3. Hồ sơ thú cưng
4. Dịch vụ spa
5. Lưu trú
6. Hóa đơn
```

Lưu ý: Nhân viên **không** sửa bệnh án, chẩn đoán, đơn thuốc hoặc kết quả khám chuyên môn. Những phần đó thuộc bác sĩ.

### 2.3. DOCTOR / Bác sĩ

Bác sĩ xử lý nghiệp vụ chuyên môn y tế. Họ có thể:

```txt
- Xem lịch khám được phân công
- Khám bệnh
- Cập nhật hồ sơ sức khỏe
- Ghi chẩn đoán
- Kê đơn thuốc
- Xem lịch sử điều trị
- Nhận thông báo qua icon chuông trên header
```

Sidebar gợi ý:

```txt
1. Tổng quan
2. Lịch khám
3. Khám bệnh
4. Hồ sơ bệnh án
5. Đơn thuốc
6. Lịch sử điều trị
```

Thông báo **không đặt trong sidebar**. Thông báo nằm trên header dưới dạng icon chuông.

### 2.4. ADMIN / Quản trị viên

Admin không nên làm việc vận hành hằng ngày như check-in lưu trú hay tiếp nhận spa. Admin tập trung vào quản lý hệ thống.

Admin có thể:

```txt
- Xem thống kê tổng quan
- Quản lý tài khoản
- Quản lý nhân viên
- Quản lý bác sĩ
- Quản lý cấu hình hệ thống nếu có
```

Sidebar gợi ý:

```txt
1. Tổng quan
2. Quản lý tài khoản
3. Nhân viên
4. Bác sĩ
5. Cài đặt
```

---

## 2.5. Quy tắc thông báo trên header

Thông báo là chức năng hệ thống dùng chung cho mọi role, vì vậy **không đặt trong sidebar**.

Sidebar chỉ chứa module nghiệp vụ chính theo từng role. Thông báo đặt trên header dưới dạng icon chuông.

Header của mỗi role nên có:

```txt
- Search
- Icon trợ giúp
- Icon thông báo
- Avatar người dùng
- Tên người dùng
- Role hiện tại
- User menu khi click avatar/tên người dùng
```

User menu trên avatar dùng cho các thao tác tài khoản cá nhân, không đưa vào sidebar. Ví dụ với Chủ nuôi:

```txt
Click avatar Nguyễn Văn A
→ Mở dropdown
→ Hồ sơ cá nhân
→ /owner/profile
```

Khi click icon thông báo:

```txt
1. Mở Notification Drawer hoặc Notification Dropdown.
2. Hiển thị danh sách thông báo gần đây.
3. Có nút "Xem tất cả".
4. Click "Xem tất cả" thì chuyển tới route notifications tương ứng theo role.
```

Route notifications vẫn tồn tại nhưng **không hiện trong sidebar**:

```txt
/owner/notifications
/staff/notifications
/doctor/notifications
/admin/notifications
```

Cách tổ chức code cho thông báo:

```txt
features/notifications/
├── pages/
│   ├── owner/
│   ├── staff/
│   ├── doctor/
│   └── admin/
├── components/
│   ├── NotificationButton.tsx
│   ├── NotificationDrawer.tsx
│   ├── NotificationDropdown.tsx
│   ├── NotificationList.tsx
│   └── NotificationItem.tsx
├── api/
├── hooks/
├── types/
└── constants/
```

Component `NotificationButton` được gắn trong `AppHeader`, không gắn trong sidebar.

---

## 3. Cấu trúc folder tổng thể

Đây là cấu trúc folder frontend hoàn chỉnh đề xuất:

```txt
src/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx
│   │
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── forgot-password/
│   │       └── page.tsx
│   │
│   ├── (owner)/
│   │   └── owner/
│   │       ├── layout.tsx
│   │       ├── dashboard/
│   │       │   └── page.tsx
│   │       ├── pets/
│   │       │   ├── page.tsx
│   │       │   ├── [petId]/
│   │       │   │   └── page.tsx
│   │       │   └── [petId]/edit/
│   │       │       └── page.tsx
│   │       ├── appointments/
│   │       │   ├── page.tsx
│   │       │   └── create/
│   │       │       └── page.tsx
│   │       ├── health-records/
│   │       │   └── page.tsx
│   │       ├── spa/
│   │       │   ├── page.tsx
│   │       │   ├── booking/
│   │       │   │   └── page.tsx
│   │       │   └── [spaRequestId]/
│   │       │       └── page.tsx
│   │       ├── boarding/
│   │       │   ├── page.tsx
│   │       │   ├── booking/
│   │       │   │   └── page.tsx
│   │       │   └── [boardingId]/
│   │       │       └── page.tsx
│   │       ├── invoices/
│   │       │   ├── page.tsx
│   │       │   └── [invoiceId]/
│   │       │       └── page.tsx
│   │       ├── notifications/
│   │       │   └── page.tsx
│   │       └── profile/
│   │           └── page.tsx
│   │
│   ├── (staff)/
│   │   └── staff/
│   │       ├── layout.tsx
│   │       ├── dashboard/
│   │       │   └── page.tsx
│   │       ├── appointments/
│   │       │   ├── page.tsx
│   │       │   └── [appointmentId]/
│   │       │       └── page.tsx
│   │       ├── pets/
│   │       │   ├── page.tsx
│   │       │   ├── create/
│   │       │   │   └── page.tsx
│   │       │   ├── create-owner/
│   │       │   │   └── page.tsx
│   │       │   ├── [petId]/
│   │       │   │   └── page.tsx
│   │       │   └── [petId]/edit/
│   │       │       └── page.tsx
│   │       ├── spa/
│   │       │   ├── page.tsx
│   │       │   ├── create/
│   │       │   │   └── page.tsx
│   │       │   └── [spaRequestId]/
│   │       │       └── page.tsx
│   │       ├── boarding/
│   │       │   ├── page.tsx
│   │       │   ├── create/
│   │       │   │   └── page.tsx
│   │       │   └── [boardingId]/
│   │       │       └── page.tsx
│   │       ├── invoices/
│   │       │   ├── page.tsx
│   │       │   └── [invoiceId]/
│   │       │       └── page.tsx
│   │       ├── notifications/
│   │       │   └── page.tsx
│   │       └── profile/
│   │           └── page.tsx
│   │
│   ├── (doctor)/
│   │   └── doctor/
│   │       ├── layout.tsx
│   │       ├── dashboard/
│   │       │   └── page.tsx
│   │       ├── schedule/
│   │       │   └── page.tsx
│   │       ├── examinations/
│   │       │   ├── page.tsx
│   │       │   └── [appointmentId]/
│   │       │       └── page.tsx
│   │       ├── medical-records/
│   │       │   ├── page.tsx
│   │       │   └── [recordId]/
│   │       │       └── page.tsx
│   │       ├── prescriptions/
│   │       │   ├── page.tsx
│   │       │   └── create/
│   │       │       └── page.tsx
│   │       ├── notifications/
│   │       │   └── page.tsx
│   │       └── profile/
│   │           └── page.tsx
│   │
│   └── (admin)/
│       └── admin/
│           ├── layout.tsx
│           ├── dashboard/
│           │   └── page.tsx
│           ├── users/
│           │   ├── page.tsx
│           │   ├── create/
│           │   │   └── page.tsx
│           │   └── [userId]/
│           │       └── page.tsx
│           ├── staff/
│           │   └── page.tsx
│           ├── doctors/
│           │   └── page.tsx
│           ├── notifications/
│           │   └── page.tsx
│           ├── profile/
│           │   └── page.tsx
│           └── settings/
│               └── page.tsx
│
├── layouts/
│   ├── AppHeader.tsx
│   ├── OwnerLayout.tsx
│   ├── StaffLayout.tsx
│   ├── DoctorLayout.tsx
│   ├── AdminLayout.tsx
│   ├── OwnerSidebar.tsx
│   ├── StaffSidebar.tsx
│   ├── DoctorSidebar.tsx
│   └── AdminSidebar.tsx
│
├── components/
│   ├── ui/ %shadcn/ui primitives.
│   ├── common/ %component chung tự viết
│   ├── forms/
│   ├── modals/
│   ├── drawers/
│   └── feedback/
│
├── features/
│   ├── auth/
│   ├── users/
│   ├── pets/
│   ├── appointments/
│   ├── spa/
│   ├── boarding/
│   ├── invoices/
│   ├── notifications/
│   ├── profile/
│   ├── medical-records/
│   └── prescriptions/
│
├── lib/
│   ├── api-client.ts
│   ├── env.ts
│   ├── auth.ts
│   ├── permissions.ts
│   ├── query-client.ts
│   ├── date.ts
│   ├── money.ts
│   └── utils.ts
│
├── hooks/
│   ├── useDebounce.ts
│   ├── useDisclosure.ts
│   ├── usePagination.ts
│   ├── useCurrentUser.ts
│   └── useUploadFile.ts
│
├── stores/
│   ├── auth.store.ts
│   ├── ui.store.ts
│   └── notification.store.ts
│
├── constants/
│   ├── routes.ts
│   ├── roles.ts
│   ├── status.ts
│   ├── sidebar.ts
│   ├── query-keys.ts
│   └── permissions.ts
│
├── types/
│   ├── api.ts
│   ├── common.ts
│   ├── auth.ts
│   ├── user.ts
│   └── media.ts
│
├── styles/
│   └── theme.css
│
└── middleware.ts
```

---

## 4. Mô tả nhiệm vụ từng folder cấp cao

## 4.1. `src/app/`

### Nhiệm vụ

`app/` là nơi khai báo route của Next.js App Router. Mỗi folder trong `app/` tương ứng với một URL hoặc nhóm route.

Quy tắc:

```txt
- page.tsx chỉ nên gọi page component từ features.
- Không viết nhiều logic nghiệp vụ trong page.tsx.
- Không gọi API trực tiếp phức tạp trong page.tsx nếu logic đó thuộc feature.
```

Ví dụ đúng:

```tsx
// src/app/(staff)/staff/boarding/page.tsx

import { StaffBoardingListPage } from '@/features/boarding/pages/staff/StaffBoardingListPage';

export default function Page() {
  return <StaffBoardingListPage />;
}
```

Ví dụ không nên:

```tsx
// Không nên để page.tsx dài hàng trăm dòng
export default function Page() {
  const [data, setData] = useState([]);
  const [modal, setModal] = useState(false);
  // gọi API, render card, xử lý modal, validate form...
}
```

Lý do: `page.tsx` sẽ rất khó đọc và khó test.

---

## 4.2. `src/layouts/`

### Nhiệm vụ

Chứa layout riêng cho từng role. Layout bao gồm:

```txt
- Sidebar
- Header
- Main content wrapper
- Padding chuẩn
- Background chuẩn
- Layout responsive nếu có
```

Ví dụ:

```tsx
// src/layouts/StaffLayout.tsx

import { StaffSidebar } from './StaffSidebar';
import { AppHeader } from './AppHeader';

export function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F6EA]">
      <StaffSidebar />
      <main className="pl-70">
        <AppHeader role="staff" />
        <div className="px-10 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
```

### Header dùng chung

`AppHeader.tsx` là header dùng chung cho các role. Header nên chứa:

```txt
- Ô tìm kiếm
- Icon trợ giúp
- Icon thông báo
- Avatar
- Tên người dùng
- Role hiện tại
```

Ví dụ cấu trúc header:

```tsx
// src/layouts/AppHeader.tsx

import { NotificationButton } from '@/features/notifications/components/NotificationButton';

export function AppHeader({ role }: { role: 'owner' | 'staff' | 'doctor' | 'admin' }) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white px-8">
      <div>{/* Search input */}</div>

      <div className="flex items-center gap-4">
        {/* Help button */}
        <NotificationButton role={role} />
        {/* User avatar + name + role */}
      </div>
    </header>
  );
}
```

Lưu ý: `NotificationButton` nằm ở header, không nằm trong sidebar.

### Khi nào sửa folder này?

Chỉ sửa `layouts/` khi:

```txt
- Thay đổi sidebar
- Thay đổi header
- Thay đổi padding toàn trang
- Thay đổi layout chung của một role
```

Không sửa `layouts/` khi chỉ đổi nội dung một màn như Lưu trú hay Spa.

---

## 4.3. `src/components/`

### Nhiệm vụ

`src/components/` chứa các component dùng chung toàn hệ thống.

Component trong folder này **không được gắn chặt với nghiệp vụ cụ thể** như lưu trú, spa, hóa đơn, thú cưng, lịch hẹn. Những component có nghiệp vụ cụ thể phải đặt trong `features/`.

Dự án sử dụng **shadcn/ui** làm nền tảng UI primitive. Vì vậy, các component nguyên tử như Button, Input, Select, Dialog, Sheet, Card, Badge... sẽ được sinh ra trong `src/components/ui/`.

Cấu trúc:

```txt
components/
├── ui/          -> shadcn/ui primitives
├── common/      -> component chung tự viết, có thể dùng shadcn/ui bên trong
├── forms/       -> wrapper form field dùng chung
├── modals/      -> modal base/shared, dùng Dialog của shadcn/ui
├── drawers/     -> drawer base/shared, dùng Sheet của shadcn/ui
└── feedback/    -> loading, error, empty, toast
```

---

### `components/ui/`

Chứa UI primitive dùng chung toàn hệ thống.

Dự án ưu tiên dùng **shadcn/ui** cho các UI primitive như:

```txt
Button
Input
Select
Textarea
Badge
Card
Tabs
Dialog
Sheet
DropdownMenu
Popover
Avatar
Calendar
Table
Pagination
Skeleton
Alert
Separator
Sonner / Toast
```

Trong dự án này, `src/components/ui/` là nơi chứa các component do shadcn/ui sinh ra.

Ví dụ:

```txt
components/ui/button.tsx
components/ui/input.tsx
components/ui/select.tsx
components/ui/textarea.tsx
components/ui/dialog.tsx
components/ui/sheet.tsx
components/ui/dropdown-menu.tsx
components/ui/card.tsx
components/ui/badge.tsx
components/ui/tabs.tsx
components/ui/avatar.tsx
components/ui/calendar.tsx
components/ui/table.tsx
components/ui/skeleton.tsx
components/ui/alert.tsx
components/ui/separator.tsx
components/ui/sonner.tsx
```

Quy tắc bắt buộc:

```txt
- Không tự build lại Button, Input, Select, Dialog, Sheet nếu shadcn/ui đã có.
- Không đưa logic nghiệp vụ vào `components/ui/`.
- Không để `components/ui/` biết gì về boarding, spa, invoice, pet, appointment.
- Chỉ custom component shadcn/ui bằng className, variant, size hoặc wrapper.
- Nếu cần variant dùng chung toàn hệ thống, bổ sung trực tiếp vào component shadcn/ui tương ứng.
- Nếu chỉ cần style riêng cho một nghiệp vụ, tạo wrapper trong feature, không sửa component UI primitive chỉ vì một màn.
```

Ví dụ đúng:

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ExampleCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin lưu trú</CardTitle>
      </CardHeader>

      <CardContent>
        <Badge>Đang lưu trú</Badge>
        <Button>Lưu thay đổi</Button>
      </CardContent>
    </Card>
  );
}
```

Ví dụ sai:

```tsx
// Sai: Không đưa logic nghiệp vụ vào components/ui/button.tsx

export function Button({ boardingStatus }) {
  if (boardingStatus === 'pending') {
    return <button>Xác nhận lưu trú</button>;
  }

  return <button>Xem</button>;
}
```

Nếu cần button nghiệp vụ, đặt trong feature:

```txt
features/boarding/components/staff/ConfirmBoardingButton.tsx
features/invoices/components/staff/ConfirmPaymentButton.tsx
features/spa/components/staff/AcceptSpaButton.tsx
```

Lưu ý quan trọng:

```txt
components/ui/       -> UI primitive từ shadcn/ui
components/common/   -> component chung tự viết, có thể dùng shadcn/ui bên trong
features/...         -> component nghiệp vụ theo domain
```

---

### `components/common/`

Chứa component dùng chung nhưng có tính layout hoặc hiển thị nhẹ.

Các component trong `components/common/` được phép dùng shadcn/ui bên trong, nhưng **không được chứa logic nghiệp vụ phức tạp**.

Ví dụ component nên đặt ở đây:

```txt
PageHeader
SearchInput
FilterBar
EmptyState
StatusBadge
MoneyText
DateText
ConfirmDialog
RoleGuard
SectionHeader
InfoRow
DataToolbar
```

Ví dụ:

```tsx
// src/components/common/PageHeader.tsx

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
```

Ví dụ dùng shadcn/ui bên trong common component:

```tsx
// src/components/common/EmptyState.tsx

import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border bg-white p-8 text-center">
      <h3 className="font-semibold">{title}</h3>

      {description && (
        <p className="mt-2 text-sm text-muted-foreground">
          {description}
        </p>
      )}

      {actionLabel && (
        <Button className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
```

Lưu ý:

```txt
- `components/common/StatusBadge.tsx` có thể là badge chung.
- Nhưng nếu badge chỉ dùng cho lưu trú thì nên đặt trong `features/boarding/components/shared/BoardingStatusBadge.tsx`.
- Nếu badge chỉ dùng cho hóa đơn thì đặt trong `features/invoices/components/shared/InvoiceStatusBadge.tsx`.
```

---

### `components/forms/`

Chứa các wrapper form field dùng chung toàn hệ thống.

Folder này dùng để bọc `react-hook-form` + shadcn/ui, giúp team viết form thống nhất.

Ví dụ component:

```txt
FormField
FormInput
FormSelect
FormTextarea
FormDatePicker
FormUpload
FormRadioGroup
FormCheckbox
FormErrorMessage
```

Ví dụ:

```tsx
// src/components/forms/FormInput.tsx

import { Input } from '@/components/ui/input';

interface FormInputProps {
  label: string;
  error?: string;
  required?: boolean;
}

export function FormInput({ label, error, required, ...props }: FormInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      <Input {...props} />

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
```

Ví dụ sử dụng:

```txt
- CreatePetForm dùng FormInput, FormSelect, FormUpload.
- CareUpdateDrawer dùng FormTextarea, FormUpload.
- StaffCreateSpaForm dùng FormSelect, FormDatePicker.
```

Lưu ý:

```txt
- `components/forms/` chỉ chứa wrapper form chung.
- Form nghiệp vụ cụ thể vẫn đặt trong feature.
```

Ví dụ form nghiệp vụ:

```txt
features/pets/components/staff/CreatePetForm.tsx
features/spa/components/staff/StaffCreateSpaForm.tsx
features/boarding/components/staff/CareUpdateDrawer.tsx
```

---

### `components/modals/`

Chứa modal base hoặc modal shared dùng chung.

Vì dự án dùng shadcn/ui, modal nên dùng **Dialog** của shadcn/ui.

Component trong folder này chỉ nên là modal chung, không gắn nghiệp vụ cụ thể.

Ví dụ:

```txt
BaseModal
ConfirmModal
WarningModal
DeleteConfirmModal
```

Ví dụ:

```tsx
// src/components/modals/ConfirmModal.tsx

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  onOpenChange,
}: ConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {cancelText}
          </Button>

          <Button onClick={onConfirm}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

Modal nghiệp vụ cụ thể **không đặt ở đây**.

Ví dụ không đặt ở `components/modals/`:

```txt
RejectBoardingModal
ConfirmBoardingModal
ConfirmPaymentModal
AcceptSpaModal
CompleteSpaModal
```

Các modal này phải đặt trong feature tương ứng:

```txt
features/boarding/components/staff/RejectBoardingModal.tsx
features/boarding/components/staff/ConfirmBoardingModal.tsx
features/invoices/components/staff/ConfirmPaymentModal.tsx
features/spa/components/staff/AcceptSpaModal.tsx
```

---

### `components/drawers/`

Chứa drawer base hoặc drawer shared dùng chung.

Vì dự án dùng shadcn/ui, drawer bên phải nên dùng **Sheet** của shadcn/ui.

Component trong folder này chỉ nên là drawer chung, không chứa nghiệp vụ cụ thể.

Ví dụ:

```txt
BaseDrawer
DrawerHeader
DrawerFooter
RightSheet
```

Ví dụ:

```tsx
// src/components/drawers/BaseDrawer.tsx

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

interface BaseDrawerProps {
  open: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  onOpenChange: (open: boolean) => void;
}

export function BaseDrawer({
  open,
  title,
  description,
  children,
  onOpenChange,
}: BaseDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-140 sm:max-w-140">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && (
            <SheetDescription>{description}</SheetDescription>
          )}
        </SheetHeader>

        <div className="mt-6">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

Drawer nghiệp vụ cụ thể phải đặt trong feature.

Ví dụ:

```txt
features/boarding/components/staff/CareUpdateDrawer.tsx
features/boarding/components/staff/CheckInDrawer.tsx
features/boarding/components/staff/CheckOutDrawer.tsx
features/notifications/components/NotificationDrawer.tsx
```

Quy tắc:

```txt
- Form dài hoặc có upload ảnh/video nên dùng Sheet/Drawer.
- Modal xác nhận ngắn nên dùng Dialog.
- Không tự build drawer bằng div fixed nếu shadcn/ui Sheet đã có.
```

---

### `components/feedback/`

Chứa component phản hồi trạng thái của UI.

Ví dụ:

```txt
Toast
LoadingState
ErrorState
EmptyState
PageLoading
InlineLoading
```

Nếu dùng shadcn/ui + Sonner thì toast nên dùng `sonner`.

Ví dụ:

```tsx
// src/components/feedback/AppToaster.tsx

import { Toaster } from '@/components/ui/sonner';

export function AppToaster() {
  return <Toaster richColors position="top-right" />;
}
```

Ví dụ dùng toast:

```tsx
import { toast } from 'sonner';

toast.success('Đã cập nhật chăm sóc.');
toast.error('Có lỗi xảy ra, vui lòng thử lại.');
```

Lưu ý:

```txt
- Feedback chung đặt ở components/feedback.
- Empty state dùng chung có thể đặt ở components/common hoặc components/feedback.
- Nếu empty state riêng cho feature thì đặt trong feature.
```

Ví dụ:

```txt
components/common/EmptyState.tsx
features/boarding/components/staff/BoardingEmptyState.tsx
```

---

## 4.3.1. Quy tắc dùng shadcn/ui

Dự án sử dụng **shadcn/ui** làm nền tảng component UI.

shadcn/ui không phải thư viện component đóng gói sẵn kiểu import trực tiếp từ `node_modules`. Khi cài một component, code component sẽ được copy vào `src/components/ui/`. Vì vậy team có thể chỉnh style, variant và className theo design system của PetCare.

### Nguyên tắc sử dụng

```txt
1. Ưu tiên dùng shadcn/ui cho UI primitive.
2. Không tự tạo component primitive mới nếu shadcn/ui đã có.
3. Không sửa component shadcn/ui chỉ để phục vụ riêng một màn.
4. Nếu cần style riêng cho nghiệp vụ, tạo wrapper trong feature hoặc common.
5. Không đưa API call, state nghiệp vụ, role logic vào components/ui.
6. Dùng className, variant, size để tuỳ biến.
7. Nếu cần variant mới dùng chung toàn app, bổ sung vào file shadcn/ui tương ứng.
8. Nếu component chỉ dùng cho một nghiệp vụ, đặt trong feature tương ứng.
```

### Phân biệt đúng vị trí

Dùng shadcn/ui trực tiếp:

```tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { Sheet } from '@/components/ui/sheet';
```

Component nghiệp vụ đặt trong feature:

```txt
features/boarding/components/staff/StaffBoardingCard.tsx
features/boarding/components/staff/CareUpdateDrawer.tsx
features/spa/components/staff/StaffSpaRequestCard.tsx
features/invoices/components/staff/StaffInvoiceCard.tsx
```

Component layout chung đặt trong common:

```txt
components/common/PageHeader.tsx
components/common/FilterBar.tsx
components/common/EmptyState.tsx
components/common/StatusBadge.tsx
components/common/MoneyText.tsx
components/common/DateText.tsx
```

### Mapping component shadcn/ui nên dùng

```txt
Button          -> components/ui/button
Input           -> components/ui/input
Select          -> components/ui/select
Textarea        -> components/ui/textarea
Badge           -> components/ui/badge
Card            -> components/ui/card
Tabs            -> components/ui/tabs
Dialog          -> dùng cho modal xác nhận ngắn
Sheet           -> dùng cho drawer bên phải
DropdownMenu    -> dùng cho avatar menu, notification menu nếu dùng dropdown
Popover         -> dùng cho date picker, quick filter
Calendar        -> dùng cho chọn ngày
Avatar          -> dùng cho user avatar, pet avatar nếu cần
Table           -> dùng cho bảng dữ liệu nếu màn đó phù hợp dạng bảng
Skeleton        -> loading state
Alert           -> cảnh báo trong form hoặc flow
Separator       -> chia nhóm nội dung
Sonner          -> toast thông báo thành công/thất bại
```

### Quy tắc modal và drawer

Trong shadcn/ui:

```txt
Dialog -> dùng cho modal ngắn
Sheet  -> dùng cho drawer bên phải
```

Áp dụng trong dự án:

```txt
ConfirmPaymentModal       -> dùng Dialog
RejectBoardingModal       -> dùng Dialog
ConfirmBoardingModal      -> dùng Dialog
AcceptSpaModal            -> dùng Dialog

CareUpdateDrawer          -> dùng Sheet
CheckInDrawer             -> dùng Sheet
CheckOutDrawer            -> dùng Sheet
NotificationDrawer        -> dùng Sheet
AvatarDropdown            -> dùng DropdownMenu
```

### Không lạm dụng shadcn/ui trong page

Không phải màn nào cũng import trực tiếp nhiều component shadcn/ui rồi viết toàn bộ logic trong `page.tsx`.

Đúng:

```tsx
// app/(staff)/staff/boarding/page.tsx

import { StaffBoardingListPage } from '@/features/boarding/pages/staff/StaffBoardingListPage';

export default function Page() {
  return <StaffBoardingListPage />;
}
```

Rồi bên trong feature mới dùng shadcn/ui:

```tsx
// features/boarding/components/staff/StaffBoardingCard.tsx

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
```

Sai:

```txt
app/(staff)/staff/boarding/page.tsx
```

File này import hàng loạt `Card`, `Badge`, `Button`, `Dialog`, `Sheet`, tự render toàn bộ màn, tự xử lý filter, modal, drawer, API.

---

### Tóm tắt nguyên tắc của `src/components/`

```txt
components/ui/
-> shadcn/ui primitive, không chứa nghiệp vụ.

components/common/
-> component chung tự viết, có thể dùng shadcn/ui bên trong.

components/forms/
-> wrapper form dùng chung, form nghiệp vụ vẫn nằm trong feature.

components/modals/
-> modal base/shared, dùng Dialog.

components/drawers/
-> drawer base/shared, dùng Sheet.

components/feedback/
-> loading, error, empty, toast.

features/.../components/
-> component nghiệp vụ cụ thể.
```

Nguyên tắc chốt:

```txt
Dùng shadcn/ui cho UI primitive.
Không tự build lại primitive đã có.
Không đưa logic nghiệp vụ vào components/ui.
Component nghiệp vụ đặt trong features.
```

## 4.3.2. Quy tắc áp dụng Design System

Dự án có file `docs/design.md` là nguồn chuẩn cho giao diện.

Khi code UI, team bắt buộc tuân theo `docs/design.md` cho:

```txt
- Màu nền
- Màu chữ
- Font
- Cỡ chữ
- Border radius
- Shadow
- Spacing
- Button style
- Input style
- Card style
- Badge/status style
- Dialog/Modal style
- Sheet/Drawer style
- Sidebar/Header style
```

Không được hard-code màu, font size, radius, shadow rải rác trong từng màn nếu token đó đã có trong `design.md`.

Ví dụ không nên:

```tsx
<div className="bg-[#f7f6ea] text-[#1f261f] rounded-2xl">
  ...
</div>
```

Nên dùng token hoặc class đã map sẵn:

```tsx
<div className="bg-petcare-background text-petcare-text rounded-card">
  ...
</div>
```

### Nơi khai báo token

Các token từ `docs/design.md` phải được khai báo ở:

```txt
src/app/globals.css
src/styles/theme.css
tailwind.config.ts
```

Quy tắc:

```txt
docs/design.md
-> tài liệu chuẩn cho team và Stitch

src/styles/theme.css hoặc src/app/globals.css
-> khai báo CSS variables màu, font, radius, shadow

tailwind.config.ts
-> map token để dùng bằng class Tailwind
```

### Token bắt buộc phải có khi khởi tạo FE nền

```txt
- App background
- Card background
- Sidebar background
- Text chính
- Text phụ
- Text muted
- Border
- Primary
- CTA
- Success / warning / info / danger
- Radius card
- Radius control
- Shadow card
- Shadow modal
- Font Inter
- Heading/body/label text utilities
```

### Quy tắc với shadcn/ui

Dự án dùng shadcn/ui cho UI primitive, nhưng style cuối cùng phải tuân theo `docs/design.md`.

```txt
shadcn/ui cung cấp component nền.
design.md quyết định giao diện cuối.
```

Ví dụ:

```txt
Button lấy từ shadcn/ui.
Màu, radius, hover, size phải theo design.md.

Dialog lấy từ shadcn/ui.
Overlay, spacing, title, footer phải theo design.md.

Sheet lấy từ shadcn/ui.
Width, padding, footer sticky phải theo design.md.

Badge dùng shadcn/ui hoặc wrapper.
Màu trạng thái phải theo Semantic Palette trong design.md.
```

Không được dùng style mặc định của shadcn/ui nếu nó lệch với `docs/design.md`.

### Quy tắc cho Stitch

Khi viết prompt cho Stitch, luôn mở đầu bằng:

```txt
Đọc kỹ docs/design.md, docs/frontend-architecture.md, đặc tả SRS và mô tả dự án trước khi chỉnh.
Giữ nguyên design system hiện tại, chỉ sửa đúng phần được yêu cầu.
```

## 4.4. `src/features/`

### Nhiệm vụ

Đây là trái tim của frontend. Mỗi folder trong `features/` tương ứng với một domain nghiệp vụ.

```txt
features/
├── auth/
├── users/
├── pets/
├── appointments/
├── spa/
├── boarding/
├── invoices/
├── notifications/
├── profile/
├── medical-records/
└── prescriptions/
```

Quy tắc:

```txt
- Mỗi feature tự chứa page, component, api, hook, type, constant, util riêng.
- Không để component nghiệp vụ vào components chung.
- Nếu feature có nhiều role dùng, chia owner/staff/doctor/admin bên trong feature.
```

Cấu trúc chuẩn của một feature lớn:

```txt
features/example-feature/
├── pages/
│   ├── owner/
│   ├── staff/
│   ├── doctor/
│   └── admin/
├── components/
│   ├── owner/
│   ├── staff/
│   ├── doctor/
│   ├── admin/
│   └── shared/
├── api/
├── hooks/
├── types/
├── constants/
└── utils/
```

Không phải feature nào cũng cần đủ các folder trên. Feature nhỏ thì chỉ tạo folder cần thiết.

---

## 4.4.1. Nhiệm vụ từng folder con trong một feature

Mỗi feature trong `src/features/` đại diện cho một domain nghiệp vụ cụ thể.

Ví dụ:

```txt
features/auth/
features/pets/
features/boarding/
features/spa/
features/invoices/
features/medical-records/
features/prescriptions/
features/follow-ups/
````

Một feature lớn nên có cấu trúc chuẩn:

```txt
features/<feature-name>/
├── pages/
├── components/
├── api/
├── hooks/
├── types/
├── schemas/
├── constants/
└── utils/
```

Không phải feature nào cũng bắt buộc phải có đủ tất cả folder. Chỉ tạo folder khi feature đó thật sự cần.

Mục tiêu của cách chia này là để mỗi nghiệp vụ tự chứa đầy đủ code liên quan đến nó. Khi sửa nghiệp vụ nào, team chỉ cần vào đúng feature đó thay vì tìm rải rác trong toàn bộ project.

---

### `pages/`

#### Nhiệm vụ

Chứa page component thật sự của nghiệp vụ.

File trong `app/` chỉ là route wrapper, còn UI và logic màn hình chính nằm trong `features/<feature>/pages/`.

Ví dụ route:

```txt
src/app/(staff)/staff/boarding/page.tsx
```

chỉ nên gọi:

```tsx
import { StaffBoardingListPage } from '@/features/boarding/pages/staff/StaffBoardingListPage';

export default function Page() {
  return <StaffBoardingListPage />;
}
```

UI thật nằm ở:

```txt
src/features/boarding/pages/staff/StaffBoardingListPage.tsx
```

#### Khi nào dùng `pages/`

Dùng `pages/` cho các màn hoàn chỉnh của feature.

Ví dụ:

```txt
features/boarding/pages/staff/StaffBoardingListPage.tsx
features/boarding/pages/staff/StaffBoardingDetailPage.tsx
features/boarding/pages/owner/OwnerBoardingListPage.tsx
features/auth/pages/LoginPage.tsx
features/auth/pages/RegisterPage.tsx
features/pets/pages/staff/StaffPetListPage.tsx
features/invoices/pages/staff/StaffInvoiceListPage.tsx
```

#### Quy tắc

```txt
- Page trong feature được phép gọi hook của feature.
- Page trong feature được phép quản lý state UI của màn như tab, filter, modal open/close.
- Page trong feature không định nghĩa URL. URL thuộc `app/`.
- Page trong feature không nên chứa quá nhiều JSX nhỏ lẻ nếu có thể tách thành `components/`.
```

Ví dụ đúng:

```tsx
// features/boarding/pages/staff/StaffBoardingListPage.tsx

import { useState } from 'react';
import { StaffBoardingTabs } from '../../components/staff/StaffBoardingTabs';
import { StaffBoardingFilterBar } from '../../components/staff/StaffBoardingFilterBar';
import { StaffBoardingCard } from '../../components/staff/StaffBoardingCard';
import { useBoardingList } from '../../hooks/useBoardingList';

export function StaffBoardingListPage() {
  const [tab, setTab] = useState('PENDING_CONFIRMATION');

  const { data, isLoading } = useBoardingList({
    status: tab,
  });

  return (
    <div className="space-y-6">
      <StaffBoardingFilterBar />
      <StaffBoardingTabs value={tab} onChange={setTab} />

      {/* Render danh sách card ở đây */}
    </div>
  );
}
```

---

### `components/`

#### Nhiệm vụ

Chứa component UI thuộc riêng feature đó.

Component trong folder này có thể biết về nghiệp vụ, type, status, label, action của feature.

Ví dụ với boarding:

```txt
features/boarding/components/staff/StaffBoardingCard.tsx
features/boarding/components/staff/RejectBoardingModal.tsx
features/boarding/components/staff/CareUpdateDrawer.tsx
features/boarding/components/shared/BoardingStatusBadge.tsx
```

Ví dụ với auth:

```txt
features/auth/components/AuthBrandPanel.tsx
features/auth/components/AuthTextInput.tsx
features/auth/components/LoginForm.tsx
features/auth/components/RegisterForm.tsx
features/auth/components/SocialLoginButton.tsx
```

#### Chia theo role

Nếu feature được nhiều role sử dụng, chia component theo role:

```txt
components/
├── owner/
├── staff/
├── doctor/
├── admin/
└── shared/
```

Ý nghĩa:

```txt
components/owner/
-> Component chỉ dùng cho Chủ nuôi.

components/staff/
-> Component chỉ dùng cho Nhân viên.

components/doctor/
-> Component chỉ dùng cho Bác sĩ.

components/admin/
-> Component chỉ dùng cho Admin.

components/shared/
-> Component dùng chung trong cùng feature.
```

Ví dụ:

```txt
features/boarding/components/staff/CareUpdateDrawer.tsx
```

chỉ nhân viên dùng, nên đặt trong `staff`.

```txt
features/boarding/components/shared/BoardingStatusBadge.tsx
```

owner và staff đều dùng, nên đặt trong `shared`.

#### Quy tắc

```txt
- Component nghiệp vụ không đặt trong `src/components/common`.
- Component nghiệp vụ phải đặt trong feature tương ứng.
- Component trong feature được phép dùng shadcn/ui.
- Component trong feature nên nhận data qua props.
- Không gọi API trực tiếp trong component nếu có thể dùng hook.
```

Ví dụ đúng:

```tsx
// features/boarding/components/staff/StaffBoardingCard.tsx

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BoardingStatusBadge } from '../shared/BoardingStatusBadge';
import type { Boarding } from '../../types/boarding.types';

interface StaffBoardingCardProps {
  boarding: Boarding;
  onView: (boardingId: string) => void;
  onConfirm: (boardingId: string) => void;
  onReject: (boardingId: string) => void;
}

export function StaffBoardingCard({
  boarding,
  onView,
  onConfirm,
  onReject,
}: StaffBoardingCardProps) {
  return (
    <Card>
      <BoardingStatusBadge status={boarding.status} />

      <Button onClick={() => onView(boarding.id)}>
        Xem
      </Button>
    </Card>
  );
}
```

Ví dụ sai:

```txt
src/components/common/StaffBoardingCard.tsx
```

Vì `StaffBoardingCard` là component nghiệp vụ của `boarding`, không phải component chung toàn app.

---

### `api/`

#### Nhiệm vụ

Chứa các hàm gọi API của feature.

Ví dụ:

```txt
features/auth/api/auth.api.ts
features/boarding/api/boarding.api.ts
features/spa/api/spa.api.ts
features/invoices/api/invoices.api.ts
features/pets/api/pets.api.ts
```

Ví dụ:

```ts
// features/boarding/api/boarding.api.ts

import { api } from '@/lib/api-client';

export const boardingApi = {
  getStaffList: async (params: unknown) => {
    const res = await api.get('/staff/boarding', { params });
    return res.data;
  },

  getStaffDetail: async (boardingId: string) => {
    const res = await api.get(`/staff/boarding/${boardingId}`);
    return res.data;
  },

  confirm: async (boardingId: string, payload: unknown) => {
    const res = await api.patch(`/staff/boarding/${boardingId}/confirm`, payload);
    return res.data;
  },

  reject: async (boardingId: string, payload: unknown) => {
    const res = await api.patch(`/staff/boarding/${boardingId}/reject`, payload);
    return res.data;
  },
};
```

Có thể có file query key riêng:

```txt
features/boarding/api/boarding.keys.ts
```

Ví dụ:

```ts
// features/boarding/api/boarding.keys.ts

export const boardingKeys = {
  all: ['boarding'] as const,
  lists: () => [...boardingKeys.all, 'list'] as const,
  list: (params: unknown) => [...boardingKeys.lists(), params] as const,
  detail: (boardingId: string) => [...boardingKeys.all, 'detail', boardingId] as const,
};
```

#### Quy tắc

```txt
- Không gọi axios/fetch trực tiếp trong component.
- Không rải endpoint ở nhiều file.
- Mỗi feature quản lý API của chính nó.
- Nếu backend đổi endpoint, ưu tiên sửa trong `api/`.
- API client chung nằm ở `src/lib/api-client.ts`, không tạo axios instance riêng trong từng feature.
```

Ví dụ đúng:

```txt
features/boarding/api/boarding.api.ts
features/spa/api/spa.api.ts
features/invoices/api/invoices.api.ts
```

Ví dụ không nên:

```txt
components/boarding/StaffBoardingCard.tsx gọi api.patch trực tiếp
```

---

### `hooks/`

#### Nhiệm vụ

Chứa hook phục vụ riêng feature đó.

Thường dùng để bọc API bằng React Query hoặc gom logic tương tác dữ liệu.

Ví dụ:

```txt
features/boarding/hooks/useBoardingList.ts
features/boarding/hooks/useBoardingDetail.ts
features/boarding/hooks/useConfirmBoarding.ts
features/auth/hooks/useLogin.ts
features/auth/hooks/useRegister.ts
features/pets/hooks/usePets.ts
features/invoices/hooks/useInvoices.ts
```

Ví dụ:

```ts
// features/boarding/hooks/useBoardingList.ts

import { useQuery } from '@tanstack/react-query';
import { boardingApi } from '../api/boarding.api';
import { boardingKeys } from '../api/boarding.keys';

export function useBoardingList(params: unknown) {
  return useQuery({
    queryKey: boardingKeys.list(params),
    queryFn: () => boardingApi.getStaffList(params),
  });
}
```

Ví dụ mutation:

```ts
// features/boarding/hooks/useConfirmBoarding.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { boardingApi } from '../api/boarding.api';
import { boardingKeys } from '../api/boarding.keys';

export function useConfirmBoarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      boardingId,
      payload,
    }: {
      boardingId: string;
      payload: unknown;
    }) => boardingApi.confirm(boardingId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: boardingKeys.all,
      });
    },
  });
}
```

#### Quy tắc

```txt
- Hook chỉ dùng cho một feature thì đặt trong feature đó.
- Hook dùng chung toàn app mới đặt ở `src/hooks`.
- Component nên gọi hook thay vì gọi API trực tiếp.
- Hook xử lý loading, error, cache, mutation, invalidate query.
```

Ví dụ đúng:

```txt
features/boarding/hooks/useBoardingList.ts
```

Ví dụ không nên:

```txt
src/hooks/useBoardingList.ts
```

vì hook này chỉ thuộc nghiệp vụ boarding.

---

### `types/`

#### Nhiệm vụ

Chứa TypeScript type/interface của feature.

Ví dụ:

```txt
features/pets/types/pet.types.ts
features/boarding/types/boarding.types.ts
features/auth/types/auth.types.ts
features/invoices/types/invoice.types.ts
features/spa/types/spa.types.ts
```

Ví dụ:

```ts
// features/boarding/types/boarding.types.ts

export type BoardingStatus =
  | 'PENDING_CONFIRMATION'
  | 'WAITING_CHECK_IN'
  | 'STAYING'
  | 'CHECKED_OUT'
  | 'CANCELLED';

export interface Boarding {
  id: string;
  code: string;
  status: BoardingStatus;
  totalAmount: number;
}
```

#### Quy tắc

```txt
- Type nghiệp vụ đặt trong feature.
- Type dùng chung toàn app mới đặt ở `src/types`.
- Không dùng `any` nếu có thể định nghĩa type rõ ràng.
- Type API response và type UI có thể tách riêng nếu cần.
```

Ví dụ:

```txt
features/boarding/types/boarding.types.ts
```

không nên đưa `Boarding` vào:

```txt
src/types/common.ts
```

vì `Boarding` là type nghiệp vụ riêng.

---

### `schemas/`

#### Nhiệm vụ

Chứa schema validate form/payload phía frontend của feature.

Thường dùng với:

```txt
zod
react-hook-form
@hookform/resolvers
```

Ví dụ:

```txt
features/auth/schemas/login.schema.ts
features/auth/schemas/register.schema.ts
features/pets/schemas/create-pet.schema.ts
features/boarding/schemas/care-update.schema.ts
features/boarding/schemas/reject-boarding.schema.ts
features/spa/schemas/create-spa-request.schema.ts
```

Ví dụ:

```ts
// features/auth/schemas/register.schema.ts

import { z } from 'zod';

export const registerSchema = z
  .object({
    fullName: z.string().min(1, 'Vui lòng nhập họ và tên'),
    email: z.string().email('Email không hợp lệ'),
    phoneNumber: z.string().min(10, 'Số điện thoại không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });
```

#### Vì sao frontend vẫn cần schema dù backend đã có schema?

Backend schema và frontend schema có nhiệm vụ khác nhau.

```txt
Backend schema:
- Validate request thật trước khi xử lý.
- Bảo vệ API.
- Không tin dữ liệu từ client.
- Bắt buộc phải có.

Frontend schema:
- Validate form trước khi gọi API.
- Hiển thị lỗi ngay trên UI.
- Giúp UX tốt hơn.
- Kết hợp với react-hook-form.
```

Ví dụ user nhập email sai:

```txt
Frontend schema -> báo lỗi ngay dưới input Email.
Backend schema  -> vẫn validate lại lần cuối khi submit.
```

Không bao giờ chỉ tin frontend validation, vì người dùng có thể gọi API trực tiếp bằng Postman hoặc script.

#### Quy tắc

```txt
- Schema nghiệp vụ đặt trong `features/<domain>/schemas`.
- Schema dùng chung toàn app mới đặt ở common validation.
- Không copy máy móc toàn bộ backend schema nếu frontend form không cần đủ field.
- Schema frontend phục vụ UI form, không thay thế schema backend.
```

Ví dụ schema dùng chung toàn app có thể đặt ở:

```txt
src/lib/validations/
```

hoặc:

```txt
src/schemas/common/
```

nếu sau này team tạo folder schema chung.

Ví dụ schema dùng chung:

```txt
email.schema.ts
phone.schema.ts
password.schema.ts
date-range.schema.ts
pagination.schema.ts
```

---

### `constants/`

#### Nhiệm vụ

Chứa hằng số riêng của feature.

Ví dụ:

```txt
features/boarding/constants/boarding.constants.ts
features/spa/constants/spa.constants.ts
features/invoices/constants/invoice.constants.ts
features/pets/constants/pet.constants.ts
```

Dùng cho:

```txt
- Status label
- Tab config
- Filter option
- Default values
- Mapping màu badge nếu riêng feature
```

Ví dụ:

```ts
// features/boarding/constants/boarding.constants.ts

export const boardingStatusLabel = {
  PENDING_CONFIRMATION: 'Chờ xác nhận',
  WAITING_CHECK_IN: 'Chờ check-in',
  STAYING: 'Đang lưu trú',
  CHECKED_OUT: 'Đã trả thú cưng',
  CANCELLED: 'Đã hủy',
} as const;

export const staffBoardingTabs = [
  {
    label: 'Chờ xác nhận',
    value: 'PENDING_CONFIRMATION',
  },
  {
    label: 'Chờ check-in',
    value: 'WAITING_CHECK_IN',
  },
  {
    label: 'Đang lưu trú',
    value: 'STAYING',
  },
  {
    label: 'Lịch sử',
    value: 'HISTORY',
  },
] as const;
```

#### Quy tắc

```txt
- Không hard-code label status rải rác trong component.
- Không hard-code tab/filter option trong nhiều file.
- Constants riêng feature đặt trong feature.
- Constants dùng toàn app đặt trong `src/constants`.
```

Ví dụ đúng:

```txt
features/boarding/constants/boarding.constants.ts
```

Ví dụ không nên:

```tsx
if (status === 'STAYING') {
  return 'Đang lưu trú';
}
```

rải rác trong nhiều component.

---

### `utils/`

#### Nhiệm vụ

Chứa hàm xử lý nhỏ, chỉ phục vụ feature đó.

Ví dụ:

```txt
features/boarding/utils/boarding-format.ts
features/boarding/utils/boarding-mapper.ts
features/pets/utils/pet-format.ts
features/invoices/utils/invoice-format.ts
features/spa/utils/spa-format.ts
```

Dùng cho:

```txt
- Format dữ liệu riêng feature
- Mapping API response sang UI model
- Tính toán nhỏ
- Helper xử lý status
```

Ví dụ:

```ts
// features/boarding/utils/boarding-format.ts

export function getBoardingDurationText(totalDays: number) {
  return `${totalDays} ngày`;
}

export function getBoardingCodeText(code: string) {
  return code.toUpperCase();
}
```

Ví dụ mapper:

```ts
// features/boarding/utils/boarding-mapper.ts

import type { Boarding } from '../types/boarding.types';

export function mapBoardingResponseToBoarding(response: any): Boarding {
  return {
    id: response.id,
    code: response.code,
    status: response.status,
    totalAmount: response.totalAmount,
  };
}
```

#### Quy tắc

```txt
- Utils chỉ dùng trong một feature thì đặt trong feature đó.
- Utils dùng toàn app như format tiền, format ngày thì đặt trong `src/lib`.
```

Ví dụ:

```txt
features/boarding/utils/boarding-format.ts
```

chỉ dùng cho boarding.

```txt
src/lib/money.ts
src/lib/date.ts
```

dùng toàn app.

---

### Tóm tắt nhiệm vụ folder con trong feature

```txt
pages/
-> Màn hình hoàn chỉnh của feature, được route trong app gọi tới.

components/
-> Component UI nghiệp vụ của feature.

api/
-> Hàm gọi API của feature.

hooks/
-> React Query hooks hoặc custom hooks riêng feature.

types/
-> TypeScript types/interfaces riêng feature.

schemas/
-> Zod schemas validate form/payload phía frontend của feature.

constants/
-> Status label, tab config, filter option, default values riêng feature.

utils/
-> Hàm format, mapper, helper nhỏ riêng feature.
```

Nguyên tắc chốt:

```txt
Một nghiệp vụ nên tự chứa đầy đủ code của nó trong một feature.
Khi sửa nghiệp vụ nào, ưu tiên vào đúng folder feature đó.
Không rải logic nghiệp vụ ra app/, components/common/, hooks/ hoặc lib/ nếu nó chỉ thuộc một feature.
```

```


## 4.5. `src/lib/`

### Nhiệm vụ

Chứa các hàm nền tảng dùng toàn app:

```txt
api-client.ts     -> cấu hình axios/fetch client
permissions.ts    -> kiểm tra quyền
query-client.ts   -> cấu hình React Query
money.ts          -> format tiền
date.ts           -> format ngày giờ
auth.ts           -> helper auth
env.ts            -> đọc env an toàn
utils.ts          -> utility chung
```

Ví dụ:

```ts
// src/lib/money.ts

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
}
```

Dùng:

```tsx
formatCurrency(600000); // 600.000đ
```

---

## 4.6. `src/hooks/`

### Nhiệm vụ

Chứa custom hook dùng chung toàn app, không thuộc riêng feature nào.

Ví dụ:

```txt
useDebounce.ts
useDisclosure.ts
usePagination.ts
useCurrentUser.ts
useUploadFile.ts
```

Nếu hook chỉ phục vụ một feature, đặt trong feature đó.

Ví dụ đúng:

```txt
features/boarding/hooks/useBoardingList.ts
```

Không nên đặt ở `src/hooks` vì nó chỉ dùng cho boarding.

---

## 4.7. `src/stores/`

### Nhiệm vụ

Chứa global client state, ví dụ dùng Zustand.

```txt
auth.store.ts          -> thông tin user hiện tại, token, login/logout
ui.store.ts            -> trạng thái sidebar, theme, drawer global nếu có
notification.store.ts  -> số lượng thông báo chưa đọc, toast queue nếu cần
```

Không dùng store global cho dữ liệu server như danh sách lưu trú, hóa đơn, thú cưng. Những thứ đó nên dùng React Query.

---

## 4.8. `src/constants/`

### Nhiệm vụ

Chứa hằng số dùng toàn app:

```txt
roles.ts        -> role OWNER, STAFF, DOCTOR, ADMIN
routes.ts       -> đường dẫn route
status.ts       -> status dùng chung
sidebar.ts      -> config sidebar
permissions.ts  -> permission config
```

Ví dụ:

```ts
// src/constants/roles.ts

export const ROLES = {
  OWNER: 'OWNER',
  STAFF: 'STAFF',
  DOCTOR: 'DOCTOR',
  ADMIN: 'ADMIN',
} as const;

export type Role = keyof typeof ROLES;
```

---

## 4.9. `src/types/`

### Nhiệm vụ

Chứa type dùng chung toàn app:

```txt
api.ts
common.ts
auth.ts
user.ts
media.ts
```

Type nghiệp vụ cụ thể đặt trong feature.

Ví dụ:

```txt
features/boarding/types/boarding.types.ts
```

Không đặt `Boarding` vào `src/types` nếu nó chỉ thuộc nghiệp vụ lưu trú.

---

## 5. Cấu trúc chi tiết từng feature

# 5.1. Feature Auth

## Nhiệm vụ

Xử lý đăng nhập, đăng ký, quên mật khẩu, lấy thông tin user hiện tại.

```txt
features/auth/
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── ForgotPasswordPage.tsx
├── components/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── ForgotPasswordForm.tsx
├── api/
│   ├── auth.api.ts
│   └── auth.keys.ts
├── hooks/
│   ├── useLogin.ts
│   ├── useRegister.ts
│   ├── useLogout.ts
│   └── useMe.ts
├── types/
│   └── auth.types.ts
└── schemas/
    ├── login.schema.ts
    └── register.schema.ts
```

## Ví dụ file

```ts
// features/auth/api/auth.api.ts

import { api } from '@/lib/api-client';

export const authApi = {
  login: async (payload: { email: string; password: string }) => {
    const res = await api.post('/auth/login', payload);
    return res.data;
  },

  me: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },
};
```

---

# 5.2. Feature Pets / Hồ sơ thú cưng

## Nhiệm vụ

Quản lý hồ sơ thú cưng.

Với chủ nuôi:

```txt
- Xem danh sách thú cưng của tôi
- Xem chi tiết thú cưng
- Đặt lịch từ hồ sơ thú cưng
```

Với nhân viên:

```txt
- Tra cứu hồ sơ thú cưng
- Tạo hồ sơ thú cưng tại quầy
- Tạo tài khoản chủ nuôi nếu chưa tồn tại
- Chỉnh sửa thông tin cơ bản của thú cưng
- Xem lịch sử hoạt động gần đây của thú cưng
```

Nhân viên không được sửa:

```txt
- Bệnh án
- Chẩn đoán
- Đơn thuốc
- Kết quả khám
- Lịch sử tiêm chủng chuyên môn
```

## Folder

```txt
features/pets/
├── pages/
│   ├── owner/
│   │   ├── OwnerPetListPage.tsx
│   │   └── OwnerPetDetailPage.tsx
│   └── staff/
│       ├── StaffPetListPage.tsx
│       ├── StaffPetDetailPage.tsx
│       ├── StaffCreatePetPage.tsx
│       ├── StaffCreateOwnerPage.tsx
│       └── StaffEditPetPage.tsx
├── components/
│   ├── owner/
│   │   ├── OwnerPetCard.tsx
│   │   └── OwnerPetProfileTabs.tsx
│   ├── staff/
│   │   ├── StaffPetTable.tsx
│   │   ├── StaffPetDetailHero.tsx
│   │   ├── CreatePetForm.tsx
│   │   ├── EditPetForm.tsx
│   │   ├── OwnerSearchPanel.tsx
│   │   └── PetRecentActivities.tsx
│   └── shared/
│       ├── PetAvatar.tsx
│       ├── PetInfoCard.tsx
│       └── PetSpeciesBadge.tsx
├── api/
│   ├── pets.api.ts
│   └── pets.keys.ts
├── hooks/
│   ├── usePets.ts
│   ├── usePetDetail.ts
│   ├── useCreatePet.ts
│   ├── useUpdatePet.ts
│   └── useSearchOwners.ts
├── types/
│   └── pet.types.ts
├── schemas/
│   ├── create-pet.schema.ts
│   └── edit-pet.schema.ts
└── utils/
    └── pet-format.ts
```

## Ví dụ page route

```tsx
// src/app/(staff)/staff/pets/page.tsx

import { StaffPetListPage } from '@/features/pets/pages/staff/StaffPetListPage';

export default function Page() {
  return <StaffPetListPage />;
}
```

## Ví dụ type

```ts
// features/pets/types/pet.types.ts

export type PetSpecies = 'DOG' | 'CAT';
export type PetGender = 'MALE' | 'FEMALE';

export interface Pet {
  id: string;
  code: string;
  name: string;
  avatarUrl?: string;
  species: PetSpecies;
  breed?: string;
  gender: PetGender;
  age?: string;
  weight?: number;
  color?: string;
  identification?: string;
  careNote?: string;
  owner: {
    id: string;
    name: string;
    phone: string;
  };
}
```

---

# 5.3. Feature Boarding / Lưu trú

## Nhiệm vụ

Quản lý nghiệp vụ lưu trú.

Với chủ nuôi:

```txt
- Đặt phòng lưu trú
- Xem danh sách lưu trú của tôi
- Xem chi tiết lưu trú
- Xem nhật ký chăm sóc
- Tải hóa đơn
```

Với nhân viên:

```txt
- Xem yêu cầu lưu trú
- Xác nhận hoặc từ chối yêu cầu
- Check-in thú cưng
- Theo dõi thú cưng đang lưu trú
- Cập nhật chăm sóc bằng text + ảnh/video
- Check-out / trả thú cưng
- Xem lịch sử lưu trú
```

## Trạng thái lưu trú

```txt
PENDING_CONFIRMATION -> Chờ xác nhận
WAITING_CHECK_IN     -> Chờ check-in
STAYING              -> Đang lưu trú
CHECKED_OUT          -> Đã trả thú cưng
CANCELLED            -> Đã hủy
```

## Folder

```txt
features/boarding/
├── pages/
│   ├── owner/
│   │   ├── OwnerBoardingListPage.tsx
│   │   ├── OwnerBoardingBookingPage.tsx
│   │   └── OwnerBoardingDetailPage.tsx
│   └── staff/
│       ├── StaffBoardingListPage.tsx
│       ├── StaffCreateBoardingPage.tsx
│       └── StaffBoardingDetailPage.tsx
├── components/
│   ├── owner/
│   │   ├── OwnerBoardingCard.tsx
│   │   ├── OwnerBoardingDetailHero.tsx
│   │   ├── OwnerCareLogTimeline.tsx
│   │   └── OwnerBoardingPaymentSummary.tsx
│   ├── staff/
│   │   ├── StaffBoardingCard.tsx
│   │   ├── StaffBoardingTabs.tsx
│   │   ├── StaffBoardingFilterBar.tsx
│   │   ├── StaffBoardingSummaryBar.tsx
│   │   ├── ConfirmBoardingModal.tsx
│   │   ├── RejectBoardingModal.tsx
│   │   ├── CheckInDrawer.tsx
│   │   ├── CareUpdateDrawer.tsx
│   │   ├── CheckOutDrawer.tsx
│   │   ├── BoardingDetailLeftColumn.tsx
│   │   └── BoardingDetailRightColumn.tsx
│   └── shared/
│       ├── BoardingStatusBadge.tsx
│       ├── BoardingPaymentBadge.tsx
│       ├── BoardingCareChecklist.tsx
│       ├── BoardingTimeline.tsx
│       └── BoardingRoomInfo.tsx
├── api/
│   ├── boarding.api.ts
│   └── boarding.keys.ts
├── hooks/
│   ├── useBoardingList.ts
│   ├── useBoardingDetail.ts
│   ├── useCreateBoarding.ts
│   ├── useConfirmBoarding.ts
│   ├── useRejectBoarding.ts
│   ├── useCheckInBoarding.ts
│   ├── useUpdateBoardingCare.ts
│   └── useCheckOutBoarding.ts
├── types/
│   └── boarding.types.ts
├── constants/
│   └── boarding.constants.ts
├── schemas/
│   ├── create-boarding.schema.ts
│   ├── reject-boarding.schema.ts
│   ├── care-update.schema.ts
│   └── checkout.schema.ts
└── utils/
    ├── boarding-format.ts
    └── boarding-mapper.ts
```

## Ví dụ type

```ts
// features/boarding/types/boarding.types.ts

export type BoardingStatus =
  | 'PENDING_CONFIRMATION'
  | 'WAITING_CHECK_IN'
  | 'STAYING'
  | 'CHECKED_OUT'
  | 'CANCELLED';

export type BoardingPaymentStatus =
  | 'UNPAID'
  | 'DEPOSITED'
  | 'PAID'
  | 'NO_PAYMENT_REQUIRED';

export interface Boarding {
  id: string;
  code: string;
  pet: {
    id: string;
    name: string;
    avatarUrl?: string;
    species: string;
    breed?: string;
    age?: string;
  };
  owner: {
    id: string;
    name: string;
    phone: string;
  };
  room: {
    id?: string;
    code?: string;
    type: string;
  };
  startDate: string;
  endDate: string;
  totalDays: number;
  currentDay?: number;
  status: BoardingStatus;
  paymentMethod: 'ONLINE' | 'AT_CENTER';
  paymentStatus: BoardingPaymentStatus;
  totalAmount: number;
  careRequests: string[];
  latestCareLog?: {
    time: string;
    note: string;
    mediaCount?: number;
    hasVideo?: boolean;
  };
}

export interface BoardingCareLog {
  id: string;
  title: string;
  overallStatus: 'NORMAL' | 'NEED_WATCHING' | 'ABNORMAL' | 'COMPLETED' | 'STARTED';
  note: string;
  quickTags?: string[];
  createdAt: string;
  createdBy: string;
  media: {
    id: string;
    type: 'IMAGE' | 'VIDEO';
    url: string;
    thumbnailUrl?: string;
  }[];
}
```

## Ví dụ API

```ts
// features/boarding/api/boarding.api.ts

import { api } from '@/lib/api-client';
import type {
  ConfirmBoardingPayload,
  RejectBoardingPayload,
  UpdateBoardingCarePayload,
} from '../types/boarding.types';

export const boardingApi = {
  getStaffList: async (params: unknown) => {
    const res = await api.get('/staff/boarding', { params });
    return res.data;
  },

  getStaffDetail: async (boardingId: string) => {
    const res = await api.get(`/staff/boarding/${boardingId}`);
    return res.data;
  },

  confirm: async (boardingId: string, payload: ConfirmBoardingPayload) => {
    const res = await api.patch(`/staff/boarding/${boardingId}/confirm`, payload);
    return res.data;
  },

  reject: async (boardingId: string, payload: RejectBoardingPayload) => {
    const res = await api.patch(`/staff/boarding/${boardingId}/reject`, payload);
    return res.data;
  },

  updateCare: async (boardingId: string, payload: UpdateBoardingCarePayload) => {
    const res = await api.post(`/staff/boarding/${boardingId}/care-logs`, payload);
    return res.data;
  },

  checkOut: async (boardingId: string, payload: unknown) => {
    const res = await api.patch(`/staff/boarding/${boardingId}/check-out`, payload);
    return res.data;
  },
};
```

---

# 5.4. Feature Spa / Dịch vụ spa

## Nhiệm vụ

Quản lý dịch vụ làm đẹp / spa.

Với chủ nuôi:

```txt
- Xem dịch vụ spa khả dụng
- Đặt dịch vụ spa
- Xem dịch vụ đã đặt
- Xem lịch sử dịch vụ
```

Với nhân viên:

```txt
- Xem yêu cầu spa
- Tiếp nhận yêu cầu
- Hoàn tất yêu cầu
- Xem chi tiết
- Tạo yêu cầu spa tại quầy
```

## Trạng thái spa

Không dùng `Đang thực hiện`.

```txt
WAITING_ACCEPT -> Chờ tiếp nhận
ACCEPTED       -> Đã tiếp nhận
COMPLETED      -> Hoàn tất
CANCELLED      -> Đã hủy
```

## Folder

```txt
features/spa/
├── pages/
│   ├── owner/
│   │   ├── OwnerSpaListPage.tsx
│   │   ├── OwnerSpaBookingPage.tsx
│   │   └── OwnerSpaHistoryPage.tsx
│   └── staff/
│       ├── StaffSpaListPage.tsx
│       ├── StaffCreateSpaRequestPage.tsx
│       └── StaffSpaDetailPage.tsx
├── components/
│   ├── owner/
│   │   ├── OwnerSpaServiceCard.tsx
│   │   ├── OwnerSpaBookingForm.tsx
│   │   └── OwnerSpaRequestCard.tsx
│   ├── staff/
│   │   ├── StaffSpaRequestCard.tsx
│   │   ├── StaffSpaTabs.tsx
│   │   ├── StaffSpaFilterBar.tsx
│   │   ├── AcceptSpaModal.tsx
│   │   ├── CompleteSpaModal.tsx
│   │   └── StaffCreateSpaForm.tsx
│   └── shared/
│       ├── SpaStatusBadge.tsx
│       ├── SpaPaymentBadge.tsx
│       └── SpaServiceIcon.tsx
├── api/
│   ├── spa.api.ts
│   └── spa.keys.ts
├── hooks/
│   ├── useSpaRequests.ts
│   ├── useSpaDetail.ts
│   ├── useAcceptSpaRequest.ts
│   ├── useCompleteSpaRequest.ts
│   └── useCreateSpaRequest.ts
├── types/
│   └── spa.types.ts
├── constants/
│   └── spa.constants.ts
└── schemas/
    ├── create-spa-request.schema.ts
    └── complete-spa.schema.ts
```

---

# 5.5. Feature Appointments / Lịch hẹn

## Nhiệm vụ

Quản lý lịch hẹn khám, lịch dịch vụ nếu cần.

Với chủ nuôi:

```txt
- Đặt lịch hẹn
- Xem lịch hẹn của tôi
- Hủy lịch nếu còn được phép
```

Với nhân viên:

```txt
- Tiếp nhận lịch hẹn
- Xác nhận / từ chối lịch hẹn
- Phân công bác sĩ nếu nghiệp vụ yêu cầu
- Xem chi tiết lịch hẹn
```

Với bác sĩ:

```txt
- Xem lịch khám được phân công
- Vào màn khám bệnh từ lịch hẹn
```

## Folder

```txt
features/appointments/
├── pages/
│   ├── owner/
│   │   ├── OwnerAppointmentListPage.tsx
│   │   └── OwnerCreateAppointmentPage.tsx
│   ├── staff/
│   │   ├── StaffAppointmentListPage.tsx
│   │   └── StaffAppointmentDetailPage.tsx
│   └── doctor/
│       ├── DoctorSchedulePage.tsx
│       └── DoctorAppointmentDetailPage.tsx
├── components/
│   ├── owner/
│   ├── staff/
│   │   ├── StaffAppointmentTable.tsx
│   │   ├── StaffAppointmentFilterBar.tsx
│   │   ├── ConfirmAppointmentModal.tsx
│   │   ├── RejectAppointmentModal.tsx
│   │   └── AssignDoctorModal.tsx
│   ├── doctor/
│   └── shared/
│       ├── AppointmentStatusBadge.tsx
│       └── AppointmentTypeBadge.tsx
├── api/
│   ├── appointments.api.ts
│   └── appointments.keys.ts
├── hooks/
│   ├── useAppointments.ts
│   ├── useAppointmentDetail.ts
│   ├── useConfirmAppointment.ts
│   ├── useRejectAppointment.ts
│   └── useAssignDoctor.ts
├── types/
│   └── appointment.types.ts
└── constants/
    └── appointment.constants.ts
```

---

# 5.6. Feature Invoices / Hóa đơn

## Nhiệm vụ

Quản lý hóa đơn phát sinh từ dịch vụ.

Nhân viên dùng màn hóa đơn để:

```txt
- Tra cứu hóa đơn
- Lọc theo trạng thái
- Xem chi tiết hóa đơn
- Xác nhận thanh toán tại quầy
- Tải/in hóa đơn đã thanh toán
```

Không cho nhân viên tạo hóa đơn thủ công từ màn hóa đơn. Hóa đơn phải sinh từ nghiệp vụ gốc:

```txt
- Đặt spa
- Tạo yêu cầu spa tại quầy
- Đặt lưu trú
- Tạo lưu trú tại quầy
```

## Folder

```txt
features/invoices/
├── pages/
│   ├── owner/
│   │   ├── OwnerInvoiceListPage.tsx
│   │   └── OwnerInvoiceDetailPage.tsx
│   └── staff/
│       ├── StaffInvoiceListPage.tsx
│       └── StaffInvoiceDetailPage.tsx
├── components/
│   ├── owner/
│   │   └── OwnerInvoiceCard.tsx
│   ├── staff/
│   │   ├── StaffInvoiceCard.tsx
│   │   ├── StaffInvoiceTabs.tsx
│   │   ├── StaffInvoiceFilterBar.tsx
│   │   └── ConfirmPaymentModal.tsx
│   └── shared/
│       ├── InvoiceStatusBadge.tsx
│       ├── InvoicePaymentMethodBadge.tsx
│       └── InvoiceSummary.tsx
├── api/
│   ├── invoices.api.ts
│   └── invoices.keys.ts
├── hooks/
│   ├── useInvoices.ts
│   ├── useInvoiceDetail.ts
│   ├── useConfirmPayment.ts
│   └── useDownloadInvoice.ts
├── types/
│   └── invoice.types.ts
└── constants/
    └── invoice.constants.ts
```

---

# 5.7. Feature Medical Records / Hồ sơ sức khỏe

## Nhiệm vụ

Dành cho chủ nuôi xem và bác sĩ cập nhật.

Chủ nuôi:

```txt
- Xem hồ sơ sức khỏe
- Xem lịch sử khám
- Xem sổ tiêm chủng nếu có
```

Bác sĩ:

```txt
- Tạo phiếu khám
- Cập nhật chẩn đoán
- Cập nhật chỉ định
- Ghi kết quả khám
```

Nhân viên không sửa feature này.

## Folder

```txt
features/medical-records/
├── pages/
│   ├── owner/
│   │   └── OwnerMedicalRecordPage.tsx
│   └── doctor/
│       ├── DoctorMedicalRecordListPage.tsx
│       └── DoctorMedicalRecordDetailPage.tsx
├── components/
│   ├── owner/
│   ├── doctor/
│   └── shared/
├── api/
├── hooks/
├── types/
└── constants/
```

---

# 5.8. Feature Prescriptions / Đơn thuốc

## Nhiệm vụ

Dành cho bác sĩ tạo đơn thuốc và chủ nuôi xem đơn thuốc nếu cần.

```txt
features/prescriptions/
├── pages/
│   ├── owner/
│   └── doctor/
├── components/
│   ├── owner/
│   ├── doctor/
│   └── shared/
├── api/
├── hooks/
├── types/
└── schemas/
```

---

# 5.9. Feature Users / Quản lý người dùng

## Nhiệm vụ

Chủ yếu dành cho admin.

```txt
- Quản lý tài khoản chủ nuôi
- Quản lý tài khoản nhân viên
- Quản lý tài khoản bác sĩ
- Khóa/mở tài khoản nếu cần
```

```txt
features/users/
├── pages/
│   └── admin/
│       ├── AdminUserListPage.tsx
│       ├── AdminCreateUserPage.tsx
│       └── AdminUserDetailPage.tsx
├── components/
│   └── admin/
│       ├── AdminUserTable.tsx
│       ├── UserRoleBadge.tsx
│       └── UserStatusBadge.tsx
├── api/
├── hooks/
├── types/
└── schemas/
```

---

# 5.10. Feature Notifications / Thông báo

## Nhiệm vụ

Quản lý thông báo hệ thống cho tất cả role. Thông báo **không nằm trong sidebar**, mà được truy cập qua icon chuông trên header.

Các loại thông báo ví dụ:

```txt
OWNER:
- Lịch hẹn đã được xác nhận / từ chối
- Yêu cầu spa đã được tiếp nhận / hoàn tất
- Lưu trú có cập nhật chăm sóc mới
- Hóa đơn cần thanh toán hoặc đã thanh toán

STAFF:
- Có lịch hẹn mới cần xử lý
- Có yêu cầu spa mới
- Có yêu cầu lưu trú mới
- Có hóa đơn chờ xác nhận thanh toán tại quầy

DOCTOR:
- Có lịch khám mới được phân công
- Có lịch khám sắp tới

ADMIN:
- Cảnh báo hệ thống hoặc tài khoản cần xử lý nếu có
```

## Folder

```txt
features/notifications/
├── pages/
│   ├── owner/
│   │   └── OwnerNotificationPage.tsx
│   ├── staff/
│   │   └── StaffNotificationPage.tsx
│   ├── doctor/
│   │   └── DoctorNotificationPage.tsx
│   └── admin/
│       └── AdminNotificationPage.tsx
├── components/
│   ├── NotificationButton.tsx
│   ├── NotificationDrawer.tsx
│   ├── NotificationDropdown.tsx
│   ├── NotificationList.tsx
│   ├── NotificationItem.tsx
│   └── NotificationUnreadBadge.tsx
├── api/
│   ├── notifications.api.ts
│   └── notifications.keys.ts
├── hooks/
│   ├── useNotifications.ts
│   ├── useUnreadNotificationCount.ts
│   ├── useMarkNotificationAsRead.ts
│   └── useMarkAllNotificationsAsRead.ts
├── types/
│   └── notification.types.ts
└── constants/
    └── notification.constants.ts
```

## Cách dùng trong header

```tsx
// src/layouts/AppHeader.tsx

import { NotificationButton } from '@/features/notifications/components/NotificationButton';
import { UserMenu } from '@/features/profile/components/UserMenu';

export function AppHeader() {
  return (
    <header>
      {/* Search */}
      {/* Help */}
      <NotificationButton />
      <UserMenu />
    </header>
  );
}
```

Khi click `NotificationButton`:

```txt
- Mở drawer/dropdown thông báo gần đây.
- Có nút "Xem tất cả".
- Click "Xem tất cả" thì điều hướng tới route notifications theo role hiện tại.
```

Ví dụ route:

```txt
/staff/notifications
/owner/notifications
/doctor/notifications
/admin/notifications
```

Quy tắc quan trọng:

```txt
- Không thêm "Thông báo" vào sidebar.
- Không hard-code route notifications trong nhiều nơi.
- Dùng ROUTES.STAFF.NOTIFICATIONS, ROUTES.OWNER.NOTIFICATIONS... nếu cần điều hướng.
```

---

# 5.11. Feature Profile / Hồ sơ cá nhân

## Nhiệm vụ

Quản lý hồ sơ cá nhân của người dùng hiện tại. Feature này dùng cho mọi role, nhưng cách truy cập là qua menu avatar trên header, **không nằm trong sidebar**.

Với Chủ nuôi, đây là nơi cập nhật thông tin cá nhân như:

```txt
- Họ tên
- Số điện thoại
- Email nếu hệ thống cho phép đổi
- Địa chỉ
- Mật khẩu nếu có luồng đổi mật khẩu
```

Với Nhân viên, Bác sĩ, Admin, profile chủ yếu dùng để xem thông tin tài khoản và đổi mật khẩu. Không dùng profile để xử lý nghiệp vụ như lịch hẹn, lưu trú, spa hoặc hóa đơn.

## Folder

```txt
features/profile/
├── pages/
│   ├── owner/
│   │   └── OwnerProfilePage.tsx
│   ├── staff/
│   │   └── StaffProfilePage.tsx
│   ├── doctor/
│   │   └── DoctorProfilePage.tsx
│   └── admin/
│       └── AdminProfilePage.tsx
├── components/
│   ├── UserMenu.tsx
│   ├── ProfileForm.tsx
│   ├── ChangePasswordForm.tsx
│   └── AvatarUploader.tsx
├── api/
│   ├── profile.api.ts
│   └── profile.keys.ts
├── hooks/
│   ├── useProfile.ts
│   ├── useUpdateProfile.ts
│   └── useChangePassword.ts
├── types/
│   └── profile.types.ts
└── schemas/
    ├── update-profile.schema.ts
    └── change-password.schema.ts
```

## Cách truy cập

Route profile vẫn tồn tại trong `app/`, nhưng không đưa vào sidebar. Người dùng truy cập qua avatar trên header.

```txt
/owner/profile
/staff/profile
/doctor/profile
/admin/profile
```

Ví dụ trong `AppHeader`:

```tsx
import { UserMenu } from '@/features/profile/components/UserMenu';

export function AppHeader() {
  return (
    <header>
      {/* Search */}
      {/* Help */}
      {/* NotificationButton */}
      <UserMenu />
    </header>
  );
}
```

Quy tắc quan trọng:

```txt
- Không thêm “Hồ sơ cá nhân” vào sidebar của Chủ nuôi.
- Không thêm “Hồ sơ cá nhân” vào sidebar của Nhân viên/Bác sĩ/Admin nếu không thật sự cần.
- Profile là thao tác tài khoản, nên đặt trong avatar menu trên header.
```

---

## 6. Quy tắc chia role trong feature

Không chia role ở top-level kiểu này:

```txt
features/
├── owner/
│   ├── boarding/
│   └── spa/
└── staff/
    ├── boarding/
    └── spa/
```

Cách này dễ bị lặp code.

Nên chia như này:

```txt
features/
├── boarding/
│   ├── pages/
│   │   ├── owner/
│   │   └── staff/
│   ├── components/
│   │   ├── owner/
│   │   ├── staff/
│   │   └── shared/
│   ├── api/
│   ├── hooks/
│   ├── types/
│   └── constants/
```

Lý do:

```txt
- Boarding của owner và staff vẫn cùng một nghiệp vụ.
- Cùng dùng status.
- Cùng dùng API hoặc type liên quan.
- Có nhiều component shared như badge, checklist, timeline.
```

Quy tắc:

```txt
Nếu UI/flow khác nhau theo role -> chia owner/staff/doctor/admin trong feature.
Nếu component dùng chung được -> cho vào shared.
Nếu feature chỉ một role dùng -> không cần chia role.
```

---

## 7. Quy tắc đặt tên file

## 7.1. Component

Dùng PascalCase:

```txt
StaffBoardingCard.tsx
CareUpdateDrawer.tsx
RejectBoardingModal.tsx
InvoiceStatusBadge.tsx
OwnerSpaServiceCard.tsx
```

## 7.2. Hook

Dùng camelCase và bắt đầu bằng `use`:

```txt
useBoardingList.ts
useBoardingDetail.ts
useConfirmBoarding.ts
useUpdateBoardingCare.ts
useInvoices.ts
```

## 7.3. Type

Dùng tên domain rõ ràng:

```txt
Boarding
BoardingDetail
BoardingStatus
SpaRequest
SpaStatus
Invoice
InvoiceStatus
Pet
PetSpecies
```

## 7.4. API file

Dùng format:

```txt
domain.api.ts
domain.keys.ts
```

Ví dụ:

```txt
boarding.api.ts
boarding.keys.ts
spa.api.ts
spa.keys.ts
```

## 7.5. Schema

Dùng format:

```txt
action-domain.schema.ts
```

Ví dụ:

```txt
create-pet.schema.ts
care-update.schema.ts
reject-boarding.schema.ts
complete-spa.schema.ts
```

---

## 8. Quy tắc viết page

Page trong `app/` phải mỏng.

Đúng:

```tsx
// app/(staff)/staff/invoices/page.tsx

import { StaffInvoiceListPage } from '@/features/invoices/pages/staff/StaffInvoiceListPage';

export default function Page() {
  return <StaffInvoiceListPage />;
}
```

Sai:

```tsx
// Không nên
export default function Page() {
  // 300 dòng render invoice, filter, modal, API, state...
}
```

Page trong feature mới chứa layout màn hình.

Ví dụ:

```tsx
// features/invoices/pages/staff/StaffInvoiceListPage.tsx

export function StaffInvoiceListPage() {
  return (
    <div>
      {/* PageHeader */}
      {/* FilterBar */}
      {/* Tabs */}
      {/* Invoice cards */}
    </div>
  );
}
```

---

## 9. Quy tắc gọi API

Không gọi API trực tiếp trong component bằng `fetch` rải rác.

Sai:

```tsx
useEffect(() => {
  fetch('/api/staff/boarding')
    .then(res => res.json())
    .then(setData);
}, []);
```

Đúng:

```txt
features/boarding/api/boarding.api.ts
features/boarding/hooks/useBoardingList.ts
```

Ví dụ:

```ts
// features/boarding/hooks/useBoardingList.ts

import { useQuery } from '@tanstack/react-query';
import { boardingApi } from '../api/boarding.api';
import { boardingKeys } from '../api/boarding.keys';

export function useBoardingList(params: unknown) {
  return useQuery({
    queryKey: boardingKeys.list(params),
    queryFn: () => boardingApi.getStaffList(params),
  });
}
```

Trong page:

```tsx
const { data, isLoading } = useBoardingList({ status: 'STAYING' });
```

---

## 10. API client dùng với Express

```ts
// src/lib/api-client.ts

import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Có thể redirect login hoặc clear auth store
    }

    return Promise.reject(error);
  }
);
```

`.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

---

## 11. React Query

Dùng React Query cho server state:

```txt
- danh sách thú cưng
- danh sách lưu trú
- chi tiết lưu trú
- danh sách spa
- hóa đơn
- lịch hẹn
- thông báo
```

Không dùng Zustand để lưu danh sách từ API.

## Query keys

```ts
// features/boarding/api/boarding.keys.ts

export const boardingKeys = {
  all: ['boarding'] as const,
  lists: () => [...boardingKeys.all, 'list'] as const,
  list: (params: unknown) => [...boardingKeys.lists(), params] as const,
  detail: (id: string) => [...boardingKeys.all, 'detail', id] as const,
};
```

## Mutation

```ts
// features/boarding/hooks/useConfirmBoarding.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { boardingApi } from '../api/boarding.api';
import { boardingKeys } from '../api/boarding.keys';

export function useConfirmBoarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boardingId, payload }: { boardingId: string; payload: unknown }) => {
      return boardingApi.confirm(boardingId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardingKeys.all });
    },
  });
}
```

---

## 12. Zustand dùng khi nào?

Dùng Zustand cho client UI state:

```txt
- user đang đăng nhập nếu cần cache client
- trạng thái đóng/mở sidebar
- theme
- thông báo global
```

Không dùng Zustand cho dữ liệu server như list boarding.

Ví dụ:

```ts
// stores/ui.store.ts

import { create } from 'zustand';

interface UiState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
```

---

## 13. Form và validation

Dùng:

```txt
react-hook-form
zod
@hookform/resolvers
```

Ví dụ schema cập nhật chăm sóc lưu trú:

```ts
// features/boarding/schemas/care-update.schema.ts

import { z } from 'zod';

export const careUpdateSchema = z.object({
  overallStatus: z.enum(['NORMAL', 'NEED_WATCHING', 'ABNORMAL'], {
    message: 'Vui lòng chọn trạng thái tổng quát',
  }),
  note: z.string().min(1, 'Vui lòng nhập ghi chú chăm sóc'),
  quickTags: z.array(z.string()).optional(),
  mediaIds: z.array(z.string()).optional(),
});

export type CareUpdateFormValues = z.infer<typeof careUpdateSchema>;
```

---

## 14. Upload ảnh/video

Dùng flow:

```txt
1. FE upload file qua /uploads
2. BE trả mediaId/url
3. FE gửi mediaIds trong payload nghiệp vụ
```

API upload:

```txt
POST /api/uploads
```

File:

```ts
// src/hooks/useUploadFile.ts

import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post('/uploads', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data;
}

export function useUploadFile() {
  return useMutation({
    mutationFn: uploadFile,
  });
}
```

Payload cập nhật chăm sóc:

```ts
{
  overallStatus: 'NORMAL',
  note: 'Ăn uống bình thường, đi vệ sinh tốt.',
  quickTags: ['Ăn tốt', 'Vệ sinh tốt'],
  mediaIds: ['media_001', 'media_002']
}
```

---

## 15. Constants trạng thái

Không hard-code tiếng Việt khắp nơi. Tạo constants.

```ts
// src/constants/status.ts

export const boardingStatusLabel = {
  PENDING_CONFIRMATION: 'Chờ xác nhận',
  WAITING_CHECK_IN: 'Chờ check-in',
  STAYING: 'Đang lưu trú',
  CHECKED_OUT: 'Đã trả thú cưng',
  CANCELLED: 'Đã hủy',
} as const;

export const spaStatusLabel = {
  WAITING_ACCEPT: 'Chờ tiếp nhận',
  ACCEPTED: 'Đã tiếp nhận',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
} as const;

export const invoiceStatusLabel = {
  UNPAID: 'Chưa thanh toán',
  WAITING_AT_COUNTER: 'Chờ thanh toán tại quầy',
  PAID: 'Đã thanh toán',
  CANCELLED: 'Đã hủy',
} as const;
```

Dùng:

```tsx
boardingStatusLabel[boarding.status]
```

---

## 16. Sidebar config

Không hard-code menu trong sidebar JSX. Dùng config.

Lưu ý: `Thông báo` không nằm trong sidebar. Icon thông báo nằm trong `AppHeader`.

```ts
// src/constants/sidebar.ts

import {
  LayoutDashboard,
  Calendar,
  PawPrint,
  Scissors,
  Bed,
  Receipt,
} from 'lucide-react';

export const staffSidebarItems = [
  {
    label: 'Tổng quan',
    href: '/staff/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Lịch hẹn',
    href: '/staff/appointments',
    icon: Calendar,
  },
  {
    label: 'Hồ sơ thú cưng',
    href: '/staff/pets',
    icon: PawPrint,
  },
  {
    label: 'Dịch vụ spa',
    href: '/staff/spa',
    icon: Scissors,
  },
  {
    label: 'Lưu trú',
    href: '/staff/boarding',
    icon: Bed,
  },
  {
    label: 'Hóa đơn',
    href: '/staff/invoices',
    icon: Receipt,
  },
];
```

---

## 17. Route constants

```ts
// src/constants/routes.ts

export const ROUTES = {
  STAFF: {
    DASHBOARD: '/staff/dashboard',
    APPOINTMENTS: '/staff/appointments',
    PETS: '/staff/pets',
    SPA: '/staff/spa',
    BOARDING: '/staff/boarding',
    INVOICES: '/staff/invoices',
    // Route này vẫn tồn tại để mở từ icon thông báo trên header, không hiển thị trong sidebar.
    NOTIFICATIONS: '/staff/notifications',
  },
  OWNER: {
    DASHBOARD: '/owner/dashboard',
    PETS: '/owner/pets',
    SPA: '/owner/spa',
    BOARDING: '/owner/boarding',
    INVOICES: '/owner/invoices',
    // Route này mở từ avatar menu trên header, không hiển thị trong sidebar.
    PROFILE: '/owner/profile',
    // Route này mở từ icon thông báo trên header, không hiển thị trong sidebar.
    NOTIFICATIONS: '/owner/notifications',
  },
};
```

Dùng:

```tsx
router.push(ROUTES.STAFF.BOARDING);
```

Không nên viết string route rải rác khắp code.

---

## 18. Middleware và phân quyền

```ts
// src/middleware.ts

import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('accessToken')?.value;

  if (!token && !pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/owner/:path*', '/staff/:path*', '/doctor/:path*', '/admin/:path*'],
};
```

Nếu dùng JWT, backend nên trả role trong token hoặc endpoint `/auth/me`. Frontend dùng role để redirect về đúng dashboard.

---

## 19. API Express đề xuất cho FE

## Auth

```txt
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/logout
GET    /api/auth/me
```

## Staff Boarding

```txt
GET    /api/staff/boarding
GET    /api/staff/boarding/:id
POST   /api/staff/boarding
PATCH  /api/staff/boarding/:id/confirm
PATCH  /api/staff/boarding/:id/reject
PATCH  /api/staff/boarding/:id/check-in
POST   /api/staff/boarding/:id/care-logs
PATCH  /api/staff/boarding/:id/check-out
```

## Staff Spa

```txt
GET    /api/staff/spa-requests
GET    /api/staff/spa-requests/:id
POST   /api/staff/spa-requests
PATCH  /api/staff/spa-requests/:id/accept
PATCH  /api/staff/spa-requests/:id/complete
PATCH  /api/staff/spa-requests/:id/cancel
```

## Staff Pets

```txt
GET    /api/staff/pets
GET    /api/staff/pets/:id
POST   /api/staff/pets
PATCH  /api/staff/pets/:id
GET    /api/staff/owners/search
POST   /api/staff/owners
```

## Staff Invoices

```txt
GET    /api/staff/invoices
GET    /api/staff/invoices/:id
PATCH  /api/staff/invoices/:id/confirm-payment
GET    /api/staff/invoices/:id/download
```

## Owner Boarding

```txt
GET    /api/owner/boarding
GET    /api/owner/boarding/:id
POST   /api/owner/boarding
```

## Owner Spa

```txt
GET    /api/owner/spa-services
GET    /api/owner/spa-requests
GET    /api/owner/spa-requests/:id
POST   /api/owner/spa-requests
```

## Doctor

```txt
GET    /api/doctor/schedule
GET    /api/doctor/examinations
GET    /api/doctor/examinations/:id
POST   /api/doctor/medical-records
POST   /api/doctor/prescriptions
```

## Admin

```txt
GET    /api/admin/dashboard
GET    /api/admin/users
POST   /api/admin/users
PATCH  /api/admin/users/:id
GET    /api/admin/staff
GET    /api/admin/doctors
```

---

## 20. Quy tắc UI theo nghiệp vụ đã chốt

## 20.1. Dịch vụ spa

Trạng thái:

```txt
Chờ tiếp nhận
Đã tiếp nhận
Hoàn tất
Đã hủy
```

Không dùng:

```txt
Đang thực hiện
Đang xử lý
Chờ xác nhận
```

Action:

```txt
Chờ tiếp nhận -> Tiếp nhận, Xem
Đã tiếp nhận  -> Hoàn tất, Xem
Hoàn tất      -> Xem
Đã hủy        -> Xem
```

## 20.2. Lưu trú

Tabs:

```txt
Tất cả
Chờ xác nhận
Chờ check-in
Đang lưu trú
Lịch sử
```

Action:

```txt
Chờ xác nhận -> Xác nhận, Từ chối, Xem
Chờ check-in -> Check-in ngay, Xem
Đang lưu trú -> Cập nhật, Check-out, Xem
Lịch sử      -> Xem
```

Cập nhật chăm sóc dùng drawer, không dùng modal:

```txt
Drawer bên phải
- Thông tin tóm tắt
- Thời gian cập nhật
- Trạng thái tổng quát
- Ghi chú chăm sóc
- Ghi nhận nhanh
- Upload ảnh/video
```

## 20.3. Hóa đơn

Không tạo hóa đơn thủ công từ màn hóa đơn.

Hóa đơn sinh từ:

```txt
- Đặt spa
- Tạo yêu cầu spa tại quầy
- Đặt lưu trú
- Tạo lưu trú tại quầy
```

Màn hóa đơn chỉ dùng để:

```txt
- Tra cứu
- Lọc
- Xem chi tiết
- Xác nhận thanh toán tại quầy
- Tải/in hóa đơn
```

---

## 21. Quy tắc code review cho team

Trước khi merge code, reviewer cần kiểm tra các điểm sau:

```txt
1. `page.tsx` có mỏng không?
2. Component nghiệp vụ có nằm đúng feature không?
3. API có nằm trong `features/<domain>/api/` không?
4. Hook gọi API có nằm trong `features/<domain>/hooks/` không?
5. Type nghiệp vụ có nằm trong `features/<domain>/types/` không?
6. Schema form có nằm trong `features/<domain>/schemas/` không?
7. Có hard-code status tiếng Việt rải rác không?
8. Có dùng constants cho role/status/route/sidebar không?
9. Có trộn trạng thái thanh toán với trạng thái nghiệp vụ không?
10. Có dùng component shared đúng chỗ không?
11. Có đặt tên file rõ role/domain không?
12. Có thêm nghiệp vụ sai role không?
13. Có lỡ thêm Thông báo vào sidebar không?
14. Có dùng shadcn/ui cho các UI primitive chưa?
15. Có tự build lại Button/Input/Select/Dialog/Sheet trong feature không?
16. Có đưa logic nghiệp vụ vào `components/ui/` không?
17. Có dùng Dialog cho modal ngắn và Sheet cho drawer dài đúng chưa?
18. Có đặt component nghiệp vụ trong feature thay vì sửa component shadcn/ui theo từng màn không?
19. Có gọi API trực tiếp trong component bằng fetch/axios rải rác không?
20. Có dùng React Query cho server state thay vì Zustand không?
21. UI có tuân theo docs/design.md không?
22. Có hard-code màu ngoài design token không?
23. Có hard-code font size/radius/shadow ngoài design token không?
24. Component shadcn/ui đã được custom theo design.md chưa?
25. Badge/status có dùng đúng Semantic Palette không?
26. Sidebar/Header có đúng quy tắc trong design.md không?
```

---

### 21.1. Quy tắc kiểm tra `page.tsx`

`page.tsx` trong `src/app/` chỉ nên làm nhiệm vụ route và gọi page component từ feature.

Đúng:

```tsx
// app/(staff)/staff/boarding/page.tsx

import { StaffBoardingListPage } from '@/features/boarding/pages/staff/StaffBoardingListPage';

export default function Page() {
  return <StaffBoardingListPage />;
}
```

Sai:

```tsx
// Không nên

export default function Page() {
  // Gọi API
  // Render list
  // Xử lý modal
  // Xử lý drawer
  // Validate form
  // Viết toàn bộ UI ở đây
}
```

Nếu `page.tsx` dài quá nhiều dòng hoặc chứa nhiều logic nghiệp vụ thì phải tách vào `features/`.

---

### 21.2. Quy tắc kiểm tra vị trí component

Component nghiệp vụ phải nằm trong đúng feature.

Ví dụ đúng:

```txt
features/boarding/components/staff/StaffBoardingCard.tsx
features/boarding/components/staff/CareUpdateDrawer.tsx
features/spa/components/staff/StaffSpaRequestCard.tsx
features/invoices/components/staff/StaffInvoiceCard.tsx
features/pets/components/staff/CreatePetForm.tsx
```

Ví dụ sai:

```txt
components/common/StaffBoardingCard.tsx
components/common/CareUpdateDrawer.tsx
components/common/StaffInvoiceCard.tsx
```

Lý do:

```txt
- `components/common/` chỉ dành cho component chung.
- Component có nghiệp vụ cụ thể phải nằm trong feature.
- Tránh làm folder common bị phình to và khó quản lý.
```

---

### 21.3. Quy tắc kiểm tra shadcn/ui

Dự án dùng shadcn/ui cho UI primitive.

Reviewer cần kiểm tra:

```txt
- Button có dùng từ `components/ui/button` không?
- Input có dùng từ `components/ui/input` không?
- Select có dùng từ `components/ui/select` không?
- Dialog có dùng cho modal ngắn không?
- Sheet có dùng cho drawer bên phải không?
- DropdownMenu có dùng cho avatar menu hoặc notification dropdown không?
- Toast có dùng sonner hoặc hệ thống toast chung không?
```

Ví dụ đúng:

```tsx
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Sheet } from '@/components/ui/sheet';
```

Ví dụ sai:

```tsx
// Sai: tự build modal bằng div fixed trong feature

<div className="fixed inset-0 z-50 bg-black/40">
  <div className="mx-auto mt-20 w-125 bg-white">
    ...
  </div>
</div>
```

Với modal ngắn:

```txt
Dùng Dialog.
```

Ví dụ:

```txt
ConfirmPaymentModal
RejectBoardingModal
ConfirmBoardingModal
AcceptSpaModal
```

Với drawer/form dài:

```txt
Dùng Sheet.
```

Ví dụ:

```txt
CareUpdateDrawer
CheckInDrawer
CheckOutDrawer
NotificationDrawer
```

---

### 21.4. Quy tắc kiểm tra `components/ui/`

`components/ui/` chỉ chứa UI primitive từ shadcn/ui.

Không được đưa logic nghiệp vụ vào đây.

Sai:

```tsx
// Sai: components/ui/button.tsx không được biết boardingStatus

export function Button({ boardingStatus }) {
  if (boardingStatus === 'pending') {
    return <button>Xác nhận lưu trú</button>;
  }

  return <button>Xem</button>;
}
```

Đúng:

```txt
Logic nghiệp vụ nằm trong feature.
```

Ví dụ:

```txt
features/boarding/components/staff/StaffBoardingActions.tsx
features/invoices/components/staff/InvoiceActions.tsx
features/spa/components/staff/SpaRequestActions.tsx
```

Nếu cần variant dùng chung toàn app thì được chỉnh `components/ui/button.tsx`.

Ví dụ có thể thêm variant:

```txt
primary
secondary
outline
destructive
ghost
warning
```

Nhưng không được sửa component shadcn/ui chỉ để phục vụ riêng một màn.

---

### 21.5. Quy tắc kiểm tra API và hooks

Không gọi API trực tiếp rải rác trong component.

Sai:

```tsx
useEffect(() => {
  fetch('/api/staff/boarding')
    .then((res) => res.json())
    .then(setData);
}, []);
```

Đúng:

```txt
features/boarding/api/boarding.api.ts
features/boarding/hooks/useBoardingList.ts
```

Ví dụ:

```ts
// features/boarding/hooks/useBoardingList.ts

import { useQuery } from '@tanstack/react-query';
import { boardingApi } from '../api/boarding.api';
import { boardingKeys } from '../api/boarding.keys';

export function useBoardingList(params: unknown) {
  return useQuery({
    queryKey: boardingKeys.list(params),
    queryFn: () => boardingApi.getStaffList(params),
  });
}
```

Trong page component:

```tsx
const { data, isLoading } = useBoardingList({
  status: 'staying',
});
```

---

### 21.6. Quy tắc kiểm tra role

Reviewer cần đảm bảo không thêm nghiệp vụ sai role.

Nhân viên không được:

```txt
- Sửa chẩn đoán
- Kê đơn thuốc
- Sửa bệnh án
- Sửa kết quả khám
- Quản lý tài khoản hệ thống
- Quản lý cấu hình hệ thống
```

Bác sĩ không nên làm nghiệp vụ vận hành quầy như:

```txt
- Xác nhận thanh toán hóa đơn tại quầy
- Check-in lưu trú
- Check-out lưu trú
- Tiếp nhận spa
```

Admin không nên làm nghiệp vụ vận hành hằng ngày như:

```txt
- Tiếp nhận spa
- Cập nhật chăm sóc lưu trú
- Check-in thú cưng
- Check-out thú cưng
- Khám bệnh
- Kê đơn
```

Chủ nuôi không được:

```txt
- Xác nhận lịch hẹn
- Tiếp nhận spa
- Cập nhật chăm sóc lưu trú
- Xác nhận thanh toán tại quầy
- Sửa hồ sơ thú cưng của người khác
```

---

### 21.7. Quy tắc kiểm tra notification

Thông báo không nằm trong sidebar.

Reviewer cần kiểm tra:

```txt
- Sidebar owner không có Thông báo.
- Sidebar staff không có Thông báo.
- Sidebar doctor không có Thông báo.
- Sidebar admin không có Thông báo.
- NotificationButton nằm trong AppHeader.
- Route /notifications vẫn tồn tại để xem tất cả thông báo.
```

Đúng:

```txt
Header
- Search
- Help icon
- Notification icon
- Avatar
- User menu
```

Sai:

```txt
Sidebar
- Tổng quan
- Lưu trú
- Hóa đơn
- Thông báo
```

---

### 21.8. Quy tắc kiểm tra status

Không hard-code status tiếng Việt rải rác trong component.

Sai:

```tsx
if (boarding.status === 'staying') {
  return <Badge>Đang lưu trú</Badge>;
}
```

Đúng:

```tsx
import { boardingStatusLabel } from '@/features/boarding/constants/boarding.constants';

<Badge>{boardingStatusLabel[boarding.status]}</Badge>
```

Hoặc dùng component shared:

```tsx
<BoardingStatusBadge status={boarding.status} />
```

Reviewer cần kiểm tra các status có khớp với backend/schema không.

Ví dụ:

```txt
boarding:
pending_payment
pending
confirmed
staying
checked_out
rejected
cancelled

spa/grooming:
pending_payment
pending
waiting
in_progress
completed
cancelled

invoice:
draft
pending_payment
paid
cancelled
refunded
```

---

### 21.9. Quy tắc kiểm tra thanh toán

Không trộn trạng thái thanh toán với trạng thái nghiệp vụ.

Ví dụ với lưu trú:

```txt
Trạng thái lưu trú:
- Chờ xác nhận
- Chờ check-in
- Đang lưu trú
- Đã trả thú cưng
- Đã hủy

Trạng thái thanh toán:
- Chờ thanh toán
- Đã thanh toán
- Đã cọc
- Không phát sinh thanh toán
```

Sai:

```txt
Badge chính của card lưu trú hiển thị "Chưa thanh toán"
```

Đúng:

```txt
Badge chính của card lưu trú hiển thị "Đang lưu trú"
Dòng thanh toán riêng hiển thị "Tại trung tâm · Đã cọc 30%"
```

---

### 21.10. Ví dụ lỗi cần reject

```txt
- Nhân viên sửa chẩn đoán trong pet edit form.
- Nhân viên kê đơn thuốc.
- Nhân viên sửa bệnh án chuyên môn.
- Spa có trạng thái Đang thực hiện nếu UI đã chốt không hiển thị trạng thái này.
- Hóa đơn có nút Tạo hóa đơn thủ công.
- Boarding tab Chờ xác nhận hiển thị cả Đang lưu trú.
- `page.tsx` dài 500 dòng.
- Component BoardingCard đặt ở components/common.
- Thông báo xuất hiện trong sidebar thay vì header.
- Tự tạo Button riêng trong features/boarding/components/Button.tsx.
- Tự build modal bằng div fixed thay vì dùng Dialog.
- Tự build drawer bằng div absolute thay vì dùng Sheet.
- Sửa components/ui/button.tsx chỉ để phục vụ riêng màn Lưu trú.
- Đưa logic boardingStatus vào components/ui/button.tsx.
- Component shadcn/ui bị sửa làm hỏng style ở các màn khác.
- Gọi fetch/axios trực tiếp trong component thay vì qua feature api/hook.
- Dùng Zustand để lưu danh sách từ API thay vì React Query.
- Hard-code label trạng thái trong nhiều component.
- Trộn trạng thái thanh toán vào trạng thái nghiệp vụ.
- Đặt type Boarding vào src/types thay vì features/boarding/types.
- Đặt ConfirmPaymentModal vào components/modals thay vì features/invoices/components/staff.
- Hard-code màu #00796B, #F59E0B, #F7F6EA trực tiếp khắp component thay vì dùng token.
- Tự đặt font size tuỳ ý không theo typography trong design.md.
- Card dùng radius/shadow khác design.md.
- Button shadcn/ui dùng style mặc định lệch với design.md.
- Badge trạng thái dùng màu không nằm trong Semantic Palette.
- Sidebar có Thông báo hoặc Hồ sơ cá nhân dù design.md đã quy định đặt trên header.
```

---

### 21.11. Checklist merge nhanh

Trước khi approve PR, reviewer có thể rà nhanh theo checklist này:

```txt
Architecture:
[ ] page.tsx mỏng
[ ] Feature đúng domain
[ ] Component đúng vị trí
[ ] API nằm trong feature/api
[ ] Hook nằm trong feature/hooks
[ ] Type nằm trong feature/types
[ ] Schema nằm trong feature/schemas

UI:
[ ] Dùng shadcn/ui primitive
[ ] Không tự build Button/Input/Dialog/Sheet
[ ] Modal ngắn dùng Dialog
[ ] Drawer dài dùng Sheet
[ ] Không đưa nghiệp vụ vào components/ui

Role:
[ ] Không sai quyền role
[ ] Nhân viên không thao tác nghiệp vụ bác sĩ
[ ] Admin không thao tác vận hành hằng ngày
[ ] Chủ nuôi không thao tác nghiệp vụ nội bộ

Status:
[ ] Không hard-code status
[ ] Status khớp backend/schema
[ ] Không trộn thanh toán với nghiệp vụ

Notification:
[ ] Không có Thông báo trong sidebar
[ ] Notification nằm trên header

Data:
[ ] Server state dùng React Query
[ ] Client UI state mới dùng Zustand
```

## 22. Quy trình thêm một màn mới

Ví dụ thêm màn `Staff Boarding Detail`:

Bước 1: Tạo route.

```txt
app/(staff)/staff/boarding/[boardingId]/page.tsx
```

Bước 2: Tạo page component trong feature.

```txt
features/boarding/pages/staff/StaffBoardingDetailPage.tsx
```

Bước 3: Tạo component con nếu cần.

```txt
features/boarding/components/staff/BoardingDetailLeftColumn.tsx
features/boarding/components/staff/BoardingDetailRightColumn.tsx
```

Bước 4: Tạo hook gọi API.

```txt
features/boarding/hooks/useBoardingDetail.ts
```

Bước 5: Bổ sung API nếu chưa có.

```txt
features/boarding/api/boarding.api.ts
```

Bước 6: Bổ sung type nếu thiếu.

```txt
features/boarding/types/boarding.types.ts
```

Bước 7: Gắn route từ icon mắt.

```tsx
router.push(`/staff/boarding/${boarding.id}`);
```

---

## 23. Những điều tuyệt đối không nên làm

```txt
1. Không dồn toàn bộ component vào components/.
2. Không để page.tsx xử lý quá nhiều logic.
3. Không gọi fetch/axios trực tiếp rải rác trong component.
4. Không hard-code label status khắp nơi.
5. Không trộn UI owner và staff trong cùng một component quá nhiều if/else.
6. Không cho nhân viên thao tác nghiệp vụ bác sĩ.
7. Không cho admin làm nghiệp vụ vận hành hằng ngày.
8. Không cho hóa đơn tạo thủ công nếu không gắn nghiệp vụ gốc.
9. Không dùng Zustand thay React Query cho dữ liệu server.
10. Không đặt tên file chung chung như Card.tsx, Modal.tsx trong feature lớn.
```

---

## 24. Checklist setup thư viện

Dự án dùng các thư viện chính sau:

```txt
axios                 -> gọi API tới Express backend
@tanstack/react-query -> quản lý server state
zustand               -> quản lý client UI state
react-hook-form       -> quản lý form
zod                   -> validate form schema
@hookform/resolvers   -> kết nối zod với react-hook-form
lucide-react          -> icon
shadcn/ui             -> UI primitive
tailwindcss           -> styling
```

---

### 24.1. Cài thư viện nền tảng

Cài các thư viện bắt buộc:

```bash
npm install axios @tanstack/react-query zustand react-hook-form zod @hookform/resolvers lucide-react
```

Ý nghĩa:

```txt
axios
-> Dùng trong `src/lib/api-client.ts` để gọi API Express.

@tanstack/react-query
-> Dùng cho server state: danh sách thú cưng, lưu trú, spa, hóa đơn, lịch hẹn, thông báo.

zustand
-> Dùng cho client UI state: sidebar collapsed, user menu, notification count nếu cần.

react-hook-form
-> Dùng để quản lý form.

zod
-> Dùng để validate dữ liệu form.

@hookform/resolvers
-> Kết nối zod schema với react-hook-form.

lucide-react
-> Dùng icon cho sidebar, header, button, empty state.
```

---

### 24.2. Cài Tailwind và utility class

Nếu dự án chưa có Tailwind, cài:

```bash
npm install tailwindcss class-variance-authority clsx tailwind-merge
```

Ý nghĩa:

```txt
tailwindcss
-> Styling chính của dự án.

class-variance-authority
-> Quản lý variant cho component như Button, Badge.

clsx
-> Ghép className có điều kiện.

tailwind-merge
-> Merge class Tailwind tránh bị conflict.
```

Lưu ý:

```txt
- Nếu Next.js project đã tạo sẵn Tailwind thì không cần setup lại từ đầu.
- Vẫn cần `class-variance-authority`, `clsx`, `tailwind-merge` vì shadcn/ui thường dùng các utility này.
```

---

### 24.3. Khởi tạo shadcn/ui

Dự án dùng **shadcn/ui** cho UI primitive.

Khởi tạo shadcn/ui:

```bash
npx shadcn@latest init
```

Khi chạy lệnh init, chọn cấu hình phù hợp với project Next.js:

```txt
Style: Default hoặc New York
Base color: Zinc hoặc Neutral
CSS variables: Yes
Tailwind config: tailwind.config.ts
Global CSS: src/app/globals.css
Components path: src/components
Utils path: src/lib/utils
React Server Components: Yes
```

Khuyến nghị:

```txt
- Dùng CSS variables: Yes
- Components path: src/components
- UI component path sau khi add sẽ là: src/components/ui
- Utils path nên là: src/lib/utils
```

---

### 24.4. Cài các component shadcn/ui dùng từ đầu

Chạy lệnh:

```bash
npx shadcn@latest add button input textarea select badge card tabs dialog sheet dropdown-menu popover calendar avatar table skeleton separator alert sonner
```

Sau khi chạy, shadcn/ui sẽ tạo các file trong:

```txt
src/components/ui/
```

Ví dụ:

```txt
src/components/ui/button.tsx
src/components/ui/input.tsx
src/components/ui/textarea.tsx
src/components/ui/select.tsx
src/components/ui/badge.tsx
src/components/ui/card.tsx
src/components/ui/tabs.tsx
src/components/ui/dialog.tsx
src/components/ui/sheet.tsx
src/components/ui/dropdown-menu.tsx
src/components/ui/popover.tsx
src/components/ui/calendar.tsx
src/components/ui/avatar.tsx
src/components/ui/table.tsx
src/components/ui/skeleton.tsx
src/components/ui/separator.tsx
src/components/ui/alert.tsx
src/components/ui/sonner.tsx
```

---

### 24.5. Mapping component shadcn/ui trong dự án

```txt
button
-> Nút thao tác: Lưu, Hủy, Xác nhận, Từ chối, Xem, Check-in, Check-out.

input
-> Ô nhập text: tìm kiếm, tên thú cưng, số điện thoại, email.

textarea
-> Ghi chú chăm sóc, lý do từ chối, mô tả triệu chứng, ghi chú thanh toán.

select
-> Dropdown chọn trạng thái, loại dịch vụ, thú cưng, phòng, bác sĩ.

badge
-> Hiển thị trạng thái: Chờ xác nhận, Đang lưu trú, Đã thanh toán, Đã hủy.

card
-> Card dashboard, card lưu trú, card spa, card hóa đơn, card thông tin thú cưng.

tabs
-> Tabs trạng thái: Tất cả, Chờ xác nhận, Chờ check-in, Đang lưu trú, Lịch sử.

dialog
-> Modal xác nhận ngắn.

sheet
-> Drawer bên phải cho form dài.

dropdown-menu
-> Avatar menu, notification dropdown nếu không dùng drawer.

popover
-> Filter nâng cao, date picker, quick action.

calendar
-> Chọn ngày đặt lịch, ngày lưu trú, ngày hẹn.

avatar
-> Avatar người dùng, avatar thú cưng nếu cần.

table
-> Bảng dữ liệu nếu màn phù hợp dạng bảng, ví dụ admin user list.

skeleton
-> Loading state.

separator
-> Chia nhóm nội dung trong card, drawer, detail page.

alert
-> Cảnh báo trong form hoặc flow, ví dụ lưu trú chưa thanh toán đủ.

sonner
-> Toast thông báo thành công/thất bại.
```

---

### 24.6. Quy tắc dùng Dialog và Sheet

Trong shadcn/ui:

```txt
Dialog -> dùng cho modal ngắn.
Sheet  -> dùng cho drawer bên phải hoặc form dài.
```

Dùng `Dialog` cho:

```txt
ConfirmPaymentModal
RejectBoardingModal
ConfirmBoardingModal
AcceptSpaModal
CompleteSpaModal
RejectAppointmentModal
ConfirmAppointmentModal
```

Dùng `Sheet` cho:

```txt
CareUpdateDrawer
CheckInDrawer
CheckOutDrawer
NotificationDrawer
OwnerProfileDrawer nếu có
```

Không được tự build modal/drawer bằng `div fixed` nếu shadcn/ui đã có `Dialog` và `Sheet`.

Sai:

```tsx
<div className="fixed inset-0 z-50 bg-black/40">
  <div className="mx-auto mt-20 w-130 bg-white">
    ...
  </div>
</div>
```

Đúng:

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
```

Hoặc:

```tsx
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
```

---

### 24.7. Quy tắc không tạo trùng UI primitive

Team không được tạo component UI primitive trùng tên ở nơi khác.

Không được làm:

```txt
features/boarding/components/Button.tsx
features/spa/components/Modal.tsx
features/invoices/components/Input.tsx
components/common/Button.tsx
components/common/Modal.tsx
components/common/Drawer.tsx
```

Vì các primitive này đã có trong:

```txt
src/components/ui/
```

Nếu cần custom theo nghiệp vụ, tạo wrapper rõ nghĩa trong feature.

Ví dụ đúng:

```txt
features/boarding/components/staff/ConfirmBoardingModal.tsx
features/boarding/components/staff/RejectBoardingModal.tsx
features/boarding/components/staff/CareUpdateDrawer.tsx
features/invoices/components/staff/ConfirmPaymentModal.tsx
features/spa/components/staff/CompleteSpaModal.tsx
```

Các wrapper này được phép dùng:

```txt
Button
Input
Textarea
Select
Dialog
Sheet
Card
Badge
```

từ:

```txt
src/components/ui/
```

---

### 24.8. File `src/lib/utils.ts`

shadcn/ui thường cần helper `cn`.

Đảm bảo có file:

```txt
src/lib/utils.ts
```

Nội dung:

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Dùng:

```tsx
className={cn(
  'rounded-xl px-4 py-2',
  active && 'bg-primary text-white'
)}
```

---

### 24.9. Setup Toaster

Nếu dùng `sonner`, đặt toaster ở root layout.

Ví dụ:

```tsx
// src/app/layout.tsx

import { Toaster } from '@/components/ui/sonner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
```

Dùng toast trong feature:

```tsx
import { toast } from 'sonner';

toast.success('Đã cập nhật chăm sóc.');
toast.error('Có lỗi xảy ra, vui lòng thử lại.');
```

---

### 24.10. Checklist sau khi setup

Sau khi setup thư viện, kiểm tra:

```txt
[ ] Đã cài axios.
[ ] Đã cài @tanstack/react-query.
[ ] Đã cài zustand.
[ ] Đã cài react-hook-form.
[ ] Đã cài zod.
[ ] Đã cài @hookform/resolvers.
[ ] Đã cài lucide-react.
[ ] Đã init shadcn/ui.
[ ] Đã add các component shadcn/ui cần thiết.
[ ] Đã có src/components/ui/button.tsx.
[ ] Đã có src/components/ui/dialog.tsx.
[ ] Đã có src/components/ui/sheet.tsx.
[ ] Đã có src/components/ui/sonner.tsx.
[ ] Đã có src/lib/utils.ts với hàm cn.
[ ] Đã gắn Toaster ở root layout.
[ ] Không có Button/Input/Modal/Drawer tự build trùng ở feature/common.
```

---

### 24.11. Nguyên tắc chốt

```txt
- shadcn/ui dùng cho UI primitive.
- UI primitive nằm trong src/components/ui.
- Không tự build lại Button/Input/Dialog/Sheet.
- Không đưa logic nghiệp vụ vào components/ui.
- Component nghiệp vụ đặt trong features.
- Modal ngắn dùng Dialog.
- Drawer dài dùng Sheet.
- Toast dùng Sonner.
```


## 25. Kết luận kiến trúc

Kiến trúc cuối cùng team cần theo:

```txt
src/app        -> route theo role
src/layouts    -> layout theo role
src/features   -> nghiệp vụ theo domain
src/components -> UI dùng chung
src/lib        -> nền tảng gọi API, format, auth
src/hooks      -> hook dùng chung
src/stores     -> client state global
src/constants  -> route, role, status, sidebar
src/types      -> type dùng chung
```

Mẫu chia feature chuẩn:

```txt
features/domain/
├── pages/
│   ├── owner/
│   ├── staff/
│   ├── doctor/
│   └── admin/
├── components/
│   ├── owner/
│   ├── staff/
│   ├── doctor/
│   ├── admin/
│   └── shared/
├── api/
├── hooks/
├── types/
├── constants/
├── schemas/
└── utils/
```

Nguyên tắc chốt:

```txt
- App Router quản lý route.
- Layout quản lý khung theo role.
- Feature quản lý nghiệp vụ theo domain.
- Component chung không chứa nghiệp vụ cụ thể.
- API không viết rải rác trong component.
- Status/role/route/sidebar phải có constants.
- UI/flow khác role thì chia role trong feature.
- Component dùng lại trong cùng một domain thì để shared trong feature.
- UI primitive dùng shadcn/ui và nằm trong src/components/ui.
- Không tự build lại Button/Input/Select/Dialog/Sheet nếu shadcn/ui đã có.
- Modal xác nhận ngắn dùng Dialog của shadcn/ui.
- Drawer/form dài dùng Sheet của shadcn/ui.
- Toast dùng Sonner hoặc hệ thống toast chung.
- Logic nghiệp vụ không nằm trong components/ui.
- Component nghiệp vụ phải đặt trong features/<domain>/components.
- Form nghiệp vụ phải đặt trong features/<domain>/components hoặc features/<domain>/pages, schema đặt trong features/<domain>/schemas.
- Server state dùng React Query.
- Client UI state mới dùng Zustand.
- Không đưa Thông báo vào sidebar; Thông báo nằm trên AppHeader.
```

Quy tắc riêng về shadcn/ui:

```txt
Dự án dùng shadcn/ui cho UI primitive.

src/components/ui/
-> Chỉ chứa component primitive do shadcn/ui sinh ra như button, input, select, dialog, sheet, card, badge, tabs.

src/components/common/
-> Chứa component chung tự viết, có thể dùng shadcn/ui bên trong.

src/features/<domain>/components/
-> Chứa component nghiệp vụ như StaffBoardingCard, CareUpdateDrawer, RejectBoardingModal, StaffInvoiceCard.

Không sửa component shadcn/ui chỉ để phục vụ riêng một màn.
Nếu cần style riêng cho một nghiệp vụ, tạo wrapper trong feature.
Nếu cần variant dùng chung toàn app, mới bổ sung vào component shadcn/ui tương ứng.
```

Ví dụ đúng:

```txt
components/ui/button.tsx
-> Button primitive từ shadcn/ui.

features/boarding/components/staff/RejectBoardingModal.tsx
-> Modal nghiệp vụ từ chối lưu trú, dùng Dialog từ components/ui/dialog.

features/boarding/components/staff/CareUpdateDrawer.tsx
-> Drawer cập nhật chăm sóc, dùng Sheet từ components/ui/sheet.

features/invoices/components/staff/ConfirmPaymentModal.tsx
-> Modal xác nhận thanh toán, dùng Dialog từ components/ui/dialog.
```

Ví dụ sai:

```txt
features/boarding/components/Button.tsx
-> Sai vì tự tạo Button riêng.

features/spa/components/Modal.tsx
-> Sai vì tự tạo Modal riêng.

components/ui/button.tsx chứa logic boardingStatus
-> Sai vì components/ui không được chứa nghiệp vụ.

components/common/StaffBoardingCard.tsx
-> Sai vì card lưu trú của nhân viên là component nghiệp vụ, phải đặt trong features/boarding.
```
