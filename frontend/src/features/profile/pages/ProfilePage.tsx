"use client"

import { useEffect, useState } from "react"
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { authApi } from "@/features/auth/api/auth.api"
import { updateStoredUser } from "@/features/auth/api/auth-session"
import type { AuthUser, ChangePasswordPayload, UpdateProfilePayload } from "@/features/auth/types/auth.types"
import { cn } from "@/lib/utils"

type ProfileSection = "personal" | "security"

const roleLabels: Record<AuthUser["role"], string> = {
  OWNER: "Chủ nuôi",
  STAFF: "Nhân viên",
  DOCTOR: "Bác sĩ",
  ADMIN: "Quản trị viên",
}

const emptyProfile: UpdateProfilePayload = {
  fullName: "",
  phoneNumber: "",
  address: "",
}

const emptyPassword: ChangePasswordPayload = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
}

export function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profileForm, setProfileForm] = useState<UpdateProfilePayload>(emptyProfile)
  const [passwordForm, setPasswordForm] = useState<ChangePasswordPayload>(emptyPassword)
  const [activeSection, setActiveSection] = useState<ProfileSection>("personal")
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [showPasswords, setShowPasswords] = useState(false)

  const loadProfile = async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const currentUser = await authApi.me()
      setUser(currentUser)
      setProfileForm({
        fullName: currentUser.fullName,
        phoneNumber: currentUser.phoneNumber ?? "",
        address: currentUser.address ?? "",
      })
      updateStoredUser(currentUser)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Không thể tải hồ sơ cá nhân.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (window.location.hash === "#security") {
        setActiveSection("security")
      }
      void loadProfile()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSavingProfile(true)
    try {
      const updatedUser = await authApi.updateProfile({
        fullName: profileForm.fullName.trim(),
        phoneNumber: profileForm.phoneNumber?.trim() || null,
        address: profileForm.address?.trim() || null,
      })
      setUser(updatedUser)
      setProfileForm({
        fullName: updatedUser.fullName,
        phoneNumber: updatedUser.phoneNumber ?? "",
        address: updatedUser.address ?? "",
      })
      updateStoredUser(updatedUser)
      toast.success("Đã cập nhật hồ sơ cá nhân.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật hồ sơ.")
    } finally {
      setIsSavingProfile(false)
    }
  }

  const changePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.")
      return
    }

    setIsChangingPassword(true)
    try {
      await authApi.changePassword(passwordForm)
      setPasswordForm(emptyPassword)
      toast.success("Đã đổi mật khẩu thành công.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể đổi mật khẩu.")
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-petcenter-primary" />
      </div>
    )
  }

  if (loadError || !user) {
    return (
      <section className="mx-auto flex max-w-2xl items-start gap-3 rounded-card border border-petcenter-danger-text/20 bg-petcenter-danger-bg p-5 text-petcenter-danger-text">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="flex-1">
          <p className="font-semibold">Không thể tải hồ sơ</p>
          <p className="body-sm mt-1">{loadError}</p>
          <Button className="mt-4" onClick={() => void loadProfile()} variant="outline">Thử lại</Button>
        </div>
      </section>
    )
  }

  const initials = getInitials(user.fullName)

  return (
    <div className="flex-1 space-y-6">
      <header>
        <h1 className="heading-lg text-petcenter-text">Hồ sơ cá nhân</h1>
        <p className="body-md mt-1 text-petcenter-text-secondary">
          Quản lý thông tin tài khoản và thiết lập bảo mật của bạn.
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-card border border-petcenter-border bg-white shadow-card">
          <div className="border-b border-petcenter-border bg-petcenter-filter px-6 py-7 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-petcenter-primary text-2xl font-bold text-white shadow-sm">
              {initials}
            </div>
            <h2 className="title-md mt-4 text-petcenter-text">{user.fullName}</h2>
            <p className="body-sm mt-1 text-petcenter-text-secondary">{user.email}</p>
            <span className="mt-3 inline-flex rounded-full bg-petcenter-primary/10 px-3 py-1 text-xs font-semibold text-petcenter-primary">
              {roleLabels[user.role]}
            </span>
          </div>

          <nav className="space-y-1 p-3" aria-label="Điều hướng hồ sơ">
            <ProfileNavButton
              active={activeSection === "personal"}
              icon={UserRound}
              label="Thông tin cá nhân"
              onClick={() => setActiveSection("personal")}
            />
            <ProfileNavButton
              active={activeSection === "security"}
              icon={ShieldCheck}
              label="Bảo mật tài khoản"
              onClick={() => setActiveSection("security")}
            />
          </nav>

          <div className="border-t border-petcenter-border px-5 py-4">
            <div className="flex items-center gap-3 text-petcenter-text-secondary">
              <CalendarDays className="h-4 w-4 text-petcenter-primary" />
              <div>
                <p className="label-md">Tham gia từ</p>
                <p className="body-sm font-semibold text-petcenter-text">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          {activeSection === "personal" ? (
            <PersonalInformationForm
              form={profileForm}
              user={user}
              isSaving={isSavingProfile}
              onChange={setProfileForm}
              onSubmit={saveProfile}
            />
          ) : (
            <SecurityForm
              form={passwordForm}
              isSaving={isChangingPassword}
              showPasswords={showPasswords}
              onChange={setPasswordForm}
              onSubmit={changePassword}
              onToggleVisibility={() => setShowPasswords((current) => !current)}
            />
          )}
        </main>
      </div>
    </div>
  )
}

