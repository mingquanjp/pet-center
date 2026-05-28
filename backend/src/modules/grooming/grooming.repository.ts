import { randomBytes } from "node:crypto";
import type { PoolClient } from "pg";
import type { QueryResultRow } from "pg";
import { query } from "../../db/query.js";
import { withTransaction } from "../../db/transactions.js";
import { createPendingVnpayAttempt } from "../payments/payments.repository.js";
import type {
  GroomingAvailabilityDto,
  GroomingBookingPetDto,
  GroomingBookingServiceDto,
  GroomingBookingServicePriceBaseDto,
  GroomingPaymentOption,
  GroomingServiceDto,
  GroomingServicePriceRuleDto,
  GroomingTicketHistoryFilters,
  GroomingTicketCancelledDto,
  GroomingTicketCreatedDto,
  GroomingTicketDetailDto,
  GroomingTicketListFilters,
  GroomingTicketListItemDto,
  GroomingTicketStatus,
  InvoiceStatus
} from "./grooming.types.js";

type GroomingServiceRow = QueryResultRow & {
  service_id: string;
  service_name: string;
  description: string | null;
  estimated_duration_minutes: number | null;
  base_price: string | number;
  price_rule_id: string | null;
  pricing_condition: string | null;
  price_amount: string | number | null;
  effective_from: string | null;
};

type BookingPetRow = QueryResultRow & {
  pet_id: string;
  pet_name: string;
  species: "Dog" | "Cat" | "Other";
  weight_kg: string | number | null;
  profile_image_url: string | null;
};

type BookingServiceRow = QueryResultRow & {
  service_id: string;
  service_name: string;
  description: string | null;
  estimated_duration_minutes: number | null;
  base_price: string | number;
  price_rule_id: string | null;
  pricing_condition: string | null;
  price_amount: string | number | null;
};

type CountRow = QueryResultRow & {
  total: string;
};

type GroomingTicketListRow = QueryResultRow & {
  grooming_ticket_id: string;
  service_name: string;
  pet_name: string;
  species: "Dog" | "Cat" | "Other";
  weight_kg: string | number | null;
  profile_image_url: string | null;
  scheduled_at: string;
  scheduled_date: string;
  scheduled_time: string;
  ticket_status: GroomingTicketStatus;
  payment_option: GroomingPaymentOption | null;
  invoice_status: InvoiceStatus | null;
  invoice_total_amount: string | number | null;
  has_success_payment: boolean;
  special_request: string | null;
  estimated_total: string | number;
};

type GroomingTicketDetailRow = GroomingTicketListRow & {
  pet_id: string;
  invoice_id: string | null;
};

type GroomingTicketItemRow = QueryResultRow & {
  service_id: string;
  service_name: string;
  quantity: number;
  applied_unit_price: string | number;
  line_amount: string | number;
};

type PaymentRow = QueryResultRow & {
  payment_id: string;
  payment_method: string;
  payment_provider: string | null;
  transaction_code: string | null;
  paid_amount: string | number;
  paid_at: string | null;
  payment_status: string;
  receipt_code: string | null;
  receipt_url: string | null;
};

type BookedUnitsRow = QueryResultRow & {
  slot_time: string;
  booked_units: string | number;
};

type CreateBookingInput = {
  ownerUserId: string;
  pet: GroomingBookingPetDto;
  service: GroomingBookingServiceDto;
  scheduledAt: Date;
  specialRequest?: string | null;
  paymentOption: GroomingPaymentOption;
  clientIp: string;
};

const timeZone = "Asia/Ho_Chi_Minh";
const slotStartHour = 8;
const slotEndHour = 17;
const slotEndMinute = 30;

