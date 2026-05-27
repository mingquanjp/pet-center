import { randomBytes } from "node:crypto";
import type { PoolClient } from "pg";
import type { QueryResultRow } from "pg";
import { query } from "../../db/query.js";
import { withTransaction } from "../../db/transactions.js";
import type {
  GroomingAvailabilityDto,
  GroomingBookingPetDto,
  GroomingBookingServiceDto,
  GroomingPaymentOption,
  GroomingServiceDto,
  GroomingServicePriceRuleDto,
  GroomingTicketCreatedDto,
  GroomingTicketStatus,
  InvoiceStatus,
  StaffCounterGroomingPetDto,
  StaffGroomingTicketDto,
  StaffGroomingTicketListDto,
  StaffGroomingTicketStatusFilter,
  StaffGroomingTicketStatusTone
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

type StaffCounterPetRow = BookingPetRow & {
  breed: string | null;
  owner_user_id: string;
  owner_name: string;
  owner_phone_number: string | null;
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

type BookedUnitsRow = QueryResultRow & {
  hour: string | number;
  booked_units: string | number;
};

type CreateBookingInput = {
  ownerUserId: string;
  createdByUserId?: string;
  sourceType?: "online" | "counter";
  pet: GroomingBookingPetDto;
  service: GroomingBookingServiceDto;
  scheduledAt: Date;
  specialRequest?: string | null;
  paymentOption: GroomingPaymentOption;
};

type StaffGroomingTicketRow = QueryResultRow & {
  grooming_ticket_id: string;
  pet_name: string;
  species: "Dog" | "Cat" | "Other";
  breed: string | null;
  owner_name: string;
  service_name: string;
  service_names: string | null;
  service_count: string | number;
  scheduled_at: Date;
  source_type: "online" | "counter";
  payment_option: GroomingPaymentOption | null;
  invoice_status: InvoiceStatus | null;
  special_request: string | null;
  estimated_total: string | number;
  ticket_status: GroomingTicketStatus;
};

type StaffGroomingSummaryRow = QueryResultRow & {
  total: string;
  waiting_accept: string;
  accepted: string;
  completed: string;
  cancelled: string;
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

function mapStaffCounterPet(row: StaffCounterPetRow): StaffCounterGroomingPetDto {
  return {
    ...mapBookingPet(row),
    breed: row.breed,
    ownerUserId: row.owner_user_id,
    ownerName: row.owner_name,
    ownerPhoneNumber: row.owner_phone_number
  };
}

function getStaffTicketStatusLabel(status: GroomingTicketStatus): string {
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

function getStaffTicketStatusTone(status: GroomingTicketStatus): StaffGroomingTicketStatusTone {
  const tones: Record<GroomingTicketStatus, StaffGroomingTicketStatusTone> = {
    pending_payment: "payment",
    pending: "pending",
    waiting: "accepted",
    in_progress: "accepted",
    completed: "completed",
    cancelled: "cancelled"
  };

  return tones[status];
}

function getSourceLabel(sourceType: StaffGroomingTicketRow["source_type"]): string {
  return sourceType === "counter" ? "Tại quầy" : "Online";
}

function getPaymentMethodLabel(paymentOption: GroomingPaymentOption | null, sourceType: StaffGroomingTicketRow["source_type"]): string {
  if (paymentOption === "counter") return "Tại quầy";
  if (paymentOption === "online") return "Online";

  return getSourceLabel(sourceType);
}

function mapStaffGroomingTicket(row: StaffGroomingTicketRow): StaffGroomingTicketDto {
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
    paymentMethodLabel: getPaymentMethodLabel(row.payment_option, row.source_type),
    paymentStatusLabel: isPaid ? "Đã TT" : "Chưa TT",
    paymentStatusTone: isPaid ? "paid" : "pending",
    specialRequest: row.special_request,
    totalAmount: Number(row.estimated_total),
    totalAmountText: `${formatMoney(Number(row.estimated_total))} VNĐ`,
    status,
    statusLabel: getStaffTicketStatusLabel(status),
    statusTone: getStaffTicketStatusTone(status),
    canAccept: status === "pending",
    canComplete: status === "waiting" || status === "in_progress",
    canCancel: status === "pending" || status === "waiting" || status === "in_progress"
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

function mapBookingService(row: BookingServiceRow): GroomingBookingServiceDto | null {
  if (!row.pricing_condition || row.price_amount === null) {
    return null;
  }

  const appliedPrice = Number(row.price_amount);

  return {
    serviceId: row.service_id,
    serviceName: row.service_name,
    description: row.description,
    estimatedDurationMinutes: row.estimated_duration_minutes,
    durationText: formatDuration(row.estimated_duration_minutes),
    appliedPrice,
    appliedPricingCondition: row.pricing_condition,
    appliedPricingConditionLabel: getPricingConditionLabel(row.pricing_condition),
    priceText: `${formatMoney(appliedPrice)} VNĐ`
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
    const priceAmounts = service.priceRules.map((rule) => rule.priceAmount);
    const prices = priceAmounts.length > 0 ? priceAmounts : [service.basePrice];
    const priceMin = Math.min(...prices);
    const priceMax = Math.max(...prices);

    return {
      ...service,
      priceMin,
      priceMax,
      priceText: formatPriceRange(priceMin, priceMax)
    };
  });
}

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

export async function findStaffCounterPets(input: {
  search: string;
  limit: number;
}): Promise<StaffCounterGroomingPetDto[]> {
  const params: Array<string | number> = [];
  const conditions = ["p.pet_status = 'active'", "u.account_status = 'active'"];

  if (input.search) {
    params.push(`%${input.search.toLowerCase()}%`);
    conditions.push(`(
      lower(p.pet_id) like $${params.length}
      or lower(p.pet_name) like $${params.length}
      or lower(coalesce(p.breed, '')) like $${params.length}
      or lower(u.full_name) like $${params.length}
      or lower(coalesce(u.phone_number, '')) like $${params.length}
    )`);
  }

  params.push(input.limit);

  const result = await query<StaffCounterPetRow>(
    `select
       p.pet_id,
       p.pet_name,
       p.species,
       p.breed,
       p.weight_kg,
       p.profile_image_url,
       u.user_id as owner_user_id,
       u.full_name as owner_name,
       u.phone_number as owner_phone_number
     from pet_center.pets p
     join pet_center.users u on u.user_id = p.owner_user_id
     where ${conditions.join(" and ")}
     order by p.pet_name asc, p.pet_id asc
     limit $${params.length}`,
    params
  );

  return result.rows.map(mapStaffCounterPet);
}

export async function findStaffCounterPet(petId: string): Promise<StaffCounterGroomingPetDto | null> {
  const result = await query<StaffCounterPetRow>(
    `select
       p.pet_id,
       p.pet_name,
       p.species,
       p.breed,
       p.weight_kg,
       p.profile_image_url,
       u.user_id as owner_user_id,
       u.full_name as owner_name,
       u.phone_number as owner_phone_number
     from pet_center.pets p
     join pet_center.users u on u.user_id = p.owner_user_id
     where p.pet_id = $1
       and p.pet_status = 'active'
       and u.account_status = 'active'
     limit 1`,
    [petId]
  );

  return result.rows[0] ? mapStaffCounterPet(result.rows[0]) : null;
}

export async function findBookingServicesForCondition(pricingCondition: string): Promise<GroomingBookingServiceDto[]> {
  const result = await query<BookingServiceRow>(
    `with latest_price_rules as (
       select distinct on (spr.service_id)
         spr.price_rule_id,
         spr.service_id,
         spr.pricing_condition,
         spr.price_amount
       from pet_center.service_price_rules spr
       where spr.price_status = 'active'
         and spr.pricing_condition = $1
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
       lpr.price_amount
     from pet_center.services s
     left join latest_price_rules lpr on lpr.service_id = s.service_id
     where s.service_category = 'grooming'
       and s.service_status = 'active'
     order by s.service_id asc`,
    [pricingCondition]
  );

  return result.rows.map(mapBookingService).filter((service): service is GroomingBookingServiceDto => service !== null);
}

export async function findBookingServiceForCondition(
  serviceId: string,
  pricingCondition: string,
  client?: PoolClient
): Promise<GroomingBookingServiceDto | null> {
  const sql = `with latest_price_rule as (
     select spr.price_rule_id, spr.service_id, spr.pricing_condition, spr.price_amount
     from pet_center.service_price_rules spr
     where spr.service_id = $1
       and spr.price_status = 'active'
       and spr.pricing_condition = $2
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
     lpr.price_amount
   from pet_center.services s
   left join latest_price_rule lpr on lpr.service_id = s.service_id
   where s.service_id = $1
     and s.service_category = 'grooming'
     and s.service_status = 'active'
   limit 1`;
  const params = [serviceId, pricingCondition];
  const result = client
    ? await client.query<BookingServiceRow>(sql, params)
    : await query<BookingServiceRow>(sql, params);

  return result.rows[0] ? mapBookingService(result.rows[0]) : null;
}

export async function countActiveStaff(client?: PoolClient): Promise<number> {
  const sql = `select count(*)::text as total
   from pet_center.users u
   where u.role = 'Staff'
     and u.account_status = 'active'`;
  const result = client ? await client.query<CountRow>(sql) : await query<CountRow>(sql);

  return Number(result.rows[0]?.total ?? 0);
}

export async function findBookedUnitsByHour(date: string, client?: PoolClient): Promise<Map<number, number>> {
  const sql = `select
     extract(hour from gt.scheduled_at at time zone $2)::int as hour,
     coalesce(sum(gti.quantity), 0)::text as booked_units
   from pet_center.grooming_tickets gt
   join pet_center.grooming_ticket_items gti on gti.grooming_ticket_id = gt.grooming_ticket_id
   where (gt.scheduled_at at time zone $2)::date = $1::date
     and gt.ticket_status in ('pending', 'waiting', 'in_progress', 'completed')
   group by extract(hour from gt.scheduled_at at time zone $2)::int`;
  const params = [date, timeZone];
  const result = client
    ? await client.query<BookedUnitsRow>(sql, params)
    : await query<BookedUnitsRow>(sql, params);

  return new Map(result.rows.map((row) => [Number(row.hour), Number(row.booked_units)]));
}

export async function getAvailability(date: string): Promise<GroomingAvailabilityDto> {
  const [activeStaffCount, bookedUnitsByHour] = await Promise.all([
    countActiveStaff(),
    findBookedUnitsByHour(date)
  ]);
  const capacity = activeStaffCount * 2;
  const slots = [];

  for (let hour = slotStartHour; hour <= slotEndHour; hour += 1) {
    for (const minute of [0, 30]) {
      if (hour === slotEndHour && minute > slotEndMinute) continue;

      const bookedUnits = bookedUnitsByHour.get(hour) ?? 0;
      const availableUnits = Math.max(capacity - bookedUnits, 0);

      slots.push({
        time: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
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
    const capacity = activeStaffCount * 2;
    const bookedUnitsByHour = await findBookedUnitsByHour(toVietnamDateString(input.scheduledAt), client);
    const scheduledHour = Number(
      new Intl.DateTimeFormat("en-US", { timeZone, hour: "2-digit", hour12: false }).format(input.scheduledAt)
    );
    const bookedUnits = bookedUnitsByHour.get(scheduledHour) ?? 0;

    if (capacity <= 0 || bookedUnits >= capacity) {
      throw new Error("GROOMING_SLOT_FULL");
    }

    const groomingTicketId = createBookingCode(input.scheduledAt);
    const groomingTicketItemId = createShortId("gti");
    const invoiceId = createShortId("inv");
    const invoiceLineId = createShortId("inl");
    const ticketStatus: GroomingTicketStatus = input.paymentOption === "online" ? "pending_payment" : "pending";
    const invoiceStatus: InvoiceStatus = "pending_payment";
    const createdByUserId = input.createdByUserId ?? input.ownerUserId;
    const sourceType = input.sourceType ?? "online";

    await client.query(
      `insert into pet_center.grooming_tickets (
         grooming_ticket_id, pet_id, owner_user_id, created_by_user_id, source_type,
         scheduled_at, special_request, estimated_total, ticket_status
       )
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        groomingTicketId,
        input.pet.petId,
        input.ownerUserId,
        createdByUserId,
        sourceType,
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

    return {
      groomingTicketId,
      bookingCode: groomingTicketId,
      invoiceId,
      paymentOption: input.paymentOption,
      ticketStatus,
      invoiceStatus,
      totalAmount: input.service.appliedPrice,
      paymentUrl: null,
      petName: input.pet.petName,
      serviceName: input.service.serviceName,
      scheduledAt: input.scheduledAt.toISOString()
    };
  });
}

export async function listStaffGroomingTickets(input: {
  status: StaffGroomingTicketStatusFilter;
  serviceId: string;
  species: "all" | "Dog" | "Cat" | "Other";
  timeRange: "all" | "today" | "upcoming" | "past";
  search: string;
  limit: number;
}): Promise<StaffGroomingTicketListDto> {
  const conditions = [];
  const params: Array<string | number> = [];

  if (input.status === "waiting") {
    conditions.push("gt.ticket_status in ('waiting', 'in_progress')");
  } else if (input.status !== "all") {
    params.push(input.status);
    conditions.push(`gt.ticket_status = $${params.length}`);
  }

  if (input.serviceId !== "all") {
    params.push(input.serviceId);
    conditions.push(`exists (
      select 1
      from pet_center.grooming_ticket_items filter_gti
      where filter_gti.grooming_ticket_id = gt.grooming_ticket_id
        and filter_gti.service_id = $${params.length}
    )`);
  }

  if (input.species !== "all") {
    params.push(input.species);
    conditions.push(`p.species = $${params.length}`);
  }

  if (input.timeRange === "today") {
    conditions.push(`(gt.scheduled_at at time zone '${timeZone}')::date = (now() at time zone '${timeZone}')::date`);
  } else if (input.timeRange === "upcoming") {
    conditions.push(`(gt.scheduled_at at time zone '${timeZone}')::date > (now() at time zone '${timeZone}')::date`);
  } else if (input.timeRange === "past") {
    conditions.push(`(gt.scheduled_at at time zone '${timeZone}')::date < (now() at time zone '${timeZone}')::date`);
  }

  if (input.search) {
    params.push(`%${input.search.toLowerCase()}%`);
    conditions.push(`(
      lower(gt.grooming_ticket_id) like $${params.length}
      or lower(p.pet_name) like $${params.length}
      or lower(u.full_name) like $${params.length}
      or lower(s.service_name) like $${params.length}
    )`);
  }

  const whereClause = conditions.length > 0 ? `where ${conditions.join(" and ")}` : "";
  const orderByClause =
    input.status === "all"
      ? `gt.scheduled_at desc,
         case gt.ticket_status
           when 'pending' then 1
           when 'waiting' then 2
           when 'in_progress' then 3
           when 'pending_payment' then 4
           when 'completed' then 5
           else 6
         end asc`
      : `case gt.ticket_status
           when 'pending' then 1
           when 'waiting' then 2
           when 'in_progress' then 3
           when 'pending_payment' then 4
           when 'completed' then 5
           else 6
         end asc,
         gt.scheduled_at asc`;
  params.push(input.limit);

  const [summaryResult, ticketsResult] = await Promise.all([
    query<StaffGroomingSummaryRow>(
      `select
         count(*)::text as total,
         count(*) filter (where ticket_status = 'pending')::text as waiting_accept,
         count(*) filter (where ticket_status in ('waiting', 'in_progress'))::text as accepted,
         count(*) filter (where ticket_status = 'completed')::text as completed,
         count(*) filter (where ticket_status = 'cancelled')::text as cancelled
       from pet_center.grooming_tickets`
    ),
    query<StaffGroomingTicketRow>(
      `select
         gt.grooming_ticket_id,
         p.pet_name,
         p.species,
         p.breed,
         u.full_name as owner_name,
         min(s.service_name) as service_name,
         string_agg(distinct s.service_name, ', ' order by s.service_name asc) as service_names,
         count(distinct gti.grooming_ticket_item_id)::text as service_count,
         gt.scheduled_at,
         gt.source_type,
         i.payment_option,
         i.invoice_status,
         gt.special_request,
         gt.estimated_total,
         gt.ticket_status
       from pet_center.grooming_tickets gt
       join pet_center.pets p on p.pet_id = gt.pet_id
       join pet_center.users u on u.user_id = gt.owner_user_id
       join pet_center.grooming_ticket_items gti on gti.grooming_ticket_id = gt.grooming_ticket_id
       join pet_center.services s on s.service_id = gti.service_id
       left join pet_center.invoice_lines il on il.source_type = 'grooming' and il.source_id = gt.grooming_ticket_id
       left join pet_center.invoices i on i.invoice_id = il.invoice_id
       ${whereClause}
       group by
         gt.grooming_ticket_id,
         p.pet_name,
         p.species,
         p.breed,
         u.full_name,
         gt.scheduled_at,
         gt.source_type,
         i.payment_option,
         i.invoice_status,
         gt.special_request,
         gt.estimated_total,
         gt.ticket_status
       order by
         ${orderByClause}
       limit $${params.length}`,
      params
    )
  ]);
  const summaryRow = summaryResult.rows[0];

  return {
    summary: {
      total: Number(summaryRow?.total ?? 0),
      waitingAccept: Number(summaryRow?.waiting_accept ?? 0),
      accepted: Number(summaryRow?.accepted ?? 0),
      completed: Number(summaryRow?.completed ?? 0),
      cancelled: Number(summaryRow?.cancelled ?? 0)
    },
    tickets: ticketsResult.rows.map(mapStaffGroomingTicket)
  };
}

export async function findGroomingTicketStatus(ticketId: string): Promise<GroomingTicketStatus | null> {
  const result = await query<{ ticket_status: GroomingTicketStatus }>(
    `select ticket_status
     from pet_center.grooming_tickets
     where grooming_ticket_id = $1
     limit 1`,
    [ticketId]
  );

  return result.rows[0]?.ticket_status ?? null;
}

export async function updateGroomingTicketStatus(
  ticketId: string,
  status: Extract<GroomingTicketStatus, "waiting" | "completed" | "cancelled">
): Promise<StaffGroomingTicketDto | null> {
  const result = await query<StaffGroomingTicketRow>(
    `with updated_ticket as (
       update pet_center.grooming_tickets
       set
         ticket_status = $2::varchar,
         received_at = case
           when $2::varchar = 'waiting' and received_at is null then now()
           else received_at
         end
       where grooming_ticket_id = $1
       returning *
     )
     select
       gt.grooming_ticket_id,
       p.pet_name,
       p.species,
       p.breed,
       u.full_name as owner_name,
       min(s.service_name) as service_name,
       string_agg(distinct s.service_name, ', ' order by s.service_name asc) as service_names,
       count(distinct gti.grooming_ticket_item_id)::text as service_count,
       gt.scheduled_at,
       gt.source_type,
       i.payment_option,
       i.invoice_status,
       gt.special_request,
       gt.estimated_total,
       gt.ticket_status
     from updated_ticket gt
     join pet_center.pets p on p.pet_id = gt.pet_id
     join pet_center.users u on u.user_id = gt.owner_user_id
     join pet_center.grooming_ticket_items gti on gti.grooming_ticket_id = gt.grooming_ticket_id
     join pet_center.services s on s.service_id = gti.service_id
     left join pet_center.invoice_lines il on il.source_type = 'grooming' and il.source_id = gt.grooming_ticket_id
     left join pet_center.invoices i on i.invoice_id = il.invoice_id
     group by
       gt.grooming_ticket_id,
       p.pet_name,
       p.species,
       p.breed,
       u.full_name,
       gt.scheduled_at,
       gt.source_type,
       i.payment_option,
       i.invoice_status,
       gt.special_request,
       gt.estimated_total,
       gt.ticket_status`,
    [ticketId, status]
  );

  return result.rows[0] ? mapStaffGroomingTicket(result.rows[0]) : null;
}