function PersonalInformationForm({
  form,
  user,
  isSaving,
  onChange,
  onSubmit,
}: {
  form: UpdateProfilePayload
  user: AuthUser
  isSaving: boolean
  onChange: (form: UpdateProfilePayload) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}) {
  return (
    <form className="overflow-hidden rounded-card border border-petcenter-border bg-white shadow-card" onSubmit={onSubmit}>
      <SectionHeader
        description="Thông tin này được sử dụng để liên hệ và nhận diện tài khoản trong hệ thống."
        icon={UserRound}
        title="Thông tin cá nhân"
      />
      <div className="grid gap-5 p-6 md:grid-cols-2">
        <Field label="Họ và tên" icon={UserRound} required>
          <Input
            className="h-11 rounded-control border-petcenter-border-strong pl-10"
            maxLength={150}
            onChange={(event) => onChange({ ...form, fullName: event.target.value })}
            required
            value={form.fullName}
          />
        </Field>
        <Field label="Email đăng nhập" icon={Mail}>
          <Input
            className="h-11 rounded-control border-petcenter-border bg-petcenter-filter pl-10 text-petcenter-text-muted"
            disabled
            value={user.email}
          />
        </Field>
        <Field label="Số điện thoại" icon={Phone}>
          <Input
            className="h-11 rounded-control border-petcenter-border-strong pl-10"
            maxLength={20}
            onChange={(event) => onChange({ ...form, phoneNumber: event.target.value })}
            placeholder="Nhập số điện thoại"
            value={form.phoneNumber ?? ""}
          />
        </Field>
        <Field label="Vai trò" icon={ShieldCheck}>
          <Input
            className="h-11 rounded-control border-petcenter-border bg-petcenter-filter pl-10 text-petcenter-text-muted"
            disabled
            value={roleLabels[user.role]}
          />
        </Field>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-petcenter-text">Địa chỉ</label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-petcenter-text-muted" />
            <Textarea
              className="min-h-28 resize-none rounded-control border-petcenter-border-strong pl-10"
              maxLength={1000}
              onChange={(event) => onChange({ ...form, address: event.target.value })}
              placeholder="Nhập địa chỉ liên hệ"
              value={form.address ?? ""}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end border-t border-petcenter-border bg-petcenter-filter px-6 py-4">
        <Button
          className="h-10 rounded-control bg-petcenter-primary px-5 text-white hover:bg-petcenter-primary-hover"
          disabled={isSaving}
          type="submit"
        >
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Lưu thay đổi
        </Button>
      </div>
    </form>
  )
}

