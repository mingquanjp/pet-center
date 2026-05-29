"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bed,
  CalendarClock,
  ChevronRight,
  Edit3,
  History,
  Info,
  Mail,
  MapPin,
  PawPrint,
  Phone,
  Sparkles,
  Stethoscope,
  Syringe,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { petsApi } from "../../api/pets.api";
import type { PetActivityLog, StaffPetDetail } from "../../types/pet.types";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { cn } from "@/lib/utils";

type StaffPetDetailPageProps = {
  petId: string;
};

const text = {
  back: "Quay l\u1ea1i danh s\u00e1ch",
  list: "H\u1ed3 s\u01a1 th\u00fa c\u01b0ng",
  detail: "Chi ti\u1ebft",
  edit: "Ch\u1ec9nh s\u1eeda h\u1ed3 s\u01a1",
  detailInfo: "Th\u00f4ng tin chi ti\u1ebft",
  owner: "Ch\u1ee7 nu\u00f4i",
  contact: "Li\u00ean h\u1ec7",
  loyalOwner: "Ch\u1ee7 nu\u00f4i",
  recentActivity: "Ho\u1ea1t \u0111\u1ed9ng g\u1ea7n \u0111\u00e2y",
  viewAll: "Xem t\u1ea5t c\u1ea3",
  loadingTitle: "\u0110ang t\u1ea3i h\u1ed3 s\u01a1 th\u00fa c\u01b0ng...",
  loadingDescription: "D\u1eef li\u1ec7u \u0111\u01b0\u1ee3c l\u1ea5y t\u1eeb h\u1ec7 th\u1ed1ng.",
  error: "Kh\u00f4ng th\u1ec3 t\u1ea3i chi ti\u1ebft h\u1ed3 s\u01a1 th\u00fa c\u01b0ng",
  retry: "Th\u1eed l\u1ea1i",
  petCode: "M\u00e3 h\u1ed3 s\u01a1",
  speciesBreed: "Lo\u00e0i / Gi\u1ed1ng",
  gender: "Gi\u1edbi t\u00ednh",
  age: "Tu\u1ed5i",
  weight: "C\u00e2n n\u1eb7ng",
  furColor: "M\u00e0u l\u00f4ng",
  marks: "\u0110\u1eb7c \u0111i\u1ec3m nh\u1eadn d\u1ea1ng",
  actor: "Ng\u01b0\u1eddi th\u1ef1c hi\u1ec7n:",
  noData: "Ch\u01b0a c\u1eadp nh\u1eadt",
  noActivity: "Ch\u01b0a c\u00f3 ho\u1ea1t \u0111\u1ed9ng g\u1ea7n \u0111\u00e2y.",
};

const categoryMeta: Record<PetActivityLog["activityCategory"], { label: string; icon: LucideIcon; dotClass: string; textClass: string }> = {
  medical: { label: "L\u1ecbch h\u1eb9n", icon: Stethoscope, dotClass: "bg-petcenter-primary", textClass: "text-petcenter-primary" },
  vaccination: { label: "Ti\u00eam ph\u00f2ng", icon: Syringe, dotClass: "bg-petcenter-primary", textClass: "text-petcenter-primary" },
  grooming: { label: "D\u1ecbch v\u1ee5 spa", icon: Sparkles, dotClass: "bg-petcenter-cta", textClass: "text-petcenter-cta" },
  boarding: { label: "L\u01b0u tr\u00fa", icon: Bed, dotClass: "bg-petcenter-info-text", textClass: "text-petcenter-info-text" },
  invoice: { label: "H\u00f3a \u0111\u01a1n", icon: History, dotClass: "bg-petcenter-text-muted", textClass: "text-petcenter-text-secondary" },
  payment: { label: "Thanh to\u00e1n", icon: History, dotClass: "bg-petcenter-cta", textClass: "text-petcenter-cta" },
  profile: { label: "H\u1ed3 s\u01a1", icon: PawPrint, dotClass: "bg-petcenter-primary", textClass: "text-petcenter-primary" },
};

const statusMeta: Record<PetActivityLog["activityStatus"], { label: string; className: string }> = {
  scheduled: { label: "Đã lên lịch", className: "bg-petcenter-info-bg text-petcenter-info-text border-petcenter-info-text/20" },
  pending: { label: "Chờ xử lý", className: "bg-petcenter-warning-bg text-petcenter-warning-text border-petcenter-warning-text/20" },
  confirmed: { label: "Đã xác nhận", className: "bg-[#D8F3EE] text-petcenter-primary border-petcenter-primary/20" },
  completed: { label: "Hoàn tất", className: "bg-petcenter-success-bg text-petcenter-success-text border-petcenter-success-text/20" },
  cancelled: { label: "Đã hủy", className: "bg-petcenter-danger-bg text-petcenter-danger-text border-petcenter-danger-text/20" },
  rejected: { label: "Từ chối", className: "bg-petcenter-danger-bg text-petcenter-danger-text border-petcenter-danger-text/20" },
  failed: { label: "Thất bại", className: "bg-petcenter-danger-bg text-petcenter-danger-text border-petcenter-danger-text/20" },
};

