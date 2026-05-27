"use client"

import * as React from "react"
import Link from "next/link"
import { AlertCircle, AlertTriangle, Info, Plus, Search, Sparkles, X } from "lucide-react"
import { AppPagination } from "@/components/ui/app-pagination"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { spaApi } from "../../api/spa.api"
import {
  ownerSpaTabs,
  spaServiceIconById,
  spaStatusLabel,
} from "../../constants/spa.constants"
import { cn } from "@/lib/utils"
import type {
  BookedGroomingTicketStatus,
  GroomingBookingPet,
  GroomingService,
  GroomingTicketListItem,
  GroomingTicketStatus,
  OwnerSpaRequest,
  OwnerSpaTab,
  Pagination,
  SpaBookingStatus,
  SpaService,
} from "../../types/spa.types"
import { OwnerSpaRequestCard } from "../../components/owner/OwnerSpaRequestCard"
import { OwnerSpaServiceCard } from "../../components/owner/OwnerSpaServiceCard"

const SPA_REQUEST_PAGE_SIZE = 5
const defaultPagination: Pagination = {
  page: 1,
  limit: SPA_REQUEST_PAGE_SIZE,
  total: 0,
  totalPages: 1,
}

export function OwnerSpaListPage() {
  const [activeTab, setActiveTab] = React.useState<OwnerSpaTab>("available")
  const [availableServices, setAvailableServices] = React.useState<SpaService[]>([])
  const [bookedRequests, setBookedRequests] = React.useState<OwnerSpaRequest[]>([])
  const [historyRequests, setHistoryRequests] = React.useState<OwnerSpaRequest[]>([])
  const [bookedPets, setBookedPets] = React.useState<GroomingBookingPet[]>([])
  const [bookedFilters, setBookedFilters] = React.useState<BookedServiceFilterState>({
    search: "",
    pet: "all",
    status: "all",
    timeRange: "all",
  })
  const [bookedSearchQuery, setBookedSearchQuery] = React.useState("")
  const [bookedPage, setBookedPage] = React.useState(1)
  const [historyPage, setHistoryPage] = React.useState(1)
  const [bookedPagination, setBookedPagination] = React.useState<Pagination>(defaultPagination)
  const [historyPagination, setHistoryPagination] = React.useState<Pagination>(defaultPagination)
  const [cancelRequest, setCancelRequest] = React.useState<OwnerSpaRequest | null>(null)
  const [cancelErrorMessage, setCancelErrorMessage] = React.useState<string | null>(null)
  const [isCancellingRequest, setIsCancellingRequest] = React.useState(false)
  const [bookedRefreshKey, setBookedRefreshKey] = React.useState(0)
  const [isLoadingServices, setIsLoadingServices] = React.useState(true)
  const [hasLoadedServices, setHasLoadedServices] = React.useState(false)
  const [servicesError, setServicesError] = React.useState<string | null>(null)
  const [isLoadingBookedRequests, setIsLoadingBookedRequests] = React.useState(false)
  const [hasLoadedBookedRequests, setHasLoadedBookedRequests] = React.useState(false)
  const [bookedRequestsError, setBookedRequestsError] = React.useState<string | null>(null)
  const [isLoadingHistoryRequests, setIsLoadingHistoryRequests] = React.useState(false)
  const [hasLoadedHistoryRequests, setHasLoadedHistoryRequests] = React.useState(false)
  const [historyRequestsError, setHistoryRequestsError] = React.useState<string | null>(null)
  const shouldShowServiceSkeleton = isLoadingServices && !hasLoadedServices
  const shouldShowBookedSkeleton = isLoadingBookedRequests && !hasLoadedBookedRequests
  const shouldShowHistorySkeleton = isLoadingHistoryRequests && !hasLoadedHistoryRequests
  const bookedPetOptions = React.useMemo(() => getBookedPetOptions(bookedPets), [bookedPets])

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setBookedSearchQuery(bookedFilters.search.trim())
      setBookedPage(1)
    }, 350)

    return () => window.clearTimeout(timer)
  }, [bookedFilters.search])

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

  React.useEffect(() => {
    if (activeTab !== "booked") return

    const abortController = new AbortController()

    async function loadBookedRequests() {
      try {
        setIsLoadingBookedRequests(true)
        setBookedRequestsError(null)

        const [ticketsResult, bookingOptions] = await Promise.all([
          spaApi.listBookedTickets(
            {
              search: bookedSearchQuery || undefined,
              petId: bookedFilters.pet === "all" ? undefined : bookedFilters.pet,
              status: bookedFilters.status,
              timeRange: bookedFilters.timeRange,
              page: bookedPage,
              limit: SPA_REQUEST_PAGE_SIZE,
            },
            { signal: abortController.signal }
          ),
          bookedPets.length === 0
            ? spaApi.getBookingOptions(undefined, { signal: abortController.signal })
            : Promise.resolve(null),
        ])

        if (!abortController.signal.aborted) {
          setBookedRequests(ticketsResult.tickets.map(mapGroomingTicketToRequest))
          setBookedPagination(ticketsResult.pagination)
          setHasLoadedBookedRequests(true)

          if (bookingOptions) {
            setBookedPets(bookingOptions.pets)
          }
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          setBookedRequests([])
          setBookedPagination(defaultPagination)
          setHasLoadedBookedRequests(true)
          setBookedRequestsError(error instanceof Error ? error.message : "Không thể tải dịch vụ đã đặt")
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoadingBookedRequests(false)
        }
      }
    }

    void loadBookedRequests()

    return () => {
      abortController.abort()
    }
  }, [
    activeTab,
    bookedFilters.pet,
    bookedFilters.status,
    bookedFilters.timeRange,
    bookedPage,
    bookedPets.length,
    bookedRefreshKey,
    bookedSearchQuery,
  ])

  async function handleConfirmCancelRequest() {
    if (!cancelRequest || isCancellingRequest) return

    try {
      setIsCancellingRequest(true)
      setCancelErrorMessage(null)

      await spaApi.cancelTicket(cancelRequest.id)

      setCancelRequest(null)
      setBookedRefreshKey((current) => current + 1)
      setHistoryPage(1)
      toast.success("Hủy yêu cầu dịch vụ thành công")
    } catch (error) {
      setCancelErrorMessage(error instanceof Error ? error.message : "Không thể hủy yêu cầu dịch vụ spa")
    } finally {
      setIsCancellingRequest(false)
    }
  }

  function handleOpenCancelRequest(request: OwnerSpaRequest) {
    setCancelErrorMessage(null)
    setCancelRequest(request)
  }

  function handleCloseCancelDialog() {
    if (isCancellingRequest) return

    setCancelErrorMessage(null)
    setCancelRequest(null)
  }

  React.useEffect(() => {
    if (activeTab !== "history") return

    const abortController = new AbortController()

    async function loadHistoryRequests() {
      try {
        setIsLoadingHistoryRequests(true)
        setHistoryRequestsError(null)

        const result = await spaApi.listTicketHistory(
          {
            page: historyPage,
            limit: SPA_REQUEST_PAGE_SIZE,
          },
          { signal: abortController.signal }
        )

        if (!abortController.signal.aborted) {
          setHistoryRequests(result.tickets.map(mapGroomingTicketToRequest))
          setHistoryPagination(result.pagination)
          setHasLoadedHistoryRequests(true)
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          setHistoryRequests([])
          setHistoryPagination(defaultPagination)
          setHasLoadedHistoryRequests(true)
          setHistoryRequestsError(error instanceof Error ? error.message : "Không thể tải lịch sử dịch vụ spa")
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoadingHistoryRequests(false)
        }
      }
    }

    void loadHistoryRequests()

    return () => {
      abortController.abort()
    }
  }, [activeTab, historyPage])

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
          <BookedServiceFilters
            filters={bookedFilters}
            onFiltersChange={setBookedFilters}
            onPageReset={() => setBookedPage(1)}
            petOptions={bookedPetOptions}
          />
          <BookedServicesTab
            errorMessage={bookedRequestsError}
            isLoading={shouldShowBookedSkeleton}
            onCancelRequest={handleOpenCancelRequest}
            onPageChange={setBookedPage}
            pagination={bookedPagination}
            requestsLoading={isLoadingBookedRequests}
            requests={bookedRequests}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-0 flex-none space-y-4">
          <HistoryServicesTab
            errorMessage={historyRequestsError}
            isLoading={shouldShowHistorySkeleton}
            onPageChange={setHistoryPage}
            pagination={historyPagination}
            requestsLoading={isLoadingHistoryRequests}
            requests={historyRequests}
          />
        </TabsContent>
      </Tabs>

      <CancelGroomingRequestDialog
        errorMessage={cancelErrorMessage}
        isSubmitting={isCancellingRequest}
        onClose={handleCloseCancelDialog}
        onConfirm={handleConfirmCancelRequest}
        request={cancelRequest}
      />
    </div>
  )
}

