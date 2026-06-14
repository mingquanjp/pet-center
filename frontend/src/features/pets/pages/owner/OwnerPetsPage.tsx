"use client"

import * as React from "react"
import Link from "next/link"
import {
  AlertCircle,
  Cake,
  LoaderCircle,
  Mars,
  PawPrint,
  Plus,
  PlusCircle,
  Search,
  SlidersHorizontal,
  Sprout,
  Venus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AppPagination } from "@/components/ui/app-pagination"
import { cn } from "@/lib/utils"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { normalizeSearchText } from "@/lib/search"
import { petsApi } from "../../api/pets.api"
import type { Pet, PetSpecies } from "../../types/pet.types"

const speciesOptions: Array<{ label: string; value: "all" | PetSpecies }> = [
  { label: "Tất cả", value: "all" },
  { label: "Chó", value: "Dog" },
  { label: "Mèo", value: "Cat" },
  { label: "Khác", value: "Other" },
]

const PETS_PAGE_SIZE = 6

export function OwnerPetsPage() {
  const [pets, setPets] = React.useState<Pet[]>([])
  const [total, setTotal] = React.useState(0)
  const [totalPages, setTotalPages] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const [searchInput, setSearchInput] = React.useState("")
  const [species, setSpecies] = React.useState<"all" | PetSpecies>("all")
  const [isLoading, setIsLoading] = React.useState(true)
  const [isPageChanging, setIsPageChanging] = React.useState(false)
  const [hasLoaded, setHasLoaded] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const hasLoadedRef = React.useRef(false)
  const debouncedSearchInput = useDebouncedValue(searchInput, 450)
  const searchQuery = React.useMemo(() => normalizeSearchText(debouncedSearchInput), [debouncedSearchInput])
  const isSearchSettling = normalizeSearchText(searchInput) !== searchQuery
  const shouldShowSkeleton = isLoading && !hasLoaded
  const isRefreshingResults = hasLoaded && (isLoading || isSearchSettling)
  const displayedPets = pets

  React.useEffect(() => {
    const abortController = new AbortController()

    async function loadPets() {
      try {
        setIsLoading(true)
        setErrorMessage(null)

        const result = await petsApi.list({
          q: searchQuery || undefined,
          species,
          page: 1,
          limit: PETS_PAGE_SIZE,
          sort: "petName:asc",
        }, { signal: abortController.signal })

        if (!abortController.signal.aborted) {
          setPets(result.pets)
          setTotal(result.pagination.total)
          setTotalPages(result.pagination.totalPages)
          setPage(1)
          hasLoadedRef.current = true
          setHasLoaded(true)
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          setPets([])
          setTotal(0)
          setTotalPages(0)
          hasLoadedRef.current = true
          setHasLoaded(true)
          setErrorMessage(error instanceof Error ? error.message : "Không thể tải danh sách thú cưng")
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadPets()

    return () => {
      abortController.abort()
    }
  }, [searchQuery, species])

  const handleSpeciesChange = (value: string) => {
    setSpecies(value as "all" | PetSpecies)
  }

  const handlePageChange = async (nextPage: number) => {
    if (nextPage === page || isPageChanging) return

    try {
      setIsPageChanging(true)
      setErrorMessage(null)

      const result = await petsApi.list({
        q: searchQuery || undefined,
        species,
        page: nextPage,
        limit: PETS_PAGE_SIZE,
        sort: "petName:asc",
      })

      setPets(result.pets)
      setTotal(result.pagination.total)
      setTotalPages(result.pagination.totalPages)
      setPage(nextPage)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể tải danh sách thú cưng")
    } finally {
      setIsPageChanging(false)
    }
  }

  return (
    <div className="flex w-full flex-col gap-section">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="heading-lg text-petcenter-text tracking-tight">Thú cưng của tôi</h1>
          <p className="body-md mt-1 text-petcenter-text-secondary">
            Quản lý hồ sơ và theo dõi thông tin tất cả thú cưng của bạn.
          </p>
        </div>

        <Button
          asChild
          className="h-10 shrink-0 rounded-[0.75rem] bg-petcenter-cta px-4 body-md font-semibold text-white shadow-card transition-all hover:bg-petcenter-cta-hover active:scale-95"
        >
          <Link href="/owner/pets/add">
            <Plus className="size-5" aria-hidden="true" />
            Thêm hồ sơ thú cưng
          </Link>
        </Button>
      </div>

      <section className="rounded-[16px] border border-[#E6E8DD] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <label className="relative min-w-0 flex-1">
            {isRefreshingResults ? (
              <LoaderCircle className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 animate-spin text-[#005E53]" aria-hidden="true" />
            ) : (
              <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-[#6E7774]" aria-hidden="true" />
            )}
            <span className="sr-only">Tìm theo tên thú cưng</span>
            <input
              type="search"
              placeholder="Tìm theo tên thú cưng..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="h-11 w-full rounded-full border border-[#CFD8D5] bg-white pl-14 pr-4 text-base leading-6 text-[#1B1C15] outline-none transition placeholder:text-[#8A918E] focus:border-[#005E53] focus:ring-4 focus:ring-[#005E53]/10"
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center xl:flex-nowrap">
            <FilterSelect
              label="Loài"
              onChange={handleSpeciesChange}
              options={speciesOptions}
              value={species}
            />
            <Button
              variant="ghost"
              className="h-10 w-fit shrink-0 rounded-xl px-3 text-base font-normal leading-6 text-[#005E53] hover:bg-[#E0F2F1] hover:text-[#004C43] disabled:pointer-events-none disabled:opacity-50"
              disabled={!(searchInput.trim().length > 0 || species !== "all")}
              onClick={() => {
                setSearchInput("")
                setSpecies("all")
              }}
            >
              Đặt lại bộ lọc
            </Button>
          </div>

          <div className="label-md flex min-w-[150px] items-center justify-start gap-2 text-[#3E4946] xl:ml-auto xl:justify-end">
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            {shouldShowSkeleton ? "Đang tải..." : isRefreshingResults ? "Đang tìm..." : `Hiển thị ${displayedPets.length}/${total} thú cưng`}
          </div>
        </div>
        <div
          className={cn(
            "mt-3 h-0.5 overflow-hidden rounded-full bg-[#E6E8DD] transition-opacity duration-200",
            isRefreshingResults ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="h-full w-1/3 animate-[search-progress_1.1s_ease-in-out_infinite] rounded-full bg-[#005E53]" />
        </div>
      </section>

      {errorMessage ? <ErrorState message={errorMessage} /> : null}

      {!errorMessage && shouldShowSkeleton ? (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <PetCardSkeleton key={index} />
          ))}
        </section>
      ) : null}

      {!errorMessage && !shouldShowSkeleton && displayedPets.length > 0 ? (
        <>
          <section
            className={cn(
              "grid grid-cols-1 gap-6 transition-opacity duration-200 md:grid-cols-2 xl:grid-cols-3",
              isRefreshingResults && "opacity-80"
            )}
          >
            {displayedPets.map((pet) => (
              <PetCard key={pet.petId} pet={pet} />
            ))}
          </section>

          <AppPagination
            ariaLabel="Phân trang thú cưng"
            currentPage={page}
            isLoading={isLoading || isPageChanging}
            onPageChange={handlePageChange}
            totalPages={totalPages}
          />
        </>
      ) : null}

      {!errorMessage && !shouldShowSkeleton && displayedPets.length === 0 ? (
        <EmptyState />
      ) : null}
    </div>
  )
}

function FilterSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: Array<{ label: string; value: string }>
  value: string
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="whitespace-nowrap text-sm font-normal leading-5 text-[#3E4946]">{label}:</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 min-w-[120px] rounded-lg border border-[#CFD8D5] bg-white px-3 text-sm leading-5 text-[#1B1C15] outline-none transition focus:border-[#005E53] focus:ring-2 focus:ring-[#005E53]/10">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" className="max-h-44 rounded-lg border border-[#CFD8D5] bg-white p-1 shadow-md">
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="rounded-md py-2 px-3 text-sm font-normal text-[#3E4946] hover:bg-[#F3F7F6] focus:bg-[#E0F2F1] focus:text-[#005E53] cursor-pointer"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  )
}

function PetCard({ pet }: { pet: Pet }) {
  const GenderIcon = pet.gender === "female" ? Venus : Mars
  const petSubtitle = [pet.speciesLabel, pet.breed].filter(Boolean).join(" • ")

  return (
    <article className="group flex min-h-[420px] flex-col gap-4 rounded-card border border-petcenter-border bg-white p-4 shadow-card transition-all hover:border-petcenter-primary/30">
      <div
        aria-label={`Ảnh thú cưng ${pet.petName}`}
        className={cn(
          "relative flex h-48 items-center justify-center overflow-hidden rounded-control bg-petcenter-sidebar bg-cover bg-center",
          pet.profileImageUrl && "transition-transform duration-500 group-hover:[background-size:105%]"
        )}
        role="img"
        style={pet.profileImageUrl ? { backgroundImage: `url(${pet.profileImageUrl})` } : undefined}
      >
        {!pet.profileImageUrl ? <PawPrint className="h-16 w-16 text-petcenter-primary/30" /> : null}
      </div>

      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="heading-sm truncate text-petcenter-text">{pet.petName}</h2>
            <p className="body-md mt-1 text-petcenter-text-secondary">{petSubtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-petcenter-text-secondary">
          <span className="body-md inline-flex items-center gap-2">
            <Cake className="h-4 w-4" />
            {pet.ageLabel}
          </span>
          <span className="body-md inline-flex items-center gap-2">
            <GenderIcon className="h-4 w-4" />
            {pet.genderLabel}
          </span>
        </div>
      </div>

      <Link
        className="label-md flex h-11 items-center justify-center rounded-control bg-petcenter-cta px-4 font-semibold text-white shadow-card transition-colors hover:bg-petcenter-cta-hover active:bg-petcenter-cta-active"
        href={`/owner/pets/${encodeURIComponent(pet.petId)}`}
      >
        Xem hồ sơ
      </Link>
    </article>
  )
}

function PetCardSkeleton() {
  return (
    <article className="flex min-h-[420px] animate-pulse flex-col gap-4 rounded-card border border-petcenter-border bg-white p-4 shadow-card">
      <div className="h-48 rounded-control bg-petcenter-sidebar" />
      <div className="space-y-3">
        <div className="h-6 w-1/2 rounded bg-petcenter-sidebar" />
        <div className="h-4 w-2/3 rounded bg-petcenter-sidebar" />
        <div className="h-4 w-1/3 rounded bg-petcenter-sidebar" />
      </div>
      <div className="mt-auto h-11 rounded-control bg-petcenter-sidebar" />
    </article>
  )
}

function EmptyState() {
  return (
    <section className="flex min-h-[280px] flex-col items-center justify-center rounded-card border border-dashed border-petcenter-border-strong bg-petcenter-filter px-6 py-12 text-center">
      <Sprout className="h-16 w-16 text-petcenter-primary/30" />
      <h2 className="title-md mt-4 text-petcenter-text">Chưa có hồ sơ thú cưng</h2>
      <p className="body-md mt-2 max-w-md text-petcenter-text-secondary">
        Khi API trả về dữ liệu thú cưng của tài khoản hiện tại, danh sách sẽ hiển thị tại đây.
      </p>
    </section>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <section className="flex items-start gap-3 rounded-card border border-petcenter-danger-text/20 bg-petcenter-danger-bg p-4 text-petcenter-danger-text">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <h2 className="label-md font-semibold">Không thể tải danh sách thú cưng</h2>
        <p className="body-md mt-1">{message}</p>
      </div>
    </section>
  )
}
