import { pool } from "../../../src/db/pool.js";
import { createTestPasswordHash } from "../../helpers/auth-test-utils.js";

export const integrationTestIds = {
  ownerUserId: "it_owner_001",
  staffUserId: "it_staff_001",
  doctorUserId: "it_doctor_001",
  petId: "it_pet_001",
  serviceId: "it_service_medical",
  examTypeId: "it_exam_general",
  medicineId: "it_med_001",
  pendingAppointmentId: "it_appt_pending_001",
  doctorAppointmentId: "it_appt_doctor_001",
} as const;

export const integrationTestCredentials = {
  owner: {
    email: "owner.integration@example.com",
    password: "Valid@123",
  },
  staff: {
    email: "staff.integration@example.com",
    password: "Staff@123",
  },
  doctor: {
    email: "doctor.integration@example.com",
    password: "Doctor@123",
  },
} as const;

export function getFutureScheduledAt(daysFromNow: number, hour = 9): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysFromNow);
  date.setUTCHours(hour - 7, 0, 0, 0);

  return date.toISOString();
}

export const integrationTestAppointmentTimes = {
  ownerCreate: () => getFutureScheduledAt(7, 9),
  staffConfirm: () => getFutureScheduledAt(8, 10),
  doctorComplete: () => getFutureScheduledAt(9, 11),
} as const;

export type IntegrationTestSeedData = {
  examTypeId: string;
  ownerCreateScheduledAt: string;
  staffConfirmScheduledAt: string;
  doctorCompleteScheduledAt: string;
};

