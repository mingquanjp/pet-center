import { query } from "../../db/query.js";
import { ReportPeriodDto, ReportGroupBy, ReportPaymentMethodGroup } from "./reports.types.js";

const getPaymentMethodFilter = (paymentMethodGroup: ReportPaymentMethodGroup, prefix = "p") => {
  if (paymentMethodGroup === "ONLINE") return `AND ${prefix}.payment_method = 'online'`;
  if (paymentMethodGroup === "COUNTER") return `AND ${prefix}.payment_method = 'at_counter'`;
  return "";
};

export const reportsRepository = {
  // ===================== REVENUE =====================
  getPaidRevenueSummary: async (period: ReportPeriodDto, paymentMethodGroup: ReportPaymentMethodGroup) => {
    const paymentFilter = getPaymentMethodFilter(paymentMethodGroup);
    const sql = `
      SELECT 
        COALESCE(SUM(paid_amount), 0)::numeric AS current_paid_revenue,
        COUNT(payment_id)::int AS current_successful_transactions
      FROM pet_center.payments p
      WHERE p.payment_status = 'success'
        AND p.paid_at BETWEEN $1 AND $2
        ${paymentFilter}
    `;
    const result = await query(sql, [period.from, period.to]);
    return result.rows[0];
  },

  getRevenueTrend: async (period: ReportPeriodDto, groupBy: ReportGroupBy, paymentMethodGroup: ReportPaymentMethodGroup) => {
    const paymentFilter = getPaymentMethodFilter(paymentMethodGroup);
    let dateTrunc = "day";
    if (groupBy === "WEEK") dateTrunc = "week";
    if (groupBy === "MONTH") dateTrunc = "month";

    const sql = `
      SELECT 
        date_trunc('${dateTrunc}', p.paid_at) AS date_bucket,
        COALESCE(SUM(p.paid_amount), 0)::numeric AS revenue
      FROM pet_center.payments p
      WHERE p.payment_status = 'success'
        AND p.paid_at BETWEEN $1 AND $2
        ${paymentFilter}
      GROUP BY date_bucket
      ORDER BY date_bucket ASC
    `;
    const result = await query(sql, [period.from, period.to]);
    return result.rows;
  },

  getRevenueSourceBreakdown: async (period: ReportPeriodDto, paymentMethodGroup: ReportPaymentMethodGroup) => {
    const paymentFilter = getPaymentMethodFilter(paymentMethodGroup, "p");
    const sql = `
      WITH paid_invoices AS (
        SELECT DISTINCT i.invoice_id
        FROM pet_center.invoices i
        JOIN pet_center.payments p ON p.invoice_id = i.invoice_id
        WHERE p.payment_status = 'success'
          AND p.paid_at BETWEEN $1 AND $2
          ${paymentFilter}
      )
      SELECT
        il.source_type,
        COUNT(DISTINCT il.invoice_id)::int AS invoice_count,
        COALESCE(SUM(il.line_amount), 0)::numeric AS revenue
      FROM pet_center.invoice_lines il
      JOIN paid_invoices pi ON pi.invoice_id = il.invoice_id
      GROUP BY il.source_type
    `;
    const result = await query(sql, [period.from, period.to]);
    return result.rows;
  },

  // ===================== SERVICES =====================
  getGroomingSummary: async (period: ReportPeriodDto) => {
    const sql = `
      SELECT 
        COUNT(grooming_ticket_id)::int AS total_bookings,
        COUNT(CASE WHEN ticket_status = 'completed' THEN 1 END)::int AS completed_count
      FROM pet_center.grooming_tickets
      WHERE scheduled_at BETWEEN $1 AND $2
    `;
    const result = await query(sql, [period.from, period.to]);
    return result.rows[0];
  },

  getGroomingStatusCounts: async (period: ReportPeriodDto) => {
    const sql = `
      SELECT 
        ticket_status AS status,
        COUNT(grooming_ticket_id)::int AS count
      FROM pet_center.grooming_tickets
      WHERE scheduled_at BETWEEN $1 AND $2
      GROUP BY ticket_status
    `;
    const result = await query(sql, [period.from, period.to]);
    return result.rows;
  },

  getTopGroomingServices: async (period: ReportPeriodDto) => {
    const sql = `
      WITH paid_invoices AS (
        SELECT DISTINCT i.invoice_id
        FROM pet_center.invoices i
        JOIN pet_center.payments p ON p.invoice_id = i.invoice_id
        WHERE p.payment_status = 'success'
          AND p.paid_at BETWEEN $1 AND $2
      ),
      grooming_revenue AS (
        SELECT 
          il.service_id, 
          SUM(il.line_amount) AS total_paid
        FROM pet_center.invoice_lines il
        JOIN paid_invoices pi ON pi.invoice_id = il.invoice_id
        WHERE il.source_type = 'grooming' AND il.service_id IS NOT NULL
        GROUP BY il.service_id
      )
      SELECT 
        s.service_id,
        s.service_name,
        COUNT(period_gti.grooming_ticket_item_id)::int AS booking_count,
        COUNT(CASE WHEN period_gti.ticket_status = 'completed' THEN 1 END)::int AS completed_count,
        COUNT(CASE WHEN period_gti.ticket_status = 'cancelled' THEN 1 END)::int AS cancelled_count,
        COALESCE(MAX(gr.total_paid), 0)::numeric AS revenue
      FROM pet_center.services s
      LEFT JOIN (
        SELECT gti2.service_id, gt2.ticket_status, gti2.grooming_ticket_item_id
        FROM pet_center.grooming_ticket_items gti2
        JOIN pet_center.grooming_tickets gt2 ON gt2.grooming_ticket_id = gti2.grooming_ticket_id
        WHERE gt2.scheduled_at BETWEEN $1 AND $2
      ) period_gti ON period_gti.service_id = s.service_id
      LEFT JOIN grooming_revenue gr ON gr.service_id = s.service_id
      WHERE s.service_category = 'grooming'
      GROUP BY s.service_id, s.service_name
      HAVING COUNT(period_gti.grooming_ticket_item_id) > 0 OR MAX(gr.total_paid) > 0
      ORDER BY booking_count DESC
      LIMIT 10
    `;
    const result = await query(sql, [period.from, period.to]);
    return result.rows;
  },

  // ===================== BOARDING =====================
  getBoardingSummary: async (period: ReportPeriodDto) => {
    const sql = `
      SELECT 
        COUNT(boarding_record_id)::int AS total_stays,
        COALESCE(AVG(CEIL(EXTRACT(EPOCH FROM (planned_check_out_at - planned_check_in_at)) / 86400)), 0)::numeric AS avg_duration
      FROM pet_center.boarding_records
      WHERE planned_check_in_at BETWEEN $1 AND $2
    `;
    const result = await query(sql, [period.from, period.to]);
    return result.rows[0];
  },

  getBoardingStatusCounts: async (period: ReportPeriodDto) => {
    const sql = `
      SELECT 
        boarding_status AS status,
        COUNT(boarding_record_id)::int AS count
      FROM pet_center.boarding_records
      WHERE planned_check_in_at BETWEEN $1 AND $2
      GROUP BY boarding_status
    `;
    const result = await query(sql, [period.from, period.to]);
    return result.rows;
  },

  getBoardingRoomOccupancy: async (period: ReportPeriodDto) => {
    const sql = `
      WITH paid_invoices AS (
        SELECT DISTINCT i.invoice_id
        FROM pet_center.invoices i
        JOIN pet_center.payments p ON p.invoice_id = i.invoice_id
        WHERE p.payment_status = 'success'
          AND p.paid_at BETWEEN $1 AND $2
      ),
      boarding_revenue AS (
        SELECT 
          br.room_type_id,
          SUM(il.line_amount) AS total_paid
        FROM pet_center.invoice_lines il
        JOIN paid_invoices pi ON pi.invoice_id = il.invoice_id
        JOIN pet_center.boarding_records br ON br.boarding_record_id = il.source_id
        WHERE il.source_type = 'boarding'
        GROUP BY br.room_type_id
      )
      SELECT 
        rt.room_type_id,
        rt.room_type_name,
        rt.capacity,
        (SELECT COUNT(br.boarding_record_id)::int 
         FROM pet_center.boarding_records br 
         WHERE br.room_type_id = rt.room_type_id AND br.boarding_status = 'staying'
        ) AS current_occupancy,
        COUNT(br_period.boarding_record_id)::int AS booking_count,
        COALESCE(MAX(brev.total_paid), 0)::numeric AS revenue
      FROM pet_center.room_types rt
      LEFT JOIN pet_center.boarding_records br_period 
        ON br_period.room_type_id = rt.room_type_id 
        AND br_period.planned_check_in_at BETWEEN $1 AND $2
      LEFT JOIN boarding_revenue brev ON brev.room_type_id = rt.room_type_id
      GROUP BY rt.room_type_id, rt.room_type_name, rt.capacity
    `;
    const result = await query(sql, [period.from, period.to]);
    return result.rows;
  },

  // ===================== MEDICAL =====================
  getMedicalSummary: async (period: ReportPeriodDto) => {
    const sql = `
      SELECT 
        (SELECT COUNT(*)::int FROM pet_center.medical_appointments WHERE scheduled_at BETWEEN $1 AND $2) AS total_appointments,
        (SELECT COUNT(*)::int FROM pet_center.medical_exams WHERE exam_date BETWEEN $1::date AND $2::date) AS total_exams,
        (SELECT COUNT(*)::int FROM pet_center.prescriptions WHERE prescribed_at BETWEEN $1::date AND $2::date) AS total_prescriptions
    `;
    const result = await query(sql, [period.from, period.to]);
    return result.rows[0];
  },

  getAppointmentStatusCounts: async (period: ReportPeriodDto) => {
    const sql = `
      SELECT 
        appointment_status AS status,
        COUNT(appointment_id)::int AS count
      FROM pet_center.medical_appointments
      WHERE scheduled_at BETWEEN $1 AND $2
      GROUP BY appointment_status
    `;
    const result = await query(sql, [period.from, period.to]);
    return result.rows;
  },

  getExamTypeCounts: async (period: ReportPeriodDto) => {
    const sql = `
      SELECT 
        et.type_name AS label,
        COUNT(ma.appointment_id)::int AS count
      FROM pet_center.medical_appointments ma
      JOIN pet_center.exam_types et ON et.exam_type_id = ma.exam_type_id
      WHERE ma.scheduled_at BETWEEN $1 AND $2
      GROUP BY et.type_name
    `;
    const result = await query(sql, [period.from, period.to]);
    return result.rows;
  },

  getDoctorPerformance: async (period: ReportPeriodDto) => {
    const sql = `
      SELECT 
        u.user_id AS doctor_id,
        u.full_name AS doctor_name,
        (SELECT COUNT(*)::int FROM pet_center.medical_appointments ma WHERE ma.veterinarian_user_id = u.user_id AND ma.scheduled_at BETWEEN $1 AND $2) AS assigned_appointments,
        (SELECT COUNT(*)::int FROM pet_center.medical_exams me WHERE me.examined_by_veterinarian_id = u.user_id AND me.exam_date BETWEEN $1::date AND $2::date) AS medical_exam_count,
        (SELECT COUNT(*)::int FROM pet_center.prescriptions pr JOIN pet_center.medical_exams me2 ON me2.exam_id = pr.exam_id WHERE me2.examined_by_veterinarian_id = u.user_id AND pr.prescribed_at BETWEEN $1::date AND $2::date) AS prescription_count
      FROM pet_center.users u
      WHERE u.role = 'Doctor' AND u.account_status = 'active'
    `;
    const result = await query(sql, [period.from, period.to]);
    return result.rows;
  },

  // ===================== CUSTOMERS =====================
  getCustomerPetSummary: async (period: ReportPeriodDto) => {
    const sql = `
      SELECT 
        (SELECT COUNT(*)::int FROM pet_center.users WHERE role = 'Owner' AND created_at BETWEEN $1 AND $2) AS new_owners,
        (SELECT COUNT(*)::int FROM pet_center.users WHERE account_status = 'active') AS active_accounts,
        (SELECT COUNT(*)::int FROM pet_center.pets) AS total_pets
    `;
    const result = await query(sql, [period.from, period.to]);
    return result.rows[0];
  },

  getUserRoleCounts: async () => {
    const sql = `
      SELECT 
        role AS status,
        COUNT(user_id)::int AS count
      FROM pet_center.users
      GROUP BY role
    `;
    const result = await query(sql, []);
    return result.rows;
  },

  getPetSpeciesCounts: async () => {
    const sql = `
      SELECT 
        species AS status,
        COUNT(pet_id)::int AS count
      FROM pet_center.pets
      GROUP BY species
    `;
    const result = await query(sql, []);
    return result.rows;
  },

  getAccountStatusCounts: async () => {
    const sql = `
      SELECT 
        account_status AS status,
        COUNT(user_id)::int AS count
      FROM pet_center.users
      GROUP BY account_status
    `;
    const result = await query(sql, []);
    return result.rows;
  }
};
