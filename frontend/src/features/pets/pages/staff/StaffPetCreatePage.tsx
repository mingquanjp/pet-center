"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  Contact,
  Loader2,
  Mail,
  PawPrint,
  Phone,
  Plus,
  Save,
  Search,
  TriangleAlert,
  User,
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

function getSpeciesLabel(value: FormState["species"]) {
  return speciesOptions.find((option) => option.value === value)?.label ?? "---";
}

function getGenderLabel(value: FormState["gender"]) {
  return genderOptions.find((option) => option.value === value)?.label ?? "---";
}

function StepIcon({
  disabled,
  icon,
  number,
}: {
  disabled?: boolean;
  icon: React.ReactNode;
  number: number;
}) {
  return (
    <div
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
        disabled ? "bg-petcenter-sidebar text-petcenter-text-muted" : "bg-petcenter-primary/10 text-petcenter-primary"
      )}
    >
      <span className="sr-only">Bước {number}</span>
      {icon}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-petcenter-text-secondary">{label}:</span>
      <span className="max-w-[190px] text-right font-semibold text-petcenter-text">{value || "---"}</span>
    </div>
  );
}

export function StaffPetCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      const message = "Vui lòng nhập SĐT hoặc email chủ nuôi.";
      setErrorMessage(message);
      toast.error(message);
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
      const message = error instanceof Error ? error.message : "Không thể tìm chủ nuôi.";
      setErrorMessage(message);
      toast.error(message);
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

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      const message = "Vui lòng chọn ảnh JPG, PNG hoặc WEBP.";
      setErrorMessage(message);
      toast.error(message);
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      const message = "Ảnh thú cưng không được vượt quá 5MB.";
      setErrorMessage(message);
      toast.error(message);
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
      const message = "Vui lòng chọn chủ nuôi trước khi lưu hồ sơ.";
      setErrorMessage(message);
      toast.error(message);
      return false;
    }

    if (!form.petName.trim() || !form.species || !form.gender) {
      const message = "Vui lòng nhập đầy đủ tên thú cưng, loài và giới tính.";
      setErrorMessage(message);
      toast.error(message);
      return false;
    }

    if (!form.birthDate && !form.estimatedAge.trim()) {
      const message = "Vui lòng nhập ngày sinh hoặc tuổi ước tính.";
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
      const message = error instanceof Error ? error.message : "Không thể tạo hồ sơ thú cưng.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPetFormLocked = !selectedOwner;
  const canSubmit = !!selectedOwner && !!form.petName.trim() && !!form.species && !!form.gender && (!!form.birthDate || !!form.estimatedAge.trim());

  return (
    <div className="flex-1 px-6 pt-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="pb-10 lg:col-span-2">
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex items-center text-sm text-petcenter-text-secondary">
              <Link className="hover:text-petcenter-primary" href="/staff/pets">
                Hồ sơ thú cưng
              </Link>
              <span className="mx-2 text-petcenter-text-muted">›</span>
              <span className="font-medium text-petcenter-text">Tạo hồ sơ</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-petcenter-text">Tạo hồ sơ thú cưng tại quầy</h1>
              <p className="mt-1 text-sm text-petcenter-text-secondary">
                Tạo nhanh hồ sơ thú cưng cho chủ nuôi đã có tài khoản tại trung tâm.
              </p>
            </div>
          </div>

          {errorMessage ? (
            <section className="mb-6 flex items-start gap-3 rounded-[16px] border border-petcenter-danger-text/20 bg-petcenter-danger-bg p-4 text-petcenter-danger-text">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm leading-5">{errorMessage}</p>
            </section>
          ) : null}

          <div className="space-y-6">
            <section className="rounded-[16px] border border-petcenter-border bg-petcenter-card p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <StepIcon icon={<User className="h-5 w-5" />} number={1} />
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-petcenter-text">1. Chủ nuôi</h2>
                    <p className="mt-1 text-sm text-petcenter-text-secondary">
                      Tìm khách hàng bằng số điện thoại hoặc email.
                    </p>
                  </div>
                </div>
                <Button
                  asChild
                  className="h-9 rounded-[8px] border-petcenter-border bg-white text-sm font-medium text-petcenter-text hover:border-petcenter-primary hover:bg-petcenter-primary/10 hover:text-petcenter-primary"
                  variant="outline"
                >
                  <Link href={`/staff/pets/create-owner?q=${encodeURIComponent(ownerQuery.trim())}`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm chủ nuôi
                  </Link>
                </Button>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <span className="relative block flex-1">
                  <Contact className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-petcenter-text-muted" />
                  <Input
                    className="h-14 rounded-[12px] border-petcenter-border bg-white pl-12 text-sm shadow-sm focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary/20"
                    placeholder="Tìm kiếm khách hàng bằng SĐT hoặc Email..."
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
                <Button
                  className="h-14 rounded-[12px] bg-petcenter-primary px-8 text-sm font-bold text-white shadow-md hover:bg-petcenter-primary-hover"
                  disabled={isSearchingOwner}
                  onClick={handleOwnerSearch}
                  type="button"
                >
                  {isSearchingOwner ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                  Tìm chủ nuôi
                </Button>
              </div>

              {hasSearchedOwner && owners.length === 0 ? (
                <div className="mt-5 rounded-[12px] border border-petcenter-warning-text/30 bg-petcenter-warning-bg p-4">
                  <div className="flex items-start gap-3">
                    <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-petcenter-warning-text" />
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-petcenter-text">Không tìm thấy chủ nuôi</h3>
                      <p className="mt-1 text-sm leading-5 text-petcenter-text-secondary">
                        Chủ nuôi này chưa có tài khoản trong hệ thống. Vui lòng tạo tài khoản chủ nuôi trước khi tạo hồ sơ thú cưng.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Button asChild className="h-9 rounded-[8px] bg-petcenter-primary px-4 text-sm font-semibold text-white hover:bg-petcenter-primary-hover">
                          <Link href={`/staff/pets/create-owner?q=${encodeURIComponent(lastOwnerQuery || ownerQuery.trim())}`}>
                            Tạo tài khoản chủ nuôi
                          </Link>
                        </Button>
                        <Button
                          className="h-9 rounded-[8px] border-petcenter-border bg-white px-4 text-sm font-semibold text-petcenter-text-secondary hover:bg-petcenter-sidebar"
                          onClick={() => {
                            setHasSearchedOwner(false);
                            setOwners([]);
                            window.setTimeout(() => ownerSearchInputRef.current?.focus(), 0);
                          }}
                          type="button"
                          variant="outline"
                        >
                          Tìm lại
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : owners.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {owners.map((owner) => {
                    const active = selectedOwner?.userId === owner.userId;

                    return (
                      <article
                        className={cn(
                          "flex flex-col gap-4 rounded-[12px] border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between",
                          active ? "border-petcenter-primary ring-2 ring-petcenter-primary/15" : "border-petcenter-border"
                        )}
                        key={owner.userId}
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-petcenter-primary text-base font-bold text-white">
                            {owner.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-base font-bold text-petcenter-text">{owner.fullName}</p>
                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-petcenter-text-secondary">
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
                            "h-10 rounded-[10px] px-5 text-sm font-semibold",
                            active
                              ? "bg-petcenter-success-bg text-petcenter-success-text hover:bg-petcenter-success-bg"
                              : "bg-petcenter-primary text-white hover:bg-petcenter-primary-hover"
                          )}
                          onClick={() => setSelectedOwner(owner)}
                          type="button"
                        >
                          {active ? <CheckCircle2 className="mr-2 h-4 w-4" /> : null}
                          {active ? "Đã chọn" : "Chọn chủ nuôi"}
                        </Button>
                      </article>
                    );
                  })}
                </div>
              ) : null}
            </section>

            <section className={cn("rounded-[16px] border border-petcenter-border bg-petcenter-card p-6 shadow-sm", isPetFormLocked && "opacity-60")}>
              <div className="mb-6 flex items-center gap-4">
                <StepIcon disabled={isPetFormLocked} icon={<PawPrint className="h-5 w-5" />} number={2} />
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-petcenter-text">2. Thú cưng</h2>
                  <p className="mt-1 text-sm text-petcenter-text-secondary">
                    Điền thông tin chi tiết cho thú cưng mới. Vui lòng chọn chủ nuôi trước.
                  </p>
                </div>
              </div>

              {isPetFormLocked ? (
                <div className="flex h-14 items-center justify-center rounded-[12px] border border-dashed border-petcenter-border bg-petcenter-background/50 text-sm text-petcenter-text-secondary">
                  Vui lòng chọn chủ nuôi trước
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="rounded-[14px] border border-petcenter-border bg-white p-5">
                    <div className="mb-5 flex items-center gap-2 border-b border-petcenter-border pb-4">
                      <span className="h-4 w-1.5 rounded-full bg-petcenter-primary" />
                      <h3 className="font-bold text-petcenter-text">Thông tin bắt buộc</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <label className="space-y-2 md:col-span-2">
                        <span className="text-sm font-semibold text-petcenter-text">
                          Tên thú cưng <span className="text-petcenter-danger-text">*</span>
                        </span>
                        <Input
                          className="h-11 rounded-[10px] border-petcenter-border focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary/20"
                          placeholder="Nhập tên gọi ở nhà"
                          value={form.petName}
                          onChange={(event) => updateField("petName", event.target.value)}
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-petcenter-text">
                          Loài <span className="text-petcenter-danger-text">*</span>
                        </span>
                        <select
                          className="h-11 w-full rounded-[10px] border border-petcenter-border bg-white px-4 text-sm text-petcenter-text outline-none transition focus:border-petcenter-primary focus:ring-2 focus:ring-petcenter-primary/20"
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

                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-petcenter-text">
                          Giới tính <span className="text-petcenter-danger-text">*</span>
                        </span>
                        <select
                          className="h-11 w-full rounded-[10px] border border-petcenter-border bg-white px-4 text-sm text-petcenter-text outline-none transition focus:border-petcenter-primary focus:ring-2 focus:ring-petcenter-primary/20"
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
                  </div>

                  <div className="rounded-[14px] border border-petcenter-border bg-white p-5">
                    <div className="mb-5 flex items-center gap-2 border-b border-petcenter-border pb-4">
                      <span className="h-4 w-1.5 rounded-full bg-petcenter-primary" />
                      <div>
                        <h3 className="font-bold text-petcenter-text">Thông tin bổ sung</h3>
                        <p className="mt-1 text-xs text-petcenter-text-secondary">
                          Cần nhập ngày sinh hoặc tuổi ước tính để lưu hồ sơ.
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <label className="space-y-2 md:col-span-2">
                        <span className="text-sm font-semibold text-petcenter-text">Giống</span>
                        <Input
                          className="h-11 rounded-[10px] border-petcenter-border focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary/20"
                          placeholder="VD: Poodle, Golden Retriever..."
                          value={form.breed}
                          onChange={(event) => updateField("breed", event.target.value)}
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-petcenter-text">Ngày sinh</span>
                        <Input
                          className="h-11 rounded-[10px] border-petcenter-border focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary/20"
                          max={new Date().toISOString().slice(0, 10)}
                          type="date"
                          value={form.birthDate}
                          onChange={(event) => {
                            const value = event.target.value;
                            setForm((current) => ({ ...current, birthDate: value, estimatedAge: value ? "" : current.estimatedAge }));
                          }}
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-petcenter-text">Tuổi ước tính</span>
                        <div className="relative">
                          <Input
                            className="h-11 rounded-[10px] border-petcenter-border pr-14 focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary/20"
                            disabled={Boolean(form.birthDate)}
                            min="0"
                            placeholder="VD: 2"
                            step="0.1"
                            type="number"
                            value={form.estimatedAge}
                            onChange={(event) => updateField("estimatedAge", event.target.value)}
                          />
                          <span className="absolute right-4 top-3 text-sm text-petcenter-text-muted">năm</span>
                        </div>
                      </label>

                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-petcenter-text">Cân nặng</span>
                        <div className="relative">
                          <Input
                            className="h-11 rounded-[10px] border-petcenter-border pr-12 focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary/20"
                            min="0"
                            placeholder="VD: 12.5"
                            step="0.01"
                            type="number"
                            value={form.weightKg}
                            onChange={(event) => updateField("weightKg", event.target.value)}
                          />
                          <span className="absolute right-4 top-3 text-sm text-petcenter-text-muted">kg</span>
                        </div>
                      </label>

                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-petcenter-text">Màu lông</span>
                        <Input
                          className="h-11 rounded-[10px] border-petcenter-border focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary/20"
                          placeholder="VD: Vàng, trắng..."
                          value={form.furColor}
                          onChange={(event) => updateField("furColor", event.target.value)}
                        />
                      </label>

                      <label className="space-y-2 md:col-span-2">
                        <span className="text-sm font-semibold text-petcenter-text">Đặc điểm nhận dạng</span>
                        <Textarea
                          className="min-h-[96px] resize-y rounded-[10px] border-petcenter-border focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary/20"
                          placeholder="Ghi chú vết sẹo, đốm lông, dấu hiệu nhận dạng hoặc lưu ý chăm sóc..."
                          value={form.identifyingMarks}
                          onChange={(event) => updateField("identifyingMarks", event.target.value)}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="rounded-[14px] border border-petcenter-border bg-white p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="h-4 w-1.5 rounded-full bg-petcenter-primary" />
                      <h3 className="font-bold text-petcenter-text">Ảnh đại diện thú cưng</h3>
                    </div>
                    <input
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      onChange={handleAvatarChange}
                      ref={avatarInputRef}
                      type="file"
                    />
                    <div className="flex flex-col gap-4 rounded-[12px] border border-dashed border-petcenter-border bg-petcenter-background/50 p-5 sm:flex-row sm:items-center">
                      <button
                        className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-petcenter-border bg-white text-petcenter-text-muted transition hover:border-petcenter-primary hover:text-petcenter-primary"
                        onClick={() => avatarInputRef.current?.click()}
                        type="button"
                      >
                        {avatarPreviewUrl ? (
                          <Image alt="Ảnh đại diện thú cưng" className="h-full w-full object-cover" height={96} src={avatarPreviewUrl} width={96} />
                        ) : (
                          <Camera className="h-8 w-8" />
                        )}
                      </button>
                      <div className="flex-1">
                        <p className="font-semibold text-petcenter-text">Tải ảnh thú cưng</p>
                        <p className="mt-1 text-sm text-petcenter-text-secondary">Hỗ trợ JPG, PNG hoặc WEBP. Tối đa 5MB.</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            className="h-9 rounded-[8px] border-petcenter-border bg-white text-sm font-semibold text-petcenter-primary hover:bg-petcenter-primary/10"
                            onClick={() => avatarInputRef.current?.click()}
                            type="button"
                            variant="outline"
                          >
                            Chọn ảnh
                          </Button>
                          {avatarPreviewUrl ? (
                            <Button
                              className="h-9 rounded-[8px] border-petcenter-border bg-white text-sm font-semibold text-petcenter-text-secondary hover:bg-petcenter-sidebar"
                              onClick={clearAvatar}
                              type="button"
                              variant="outline"
                            >
                              Xóa ảnh
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>

        <aside className="sticky top-6 z-10 lg:col-span-1">
          <div className="mb-6 flex h-10 items-center justify-end">
            <Button
              asChild
              className="h-auto shrink-0 rounded-control border-petcenter-primary px-4 py-2 text-base font-medium text-petcenter-primary transition-colors hover:bg-petcenter-primary hover:text-white"
              variant="outline"
            >
              <Link href="/staff/pets">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại danh sách
              </Link>
            </Button>
          </div>

          <div className="rounded-card border border-petcenter-border bg-petcenter-card p-6 shadow-card">
            <h2 className="mb-4 border-b border-petcenter-border pb-3 text-lg font-semibold text-petcenter-text">
              Tóm tắt hồ sơ
            </h2>

            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-petcenter-border bg-petcenter-background text-petcenter-primary">
                {avatarPreviewUrl ? (
                  <Image alt="Ảnh thú cưng" className="h-full w-full object-cover" height={64} src={avatarPreviewUrl} width={64} />
                ) : (
                  <PawPrint className="h-7 w-7" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-petcenter-text">{form.petName.trim() || "Chưa nhập tên"}</p>
                <p className="mt-1 text-sm text-petcenter-text-secondary">
                  {getSpeciesLabel(form.species)} {form.breed.trim() ? `• ${form.breed.trim()}` : ""}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <SummaryRow label="Chủ nuôi" value={selectedOwner?.fullName} />
              <SummaryRow label="Số điện thoại" value={selectedOwner?.phoneNumber} />
              <SummaryRow label="Email" value={selectedOwner?.email} />
              <SummaryRow label="Loài" value={getSpeciesLabel(form.species)} />
              <SummaryRow label="Giới tính" value={getGenderLabel(form.gender)} />
              <SummaryRow label="Ngày sinh" value={form.birthDate || "---"} />
              <SummaryRow label="Tuổi ước tính" value={form.estimatedAge.trim() ? `${form.estimatedAge.trim()} năm` : "---"} />
              <SummaryRow label="Cân nặng" value={form.weightKg.trim() ? `${form.weightKg.trim()} kg` : "---"} />
            </div>

            <Button
              className="mt-6 w-full rounded-control bg-petcenter-cta py-6 text-base font-bold text-white shadow-md transition-all hover:bg-petcenter-cta-hover"
              disabled={!canSubmit || isSubmitting}
              onClick={handleSubmit}
              type="button"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Lưu hồ sơ
                </>
              )}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
