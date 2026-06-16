"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { uploadsApi } from "@/features/uploads/api/uploads.api";
import { cn } from "@/lib/utils";
import { petsApi } from "../../api/pets.api";
import type { PetGender, PetSpecies, StaffPetDetail, StaffUpdatePetInput } from "../../types/pet.types";

type StaffPetEditPageProps = {
  petId: string;
};

type FormState = {
  petName: string;
  species: PetSpecies;
  breed: string;
  gender: PetGender;
  birthDate: string;
  estimatedAge: string;
  weightKg: string;
  furColor: string;
  identifyingMarks: string;
  profileImageUrl: string | null;
};

type SegmentOption = {
  icon: React.ElementType<{ className?: string }>;
  label: string;
  value: string;
};

const text = {
  list: "Hồ sơ thú cưng",
  edit: "Chỉnh sửa hồ sơ",
  title: "Chỉnh sửa hồ sơ thú cưng",
  subtitlePrefix: "Cập nhật thông tin nhận diện, phân loại và các chỉ số cơ bản của",
  back: "Quay lại hồ sơ",
  avatarTitle: "Ảnh đại diện",
  avatarHint: "Định dạng JPG, PNG. Tối đa 5MB.",
  uploadAvatar: "Tải ảnh lên",
  removeAvatar: "Xóa",
  category: "Phân loại",
  detailInfo: "Thông tin chi tiết",
  detailHint: "Nếu không biết ngày sinh, hãy để trống ngày sinh và nhập tuổi ước tính theo năm.",
  petName: "Tên thú cưng",
  species: "Loài",
  gender: "Giới tính",
  breed: "Giống",
  birthDate: "Ngày sinh (dự kiến)",
  estimatedAge: "Tuổi ước tính",
  weight: "Cân nặng",
  furColor: "Màu lông",
  marks: "Đặc điểm nhận diện",
  cancel: "Hủy",
  save: "Lưu thay đổi",
  loadingTitle: "Đang tải hồ sơ thú cưng...",
  loadingDescription: "Dữ liệu được lấy từ hệ thống.",
  loadError: "Không thể tải hồ sơ thú cưng",
  retry: "Thử lại",
};

const speciesOptions: Array<{ icon: React.ElementType<{ className?: string }>; label: string; value: PetSpecies }> = [
  { icon: Dog, label: "Chó", value: "Dog" },
  { icon: Cat, label: "Mèo", value: "Cat" },
  { icon: PawPrint, label: "Khác", value: "Other" },
];

const genderOptions: Array<{ icon: React.ElementType<{ className?: string }>; label: string; value: PetGender }> = [
  { icon: Mars, label: "Đực", value: "male" },
  { icon: Venus, label: "Cái", value: "female" },
  { icon: CircleHelp, label: "Khác", value: "unknown" },
];

