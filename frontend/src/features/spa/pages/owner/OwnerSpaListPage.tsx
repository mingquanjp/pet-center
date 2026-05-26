"use client"

import * as React from "react"
import Link from "next/link"
import { AlertCircle, ChevronDown, Plus, Search, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { spaApi } from "../../api/spa.api"
import {
  ownerBookedSpaRequests,
  ownerSpaHistory,
  ownerSpaTabs,
  spaServiceIconById,
} from "../../constants/spa.constants"
import type { GroomingService, OwnerSpaTab, SpaService } from "../../types/spa.types"
import { OwnerSpaRequestCard } from "../../components/owner/OwnerSpaRequestCard"
import { OwnerSpaServiceCard } from "../../components/owner/OwnerSpaServiceCard"

export function OwnerSpaListPage() {
  const [activeTab, setActiveTab] = React.useState<OwnerSpaTab>("available")
  const [availableServices, setAvailableServices] = React.useState<SpaService[]>([])
  const [isLoadingServices, setIsLoadingServices] = React.useState(true)
  const [hasLoadedServices, setHasLoadedServices] = React.useState(false)
  const [servicesError, setServicesError] = React.useState<string | null>(null)
  const shouldShowServiceSkeleton = isLoadingServices && !hasLoadedServices

  React.useEffect(() => {
    const abortController = new AbortController()

    async function loadAvailableServices() {
      try {
        setIsLoadingServices(true)
        setServicesError(null)

        const services = await spaApi.listAvailableServices({
          signal: abortController.signal,
        })

        if (!abortController.signal.aborted) {
          setAvailableServices(services.map(mapGroomingServiceToCard))
          setHasLoadedServices(true)
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          setAvailableServices([])
          setHasLoadedServices(true)
          setServicesError(error instanceof Error ? error.message : "Không thể tải danh sách dịch vụ spa")
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoadingServices(false)
        }
      }
    }

    void loadAvailableServices()

    return () => {
      abortController.abort()
    }
  }, [])

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
          <AvailableServicesTab
            errorMessage={servicesError}
            isLoading={shouldShowServiceSkeleton}
            services={availableServices}
          />
        </TabsContent>

        <TabsContent value="booked" className="mt-0 flex-none space-y-4">
          <BookedServiceFilters />
          {ownerBookedSpaRequests.map((request) => (
            <OwnerSpaRequestCard key={request.id} request={request} />
          ))}
        </TabsContent>

        <TabsContent value="history" className="mt-0 flex-none space-y-4">
          {ownerSpaHistory.map((request) => (
            <OwnerSpaRequestCard key={request.id} request={request} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function mapGroomingServiceToCard(service: GroomingService): SpaService {
  return {
    id: service.serviceId,
    title: service.serviceName,
    description: service.description ?? "Chưa cập nhật mô tả dịch vụ.",
    priceText: service.priceText,
    durationText: service.durationText,
    icon: spaServiceIconById[service.serviceId] ?? Sparkles,
    featured: service.serviceId === "svc_groom_003_combo",
  }
}

function AvailableServicesTab({
  errorMessage,
  isLoading,
  services,
}: {
  errorMessage: string | null
  isLoading: boolean
  services: SpaService[]
}) {
  if (errorMessage) {
    return <AvailableServicesError message={errorMessage} />
  }

  if (isLoading) {
    return (
      <section className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <AvailableServiceSkeleton key={index} />
        ))}
      </section>
    )
  }

  if (services.length === 0) {
    return (
      <section className="rounded-[16px] border border-dashed border-[#BDC9C5] bg-white px-6 py-12 text-center">
        <h2 className="text-lg font-bold leading-[26px] text-[#1B1C15]">Chưa có dịch vụ khả dụng</h2>
        <p className="mt-2 text-sm leading-5 text-[#3E4946]">
          Khi trung tâm bật dịch vụ spa, danh sách sẽ hiển thị tại đây.
        </p>
      </section>
    )
  }

  return (
    <section className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-2 xl:grid-cols-3">
      {services.map((service) => (
        <OwnerSpaServiceCard key={service.id} service={service} />
      ))}
    </section>
  )
}

function AvailableServiceSkeleton() {
  return (
    <article className="flex min-h-[237px] animate-pulse flex-col rounded-[16px] border border-[#E6E8DD] bg-white p-[25px] shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-3 pb-4">
        <div className="size-10 rounded-lg bg-[#E0F2F1]" />
        <div className="h-6 w-1/2 rounded bg-[#E4E3D7]" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-[#E4E3D7]" />
        <div className="h-4 w-3/4 rounded bg-[#E4E3D7]" />
        <div className="h-4 w-1/2 rounded bg-[#E4E3D7]" />
      </div>
      <div className="mt-auto flex justify-end border-t border-[#E6E8DD] pt-4">
        <div className="h-9 w-28 rounded-xl bg-[#E4E3D7]" />
      </div>
    </article>
  )
}

function AvailableServicesError({ message }: { message: string }) {
  return (
    <section className="flex items-start gap-3 rounded-[16px] border border-petcenter-danger-text/20 bg-petcenter-danger-bg p-4 text-petcenter-danger-text">
      <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div>
        <h2 className="text-sm font-bold leading-5">Không thể tải danh sách dịch vụ spa</h2>
        <p className="mt-1 text-sm leading-5">{message}</p>
      </div>
    </section>
  )
}

function BookedServiceFilters() {
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
        className="mt-2 h-8 px-2 text-base font-normal leading-6 text-[#005E53] hover:bg-transparent hover:text-[#004C43]"
      >
        Đặt lại bộ lọc
      </Button>
    </section>
  )
}