type BookedServiceFilterState = {
  search: string
  pet: string
  status: "all" | BookedGroomingTicketStatus
  timeRange: "all" | "today" | "upcoming" | "past"
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

function mapGroomingTicketToRequest(ticket: GroomingTicketListItem): OwnerSpaRequest {
  return {
    id: ticket.groomingTicketId,
    bookingCode: ticket.bookingCode,
    serviceName: ticket.serviceName,
    petName: ticket.petName,
    scheduledAt: `${ticket.scheduledDate} - ${ticket.scheduledTime}`,
    status: mapTicketStatus(ticket.ticketStatus),
    totalAmount: formatMoney(ticket.totalAmount),
    paymentMethodLabel: ticket.paymentMethodLabel,
    paymentStatusLabel: ticket.paymentStatusLabel,
    paymentStatusTone: ticket.paymentStatusLabel === "Đã thanh toán" ? "paid" : "pending",
    icon: getServiceIcon(ticket.serviceName),
    specialRequest: ticket.specialRequest ?? undefined,
    canCancel: ticket.canCancel,
  }
}

function mapTicketStatus(status: GroomingTicketStatus): SpaBookingStatus {
  if (status === "waiting") return "ACCEPTED"
  if (status === "in_progress") return "IN_PROGRESS"
  if (status === "completed") return "COMPLETED"
  if (status === "cancelled") return "CANCELLED"

  return "WAITING_ACCEPT"
}

function getServiceIcon(serviceName: string) {
  const normalizedName = serviceName.toLocaleLowerCase("vi-VN")

  if (normalizedName.includes("tắm")) return spaServiceIconById.svc_groom_001_basic ?? Sparkles
  if (normalizedName.includes("móng")) return spaServiceIconById.svc_groom_004_nail ?? Sparkles
  if (normalizedName.includes("massage")) return spaServiceIconById.svc_groom_005_massage ?? Sparkles
  if (normalizedName.includes("cắt") && normalizedName.includes("tỉa") && normalizedName.includes("spa")) {
    return spaServiceIconById.svc_groom_003_combo ?? Sparkles
  }
  if (normalizedName.includes("cắt") || normalizedName.includes("tỉa")) {
    return spaServiceIconById.svc_groom_002_trim ?? Sparkles
  }

  return Sparkles
}

function formatMoney(value: number): string {
  return `${new Intl.NumberFormat("vi-VN").format(value)} VNĐ`
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

function BookedServicesTab({
  errorMessage,
  isLoading,
  onCancelRequest,
  onPageChange,
  pagination,
  requests,
  requestsLoading,
}: {
  errorMessage: string | null
  isLoading: boolean
  onCancelRequest: (request: OwnerSpaRequest) => void
  onPageChange: (page: number) => void
  pagination: Pagination
  requests: OwnerSpaRequest[]
  requestsLoading: boolean
}) {
  if (errorMessage) {
    return <AvailableServicesError message={errorMessage} />
  }

  if (isLoading) {
    return (
      <section className="space-y-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <BookedRequestSkeleton key={index} />
        ))}
      </section>
    )
  }

  if (requests.length === 0) {
    return (
      <section className="rounded-[16px] border border-dashed border-[#BDC9C5] bg-white px-6 py-12 text-center">
        <h2 className="text-lg font-bold leading-[26px] text-[#1B1C15]">Chưa có dịch vụ đã đặt</h2>
        <p className="mt-2 text-sm leading-5 text-[#3E4946]">
          Các yêu cầu spa đang chờ tiếp nhận hoặc đang xử lý sẽ hiển thị tại đây.
        </p>
      </section>
    )
  }

  return (
    <>
      {requests.map((request) => (
        <OwnerSpaRequestCard key={request.id} onCancelRequest={onCancelRequest} request={request} />
      ))}
      <AppPagination
        ariaLabel="Phân trang dịch vụ đã đặt"
        className="pb-8 pt-2"
        currentPage={pagination.page}
        isLoading={requestsLoading}
        onPageChange={onPageChange}
        totalPages={pagination.totalPages}
      />
    </>
  )
}