function toInputDate(value: string | null): string {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

function optionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function optionalNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function createFormState(pet: StaffPetDetail): FormState {
  return {
    petName: pet.petName,
    species: pet.species,
    breed: pet.breed ?? "",
    gender: pet.gender ?? "unknown",
    birthDate: toInputDate(pet.birthDate),
    estimatedAge: pet.birthDate || pet.estimatedAge === null ? "" : String(pet.estimatedAge),
    weightKg: pet.weightKg === null ? "" : String(pet.weightKg),
    furColor: pet.furColor ?? "",
    identifyingMarks: pet.identifyingMarks ?? "",
    profileImageUrl: pet.profileImageUrl,
  };
}

function buildPayload(form: FormState, profileImageUrl: string | null): StaffUpdatePetInput {
  return {
    petName: form.petName.trim(),
    species: form.species,
    breed: optionalText(form.breed),
    gender: form.gender,
    birthDate: form.birthDate || null,
    estimatedAge: form.birthDate ? null : optionalNumber(form.estimatedAge),
    weightKg: optionalNumber(form.weightKg),
    furColor: optionalText(form.furColor),
    identifyingMarks: optionalText(form.identifyingMarks),
    profileImageUrl,
  };
}

export function StaffPetEditPage({ petId }: StaffPetEditPageProps) {
  const router = useRouter();
  const fileInputId = React.useId();
  const avatarInputRef = React.useRef<HTMLInputElement | null>(null);
  const avatarPreviewRef = React.useRef<string | null>(null);

  const [pet, setPet] = React.useState<StaffPetDetail | null>(null);
  const [form, setForm] = React.useState<FormState | null>(null);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    const controller = new AbortController();

    Promise.resolve()
      .then(() => {
        if (!controller.signal.aborted) {
          setIsLoading(true);
          setIsError(false);
          setErrorMessage(null);
        }

        return petsApi.getStaff(petId, { signal: controller.signal });
      })
      .then((result) => {
        setPet(result);
        setForm(createFormState(result));
      })
      .catch((error: unknown) => {
        if (typeof error === "object" && error !== null && "name" in error && error.name === "AbortError") {
          return;
        }

        setIsError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [petId, refreshKey]);

  React.useEffect(() => {
    return () => {
      if (avatarPreviewRef.current) {
        URL.revokeObjectURL(avatarPreviewRef.current);
      }
    };
  }, []);

  const updateField = <T extends keyof FormState>(field: T, value: FormState[T]) => {
    setForm((current) => (current ? { ...current, [field]: value } : current));
  };

  const handleBirthDateChange = (value: string) => {
    setForm((current) =>
      current
        ? {
            ...current,
            birthDate: value,
            estimatedAge: value ? "" : current.estimatedAge,
          }
        : current
    );
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      const message = "Vui lòng chọn file ảnh định dạng JPG hoặc PNG.";
      setErrorMessage(message);
      toast.error(message);
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      const message = "Ảnh đại diện không được vượt quá 5MB.";
      setErrorMessage(message);
      toast.error(message);
      event.target.value = "";
      return;
    }

    if (avatarPreviewRef.current) {
      URL.revokeObjectURL(avatarPreviewRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    avatarPreviewRef.current = objectUrl;
    setAvatarFile(file);
    setAvatarPreviewUrl(objectUrl);
    setErrorMessage(null);
  };

  const clearAvatar = () => {
    if (avatarPreviewRef.current) {
      URL.revokeObjectURL(avatarPreviewRef.current);
      avatarPreviewRef.current = null;
    }

    setAvatarFile(null);
    setAvatarPreviewUrl(null);

    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  };

  const validateForm = (): boolean => {
    if (!form) {
      toast.error("Không thể cập nhật vì hồ sơ thú cưng chưa tải xong.");
      return false;
    }

    if (!form.petName.trim()) {
      const message = "Vui lòng nhập tên thú cưng.";
      setErrorMessage(message);
      toast.error(message);
      return false;
    }

    if (!form.breed.trim()) {
      const message = "Vui lòng nhập giống thú cưng.";
      setErrorMessage(message);
      toast.error(message);
      return false;
    }

    if (!form.birthDate && !form.estimatedAge.trim()) {
      const message = "Vui lòng nhập ngày sinh dự kiến hoặc tuổi ước tính theo năm.";
      setErrorMessage(message);
      toast.error(message);
      return false;
    }

    if (form.estimatedAge.trim() && optionalNumber(form.estimatedAge) === null) {
      const message = "Tuổi ước tính phải là số hợp lệ.";
      setErrorMessage(message);
      toast.error(message);
      return false;
    }

    if (form.weightKg.trim() && optionalNumber(form.weightKg) === null) {
      const message = "Cân nặng phải là số hợp lệ.";
      setErrorMessage(message);
      toast.error(message);
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!form || !validateForm()) return;

    try {
      setIsSubmitting(true);
      const uploadedAvatar = avatarFile ? await uploadsApi.uploadImage(avatarFile) : null;
      const nextProfileImageUrl = uploadedAvatar?.secureUrl ?? form.profileImageUrl;
      const updatedPet = await petsApi.updateStaff(petId, buildPayload(form, nextProfileImageUrl));

      setPet(updatedPet);
      setForm(createFormState(updatedPet));
      setAvatarFile(null);
      setAvatarPreviewUrl(null);
      setIsSaved(true);
      toast.success("Cập nhật hồ sơ thú cưng thành công");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể cập nhật hồ sơ thú cưng.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingState title={text.loadingTitle} description={text.loadingDescription} />;
  }

  if (isError || !pet || !form) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-card border border-petcenter-border bg-white px-4 py-20 shadow-card">
        <AlertCircle className="h-12 w-12 text-petcenter-danger-text" />
        <p className="font-medium text-petcenter-text-secondary">{text.loadError}</p>
        <Button
          variant="outline"
          className="rounded-control border-petcenter-primary text-petcenter-primary hover:bg-petcenter-sidebar"
          onClick={() => setRefreshKey((value) => value + 1)}
        >
          {text.retry}
        </Button>
      </div>
    );
  }

  const avatarUrl = avatarPreviewUrl ?? form.profileImageUrl;

  return (
    <div className="mx-auto w-full max-w-[1180px] pb-10">
      <nav className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="body-md text-petcenter-text-secondary">
          <Link className="transition hover:text-petcenter-primary" href="/staff/pets">
            {text.list}
          </Link>{" "}
          &gt;{" "}
          <Link className="font-semibold text-petcenter-primary hover:underline" href={`/staff/pets/${encodeURIComponent(pet.petId)}`}>
            {pet.petName}
          </Link>{" "}
          &gt; <span className="font-semibold text-petcenter-primary">{text.edit}</span>
        </div>
        <Link
          className="label-md inline-flex h-10 items-center justify-center gap-2 rounded-control border border-petcenter-primary bg-white px-4 font-semibold text-petcenter-primary shadow-card transition hover:bg-petcenter-sidebar sm:w-auto"
          href={`/staff/pets/${encodeURIComponent(pet.petId)}`}
        >
          <ArrowLeft className="h-4 w-4" />
          {text.back}
        </Link>
      </nav>

      <header className="mb-6">
        <h1 className="heading-lg text-petcenter-text">{text.title}</h1>
        <p className="body-md mt-1 max-w-2xl text-petcenter-text-secondary">
          {text.subtitlePrefix} {pet.petName}.
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
                  <span className="label-md mt-1">{text.uploadAvatar}</span>
                </>
              )}
            </label>
            <h2 className="title-md mb-1 text-petcenter-text">{text.avatarTitle}</h2>
            <p className="label-md text-petcenter-text-secondary">{text.avatarHint}</p>
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
                    {text.removeAvatar}
                  </button>
                </div>
              </div>
            ) : null}
          </section>

          <section className="mt-4 rounded-card border border-petcenter-border bg-white p-5 shadow-card">
            <h2 className="title-md mb-4 text-petcenter-text">{text.category}</h2>
            <SegmentGroup
              label={text.species}
              onChange={(value) => updateField("species", value as FormState["species"])}
              options={speciesOptions}
              required
              value={form.species}
            />

            <div className="mt-4">
              <SegmentGroup
                label={text.gender}
                onChange={(value) => updateField("gender", value as PetGender)}
                options={genderOptions}
                required
                value={form.gender}
              />
            </div>

            <div className="mt-4">
              <TextField
                label={text.breed}
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
            <h2 className="title-md text-petcenter-text">{text.detailInfo}</h2>
            <p className="body-sm text-petcenter-text-secondary">{text.detailHint}</p>
          </div>

          <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <TextField
                label={text.petName}
                name="petName"
                onChange={(value) => updateField("petName", value)}
                placeholder="Nhập tên gọi ở nhà"
                required
                value={form.petName}
              />
            </div>

            <DateField label={text.birthDate} name="birthDate" onChange={handleBirthDateChange} value={form.birthDate} />

            <NumberWithSuffixField
              disabled={Boolean(form.birthDate)}
              label={text.estimatedAge}
              name="estimatedAge"
              onChange={(value) => updateField("estimatedAge", value)}
              placeholder="VD: 2"
              suffix="năm"
              value={form.estimatedAge}
            />

            <NumberWithSuffixField
              icon={Weight}
              label={text.weight}
              name="weightKg"
              onChange={(value) => updateField("weightKg", value)}
              placeholder="VD: 12.5"
              step="0.01"
              suffix="kg"
              value={form.weightKg}
            />

            <TextField
              label={text.furColor}
              name="furColor"
              onChange={(value) => updateField("furColor", value)}
              placeholder="VD: Vàng rơm, Nhị thể..."
              value={form.furColor}
            />

            <div className="md:col-span-2">
              <TextAreaField
                label={text.marks}
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
              href={`/staff/pets/${encodeURIComponent(pet.petId)}`}
            >
              {text.cancel}
            </Link>
            <button
              className="label-md inline-flex h-10 items-center justify-center gap-2 rounded-control bg-petcenter-cta px-5 font-semibold text-white shadow-card transition hover:-translate-y-px hover:bg-petcenter-cta-hover disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-70"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {text.save}
            </button>
          </div>
        </section>
      </form>

      {isSaved ? (
        <SuccessModal
          onClose={() => router.push(`/staff/pets/${encodeURIComponent(pet.petId)}`)}
          onManage={() => setIsSaved(false)}
          petName={pet.petName}
        />
      ) : null}
    </div>
  );
}

