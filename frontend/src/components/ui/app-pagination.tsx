"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

type AppPaginationProps = {
  ariaLabel: string
  currentPage: number
  isLoading?: boolean
  onPageChange: (page: number) => void
  totalPages: number
  className?: string
  size?: "default" | "sm"
}

export function AppPagination({
  ariaLabel,
  className,
  currentPage,
  isLoading = false,
  onPageChange,
  totalPages,
  size = "default",
}: AppPaginationProps) {
  if (totalPages <= 1) return null

  const pages = getPaginationItems(currentPage, totalPages)

  const isSm = size === "sm"
  const buttonBase = isSm ? "h-9 w-9 rounded-lg" : "h-11 w-11 rounded-[14px]"
  const pageButtonBase = isSm ? "h-9 min-w-9 rounded-lg px-2 text-sm" : "h-11 min-w-11 rounded-[14px] px-3 text-lg"
  const ellipsisBase = isSm ? "h-9 min-w-9 text-sm" : "h-11 min-w-11 text-base"
  const iconSize = isSm ? "size-4" : "size-5"
  const gapSize = isSm ? "gap-1.5" : "gap-3"
  const innerGapSize = isSm ? "gap-1" : "gap-2"

  return (
    <nav className={cn(`flex items-center justify-center ${gapSize}`, className)} aria-label={ariaLabel}>
      <button
        aria-label="Trang trước"
        className={cn(
          "flex items-center justify-center border border-[#CFD8D5] bg-white text-[#52615D] shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition hover:bg-[#F1EFE2] disabled:cursor-not-allowed disabled:opacity-50",
          buttonBase
        )}
        disabled={currentPage === 1 || isLoading}
        onClick={() => onPageChange(currentPage - 1)}
        type="button"
      >
        <ChevronLeft className={iconSize} aria-hidden="true" />
      </button>

      <div className={`flex items-center ${innerGapSize}`}>
        {pages.map((item, index) =>
          item === "ellipsis" ? (
            <span
              className={cn("flex items-center justify-center font-semibold leading-none text-[#6E7A76]", ellipsisBase)}
              key={`ellipsis-${index}`}
            >
              ...
            </span>
          ) : (
            <button
              aria-current={item === currentPage ? "page" : undefined}
              className={cn(
                "flex items-center justify-center font-semibold leading-none shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition disabled:cursor-not-allowed",
                pageButtonBase,
                item === currentPage
                  ? "bg-[#008577] text-white"
                  : "border border-[#CFD8D5] bg-white text-[#52615D] hover:bg-[#F1EFE2]"
              )}
              disabled={isLoading}
              key={item}
              onClick={() => onPageChange(item)}
              type="button"
            >
              {item}
            </button>
          )
        )}
      </div>

      <button
        aria-label="Trang sau"
        className={cn(
          "flex items-center justify-center border border-[#CFD8D5] bg-white text-[#52615D] shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition hover:bg-[#F1EFE2] disabled:cursor-not-allowed disabled:opacity-50",
          buttonBase
        )}
        disabled={currentPage === totalPages || isLoading}
        onClick={() => onPageChange(currentPage + 1)}
        type="button"
      >
        <ChevronRight className={iconSize} aria-hidden="true" />
      </button>
    </nav>
  )
}

function getPaginationItems(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const items = new Set<number>([1, totalPages, currentPage])

  if (currentPage > 1) items.add(currentPage - 1)
  if (currentPage < totalPages) items.add(currentPage + 1)
  if (currentPage <= 3) {
    items.add(2)
    items.add(3)
    items.add(4)
  }
  if (currentPage >= totalPages - 2) {
    items.add(totalPages - 3)
    items.add(totalPages - 2)
    items.add(totalPages - 1)
  }

  const sortedItems = Array.from(items)
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b)

  return sortedItems.flatMap((item, index) => {
    const previousItem = sortedItems[index - 1]

    if (previousItem && item - previousItem > 1) {
      return ["ellipsis", item] as Array<number | "ellipsis">
    }

    return [item]
  })
}
