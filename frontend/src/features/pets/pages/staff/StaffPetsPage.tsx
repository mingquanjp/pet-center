"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
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

      <div className="relative flex flex-col overflow-hidden rounded-2xl border border-petcenter-border bg-petcenter-card shadow-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-petcenter-border p-4">
        <label className="relative min-w-50 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-petcenter-text-secondary" />
          <span className="sr-only">{text.searchPlaceholder}</span>
          <input
            className="body-md w-full rounded-[0.75rem] border border-petcenter-border bg-petcenter-background py-2 pl-9 pr-3 text-petcenter-text outline-none transition placeholder:text-petcenter-text-secondary focus:border-petcenter-primary focus:ring-1 focus:ring-petcenter-primary"
            placeholder={text.searchPlaceholder}
            type="search"
            value={filters.q}
            onChange={(event) => handleFilterChange({ q: event.target.value })}
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
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
            className="body-md h-10 w-fit shrink-0 rounded-[0.75rem] border border-petcenter-border px-4 font-medium text-petcenter-text-secondary transition-colors hover:bg-petcenter-background hover:text-petcenter-text disabled:pointer-events-none disabled:opacity-50"
            disabled={!hasActiveFilters}
            onClick={() => updateFilters(defaultFilters)}
            type="button"
            variant="ghost"
          >
            <RotateCcw className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">{text.reset}</span>
          </Button>
        </div>
        </div>
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
            <div className="w-full overflow-x-auto overflow-y-hidden">
              <table className="w-full min-w-200 table-fixed border-collapse text-left">
                <thead className="border-b border-petcenter-border bg-petcenter-background">
                  <tr>
                    <th className="w-[14%] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">{text.petCode}</th>
                    <th className="w-[25%] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">{text.pet}</th>
                    <th className="w-[18%] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">{text.owner}</th>
                    <th className="w-[14%] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">{text.phone}</th>
                    <th className="w-[19%] px-6 py-4 text-sm font-medium text-petcenter-text-secondary">{text.speciesBreed}</th>
                    <th className="w-[10%] px-6 py-4 text-center text-sm font-medium text-petcenter-text-secondary">{text.action}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-petcenter-border">
                  {pets.map((pet) => (
                    <tr key={pet.petId} className="transition-colors hover:bg-petcenter-background/50">
                      <td className="px-6 py-4 font-medium text-petcenter-text">{pet.petId}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-petcenter-border text-petcenter-text-muted">
                            {pet.profileImageUrl ? (
                              <Image
                                alt={pet.petName}
                                className="h-full w-full object-cover"
                                height={40}
                                src={pet.profileImageUrl}
                                width={40}
                              />
                            ) : (
                              <div className="text-xs font-bold uppercase">{pet.petName.substring(0, 2)}</div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-petcenter-text">{pet.petName}</p>
                            <p className="mt-0.5 text-xs text-petcenter-text-secondary">
                              {pet.ageLabel}, {pet.genderLabel}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-petcenter-text">{pet.owner.fullName}</td>
                      <td className="px-6 py-4 text-petcenter-text">{pet.owner.phoneNumber || text.noPhone}</td>
                      <td className="px-6 py-4 text-petcenter-text">
                        {pet.speciesLabel} / {pet.breed || text.noBreed}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link
                          href={`/staff/pets/${encodeURIComponent(pet.petId)}`}
                          className="inline-flex h-9 items-center justify-center rounded-[0.75rem] bg-petcenter-cta px-4 font-semibold text-white shadow-sm transition-all hover:bg-petcenter-cta-hover active:scale-95 active:bg-petcenter-cta-active"
                        >
                          Xem
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
          <div className="flex w-full flex-col items-center justify-between gap-4 border-t border-petcenter-border px-6 py-4 sm:flex-row">
            <span className="text-sm text-petcenter-text-secondary">
              Hiển thị{" "}
              <span className="font-medium text-petcenter-text">{startItem}</span>
              -
              <span className="font-medium text-petcenter-text">{endItem}</span>{" "}
              của <span className="font-medium text-petcenter-text">{pagination.total}</span> {text.records}
            </span>
            <nav className="flex items-center gap-2" aria-label="Phân trang">
              <button
                aria-label={text.previousPage}
                className="flex h-9 w-9 items-center justify-center rounded-[0.75rem] border border-petcenter-border bg-white text-petcenter-text-secondary transition hover:bg-petcenter-background disabled:cursor-not-allowed disabled:opacity-50"
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                type="button"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {getPaginationItems(pagination.page, pagination.totalPages).map((item, index) =>
                item === "ellipsis" ? (
                  <span key={`ellipsis-${index}`} className="flex h-9 min-w-9 items-center justify-center text-sm font-medium text-petcenter-text-secondary">
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    aria-current={item === pagination.page ? "page" : undefined}
                    className={cn(
                      "inline-flex h-9 min-w-9 items-center justify-center rounded-[0.75rem] px-3 text-sm font-medium transition disabled:cursor-not-allowed",
                      item === pagination.page
                        ? "bg-petcenter-primary text-white shadow-sm"
                        : "border border-petcenter-border bg-white text-petcenter-text hover:bg-petcenter-background"
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
                className="flex h-9 w-9 items-center justify-center rounded-[0.75rem] border border-petcenter-border bg-white text-petcenter-text-secondary transition hover:bg-petcenter-background disabled:cursor-not-allowed disabled:opacity-50"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
                type="button"
              >
                <ChevronRight className="h-4 w-4" />
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
      <span className="whitespace-nowrap text-sm font-medium text-petcenter-text-secondary">{label}:</span>
      <select
        className="body-md min-w-35 rounded-[0.75rem] border border-petcenter-border bg-petcenter-background px-3 py-2 text-petcenter-text outline-none transition focus:border-petcenter-primary focus:ring-1 focus:ring-petcenter-primary"
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
