import type { PoolClient } from "pg";
import type { QueryResultRow } from "pg";
import { query } from "../../db/query.js";
import { withTransaction } from "../../db/transactions.js";
import { createId } from "../../shared/utils/id.js";
import { getMaxConcurrentIntervals } from "../../shared/utils/interval-capacity.js";
import { createPendingVnpayAttempt } from "../payments/payments.repository.js";
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
import * as mapper from "./grooming.mapper.js";

export type GroomingServiceRow = QueryResultRow & {
  service_id: string;
  service_name: string;
  description: string | null;
  estimated_duration_minutes: number | null;
  base_price: string | number;
};

export type BookingPetRow = QueryResultRow & {
  pet_id: string;
  pet_name: string;
  species: "Dog" | "Cat" | "Other";
  weight_kg: string | number | null;
  profile_image_url: string | null;
};

export type StaffCounterPetRow = BookingPetRow & {
  breed: string | null;
  owner_user_id: string;
  owner_name: string;
  owner_phone_number: string | null;
};

export type BookingServiceRow = QueryResultRow & {
  service_id: string;
  service_name: string;
  description: string | null;
  estimated_duration_minutes: number | null;
  base_price: string | number;
};

export type CountRow = QueryResultRow & {
  total: string;
};

export type GroomingTicketListRow = QueryResultRow & {
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

export type GroomingTicketDetailRow = GroomingTicketListRow & {
  pet_id: string;
  invoice_id: string | null;
};

export type GroomingTicketItemRow = QueryResultRow & {
  service_id: string;
  service_name: string;
  quantity: number;
  applied_unit_price: string | number;
  line_amount: string | number;
};

export type PaymentRow = QueryResultRow & {
  payment_id: string;
  payment_method: string;
  transaction_code: string | null;
  paid_amount: string | number;
  paid_at: string | null;
  payment_status: string;
  receipt_code: string | null;
  receipt_url: string | null;
};

type GroomingIntervalRow = QueryResultRow & {
  scheduled_at: Date;
  duration_minutes: number;
};

export type CreateBookingInput = {
  ownerUserId: string;
  createdByUserId?: string;
  sourceType?: "online" | "counter";
  clientIp: string;
  pet: GroomingBookingPetDto;
  service: GroomingBookingServiceDto;
  scheduledAt: Date;
  specialRequest?: string | null;
  paymentOption: GroomingPaymentOption;
};

export type StaffGroomingTicketRow = QueryResultRow & {
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

export type StaffGroomingSummaryRow = QueryResultRow & {
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
        `select
       s.service_id,
       s.service_name,
       s.description,
       s.estimated_duration_minutes,
       s.base_price
     from pet_center.services s
     where s.service_category = 'grooming'
       and s.service_status = 'active'
     order by s.service_id asc`
      );

      return mapper.mapGroomingServices(result.rows);
}

export async function findOwnerBookingPets(ownerUserId: string): Promise<GroomingBookingPetDto[]> {

      const result = await query<BookingPetRow>(
        `select p.pet_id, p.pet_name, p.species, p.weight_kg, p.profile_image_url
     from pet_center.pets p
     where p.owner_user_id = $1
     order by p.pet_name asc, p.pet_id asc`,
        [ownerUserId]
      );

      return result.rows.map(mapper.mapBookingPet);
}

export async function findOwnerBookingPet(ownerUserId: string, petId: string): Promise<GroomingBookingPetDto | null> {

      const result = await query<BookingPetRow>(
        `select p.pet_id, p.pet_name, p.species, p.weight_kg, p.profile_image_url
     from pet_center.pets p
     where p.owner_user_id = $1
       and p.pet_id = $2
     limit 1`,
        [ownerUserId, petId]
      );

      return result.rows[0] ? mapper.mapBookingPet(result.rows[0]) : null;
}

export async function findStaffCounterPets(input: {
  search: string;
  limit: number;
}): Promise<StaffCounterGroomingPetDto[]> {

      const params: Array<string | number> = [];
      const conditions = ["u.account_status = 'active'"];

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

      return result.rows.map(mapper.mapStaffCounterPet);
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
       and u.account_status = 'active'
     limit 1`,
        [petId]
      );

      return result.rows[0] ? mapper.mapStaffCounterPet(result.rows[0]) : null;
}

export async function findBookingServicePriceBases(): Promise<GroomingBookingServicePriceBaseDto[]> {

      const result = await query<BookingServiceRow>(
        `select
       s.service_id,
       s.service_name,
       s.description,
       s.estimated_duration_minutes,
       s.base_price
     from pet_center.services s
     where s.service_category = 'grooming'
       and s.service_status = 'active'
     order by s.service_id asc`
      );

      return result.rows.map(mapper.mapBookingServicePriceBase).filter((service): service is GroomingBookingServicePriceBaseDto => service !== null);
}

export async function findBookingServicePriceBase(serviceId: string): Promise<GroomingBookingServicePriceBaseDto | null> {

      const result = await query<BookingServiceRow>(
        `select
       s.service_id,
       s.service_name,
       s.description,
       s.estimated_duration_minutes,
       s.base_price
     from pet_center.services s
     where s.service_id = $1
       and s.service_category = 'grooming'
       and s.service_status = 'active'
     limit 1`,
        [serviceId]
      );
      const row = result.rows[0];

      if (!row) return null;

      return mapper.mapBookingServicePriceBase(row);
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
        tickets: listResult.rows.map(mapper.mapGroomingTicketListItem),
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
        tickets: listResult.rows.map(mapper.mapGroomingTicketListItem),
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

      return mapper.mapGroomingTicketDetail(ticket, itemsResult.rows, paymentResult.rows[0] ?? null);
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
          ticketStatusLabel: mapper.getTicketStatusLabel("cancelled"),
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

async function listActiveGroomingIntervals(
  rangeStart: Date,
  rangeEnd: Date,
  client?: PoolClient,
): Promise<GroomingIntervalRow[]> {
  const sql = `
    SELECT scheduled_at, duration_minutes
    FROM pet_center.grooming_tickets
    WHERE ticket_status IN ('pending_payment', 'pending', 'waiting', 'in_progress')
      AND scheduled_at < $2
      AND scheduled_at + duration_minutes * interval '1 minute' > $1
  `;
  const params = [rangeStart, rangeEnd];
  const result = client
    ? await client.query<GroomingIntervalRow>(sql, params)
    : await query<GroomingIntervalRow>(sql, params);

  return result.rows;
}

function buildVietnamDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}:00+07:00`);
}

