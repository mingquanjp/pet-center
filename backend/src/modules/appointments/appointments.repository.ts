import { query } from "../../db/query.js";
import { AppointmentRecord, CreateAppointmentInput, AppointmentListQuery } from "./appointments.types.js";

export class AppointmentRepository {
  async countTotalAppointments(): Promise<number> {
    const result = await query<{ count: string }>(
      "SELECT COUNT(*) FROM appointments"
    );
    return parseInt(result.rows[0].count);
  }

  async checkConflict(petId: string, appointmentDate: string, appointmentTime: string): Promise<boolean> {
    const result = await query<{ id: string }>(
      `SELECT id FROM appointments 
       WHERE pet_id = $1 
         AND appointment_date = $2 
         AND appointment_time = $3 
         AND status NOT IN ('COMPLETED', 'CANCELLED')`,
      [petId, appointmentDate, appointmentTime]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  async create(userId: string, data: CreateAppointmentInput, code: string): Promise<AppointmentRecord> {
    const result = await query<AppointmentRecord>(
      `INSERT INTO appointments (
         appointment_code, user_id, pet_id, appointment_type, 
         appointment_date, appointment_time, symptoms, note
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        code,
        userId,
        data.petId,
        data.appointmentType,
        data.appointmentDate,
        data.appointmentTime,
        data.symptoms || null,
        data.note || null,
      ]
    );
    
    return result.rows[0];
  }

  async findList(userId: string, filter: AppointmentListQuery) {
    const offset = (filter.page - 1) * filter.limit;
    const values: any[] = [userId];
    const conditions: string[] = ["a.user_id = $1"];
    let paramIndex = 2;

    if (filter.keyword) {
      conditions.push(`(a.appointment_code ILIKE $${paramIndex} OR a.appointment_type ILIKE $${paramIndex} OR p.pet_name ILIKE $${paramIndex})`);
      values.push(`%${filter.keyword}%`);
      paramIndex++;
    }

    if (filter.petId) {
      conditions.push(`a.pet_id = $${paramIndex}`);
      values.push(filter.petId);
      paramIndex++;
    }

    if (filter.status) {
      conditions.push(`a.status = $${paramIndex}`);
      values.push(filter.status);
      paramIndex++;
    }

    if (filter.fromDate) {
      conditions.push(`a.appointment_date >= $${paramIndex}`);
      values.push(filter.fromDate);
      paramIndex++;
    }

    if (filter.toDate) {
      conditions.push(`a.appointment_date <= $${paramIndex}`);
      values.push(filter.toDate);
      paramIndex++;
    }

    const whereClause = conditions.join(" AND ");

    const dataQuery = `
      SELECT 
        a.id,
        a.appointment_code as "appointmentCode",
        a.appointment_type as "serviceName",
        TO_CHAR(a.appointment_date, 'YYYY-MM-DD') as "appointmentDate",
        TO_CHAR(a.appointment_time, 'HH24:MI') as "appointmentTime",
        a.status,
        p.pet_name as "petName",
        p.species as "petSpecies",
        p.profile_image_url as "petAvatarUrl"
      FROM appointments a
      JOIN pets p ON a.pet_id = p.pet_id
      WHERE ${whereClause}
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) 
      FROM appointments a
      JOIN pets p ON a.pet_id = p.pet_id
      WHERE ${whereClause}
    `;

    const countResult = await query<{ count: string }>(countQuery, values);
    const dataValues = [...values, filter.limit, offset];
    const dataResult = await query<any>(dataQuery, dataValues);

    return {
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  async findById(id: string, userId: string) {
    const result = await query<any>(
      `SELECT 
         a.*,
         TO_CHAR(a.appointment_date, 'YYYY-MM-DD') as appointment_date_str,
         TO_CHAR(a.appointment_time, 'HH24:MI') as appointment_time_str,
         p.pet_name, p.species, p.breed, p.estimated_age, p.gender, p.weight_kg, p.profile_image_url as avatar_url,
         u.full_name as customer_name, u.phone_number as customer_phone, u.email as customer_email
       FROM appointments a
       JOIN pets p ON a.pet_id = p.pet_id
       JOIN users u ON a.user_id = u.user_id
       WHERE a.id = $1 AND a.user_id = $2`,
      [id, userId]
    );
    
    return result.rows[0] ? result.rows[0] : null;
  }

  async updateStatus(id: string, newStatus: string): Promise<AppointmentRecord> {
    const result = await query<AppointmentRecord>(
      `UPDATE appointments 
       SET status = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING *`,
      [newStatus, id]
    );
    return result.rows[0];
  }
}

export const appointmentRepository = new AppointmentRepository();
