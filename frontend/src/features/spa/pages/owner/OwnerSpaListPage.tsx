"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { includesSearchText, normalizeSearchText } from "@/lib/search"
import {
  ownerBookedSpaRequests,
  ownerSpaHistory,
  ownerSpaServices,
  ownerSpaTabs,
} from "../../constants/spa.constants"
import type { OwnerSpaTab } from "../../types/spa.types"
import { OwnerSpaRequestCard } from "../../components/owner/OwnerSpaRequestCard"
import { OwnerSpaServiceCard } from "../../components/owner/OwnerSpaServiceCard"

export function OwnerSpaListPage() {
  const [activeTab, setActiveTab] = useState<OwnerSpaTab>("available")
  const [requestSearch, setRequestSearch] = useState("")
  const debouncedRequestSearch = useDebouncedValue(requestSearch, 300)
  const requestQuery = normalizeSearchText(debouncedRequestSearch)
  const filteredBookedRequests = ownerBookedSpaRequests.filter((request) => matchesSpaRequest(request, requestQuery))
  const filteredHistoryRequests = ownerSpaHistory.filter((request) => matchesSpaRequest(request, requestQuery))

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="heading-lg text-balance text-petcenter-text">Dịch vụ làm đẹp</h1>
          <p className="body-md text-pretty text-petcenter-text-secondary">
            Đặt lịch tắm gội, cắt tỉa và chăm sóc thú cưng tại trung tâm.
          </p>
        </div>
        <Button asChild className="h-9 w-fit gap-2 rounded-lg bg-[#FEA619] px-6 text-xs font-medium text-[#2A1700] shadow-[0_1px_1px_rgba(0,0,0,0.05)] hover:bg-[#F59E0B]">
          <Link href="/owner/spa/booking">
            <Plus className="size-3" aria-hidden="true" />
            Đặt dịch vụ
          </Link>
        </Button>
      </section>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as OwnerSpaTab)}
        className="flex w-full flex-col gap-6"
      >
        <TabsList variant="line" className="h-auto w-full justify-start gap-8 border-b border-[#BDC9C5] p-0">
          {ownerSpaTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="h-auto flex-none rounded-none bg-transparent px-1 pb-3 pt-0 text-xs font-medium leading-4 text-[#3E4946] hover:bg-transparent hover:text-[#005E53] after:bottom-[-1px] after:bg-[#005E53] after:opacity-0 hover:after:opacity-100 data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-[#005E53] data-[state=active]:after:opacity-100"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="available" className="mt-0 flex-none">
          <section className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-2 xl:grid-cols-3">
            {ownerSpaServices.map((service) => (
              <OwnerSpaServiceCard key={service.id} service={service} />
            ))}
          </section>
        </TabsContent>

        <TabsContent value="booked" className="mt-0 flex-none space-y-4">
          <BookedServiceFilters searchValue={requestSearch} onSearchChange={setRequestSearch} />
          <SpaRequestList emptyText="KhÃ´ng tÃ¬m tháº¥y dá»‹ch vá»¥ Ä‘Ã£ Ä‘áº·t." requests={filteredBookedRequests} />
        </TabsContent>

        <TabsContent value="history" className="mt-0 flex-none space-y-4">
          <BookedServiceFilters searchValue={requestSearch} onSearchChange={setRequestSearch} />
          <SpaRequestList emptyText="KhÃ´ng tÃ¬m tháº¥y lá»‹ch sá»­ spa." requests={filteredHistoryRequests} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function matchesSpaRequest(request: (typeof ownerBookedSpaRequests)[number], query: string) {
  return [
    request.bookingCode,
    request.serviceName,
    request.petName,
    request.scheduledAt,
    request.paymentMethodLabel,
    request.paymentStatusLabel,
    request.specialRequest,
  ].some((value) => includesSearchText(value, query))
}

function SpaRequestList({ emptyText, requests }: { emptyText: string; requests: typeof ownerBookedSpaRequests }) {
  if (requests.length === 0) {
    return (
      <section className="rounded-[16px] border border-dashed border-[#BDC9C5] bg-[#FBFAF2] p-8 text-center text-sm leading-5 text-[#3E4946]">
        {emptyText}
      </section>
    )
  }

  return requests.map((request) => (
    <OwnerSpaRequestCard key={request.id} request={request} />
  ))
}

function BookedServiceFilters({
  onSearchChange,
  searchValue,
}: {
  onSearchChange: (value: string) => void
  searchValue: string
}) {
  const filters = ["Thú cưng: Tất cả", "Trạng thái: Tất cả", "Thời gian: Tất cả"]

  return (
    <section className="rounded-[16px] border border-[#E6E8DD] bg-white p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start">
        <label className="relative min-w-[240px] flex-1 xl:max-w-[320px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#3E4946]" aria-hidden="true" />
          <span className="sr-only">Tìm dịch vụ đã đặt</span>
          <input
            type="search"
            placeholder="Tìm theo mã dịch vụ, thú cưng"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-10 w-full rounded-xl border border-transparent bg-[#F5F4E8] pl-10 pr-4 text-base leading-6 text-[#1B1C15] outline-none placeholder:text-[#3E4946] focus:border-[#005E53]"
          />
        </label>

        <div className="flex flex-wrap gap-3">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant="ghost"
              className="h-10 rounded-xl bg-[#F5F4E8] px-4 text-base font-normal leading-6 text-[#3E4946] hover:bg-[#EDEBDE] hover:text-[#1B1C15]"
            >
              {filter}
              <ChevronDown className="ml-2 size-4" aria-hidden="true" />
            </Button>
          ))}
        </div>
      </div>

      <Button
        variant="ghost"
        onClick={() => onSearchChange("")}
        className="mt-2 h-8 px-2 text-base font-normal leading-6 text-[#005E53] hover:bg-transparent hover:text-[#004C43]"
      >
        Đặt lại bộ lọc
      </Button>
    </section>
  )
}
