"use client"

import * as React from "react"
import { AlertCircle, Cake, Mars, PawPrint, PlusCircle, Search, SlidersHorizontal, Sprout, Venus } from "lucide-react"

import { cn } from "@/lib/utils"
import { petsApi } from "../../api/pets.api"
import type { Pet, PetDisplayStatus, PetSpecies } from "../../types/pet.types"

const statusClassName: Record<PetDisplayStatus, string> = {
  healthy: "bg-petcenter-primary text-white",
  watching: "bg-petcenter-cta text-white",
  boarding: "bg-petcenter-info-text text-white",
  inactive: "bg-petcenter-text-muted text-white",
  deceased: "bg-petcenter-danger-text text-white",
}

const statusOptions: Array<{ label: string; value: "all" | PetDisplayStatus }> = [
  { label: "Tất cả", value: "all" },
  { label: "Khỏe mạnh", value: "healthy" },
  { label: "Cần theo dõi", value: "watching" },
  { label: "Đang lưu trú", value: "boarding" },
]

const speciesOptions: Array<{ label: string; value: "all" | PetSpecies }> = [
  { label: "Tất cả", value: "all" },
  { label: "Chó", value: "Dog" },
  { label: "Mèo", value: "Cat" },
  { label: "Khác", value: "Other" },
]

export function OwnerPetsPage() {
  const [pets, setPets] = React.useState<Pet[]>([])
  const [total, setTotal] = React.useState(0)
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState<"all" | PetDisplayStatus>("all")
  const [species, setSpecies] = React.useState<"all" | PetSpecies>("all")
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasLoaded, setHasLoaded] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const shouldShowSkeleton = isLoading && !hasLoaded
  const displayedPets = React.useMemo(() => {
    const keyword = search.trim().toLowerCase()

    if (!keyword) return pets

    return pets.filter((pet) =>
      [pet.petId, pet.petName, pet.breed ?? "", pet.speciesLabel]
        .some((value) => value.toLowerCase().includes(keyword))
    )
  }, [pets, search])

  React.useEffect(() => {
    const abortController = new AbortController()

    async function loadPets() {
      try {
        setIsLoading(true)
        setErrorMessage(null)

        const result = await petsApi.list({
          status,
          species,
          page: 1,
          limit: 20,
          sort: "petName:asc",
        })

        if (!abortController.signal.aborted) {
          setPets(result.pets)
          setTotal(result.pagination.total)
          setHasLoaded(true)
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          setPets([])
          setTotal(0)
          setHasLoaded(true)
          setErrorMessage(error instanceof Error ? error.message : "Không thể tải danh sách thú cưng")
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    const timer = window.setTimeout(loadPets, 250)

    return () => {
      abortController.abort()
      window.clearTimeout(timer)
    }
  }, [species, status])

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-section">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="heading-lg text-petcenter-text">Thú cưng của tôi</h1>
          <p className="body-lg mt-2 text-petcenter-text-secondary">
            Quản lý hồ sơ và theo dõi thông tin tất cả thú cưng của bạn.
          </p>
        </div>

        <button className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-control bg-petcenter-cta px-5 text-sm font-semibold text-white shadow-card transition-all hover:bg-petcenter-cta-hover active:bg-petcenter-cta-active sm:w-auto">
          <PlusCircle className="h-5 w-5" />
          Thêm hồ sơ thú cưng
        </button>
      </section>

      <section className="rounded-card border border-petcenter-border bg-petcenter-filter p-4 shadow-card">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-petcenter-text-muted" />
            <input
              className="body-md h-11 w-full rounded-pill border border-petcenter-border-strong bg-white pl-11 pr-4 text-petcenter-text outline-none transition focus:border-petcenter-primary focus:ring-4 focus:ring-petcenter-primary/10"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tên thú cưng..."
              type="search"
              value={search}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <FilterSelect
              label="Trạng thái"
              onChange={(value) => setStatus(value as "all" | PetDisplayStatus)}
              options={statusOptions}
              value={status}
            />
            <FilterSelect
              label="Loài"
              onChange={(value) => setSpecies(value as "all" | PetSpecies)}
              options={speciesOptions}
              value={species}
            />
          </div>

          <div className="label-md flex min-w-[150px] items-center justify-start gap-2 text-petcenter-text-secondary xl:ml-auto xl:justify-end">
            <SlidersHorizontal className="h-4 w-4" />
            {shouldShowSkeleton ? "Đang tải..." : `Hiển thị ${displayedPets.length}/${total} thú cưng`}
          </div>
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
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {displayedPets.map((pet) => (
            <PetCard key={pet.petId} pet={pet} />
          ))}
        </section>
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
      <span className="label-md whitespace-nowrap text-petcenter-text-muted">{label}:</span>
      <select
        className="body-md h-10 rounded-control border border-petcenter-border-strong bg-white px-3 pr-9 text-petcenter-text outline-none transition focus:border-petcenter-primary focus:ring-4 focus:ring-petcenter-primary/10"
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
        <span
          className={cn(
            "label-sm absolute right-3 top-3 rounded-pill px-3 py-1 uppercase text-white shadow-card",
            statusClassName[pet.displayStatus]
          )}
        >
          {pet.displayStatusLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="heading-sm truncate text-petcenter-text">{pet.petName}</h2>
            <p className="body-md mt-1 text-petcenter-text-secondary">{petSubtitle}</p>
          </div>
          <span className="label-sm shrink-0 rounded-pill bg-petcenter-sidebar px-2 py-1 uppercase text-petcenter-text-muted">
            {pet.petId}
          </span>
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

      <button className="h-11 rounded-control bg-petcenter-cta px-4 text-sm font-semibold text-white shadow-card transition-colors hover:bg-petcenter-cta-hover active:bg-petcenter-cta-active">
        Xem hồ sơ
      </button>
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