function formatVietnamTime(value: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(value);
}

export async function getAvailability(
  date: string,
  durationMinutes = 30,
): Promise<GroomingAvailabilityDto> {
  const dayStart = buildVietnamDateTime(date, "08:00");
  const dayEnd = buildVietnamDateTime(date, "18:00");
  const [activeStaffCount, intervalRows] = await Promise.all([
    countActiveStaff(),
    listActiveGroomingIntervals(dayStart, dayEnd)
  ]);
  const capacity = activeStaffCount;
  const intervals = intervalRows.map((row) => {
    const start = new Date(row.scheduled_at);
    return {
      start,
      end: new Date(start.getTime() + row.duration_minutes * 60 * 1000),
    };
  });
  const slots = [];

  for (let hour = slotStartHour; hour <= slotEndHour; hour += 1) {
    for (const minute of [0, 30]) {
      if (hour === slotEndHour && minute > slotEndMinute) continue;

      const slotTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      const slotStart = buildVietnamDateTime(date, slotTime);
      const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);
      const bookedUnits = getMaxConcurrentIntervals(intervals, slotStart, slotEnd);
      const availableUnits = slotEnd > dayEnd ? 0 : Math.max(capacity - bookedUnits, 0);

      slots.push({
        time: slotTime,
        label: `${slotTime} - ${formatVietnamTime(slotEnd)}`,
        startAt: slotStart.toISOString(),
        endAt: slotEnd.toISOString(),
        durationMinutes,
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

async function hasOverlappingActiveGroomingForPet(
  client: PoolClient,
  petId: string,
  scheduledAt: Date,
  scheduledEnd: Date,
): Promise<boolean> {
  const result = await client.query<{ exists: boolean }>(
    `select exists (
     select 1
     from pet_center.grooming_tickets gt
     where gt.pet_id = $1
       and gt.ticket_status in ('pending_payment', 'pending', 'waiting', 'in_progress')
       and gt.scheduled_at < $3
       and gt.scheduled_at + gt.duration_minutes * interval '1 minute' > $2
   ) as "exists"`,
    [petId, scheduledAt, scheduledEnd]
  );

  return result.rows[0]?.exists ?? false;
}

export async function createGroomingBooking(input: CreateBookingInput): Promise<GroomingTicketCreatedDto> {
  return withTransaction(async (client) => {
    await client.query("lock table pet_center.grooming_tickets in share row exclusive mode");

    const durationMinutes = input.service.estimatedDurationMinutes ?? 30;
    const scheduledEnd = new Date(input.scheduledAt.getTime() + durationMinutes * 60 * 1000);
    const bookingDate = mapper.toVietnamDateString(input.scheduledAt);
    const closingTime = buildVietnamDateTime(bookingDate, "18:00");
    if (scheduledEnd > closingTime) {
      throw new Error("GROOMING_OUTSIDE_WORKING_HOURS");
    }

    const activeStaffCount = await countActiveStaff(client);
    const capacity = activeStaffCount;
    const intervalRows = await listActiveGroomingIntervals(input.scheduledAt, scheduledEnd, client);
    const intervals = intervalRows.map((row) => {
      const start = new Date(row.scheduled_at);
      return {
        start,
        end: new Date(start.getTime() + row.duration_minutes * 60 * 1000),
      };
    });
    const bookedUnits = getMaxConcurrentIntervals(intervals, input.scheduledAt, scheduledEnd);

        if (capacity <= 0 || bookedUnits >= capacity) {
          throw new Error("GROOMING_SLOT_FULL");
        }

    const petHasOverlappingBooking = await hasOverlappingActiveGroomingForPet(
      client,
      input.pet.petId,
      input.scheduledAt,
      scheduledEnd,
    );

        if (petHasOverlappingBooking) {
          throw new Error("GROOMING_PET_TIME_CONFLICT");
        }

        const groomingTicketId = await createId("spa", client);
        const groomingTicketItemId = await createId("gti", client);
        const invoiceId = await createId("inv", client);
        const invoiceLineId = await createId("inl", client);
        const ticketStatus: GroomingTicketStatus = input.paymentOption === "online" ? "pending_payment" : "pending";
        const invoiceStatus: InvoiceStatus = "pending_payment";
        const createdByUserId = input.createdByUserId ?? input.ownerUserId;
        const sourceType = input.sourceType ?? "online";

        await client.query(
          `insert into pet_center.grooming_tickets (
         grooming_ticket_id, pet_id, owner_user_id, created_by_user_id, source_type,
         scheduled_at, duration_minutes, special_request, estimated_total, ticket_status
       )
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            groomingTicketId,
            input.pet.petId,
            input.ownerUserId,
            createdByUserId,
            sourceType,
            input.scheduledAt,
            durationMinutes,
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

export async function listStaffGroomingTickets(input: {
  status: StaffGroomingTicketStatusFilter;
  serviceId: string;
  species: "all" | "Dog" | "Cat" | "Other";
  timeRange: "all" | "today" | "upcoming" | "past";
  search: string;
  page: number;
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
      const countParams = [...params];
      const offset = (input.page - 1) * input.limit;
      params.push(input.limit, offset);

      const [summaryResult, countResult, ticketsResult] = await Promise.all([
        query<StaffGroomingSummaryRow>(
          `select
         count(*)::text as total,
         count(*) filter (where ticket_status = 'pending')::text as waiting_accept,
         count(*) filter (where ticket_status in ('waiting', 'in_progress'))::text as accepted,
         count(*) filter (where ticket_status = 'completed')::text as completed,
         count(*) filter (where ticket_status = 'cancelled')::text as cancelled
       from pet_center.grooming_tickets`
        ),
        query<CountRow>(
          `select count(distinct gt.grooming_ticket_id)::text as total
       from pet_center.grooming_tickets gt
       join pet_center.pets p on p.pet_id = gt.pet_id
       join pet_center.users u on u.user_id = gt.owner_user_id
       join pet_center.grooming_ticket_items gti on gti.grooming_ticket_id = gt.grooming_ticket_id
       join pet_center.services s on s.service_id = gti.service_id
       ${whereClause}`,
          countParams
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
       limit $${params.length - 1} offset $${params.length}`,
          params
        )
      ]);
      const summaryRow = summaryResult.rows[0];
      const total = Number(countResult.rows[0]?.total ?? 0);

      return {
        summary: {
          total: Number(summaryRow?.total ?? 0),
          waitingAccept: Number(summaryRow?.waiting_accept ?? 0),
          accepted: Number(summaryRow?.accepted ?? 0),
          completed: Number(summaryRow?.completed ?? 0),
          cancelled: Number(summaryRow?.cancelled ?? 0)
        },
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages: Math.ceil(total / input.limit)
        },
        tickets: ticketsResult.rows.map(mapper.mapStaffGroomingTicket)
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

export async function findGroomingTicketScheduledAt(ticketId: string): Promise<Date | null> {
      const result = await query<{ scheduled_at: Date }>(
        `select scheduled_at
     from pet_center.grooming_tickets
     where grooming_ticket_id = $1
     limit 1`,
        [ticketId]
      );

      return result.rows[0]?.scheduled_at ?? null;
}

export async function autoCancelOverdueGroomingTickets(): Promise<number> {
      return withTransaction(async (client) => {
        const cancelledResult = await client.query<{ grooming_ticket_id: string }>(
          `update pet_center.grooming_tickets
       set ticket_status = 'cancelled'
       where ticket_status = 'pending'
         and now() >= scheduled_at + interval '30 minutes'
       returning grooming_ticket_id`
        );

        const cancelledTicketIds = cancelledResult.rows.map((row) => row.grooming_ticket_id);

        if (cancelledTicketIds.length > 0) {
          await client.query(
            `update pet_center.invoices i
         set invoice_status = 'cancelled'
         where i.invoice_status <> 'paid'
           and exists (
             select 1
             from pet_center.invoice_lines il
             where il.invoice_id = i.invoice_id
               and il.source_type = 'grooming'
               and il.source_id = any($1::varchar[])
           )`,
            [cancelledTicketIds]
          );
        }

        return cancelledResult.rowCount ?? 0;
      });
}

export async function updateGroomingTicketStatus(
  ticketId: string,
  status: Extract<GroomingTicketStatus, "waiting" | "in_progress" | "completed" | "cancelled">
): Promise<StaffGroomingTicketDto | null> {

      const result = await query<StaffGroomingTicketRow>(
        `with updated_ticket as (
       update pet_center.grooming_tickets
       set
         ticket_status = $2::varchar,
         received_at = case
           when $2::varchar = 'in_progress' and received_at is null then now()
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

      return result.rows[0] ? mapper.mapStaffGroomingTicket(result.rows[0]) : null;
}
