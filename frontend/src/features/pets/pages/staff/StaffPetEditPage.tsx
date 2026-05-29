"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, ChevronRight, Loader2, PawPrint, Save, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { Textarea } from "@/components/ui/textarea";
import { uploadsApi } from "@/features/uploads/api/uploads.api";
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

const text = {
  list: "Hồ sơ thú cưng",
  edit: "Chỉnh sửa",
  title: "Chỉnh sửa hồ sơ thú cưng",
  subtitlePrefix: "Cập nhật thông tin cơ bản và ghi chú chăm sóc của",
  back: "Quay lại chi tiết",
  basicInfo: "Thông tin cơ bản",
  changePhoto: "Thay ảnh",
  photoHint: "Hỗ trợ JPG, PNG. Tối đa 5MB.",
  petName: "Tên thú cưng",
  species: "Loài",
  gender: "Giới tính",
  breed: "Giống",
  birthOrAge: "Ngày sinh / Tuổi",
  weight: "Cân nặng (kg)",
  furColor: "Màu lông",
  marks: "Đặc điểm nhận dạng",
  cancel: "Hủy",
  save: "Lưu thay đổi",
  loadingTitle: "Đang tải hồ sơ thú cưng...",
  loadingDescription: "Dữ liệu được lấy từ hệ thống.",
  loadError: "Không thể tải hồ sơ thú cưng",
  retry: "Thử lại",
};

const speciesOptions: Array<{ value: PetSpecies; label: string }> = [
  { value: "Dog", label: "Chó" },
  { value: "Cat", label: "Mèo" },
  { value: "Other", label: "Khác" },
];

const genderOptions: Array<{ value: PetGender; label: string }> = [
  { value: "male", label: "Đực" },
  { value: "female", label: "Cái" },
  { value: "unknown", label: "Chưa rõ" },
];

function formatPetCode(petId: string): string {
  return petId.includes("-") ? petId.toUpperCase() : petId.replace(/^pet_?/i, "PET-").toUpperCase();
}

