"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Camera,
  Cat,
  CheckCircle2,
  CircleHelp,
  Dog,
  Loader2,
  Mars,
  PawPrint,
  Venus,
  Weight,
} from "lucide-react"
import { toast } from "sonner"

import { uploadsApi } from "@/features/uploads/api/uploads.api"
import { cn } from "@/lib/utils"
import { petsApi } from "../../api/pets.api"
import type { PetDetail, PetGender, PetSpecies, UpdatePetInput } from "../../types/pet.types"

type FormState = {
  petName: string
  species: "" | PetSpecies
  breed: string
  gender: PetGender
  furColor: string
  birthDate: string
  estimatedAge: string
  weightKg: string
  profileImageUrl: string | null
  identifyingMarks: string
}

const speciesOptions: Array<{ icon: React.ElementType<{ className?: string }>; label: string; value: PetSpecies }> = [
  { icon: Dog, label: "Chó", value: "Dog" },
  { icon: Cat, label: "Mèo", value: "Cat" },
  { icon: PawPrint, label: "Khác", value: "Other" },
]

const genderOptions: Array<{ icon: React.ElementType<{ className?: string }>; label: string; value: PetGender }> = [
  { icon: Mars, label: "Đực", value: "male" },
  { icon: Venus, label: "Cái", value: "female" },
  { icon: CircleHelp, label: "Khác", value: "unknown" },
]

