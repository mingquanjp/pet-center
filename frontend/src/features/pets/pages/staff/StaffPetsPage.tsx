"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ChevronLeft, ChevronRight, PawPrint, Plus, RotateCcw, Search } from "lucide-react";
import { petsApi } from "../../api/pets.api";
import type { Pagination, PetGender, PetSpecies, StaffPet } from "../../types/pet.types";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { cn } from "@/lib/utils";

type StaffPetFilters = {
  q: string;
  species: "all" | PetSpecies;
  gender: "all" | PetGender;
  sort: "petName:asc";
  page: number;
  limit: number;
};

const defaultFilters: StaffPetFilters = {
  q: "",
  species: "all",
  gender: "all",
  sort: "petName:asc",
  page: 1,
  limit: 10,
};

const speciesOptions: Array<{ value: StaffPetFilters["species"]; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "Dog", label: "Chó" },
  { value: "Cat", label: "Mèo" },
  { value: "Other", label: "Khác" },
];

const genderOptions: Array<{ value: StaffPetFilters["gender"]; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "male", label: "Đực" },
  { value: "female", label: "Cái" },
  { value: "unknown", label: "Chưa rõ" },
];

const text = {
  title: "H\u1ed3 s\u01a1 th\u00fa c\u01b0ng",
  subtitle: "Tra c\u1ee9u, xem chi ti\u1ebft v\u00e0 t\u1ea1o h\u1ed3 s\u01a1 th\u00fa c\u01b0ng t\u1ea1i qu\u1ea7y.",
  create: "T\u1ea1o h\u1ed3 s\u01a1 th\u00fa c\u01b0ng",
  searchPlaceholder: "T\u00ecm theo t\u00ean, m\u00e3 h\u1ed3 s\u01a1, S\u0110T...",
  petCode: "M\u00e3 HS",
  pet: "Th\u00fa c\u01b0ng",
  owner: "Ch\u1ee7 nu\u00f4i",
  phone: "S\u0110T",
  speciesBreed: "Lo\u00e0i / Gi\u1ed1ng",
  action: "Thao t\u00e1c",
  viewProfile: "Xem h\u1ed3 s\u01a1",
  noPhone: "-",
  noBreed: "Ch\u01b0a c\u1eadp nh\u1eadt",
  emptyTitle: "Ch\u01b0a c\u00f3 h\u1ed3 s\u01a1 ph\u00f9 h\u1ee3p",
  emptyDescription: "Th\u1eed thay \u0111\u1ed5i t\u1eeb kh\u00f3a \u0111\u1ec3 xem danh s\u00e1ch th\u00fa c\u01b0ng.",
  reset: "Đặt lại",
  error: "Kh\u00f4ng th\u1ec3 t\u1ea3i danh s\u00e1ch th\u00fa c\u01b0ng",
  retry: "Th\u1eed l\u1ea1i",
  loadingTitle: "\u0110ang t\u1ea3i h\u1ed3 s\u01a1 th\u00fa c\u01b0ng...",
  loadingDescription: "D\u1eef li\u1ec7u \u0111\u01b0\u1ee3c l\u1ea5y t\u1eeb h\u1ec7 th\u1ed1ng.",
  paginationOf: "tr\u00ean",
  records: "h\u1ed3 s\u01a1",
  previousPage: "Trang tr\u01b0\u1edbc",
  nextPage: "Trang sau",
};

function parseFiltersFromParams(params: URLSearchParams): StaffPetFilters {
  const page = Number(params.get("page"));

  return {
    q: params.get("q") || "",
    species: (params.get("species") as StaffPetFilters["species"]) || defaultFilters.species,
    gender: (params.get("gender") as StaffPetFilters["gender"]) || defaultFilters.gender,
    sort: defaultFilters.sort,
    page: Number.isFinite(page) && page > 0 ? page : defaultFilters.page,
    limit: defaultFilters.limit,
  };
}

function getPaginationItems(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items = new Set<number>([1, totalPages, currentPage]);

  if (currentPage > 1) items.add(currentPage - 1);
  if (currentPage < totalPages) items.add(currentPage + 1);
  if (currentPage <= 3) {
    items.add(2);
    items.add(3);
    items.add(4);
  }
  if (currentPage >= totalPages - 2) {
    items.add(totalPages - 3);
    items.add(totalPages - 2);
    items.add(totalPages - 1);
  }

  const sortedItems = Array.from(items)
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b);

  return sortedItems.flatMap((item, index) => {
    const previousItem = sortedItems[index - 1];

    if (previousItem && item - previousItem > 1) {
      return ["ellipsis", item] as Array<number | "ellipsis">;
    }

    return [item];
  });
}

