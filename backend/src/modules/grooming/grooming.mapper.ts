
import type {
  GroomingAvailabilityDto,
  GroomingBookingPetDto,
  GroomingBookingServiceDto,
  GroomingBookingServicePriceBaseDto,
  GroomingPaymentOption,
  GroomingServiceDto,
  GroomingTicketHistoryFilters,
  GroomingTicketCancelledDto,
  GroomingTicketCreatedDto,
  GroomingTicketDetailDto,
  GroomingTicketListFilters,
  GroomingTicketListItemDto,
  GroomingTicketStatus,
  InvoiceStatus,
  StaffCounterGroomingPetDto,
  StaffGroomingTicketDto,
  StaffGroomingTicketListDto,
  StaffGroomingTicketStatusFilter,
  StaffGroomingTicketStatusTone
} from "./grooming.types.js";
import type {
  GroomingServiceRow,
  BookingPetRow,
  StaffCounterPetRow,
  BookingServiceRow,
  GroomingTicketListRow,
  GroomingTicketDetailRow,
  GroomingTicketItemRow,
  PaymentRow,
  StaffGroomingTicketRow
} from "./grooming.repository.js";

const timeZone = "Asia/Ho_Chi_Minh";

export function formatMoney(value: number): string {
    return new Intl.NumberFormat("vi-VN").format(value);
}

export function formatStartingPrice(price: number): string {
    return `Từ ${formatMoney(price)} VNĐ`;
}

