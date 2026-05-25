import { Cake, Mars, PlusCircle, Search, SlidersHorizontal, Sprout, Venus } from "lucide-react"

import { cn } from "@/lib/utils"

type PetStatus = "healthy" | "watching"

type PetProfile = {
  id: string
  name: string
  species: string
  breed: string
  age: string
  gender: "Đực" | "Cái"
  status: PetStatus
  statusLabel: string
  imageUrl: string
}

const pets: PetProfile[] = [
  {
    id: "PC-12345",
    name: "Lucky",
    species: "Chó",
    breed: "Golden Retriever",
    age: "2 năm tuổi",
    gender: "Đực",
    status: "healthy",
    statusLabel: "Khỏe mạnh",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBcCaf2wqbjrl3tmTfKU_oyF-Pr86ktPdydY5b9NUPKQEgilhgiLMVCh6CzskV1pFu__rFdiGkVGToSOpvP5qbcUWd6b0hwC4PTWlfEm7wUS1VNnpnx4sOlJk2AnEUa156_MFFcuYCh_EPkBeRGoT32vrxhJhgNeRXOKYj35y82pk0TbI66Dccsb-FcrDaF0SsNOsecbwfeKegFXeJIyzkwXgrqrACGrSJAj9IA8guzu9usXJvcbKVMgyD9YqruL0C0LJbXxB5HS6w",
  },
  {
    id: "PC-12346",
    name: "Milo",
    species: "Mèo",
    breed: "Mèo Anh lông ngắn",
    age: "1 năm tuổi",
    gender: "Đực",
    status: "healthy",
    statusLabel: "Khỏe mạnh",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB2KNob_t3DzPZ10Hd4TgojELMd_c2TuABDNV4FqpfTZZpas5ddDVMOkKkVshC4W6P14IeWfOG5FAgFZ3PU00P5FjiOQTKhZlFxRTkw0TK1xOhjgeSrlFa1na4I5Ny9oAfdXY8CsnmQ7_Syx9K0-cH5TeFb7Y4okKSgp4FuL0xZOnnzlSm2mGhR71LiAGERpcbsJS7XMUkHL_xmZJd5iMp2AoVf5AKyPAXPwFMYiIeXJKwopmT9KYrbdW3-YVf2S3TNskcBfZqEqqM",
  },
  {
    id: "PC-12347",
    name: "Bé Bông",
    species: "Chó",
    breed: "Poodle",
    age: "3 năm tuổi",
    gender: "Cái",
    status: "watching",
    statusLabel: "Cần theo dõi",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB5x0lqlqRMufZBNxznszL-cAdv7L_PtqcXCdAgtLl93XsF0K_eodTvO-k1pBwOQUedn8hFSuIM6JQfQYYclm-bIRwA_vdSFNvM3GeFGcXeCmbzdlkHBDTHcb6zc1PRqvkW1hhdIs5pBzK4_ynpcXy5X_CBa6Y8wTyYuknhv6If6jxmvxAhbWAu1cNPHgbeW_h2Oec5fYQ0bHas02vFuviJNY8XK51EFAud2MlsFqqV7in2BSPLrt5kWUbMSS95voRFcdBq0k8MY9M",
  },
]

const statusClassName: Record<PetStatus, string> = {
  healthy: "bg-petcenter-primary text-white",
  watching: "bg-petcenter-cta text-white",
}

export function OwnerPetsPage() {
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
              placeholder="Tìm theo tên thú cưng..."
              type="search"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <FilterSelect label="Trạng thái" options={["Tất cả", "Khỏe mạnh", "Cần theo dõi", "Đang lưu trú"]} />
            <FilterSelect label="Loài" options={["Tất cả", "Chó", "Mèo"]} />
          </div>

          <div className="label-md flex items-center gap-2 text-petcenter-text-secondary xl:ml-auto">
            <SlidersHorizontal className="h-4 w-4" />
            Hiển thị 3/3 thú cưng
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {pets.map((pet) => (
          <PetCard key={pet.id} pet={pet} />
        ))}
      </section>

      <section className="flex flex-col items-center justify-center py-8 text-center text-petcenter-primary/25">
        <Sprout className="h-16 w-16" />
        <p className="body-lg mt-4 text-petcenter-text-secondary/40">Nhiều tính năng thú vị hơn đang được phát triển</p>
      </section>
    </div>
  )
}

function FilterSelect({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="flex items-center gap-2">
      <span className="label-md whitespace-nowrap text-petcenter-text-muted">{label}:</span>
      <select className="body-md h-10 rounded-control border border-petcenter-border-strong bg-white px-3 pr-9 text-petcenter-text outline-none transition focus:border-petcenter-primary focus:ring-4 focus:ring-petcenter-primary/10">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}

function PetCard({ pet }: { pet: PetProfile }) {
  const GenderIcon = pet.gender === "Đực" ? Mars : Venus

  return (
    <article className="group flex min-h-[420px] flex-col gap-4 rounded-card border border-petcenter-border bg-white p-4 shadow-card transition-all hover:border-petcenter-primary/30">
      <div
        aria-label={`Ảnh thú cưng ${pet.name}`}
        className="relative h-48 overflow-hidden rounded-control bg-petcenter-sidebar bg-cover bg-center transition-transform duration-500 group-hover:[background-size:105%]"
        role="img"
        style={{ backgroundImage: `url(${pet.imageUrl})` }}
      >
        <span
          className={cn(
            "label-sm absolute right-3 top-3 rounded-pill px-3 py-1 uppercase text-white shadow-card",
            statusClassName[pet.status]
          )}
        >
          {pet.statusLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="heading-sm truncate text-petcenter-text">{pet.name}</h2>
            <p className="body-md mt-1 text-petcenter-text-secondary">
              {pet.species} • {pet.breed}
            </p>
          </div>
          <span className="label-sm shrink-0 rounded-pill bg-petcenter-sidebar px-2 py-1 uppercase text-petcenter-text-muted">
            {pet.id}
          </span>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-petcenter-text-secondary">
          <span className="body-md inline-flex items-center gap-2">
            <Cake className="h-4 w-4" />
            {pet.age}
          </span>
          <span className="body-md inline-flex items-center gap-2">
            <GenderIcon className="h-4 w-4" />
            {pet.gender}
          </span>
        </div>
      </div>

      <button className="h-11 rounded-control bg-petcenter-cta px-4 text-sm font-semibold text-white shadow-card transition-colors hover:bg-petcenter-cta-hover active:bg-petcenter-cta-active">
        Xem hồ sơ
      </button>
    </article>
  )
}