function getPricingConditionLabel(condition: string): string {
  const labels: Record<string, string> = {
    UNDER_5KG: "Dưới 5kg",
    FROM_5KG: "Từ 5kg trở lên"
  };

  return labels[condition] ?? condition;
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function formatPriceRange(priceMin: number, priceMax: number): string {
  if (priceMin === priceMax) {
    return `${formatMoney(priceMin)} VNĐ`;
  }

  return `${formatMoney(priceMin)} - ${formatMoney(priceMax)} VNĐ`;
}

function formatStartingPrice(price: number): string {
  return `Từ ${formatMoney(price)} VNĐ`;
}

function formatDuration(minutes: number | null): string {
  if (minutes === null) return "Chưa cập nhật";
  if (minutes < 60) return `${minutes} phút`;
  if (minutes % 60 === 0) return `${minutes / 60} giờ`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours} giờ ${remainingMinutes} phút`;
}

function createShortId(prefix: string): string {
  return `${prefix}_${randomBytes(10).toString("hex")}`;
}

function createBookingCode(date: Date): string {
  const datePart = toVietnamDateString(date).replaceAll("-", "");

  return `SPA-${datePart}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

function getSpeciesLabel(species: BookingPetRow["species"]): string {
  const labels = {
    Dog: "Chó",
    Cat: "Mèo",
    Other: "Khác"
  } as const;

  return labels[species];
}

function getTicketStatusLabel(status: GroomingTicketStatus): string {
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

function getPaymentMethodLabel(paymentOption: GroomingPaymentOption | null): string {
  if (paymentOption === "online") return "Thanh toán online";
  if (paymentOption === "counter") return "Tại trung tâm";

  return "Chưa cập nhật";
}

function getPaymentStatusLabel(invoiceStatus: InvoiceStatus | null, hasSuccessPayment: boolean): string {
  if (invoiceStatus === "paid" || hasSuccessPayment) return "Đã thanh toán";
  if (invoiceStatus === "refunded") return "Đã hoàn tiền";

  return "Chưa thanh toán";
}

function canCancelTicket(status: GroomingTicketStatus, invoiceStatus: InvoiceStatus | null, hasSuccessPayment: boolean): boolean {
  return status === "pending" && invoiceStatus !== "paid" && !hasSuccessPayment;
}

function mapBookingPet(row: BookingPetRow): GroomingBookingPetDto {
  return {
    petId: row.pet_id,
    petName: row.pet_name,
    species: row.species,
    speciesLabel: getSpeciesLabel(row.species),
    weightKg: row.weight_kg === null ? null : Number(row.weight_kg),
    profileImageUrl: row.profile_image_url
  };
}

function toVietnamDateString(value: Date): string {
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

function mapBookingServicePriceBase(row: BookingServiceRow): GroomingBookingServicePriceBaseDto | null {
  if (!row.pricing_condition || row.price_amount === null) {
    return null;
  }

  return {
    serviceId: row.service_id,
    serviceName: row.service_name,
    description: row.description,
    estimatedDurationMinutes: row.estimated_duration_minutes,
    durationText: formatDuration(row.estimated_duration_minutes),
    basePrice: Number(row.price_amount),
    basePricingCondition: row.pricing_condition,
    basePricingConditionLabel: getPricingConditionLabel(row.pricing_condition)
  };
}

function mapGroomingServices(rows: GroomingServiceRow[]): GroomingServiceDto[] {
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
        priceText: formatPriceRange(basePrice, basePrice),
        priceRules: []
      };

    if (row.price_rule_id && row.pricing_condition && row.price_amount !== null && row.effective_from) {
      const priceRule: GroomingServicePriceRuleDto = {
        priceRuleId: row.price_rule_id,
        pricingCondition: row.pricing_condition,
        pricingConditionLabel: getPricingConditionLabel(row.pricing_condition),
        priceAmount: Number(row.price_amount),
        effectiveFrom: row.effective_from
      };

      service.priceRules.push(priceRule);
    }

    services.set(row.service_id, service);
  }

  return [...services.values()].map((service) => {
    const baseRulePrice = service.priceRules.find((rule) => rule.pricingCondition === "UNDER_5KG")?.priceAmount;
    const priceMin = baseRulePrice ?? service.basePrice;
    const priceMax = Math.max(priceMin, ...service.priceRules.map((rule) => rule.priceAmount));

    return {
      ...service,
      priceMin,
      priceMax,
      priceText: formatStartingPrice(priceMin)
    };
  });
}

function mapGroomingTicketListItem(row: GroomingTicketListRow): GroomingTicketListItemDto {
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

function mapGroomingTicketDetail(
  row: GroomingTicketDetailRow,
  services: GroomingTicketItemRow[],
  payment: PaymentRow | null
): GroomingTicketDetailDto {
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
          paymentProvider: payment.payment_provider,
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

function buildBookedTicketsWhere(filters: GroomingTicketListFilters): { whereSql: string; params: unknown[] } {
  const params: unknown[] = [filters.ownerUserId];
  const conditions = [
    "gt.owner_user_id = $1",
    "gt.ticket_status in ('pending', 'waiting', 'in_progress')"
  ];

  if (filters.search) {
    params.push(`%${filters.search}%`);
    conditions.push(
      `(gt.grooming_ticket_id ilike $${params.length} or p.pet_name ilike $${params.length} or exists (
        select 1
        from pet_center.grooming_ticket_items search_gti
        join pet_center.services search_s on search_s.service_id = search_gti.service_id
        where search_gti.grooming_ticket_id = gt.grooming_ticket_id
          and search_s.service_name ilike $${params.length}
      ))`
    );
  }

  if (filters.petId) {
    params.push(filters.petId);
    conditions.push(`gt.pet_id = $${params.length}`);
  }

  if (filters.status && filters.status !== "all") {
    params.push(filters.status);
    conditions.push(`gt.ticket_status = $${params.length}`);
  }

  if (filters.timeRange === "today") {
    conditions.push(`(gt.scheduled_at at time zone '${timeZone}')::date = (now() at time zone '${timeZone}')::date`);
  } else if (filters.timeRange === "upcoming") {
    conditions.push("gt.scheduled_at >= now()");
  } else if (filters.timeRange === "past") {
    conditions.push("gt.scheduled_at < now()");
  }

  return {
    whereSql: conditions.join(" and "),
    params
  };
}

function buildTicketHistoryWhere(filters: GroomingTicketHistoryFilters): { whereSql: string; params: unknown[] } {
  const params: unknown[] = [filters.ownerUserId];
  const conditions = [
    "gt.owner_user_id = $1",
    "gt.ticket_status in ('completed', 'cancelled')"
  ];

  if (filters.search) {
    params.push(`%${filters.search}%`);
    conditions.push(
      `(gt.grooming_ticket_id ilike $${params.length} or p.pet_name ilike $${params.length} or exists (
        select 1
        from pet_center.grooming_ticket_items search_gti
        join pet_center.services search_s on search_s.service_id = search_gti.service_id
        where search_gti.grooming_ticket_id = gt.grooming_ticket_id
          and search_s.service_name ilike $${params.length}
      ))`
    );
  }

  if (filters.petId) {
    params.push(filters.petId);
    conditions.push(`gt.pet_id = $${params.length}`);
  }

  if (filters.status && filters.status !== "all") {
    params.push(filters.status);
    conditions.push(`gt.ticket_status = $${params.length}`);
  }

  if (filters.timeRange === "today") {
    conditions.push(`(gt.scheduled_at at time zone '${timeZone}')::date = (now() at time zone '${timeZone}')::date`);
  } else if (filters.timeRange === "upcoming") {
    conditions.push("gt.scheduled_at >= now()");
  } else if (filters.timeRange === "past") {
    conditions.push("gt.scheduled_at < now()");
  }

  return {
    whereSql: conditions.join(" and "),
    params
  };
}

const groomingTicketListSelectSql = `
  gt.grooming_ticket_id,
  p.pet_name,
  p.species,
  p.weight_kg,
  p.profile_image_url,
  gt.scheduled_at::text as scheduled_at,
  to_char(gt.scheduled_at at time zone '${timeZone}', 'DD/MM/YYYY') as scheduled_date,
  to_char(gt.scheduled_at at time zone '${timeZone}', 'HH24:MI') as scheduled_time,
  gt.ticket_status,
  inv.payment_option,
  inv.invoice_status,
  inv.total_amount as invoice_total_amount,
  coalesce(pay.has_success_payment, false) as has_success_payment,
  gt.special_request,
  gt.estimated_total,
  coalesce(string_agg(s.service_name, ', ' order by s.service_name), 'Dịch vụ spa') as service_name
`;

const groomingTicketListJoinSql = `
  from pet_center.grooming_tickets gt
  join pet_center.pets p on p.pet_id = gt.pet_id
  join pet_center.grooming_ticket_items gti on gti.grooming_ticket_id = gt.grooming_ticket_id
  join pet_center.services s on s.service_id = gti.service_id
  left join lateral (
    select i.invoice_id, i.payment_option, i.invoice_status, i.total_amount
    from pet_center.invoice_lines il
    join pet_center.invoices i on i.invoice_id = il.invoice_id
    where il.source_type = 'grooming'
      and il.source_id = gt.grooming_ticket_id
    order by i.issued_at desc, i.invoice_id desc
    limit 1
  ) inv on true
  left join lateral (
    select true as has_success_payment
    from pet_center.payments pmt
    where pmt.invoice_id = inv.invoice_id
      and pmt.payment_status = 'success'
    limit 1
  ) pay on true
`;

const groomingTicketListGroupSql = `
  group by
    gt.grooming_ticket_id,
    p.pet_name,
    p.species,
    p.weight_kg,
    p.profile_image_url,
    gt.scheduled_at,
    gt.ticket_status,
    inv.payment_option,
    inv.invoice_status,
    inv.total_amount,
    pay.has_success_payment,
    gt.special_request,
    gt.estimated_total
`;

export async function findActiveGroomingServices(): Promise<GroomingServiceDto[]> {
  const result = await query<GroomingServiceRow>(
    `with latest_price_rules as (
       select distinct on (spr.service_id, spr.pricing_condition)
         spr.price_rule_id,
         spr.service_id,
         spr.pricing_condition,
         spr.price_amount,
         spr.effective_from
       from pet_center.service_price_rules spr
       where spr.price_status = 'active'
         and spr.effective_from <= current_date
       order by spr.service_id, spr.pricing_condition, spr.effective_from desc
     )
     select
       s.service_id,
       s.service_name,
       s.description,
       s.estimated_duration_minutes,
       s.base_price,
       lpr.price_rule_id,
       lpr.pricing_condition,
       lpr.price_amount,
       lpr.effective_from::text as effective_from
     from pet_center.services s
     left join latest_price_rules lpr on lpr.service_id = s.service_id
     where s.service_category = 'grooming'
       and s.service_status = 'active'
     order by
       s.service_id asc,
       case lpr.pricing_condition
         when 'UNDER_5KG' then 1
         when 'FROM_5KG' then 2
         else 3
       end asc,
       lpr.pricing_condition asc`
  );

  return mapGroomingServices(result.rows);
}

export async function findOwnerBookingPets(ownerUserId: string): Promise<GroomingBookingPetDto[]> {
  const result = await query<BookingPetRow>(
    `select p.pet_id, p.pet_name, p.species, p.weight_kg, p.profile_image_url
     from pet_center.pets p
     where p.owner_user_id = $1
       and p.pet_status = 'active'
     order by p.pet_name asc, p.pet_id asc`,
    [ownerUserId]
  );

  return result.rows.map(mapBookingPet);
}

export async function findOwnerBookingPet(ownerUserId: string, petId: string): Promise<GroomingBookingPetDto | null> {
  const result = await query<BookingPetRow>(
    `select p.pet_id, p.pet_name, p.species, p.weight_kg, p.profile_image_url
     from pet_center.pets p
     where p.owner_user_id = $1
       and p.pet_id = $2
       and p.pet_status = 'active'
     limit 1`,
    [ownerUserId, petId]
  );

  return result.rows[0] ? mapBookingPet(result.rows[0]) : null;
}

export async function findBookingServicePriceBases(): Promise<GroomingBookingServicePriceBaseDto[]> {
  const result = await query<BookingServiceRow>(
    `with latest_price_rules as (
       select distinct on (spr.service_id)
         spr.price_rule_id,
         spr.service_id,
         spr.pricing_condition,
         spr.price_amount
       from pet_center.service_price_rules spr
       where spr.price_status = 'active'
         and spr.pricing_condition = 'UNDER_5KG'
         and spr.effective_from <= current_date
       order by spr.service_id, spr.effective_from desc
     )
     select
       s.service_id,
       s.service_name,
       s.description,
       s.estimated_duration_minutes,
       s.base_price,
       lpr.price_rule_id,
       lpr.pricing_condition,
       coalesce(lpr.price_amount, s.base_price) as price_amount
     from pet_center.services s
     left join latest_price_rules lpr on lpr.service_id = s.service_id
     where s.service_category = 'grooming'
       and s.service_status = 'active'
     order by s.service_id asc`
  );

  return result.rows.map((row) =>
    mapBookingServicePriceBase({
      ...row,
      pricing_condition: row.pricing_condition ?? "UNDER_5KG"
    })
  ).filter((service): service is GroomingBookingServicePriceBaseDto => service !== null);
}

export async function findBookingServicePriceBase(serviceId: string): Promise<GroomingBookingServicePriceBaseDto | null> {
  const result = await query<BookingServiceRow>(
    `with latest_price_rule as (
       select spr.price_rule_id, spr.service_id, spr.pricing_condition, spr.price_amount
       from pet_center.service_price_rules spr
       where spr.service_id = $1
         and spr.price_status = 'active'
         and spr.pricing_condition = 'UNDER_5KG'
         and spr.effective_from <= current_date
       order by spr.effective_from desc
       limit 1
     )
     select
       s.service_id,
       s.service_name,
       s.description,
       s.estimated_duration_minutes,
       s.base_price,
       lpr.price_rule_id,
       lpr.pricing_condition,
       coalesce(lpr.price_amount, s.base_price) as price_amount
     from pet_center.services s
     left join latest_price_rule lpr on lpr.service_id = s.service_id
     where s.service_id = $1
       and s.service_category = 'grooming'
       and s.service_status = 'active'
     limit 1`,
    [serviceId]
  );
  const row = result.rows[0];

  if (!row) return null;

  return mapBookingServicePriceBase({
    ...row,
    pricing_condition: row.pricing_condition ?? "UNDER_5KG"
  });
}

export async function findBookedGroomingTickets(
  filters: GroomingTicketListFilters
): Promise<{ tickets: GroomingTicketListItemDto[]; total: number }> {
  const { whereSql, params } = buildBookedTicketsWhere(filters);
  const listParams = [...params, filters.limit, filters.offset];

  const [listResult, countResult] = await Promise.all([
    query<GroomingTicketListRow>(
      `select ${groomingTicketListSelectSql}
       ${groomingTicketListJoinSql}
       where ${whereSql}
       ${groomingTicketListGroupSql}
       order by gt.scheduled_at asc, gt.grooming_ticket_id asc
       limit $${params.length + 1} offset $${params.length + 2}`,
      listParams
    ),
    query<CountRow>(
      `select count(*)::text as total
       from pet_center.grooming_tickets gt
       join pet_center.pets p on p.pet_id = gt.pet_id
       where ${whereSql}`,
      params
    )
  ]);

  return {
    tickets: listResult.rows.map(mapGroomingTicketListItem),
    total: Number(countResult.rows[0]?.total ?? 0)
  };
}

export async function findGroomingTicketHistory(
  filters: GroomingTicketHistoryFilters
): Promise<{ tickets: GroomingTicketListItemDto[]; total: number }> {
  const { whereSql, params } = buildTicketHistoryWhere(filters);
  const listParams = [...params, filters.limit, filters.offset];

  const [listResult, countResult] = await Promise.all([
    query<GroomingTicketListRow>(
      `select ${groomingTicketListSelectSql}
       ${groomingTicketListJoinSql}
       where ${whereSql}
       ${groomingTicketListGroupSql}
       order by gt.scheduled_at desc, gt.grooming_ticket_id desc
       limit $${params.length + 1} offset $${params.length + 2}`,
      listParams
    ),
    query<CountRow>(
      `select count(*)::text as total
       from pet_center.grooming_tickets gt
       join pet_center.pets p on p.pet_id = gt.pet_id
       where ${whereSql}`,
      params
    )
  ]);

  return {
    tickets: listResult.rows.map(mapGroomingTicketListItem),
    total: Number(countResult.rows[0]?.total ?? 0)
  };
}

export async function findBookedGroomingTicketById(
  ownerUserId: string,
  ticketId: string
): Promise<GroomingTicketDetailDto | null> {
  const ticketResult = await query<GroomingTicketDetailRow>(
    `select ${groomingTicketListSelectSql},
       p.pet_id,
       inv.invoice_id
     ${groomingTicketListJoinSql}
     where gt.owner_user_id = $1
       and gt.grooming_ticket_id = $2
       and gt.ticket_status in ('pending', 'waiting', 'in_progress', 'completed', 'cancelled')
     ${groomingTicketListGroupSql},
       p.pet_id,
       inv.invoice_id
     limit 1`,
    [ownerUserId, ticketId]
  );
  const ticket = ticketResult.rows[0];

  if (!ticket) return null;

  const [itemsResult, paymentResult] = await Promise.all([
    query<GroomingTicketItemRow>(
      `select
         s.service_id,
         s.service_name,
         gti.quantity,
         gti.applied_unit_price,
         gti.line_amount
       from pet_center.grooming_ticket_items gti
       join pet_center.services s on s.service_id = gti.service_id
       where gti.grooming_ticket_id = $1
       order by s.service_name asc`,
      [ticketId]
    ),
    ticket.invoice_id
      ? query<PaymentRow>(
          `select
             p.payment_id,
             p.payment_method,
             p.payment_provider,
             p.transaction_code,
             p.paid_amount,
             p.paid_at::text as paid_at,
             p.payment_status,
             p.receipt_code,
             p.receipt_url
           from pet_center.payments p
           where p.invoice_id = $1
             and p.payment_status = 'success'
           order by p.paid_at desc nulls last, p.payment_id desc
           limit 1`,
          [ticket.invoice_id]
        )
      : Promise.resolve({ rows: [] as PaymentRow[] })
  ]);

  return mapGroomingTicketDetail(ticket, itemsResult.rows, paymentResult.rows[0] ?? null);
}

export async function cancelBookedGroomingTicket(ownerUserId: string, ticketId: string): Promise<GroomingTicketCancelledDto | null> {
  const cancelled = await withTransaction(async (client) => {
    const ticketResult = await client.query<QueryResultRow & {
      grooming_ticket_id: string;
      ticket_status: GroomingTicketStatus;
      invoice_id: string | null;
      invoice_status: InvoiceStatus | null;
      has_success_payment: boolean;
    }>(
      `select
         gt.grooming_ticket_id,
         gt.ticket_status,
         inv.invoice_id,
         inv.invoice_status,
         coalesce(pay.has_success_payment, false) as has_success_payment
       from pet_center.grooming_tickets gt
       left join lateral (
         select i.invoice_id, i.invoice_status
         from pet_center.invoice_lines il
         join pet_center.invoices i on i.invoice_id = il.invoice_id
         where il.source_type = 'grooming'
           and il.source_id = gt.grooming_ticket_id
         order by i.issued_at desc, i.invoice_id desc
         limit 1
       ) inv on true
       left join lateral (
         select true as has_success_payment
         from pet_center.payments pmt
         where pmt.invoice_id = inv.invoice_id
           and pmt.payment_status = 'success'
         limit 1
       ) pay on true
       where gt.owner_user_id = $1
         and gt.grooming_ticket_id = $2
       for update of gt`,
      [ownerUserId, ticketId]
    );
    const ticket = ticketResult.rows[0];

    if (!ticket) return null;

    if (ticket.ticket_status !== "pending") {
      throw new Error("GROOMING_TICKET_CANCEL_NOT_ALLOWED");
    }

    if (ticket.invoice_status === "paid" || ticket.has_success_payment) {
      throw new Error("GROOMING_TICKET_PAID_CANCEL_NOT_ALLOWED");
    }

    await client.query(
      `update pet_center.grooming_tickets
       set ticket_status = 'cancelled'
       where owner_user_id = $1
         and grooming_ticket_id = $2`,
      [ownerUserId, ticketId]
    );

    if (ticket.invoice_id) {
      await client.query(
        `update pet_center.invoices
         set invoice_status = 'cancelled'
         where invoice_id = $1
           and invoice_status <> 'paid'`,
        [ticket.invoice_id]
      );
    }

    return {
      groomingTicketId: ticket.grooming_ticket_id,
      bookingCode: ticket.grooming_ticket_id,
      ticketStatus: "cancelled" as const,
      ticketStatusLabel: getTicketStatusLabel("cancelled"),
      invoiceStatus: ticket.invoice_id ? "cancelled" as const : ticket.invoice_status
    };
  });

  return cancelled;
}

export async function countActiveStaff(client?: PoolClient): Promise<number> {
  const sql = `select count(*)::text as total
   from pet_center.users u
   where u.role = 'Staff'
     and u.account_status = 'active'`;
  const result = client ? await client.query<CountRow>(sql) : await query<CountRow>(sql);

  return Number(result.rows[0]?.total ?? 0);
}

export async function findBookedUnitsBySlot(date: string, client?: PoolClient): Promise<Map<string, number>> {
  const sql = `select
     to_char(gt.scheduled_at at time zone $2, 'HH24:MI') as slot_time,
     coalesce(sum(gti.quantity), 0)::text as booked_units
   from pet_center.grooming_tickets gt
   join pet_center.grooming_ticket_items gti on gti.grooming_ticket_id = gt.grooming_ticket_id
   where (gt.scheduled_at at time zone $2)::date = $1::date
     and gt.ticket_status in ('pending_payment', 'pending', 'waiting', 'in_progress', 'completed')
   group by to_char(gt.scheduled_at at time zone $2, 'HH24:MI')`;
  const params = [date, timeZone];
  const result = client
    ? await client.query<BookedUnitsRow>(sql, params)
    : await query<BookedUnitsRow>(sql, params);

  return new Map(result.rows.map((row) => [row.slot_time, Number(row.booked_units)]));
}

export async function getAvailability(date: string): Promise<GroomingAvailabilityDto> {
  const [activeStaffCount, bookedUnitsBySlot] = await Promise.all([
    countActiveStaff(),
    findBookedUnitsBySlot(date)
  ]);
  const capacity = activeStaffCount;
  const slots = [];

  for (let hour = slotStartHour; hour <= slotEndHour; hour += 1) {
    for (const minute of [0, 30]) {
      if (hour === slotEndHour && minute > slotEndMinute) continue;

      const slotTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      const bookedUnits = bookedUnitsBySlot.get(slotTime) ?? 0;
      const availableUnits = Math.max(capacity - bookedUnits, 0);

      slots.push({
        time: slotTime,
        capacity,
        bookedUnits,
        availableUnits,
        available: availableUnits > 0
      });
    }
  }

  return {
    date,
    slots
  };
}

export async function createGroomingBooking(input: CreateBookingInput): Promise<GroomingTicketCreatedDto> {
  return withTransaction(async (client) => {
    await client.query("lock table pet_center.grooming_tickets in share row exclusive mode");

    const activeStaffCount = await countActiveStaff(client);
    const capacity = activeStaffCount;
    const bookedUnitsBySlot = await findBookedUnitsBySlot(toVietnamDateString(input.scheduledAt), client);
    const scheduledSlot = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(input.scheduledAt);
    const bookedUnits = bookedUnitsBySlot.get(scheduledSlot) ?? 0;

    if (capacity <= 0 || bookedUnits >= capacity) {
      throw new Error("GROOMING_SLOT_FULL");
    }

    const groomingTicketId = createBookingCode(input.scheduledAt);
    const groomingTicketItemId = createShortId("gti");
    const invoiceId = createShortId("inv");
    const invoiceLineId = createShortId("inl");
    const ticketStatus: GroomingTicketStatus = input.paymentOption === "online" ? "pending_payment" : "pending";
    const invoiceStatus: InvoiceStatus = "pending_payment";

    await client.query(
      `insert into pet_center.grooming_tickets (
         grooming_ticket_id, pet_id, owner_user_id, created_by_user_id, source_type,
         scheduled_at, special_request, estimated_total, ticket_status
       )
       values ($1, $2, $3, $4, 'online', $5, $6, $7, $8)`,
      [
        groomingTicketId,
        input.pet.petId,
        input.ownerUserId,
        input.ownerUserId,
        input.scheduledAt,
        input.specialRequest ?? null,
        input.service.appliedPrice,
        ticketStatus
      ]
    );

    await client.query(
      `insert into pet_center.grooming_ticket_items (
         grooming_ticket_item_id, grooming_ticket_id, service_id, quantity, applied_unit_price, line_amount
       )
       values ($1, $2, $3, 1, $4, $4)`,
      [groomingTicketItemId, groomingTicketId, input.service.serviceId, input.service.appliedPrice]
    );

    await client.query(
      `insert into pet_center.invoices (
         invoice_id, owner_user_id, pet_id, subtotal_amount, discount_amount, surcharge_amount,
         total_amount, payment_option, invoice_status
       )
       values ($1, $2, $3, $4, 0, 0, $4, $5, $6)`,
      [invoiceId, input.ownerUserId, input.pet.petId, input.service.appliedPrice, input.paymentOption, invoiceStatus]
    );

    await client.query(
      `insert into pet_center.invoice_lines (
         invoice_line_id, invoice_id, service_id, source_type, source_id, description,
         quantity, unit_price, line_discount_amount, line_amount
       )
       values ($1, $2, $3, 'grooming', $4, $5, 1, $6, 0, $6)`,
      [
        invoiceLineId,
        invoiceId,
        input.service.serviceId,
        groomingTicketId,
        input.service.serviceName,
        input.service.appliedPrice
      ]
    );

    const paymentAttempt = input.paymentOption === "online"
      ? await createPendingVnpayAttempt(client, {
          invoiceId,
          amount: input.service.appliedPrice,
          orderInfo: `Thanh toan dich vu spa ${groomingTicketId}`,
          clientIp: input.clientIp
        })
      : null;

    return {
      groomingTicketId,
      bookingCode: groomingTicketId,
      invoiceId,
      paymentAttemptId: paymentAttempt?.paymentAttemptId ?? null,
      paymentOption: input.paymentOption,
      ticketStatus,
      invoiceStatus,
      totalAmount: input.service.appliedPrice,
      paymentUrl: paymentAttempt?.paymentUrl ?? null,
      petName: input.pet.petName,
      serviceName: input.service.serviceName,
      scheduledAt: input.scheduledAt.toISOString()
    };
  });
}
