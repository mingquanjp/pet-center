import { appointmentRepository } from "./appointments.repository.js";
import { CreateAppointmentInput, AppointmentListQuery } from "./appointments.types.js";
import { AppError } from "../../shared/errors/app-error.js";
import { httpStatus } from "../../shared/errors/http-status.js";
import { query } from "../../db/query.js";

const getStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    'PENDING': 'Chờ xác nhận',
    'CONFIRMED': 'Đã xác nhận',
    'COMPLETED': 'Hoàn tất khám',
    'CANCELLED': 'Đã hủy'
  };
  return map[status] || status;
};

export class AppointmentService {
  async createAppointment(userId: string, data: CreateAppointmentInput) {
    // Check pet belongs to user
    const petCheck = await query<{ pet_id: string }>(
      "SELECT pet_id, pet_name, species, weight_kg, profile_image_url FROM pets WHERE pet_id = $1 AND owner_user_id = $2",
      [data.petId, userId]
    );

    if (petCheck.rowCount === null || petCheck.rowCount === 0) {
      throw new AppError("Thú cưng không tồn tại hoặc không thuộc quyền sở hữu của bạn", "FORBIDDEN", httpStatus.FORBIDDEN);
    }
    const petInfo = (petCheck as any).rows[0];

    // Check conflict
    const hasConflict = await appointmentRepository.checkConflict(
      data.petId, 
      data.appointmentDate, 
      data.appointmentTime
    );

    if (hasConflict) {
      throw new AppError("Thú cưng đã có lịch hẹn vào thời gian này", "CONFLICT", httpStatus.CONFLICT);
    }

    // Generate appointment code APP-{count+1} or LH-{random}
    const count = await appointmentRepository.countTotalAppointments();
    const code = `LH-${String(count + 1).padStart(6, '0')}`;

    const appointment = await appointmentRepository.create(userId, data, code);

    return {
      id: appointment.id,
      appointmentCode: appointment.appointment_code,
      pet: {
        id: data.petId,
        name: petInfo.pet_name,
        species: petInfo.species,
        weight: petInfo.weight_kg,
        avatarUrl: petInfo.profile_image_url
      },
      appointmentType: appointment.appointment_type,
      appointmentDate: data.appointmentDate,
      appointmentTime: data.appointmentTime,
      status: appointment.status,
      statusLabel: getStatusLabel(appointment.status),
      symptoms: appointment.symptoms,
      note: appointment.note
    };
  }

  async getMyList(userId: string, filter: AppointmentListQuery) {
    const { data, total } = await appointmentRepository.findList(userId, filter);

    const formattedData = data.map(item => ({
      ...item,
      statusLabel: getStatusLabel(item.status)
    }));

    return {
      data: formattedData,
      pagination: {
        page: filter.page,
        limit: filter.limit,
        total,
        totalPages: Math.ceil(total / filter.limit)
      }
    };
  }

  async getDetail(id: string, userId: string) {
    const data = await appointmentRepository.findById(id, userId);

    if (!data) {
      throw new AppError("Không tìm thấy lịch hẹn", "NOT_FOUND", httpStatus.NOT_FOUND);
    }

    // Generate timeline
    const isPending = data.status === 'PENDING';
    const isConfirmed = data.status === 'CONFIRMED';
    const isCompleted = data.status === 'COMPLETED';
    const isCancelled = data.status === 'CANCELLED';
    
    // Formatting date helper
    const formatDate = (d: Date) => {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = d.getHours();
        const mins = String(d.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'CH' : 'SA';
        const displayHours = String(hours % 12 || 12).padStart(2, '0');
        return `${day}/${month}/${year} - ${displayHours}:${mins} ${ampm}`;
    };

    const timeline = [];
    
    timeline.push({
      label: "Đã tạo lịch",
      status: "DONE",
      time: formatDate(new Date(data.created_at))
    });

    if (isCancelled) {
      timeline.push({
        label: "Đã hủy",
        status: "CURRENT",
        time: formatDate(new Date(data.updated_at)),
        description: "Lịch hẹn đã bị hủy."
      });
    } else {
      timeline.push({
        label: "Chờ trung tâm xác nhận",
        status: isPending ? "CURRENT" : "DONE",
        description: isPending ? "Hệ thống đang chờ nhân viên phòng khám tiếp nhận và xác nhận lịch hẹn của bạn." : undefined
      });

      timeline.push({
        label: "Đã xác nhận",
        status: isConfirmed ? "CURRENT" : (isCompleted ? "DONE" : "PENDING")
      });

      timeline.push({
        label: "Hoàn tất khám",
        status: isCompleted ? "DONE" : "PENDING"
      });
    }

    return {
      id: data.id,
      appointmentCode: data.appointment_code,
      appointmentType: data.appointment_type,
      appointmentDate: data.appointment_date_str,
      appointmentTime: data.appointment_time_str,
      status: data.status,
      statusLabel: getStatusLabel(data.status),
      symptoms: data.symptoms,
      note: data.note,
      createdAt: data.created_at,
      pet: {
        id: data.pet_id,
        name: data.pet_name,
        species: data.species,
        breed: data.breed,
        age: data.estimated_age,
        gender: data.gender,
        weight: data.weight_kg,
        avatarUrl: data.avatar_url
      },
      customer: {
        name: data.customer_name,
        phone: data.customer_phone,
        email: data.customer_email
      },
      timeline
    };
  }

  async cancelAppointment(id: string, userId: string) {
    const data = await appointmentRepository.findById(id, userId);

    if (!data) {
        throw new AppError("Không tìm thấy lịch hẹn", "NOT_FOUND", httpStatus.NOT_FOUND);
    }

    if (data.status !== 'PENDING' && data.status !== 'CONFIRMED') {
        throw new AppError("Chỉ có thể hủy lịch hẹn đang chờ xác nhận hoặc đã xác nhận", "BAD_REQUEST", httpStatus.BAD_REQUEST);
    }

    const updated = await appointmentRepository.updateStatus(id, 'CANCELLED');
    
    // fetch updated detail
    return this.getDetail(id, userId);
  }
}

export const appointmentService = new AppointmentService();