function SecurityForm({
  form,
  isSaving,
  showPasswords,
  onChange,
  onSubmit,
  onToggleVisibility,
}: {
  form: ChangePasswordPayload
  isSaving: boolean
  showPasswords: boolean
  onChange: (form: ChangePasswordPayload) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onToggleVisibility: () => void
}) {
  const passwordType = showPasswords ? "text" : "password"
  return (
    <form id="security" className="overflow-hidden rounded-card border border-petcenter-border bg-white shadow-card" onSubmit={onSubmit}>
      <SectionHeader
        description="Sử dụng mật khẩu mạnh và không dùng lại mật khẩu ở dịch vụ khác."
        icon={LockKeyhole}
        title="Đổi mật khẩu"
      />
      <div className="space-y-5 p-6">
        <PasswordField
          label="Mật khẩu hiện tại"
          onChange={(value) => onChange({ ...form, currentPassword: value })}
          onToggleVisibility={onToggleVisibility}
          showPassword={showPasswords}
          type={passwordType}
          value={form.currentPassword}
        />
        <div className="grid gap-5 md:grid-cols-2">
          <PasswordField
            label="Mật khẩu mới"
            onChange={(value) => onChange({ ...form, newPassword: value })}
            onToggleVisibility={onToggleVisibility}
            showPassword={showPasswords}
            type={passwordType}
            value={form.newPassword}
          />
          <PasswordField
            label="Xác nhận mật khẩu mới"
            onChange={(value) => onChange({ ...form, confirmPassword: value })}
            onToggleVisibility={onToggleVisibility}
            showPassword={showPasswords}
            type={passwordType}
            value={form.confirmPassword}
          />
        </div>
        <div className="rounded-control border border-petcenter-primary/15 bg-petcenter-primary/5 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-petcenter-text">
            <CheckCircle2 className="h-4 w-4 text-petcenter-primary" />
            Yêu cầu mật khẩu
          </p>
          <p className="body-sm mt-2 text-petcenter-text-secondary">
            Có ít nhất 8 ký tự và khác mật khẩu hiện tại.
          </p>
        </div>
      </div>
      <div className="flex justify-end border-t border-petcenter-border bg-petcenter-filter px-6 py-4">
        <Button
          className="h-10 rounded-control bg-petcenter-primary px-5 text-white hover:bg-petcenter-primary-hover"
          disabled={isSaving}
          type="submit"
        >
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
          Đổi mật khẩu
        </Button>
      </div>
    </form>
  )
}

function ProfileNavButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
}) {
  return (
    <button
      className={cn(
        "flex h-11 w-full items-center gap-3 rounded-control px-3 text-left text-sm font-semibold transition-colors",
        active
          ? "bg-petcenter-primary text-white"
          : "text-petcenter-text-secondary hover:bg-petcenter-filter hover:text-petcenter-text"
      )}
      onClick={onClick}
      type="button"
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )
}

function SectionHeader({
  description,
  icon: Icon,
  title,
}: {
  description: string
  icon: React.ComponentType<{ className?: string }>
  title: string
}) {
  return (
    <div className="flex items-start gap-3 border-b border-petcenter-border bg-petcenter-filter px-6 py-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-petcenter-primary/10 text-petcenter-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <h2 className="title-md text-petcenter-text">{title}</h2>
        <p className="body-sm mt-1 text-petcenter-text-secondary">{description}</p>
      </div>
    </div>
  )
}

function Field({
  children,
  icon: Icon,
  label,
  required = false,
}: {
  children: React.ReactNode
  icon: React.ComponentType<{ className?: string }>
  label: string
  required?: boolean
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold text-petcenter-text">
        {label} {required ? <span className="text-petcenter-danger-text">*</span> : null}
      </span>
      <span className="relative block">
        <Icon className="pointer-events-none absolute left-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-petcenter-text-muted" />
        {children}
      </span>
    </label>
  )
}

function PasswordField({
  label,
  onChange,
  onToggleVisibility,
  showPassword,
  type,
  value,
}: {
  label: string
  onChange: (value: string) => void
  onToggleVisibility: () => void
  showPassword: boolean
  type: "text" | "password"
  value: string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-petcenter-text">{label}</span>
      <span className="relative block">
        <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-petcenter-text-muted" />
        <Input
          className="h-11 rounded-control border-petcenter-border-strong px-10"
          minLength={label === "Mật khẩu hiện tại" ? 1 : 8}
          onChange={(event) => onChange(event.target.value)}
          required
          type={type}
          value={value}
        />
        <button
          aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-petcenter-text-muted hover:text-petcenter-text"
          onClick={onToggleVisibility}
          type="button"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </span>
    </label>
  )
}

function getInitials(fullName: string) {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part.charAt(0).toLocaleUpperCase("vi-VN"))
    .join("")
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value))
}