function HistoryServicesTab({
  errorMessage,
  isLoading,
  onPageChange,
  pagination,
  requests,
  requestsLoading,
}: {
  errorMessage: string | null
  isLoading: boolean
  onPageChange: (page: number) => void
  pagination: Pagination
  requests: OwnerSpaRequest[]
  requestsLoading: boolean
}) {
  if (errorMessage) {
    return <AvailableServicesError message={errorMessage} />
  }

  if (isLoading) {
    return (
      <section className="space-y-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <BookedRequestSkeleton key={index} />
        ))}
      </section>
    )
  }

  if (requests.length === 0) {
    return (
      <section className="rounded-[16px] border border-dashed border-[#BDC9C5] bg-white px-6 py-12 text-center">
        <h2 className="text-lg font-bold leading-[26px] text-[#1B1C15]">Chưa có lịch sử dịch vụ</h2>
        <p className="mt-2 text-sm leading-5 text-[#3E4946]">
          Các yêu cầu spa đã hoàn tất hoặc đã hủy sẽ hiển thị tại đây.
        </p>
      </section>
    )
  }

  return (
    <>
      {requests.map((request) => (
        <OwnerSpaRequestCard key={request.id} request={request} />
      ))}
      <AppPagination
        ariaLabel="Phân trang lịch sử dịch vụ"
        className="pb-8 pt-2"
        currentPage={pagination.page}
        isLoading={requestsLoading}
        onPageChange={onPageChange}
        totalPages={pagination.totalPages}
      />
    </>
  )
}

