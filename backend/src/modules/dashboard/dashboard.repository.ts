import type { QueryResultRow } from "pg";
import { query } from "../../db/query.js";
import type {
  OwnerDashboardActivity,
  OwnerDashboardAppointment,
  OwnerDashboardDto,
  OwnerDashboardPet,
  OwnerDashboardReminder,
} from "./dashboard.types.js";

type CountRow = QueryResultRow & {
  total: string;
};

type PetRow = QueryResultRow & {
  pet_id: string;
  pet_name: string;
  species: "Dog" | "Cat" | "Other";
  breed: string | null;
  birth_date: string | null;
  estimated_age: string | number | null;
  profile_image_url: string | null;
  pet_status: "active" | "inactive" | "deceased";
  has_active_boarding: boolean;
  needs_attention: boolean;
};

type AppointmentRow = QueryResultRow & {
  appointment_id: string;
  pet_id: string;
  pet_name: string;
  type_name: string;
  scheduled_at: string;
  appointment_status: OwnerDashboardAppointment["appointmentStatus"];
};

type ActivityRow = QueryResultRow & {
  activity_log_id: string;
  pet_id: string;
  pet_name: string;
  activity_category: OwnerDashboardActivity["activityCategory"];
  activity_type: string;
  activity_status: OwnerDashboardActivity["activityStatus"];
  title: string;
  summary: string | null;
  occurred_at: string;
  source_type: string;
  source_id: string;
};

type ReminderRow = QueryResultRow & {
  id: string;
  pet_id: string;
  pet_name: string;
  title: string;
  due_date: string;
  tone: OwnerDashboardReminder["tone"];
};

function toNumber(value: string | number | null): number | null {
  if (value === null) return null;
  return Number(value);
}

function getSpeciesLabel(species: PetRow["species"]): string {
  const labels = {
    Dog: "Chó",
    Cat: "Mèo",
    Other: "Khác",
  } as const;

  return labels[species];
}

function getAgeLabel(row: PetRow): string {
  if (row.birth_date) {
    const birthDate = new Date(row.birth_date);
    const now = new Date();
    let years = now.getFullYear() - birthDate.getFullYear();
    const hasHadBirthday =
      now.getMonth() > birthDate.getMonth() ||
      (now.getMonth() === birthDate.getMonth() && now.getDate() >= birthDate.getDate());

    if (!hasHadBirthday) years -= 1;

    return years > 0 ? `${years} năm tuổi` : "Dưới 1 năm tuổi";
  }

  const estimatedAge = toNumber(row.estimated_age);

  if (estimatedAge === null) return "Chưa cập nhật";
  if (estimatedAge < 1) return "Dưới 1 năm tuổi";

  return `${Math.floor(estimatedAge)} năm tuổi`;
}

function getDisplayStatus(row: PetRow): OwnerDashboardPet["displayStatus"] {
  if (row.pet_status === "inactive") return "inactive";
  if (row.pet_status === "deceased") return "deceased";
  if (row.has_active_boarding) return "boarding";
  if (row.needs_attention) return "watching";

  return "healthy";
}

function getDisplayStatusLabel(displayStatus: OwnerDashboardPet["displayStatus"]): string {
  const labels = {
    healthy: "Khỏe mạnh",
    watching: "Cần theo dõi",
    boarding: "Đang lưu trú",
    inactive: "Ngưng theo dõi",
    deceased: "Đã mất",
  } as const;

  return labels[displayStatus];
}

function getAppointmentStatusLabel(status: OwnerDashboardAppointment["appointmentStatus"]): string {
  const labels = {
    pending_payment: "Chờ thanh toán",
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    rejected: "Đã từ chối",
    cancelled: "Đã hủy",
  } as const;

  return labels[status];
}

function mapPet(row: PetRow): OwnerDashboardPet {
  const displayStatus = getDisplayStatus(row);

  return {
    petId: row.pet_id,
    petName: row.pet_name,
    speciesLabel: getSpeciesLabel(row.species),
    breed: row.breed,
    ageLabel: getAgeLabel(row),
    profileImageUrl: row.profile_image_url,
    displayStatus,
    displayStatusLabel: getDisplayStatusLabel(displayStatus),
  };
}

