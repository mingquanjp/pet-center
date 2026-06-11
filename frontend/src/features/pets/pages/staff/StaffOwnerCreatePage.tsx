"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronRight, Loader2, PawPrint, Save, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { petsApi } from "../../api/pets.api";
import type { StaffCreateOwnerInput } from "../../types/pet.types";

type FormState = {
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
  notes: string;
};

function optionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getInitialForm(query: string): FormState {
  const trimmedQuery = query.trim();
  const looksLikeEmail = trimmedQuery.includes("@");

  return {
    fullName: "",
    phoneNumber: looksLikeEmail ? "" : trimmedQuery,
    email: looksLikeEmail ? trimmedQuery : "",
    address: "",
    notes: "",
  };
}

function buildPayload(form: FormState): StaffCreateOwnerInput {
  return {
    fullName: form.fullName.trim(),
    phoneNumber: form.phoneNumber.trim(),
    email: optionalText(form.email),
    address: optionalText(form.address),
    notes: optionalText(form.notes),
  };
}

export function StaffOwnerCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [form, setForm] = React.useState<FormState>(() => getInitialForm(initialQuery));
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const updateField = <T extends keyof FormState>(field: T, value: FormState[T]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!form.fullName.trim()) {
      const message = "Vui lòng nhập họ tên Chủ nuôi.";
      setErrorMessage(message);
      toast.error(message);
      return false;
    }

    if (!form.phoneNumber.trim()) {
      const message = "Vui lòng nhập số điện thoại Chủ nuôi.";
      setErrorMessage(message);
      toast.error(message);
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setErrorMessage(null);
      setIsSubmitting(true);
      const owner = await petsApi.createStaffOwner(buildPayload(form));
      toast.success("Tạo tài khoản Chủ nuôi thành công");

      const nextQuery = owner.phoneNumber ?? owner.email ?? form.phoneNumber.trim();
      router.push(`/staff/pets/create?ownerQuery=${encodeURIComponent(nextQuery)}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tạo tài khoản Chủ nuôi.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-petcenter-bg px-6 py-8 lg:px-8">
      <div className="w-full max-w-5xl">
        <div className="mb-8">
          <nav className="mb-3 flex items-center gap-2 text-sm text-petcenter-text-secondary">
            <Link className="transition hover:text-petcenter-primary" href="/staff/pets">
              Hồ sơ thú cưng
            </Link>
            <ChevronRight className="h-4 w-4 text-petcenter-text-muted" />
            <Link className="transition hover:text-petcenter-primary" href="/staff/pets/create">
              Tạo hồ sơ
            </Link>
            <ChevronRight className="h-4 w-4 text-petcenter-text-muted" />
            <span className="font-medium text-petcenter-text">Tạo tài khoản Chủ nuôi</span>
          </nav>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-[32px] font-bold leading-10 tracking-tight text-petcenter-text">
                Tạo tài khoản Chủ nuôi
              </h1>
              <p className="mt-2 text-sm text-petcenter-text-secondary">
                Tạo tài khoản khách hàng trước khi liên kết hồ sơ thú cưng.
              </p>
            </div>

            <Button
              asChild
              className="h-10 rounded-xl border-petcenter-primary px-4 text-sm font-medium text-petcenter-primary hover:bg-petcenter-sidebar"
              variant="outline"
            >
              <Link href="/staff/pets/create">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại tạo hồ sơ
              </Link>
            </Button>
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl border border-petcenter-border bg-white shadow-[0_4px_16px_rgba(31,38,31,0.05)]">
          <div className="flex items-center justify-between border-b border-petcenter-border bg-petcenter-sidebar px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D8F3EE] text-petcenter-primary">
                <UserPlus className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-petcenter-text">Thông tin Chủ nuôi</h2>
                <p className="text-sm text-petcenter-text-secondary">Các trường có dấu * là bắt buộc.</p>
              </div>
            </div>
            <PawPrint className="hidden h-8 w-8 text-petcenter-primary/20 sm:block" />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6 p-6 lg:p-8">
              {errorMessage ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-petcenter-text">
                    Họ tên Chủ nuôi <span className="text-red-600">*</span>
                  </span>
                  <Input
                    autoFocus
                    className="h-12 rounded-xl border-petcenter-border-strong bg-white text-sm text-petcenter-text placeholder:text-petcenter-text-muted focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary/20"
                    placeholder="Nhập họ và tên"
                    value={form.fullName}
                    onChange={(event) => updateField("fullName", event.target.value)}
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-petcenter-text">
                    Số điện thoại <span className="text-red-600">*</span>
                  </span>
                  <Input
                    className="h-12 rounded-xl border-petcenter-border-strong bg-white text-sm text-petcenter-text placeholder:text-petcenter-text-muted focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary/20"
                    inputMode="tel"
                    placeholder="Nhập số điện thoại"
                    value={form.phoneNumber}
                    onChange={(event) => updateField("phoneNumber", event.target.value)}
                  />
                </label>

                <label className="block space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-petcenter-text">Email</span>
                  <Input
                    className="h-12 rounded-xl border-petcenter-border-strong bg-white text-sm text-petcenter-text placeholder:text-petcenter-text-muted focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary/20"
                    inputMode="email"
                    placeholder="example@email.com"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                  />
                </label>

                <label className="block space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-petcenter-text">Địa chỉ</span>
                  <Input
                    className="h-12 rounded-xl border-petcenter-border-strong bg-white text-sm text-petcenter-text placeholder:text-petcenter-text-muted focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary/20"
                    placeholder="Nhập địa chỉ liên hệ"
                    value={form.address}
                    onChange={(event) => updateField("address", event.target.value)}
                  />
                </label>

                <label className="block space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-petcenter-text">Ghi chú</span>
                  <Textarea
                    className="min-h-24 rounded-xl border-petcenter-border-strong bg-white text-sm text-petcenter-text placeholder:text-petcenter-text-muted focus-visible:border-petcenter-primary focus-visible:ring-petcenter-primary/20"
                    placeholder="Thông tin thêm (nếu có)..."
                    value={form.notes}
                    onChange={(event) => updateField("notes", event.target.value)}
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-petcenter-border bg-petcenter-sidebar px-6 py-5">
              <Button
                asChild
                className="h-11 rounded-xl border-petcenter-primary px-6 text-sm font-medium text-petcenter-primary hover:bg-white"
                variant="outline"
              >
                <Link href="/staff/pets/create">Hủy</Link>
              </Button>
              <Button
                className={cn(
                  "h-11 rounded-xl bg-[#FEA619] px-6 text-sm font-semibold text-[#2A1700] shadow-sm transition hover:bg-[#FFB95F]",
                  isSubmitting && "cursor-wait"
                )}
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Tạo tài khoản
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