function toInputDate(value: string | null): string {
  return value ? value.slice(0, 10) : "";
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

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Vui lòng chọn file ảnh định dạng JPG hoặc PNG.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Ảnh thú cưng không được vượt quá 5MB.");
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

  const validateForm = (): boolean => {
    if (!form) return false;

    if (!form.petName.trim()) {
      setErrorMessage("Vui lòng nhập tên thú cưng.");
      return false;
    }

    if (form.estimatedAge.trim() && optionalNumber(form.estimatedAge) === null) {
      setErrorMessage("Tuổi ước tính phải là số hợp lệ.");
      return false;
    }

    if (form.weightKg.trim() && optionalNumber(form.weightKg) === null) {
      setErrorMessage("Cân nặng phải là số hợp lệ.");
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

      toast.success("Đã cập nhật hồ sơ thú cưng");
      router.push(`/staff/pets/${encodeURIComponent(updatedPet.petId)}`);
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể cập nhật hồ sơ thú cưng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingState title={text.loadingTitle} description={text.loadingDescription} />;
  }

  if (isError || !pet || !form) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-[16px] border border-petcenter-border bg-white px-4 py-20 shadow-card">
        <AlertCircle className="h-12 w-12 text-petcenter-danger-text" />
        <p className="font-medium text-petcenter-text-secondary">{text.loadError}</p>
        <Button
          variant="outline"
          className="rounded-xl border-petcenter-primary text-petcenter-primary hover:bg-[#D8F3EE]"
          onClick={() => setRefreshKey((value) => value + 1)}
        >
          {text.retry}
        </Button>
      </div>
    );
  }

  const petCode = formatPetCode(pet.petId);
  const avatarUrl = avatarPreviewUrl ?? form.profileImageUrl;

  return (
    <div className="mx-auto w-full max-w-[1200px] pb-10">
      <header className="mb-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <nav className="flex flex-wrap items-center gap-1 text-[12px] font-medium text-petcenter-text-secondary">
            <Link className="transition-colors hover:text-petcenter-primary" href="/staff/pets">
              {text.list}
            </Link>
            <ChevronRight className="h-4 w-4 opacity-60" />
            <Link className="transition-colors hover:text-petcenter-primary" href={`/staff/pets/${encodeURIComponent(pet.petId)}`}>
              {petCode}
            </Link>
            <ChevronRight className="h-4 w-4 opacity-60" />
            <span className="text-petcenter-text">{text.edit}</span>
          </nav>

          <Button
            asChild
            className="h-9 rounded-lg border border-petcenter-border-strong bg-white px-3 text-[12px] font-medium text-petcenter-primary transition hover:bg-petcenter-sidebar"
            variant="outline"
          >
            <Link href={`/staff/pets/${encodeURIComponent(pet.petId)}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {text.back}
            </Link>
          </Button>
        </div>

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[32px] font-bold leading-10 tracking-[-0.02em] text-petcenter-text">{text.title}</h1>
              <span className="rounded-full border border-[#B2E5DB] bg-[#D8F3EE] px-3 py-1 text-[12px] font-semibold text-petcenter-primary">
                {petCode}
              </span>
            </div>
            <p className="mt-2 text-[14px] leading-5 text-petcenter-text-secondary">
              {text.subtitlePrefix} {pet.petName}.
            </p>
          </div>
        </div>
      </header>

      {errorMessage ? (
        <section className="mb-4 flex items-start gap-3 rounded-[16px] border border-petcenter-danger-text/20 bg-petcenter-danger-bg p-4 text-petcenter-danger-text">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm leading-5">{errorMessage}</p>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-[16px] border border-petcenter-border bg-white shadow-card">
        <div className="border-b border-petcenter-border bg-[#FAFAF7] p-6">
          <h2 className="text-[20px] font-semibold leading-7 tracking-[-0.01em] text-petcenter-text">{text.basicInfo}</h2>
        </div>

        <form className="space-y-8 p-6" onSubmit={handleSubmit}>
          <div className="flex items-start gap-6 border-b border-dashed border-petcenter-border pb-6">
            <div className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-petcenter-border bg-petcenter-sidebar">
              {avatarUrl ? (
                <div
                  aria-label={pet.petName}
                  className="h-full w-full bg-cover bg-center"
                  role="img"
                  style={{ backgroundImage: `url(${avatarUrl})` }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-petcenter-primary/40">
                  <PawPrint className="h-10 w-10" />
                </div>
              )}
              <label
                className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100"
                htmlFor={fileInputId}
              >
                <Upload className="h-5 w-5" />
              </label>
            </div>

            <div className="pt-2">
              <input
                accept="image/png,image/jpeg"
                className="sr-only"
                id={fileInputId}
                onChange={handleAvatarChange}
                ref={avatarInputRef}
                type="file"
              />
              <Button
                asChild
                className="mb-2 h-10 cursor-pointer rounded-xl border border-petcenter-primary bg-white px-4 text-[12px] font-medium text-petcenter-primary transition hover:bg-[#D8F3EE]"
                variant="outline"
              >
                <label htmlFor={fileInputId}>
                  <Upload className="mr-2 h-[18px] w-[18px]" />
                  {text.changePhoto}
                </label>
              </Button>
              <p className="text-[12px] text-petcenter-text-muted">{text.photoHint}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <label className="space-y-2">
              <span className="block text-[12px] font-medium text-petcenter-text-secondary">
                {text.petName} <span className="text-petcenter-danger-text">*</span>
              </span>
              <Input
                className="h-11 rounded-xl border-petcenter-border-strong bg-white px-4 text-[14px] text-petcenter-text shadow-sm focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary/20"
                value={form.petName}
                onChange={(event) => updateField("petName", event.target.value)}
              />
            </label>

            <label className="space-y-2">
              <span className="block text-[12px] font-medium text-petcenter-text-secondary">
                {text.species} <span className="text-petcenter-danger-text">*</span>
              </span>
              <select
                className="h-11 w-full rounded-xl border border-petcenter-border-strong bg-white px-4 text-[14px] text-petcenter-text shadow-sm outline-none transition focus:border-petcenter-primary focus:ring-2 focus:ring-petcenter-primary/20"
                value={form.species}
                onChange={(event) => updateField("species", event.target.value as PetSpecies)}
              >
                {speciesOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="space-y-2">
              <span className="block text-[12px] font-medium text-petcenter-text-secondary">
                {text.gender} <span className="text-petcenter-danger-text">*</span>
              </span>
              <div className="flex h-11 items-center gap-6">
                {genderOptions.map((option) => (
                  <label className="flex cursor-pointer items-center gap-2" key={option.value}>
                    <input
                      checked={form.gender === option.value}
                      className="h-4 w-4 border-petcenter-border-strong text-petcenter-primary focus:ring-petcenter-primary"
                      name="gender"
                      onChange={() => updateField("gender", option.value)}
                      type="radio"
                    />
                    <span className="text-[14px] text-petcenter-text">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <label className="space-y-2">
              <span className="block text-[12px] font-medium text-petcenter-text-secondary">{text.breed}</span>
              <Input
                className="h-11 rounded-xl border-petcenter-border-strong bg-white px-4 text-[14px] shadow-sm focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary/20"
                value={form.breed}
                onChange={(event) => updateField("breed", event.target.value)}
              />
            </label>

            <div className="space-y-2">
              <span className="block text-[12px] font-medium text-petcenter-text-secondary">{text.birthOrAge}</span>
              <div className="grid grid-cols-[minmax(0,1fr)_104px] gap-2">
                <Input
                  className="h-11 rounded-xl border-petcenter-border-strong bg-white px-4 text-[14px] shadow-sm focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary/20"
                  max={new Date().toISOString().slice(0, 10)}
                  type="date"
                  value={form.birthDate}
                  onChange={(event) => {
                    const value = event.target.value;
                    setForm((current) => (current ? { ...current, birthDate: value, estimatedAge: value ? "" : current.estimatedAge } : current));
                  }}
                />
                <Input
                  className="h-11 rounded-xl border-petcenter-border-strong bg-white px-3 text-[14px] shadow-sm focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary/20"
                  disabled={Boolean(form.birthDate)}
                  min="0"
                  placeholder="Tuổi"
                  step="0.1"
                  type="number"
                  value={form.estimatedAge}
                  onChange={(event) => updateField("estimatedAge", event.target.value)}
                />
              </div>
            </div>

            <label className="space-y-2">
              <span className="block text-[12px] font-medium text-petcenter-text-secondary">{text.weight}</span>
              <Input
                className="h-11 rounded-xl border-petcenter-border-strong bg-white px-4 text-[14px] shadow-sm focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary/20"
                min="0"
                step="0.1"
                type="number"
                value={form.weightKg}
                onChange={(event) => updateField("weightKg", event.target.value)}
              />
            </label>

            <label className="space-y-2">
              <span className="block text-[12px] font-medium text-petcenter-text-secondary">{text.furColor}</span>
              <Input
                className="h-11 rounded-xl border-petcenter-border-strong bg-white px-4 text-[14px] shadow-sm focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary/20"
                value={form.furColor}
                onChange={(event) => updateField("furColor", event.target.value)}
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="block text-[12px] font-medium text-petcenter-text-secondary">{text.marks}</span>
            <Textarea
              className="min-h-[88px] resize-none rounded-xl border-petcenter-border-strong bg-white px-4 py-3 text-[14px] shadow-sm focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary/20"
              value={form.identifyingMarks}
              onChange={(event) => updateField("identifyingMarks", event.target.value)}
            />
          </label>

          <div className="flex items-center justify-end gap-3 border-t border-petcenter-border pt-6">
            <Button
              asChild
              className="h-10 rounded-xl bg-transparent px-6 text-[12px] font-medium text-petcenter-text-secondary transition hover:bg-petcenter-sidebar"
              variant="ghost"
            >
              <Link href={`/staff/pets/${encodeURIComponent(pet.petId)}`}>{text.cancel}</Link>
            </Button>
            <Button
              className="h-10 rounded-xl bg-petcenter-primary px-6 text-[12px] font-medium text-white shadow-sm transition hover:bg-petcenter-primary-hover active:bg-petcenter-primary-active"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-[18px] w-[18px] animate-spin" /> : <Save className="mr-2 h-[18px] w-[18px]" />}
              {text.save}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