function BookedRequestSkeleton() {
  return (
    <article className="flex min-h-[190px] animate-pulse flex-col rounded-[16px] border border-[#E6E8DD] bg-white p-[25px] shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-xl bg-[#E0F2F1]" />
          <div className="space-y-2">
            <div className="h-5 w-36 rounded bg-[#E4E3D7]" />
            <div className="h-3 w-24 rounded bg-[#E4E3D7]" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-6 w-24 rounded-full bg-[#E4E3D7]" />
          <div className="h-5 w-28 rounded bg-[#E4E3D7]" />
        </div>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-3 w-20 rounded bg-[#E4E3D7]" />
            <div className="h-4 w-32 rounded bg-[#E4E3D7]" />
          </div>
        ))}
      </div>
    </article>
  )
}

function CancelGroomingRequestDialog({
  errorMessage,
  isSubmitting,
  onClose,
  onConfirm,
  request,
}: {
  errorMessage: string | null
  isSubmitting: boolean
  onClose: () => void
  onConfirm: () => void
  request: OwnerSpaRequest | null
}) {
  function handleClose() {
    if (!isSubmitting) {
      onClose()
    }
  }

  return (
    <Dialog
      open={Boolean(request)}
      onOpenChange={(open) => {
        if (!open) {
          handleClose()
        }
      }}
    >
      <DialogContent
        className="max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-[420px] overflow-y-auto rounded-xl border border-[#E4E3D7] bg-white px-5 py-8 shadow-[0_18px_50px_rgba(0,0,0,0.18)] sm:p-8"
        showCloseButton={false}
      >
        {request ? (
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 size-10 rounded-full text-[#3E4946] hover:bg-[#F5F4E8] hover:text-[#1B1C15]"
              disabled={isSubmitting}
              onClick={handleClose}
              type="button"
            >
              <X className="size-6" aria-hidden="true" />
              <span className="sr-only">Đóng</span>
            </Button>

            <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#FFF3C4] text-[#B45309] sm:size-[72px]">
              <AlertTriangle className="size-8 sm:size-10" aria-hidden="true" />
            </span>
            
            <DialogTitle className="mt-5 text-center text-2xl font-bold leading-8 tracking-[0] text-[#1B1C15] sm:text-[28px] sm:leading-9">
              Hủy yêu cầu dịch vụ?
            </DialogTitle>
            <DialogDescription className="mt-2 text-center text-sm leading-6 text-[#3E4946] sm:text-base">
              Bạn có chắc muốn hủy yêu cầu này không?
            </DialogDescription>

            <div className="mt-6 w-full rounded-xl bg-[#F5F4E8] px-5 py-4">
              <CancelSummaryRow label="Mã yêu cầu:" value={request.bookingCode} emphasized />
              <CancelSummaryRow label="Dịch vụ:" value={request.serviceName} />
              <CancelSummaryRow label="Thú cưng:" value={request.petName} />
              <CancelSummaryRow label="Thời gian:" value={request.scheduledAt} />
              <CancelSummaryRow label="Trạng thái:" value={spaStatusLabel[request.status]} />
            </div>

            <div className="mt-6 w-full flex gap-3 rounded-xl border border-[#FBC97C] bg-[#FFF9E8] px-4 py-3 text-[#A34700]">
              <Info className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <p className="text-[13px] leading-5 sm:text-sm sm:leading-5">
                Sau khi hủy, yêu cầu sẽ không còn được trung tâm tiếp nhận. Bạn có thể đặt lại dịch vụ nếu cần.
              </p>
            </div>

            {errorMessage ? (
              <div className="mt-4 flex w-full items-start gap-2 rounded-lg border border-[#F8C7C7] bg-[#FFF5F5] px-4 py-3 text-sm leading-5 text-[#8A1F1F]">
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <p>{errorMessage}</p>
              </div>
            ) : null}

            <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                className="h-12 w-full rounded-lg border-[#6E7A76] bg-white px-5 text-base font-semibold text-[#1B1C15] hover:bg-[#F5F4E8] sm:w-auto"
                disabled={isSubmitting}
                onClick={handleClose}
                type="button"
              >
                Không hủy
              </Button>
              <Button
                className="h-12 w-full rounded-lg bg-[#C81E1E] px-5 text-base font-semibold text-white hover:bg-[#A91B1B] sm:w-auto"
                disabled={isSubmitting}
                onClick={onConfirm}
                type="button"
              >
                {isSubmitting ? "Đang hủy" : "Xác nhận hủy"}
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function CancelSummaryRow({
  emphasized = false,
  label,
  value,
}: {
  emphasized?: boolean
  label: string
  value: string
}) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm sm:text-base">
      <span className="shrink-0 text-[#3E4946]">{label}</span>
      <span className={cn("min-w-0 break-words text-right text-[#1B1C15]", emphasized ? "font-bold" : "font-medium")}>
        {value}
      </span>
    </div>
  )
}

function BookedServiceFilters({
  filters,
  onFiltersChange,
  onPageReset,
  petOptions,
}: {
  filters: BookedServiceFilterState
  onFiltersChange: React.Dispatch<React.SetStateAction<BookedServiceFilterState>>
  onPageReset: () => void
  petOptions: Array<{ label: string; value: string }>
}) {
  const hasActiveFilter =
    filters.search.trim().length > 0 ||
    filters.pet !== "all" ||
    filters.status !== "all" ||
    filters.timeRange !== "all"

  function resetFilters() {
    onPageReset()
    onFiltersChange({
      search: "",
      pet: "all",
      status: "all",
      timeRange: "all",
    })
  }

  function updateFilter(key: keyof BookedServiceFilterState, value: string) {
    onPageReset()
    onFiltersChange((currentFilters) => ({
      ...currentFilters,
      [key]: value,
    }))
  }

  return (
    <section className="rounded-[16px] border border-[#E6E8DD] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-[#6E7774]" aria-hidden="true" />
          <span className="sr-only">Tìm dịch vụ đã đặt</span>
          <input
            type="search"
            placeholder="Tìm theo mã dịch vụ, thú cưng"
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
            className="h-11 w-full rounded-full border border-[#CFD8D5] bg-white pl-14 pr-4 text-base leading-6 text-[#1B1C15] outline-none transition placeholder:text-[#8A918E] focus:border-[#005E53] focus:ring-4 focus:ring-[#005E53]/10"
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center xl:flex-nowrap">
          <BookedFilterSelect
            label="Thú cưng"
            onChange={(value) => updateFilter("pet", value)}
            options={petOptions}
            value={filters.pet}
          />
          <BookedFilterSelect
            label="Trạng thái"
            onChange={(value) => updateFilter("status", value)}
            options={[
              { label: "Tất cả", value: "all" },
              { label: "Chờ tiếp nhận", value: "pending" },
              { label: "Đã tiếp nhận", value: "waiting" },
              { label: "Đang thực hiện", value: "in_progress" },
            ]}
            value={filters.status}
          />
          <BookedFilterSelect
            label="Thời gian"
            onChange={(value) => updateFilter("timeRange", value)}
            options={[
              { label: "Tất cả", value: "all" },
              { label: "Hôm nay", value: "today" },
              { label: "Sắp tới", value: "upcoming" },
              { label: "Đã qua", value: "past" },
            ]}
            value={filters.timeRange}
          />
          <Button
            variant="ghost"
            className="h-10 w-fit shrink-0 rounded-xl px-3 text-base font-normal leading-6 text-[#005E53] hover:bg-[#E0F2F1] hover:text-[#004C43] disabled:pointer-events-none disabled:opacity-50"
            disabled={!hasActiveFilter}
            onClick={resetFilters}
          >
            Đặt lại bộ lọc
          </Button>
        </div>
      </div>
    </section>
  )
}

function getBookedPetOptions(pets: GroomingBookingPet[]): Array<{ label: string; value: string }> {
  return [
    { label: "Tất cả", value: "all" },
    ...pets.map((pet) => ({
      label: pet.petName,
      value: pet.petId,
    })),
  ]
}

function BookedFilterSelect({
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
      <span className="whitespace-nowrap text-base font-normal leading-6 text-[#3E4946]">{label}:</span>
      <select
        className="h-11 min-w-[132px] rounded-[16px] border border-[#CFD8D5] bg-white px-4 pr-9 text-base leading-6 text-[#1B1C15] outline-none transition focus:border-[#005E53] focus:ring-4 focus:ring-[#005E53]/10"
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
