import type { QueryResultRow } from "pg";
import { query } from "../../db/query.js";
import type { StaffDashboardAppointmentTaskDto, StaffDashboardTaskSource } from "./dashboard.types.js";

type CountRow = QueryResultRow & {
  total: string;
};

type RoomCapacityRow = QueryResultRow & {
  total_rooms: string;
  occupied_rooms: string;
};

type AppointmentTaskRow = QueryResultRow & {
  task_id: string;
  code: string;
  source_type: StaffDashboardTaskSource;
  pet_name: string;
  species: "Dog" | "Cat" | "Other";
  breed: string | null;
  estimated_age: string | number | null;
  owner_name: string;
  scheduled_at: Date;
  type_label: string;
};

function getSpeciesLabel(species: AppointmentTaskRow["species"]): string {
  const labels = {
    Dog: "Chó",
    Cat: "Mèo",
    Other: "Khác"
  } as const;

  return labels[species];
}

function formatAge(estimatedAge: AppointmentTaskRow["estimated_age"]): string | null {
  if (estimatedAge === null) return null;

  const age = Number(estimatedAge);

  if (!Number.isFinite(age)) return null;
  if (Number.isInteger(age)) return `${age} tuổi`;

  return `${age.toFixed(1)} tuổi`;
}

function getPetDescription(row: AppointmentTaskRow): string {
  const breed = row.breed ?? getSpeciesLabel(row.species);
  const age = formatAge(row.estimated_age);

  return age ? `${breed} • ${age}` : breed;
}

function mapAppointmentTask(row: AppointmentTaskRow): StaffDashboardAppointmentTaskDto {
  return {
    taskId: row.task_id,
    code: row.code,
    sourceType: row.source_type,
    petName: row.pet_name,
    petDescription: getPetDescription(row),
    ownerName: row.owner_name,
    scheduledAt: row.scheduled_at.toISOString(),
    typeLabel: row.type_label,
    status: "pending",
    statusLabel: "Chờ xác nhận"
  };
}

export async function countPendingMedicalAppointments(): Promise<number> {
  const result = await query<CountRow>(
    `select count(*)::text as total
     from pet_center.medical_appointments ma
     where ma.appointment_status = 'pending'`
  );

  return Number(result.rows[0]?.total ?? 0);
}

export async function countPendingGroomingTickets(): Promise<number> {
  const result = await query<CountRow>(
    `select count(*)::text as total
     from pet_center.grooming_tickets gt
     where gt.ticket_status = 'pending'`
  );

  return Number(result.rows[0]?.total ?? 0);
}

export async function getRoomCapacitySnapshot(): Promise<{ availableRooms: number; totalRooms: number }> {
  const result = await query<RoomCapacityRow>(
    `with total_capacity as (
       select coalesce(sum(rt.capacity), 0)::text as total_rooms
       from pet_center.room_types rt
       where rt.room_type_status = 'active'
     ),
     occupied_capacity as (
       select count(*)::text as occupied_rooms
       from pet_center.boarding_records br
       where br.boarding_status in ('confirmed', 'staying')
         and br.planned_check_in_date <= current_date
         and br.planned_check_out_date > current_date
     )
     select total_capacity.total_rooms, occupied_capacity.occupied_rooms
     from total_capacity
     cross join occupied_capacity`
  );
  const totalRooms = Number(result.rows[0]?.total_rooms ?? 0);
  const occupiedRooms = Number(result.rows[0]?.occupied_rooms ?? 0);

  return {
    availableRooms: Math.max(totalRooms - occupiedRooms, 0),
    totalRooms
  };
}

export async function countTodayInvoices(): Promise<number> {
  const result = await query<CountRow>(
    `select count(*)::text as total
     from pet_center.invoices i
     where i.issued_at = current_date
       and i.invoice_status <> 'cancelled'`
  );

  return Number(result.rows[0]?.total ?? 0);
}

export async function findPendingAppointmentTasks(limit: number): Promise<StaffDashboardAppointmentTaskDto[]> {
  const result = await query<AppointmentTaskRow>(
    `with medical_tasks as (
       select
         ma.appointment_id as task_id,
         ma.appointment_id as code,
         'medical'::text as source_type,
         p.pet_name,
         p.species,
         p.breed,
         p.estimated_age,
         owner.full_name as owner_name,
         ma.scheduled_at,
         et.type_name as type_label
       from pet_center.medical_appointments ma
       join pet_center.pets p on p.pet_id = ma.pet_id
       join pet_center.users owner on owner.user_id = ma.owner_user_id
       join pet_center.exam_types et on et.exam_type_id = ma.exam_type_id
       where ma.appointment_status = 'pending'
     ),
     grooming_tasks as (
       select
         gt.grooming_ticket_id as task_id,
         gt.grooming_ticket_id as code,
         'grooming'::text as source_type,
         p.pet_name,
         p.species,
         p.breed,
         p.estimated_age,
         owner.full_name as owner_name,
         gt.scheduled_at,
         coalesce(string_agg(s.service_name, ', ' order by s.service_name), 'Dịch vụ spa') as type_label
       from pet_center.grooming_tickets gt
       join pet_center.pets p on p.pet_id = gt.pet_id
       join pet_center.users owner on owner.user_id = gt.owner_user_id
       left join pet_center.grooming_ticket_items gti on gti.grooming_ticket_id = gt.grooming_ticket_id
       left join pet_center.services s on s.service_id = gti.service_id
       where gt.ticket_status = 'pending'
       group by gt.grooming_ticket_id, p.pet_id, owner.user_id
     )
     select *
     from (
       select * from medical_tasks
       union all
       select * from grooming_tasks
     ) tasks
     order by
       case when scheduled_at >= now() then 0 else 1 end asc,
       case when scheduled_at >= now() then scheduled_at end asc,
       case when scheduled_at < now() then scheduled_at end desc,
       code asc
     limit $1`,
    [limit]
  );

  return result.rows.map(mapAppointmentTask);
}
