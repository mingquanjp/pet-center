import type { QueryResultRow } from "pg";
import { query } from "../../db/query.js";
import type {
  AdminDashboardAlertDto,
  AdminDashboardRecentActivityDto,
  AdminDashboardRevenuePointDto,
  AdminDashboardServiceRevenueDto,
  AdminDashboardStatDto,
  AdminDashboardTrendDto,
  DoctorAssignedExamDto,
  DoctorDashboardStatDto,
  DoctorRecentActivityDto,
  OwnerDashboardActivity,
  OwnerDashboardAppointment,
  OwnerDashboardDto,
  OwnerDashboardPet,
  OwnerDashboardReminder,
  StaffDashboardAppointmentTaskDto,
  StaffDashboardTaskSource,
} from "./dashboard.types.js";

type CountRow = QueryResultRow & {
  total: string;
};

type NumberRow = QueryResultRow & {
  value: string | number | null;
};

type UserDisplayNameRow = QueryResultRow & {
  full_name: string;
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

type RoomCapacityRow = QueryResultRow & {
  total_rooms: string;
  occupied_rooms: string;
};

type ColumnNameRow = QueryResultRow & {
  column_name: string;
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

type DoctorAssignedExamRow = QueryResultRow & {
  appointment_id: string;
  exam_id: string | null;
  pet_id: string;
  pet_name: string;
  species: string;
  breed: string | null;
  birth_date: Date | null;
  estimated_age: string | number | null;
  profile_image_url: string | null;
  owner_user_id: string;
  owner_name: string;
  owner_phone: string | null;
  owner_email: string | null;
  scheduled_at: Date;
  exam_type_id: string;
  type_code: string;
  type_name: string;
  appointment_status: "pending" | "confirmed";
};

type DoctorStatsRow = QueryResultRow & {
  today_exam_count: string;
  waiting_exam_count: string;
  in_progress_exam_count: string;
  follow_up_count: string;
};

type DoctorActivityRow = QueryResultRow & {
  activity_log_id: string;
  activity_type: string;
  title: string;
  summary: string | null;
  occurred_at: Date;
  source_type: string;
  source_id: string;
  metadata: Record<string, unknown> | null;
};

type AdminRecentActivityRow = QueryResultRow & {
  activity_log_id: string;
  occurred_at: Date;
  code: string;
  customer_name: string;
  pet_name: string | null;
  action: string;
  status: AdminDashboardRecentActivityDto["status"];
  category: string;
  source_type: string;
  source_id: string;
};

type AdminRevenuePointRow = QueryResultRow & {
  period_date: string;
  revenue: string;
};

type AdminServiceRevenueRow = QueryResultRow & {
  category: AdminDashboardServiceRevenueDto["category"];
  revenue: string;
};

type AdminBoardingCapacityAlertRow = QueryResultRow & {
  room_type_id: string;
  room_type_name: string;
  capacity: string;
  occupied_count: string;
};

type AdminPaymentAlertRow = QueryResultRow & {
  id: string;
  invoice_id: string;
  amount: string;
  occurred_at: Date;
  source_kind: "payment" | "online_payment_attempt";
};

type AdminAppointmentDelayAlertRow = QueryResultRow & {
  id: string;
  code: string;
  pet_name: string;
  owner_name: string;
  scheduled_at: Date;
  source_kind: "medical_appointment" | "grooming_ticket";
};

function toNumber(value: string | number | null): number | null {
  if (value === null) return null;
  return Number(value);
}

function toFiniteNumber(value: string | number | null | undefined): number {
  const numberValue = value === undefined || value === null ? 0 : Number(value);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

function roundPercentage(value: number): number {
  return Math.round(value * 10) / 10;
}

function getSpeciesLabel(species: PetRow["species"]): string {
  const labels = {
    Dog: "Chó",
    Cat: "Mèo",
    Other: "Khác",
  } as const;

  return labels[species];
}

function getStaffSpeciesLabel(species: AppointmentTaskRow["species"]): string {
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
    actionHref: `/owner/appointments/create?petId=${encodeURIComponent(row.pet_id)}&date=${encodeURIComponent(row.due_date)}`,
  };
}

function formatTaskAge(estimatedAge: AppointmentTaskRow["estimated_age"]): string | null {
  if (estimatedAge === null) return null;

  const age = Number(estimatedAge);

  if (!Number.isFinite(age)) return null;
  if (Number.isInteger(age)) return `${age} tuổi`;

  return `${age.toFixed(1)} tuổi`;
}

function getTaskPetDescription(row: AppointmentTaskRow): string {
  const breed = row.breed ?? getStaffSpeciesLabel(row.species);
  const age = formatTaskAge(row.estimated_age);

  return age ? `${breed} • ${age}` : breed;
}

function formatDoctorAppointmentCode(appointmentId: string): string {
  const suffix = appointmentId.replace(/^appt_?/i, "").toUpperCase();

  return `LH-${suffix}`;
}

function formatDoctorExaminationCode(appointmentId: string): string {
  const suffix = appointmentId.replace(/^appt_?/i, "").toUpperCase();

  return `PK-${suffix}`;
}

function normalizeDoctorSpecies(species: string): DoctorAssignedExamDto["pet"]["species"] {
  return species === "Dog" || species === "Cat" ? species : "Other";
}

function formatDoctorPetAge(row: Pick<DoctorAssignedExamRow, "birth_date" | "estimated_age">): string | undefined {
  if (row.birth_date) {
    const now = new Date();
    const birthDate = new Date(row.birth_date);
    let age = now.getFullYear() - birthDate.getFullYear();
    const monthDiff = now.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
      age -= 1;
    }

    return age > 0 ? `${age} tuổi` : "Dưới 1 tuổi";
  }

  if (!row.estimated_age) return undefined;

  const estimatedAge = Number(row.estimated_age);

  if (!Number.isFinite(estimatedAge)) return undefined;

  const ageText = Number.isInteger(estimatedAge) ? String(estimatedAge) : estimatedAge.toFixed(1);

  return estimatedAge >= 1 ? `${ageText} tuổi` : "Dưới 1 tuổi";
}

function getDoctorPetDescription(row: DoctorAssignedExamRow): string {
  return [normalizeDoctorSpecies(row.species), row.breed, formatDoctorPetAge(row)].filter(Boolean).join(" · ");
}

function formatDoctorScheduledTime(value: Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(value);
}

function mapDoctorExamStatus(status: DoctorAssignedExamRow["appointment_status"]): DoctorAssignedExamDto["status"] {
  return status === "confirmed" ? "EXAMINING" : "WAITING";
}

function mapDoctorAssignedExam(row: DoctorAssignedExamRow): DoctorAssignedExamDto {
  return {
    id: row.appointment_id,
    examId: row.exam_id,
    examinationCode: formatDoctorExaminationCode(row.appointment_id),
    appointmentCode: formatDoctorAppointmentCode(row.appointment_id),
    examCode: formatDoctorExaminationCode(row.appointment_id),
    pet: {
      id: row.pet_id,
      name: row.pet_name,
      species: normalizeDoctorSpecies(row.species),
      breed: row.breed || undefined,
      ageText: formatDoctorPetAge(row),
      avatarUrl: row.profile_image_url,
      imageUrl: row.profile_image_url || undefined,
      description: getDoctorPetDescription(row),
    },
    owner: {
      id: row.owner_user_id,
      fullName: row.owner_name,
      phoneNumber: row.owner_phone || undefined,
      email: row.owner_email || undefined,
    },
    scheduledAt: row.scheduled_at.toISOString(),
    scheduledTime: formatDoctorScheduledTime(row.scheduled_at),
    examType: {
      id: row.exam_type_id,
      code: row.type_code.toUpperCase(),
      name: row.type_name,
    },
    status: mapDoctorExamStatus(row.appointment_status),
  };
}

function getDoctorActivityType(row: DoctorActivityRow): DoctorRecentActivityDto["type"] {
  if (row.source_type === "prescription") return "PRESCRIPTION";
  if (row.source_type === "follow_up_instruction" || row.activity_type.includes("follow")) return "FOLLOW_UP";
  if (row.activity_type.includes("surgery")) return "SURGERY_REQUEST";

  return "MEDICAL_RECORD";
}

function formatDoctorActivityTime(value: Date): string {
  const time = new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(value);
  const dateFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const activityDate = dateFormatter.format(value);
  const today = dateFormatter.format(new Date());

  if (activityDate === today) return `${time} Hôm nay`;

  return `${time} ${new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
  }).format(value)}`;
}

function mapDoctorRecentActivity(row: DoctorActivityRow): DoctorRecentActivityDto {
  const metadataNote =
    row.metadata && typeof row.metadata.note === "string" ? row.metadata.note : undefined;
  const metadataTag =
    row.metadata && typeof row.metadata.tag === "string" ? row.metadata.tag : undefined;

  return {
    id: row.activity_log_id,
    timeLabel: formatDoctorActivityTime(row.occurred_at),
    title: row.title,
    description: row.summary ?? row.source_id,
    note: metadataNote,
    tag: metadataTag,
    type: getDoctorActivityType(row),
  };
}

function mapAppointmentTask(row: AppointmentTaskRow): StaffDashboardAppointmentTaskDto {
  return {
    taskId: row.task_id,
    code: row.code,
    sourceType: row.source_type,
    petName: row.pet_name,
    petDescription: getTaskPetDescription(row),
    ownerName: row.owner_name,
    scheduledAt: row.scheduled_at.toISOString(),
    typeLabel: row.type_label,
    status: "pending",
    statusLabel: "Chờ xác nhận",
  };
}

function getAdminActivityStatusLabel(status: AdminDashboardRecentActivityDto["status"]): string {
  const labels: Record<AdminDashboardRecentActivityDto["status"], string> = {
    scheduled: "\u0110\u00e3 l\u00ean l\u1ecbch",
    pending: "\u0110ang ch\u1edd",
    confirmed: "\u0110\u00e3 x\u00e1c nh\u1eadn",
    completed: "Ho\u00e0n th\u00e0nh",
    cancelled: "\u0110\u00e3 h\u1ee7y",
    rejected: "T\u1eeb ch\u1ed1i",
    failed: "Th\u1ea5t b\u1ea1i",
  };

  return labels[status] ?? status;
}

function getAdminServiceCategoryLabel(category: AdminDashboardServiceRevenueDto["category"]): string {
  const labels: Record<AdminDashboardServiceRevenueDto["category"], string> = {
    medical: "Kh\u00e1m b\u1ec7nh",
    grooming: "Grooming",
    boarding: "Boarding",
    medicine: "Medicine",
    other: "Kh\u00e1c",
  };

  return labels[category];
}

function mapAdminRecentActivity(row: AdminRecentActivityRow): AdminDashboardRecentActivityDto {
  return {
    activityLogId: row.activity_log_id,
    occurredAt: row.occurred_at.toISOString(),
    code: row.code,
    customerName: row.customer_name,
    petName: row.pet_name,
    action: row.action,
    status: row.status,
    statusLabel: getAdminActivityStatusLabel(row.status),
    category: row.category,
    sourceType: row.source_type,
    sourceId: row.source_id,
  };
}

async function getBoardingOccupancyCondition(): Promise<string> {
  const result = await query<ColumnNameRow>(
    `select column_name
     from information_schema.columns
     where table_schema = 'pet_center'
       and table_name = 'boarding_records'
       and column_name in (
         'planned_check_in_at',
         'planned_check_out_at',
         'planned_check_in_date',
         'planned_check_out_date'
       )`
  );
  const columnNames = new Set(result.rows.map((row) => row.column_name));

  if (columnNames.has("planned_check_in_at") && columnNames.has("planned_check_out_at")) {
    return "br.planned_check_in_at <= now() and br.planned_check_out_at > now()";
  }

  if (columnNames.has("planned_check_in_date") && columnNames.has("planned_check_out_date")) {
    return "br.planned_check_in_date <= current_date and br.planned_check_out_date > current_date";
  }

  throw new Error("boarding_records is missing planned check-in/check-out columns");
}

export async function findUserDisplayName(userId: string): Promise<string | null> {
  const result = await query<UserDisplayNameRow>(
    `select full_name
     from pet_center.users
     where user_id = $1
     limit 1`,
    [userId]
  );

  return result.rows[0]?.full_name ?? null;
}

export async function getOwnerDashboard(ownerUserId: string): Promise<OwnerDashboardDto> {
  const [
    ownerNameResult,
    petCountResult,
    appointmentCountResult,
    unpaidInvoiceCountResult,
    unreadNotificationCountResult,
    petsResult,
    upcomingAppointmentsResult,
    recentActivitiesResult,
    remindersResult,
  ] = await Promise.all([
    findUserDisplayName(ownerUserId),
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
    ownerName: ownerNameResult ?? "",
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
  const occupancyCondition = await getBoardingOccupancyCondition();
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
         and ${occupancyCondition}
     )
     select total_capacity.total_rooms, occupied_capacity.occupied_rooms
     from total_capacity
     cross join occupied_capacity`
  );
  const totalRooms = Number(result.rows[0]?.total_rooms ?? 0);
  const occupiedRooms = Number(result.rows[0]?.occupied_rooms ?? 0);

  return {
    availableRooms: Math.max(totalRooms - occupiedRooms, 0),
    totalRooms,
  };
}

export async function countTodayInvoices(): Promise<number> {
  const result = await query<CountRow>(
    `select count(*)::text as total
     from pet_center.invoices i
     where i.issued_at::date = current_date
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

export async function getDoctorDashboardStats(doctorUserId: string): Promise<DoctorDashboardStatDto> {
  const result = await query<DoctorStatsRow>(
    `select
       count(*) filter (
         where (ma.scheduled_at at time zone 'Asia/Ho_Chi_Minh')::date = (now() at time zone 'Asia/Ho_Chi_Minh')::date
           and ma.appointment_status in ('pending', 'confirmed')
       )::text as today_exam_count,
       count(*) filter (
         where (ma.scheduled_at at time zone 'Asia/Ho_Chi_Minh')::date = (now() at time zone 'Asia/Ho_Chi_Minh')::date
           and ma.appointment_status = 'pending'
       )::text as waiting_exam_count,
       count(*) filter (
         where (ma.scheduled_at at time zone 'Asia/Ho_Chi_Minh')::date = (now() at time zone 'Asia/Ho_Chi_Minh')::date
           and ma.appointment_status = 'confirmed'
       )::text as in_progress_exam_count,
       (
         select count(*)::text
         from pet_center.follow_up_instructions fui
         join pet_center.medical_exams me on me.exam_id = fui.exam_id
         where me.examined_by_veterinarian_id = $1
           and fui.follow_up_date >= current_date
       ) as follow_up_count
     from pet_center.medical_appointments ma
     where ma.veterinarian_user_id = $1`,
    [doctorUserId]
  );
  const row = result.rows[0];

  return {
    todayExamCount: Number(row?.today_exam_count ?? 0),
    waitingExamCount: Number(row?.waiting_exam_count ?? 0),
    inProgressExamCount: Number(row?.in_progress_exam_count ?? 0),
    followUpCount: Number(row?.follow_up_count ?? 0),
  };
}

export async function findDoctorAssignedExams(
  doctorUserId: string,
  limit: number
): Promise<DoctorAssignedExamDto[]> {
  const result = await query<DoctorAssignedExamRow>(
     `select
       ma.appointment_id,
       me.exam_id,
       p.pet_id,
       p.pet_name,
       p.species,
       p.breed,
       p.birth_date,
       p.estimated_age,
       p.profile_image_url,
       owner.user_id as owner_user_id,
       owner.full_name as owner_name,
       owner.phone_number as owner_phone,
       owner.email as owner_email,
       ma.scheduled_at,
       et.exam_type_id,
       et.type_code,
       et.type_name,
       ma.appointment_status
     from pet_center.medical_appointments ma
     join pet_center.pets p on p.pet_id = ma.pet_id
     join pet_center.users owner on owner.user_id = ma.owner_user_id
     join pet_center.exam_types et on et.exam_type_id = ma.exam_type_id
     left join pet_center.medical_exams me on me.appointment_id = ma.appointment_id
     where ma.veterinarian_user_id = $1
       and ma.appointment_status in ('pending', 'confirmed')
       and ma.scheduled_at >= now()
     order by ma.scheduled_at asc, ma.appointment_id asc
     limit $2`,
    [doctorUserId, limit]
  );

  return result.rows.map(mapDoctorAssignedExam);
}

export async function findDoctorRecentActivities(
  doctorUserId: string,
  limit: number
): Promise<DoctorRecentActivityDto[]> {
  const result = await query<DoctorActivityRow>(
    `select
       pal.activity_log_id,
       pal.activity_type,
       pal.title,
       pal.summary,
       pal.occurred_at,
       pal.source_type,
       pal.source_id,
       pal.metadata
     from pet_center.pet_activity_logs pal
     where pal.actor_user_id = $1
       and pal.visibility_status = 'visible'
       and pal.activity_category = 'medical'
     order by pal.occurred_at desc, pal.activity_log_id desc
     limit $2`,
    [doctorUserId, limit]
  );

  return result.rows.map(mapDoctorRecentActivity);
}

export async function getAdminStats(range: {
  startDate: string;
  endDate: string;
  previousStartDate: string;
  previousEndDate: string;
}): Promise<{ stats: AdminDashboardStatDto; trends: AdminDashboardTrendDto }> {
  const [
    totalUsersResult,
    previousUsersResult,
    totalPetsResult,
    appointmentResult,
    previousAppointmentResult,
    roomCapacity,
    revenueResult,
    previousRevenueResult,
    pendingInvoiceResult,
    medicineRevenueResult,
  ] = await Promise.all([
    query<CountRow>(
      `select count(*)::text as total
       from pet_center.users
       where account_status <> 'inactive'
         and created_at::date <= $1::date`,
      [range.endDate]
    ),
    query<CountRow>(
      `select count(*)::text as total
       from pet_center.users
       where account_status <> 'inactive'
         and created_at::date <= $1::date`,
      [range.previousEndDate]
    ),
    query<CountRow>(
      `select count(*)::text as total
       from pet_center.pets
       where pet_status = 'active'`
    ),
    query<CountRow>(
      `select count(*)::text as total
       from pet_center.medical_appointments
       where scheduled_at::date between $1::date and $2::date
         and appointment_status in ('pending_payment', 'pending', 'confirmed')`,
      [range.startDate, range.endDate]
    ),
    query<CountRow>(
      `select count(*)::text as total
       from pet_center.medical_appointments
       where scheduled_at::date between $1::date and $2::date
         and appointment_status in ('pending_payment', 'pending', 'confirmed')`,
      [range.previousStartDate, range.previousEndDate]
    ),
    getRoomCapacitySnapshot(),
    query<NumberRow>(
      `with paid_invoices as (
         select
           i.invoice_id,
           i.total_amount,
           coalesce(max(p.paid_at)::date, i.issued_at) as revenue_date
         from pet_center.invoices i
         left join pet_center.payments p
           on p.invoice_id = i.invoice_id
          and p.payment_status = 'success'
         where i.invoice_status = 'paid' or p.payment_id is not null
         group by i.invoice_id
       )
       select coalesce(sum(total_amount), 0)::text as value
       from paid_invoices
       where revenue_date between $1::date and $2::date`,
      [range.startDate, range.endDate]
    ),
    query<NumberRow>(
      `with paid_invoices as (
         select
           i.invoice_id,
           i.total_amount,
           coalesce(max(p.paid_at)::date, i.issued_at) as revenue_date
         from pet_center.invoices i
         left join pet_center.payments p
           on p.invoice_id = i.invoice_id
          and p.payment_status = 'success'
         where i.invoice_status = 'paid' or p.payment_id is not null
         group by i.invoice_id
       )
       select coalesce(sum(total_amount), 0)::text as value
       from paid_invoices
       where revenue_date between $1::date and $2::date`,
      [range.previousStartDate, range.previousEndDate]
    ),
    query<CountRow>(
      `select count(*)::text as total
       from pet_center.invoices
       where invoice_status = 'pending_payment'`
    ),
    query<NumberRow>(
      `with paid_invoices as (
         select
           i.invoice_id,
           coalesce(max(p.paid_at)::date, i.issued_at) as revenue_date
         from pet_center.invoices i
         left join pet_center.payments p
           on p.invoice_id = i.invoice_id
          and p.payment_status = 'success'
         where i.invoice_status = 'paid' or p.payment_id is not null
         group by i.invoice_id
       )
       select coalesce(sum(il.line_amount), 0)::text as value
       from pet_center.invoice_lines il
       join paid_invoices pi on pi.invoice_id = il.invoice_id
       left join pet_center.services s on s.service_id = il.service_id
       where pi.revenue_date between $1::date and $2::date
         and (
           il.source_type = 'prescription'
           or s.service_category = 'medicine'
         )`,
      [range.startDate, range.endDate]
    ),
  ]);

  const totalUsers = Number(totalUsersResult.rows[0]?.total ?? 0);
  const previousUsers = Number(previousUsersResult.rows[0]?.total ?? 0);
  const medicalAppointments = Number(appointmentResult.rows[0]?.total ?? 0);
  const previousMedicalAppointments = Number(previousAppointmentResult.rows[0]?.total ?? 0);
  const monthlyRevenue = toFiniteNumber(revenueResult.rows[0]?.value);
  const previousRevenue = toFiniteNumber(previousRevenueResult.rows[0]?.value);
  const medicineRevenue = toFiniteNumber(medicineRevenueResult.rows[0]?.value);
  const currentBoardingPets = Math.max(roomCapacity.totalRooms - roomCapacity.availableRooms, 0);
  const bookingRate =
    roomCapacity.totalRooms > 0 ? roundPercentage((currentBoardingPets / roomCapacity.totalRooms) * 100) : 0;

  return {
    stats: {
      totalUsers,
      totalPets: Number(totalPetsResult.rows[0]?.total ?? 0),
      medicalAppointments,
      currentBoardingPets,
      totalBoardingCapacity: roomCapacity.totalRooms,
      monthlyRevenue,
      pendingInvoices: Number(pendingInvoiceResult.rows[0]?.total ?? 0),
      medicineRevenue,
      bookingRate,
    },
    trends: {
      totalUsers: calculateTrend(totalUsers, previousUsers),
      totalPets: null,
      monthlyRevenue: calculateTrend(monthlyRevenue, previousRevenue),
      bookingRate: null,
    },
  };
}

export async function findAdminRevenueTrend(endDate: string): Promise<AdminDashboardRevenuePointDto[]> {
  const result = await query<AdminRevenuePointRow>(
    `with months as (
       select generate_series(
         date_trunc('month', $1::date) - interval '5 months',
         date_trunc('month', $1::date),
         interval '1 month'
       )::date as period_date
     ),
     paid_invoices as (
       select
         i.invoice_id,
         i.total_amount,
         coalesce(max(p.paid_at)::date, i.issued_at) as revenue_date
       from pet_center.invoices i
       left join pet_center.payments p
         on p.invoice_id = i.invoice_id
        and p.payment_status = 'success'
       where i.invoice_status = 'paid' or p.payment_id is not null
       group by i.invoice_id
     )
     select
       months.period_date::text as period_date,
       coalesce(sum(pi.total_amount), 0)::text as revenue
     from months
     left join paid_invoices pi
       on date_trunc('month', pi.revenue_date)::date = months.period_date
     group by months.period_date
     order by months.period_date asc`,
    [endDate]
  );

  return result.rows.map((row) => ({
    label: row.period_date.slice(5, 7),
    revenue: toFiniteNumber(row.revenue),
  }));
}

export async function findAdminServiceRevenue(range: {
  startDate: string;
  endDate: string;
}): Promise<AdminDashboardServiceRevenueDto[]> {
  const result = await query<AdminServiceRevenueRow>(
    `with paid_invoices as (
       select
         i.invoice_id,
         coalesce(max(p.paid_at)::date, i.issued_at) as revenue_date
       from pet_center.invoices i
       left join pet_center.payments p
         on p.invoice_id = i.invoice_id
        and p.payment_status = 'success'
       where i.invoice_status = 'paid' or p.payment_id is not null
       group by i.invoice_id
     )
     select
       coalesce(
         s.service_category,
         case
           when il.source_type = 'medical_exam' then 'medical'
           when il.source_type = 'grooming' then 'grooming'
           when il.source_type = 'boarding' then 'boarding'
           when il.source_type = 'prescription' then 'medicine'
           else 'other'
         end,
         'other'
       )::text as category,
       coalesce(sum(il.line_amount), 0)::text as revenue
     from pet_center.invoice_lines il
     join paid_invoices pi on pi.invoice_id = il.invoice_id
     left join pet_center.services s on s.service_id = il.service_id
     where pi.revenue_date between $1::date and $2::date
     group by coalesce(
       s.service_category,
       case
         when il.source_type = 'medical_exam' then 'medical'
         when il.source_type = 'grooming' then 'grooming'
         when il.source_type = 'boarding' then 'boarding'
         when il.source_type = 'prescription' then 'medicine'
         else 'other'
       end,
       'other'
     )
     order by revenue desc`,
    [range.startDate, range.endDate]
  );
  const totalRevenue = result.rows.reduce((sum, row) => sum + toFiniteNumber(row.revenue), 0);

  return result.rows.map((row) => {
    const revenue = toFiniteNumber(row.revenue);

    return {
      category: row.category,
      label: getAdminServiceCategoryLabel(row.category),
      revenue,
      percentage: totalRevenue > 0 ? roundPercentage((revenue / totalRevenue) * 100) : 0,
    };
  });
}

export async function findAdminRecentActivities(range: {
  startDate: string;
  endDate: string;
  limit: number;
  offset?: number;
}): Promise<AdminDashboardRecentActivityDto[]> {
  const result = await query<AdminRecentActivityRow>(
    `select
       pal.activity_log_id,
       pal.occurred_at,
       pal.source_id as code,
       owner.full_name as customer_name,
       p.pet_name,
       pal.title as action,
       pal.activity_status as status,
       pal.activity_category as category,
       pal.source_type,
       pal.source_id
     from pet_center.pet_activity_logs pal
     join pet_center.users owner on owner.user_id = pal.owner_user_id
     left join pet_center.pets p on p.pet_id = pal.pet_id
     where pal.visibility_status = 'visible'
       and pal.occurred_at::date between $1::date and $2::date
     order by pal.occurred_at desc, pal.activity_log_id desc
     limit $3 offset $4`,
    [range.startDate, range.endDate, range.limit, range.offset ?? 0]
  );

  return result.rows.map(mapAdminRecentActivity);
}

export async function findAdminActivityLogs(range: {
  startDate: string;
  endDate: string;
  limit: number;
  offset: number;
}): Promise<{ activities: AdminDashboardRecentActivityDto[]; total: number }> {
  const [listResult, countResult] = await Promise.all([
    findAdminRecentActivities(range),
    query<CountRow>(
      `select count(*)::text as total
       from pet_center.pet_activity_logs pal
       where pal.visibility_status = 'visible'
         and pal.occurred_at::date between $1::date and $2::date`,
      [range.startDate, range.endDate]
    ),
  ]);

  return {
    activities: listResult,
    total: Number(countResult.rows[0]?.total ?? 0),
  };
}

export async function findAdminOperationAlerts(): Promise<AdminDashboardAlertDto[]> {
  const [capacityAlerts, failedPayments, delayedAppointments] =
    await Promise.all([
      findBoardingCapacityAlerts(),
      findFailedPaymentAlerts(),
      findDelayedAppointmentAlerts(),
    ]);

  const alerts: AdminDashboardAlertDto[] = [
    ...capacityAlerts,
    ...failedPayments,
    ...delayedAppointments,
  ];

  return alerts
    .sort((left, right) => {
      const leftTime = left.occurredAt ? new Date(left.occurredAt).getTime() : 0;
      const rightTime = right.occurredAt ? new Date(right.occurredAt).getTime() : 0;

      return rightTime - leftTime;
    })
    .slice(0, 10);
}

function calculateTrend(currentValue: number, previousValue: number): number | null {
  if (previousValue === 0) {
    return currentValue === 0 ? 0 : null;
  }

  return roundPercentage(((currentValue - previousValue) / previousValue) * 100);
}

async function findBoardingCapacityAlerts(): Promise<AdminDashboardAlertDto[]> {
  const result = await query<AdminBoardingCapacityAlertRow>(
    `select
       rt.room_type_id,
       rt.room_type_name,
       rt.capacity::text,
       count(br.boarding_record_id)::text as occupied_count
     from pet_center.room_types rt
     left join pet_center.boarding_records br
       on br.room_type_id = rt.room_type_id
      and br.boarding_status in ('confirmed', 'staying')
      and br.planned_check_in_at <= now()
      and br.planned_check_out_at > now()
     where rt.room_type_status = 'active'
     group by rt.room_type_id
     having count(br.boarding_record_id) >= rt.capacity
     order by count(br.boarding_record_id) desc, rt.room_type_name asc
     limit 10`
  );

  return result.rows.map((row) => {
    const occupiedCount = Number(row.occupied_count);
    const capacity = Number(row.capacity);
    const isOverCapacity = occupiedCount > capacity;

    return {
      id: `boarding-capacity-${row.room_type_id}`,
      type: "boarding_capacity",
      severity: isOverCapacity ? "danger" : "warning",
      title: isOverCapacity ? "Lo\u1ea1i ph\u00f2ng l\u01b0u tr\u00fa qu\u00e1 t\u1ea3i" : "Lo\u1ea1i ph\u00f2ng l\u01b0u tr\u00fa \u0111\u00e3 \u0111\u1ea7y",
      description: `${row.room_type_name}: ${occupiedCount}/${capacity} th\u00fa c\u01b0ng \u0111ang ho\u1eb7c s\u1eafp l\u01b0u tr\u00fa.`,
      sourceType: "room_type",
      sourceId: row.room_type_id,
      occurredAt: null,
    };
  });
}

async function findFailedPaymentAlerts(): Promise<AdminDashboardAlertDto[]> {
  const result = await query<AdminPaymentAlertRow>(
    `select *
     from (
       select
         p.payment_id as id,
         p.invoice_id,
         p.paid_amount::text as amount,
         coalesce(p.paid_at, now()) as occurred_at,
         'payment'::text as source_kind
       from pet_center.payments p
       where p.payment_status = 'failed'

       union all

       select
         opa.payment_attempt_id as id,
         opa.invoice_id,
         opa.amount::text as amount,
         coalesce(opa.completed_at, opa.created_at) as occurred_at,
         'online_payment_attempt'::text as source_kind
       from pet_center.online_payment_attempts opa
       where opa.attempt_status = 'failed'
     ) failed_payments
     order by occurred_at desc
     limit 10`
  );

  return result.rows.map((row) => ({
    id: `payment-failed-${row.id}`,
    type: "payment_failed",
    severity: "danger",
    title: "Thanh to\u00e1n th\u1ea5t b\u1ea1i",
    description: `H\u00f3a \u0111\u01a1n ${row.invoice_id} l\u1ed7i thanh to\u00e1n ${Number(row.amount).toLocaleString("vi-VN")} VND.`,
    sourceType: row.source_kind,
    sourceId: row.id,
    occurredAt: row.occurred_at.toISOString(),
  }));
}

async function findDelayedAppointmentAlerts(): Promise<AdminDashboardAlertDto[]> {
  const result = await query<AdminAppointmentDelayAlertRow>(
    `select *
     from (
       select
         ma.appointment_id as id,
         ma.appointment_id as code,
         p.pet_name,
         owner.full_name as owner_name,
         ma.scheduled_at,
         'medical_appointment'::text as source_kind
       from pet_center.medical_appointments ma
       join pet_center.pets p on p.pet_id = ma.pet_id
       join pet_center.users owner on owner.user_id = ma.owner_user_id
       where ma.appointment_status = 'pending'
         and ma.scheduled_at < now() - interval '30 minutes'

       union all

       select
         gt.grooming_ticket_id as id,
         gt.grooming_ticket_id as code,
         p.pet_name,
         owner.full_name as owner_name,
         gt.scheduled_at,
         'grooming_ticket'::text as source_kind
       from pet_center.grooming_tickets gt
       join pet_center.pets p on p.pet_id = gt.pet_id
       join pet_center.users owner on owner.user_id = gt.owner_user_id
       where gt.ticket_status = 'pending'
         and gt.scheduled_at < now() - interval '30 minutes'
     ) delayed_tasks
     order by scheduled_at asc
     limit 10`
  );

  return result.rows.map((row) => ({
    id: `appointment-delay-${row.id}`,
    type: "appointment_delay",
    severity: "warning",
    title: "L\u1ecbch h\u1eb9n ch\u1edd qu\u00e1 l\u00e2u",
    description: `${row.code} c\u1ee7a ${row.owner_name} / ${row.pet_name} \u0111ang pending qu\u00e1 30 ph\u00fat.`,
    sourceType: row.source_kind,
    sourceId: row.id,
    occurredAt: row.scheduled_at.toISOString(),
  }));
}