function mapAppointment(row: AppointmentRow): OwnerDashboardAppointment {
  return {
    appointmentId: row.appointment_id,
    petId: row.pet_id,
    petName: row.pet_name,
    examTypeName: row.type_name,
    scheduledAt: row.scheduled_at,
    appointmentStatus: row.appointment_status,
    appointmentStatusLabel: getAppointmentStatusLabel(row.appointment_status),
  };
}

function mapActivity(row: ActivityRow): OwnerDashboardActivity {
  return {
    activityLogId: row.activity_log_id,
    petId: row.pet_id,
    petName: row.pet_name,
    activityCategory: row.activity_category,
    activityType: row.activity_type,
    activityStatus: row.activity_status,
    title: row.title,
    summary: row.summary,
    occurredAt: row.occurred_at,
    sourceType: row.source_type,
    sourceId: row.source_id,
  };
}

function mapReminder(row: ReminderRow): OwnerDashboardReminder {
  return {
    id: row.id,
    petId: row.pet_id,
    petName: row.pet_name,
    title: row.title,
    dueDate: row.due_date,
    tone: row.tone,
    actionHref: "/owner/appointments",
  };
}

export async function getOwnerDashboard(ownerUserId: string, ownerName: string): Promise<OwnerDashboardDto> {
  const [
    petCountResult,
    appointmentCountResult,
    unpaidInvoiceCountResult,
    unreadNotificationCountResult,
    petsResult,
    upcomingAppointmentsResult,
    recentActivitiesResult,
    remindersResult,
  ] = await Promise.all([
    query<CountRow>(
      `select count(*)::text as total
       from pet_center.pets
       where owner_user_id = $1 and pet_status = 'active'`,
      [ownerUserId]
    ),
    query<CountRow>(
      `select count(*)::text as total
       from pet_center.medical_appointments
       where owner_user_id = $1
         and scheduled_at >= now()
         and appointment_status in ('pending_payment', 'pending', 'confirmed')`,
      [ownerUserId]
    ),
    query<CountRow>(
      `select count(*)::text as total
       from pet_center.invoices
       where owner_user_id = $1 and invoice_status = 'pending_payment'`,
      [ownerUserId]
    ),
    query<CountRow>(
      `select count(*)::text as total
       from pet_center.notifications
       where receiver_user_id = $1 and notification_status = 'unread'`,
      [ownerUserId]
    ),
    query<PetRow>(
      `select
         p.pet_id,
         p.pet_name,
         p.species,
         p.breed,
         p.birth_date::text as birth_date,
         p.estimated_age,
         p.profile_image_url,
         p.pet_status,
         exists (
           select 1 from pet_center.boarding_records br
           where br.pet_id = p.pet_id and br.boarding_status = 'staying'
         ) as has_active_boarding,
         exists (
           select 1 from pet_center.pet_health_profiles php
           where php.pet_id = p.pet_id
             and (
               nullif(trim(coalesce(php.allergy_notes, '')), '') is not null
               or nullif(trim(coalesce(php.chronic_condition_notes, '')), '') is not null
               or nullif(trim(coalesce(php.special_care_notes, '')), '') is not null
             )
         ) as needs_attention
       from pet_center.pets p
       where p.owner_user_id = $1 and p.pet_status = 'active'
       order by p.pet_name asc, p.pet_id asc
       limit 4`,
      [ownerUserId]
    ),
    query<AppointmentRow>(
      `select
         ma.appointment_id,
         ma.pet_id,
         p.pet_name,
         et.type_name,
         ma.scheduled_at::text as scheduled_at,
         ma.appointment_status
       from pet_center.medical_appointments ma
       inner join pet_center.pets p on p.pet_id = ma.pet_id
       inner join pet_center.exam_types et on et.exam_type_id = ma.exam_type_id
       where ma.owner_user_id = $1
         and ma.scheduled_at >= now()
         and ma.appointment_status in ('pending_payment', 'pending', 'confirmed')
       order by ma.scheduled_at asc, ma.appointment_id asc
       limit 10`,
      [ownerUserId]
    ),
    query<ActivityRow>(
      `select
         pal.activity_log_id,
         pal.pet_id,
         p.pet_name,
         pal.activity_category,
         pal.activity_type,
         pal.activity_status,
         pal.title,
         pal.summary,
         pal.occurred_at::text as occurred_at,
         pal.source_type,
         pal.source_id
       from pet_center.pet_activity_logs pal
       inner join pet_center.pets p on p.pet_id = pal.pet_id
       where pal.owner_user_id = $1 and pal.visibility_status = 'visible'
       order by pal.occurred_at desc, pal.activity_log_id desc
       limit 3`,
      [ownerUserId]
    ),
    query<ReminderRow>(
      `select *
       from (
         select
           v.vaccination_id as id,
           p.pet_id,
           p.pet_name,
           p.pet_name || ' cần tiêm phòng ' || v.vaccine_name as title,
           (v.vaccination_date + interval '1 year')::date::text as due_date,
           case
             when (v.vaccination_date + interval '1 year')::date < current_date then 'overdue'
             else 'due-soon'
           end as tone
         from pet_center.vaccinations v
         inner join pet_center.pets p on p.pet_id = v.pet_id
         where p.owner_user_id = $1
           and p.pet_status = 'active'
           and (v.vaccination_date + interval '1 year')::date <= current_date + interval '30 days'

         union all

         select
           fui.follow_up_id as id,
           p.pet_id,
           p.pet_name,
           p.pet_name || ' có lịch tái khám: ' || fui.reason as title,
           fui.follow_up_date::text as due_date,
           case
             when fui.follow_up_date < current_date then 'overdue'
             else 'due-soon'
           end as tone
         from pet_center.follow_up_instructions fui
         inner join pet_center.medical_exams me on me.exam_id = fui.exam_id
         inner join pet_center.medical_appointments ma on ma.appointment_id = me.appointment_id
         inner join pet_center.pets p on p.pet_id = ma.pet_id
         where ma.owner_user_id = $1
           and p.pet_status = 'active'
           and fui.follow_up_date <= current_date + interval '30 days'
       ) reminders
       order by due_date asc, id asc
       limit 2`,
      [ownerUserId]
    ),
  ]);

  return {
    ownerName,
    summary: {
      petCount: Number(petCountResult.rows[0]?.total ?? 0),
      upcomingAppointmentCount: Number(appointmentCountResult.rows[0]?.total ?? 0),
      unpaidInvoiceCount: Number(unpaidInvoiceCountResult.rows[0]?.total ?? 0),
      unreadNotificationCount: Number(unreadNotificationCountResult.rows[0]?.total ?? 0),
    },
    pets: petsResult.rows.map(mapPet),
    upcomingAppointments: upcomingAppointmentsResult.rows.map(mapAppointment),
    recentActivities: recentActivitiesResult.rows.map(mapActivity),
    healthReminders: remindersResult.rows.map(mapReminder),
  };
}