export async function cleanupIntegrationTestData(): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query("begin");

    await client.query(`
      DELETE FROM pet_center.prescription_items
      WHERE prescription_id IN (
        SELECT p.prescription_id
        FROM pet_center.prescriptions p
        JOIN pet_center.medical_exams me ON me.exam_id = p.exam_id
        WHERE me.exam_id LIKE 'it_%'
           OR me.appointment_id LIKE 'it_%'
      )
    `);

    await client.query(`
      DELETE FROM pet_center.prescriptions
      WHERE exam_id IN (
        SELECT exam_id
        FROM pet_center.medical_exams
        WHERE exam_id LIKE 'it_%'
           OR appointment_id LIKE 'it_%'
      )
    `);

    await client.query(`
      DELETE FROM pet_center.medical_exam_field_values
      WHERE exam_id IN (
        SELECT exam_id
        FROM pet_center.medical_exams
        WHERE exam_id LIKE 'it_%'
           OR appointment_id LIKE 'it_%'
      )
    `);

    await client.query(`
      DELETE FROM pet_center.vaccinations
      WHERE exam_id IN (
        SELECT exam_id
        FROM pet_center.medical_exams
        WHERE exam_id LIKE 'it_%'
           OR appointment_id LIKE 'it_%'
      )
    `);

    await client.query(`
      DELETE FROM pet_center.follow_up_instructions
      WHERE exam_id IN (
        SELECT exam_id
        FROM pet_center.medical_exams
        WHERE exam_id LIKE 'it_%'
           OR appointment_id LIKE 'it_%'
      )
    `);

    await client.query(`
      DELETE FROM pet_center.medical_exams
      WHERE exam_id LIKE 'it_%'
         OR appointment_id LIKE 'it_%'
    `);

    await client.query(`
      DELETE FROM pet_center.notifications
      WHERE receiver_user_id LIKE 'it_%'
         OR dedupe_key LIKE '%it_%'
    `);

    await client.query(`
      DELETE FROM pet_center.medical_appointments
      WHERE appointment_id LIKE 'it_%'
         OR pet_id LIKE 'it_%'
         OR owner_user_id LIKE 'it_%'
         OR veterinarian_user_id LIKE 'it_%'
         OR handled_by_staff_id LIKE 'it_%'
    `);

    await client.query("DELETE FROM pet_center.pet_health_profiles WHERE pet_id LIKE 'it_%'");
    await client.query("DELETE FROM pet_center.pets WHERE pet_id LIKE 'it_%' OR owner_user_id LIKE 'it_%'");
    await client.query("DELETE FROM pet_center.exam_field_definitions WHERE exam_type_id LIKE 'it_%'");
    await client.query("DELETE FROM pet_center.exam_types WHERE exam_type_id LIKE 'it_%'");
    await client.query("DELETE FROM pet_center.services WHERE service_id LIKE 'it_%'");
    await client.query("DELETE FROM pet_center.medicines WHERE medicine_id LIKE 'it_%'");
    await client.query("DELETE FROM pet_center.password_reset_tokens WHERE user_id LIKE 'it_%'");
    await client.query("DELETE FROM pet_center.users WHERE user_id LIKE 'it_%' OR email LIKE '%.integration@example.com'");

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function seedIntegrationTestData(): Promise<IntegrationTestSeedData> {
  await cleanupIntegrationTestData();

  const [ownerPasswordHash, staffPasswordHash, doctorPasswordHash] = await Promise.all([
    createTestPasswordHash(integrationTestCredentials.owner.password),
    createTestPasswordHash(integrationTestCredentials.staff.password),
    createTestPasswordHash(integrationTestCredentials.doctor.password),
  ]);
  const staffConfirmScheduledAt = integrationTestAppointmentTimes.staffConfirm();
  const doctorCompleteScheduledAt = integrationTestAppointmentTimes.doctorComplete();
  const client = await pool.connect();

  try {
    await client.query("begin");

    await client.query(
      `
      INSERT INTO pet_center.users (
        user_id,
        full_name,
        email,
        password_hash,
        phone_number,
        address,
        role,
        account_status
      )
      VALUES
        ($1, 'Integration Owner', $2, $3, '0900000001', 'Ha Noi', 'Owner', 'active'),
        ($4, 'Integration Staff', $5, $6, '0900000002', 'Ha Noi', 'Staff', 'active'),
        ($7, 'Integration Doctor', $8, $9, '0900000003', 'Ha Noi', 'Doctor', 'active')
      `,
      [
        integrationTestIds.ownerUserId,
        integrationTestCredentials.owner.email,
        ownerPasswordHash,
        integrationTestIds.staffUserId,
        integrationTestCredentials.staff.email,
        staffPasswordHash,
        integrationTestIds.doctorUserId,
        integrationTestCredentials.doctor.email,
        doctorPasswordHash,
      ]
    );

    await client.query(
      `
      INSERT INTO pet_center.pets (
        pet_id,
        owner_user_id,
        pet_name,
        species,
        breed,
        gender,
        estimated_age,
        weight_kg
      )
      VALUES ($1, $2, 'Milo Integration', 'Dog', 'Poodle', 'male', 3, 6.5)
      `,
      [integrationTestIds.petId, integrationTestIds.ownerUserId]
    );

    await client.query(
      `
      INSERT INTO pet_center.services (
        service_id,
        service_name,
        service_category,
        description,
        estimated_duration_minutes,
        base_price,
        service_status
      )
      VALUES ($1, 'Khám tổng quát integration', 'medical', 'Seed data for integration tests', 60, 150000, 'active')
      `,
      [integrationTestIds.serviceId]
    );

    await client.query(
      `
      INSERT INTO pet_center.exam_types (
        exam_type_id,
        type_code,
        type_name,
        description,
        service_id,
        type_status
      )
      SELECT $1, 'general_checkup', 'Khám tổng quát integration', 'Seed data for integration tests', $2, 'active'
      WHERE NOT EXISTS (
        SELECT 1
        FROM pet_center.exam_types
        WHERE type_code = 'general_checkup'
      )
      `,
      [integrationTestIds.examTypeId, integrationTestIds.serviceId]
    );

    const examTypeResult = await client.query<{ exam_type_id: string }>(
      `
      SELECT exam_type_id
      FROM pet_center.exam_types
      WHERE type_code = 'general_checkup'
        AND type_status = 'active'
      ORDER BY CASE WHEN exam_type_id = $1 THEN 0 ELSE 1 END, exam_type_id
      LIMIT 1
      `,
      [integrationTestIds.examTypeId]
    );
    const examTypeId = examTypeResult.rows[0]?.exam_type_id;

    if (!examTypeId) {
      throw new Error("Could not seed or find an active general_checkup exam type for integration tests.");
    }

    await client.query(
      `
      INSERT INTO pet_center.medicines (
        medicine_id,
        medicine_name,
        unit,
        description,
        usage_note,
        unit_price,
        medicine_status
      )
      VALUES ($1, 'Thuốc integration', 'tablet', 'Seed medicine for integration tests', 'Uống sau ăn', 10000, 'active')
      `,
      [integrationTestIds.medicineId]
    );

    await client.query(
      `
      INSERT INTO pet_center.medical_appointments (
        appointment_id,
        pet_id,
        owner_user_id,
        exam_type_id,
        veterinarian_user_id,
        scheduled_at,
        symptom_description,
        appointment_status,
        examination_status,
        internal_note,
        handled_by_staff_id
      )
      VALUES
        ($1, $2, $3, $4, NULL, $5, 'Seed pending appointment for staff integration test', 'pending', 'waiting', NULL, NULL),
        ($6, $2, $3, $4, $7, $8, 'Seed confirmed appointment for doctor integration test', 'confirmed', 'waiting', NULL, $9)
      `,
      [
        integrationTestIds.pendingAppointmentId,
        integrationTestIds.petId,
        integrationTestIds.ownerUserId,
        examTypeId,
        staffConfirmScheduledAt,
        integrationTestIds.doctorAppointmentId,
        integrationTestIds.doctorUserId,
        doctorCompleteScheduledAt,
        integrationTestIds.staffUserId,
      ]
    );

    await client.query("commit");

    return {
      examTypeId,
      ownerCreateScheduledAt: integrationTestAppointmentTimes.ownerCreate(),
      staffConfirmScheduledAt,
      doctorCompleteScheduledAt,
    };
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