function formatPetCode(petId: string): string {
  return petId.includes("-") ? petId.toUpperCase() : petId.replace(/^pet_?/i, "PET-").toUpperCase();
}

function formatWeight(weightKg: number | null): string {
  return weightKg === null ? text.noData : `${weightKg.toLocaleString("vi-VN")} kg`;
}

function formatActivityDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function getOwnerInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "O";
}

export function StaffPetDetailPage({ petId }: StaffPetDetailPageProps) {
  const [pet, setPet] = useState<StaffPetDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    Promise.resolve()
      .then(() => {
        if (!controller.signal.aborted) {
          setIsError(false);
          setIsLoading(true);
        }

        return petsApi.getStaff(petId, { signal: controller.signal });
      })
      .then((result) => setPet(result))
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

  if (isLoading) {
    return <LoadingState title={text.loadingTitle} description={text.loadingDescription} />;
  }

  if (isError || !pet) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-[16px] border border-petcenter-border bg-white px-4 py-20 shadow-card">
        <AlertCircle className="h-12 w-12 text-petcenter-danger-text" />
        <p className="font-medium text-petcenter-text-secondary">{text.error}</p>
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
  const speciesBreed = `${pet.speciesLabel}${pet.breed ? ` / ${pet.breed}` : ""}`;
  const petSubtitle = `${pet.speciesLabel}${pet.breed ? ` ${pet.breed}` : ""}`;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 text-[13px] text-petcenter-text-secondary">
          <Link className="flex items-center gap-1 transition-colors hover:text-petcenter-primary" href="/staff/pets">
            <ArrowLeft className="h-4 w-4" />
            <span>{text.back}</span>
          </Link>
          <span className="mx-2 text-petcenter-border-strong">|</span>
          <span>{text.list}</span>
          <ChevronRight className="h-4 w-4" />
          <span>{petCode}</span>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-petcenter-text">{text.detail}</span>
        </div>
      </div>

      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-petcenter-border bg-white p-6 shadow-card md:flex-row md:items-end">
        <div className="flex items-center gap-5">
          <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-2 border-white bg-petcenter-sidebar shadow-sm">
            {pet.profileImageUrl ? (
              <div
                aria-label={pet.petName}
                className="h-full w-full bg-cover bg-center"
                role="img"
                style={{ backgroundImage: `url(${pet.profileImageUrl})` }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-petcenter-primary/40">
                <PawPrint className="h-9 w-9" aria-hidden="true" />
              </div>
            )}
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/10" />
          </div>
          <div>
            <h2 className="text-[24px] font-semibold leading-8 tracking-[-0.01em] text-petcenter-text">{pet.petName}</h2>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-[14px] text-petcenter-text-secondary">
              <span className="rounded bg-petcenter-sidebar px-1.5 py-0.5 font-mono text-xs">{petCode}</span>
              <span>•</span>
              <span>{petSubtitle}</span>
              <span>•</span>
              <span>
                {text.owner}: <span className="font-medium text-petcenter-text">{pet.owner.fullName}</span>
              </span>
            </p>
          </div>
        </div>
        <Button
          asChild
          variant="outline"
          className="rounded-xl border-petcenter-primary bg-white px-5 py-2.5 text-[14px] font-medium text-petcenter-primary transition-colors hover:bg-petcenter-primary/5"
        >
          <Link href={`/staff/pets/${encodeURIComponent(pet.petId)}/edit`}>
            <Edit3 className="mr-2 h-[18px] w-[18px]" />
            {text.edit}
          </Link>
        </Button>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-4">
          <section className="rounded-2xl border border-petcenter-border bg-white p-6 shadow-card">
            <h3 className="mb-5 flex items-center gap-2 text-[18px] font-semibold leading-[26px] text-petcenter-text">
              <Info className="h-5 w-5 text-petcenter-primary" />
              {text.detailInfo}
            </h3>
            <div className="flex flex-col gap-4">
              <InfoRow label={text.petCode} value={petCode} valueClassName="font-mono" />
              <InfoRow label={text.speciesBreed} value={speciesBreed} />
              <InfoRow label={text.gender} value={pet.genderLabel} />
              <InfoRow label={text.age} value={pet.ageLabel} />
              <InfoRow label={text.weight} value={formatWeight(pet.weightKg)} />
              <InfoRow label={text.furColor} value={pet.furColor || text.noData} />
              <div className="py-2">
                <span className="mb-1 block text-[13px] text-petcenter-text-secondary">{text.marks}</span>
                <span className="text-[14px] leading-5 text-petcenter-text">{pet.identifyingMarks || text.noData}</span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-petcenter-border bg-white p-6 shadow-card">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-[18px] font-semibold leading-[26px] text-petcenter-text">
                <UserRound className="h-5 w-5 text-petcenter-primary" />
                {text.owner}
              </h3>
              <button className="flex items-center gap-1 rounded-lg bg-petcenter-primary/5 px-3 py-1.5 text-[12px] font-medium text-petcenter-primary transition-colors hover:bg-petcenter-primary/10" type="button">
                <Phone className="h-3.5 w-3.5" />
                {text.contact}
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-petcenter-sidebar text-lg font-medium text-petcenter-text-secondary">
                  {getOwnerInitial(pet.owner.fullName)}
                </div>
                <div>
                  <p className="text-[14px] font-medium text-petcenter-text">{pet.owner.fullName}</p>
                  <p className="text-[13px] text-petcenter-text-secondary">{text.loyalOwner}</p>
                </div>
              </div>

              <div className="mt-2 space-y-2.5">
                <OwnerContactRow icon={Phone} value={pet.owner.phoneNumber || text.noData} />
                <OwnerContactRow icon={Mail} value={pet.owner.email || text.noData} />
                <OwnerContactRow icon={MapPin} value={pet.owner.address || text.noData} />
              </div>
            </div>
          </section>
        </div>

        <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-petcenter-border bg-white shadow-card lg:col-span-8">
          <div className="flex items-center justify-between border-b border-petcenter-border p-5">
            <h3 className="flex items-center gap-2 text-[18px] font-semibold leading-[26px] text-petcenter-text">
              <History className="h-5 w-5 text-petcenter-primary" />
              {text.recentActivity}
            </h3>
            <button className="flex items-center gap-1 text-[13px] font-medium text-petcenter-primary hover:underline" type="button">
              {text.viewAll}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex-1 p-6">
            {pet.recentActivities.length === 0 ? (
              <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed border-petcenter-border-strong bg-petcenter-filter p-6 text-center text-[14px] text-petcenter-text-secondary">
                {text.noActivity}
              </div>
            ) : (
              <div className="relative ml-4 space-y-8 border-l-2 border-petcenter-border pb-4">
                {pet.recentActivities.map((activity) => (
                  <ActivityItem activity={activity} key={activity.activityLogId} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoRow({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-petcenter-border py-2">
      <span className="text-[13px] text-petcenter-text-secondary">{label}</span>
      <span className={cn("text-right text-[14px] font-medium text-petcenter-text", valueClassName)}>{value}</span>
    </div>
  );
}

function OwnerContactRow({ icon: Icon, value }: { icon: LucideIcon; value: string }) {
  return (
    <div className="flex items-start gap-3 text-[13px]">
      <Icon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-petcenter-text-muted" />
      <span className="text-petcenter-text">{value}</span>
    </div>
  );
}

function ActivityItem({ activity }: { activity: PetActivityLog }) {
  const category = categoryMeta[activity.activityCategory];
  const status = statusMeta[activity.activityStatus];
  const Icon = category.icon;

  return (
    <div className="relative pl-6">
      <div className="absolute -left-[11px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-petcenter-sidebar">
        <div className={cn("h-2.5 w-2.5 rounded-full", category.dotClass)} />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={cn("mb-1 flex items-center gap-1 text-[13px] font-medium", category.textClass)}>
              <Icon className="h-3.5 w-3.5" />
              {category.label}
            </p>
            <h4 className="text-[18px] font-semibold leading-[26px] text-petcenter-text">{activity.title}</h4>
            <p className="mt-1 flex items-center gap-1 text-[13px] text-petcenter-text-secondary">
              <CalendarClock className="h-3.5 w-3.5" />
              {formatActivityDate(activity.occurredAt)}
            </p>
          </div>
          <span className={cn("whitespace-nowrap rounded-md border px-2.5 py-1 text-[11px] font-medium leading-[14px]", status.className)}>
            {status.label}
          </span>
        </div>
        <div className="rounded-xl bg-petcenter-sidebar p-3 text-[13px] leading-[18px] text-petcenter-text-secondary">
          {activity.actorName ? (
            <p className="mb-1">
              <span className="font-medium text-petcenter-text">{text.actor}</span> {activity.actorName}
            </p>
          ) : null}
          <p>{activity.summary || text.noData}</p>
        </div>
      </div>
    </div>
  );
}