function SegmentGroup({
  label,
  onChange,
  options,
  required,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: SegmentOption[];
  required?: boolean;
  value: string;
}) {
  return (
    <fieldset>
      <legend className="label-md mb-2 block text-petcenter-text-secondary">
        {label}
        {required ? <span className="text-petcenter-danger-text"> *</span> : null}
      </legend>
      <div className="grid grid-cols-3 gap-2 rounded-control border border-petcenter-border bg-petcenter-sidebar p-1">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = option.value === value;

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
          );
        })}
      </div>
    </fieldset>
  );
}

type TextFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "onChange" | "value"> & {
  label: string;
  name: string;
  onChange: (value: string) => void;
  value: string;
};

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
  );
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
          max={new Date().toISOString().slice(0, 10)}
          name={name}
          onChange={(event) => onChange(event.target.value)}
          type="date"
          value={value}
        />
      </span>
    </label>
  );
}

type NumberWithSuffixFieldProps = TextFieldProps & {
  icon?: React.ElementType<{ className?: string }>;
  suffix: string;
};

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
  );
}

type TextAreaFieldProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "name" | "onChange" | "value"> & {
  label: string;
  name: string;
  onChange: (value: string) => void;
  value: string;
};

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
  );
}

function SuccessModal({ onClose, onManage, petName }: { onClose: () => void; onManage: () => void; petName: string }) {
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
  );
}