function formatPetCode(petId: string): string {
  return petId.includes("-") ? petId.toUpperCase() : petId.replace(/^pet_?/i, "PET-").toUpperCase();
}

export function StaffPetsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo(() => parseFiltersFromParams(searchParams), [searchParams]);
  const [pets, setPets] = useState<StaffPet[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: defaultFilters.page,
    limit: defaultFilters.limit,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    Promise.resolve()
      .then(() => {
        if (!controller.signal.aborted) {
          setIsFetching(true);
          setIsError(false);
        }

        return petsApi.listStaff(
          {
            q: filters.q || undefined,
            species: filters.species,
            gender: filters.gender,
            sort: filters.sort,
            page: filters.page,
            limit: filters.limit,
          },
          { signal: controller.signal }
        );
      })
      .then((result) => {
        setPets(result.pets);
        setPagination(result.pagination);
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
          setIsFetching(false);
        }
      });

    return () => controller.abort();
  }, [filters.gender, filters.limit, filters.page, filters.q, filters.sort, filters.species, refreshKey]);

  const updateFilters = useCallback(
    (newFilters: StaffPetFilters) => {
      const params = new URLSearchParams();

      if (newFilters.q) params.set("q", newFilters.q);
      if (newFilters.species !== "all") params.set("species", newFilters.species);
      if (newFilters.gender !== "all") params.set("gender", newFilters.gender);
      if (newFilters.page > 1) params.set("page", String(newFilters.page));

      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
    },
    [pathname, router]
  );

  const handleFilterChange = (nextFilters: Partial<StaffPetFilters>) => {
    updateFilters({ ...filters, ...nextFilters, page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateFilters({ ...filters, page });
  };

  const hasActiveFilters =
    Boolean(filters.q) ||
    filters.species !== defaultFilters.species ||
    filters.gender !== defaultFilters.gender;

  const startItem = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="flex-1 space-y-6">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h2 className="text-[32px] font-bold leading-10 tracking-[-0.02em] text-petcenter-text">{text.title}</h2>
          <p className="mt-1 text-[16px] leading-6 text-petcenter-text-secondary">{text.subtitle}</p>
        </div>
        <Button
          asChild
          className="h-fit w-fit rounded-xl bg-petcenter-cta px-5 py-2.5 text-[14px] font-medium text-white shadow-sm transition-colors hover:bg-petcenter-cta-hover active:bg-petcenter-cta-active"
        >
          <Link href="/staff/pets/create">
            <Plus className="mr-2 h-5 w-5" />
            {text.create}
          </Link>
        </Button>
      </div>

      <div className="mb-6 rounded-[16px] border border-[#e6e8dd] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6e7774]" />
          <span className="sr-only">{text.searchPlaceholder}</span>
          <input
            className="h-11 w-full rounded-full border border-[#cfd8d5] bg-white pl-14 pr-4 text-base leading-6 text-[#1b1c15] outline-none transition placeholder:text-[#8a918e] focus:border-[#005e53] focus:ring-4 focus:ring-[#005e53]/10"
            placeholder={text.searchPlaceholder}
            type="search"
            value={filters.q}
            onChange={(event) => handleFilterChange({ q: event.target.value })}
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center 2xl:flex-nowrap">
          <StaffPetFilterSelect
            label="Loài"
            onChange={(value) => handleFilterChange({ species: value as StaffPetFilters["species"] })}
            options={speciesOptions}
            value={filters.species}
          />
          <StaffPetFilterSelect
            label="Giới tính"
            onChange={(value) => handleFilterChange({ gender: value as StaffPetFilters["gender"] })}
            options={genderOptions}
            value={filters.gender}
          />
          <Button
            className="h-10 w-fit shrink-0 rounded-xl px-3 text-base font-normal leading-6 text-[#005e53] hover:bg-[#e0f2f1] hover:text-[#004c43] disabled:pointer-events-none disabled:opacity-50"
            disabled={!hasActiveFilters}
            onClick={() => updateFilters(defaultFilters)}
            type="button"
            variant="ghost"
          >
            <RotateCcw className="mr-1 h-4 w-4" />
            Đặt lại bộ lọc
          </Button>
        </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[16px] border border-petcenter-border bg-white shadow-card">
        <div className="relative min-h-[360px]">
          {isFetching && !isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-petcenter-primary/30 border-t-petcenter-primary shadow-sm" />
            </div>
          )}

          {isLoading ? (
            <LoadingState title={text.loadingTitle} description={text.loadingDescription} />
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
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
          ) : pets.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D8F3EE] text-petcenter-primary">
                <PawPrint className="h-7 w-7" />
              </div>
              <div>
                <p className="font-semibold text-petcenter-text">{text.emptyTitle}</p>
                <p className="mt-1 text-sm text-petcenter-text-secondary">{text.emptyDescription}</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-petcenter-border bg-[#E0F2F1]">
                    <th className="whitespace-nowrap px-6 py-4 text-[13px] font-semibold uppercase tracking-wider text-[#003D36]">{text.petCode}</th>
                    <th className="whitespace-nowrap px-6 py-4 text-[13px] font-semibold uppercase tracking-wider text-[#003D36]">{text.pet}</th>
                    <th className="whitespace-nowrap px-6 py-4 text-[13px] font-semibold uppercase tracking-wider text-[#003D36]">{text.owner}</th>
                    <th className="whitespace-nowrap px-6 py-4 text-[13px] font-semibold uppercase tracking-wider text-[#003D36]">{text.phone}</th>
                    <th className="whitespace-nowrap px-6 py-4 text-[13px] font-semibold uppercase tracking-wider text-[#003D36]">{text.speciesBreed}</th>
                    <th className="whitespace-nowrap px-6 py-4 text-right text-[13px] font-semibold uppercase tracking-wider text-[#003D36]">{text.action}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-petcenter-border">
                  {pets.map((pet) => (
                    <tr key={pet.petId} className="h-[72px] transition-colors hover:bg-petcenter-filter">
                      <td className="whitespace-nowrap px-6 py-4 text-[14px] font-medium text-petcenter-text">{formatPetCode(pet.petId)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-petcenter-sidebar text-petcenter-text-muted">
                            {pet.profileImageUrl ? (
                              <div
                                aria-label={pet.petName}
                                className="h-full w-full bg-cover bg-center"
                                role="img"
                                style={{ backgroundImage: `url(${pet.profileImageUrl})` }}
                              />
                            ) : (
                              <PawPrint className="h-5 w-5" aria-hidden="true" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-[14px] font-semibold text-petcenter-text">{pet.petName}</p>
                            <p className="truncate text-[13px] text-petcenter-text-secondary">
                              {pet.ageLabel}, {pet.genderLabel}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-[14px] text-petcenter-text-secondary">{pet.owner.fullName}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-[14px] text-petcenter-text-secondary">{pet.owner.phoneNumber || text.noPhone}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-[14px] text-petcenter-text-secondary">
                        {pet.speciesLabel} / {pet.breed || text.noBreed}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <Link
                          href={`/staff/pets/${encodeURIComponent(pet.petId)}`}
                          className="inline-flex items-center justify-center rounded-xl border border-petcenter-primary bg-transparent px-4 py-2 text-[13px] font-medium text-petcenter-primary transition-colors hover:bg-[#D8F3EE]"
                        >
                          {text.viewProfile}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!isLoading && !isError && pets.length > 0 && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-petcenter-border bg-white px-6 py-4">
            <span className="text-[13px] text-petcenter-text-secondary">
              Hiển thị {startItem}-{endItem} {text.paginationOf} {pagination.total} {text.records}
            </span>
            <nav className="flex items-center gap-2" aria-label="Phân trang">
              <button
                aria-label={text.previousPage}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-petcenter-border-strong text-petcenter-text-muted transition hover:bg-petcenter-sidebar disabled:cursor-not-allowed disabled:opacity-50"
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                type="button"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {getPaginationItems(pagination.page, pagination.totalPages).map((item, index) =>
                item === "ellipsis" ? (
                  <span key={`ellipsis-${index}`} className="flex h-8 min-w-8 items-center justify-center text-[#7A837F]">
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    aria-current={item === pagination.page ? "page" : undefined}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg text-[13px] font-medium transition",
                      item === pagination.page
                        ? "bg-petcenter-primary text-white"
                        : "border border-petcenter-border-strong text-petcenter-text-secondary hover:bg-petcenter-sidebar"
                    )}
                    onClick={() => handlePageChange(item)}
                    type="button"
                  >
                    {item}
                  </button>
                )
              )}

              <button
                aria-label={text.nextPage}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-petcenter-border-strong text-petcenter-text-secondary transition hover:bg-petcenter-sidebar disabled:cursor-not-allowed disabled:opacity-50"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
                type="button"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}

function StaffPetFilterSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="whitespace-nowrap text-base font-normal leading-6 text-[#3e4946]">{label}:</span>
      <select
        className="h-11 min-w-[132px] rounded-[16px] border border-[#cfd8d5] bg-white px-4 pr-9 text-base leading-6 text-[#1b1c15] outline-none transition focus:border-[#005e53] focus:ring-4 focus:ring-[#005e53]/10"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
