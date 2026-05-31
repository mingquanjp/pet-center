"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Contact,
  Info,
  Loader2,
  Mail,
  PawPrint,
  Phone,
  Save,
  Search,
  TriangleAlert,
  Upload,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { uploadsApi } from "@/features/uploads/api/uploads.api";
import { cn } from "@/lib/utils";
import { petsApi } from "../../api/pets.api";
import type { PetGender, PetSpecies, StaffCreatePetInput, StaffOwnerCandidate } from "../../types/pet.types";

type FormState = {
  petName: string;
  species: "" | PetSpecies;
  breed: string;
  gender: "" | PetGender;
  birthDate: string;
  estimatedAge: string;
  weightKg: string;
  furColor: string;
  identifyingMarks: string;
};

const initialFormState: FormState = {
  petName: "",
  species: "",
  breed: "",
  gender: "",
  birthDate: "",
  estimatedAge: "",
  weightKg: "",
  furColor: "",
  identifyingMarks: "",
};

const text = {
  breadcrumbRoot: "Hồ sơ thú cưng",
  breadcrumbCurrent: "Tạo hồ sơ",
  title: "Tạo hồ sơ thú cưng tại quầy",
  back: "Quay lại danh sách",
  findOwnerTitle: "Tìm chủ nuôi",
  findOwnerDescription: "Nhập SĐT hoặc Email để tìm tài khoản chủ nuôi đã tồn tại.",
  ownerSearchLabel: "SĐT hoặc Email chủ nuôi",
  ownerSearchPlaceholder: "Nhập thông tin tìm kiếm...",
  findOwner: "Tìm chủ nuôi",
  searchResult: "Kết quả tìm kiếm",
  chooseOwner: "Chọn chủ nuôi này",
  selectedOwner: "Đã chọn chủ nuôi",
  noOwner: "Không tìm thấy chủ nuôi phù hợp.",
  noOwnerTitle: "Không tìm thấy Chủ nuôi",
  noOwnerDescription: "Chủ nuôi này chưa có tài khoản trong hệ thống. Vui lòng tạo tài khoản Chủ nuôi trước khi tạo hồ sơ thú cưng.",
  searchedOwner: "SĐT/Email đã nhập:",
  createOwner: "Tạo tài khoản Chủ nuôi",
  searchAgain: "Tìm lại",
  petInfoTitle: "Nhập thông tin thú cưng",
  petInfoDescription: "Điền thông tin chi tiết cho thú cưng mới. Vui lòng chọn chủ nuôi trước.",
  requiredInfo: "Thông tin bắt buộc",
  optionalInfo: "Thông tin bổ sung",
  petName: "Tên thú cưng",
  species: "Loài",
  gender: "Giới tính",
  breed: "Giống",
  birthDate: "Ngày sinh",
  estimatedAge: "Tuổi ước tính",
  weight: "Cân nặng (kg)",
  furColor: "Màu lông",
  identifyingMarks: "Đặc điểm nhận dạng",
  uploadTitle: "Upload ảnh thú cưng",
  uploadHint: "Kéo thả ảnh hoặc click để tải lên",
  uploadMeta: "Hỗ trợ JPG, PNG. Tối đa 5MB.",
  cancel: "Hủy",
  submit: "Lưu hồ sơ",
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

function buildPayload(form: FormState, ownerUserId: string, profileImageUrl: string | null): StaffCreatePetInput {
  return {
    ownerUserId,
    petName: form.petName.trim(),
    species: form.species as PetSpecies,
    breed: optionalText(form.breed),
    gender: form.gender || null,
    birthDate: form.birthDate || null,
    estimatedAge: form.birthDate ? null : optionalNumber(form.estimatedAge),
    weightKg: optionalNumber(form.weightKg),
    furColor: optionalText(form.furColor),
    profileImageUrl,
    identifyingMarks: optionalText(form.identifyingMarks),
  };
}

export function StaffPetCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputId = React.useId();
  const ownerSearchInputRef = React.useRef<HTMLInputElement | null>(null);
  const avatarInputRef = React.useRef<HTMLInputElement | null>(null);
  const avatarPreviewRef = React.useRef<string | null>(null);
  const didAutoSearchOwnerRef = React.useRef(false);

  const [ownerQuery, setOwnerQuery] = React.useState(() => searchParams.get("ownerQuery") ?? "");
  const [owners, setOwners] = React.useState<StaffOwnerCandidate[]>([]);
  const [selectedOwner, setSelectedOwner] = React.useState<StaffOwnerCandidate | null>(null);
  const [form, setForm] = React.useState<FormState>(initialFormState);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = React.useState<string | null>(null);
  const [isSearchingOwner, setIsSearchingOwner] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [hasSearchedOwner, setHasSearchedOwner] = React.useState(false);
  const [lastOwnerQuery, setLastOwnerQuery] = React.useState("");

  React.useEffect(() => {
    return () => {
      if (avatarPreviewRef.current) {
        URL.revokeObjectURL(avatarPreviewRef.current);
      }
    };
  }, []);

  const updateField = <T extends keyof FormState>(field: T, value: FormState[T]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleOwnerSearch = React.useCallback(async () => {
    const query = ownerQuery.trim();
    if (!query) {
      setErrorMessage("Vui lòng nhập SĐT hoặc email chủ nuôi.");
      return;
    }

    try {
      setErrorMessage(null);
      setIsSearchingOwner(true);
      setHasSearchedOwner(true);
      setLastOwnerQuery(query);
      const result = await petsApi.searchStaffOwners(query);
      setOwners(result);
      if (selectedOwner && !result.some((owner) => owner.userId === selectedOwner.userId)) {
        setSelectedOwner(null);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể tìm chủ nuôi.");
    } finally {
      setIsSearchingOwner(false);
    }
  }, [ownerQuery, selectedOwner]);

  React.useEffect(() => {
    const initialOwnerQuery = searchParams.get("ownerQuery")?.trim();
    if (!initialOwnerQuery || didAutoSearchOwnerRef.current) return;

    didAutoSearchOwnerRef.current = true;
    void handleOwnerSearch();
  }, [handleOwnerSearch, searchParams]);

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

    setErrorMessage(null);
    if (avatarPreviewRef.current) {
      URL.revokeObjectURL(avatarPreviewRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    avatarPreviewRef.current = objectUrl;
    setAvatarFile(file);
    setAvatarPreviewUrl(objectUrl);
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
    if (!selectedOwner) {
      setErrorMessage("Vui lòng chọn chủ nuôi trước khi lưu hồ sơ.");
      return false;
    }

    if (!form.petName.trim() || !form.species || !form.gender) {
      setErrorMessage("Vui lòng nhập đầy đủ tên thú cưng, loài và giới tính.");
      return false;
    }

    if (!form.birthDate && !form.estimatedAge.trim()) {
      setErrorMessage("Vui lòng nhập ngày sinh hoặc tuổi ước tính.");
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

  const handleSubmit = async () => {
    setErrorMessage(null);
    if (!validateForm() || !selectedOwner) return;

    try {
      setIsSubmitting(true);
      const uploadedAvatar = avatarFile ? await uploadsApi.uploadImage(avatarFile) : null;
      const pet = await petsApi.createStaff(
        buildPayload(form, selectedOwner.userId, uploadedAvatar?.secureUrl ?? avatarPreviewUrl)
      );

      toast.success("Tạo hồ sơ thú cưng tại quầy thành công");
      router.push(`/staff/pets/${encodeURIComponent(pet.petId)}`);
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể tạo hồ sơ thú cưng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPetFormLocked = !selectedOwner;

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 pb-28">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <nav className="mb-2 flex items-center gap-2 text-sm text-petcenter-text-secondary">
            <Link className="flex items-center gap-1 transition-colors hover:text-petcenter-primary" href="/staff/pets">
              <PawPrint className="h-4 w-4" />
              {text.breadcrumbRoot}
            </Link>
            <span>/</span>
            <span className="font-medium text-petcenter-primary">{text.breadcrumbCurrent}</span>
          </nav>
          <h1 className="text-[24px] font-semibold leading-8 tracking-[-0.01em] text-petcenter-text">{text.title}</h1>
        </div>

        <Button
          asChild
          className="h-10 rounded-xl border border-petcenter-primary bg-white px-4 text-sm font-semibold text-petcenter-primary shadow-card transition hover:bg-petcenter-sidebar"
          variant="outline"
        >
          <Link href="/staff/pets">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {text.back}
          </Link>
        </Button>
      </div>

      {errorMessage ? (
        <section className="flex items-start gap-3 rounded-[16px] border border-petcenter-danger-text/20 bg-petcenter-danger-bg p-4 text-petcenter-danger-text">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm leading-5">{errorMessage}</p>
        </section>
      ) : null}

      <section className="relative overflow-hidden rounded-[16px] border border-petcenter-border bg-white p-8 shadow-card">
        <div className="absolute inset-y-0 left-0 w-1 bg-petcenter-primary" />
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-3 text-[18px] font-bold leading-7 text-petcenter-text">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D8F3EE] text-sm font-bold text-petcenter-primary">
                1
              </span>
              {text.findOwnerTitle}
            </h2>
            <p className="mt-2 text-sm text-petcenter-text-secondary">{text.findOwnerDescription}</p>
          </div>
          <UserRound className="h-12 w-12 text-petcenter-border-strong" />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <label className="block flex-1">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.02em] text-petcenter-text-secondary">
              {text.ownerSearchLabel}
            </span>
            <span className="relative block">
              <Contact className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-petcenter-text-muted" />
              <Input
                className="h-12 rounded-xl border-petcenter-border-strong bg-white pl-10 text-sm text-petcenter-text placeholder:text-petcenter-text-muted focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary/20"
                placeholder={text.ownerSearchPlaceholder}
                ref={ownerSearchInputRef}
                value={ownerQuery}
                onChange={(event) => setOwnerQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleOwnerSearch();
                  }
                }}
              />
            </span>
          </label>
          <Button
            className="h-12 rounded-xl bg-petcenter-primary px-8 text-sm font-medium text-white shadow-sm transition hover:bg-petcenter-primary-hover"
            disabled={isSearchingOwner}
            onClick={handleOwnerSearch}
            type="button"
          >
            {isSearchingOwner ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            {text.findOwner}
          </Button>
        </div>

        {hasSearchedOwner && owners.length === 0 ? (
          <div className="mt-6 rounded-xl border border-[#FACC15]/60 bg-[#FEFCE8] p-5">
            <div className="flex items-start gap-3">
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#B45309]" />
              <div className="flex-1">
                <h3 className="mb-1 text-sm font-bold text-petcenter-text">{text.noOwnerTitle}</h3>
                <p className="mb-3 text-sm leading-5 text-petcenter-text-secondary">{text.noOwnerDescription}</p>
                <p className="mb-4 inline-block rounded-md border border-petcenter-border bg-petcenter-sidebar px-3 py-1.5 text-xs font-medium text-petcenter-text-secondary">
                  {text.searchedOwner} <span className="font-bold text-petcenter-text">{lastOwnerQuery}</span>
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    asChild
                    className="h-9 rounded-lg bg-petcenter-primary px-4 text-sm font-medium text-white shadow-sm transition hover:bg-petcenter-primary-hover"
                  >
                    <Link href={`/staff/pets/create-owner?q=${encodeURIComponent(lastOwnerQuery || ownerQuery.trim())}`}>
                      {text.createOwner}
                    </Link>
                  </Button>
                  <Button
                    className="h-9 rounded-lg border border-petcenter-border-strong bg-white px-4 text-sm font-medium text-petcenter-text-secondary transition hover:bg-petcenter-sidebar"
                    onClick={() => {
                      setHasSearchedOwner(false);
                      setOwners([]);
                      window.setTimeout(() => ownerSearchInputRef.current?.focus(), 0);
                    }}
                    type="button"
                    variant="outline"
                  >
                    {text.searchAgain}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : owners.length > 0 ? (
          <div className="mt-8 rounded-xl border border-[#AAD0AF] bg-[#C5ECCA] p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.04em] text-[#2C4E35]">
              {text.searchResult} ({owners.length})
            </p>
            <div className="space-y-3">
              {owners.map((owner) => {
                const active = selectedOwner?.userId === owner.userId;

                return (
                  <article
                    className={cn(
                      "flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between",
                      active ? "border-petcenter-primary ring-2 ring-petcenter-primary/15" : "border-petcenter-border"
                    )}
                    key={owner.userId}
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#507357] text-lg font-bold text-white">
                        {owner.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-base font-bold text-petcenter-text">{owner.fullName}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-petcenter-text-secondary">
                          {owner.phoneNumber ? (
                            <span className="inline-flex items-center gap-1.5">
                              <Phone className="h-4 w-4" />
                              {owner.phoneNumber}
                            </span>
                          ) : null}
                          {owner.email ? (
                            <span className="inline-flex items-center gap-1.5">
                              <Mail className="h-4 w-4" />
                              {owner.email}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <Button
                      className={cn(
                        "h-10 rounded-xl px-6 text-sm font-medium transition",
                        active
                          ? "bg-petcenter-success-bg text-petcenter-success-text hover:bg-petcenter-success-bg"
                          : "bg-[#97F3E2] text-[#00201B] hover:bg-[#7AD7C6]"
                      )}
                      onClick={() => setSelectedOwner(owner)}
                      type="button"
                    >
                      {active ? <CheckCircle2 className="mr-2 h-4 w-4" /> : null}
                      {active ? text.selectedOwner : text.chooseOwner}
                    </Button>
                  </article>
                );
              })}
            </div>
          </div>
        ) : null}
      </section>

      <section className="relative overflow-hidden rounded-[16px] border border-petcenter-border bg-white p-8 shadow-card">
        <div className={cn("absolute inset-y-0 left-0 w-1", isPetFormLocked ? "bg-petcenter-border-strong" : "bg-petcenter-primary")} />
        <div className="mb-8 border-b border-petcenter-border pb-5">
          <h2 className="flex items-center gap-3 text-[18px] font-bold leading-7 text-petcenter-text">
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                isPetFormLocked ? "bg-petcenter-sidebar text-petcenter-text-secondary" : "bg-[#D8F3EE] text-petcenter-primary"
              )}
            >
              2
            </span>
            {text.petInfoTitle}
          </h2>
          <p className="mt-2 text-sm text-petcenter-text-secondary">{text.petInfoDescription}</p>
        </div>

        <div className={cn("grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2", isPetFormLocked && "pointer-events-none opacity-50")}>
          <div className="md:col-span-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.04em] text-petcenter-primary">
              <Info className="h-[18px] w-[18px]" />
              {text.requiredInfo}
            </h3>
          </div>

          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.02em] text-petcenter-text-secondary">
              {text.petName} <span className="text-petcenter-danger-text">*</span>
            </span>
            <Input
              className="h-12 rounded-xl border-petcenter-border-strong bg-white px-4 text-sm focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary/20"
              disabled={isPetFormLocked}
              placeholder="Nhập tên..."
              value={form.petName}
              onChange={(event) => updateField("petName", event.target.value)}
            />
          </label>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.02em] text-petcenter-text-secondary">
                {text.species} <span className="text-petcenter-danger-text">*</span>
              </span>
              <select
                className="h-12 w-full rounded-xl border border-petcenter-border-strong bg-white px-4 text-sm text-petcenter-text outline-none transition focus:border-petcenter-primary focus:ring-2 focus:ring-petcenter-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isPetFormLocked}
                value={form.species}
                onChange={(event) => updateField("species", event.target.value as FormState["species"])}
              >
                <option value="" disabled>
                  Chọn loài
                </option>
                {speciesOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.02em] text-petcenter-text-secondary">
                {text.gender} <span className="text-petcenter-danger-text">*</span>
              </span>
              <select
                className="h-12 w-full rounded-xl border border-petcenter-border-strong bg-white px-4 text-sm text-petcenter-text outline-none transition focus:border-petcenter-primary focus:ring-2 focus:ring-petcenter-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isPetFormLocked}
                value={form.gender}
                onChange={(event) => updateField("gender", event.target.value as FormState["gender"])}
              >
                <option value="" disabled>
                  Chọn giới tính
                </option>
                {genderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-6 border-t border-petcenter-border pt-6 md:col-span-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.04em] text-petcenter-text-muted">
              <PawPrint className="h-[18px] w-[18px]" />
              {text.optionalInfo}
            </h3>
          </div>

          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.02em] text-petcenter-text-secondary">{text.breed}</span>
            <Input
              className="h-12 rounded-xl border-petcenter-border-strong bg-white px-4 text-sm focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary/20"
              disabled={isPetFormLocked}
              placeholder="VD: Poodle, Corgi..."
              value={form.breed}
              onChange={(event) => updateField("breed", event.target.value)}
            />
          </label>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.02em] text-petcenter-text-secondary">
                {text.birthDate}
              </span>
              <Input
                className="h-12 rounded-xl border-petcenter-border-strong bg-white px-4 text-sm focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary/20"
                disabled={isPetFormLocked}
                max={new Date().toISOString().slice(0, 10)}
                type="date"
                value={form.birthDate}
                onChange={(event) => {
                  const value = event.target.value;
                  setForm((current) => ({ ...current, birthDate: value, estimatedAge: value ? "" : current.estimatedAge }));
                }}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.02em] text-petcenter-text-secondary">
                {text.estimatedAge}
              </span>
              <Input
                className="h-12 rounded-xl border-petcenter-border-strong bg-white px-4 text-sm focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary/20"
                disabled={isPetFormLocked || Boolean(form.birthDate)}
                min="0"
                placeholder="VD: 2"
                step="0.1"
                type="number"
                value={form.estimatedAge}
                onChange={(event) => updateField("estimatedAge", event.target.value)}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.02em] text-petcenter-text-secondary">{text.weight}</span>
              <Input
                className="h-12 rounded-xl border-petcenter-border-strong bg-white px-4 text-sm focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary/20"
                disabled={isPetFormLocked}
                min="0"
                placeholder="0.0"
                step="0.1"
                type="number"
                value={form.weightKg}
                onChange={(event) => updateField("weightKg", event.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.02em] text-petcenter-text-secondary">
                {text.furColor}
              </span>
              <Input
                className="h-12 rounded-xl border-petcenter-border-strong bg-white px-4 text-sm focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary/20"
                disabled={isPetFormLocked}
                placeholder="VD: Vàng, Trắng..."
                value={form.furColor}
                onChange={(event) => updateField("furColor", event.target.value)}
              />
            </label>
          </div>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.02em] text-petcenter-text-secondary">
              {text.identifyingMarks}
            </span>
            <Textarea
              className="min-h-[96px] resize-none rounded-xl border-petcenter-border-strong bg-white px-4 py-3 text-sm focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary/20"
              disabled={isPetFormLocked}
              placeholder="Mô tả các đặc điểm nổi bật để dễ nhận diện..."
              value={form.identifyingMarks}
              onChange={(event) => updateField("identifyingMarks", event.target.value)}
            />
          </label>

          <div className="md:col-span-2">
            <span className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.02em] text-petcenter-text-secondary">
              {text.uploadTitle}
            </span>
            <input
              accept="image/png,image/jpeg"
              className="sr-only"
              disabled={isPetFormLocked}
              id={fileInputId}
              onChange={handleAvatarChange}
              ref={avatarInputRef}
              type="file"
            />
            <label
              className={cn(
                "group flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-[16px] border-2 border-dashed border-petcenter-border-strong bg-white p-8 text-center transition hover:bg-petcenter-filter",
                isPetFormLocked && "cursor-not-allowed opacity-60"
              )}
              htmlFor={isPetFormLocked ? undefined : fileInputId}
            >
              {avatarPreviewUrl ? (
                <div className="flex flex-col items-center gap-4">
                  <div
                    aria-label="Ảnh thú cưng đã chọn"
                    className="h-28 w-28 rounded-[16px] border border-petcenter-border bg-cover bg-center shadow-card"
                    role="img"
                    style={{ backgroundImage: `url(${avatarPreviewUrl})` }}
                  />
                  <button
                    className="text-sm font-semibold text-petcenter-primary transition hover:text-petcenter-primary-hover"
                    onClick={(event) => {
                      event.preventDefault();
                      clearAvatar();
                    }}
                    type="button"
                  >
                    Chọn ảnh khác
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="mb-3 h-10 w-10 text-petcenter-text-muted transition group-hover:text-petcenter-primary" />
                  <p className="text-base font-medium text-petcenter-text">{text.uploadHint}</p>
                  <p className="mt-2 text-sm text-petcenter-text-secondary">{text.uploadMeta}</p>
                </>
              )}
            </label>
          </div>
        </div>
      </section>

      <div className="sticky bottom-[-32px] z-20 -mx-8 border-t border-petcenter-border bg-petcenter-background/95 px-8 py-6 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1200px] justify-end gap-4">
          <Button
            asChild
            className="h-12 rounded-xl border border-petcenter-primary bg-white px-8 text-sm font-medium text-petcenter-primary shadow-sm transition hover:bg-petcenter-sidebar"
            variant="outline"
          >
            <Link href="/staff/pets">{text.cancel}</Link>
          </Button>
          <Button
            className="h-12 rounded-xl bg-petcenter-cta px-10 text-sm font-medium text-white shadow-md transition hover:bg-petcenter-cta-hover"
            disabled={isSubmitting}
            onClick={handleSubmit}
            type="button"
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {text.submit}
          </Button>
        </div>
      </div>

    </div>
  );
}