export function OwnerEditPetPage({ petId }: { petId: string }) {
  const router = useRouter()
  const fileInputId = React.useId()
  const [pet, setPet] = React.useState<PetDetail | null>(null)
  const [form, setForm] = React.useState<FormState | null>(null)
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSaved, setIsSaved] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const avatarPreviewRef = React.useRef<string | null>(null)
  const avatarInputRef = React.useRef<HTMLInputElement | null>(null)

  React.useEffect(() => {
    const abortController = new AbortController()

    async function loadPet() {
      try {
        setIsLoading(true)
        setErrorMessage(null)

        const result = await petsApi.get(petId)

        if (!abortController.signal.aborted) {
          setPet(result)
          setForm(toFormState(result))
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          setErrorMessage(error instanceof Error ? error.message : "Không thể tải hồ sơ thú cưng.")
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadPet()

    return () => {
      abortController.abort()
      if (avatarPreviewRef.current) {
        URL.revokeObjectURL(avatarPreviewRef.current)
      }
    }
  }, [petId])

  const updateField = <T extends keyof FormState>(field: T, value: FormState[T]) => {
    setForm((current) => (current ? { ...current, [field]: value } : current))
  }

  const handleBirthDateChange = (value: string) => {
    setForm((current) =>
      current
        ? {
            ...current,
            birthDate: value,
            estimatedAge: value ? "" : current.estimatedAge,
          }
        : current
    )
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith("image/")) {
      const message = "Vui lòng chọn file ảnh định dạng JPG hoặc PNG."
      setErrorMessage(message)
      toast.error(message)
      event.target.value = ""
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      const message = "Ảnh đại diện không được vượt quá 5MB."
      setErrorMessage(message)
      toast.error(message)
      event.target.value = ""
      return
    }

    setErrorMessage(null)
    if (avatarPreviewRef.current) {
      URL.revokeObjectURL(avatarPreviewRef.current)
    }

    const objectUrl = URL.createObjectURL(file)
    avatarPreviewRef.current = objectUrl
    setAvatarFile(file)
    setAvatarPreviewUrl(objectUrl)
  }

  const clearAvatar = () => {
    if (avatarPreviewRef.current) {
      URL.revokeObjectURL(avatarPreviewRef.current)
      avatarPreviewRef.current = null
    }

    setAvatarFile(null)
    setAvatarPreviewUrl(null)

    if (avatarInputRef.current) {
      avatarInputRef.current.value = ""
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form || !pet) {
      toast.error("Không thể cập nhật vì hồ sơ thú cưng chưa tải xong.")
      return
    }

    if (!form.petName.trim() || !form.species || !form.breed.trim()) {
      const message = "Vui lòng nhập đầy đủ tên, loài và giống thú cưng."
      setErrorMessage(message)
      toast.error(message)
      return
    }

    if (!form.birthDate && !form.estimatedAge) {
      const message = "Vui lòng nhập ngày sinh dự kiến hoặc tuổi ước tính theo năm."
      setErrorMessage(message)
      toast.error(message)
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage(null)

      const uploadedAvatar = avatarFile ? await uploadsApi.uploadImage(avatarFile) : null
      const updatedPet = await petsApi.update(
        pet.petId,
        buildUpdatePayload({
          ...form,
          profileImageUrl: uploadedAvatar?.secureUrl ?? form.profileImageUrl,
        })
      )

      setPet(updatedPet)
      setForm(toFormState(updatedPet))
      setIsSaved(true)
      toast.success("Cập nhật hồ sơ thú cưng thành công")
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể cập nhật hồ sơ thú cưng."
      setErrorMessage(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <EditPetSkeleton />
  }

  if (!pet || !form) {
    return <ErrorState message={errorMessage ?? "Không tìm thấy hồ sơ thú cưng."} />
  }

  const avatarUrl = avatarPreviewUrl ?? form.profileImageUrl

  return (
    <div className="w-full">
      <nav className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="body-md text-petcenter-text-secondary">
          Danh sách thú cưng &gt;{" "}
          <Link className="font-semibold text-petcenter-primary hover:underline" href={`/owner/pets/${encodeURIComponent(pet.petId)}`}>
            {pet.petName}
          </Link>{" "}
          &gt; <span className="font-semibold text-petcenter-primary">Chỉnh sửa hồ sơ</span>
        </div>
        <Link
          className="label-md inline-flex h-10 items-center justify-center gap-2 rounded-control border border-petcenter-primary bg-white px-4 font-semibold text-petcenter-primary shadow-card transition hover:bg-petcenter-sidebar sm:w-auto"
          href={`/owner/pets/${encodeURIComponent(pet.petId)}`}
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại hồ sơ
        </Link>
      </nav>

      <header className="mb-6">
        <h1 className="heading-lg text-petcenter-text">Chỉnh sửa hồ sơ thú cưng</h1>
        <p className="body-md mt-1 max-w-2xl text-petcenter-text-secondary">
          Cập nhật thông tin nhận diện, phân loại và các chỉ số cơ bản của {pet.petName}.
        </p>
      </header>

      {errorMessage ? (
        <section className="mb-4 flex items-start gap-3 rounded-card border border-petcenter-danger-text/20 bg-petcenter-danger-bg p-4 text-petcenter-danger-text">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="body-md">{errorMessage}</p>
        </section>
      ) : null}

      <form
        className="grid grid-cols-1 overflow-hidden rounded-card border border-petcenter-border bg-white shadow-card lg:grid-cols-[330px_minmax(0,1fr)]"
        onSubmit={handleSubmit}
      >
        <aside className="border-b border-petcenter-border bg-petcenter-filter p-5 lg:border-b-0 lg:border-r">
          <section className="rounded-card border border-petcenter-border bg-white p-5 text-center shadow-card">
            <input
              accept="image/png,image/jpeg"
              className="sr-only"
              id={fileInputId}
              onChange={handleAvatarChange}
              ref={avatarInputRef}
              type="file"
            />
            <label
              className="group relative mx-auto mb-4 flex h-32 w-32 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-petcenter-border-strong bg-petcenter-sidebar text-petcenter-text-muted transition hover:border-petcenter-primary hover:bg-petcenter-filter hover:text-petcenter-primary"
              htmlFor={fileInputId}
            >
              {avatarUrl ? (
                <>
                  <span
                    aria-label="Ảnh đại diện thú cưng"
                    className="h-full w-full bg-cover bg-center"
                    role="img"
                    style={{ backgroundImage: `url(${avatarUrl})` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition group-hover:opacity-100">
                    <Camera className="h-6 w-6" />
                  </span>
                </>
              ) : (
                <>
                  <Camera className="h-8 w-8 transition-transform group-hover:scale-110" />
                  <span className="label-md mt-1">Tải ảnh lên</span>
                </>
              )}
            </label>
            <h2 className="title-md mb-1 text-petcenter-text">Ảnh đại diện</h2>
            <p className="label-md text-petcenter-text-secondary">Định dạng JPG, PNG. Tối đa 5MB.</p>
            {avatarFile ? (
              <div className="mt-4 rounded-control border border-petcenter-border bg-petcenter-filter p-3 text-left">
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="body-sm truncate font-medium text-petcenter-text">{avatarFile.name}</p>
                    <p className="label-md mt-0.5 text-petcenter-text-muted">{formatFileSize(avatarFile.size)}</p>
                  </div>
                  <button
                    className="label-md shrink-0 rounded-control border border-petcenter-border-strong bg-white px-3 py-2 font-semibold text-petcenter-text-secondary transition hover:bg-petcenter-sidebar"
                    onClick={clearAvatar}
                    type="button"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ) : null}
          </section>

          <section className="mt-4 rounded-card border border-petcenter-border bg-white p-5 shadow-card">
            <h2 className="title-md mb-4 text-petcenter-text">Phân loại</h2>
            <SegmentGroup
              label="Loài"
              onChange={(value) => updateField("species", value as FormState["species"])}
              options={speciesOptions}
              required
              value={form.species}
            />

            <div className="mt-4">
              <SegmentGroup
                label="Giới tính"
                onChange={(value) => updateField("gender", value as PetGender)}
                options={genderOptions}
                required
                value={form.gender}
              />
            </div>

            <div className="mt-4">
              <TextField
                label="Giống"
                name="breed"
                onChange={(value) => updateField("breed", value)}
                placeholder="VD: Poodle, Golden Retriever..."
                required
                value={form.breed}
              />
            </div>
          </section>
        </aside>

        <section className="min-w-0 p-5 sm:p-6">
          <div className="mb-6 flex flex-col gap-1 border-b border-petcenter-border pb-4">
            <h2 className="title-md text-petcenter-text">Thông tin chi tiết</h2>
            <p className="body-sm text-petcenter-text-secondary">
              Nếu không biết ngày sinh, hãy để trống ngày sinh và nhập tuổi ước tính theo năm.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <TextField
                label="Tên thú cưng"
                name="petName"
                onChange={(value) => updateField("petName", value)}
                placeholder="Nhập tên gọi ở nhà"
                required
                value={form.petName}
              />
            </div>

            <DateField label="Ngày sinh (dự kiến)" name="birthDate" onChange={handleBirthDateChange} value={form.birthDate} />

            <NumberWithSuffixField
              disabled={Boolean(form.birthDate)}
              label="Tuổi ước tính"
              name="estimatedAge"
              onChange={(value) => updateField("estimatedAge", value)}
              placeholder="VD: 2"
              suffix="năm"
              value={form.estimatedAge}
            />

            <NumberWithSuffixField
              icon={Weight}
              label="Cân nặng"
              name="weightKg"
              onChange={(value) => updateField("weightKg", value)}
              placeholder="VD: 12.5"
              step="0.01"
              suffix="kg"
              value={form.weightKg}
            />

            <TextField
              label="Màu lông"
              name="furColor"
              onChange={(value) => updateField("furColor", value)}
              placeholder="VD: Vàng rơm, Nhị thể..."
              value={form.furColor}
            />

            <div className="md:col-span-2">
              <TextAreaField
                label="Đặc điểm nhận diện"
                name="identifyingMarks"
                onChange={(value) => updateField("identifyingMarks", value)}
                placeholder="Ghi chú các vết sẹo, đốm lông đặc biệt để dễ nhận biết..."
                value={form.identifyingMarks}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-petcenter-border pt-4 sm:flex-row sm:justify-end">
            <Link
              className="label-md inline-flex h-10 items-center justify-center rounded-control border border-petcenter-border-strong bg-white px-5 font-semibold text-petcenter-primary transition hover:bg-petcenter-sidebar"
              href={`/owner/pets/${encodeURIComponent(pet.petId)}`}
            >
              Hủy
            </Link>
            <button
              className="label-md inline-flex h-10 items-center justify-center gap-2 rounded-control bg-petcenter-cta px-5 font-semibold text-white shadow-card transition hover:-translate-y-px hover:bg-petcenter-cta-hover disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-70"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Lưu thay đổi
            </button>
          </div>
        </section>
      </form>

      {isSaved ? (
        <SuccessModal
          onClose={() => router.push(`/owner/pets/${encodeURIComponent(pet.petId)}`)}
          onManage={() => setIsSaved(false)}
          petName={pet.petName}
        />
      ) : null}
    </div>
  )
}

function toFormState(pet: PetDetail): FormState {
  return {
    petName: pet.petName,
    species: pet.species,
    breed: pet.breed ?? "",
    gender: pet.gender ?? "unknown",
    furColor: pet.furColor ?? "",
    birthDate: toDateInputValue(pet.birthDate),
    estimatedAge: pet.birthDate || pet.estimatedAge === null ? "" : String(pet.estimatedAge),
    weightKg: pet.weightKg === null ? "" : String(pet.weightKg),
    profileImageUrl: pet.profileImageUrl,
    identifyingMarks: pet.identifyingMarks ?? "",
  }
}

function buildUpdatePayload(form: FormState): UpdatePetInput {
  return {
    petName: form.petName.trim(),
    species: form.species || "Other",
    breed: optionalString(form.breed),
    gender: form.gender,
    birthDate: optionalString(form.birthDate),
    estimatedAge: form.birthDate ? null : optionalNumber(form.estimatedAge),
    weightKg: optionalNumber(form.weightKg),
    profileImageUrl: form.profileImageUrl,
    identifyingMarks: optionalString(form.identifyingMarks),
    furColor: optionalString(form.furColor),
  }
}

function optionalString(value: string): string | null {
  const trimmed = value.trim()

  return trimmed ? trimmed : null
}

function optionalNumber(value: string): number | null {
  if (!value) return null

  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : null
}

function toDateInputValue(value: string | null) {
  if (!value) return ""

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10)
  }

  return date.toISOString().slice(0, 10)
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

function EditPetSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="mb-5 h-10 w-72 rounded bg-petcenter-sidebar" />
      <div className="mb-6 h-20 rounded bg-petcenter-sidebar" />
      <div className="grid grid-cols-1 overflow-hidden rounded-card border border-petcenter-border bg-white shadow-card lg:grid-cols-[330px_minmax(0,1fr)]">
        <div className="h-[560px] border-petcenter-border bg-petcenter-filter lg:border-r" />
        <div className="h-[560px] bg-white" />
      </div>
    </div>
  )
}

type SegmentOption = {
  icon: React.ElementType<{ className?: string }>
  label: string
  value: string
}

function SegmentGroup({
  label,
  onChange,
  options,
  required,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: SegmentOption[]
  required?: boolean
  value: string
}) {
  return (
    <fieldset>
      <legend className="label-md mb-2 block text-petcenter-text-secondary">
        {label}
        {required ? <span className="text-petcenter-danger-text"> *</span> : null}
      </legend>
      <div className="grid grid-cols-3 gap-2 rounded-control border border-petcenter-border bg-petcenter-sidebar p-1">
        {options.map((option) => {
          const Icon = option.icon
          const isSelected = option.value === value

          return (
            <button
              aria-pressed={isSelected}
              className={cn(
                "label-md flex min-h-11 items-center justify-center gap-2 rounded-[0.6rem] px-2 font-semibold transition",
                isSelected
                  ? "bg-white text-petcenter-primary shadow-card ring-1 ring-petcenter-primary/15"
                  : "text-petcenter-text-secondary hover:bg-white/60"
              )}
              key={option.value}
              onClick={() => onChange(option.value)}
              type="button"
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{option.label}</span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

type TextFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "onChange" | "value"> & {
  label: string
  name: string
  onChange: (value: string) => void
  value: string
}

function TextField({ label, name, onChange, required, value, ...props }: TextFieldProps) {
  return (
    <label className="block" htmlFor={name}>
      <span className="label-md mb-1 block text-petcenter-text-secondary">
        {label}
        {required ? <span className="text-petcenter-danger-text"> *</span> : null}
      </span>
      <input
        {...props}
        className="body-md h-11 w-full rounded-control border border-petcenter-border-strong bg-petcenter-filter px-3 text-petcenter-text outline-none transition placeholder:text-petcenter-text-muted/60 focus:border-petcenter-primary focus:bg-white focus:ring-4 focus:ring-petcenter-primary/10"
        id={name}
        name={name}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        value={value}
      />
    </label>
  )
}

function DateField({ label, name, onChange, value }: TextFieldProps) {
  return (
    <label className="block" htmlFor={name}>
      <span className="label-md mb-1 block text-petcenter-text-secondary">{label}</span>
      <span className="relative block">
        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-petcenter-text-muted" />
        <input
          className="body-md h-11 w-full rounded-control border border-petcenter-border-strong bg-petcenter-filter pl-10 pr-3 text-petcenter-text outline-none transition focus:border-petcenter-primary focus:bg-white focus:ring-4 focus:ring-petcenter-primary/10"
          id={name}
          name={name}
          onChange={(event) => onChange(event.target.value)}
          type="date"
          value={value}
        />
      </span>
    </label>
  )
}

type NumberWithSuffixFieldProps = TextFieldProps & {
  icon?: React.ElementType<{ className?: string }>
  suffix: string
}

function NumberWithSuffixField({
  disabled,
  icon: Icon,
  label,
  name,
  onChange,
  required,
  suffix,
  value,
  ...props
}: NumberWithSuffixFieldProps) {
  return (
    <label className="block" htmlFor={name}>
      <span className="label-md mb-1 block text-petcenter-text-secondary">
        {label}
        {required ? <span className="text-petcenter-danger-text"> *</span> : null}
      </span>
      <span className="relative block">
        {Icon ? (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-petcenter-text-muted" />
        ) : null}
        <input
          {...props}
          className={cn(
            "body-md h-11 w-full rounded-control border border-petcenter-border-strong bg-petcenter-filter pr-14 text-petcenter-text outline-none transition placeholder:text-petcenter-text-muted/60 focus:border-petcenter-primary focus:bg-white focus:ring-4 focus:ring-petcenter-primary/10",
            Icon ? "pl-10" : "pl-3",
            disabled && "cursor-not-allowed bg-petcenter-sidebar text-petcenter-text-muted"
          )}
          disabled={disabled}
          id={name}
          min="0"
          name={name}
          onChange={(event) => onChange(event.target.value)}
          type="number"
          value={value}
        />
        <span className="label-md pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-petcenter-text-muted">
          {suffix}
        </span>
      </span>
      {disabled ? (
        <span className="body-sm mt-1 block text-petcenter-text-muted">Đã có ngày sinh, không cần nhập tuổi ước tính.</span>
      ) : null}
    </label>
  )
}

type TextAreaFieldProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "name" | "onChange" | "value"> & {
  label: string
  name: string
  onChange: (value: string) => void
  value: string
}

function TextAreaField({ label, name, onChange, value, ...props }: TextAreaFieldProps) {
  return (
    <label className="block" htmlFor={name}>
      <span className="label-md mb-1 block text-petcenter-text-secondary">{label}</span>
      <textarea
        {...props}
        className="body-md min-h-28 w-full resize-none rounded-control border border-petcenter-border-strong bg-petcenter-filter px-3 py-3 text-petcenter-text outline-none transition placeholder:text-petcenter-text-muted/60 focus:border-petcenter-primary focus:bg-white focus:ring-4 focus:ring-petcenter-primary/10"
        id={name}
        name={name}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        value={value}
      />
    </label>
  )
}

function SuccessModal({
  onClose,
  onManage,
  petName,
}: {
  onClose: () => void
  onManage: () => void
  petName: string
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-card bg-white p-8 text-center shadow-modal">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-petcenter-primary/10">
          <CheckCircle2 className="h-10 w-10 text-petcenter-primary" />
        </div>
        <h2 className="heading-sm mb-2 text-petcenter-text">Cập nhật hồ sơ thú cưng thành công</h2>
        <p className="body-md mb-6 text-petcenter-text-secondary">
          Hồ sơ của {petName} đã được cập nhật. Bạn có thể quay lại hồ sơ hoặc tiếp tục chỉnh sửa.
        </p>
        <div className="flex flex-col gap-3">
          <button
            className="label-md h-12 rounded-control bg-petcenter-primary px-4 font-semibold text-white transition hover:bg-petcenter-primary-hover"
            onClick={onClose}
            type="button"
          >
            Xem hồ sơ
          </button>
          <button
            className="label-md h-12 rounded-control border border-petcenter-border-strong px-4 font-semibold text-petcenter-text-secondary transition hover:bg-petcenter-sidebar"
            onClick={onManage}
            type="button"
          >
            Tiếp tục chỉnh sửa
          </button>
        </div>
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <section className="mx-auto flex w-full max-w-3xl items-start gap-3 rounded-card border border-petcenter-danger-text/20 bg-petcenter-danger-bg p-4 text-petcenter-danger-text">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <h1 className="label-md font-semibold">Không thể tải hồ sơ thú cưng</h1>
        <p className="body-md mt-1">{message}</p>
        <Link className="label-md mt-4 inline-flex font-semibold text-petcenter-danger-text underline" href="/owner/pets">
          Quay lại danh sách thú cưng
        </Link>
      </div>
    </section>
  )
}