export async function findOwnerActivityLogs(
  ownerUserId: string,
  pagination: { limit: number; offset: number }
): Promise<{ activities: OwnerDashboardActivity[]; total: number }> {
  const [listResult, countResult] = await Promise.all([
    query<ActivityRow>(
      `select
         pal.activity_log_id,
         pal.pet_id,
         p.pet_name,
         pal.activity_category,
         pal.activity_type,
         pal.activity_status,
         pal.title,
         pal.summary,
         pal.occurred_at::text as occurred_at,
         pal.source_type,
         pal.source_id
       from pet_center.pet_activity_logs pal
       inner join pet_center.pets p on p.pet_id = pal.pet_id
       where pal.owner_user_id = $1 and pal.visibility_status = 'visible'
       order by pal.occurred_at desc, pal.activity_log_id desc
       limit $2 offset $3`,
      [ownerUserId, pagination.limit, pagination.offset]
    ),
    query<CountRow>(
      `select count(*)::text as total
       from pet_center.pet_activity_logs pal
       where pal.owner_user_id = $1 and pal.visibility_status = 'visible'`,
      [ownerUserId]
    ),
  ]);

  return {
    activities: listResult.rows.map(mapActivity),
    total: Number(countResult.rows[0]?.total ?? 0),
  };
}