export function formatDuration(minutes: number | null): string {
    if (minutes === null) return "Chưa cập nhật";
    if (minutes < 60) return `${minutes} phút`;
    if (minutes % 60 === 0) return `${minutes / 60} giờ`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours} giờ ${remainingMinutes} phút`;
}

export function getSpeciesLabel(species: BookingPetRow["species"]): string {
    const labels = {
    Dog: "Chó",
    Cat: "Mèo",
    Other: "Khác"
    } as const;

    return labels[species];
}

export function getTicketStatusLabel(status: GroomingTicketStatus): string {
    const labels = {
    pending_payment: "Chờ thanh toán",
    pending: "Chờ tiếp nhận",
    waiting: "Đã tiếp nhận",
    in_progress: "Đang thực hiện",
    completed: "Hoàn thành",
    cancelled: "Đã hủy"
    } as const;

    return labels[status];
}

export function getPaymentMethodLabel(paymentOption: GroomingPaymentOption | null): string {
    if (paymentOption === "online") return "Thanh toán online";
    if (paymentOption === "counter") return "Tại trung tâm";

    return "Chưa cập nhật";
}

export function getPaymentStatusLabel(invoiceStatus: InvoiceStatus | null, hasSuccessPayment: boolean): string {
    if (invoiceStatus === "paid" || hasSuccessPayment) return "Đã thanh toán";

    return "Chưa thanh toán";
}

export function canCancelTicket(status: GroomingTicketStatus, invoiceStatus: InvoiceStatus | null, hasSuccessPayment: boolean): boolean {
    return status === "pending" && invoiceStatus !== "paid" && !hasSuccessPayment;
}

export function mapBookingPet(row: BookingPetRow): GroomingBookingPetDto {
    return {
    petId: row.pet_id,
    petName: row.pet_name,
    species: row.species,
    speciesLabel: getSpeciesLabel(row.species),
    weightKg: row.weight_kg === null ? null : Number(row.weight_kg),
    profileImageUrl: row.profile_image_url
    };
}

export function mapStaffCounterPet(row: StaffCounterPetRow): StaffCounterGroomingPetDto {
    return {
    ...mapBookingPet(row),
    breed: row.breed,
    ownerUserId: row.owner_user_id,
    ownerName: row.owner_name,
    ownerPhoneNumber: row.owner_phone_number
    };
}

export function getStaffTicketStatusLabel(status: GroomingTicketStatus): string {
    const labels: Record<GroomingTicketStatus, string> = {
    pending_payment: "Chờ thanh toán",
    pending: "Chờ tiếp nhận",
    waiting: "Đã tiếp nhận",
    in_progress: "Đã tiếp nhận",
    completed: "Hoàn tất",
    cancelled: "Đã hủy"
    };

    return labels[status];
}

export function getStaffTicketStatusTone(status: GroomingTicketStatus): StaffGroomingTicketStatusTone {
    const tones: Record<GroomingTicketStatus, StaffGroomingTicketStatusTone> = {
    pending_payment: "payment",
    pending: "pending",
    waiting: "accepted",
    in_progress: "inProgress",
    completed: "completed",
    cancelled: "cancelled"
    };

    return tones[status];
}

export function getSourceLabel(sourceType: StaffGroomingTicketRow["source_type"]): string {
    return sourceType === "counter" ? "Tại quầy" : "Online";
}

export function getStaffPaymentMethodLabel(paymentOption: GroomingPaymentOption | null, sourceType: StaffGroomingTicketRow["source_type"]): string {
    if (paymentOption === "counter") return "Tại trung tâm";
    if (paymentOption === "online") return "Thanh toán online";

    return sourceType === "counter" ? "Tại trung tâm" : "Thanh toán online";
}

export function mapStaffGroomingTicket(row: StaffGroomingTicketRow): StaffGroomingTicketDto {
    const serviceCount = Number(row.service_count);
    const serviceName = row.service_names ?? row.service_name;
    const status = row.ticket_status;
    const isPaid = row.invoice_status === "paid";

    return {
    groomingTicketId: row.grooming_ticket_id,
    bookingCode: row.grooming_ticket_id,
    petName: row.pet_name,
    petDescription: row.breed ? `${getSpeciesLabel(row.species)} - ${row.breed}` : getSpeciesLabel(row.species),
    ownerName: row.owner_name,
    serviceName,
    serviceCount,
    scheduledAt: row.scheduled_at.toISOString(),
    sourceType: row.source_type,
    sourceLabel: getSourceLabel(row.source_type),
    paymentMethodLabel: getStaffPaymentMethodLabel(row.payment_option, row.source_type),
    paymentStatusLabel: isPaid ? "Đã thanh toán" : "Chưa thanh toán",
    paymentStatusTone: isPaid ? "paid" : "pending",
    specialRequest: row.special_request,
    totalAmount: Number(row.estimated_total),
    totalAmountText: `${formatMoney(Number(row.estimated_total))} VNĐ`,
    status,
    statusLabel: status === "in_progress" ? "Đang thực hiện" : getStaffTicketStatusLabel(status),
    statusTone: getStaffTicketStatusTone(status),
    canAccept: status === "pending",
    canStart: status === "waiting",
    canComplete: status === "in_progress",
    canCancel: status === "pending"
    };
}

export function toVietnamDateString(value: Date): string {
    const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
    }).formatToParts(value);
    const year = parts.find((part) => part.type === "year")?.value;
    const month = parts.find((part) => part.type === "month")?.value;
    const day = parts.find((part) => part.type === "day")?.value;

    return `${year}-${month}-${day}`;
}

export function mapBookingServicePriceBase(row: BookingServiceRow): GroomingBookingServicePriceBaseDto | null {
    return {
    serviceId: row.service_id,
    serviceName: row.service_name,
    description: row.description,
    estimatedDurationMinutes: row.estimated_duration_minutes,
    durationText: formatDuration(row.estimated_duration_minutes),
    basePrice: Number(row.base_price)
    };
}

export function mapGroomingServices(rows: GroomingServiceRow[]): GroomingServiceDto[] {
    const services = new Map<string, GroomingServiceDto>();

    for (const row of rows) {
    const basePrice = Number(row.base_price);
    const existing = services.get(row.service_id);
    const service =
      existing ??
      {
        serviceId: row.service_id,
        serviceName: row.service_name,
        description: row.description,
        estimatedDurationMinutes: row.estimated_duration_minutes,
        durationText: formatDuration(row.estimated_duration_minutes),
        basePrice,
        priceMin: basePrice,
        priceMax: basePrice,
        priceText: formatStartingPrice(basePrice)
      };

    services.set(row.service_id, service);
    }

    return [...services.values()];
}

export function mapGroomingTicketListItem(row: GroomingTicketListRow): GroomingTicketListItemDto {
    const totalAmount = row.invoice_total_amount === null ? Number(row.estimated_total) : Number(row.invoice_total_amount);

    return {
    groomingTicketId: row.grooming_ticket_id,
    bookingCode: row.grooming_ticket_id,
    serviceName: row.service_name,
    petName: row.pet_name,
    scheduledAt: row.scheduled_at,
    scheduledDate: row.scheduled_date,
    scheduledTime: row.scheduled_time,
    ticketStatus: row.ticket_status,
    ticketStatusLabel: getTicketStatusLabel(row.ticket_status),
    paymentOption: row.payment_option ?? "counter",
    paymentMethodLabel: getPaymentMethodLabel(row.payment_option),
    invoiceStatus: row.invoice_status,
    paymentStatusLabel: getPaymentStatusLabel(row.invoice_status, row.has_success_payment),
    totalAmount,
    specialRequest: row.special_request,
    canCancel: canCancelTicket(row.ticket_status, row.invoice_status, row.has_success_payment)
    };
}

export function mapGroomingTicketDetail(row: GroomingTicketDetailRow, services: GroomingTicketItemRow[], payment: PaymentRow | null): GroomingTicketDetailDto {
    return {
    ...mapGroomingTicketListItem(row),
    pet: {
      petId: row.pet_id,
      petName: row.pet_name,
      species: row.species,
      speciesLabel: getSpeciesLabel(row.species),
      weightKg: row.weight_kg === null ? null : Number(row.weight_kg),
      profileImageUrl: row.profile_image_url
    },
    services: services.map((service) => ({
      serviceId: service.service_id,
      serviceName: service.service_name,
      quantity: service.quantity,
      appliedUnitPrice: Number(service.applied_unit_price),
      lineAmount: Number(service.line_amount)
    })),
    invoice: row.invoice_id && row.invoice_status && row.payment_option
      ? {
          invoiceId: row.invoice_id,
          invoiceStatus: row.invoice_status,
          paymentOption: row.payment_option,
          totalAmount: Number(row.invoice_total_amount ?? row.estimated_total)
        }
      : null,
    payment: payment
      ? {
          paymentId: payment.payment_id,
          paymentMethod: payment.payment_method,
          transactionCode: payment.transaction_code,
          paidAmount: Number(payment.paid_amount),
          paidAt: payment.paid_at,
          paymentStatus: payment.payment_status,
          receiptCode: payment.receipt_code,
          receiptUrl: payment.receipt_url
        }
      : null
    };
}
