import { notifyUser, notifyRole } from "./notifications.service.js";
import { sendOwnerEmail } from "../emails/emails.service.js";
import * as templates from "../emails/email-templates.js";
import { query } from "../../db/query.js";

// -- APPOINTMENTS --

export async function notifyAppointmentCreated(appointmentId: string) {
  try {
    const result = await query(
      `SELECT a.*, p.pet_name as pet_name 
       FROM pet_center.medical_appointments a
       JOIN pet_center.pets p ON a.pet_id = p.pet_id
       WHERE a.appointment_id = $1`,
      [appointmentId]
    );
    const appointment = result.rows[0];
    if (!appointment) return;

    const scheduledAt = new Date(appointment.scheduled_at).toLocaleString('vi-VN');

    // App: Owner
    await notifyUser(appointment.owner_user_id, {
      title: "Đặt lịch khám thành công",
      message: `Bạn đã đặt lịch khám cho ${appointment.pet_name} vào ${scheduledAt}. Lịch đang chờ xác nhận.`,
      notificationType: "APPOINTMENT_CREATED",
      relatedObjectType: "medical_appointment",
      relatedObjectId: appointment.appointment_id,
      dedupeKey: `APPOINTMENT_CREATED:OWNER:${appointment.appointment_id}`,
      metadata: { petName: appointment.pet_name, actionUrl: `/owner/appointments/${appointment.appointment_id}` }
    });

    // Email: Owner
    await sendOwnerEmail({
      receiverUserId: appointment.owner_user_id,
      templateKey: "appointment_created_owner",
      subject: "PetCenter - Đặt lịch khám thành công",
      html: templates.getAppointmentCreatedTemplate(appointment.pet_name, scheduledAt),
      relatedObjectType: "medical_appointment",
      relatedObjectId: appointment.appointment_id
    });

    // App: Staff
    await notifyRole("Staff", {
      title: "Có lịch khám mới",
      message: `Lịch khám của ${appointment.pet_name} đang chờ xác nhận.`,
      notificationType: "APPOINTMENT_CREATED",
      relatedObjectType: "medical_appointment",
      relatedObjectId: appointment.appointment_id,
      dedupeKey: `APPOINTMENT_CREATED:STAFF:${appointment.appointment_id}`,
      metadata: { petName: appointment.pet_name, actionUrl: `/staff/appointments/${appointment.appointment_id}` }
    });
  } catch (err) {
    console.error("notifyAppointmentCreated error:", err);
  }
}

export async function notifyAppointmentConfirmed(appointmentId: string) {
  try {
    const result = await query(
      `SELECT a.*, p.pet_name as pet_name 
       FROM pet_center.medical_appointments a
       JOIN pet_center.pets p ON a.pet_id = p.pet_id
       WHERE a.appointment_id = $1`,
      [appointmentId]
    );
    const appointment = result.rows[0];
    if (!appointment) return;

    const scheduledAt = new Date(appointment.scheduled_at).toLocaleString('vi-VN');

    // App: Owner
    await notifyUser(appointment.owner_user_id, {
      title: "Lịch khám đã được xác nhận",
      message: `Lịch khám của ${appointment.pet_name} vào ${scheduledAt} đã được xác nhận.`,
      notificationType: "APPOINTMENT_CONFIRMED",
      relatedObjectType: "medical_appointment",
      relatedObjectId: appointment.appointment_id,
      dedupeKey: `APPOINTMENT_CONFIRMED:OWNER:${appointment.appointment_id}`,
      metadata: { petName: appointment.pet_name, actionUrl: `/owner/appointments/${appointment.appointment_id}` }
    });

    // Email: Owner
    await sendOwnerEmail({
      receiverUserId: appointment.owner_user_id,
      templateKey: "appointment_confirmed_owner",
      subject: "PetCenter - Lịch khám đã được xác nhận",
      html: templates.getAppointmentConfirmedTemplate(appointment.pet_name, scheduledAt),
      relatedObjectType: "medical_appointment",
      relatedObjectId: appointment.appointment_id
    });

    // App: Doctor (if assigned)
    if (appointment.veterinarian_user_id) {
      await notifyUser(appointment.veterinarian_user_id, {
        title: "Bạn được phân công lịch khám",
        message: `Bạn được phân công khám cho ${appointment.pet_name} vào ${scheduledAt}.`,
        notificationType: "APPOINTMENT_CONFIRMED",
        relatedObjectType: "medical_appointment",
        relatedObjectId: appointment.appointment_id,
        dedupeKey: `APPOINTMENT_CONFIRMED:DOCTOR:${appointment.veterinarian_user_id}:${appointment.appointment_id}`,
        metadata: { petName: appointment.pet_name, actionUrl: `/doctor/appointments` }
      });
    }
  } catch (err) {
    console.error("notifyAppointmentConfirmed error:", err);
  }
}

export async function notifyAppointmentRejected(appointmentId: string) {
  try {
    const result = await query(
      `SELECT a.*, p.pet_name as pet_name 
       FROM pet_center.medical_appointments a
       JOIN pet_center.pets p ON a.pet_id = p.pet_id
       WHERE a.appointment_id = $1`,
      [appointmentId]
    );
    const appointment = result.rows[0];
    if (!appointment) return;

    const scheduledAt = new Date(appointment.scheduled_at).toLocaleString('vi-VN');

    // App: Owner
    await notifyUser(appointment.owner_user_id, {
      title: "Lịch khám đã bị từ chối",
      message: `Rất tiếc, lịch khám của ${appointment.pet_name} vào ${scheduledAt} đã bị từ chối.`,
      notificationType: "APPOINTMENT_REJECTED",
      relatedObjectType: "medical_appointment",
      relatedObjectId: appointment.appointment_id,
      dedupeKey: `APPOINTMENT_REJECTED:OWNER:${appointment.appointment_id}`,
      metadata: { petName: appointment.pet_name, actionUrl: `/owner/appointments/${appointment.appointment_id}` }
    });

    // Email: Owner
    await sendOwnerEmail({
      receiverUserId: appointment.owner_user_id,
      templateKey: "appointment_rejected_owner",
      subject: "PetCenter - Lịch khám đã bị từ chối",
      html: templates.getAppointmentRejectedTemplate(appointment.pet_name, scheduledAt),
      relatedObjectType: "medical_appointment",
      relatedObjectId: appointment.appointment_id
    });
  } catch (err) {
    console.error("notifyAppointmentRejected error:", err);
  }
}

export async function notifyAppointmentReminder1Day(appointmentId: string) {
  try {
    const result = await query(
      `SELECT a.*, p.pet_name as pet_name 
       FROM pet_center.medical_appointments a
       JOIN pet_center.pets p ON a.pet_id = p.pet_id
       WHERE a.appointment_id = $1`,
      [appointmentId]
    );
    const appointment = result.rows[0];
    if (!appointment) return;

    const scheduledAt = new Date(appointment.scheduled_at).toLocaleString('vi-VN');

    // App: Owner
    await notifyUser(appointment.owner_user_id, {
      title: "Nhắc nhở lịch khám ngày mai",
      message: `Bạn có lịch khám cho ${appointment.pet_name} vào ${scheduledAt}.`,
      notificationType: "APPOINTMENT_REMINDER_1_DAY",
      relatedObjectType: "medical_appointment",
      relatedObjectId: appointment.appointment_id,
      dedupeKey: `APPOINTMENT_REMINDER_1_DAY:OWNER:${appointment.appointment_id}`,
      metadata: { petName: appointment.pet_name, actionUrl: `/owner/appointments/${appointment.appointment_id}` }
    });

    // Email: Owner
    await sendOwnerEmail({
      receiverUserId: appointment.owner_user_id,
      templateKey: "appointment_reminder_1_day_owner",
      subject: "PetCenter - Nhắc nhở lịch khám ngày mai",
      html: templates.getAppointmentReminderTemplate(appointment.pet_name, scheduledAt),
      relatedObjectType: "medical_appointment",
      relatedObjectId: appointment.appointment_id
    });
  } catch (err) {
    console.error("notifyAppointmentReminder1Day error:", err);
  }
}

// -- GROOMING --

export async function notifyGroomingCreated(groomingTicketId: string) {
  try {
    const result = await query(
      `SELECT g.*, p.pet_name as pet_name 
       FROM pet_center.grooming_tickets g
       JOIN pet_center.pets p ON g.pet_id = p.pet_id
       WHERE g.grooming_ticket_id = $1`,
      [groomingTicketId]
    );
    const ticket = result.rows[0];
    if (!ticket) return;

    const scheduledAt = new Date(ticket.scheduled_at).toLocaleString('vi-VN');

    // App: Owner
    await notifyUser(ticket.owner_user_id, {
      title: "Đặt lịch spa thành công",
      message: `Bạn đã đặt lịch spa cho ${ticket.pet_name} vào ${scheduledAt}. Lịch đang chờ xác nhận.`,
      notificationType: "GROOMING_CREATED",
      relatedObjectType: "grooming_ticket",
      relatedObjectId: ticket.grooming_ticket_id,
      dedupeKey: `GROOMING_CREATED:OWNER:${ticket.grooming_ticket_id}`,
      metadata: { petName: ticket.pet_name, actionUrl: `/owner/grooming` } // Adjust if details page exists
    });

    // Email: Owner
    await sendOwnerEmail({
      receiverUserId: ticket.owner_user_id,
      templateKey: "grooming_created_owner",
      subject: "PetCenter - Đặt lịch spa thành công",
      html: templates.getGroomingCreatedTemplate(ticket.pet_name, scheduledAt),
      relatedObjectType: "grooming_ticket",
      relatedObjectId: ticket.grooming_ticket_id
    });

    // App: Staff
    await notifyRole("Staff", {
      title: "Có lịch spa mới",
      message: `Lịch spa của ${ticket.pet_name} đang chờ xác nhận.`,
      notificationType: "GROOMING_CREATED",
      relatedObjectType: "grooming_ticket",
      relatedObjectId: ticket.grooming_ticket_id,
      dedupeKey: `GROOMING_CREATED:STAFF:${ticket.grooming_ticket_id}`,
      metadata: { petName: ticket.pet_name, actionUrl: `/staff/grooming` }
    });
  } catch (err) {
    console.error("notifyGroomingCreated error:", err);
  }
}

export async function notifyGroomingAccepted(groomingTicketId: string) {
  try {
    const result = await query(
      `SELECT g.*, p.pet_name as pet_name 
       FROM pet_center.grooming_tickets g
       JOIN pet_center.pets p ON g.pet_id = p.pet_id
       WHERE g.grooming_ticket_id = $1`,
      [groomingTicketId]
    );
    const ticket = result.rows[0];
    if (!ticket) return;

    const scheduledAt = new Date(ticket.scheduled_at).toLocaleString('vi-VN');

    // App: Owner
    await notifyUser(ticket.owner_user_id, {
      title: "Lịch spa đã được tiếp nhận",
      message: `Lịch spa của ${ticket.pet_name} vào ${scheduledAt} đã được tiếp nhận.`,
      notificationType: "GROOMING_ACCEPTED",
      relatedObjectType: "grooming_ticket",
      relatedObjectId: ticket.grooming_ticket_id,
      dedupeKey: `GROOMING_ACCEPTED:OWNER:${ticket.grooming_ticket_id}`,
      metadata: { petName: ticket.pet_name, actionUrl: `/owner/grooming` }
    });
  } catch (err) {
    console.error("notifyGroomingAccepted error:", err);
  }
}

export async function notifyGroomingCompleted(groomingTicketId: string) {
  try {
    const result = await query(
      `SELECT g.*, p.pet_name as pet_name 
       FROM pet_center.grooming_tickets g
       JOIN pet_center.pets p ON g.pet_id = p.pet_id
       WHERE g.grooming_ticket_id = $1`,
      [groomingTicketId]
    );
    const ticket = result.rows[0];
    if (!ticket) return;

    const date = new Date(ticket.scheduled_at).toLocaleDateString('vi-VN');

    // App: Owner
    await notifyUser(ticket.owner_user_id, {
      title: "Hoàn tất dịch vụ spa",
      message: `Dịch vụ spa của ${ticket.pet_name} đã hoàn tất. Bé đã sẵn sàng để đón!`,
      notificationType: "GROOMING_COMPLETED",
      relatedObjectType: "grooming_ticket",
      relatedObjectId: ticket.grooming_ticket_id,
      dedupeKey: `GROOMING_COMPLETED:OWNER:${ticket.grooming_ticket_id}`,
      metadata: { petName: ticket.pet_name, actionUrl: `/owner/grooming` }
    });

    // Email: Owner
    await sendOwnerEmail({
      receiverUserId: ticket.owner_user_id,
      templateKey: "grooming_completed_owner",
      subject: "PetCenter - Hoàn tất dịch vụ spa",
      html: templates.getGroomingCompletedTemplate(ticket.pet_name, date),
      relatedObjectType: "grooming_ticket",
      relatedObjectId: ticket.grooming_ticket_id
    });
  } catch (err) {
    console.error("notifyGroomingCompleted error:", err);
  }
}

// -- BOARDING --

export async function notifyBoardingCreated(boardingRecordId: string) {
  try {
    const result = await query(
      `SELECT b.*, p.pet_name as pet_name 
       FROM pet_center.boarding_records b
       JOIN pet_center.pets p ON b.pet_id = p.pet_id
       WHERE b.boarding_record_id = $1`,
      [boardingRecordId]
    );
    const record = result.rows[0];
    if (!record) return;

    const checkIn = new Date(record.planned_check_in_at).toLocaleString('vi-VN');

    await notifyUser(record.owner_user_id, {
      title: "Đặt phòng lưu trú thành công",
      message: `Bạn đã đặt phòng lưu trú cho ${record.pet_name} dự kiến check-in ${checkIn}. Lịch đang chờ xác nhận.`,
      notificationType: "BOARDING_CREATED",
      relatedObjectType: "boarding_record",
      relatedObjectId: record.boarding_record_id,
      dedupeKey: `BOARDING_CREATED:OWNER:${record.boarding_record_id}`,
      metadata: { petName: record.pet_name, actionUrl: `/owner/boarding` }
    });

    await sendOwnerEmail({
      receiverUserId: record.owner_user_id,
      templateKey: "boarding_created_owner",
      subject: "PetCenter - Đặt phòng lưu trú thành công",
      html: templates.getBoardingCreatedTemplate(record.pet_name, checkIn),
      relatedObjectType: "boarding_record",
      relatedObjectId: record.boarding_record_id
    });

    await notifyRole("Staff", {
      title: "Có lịch lưu trú mới",
      message: `Lịch lưu trú của ${record.pet_name} đang chờ xác nhận.`,
      notificationType: "BOARDING_CREATED",
      relatedObjectType: "boarding_record",
      relatedObjectId: record.boarding_record_id,
      dedupeKey: `BOARDING_CREATED:STAFF:${record.boarding_record_id}`,
      metadata: { petName: record.pet_name, actionUrl: `/staff/boarding/${record.boarding_record_id}` }
    });
  } catch (err) {
    console.error("notifyBoardingCreated error:", err);
  }
}

export async function notifyBoardingConfirmed(boardingRecordId: string) {
  try {
    const result = await query(
      `SELECT b.*, p.pet_name as pet_name 
       FROM pet_center.boarding_records b
       JOIN pet_center.pets p ON b.pet_id = p.pet_id
       WHERE b.boarding_record_id = $1`,
      [boardingRecordId]
    );
    const record = result.rows[0];
    if (!record) return;

    const checkIn = new Date(record.planned_check_in_at).toLocaleString('vi-VN');

    await notifyUser(record.owner_user_id, {
      title: "Lịch lưu trú đã được xác nhận",
      message: `Lịch lưu trú của ${record.pet_name} (check-in: ${checkIn}) đã được xác nhận.`,
      notificationType: "BOARDING_CONFIRMED",
      relatedObjectType: "boarding_record",
      relatedObjectId: record.boarding_record_id,
      dedupeKey: `BOARDING_CONFIRMED:OWNER:${record.boarding_record_id}`,
      metadata: { petName: record.pet_name, actionUrl: `/owner/boarding` }
    });

    await sendOwnerEmail({
      receiverUserId: record.owner_user_id,
      templateKey: "boarding_confirmed_owner",
      subject: "PetCenter - Lịch lưu trú đã được xác nhận",
      html: templates.getBoardingConfirmedTemplate(record.pet_name, checkIn),
      relatedObjectType: "boarding_record",
      relatedObjectId: record.boarding_record_id
    });
  } catch (err) {
    console.error("notifyBoardingConfirmed error:", err);
  }
}

export async function notifyBoardingRejected(boardingRecordId: string) {
  try {
    const result = await query(
      `SELECT b.*, p.pet_name as pet_name 
       FROM pet_center.boarding_records b
       JOIN pet_center.pets p ON b.pet_id = p.pet_id
       WHERE b.boarding_record_id = $1`,
      [boardingRecordId]
    );
    const record = result.rows[0];
    if (!record) return;

    const checkIn = new Date(record.planned_check_in_at).toLocaleString('vi-VN');

    await notifyUser(record.owner_user_id, {
      title: "Lịch lưu trú bị từ chối",
      message: `Lịch lưu trú của ${record.pet_name} (check-in: ${checkIn}) đã bị từ chối.`,
      notificationType: "BOARDING_REJECTED",
      relatedObjectType: "boarding_record",
      relatedObjectId: record.boarding_record_id,
      dedupeKey: `BOARDING_REJECTED:OWNER:${record.boarding_record_id}`,
      metadata: { petName: record.pet_name, actionUrl: `/owner/boarding` }
    });

    await sendOwnerEmail({
      receiverUserId: record.owner_user_id,
      templateKey: "boarding_rejected_owner",
      subject: "PetCenter - Lịch lưu trú bị từ chối",
      html: templates.getBoardingRejectedTemplate(record.pet_name, checkIn),
      relatedObjectType: "boarding_record",
      relatedObjectId: record.boarding_record_id
    });
  } catch (err) {
    console.error("notifyBoardingRejected error:", err);
  }
}

export async function notifyBoardingCancelled(boardingRecordId: string) {
  try {
    const result = await query(
      `SELECT b.*, p.pet_name as pet_name 
       FROM pet_center.boarding_records b
       JOIN pet_center.pets p ON b.pet_id = p.pet_id
       WHERE b.boarding_record_id = $1`,
      [boardingRecordId]
    );
    const record = result.rows[0];
    if (!record) return;

    const checkIn = new Date(record.planned_check_in_at).toLocaleString('vi-VN');

    await notifyUser(record.owner_user_id, {
      title: "Lịch lưu trú đã hủy",
      message: `Lịch lưu trú của ${record.pet_name} (check-in: ${checkIn}) đã được hủy.`,
      notificationType: "BOARDING_CANCELLED",
      relatedObjectType: "boarding_record",
      relatedObjectId: record.boarding_record_id,
      dedupeKey: `BOARDING_CANCELLED:OWNER:${record.boarding_record_id}`,
      metadata: { petName: record.pet_name, actionUrl: `/owner/boarding` }
    });

    await sendOwnerEmail({
      receiverUserId: record.owner_user_id,
      templateKey: "boarding_cancelled_owner",
      subject: "PetCenter - Lịch lưu trú đã hủy",
      html: templates.getBoardingCancelledTemplate(record.pet_name, checkIn),
      relatedObjectType: "boarding_record",
      relatedObjectId: record.boarding_record_id
    });
  } catch (err) {
    console.error("notifyBoardingCancelled error:", err);
  }
}

export async function notifyBoardingCheckinReminder1Day(boardingRecordId: string) {
  try {
    const result = await query(
      `SELECT b.*, p.pet_name as pet_name 
       FROM pet_center.boarding_records b
       JOIN pet_center.pets p ON b.pet_id = p.pet_id
       WHERE b.boarding_record_id = $1`,
      [boardingRecordId]
    );
    const record = result.rows[0];
    if (!record) return;

    const checkIn = new Date(record.planned_check_in_at).toLocaleString('vi-VN');

    await notifyUser(record.owner_user_id, {
      title: "Nhắc nhở lịch lưu trú ngày mai",
      message: `Ngày mai là ngày check-in lưu trú cho ${record.pet_name} (${checkIn}). Vui lòng mang bé đến đúng giờ.`,
      notificationType: "BOARDING_CHECKIN_REMINDER_1_DAY",
      relatedObjectType: "boarding_record",
      relatedObjectId: record.boarding_record_id,
      dedupeKey: `BOARDING_CHECKIN_REMINDER_1_DAY:OWNER:${record.boarding_record_id}`,
      metadata: { petName: record.pet_name, actionUrl: `/owner/boarding` }
    });

    await sendOwnerEmail({
      receiverUserId: record.owner_user_id,
      templateKey: "boarding_checkin_reminder_1_day_owner",
      subject: "PetCenter - Nhắc nhở lịch lưu trú ngày mai",
      html: templates.getBoardingReminderTemplate(record.pet_name, checkIn),
      relatedObjectType: "boarding_record",
      relatedObjectId: record.boarding_record_id
    });
  } catch (err) {
    console.error("notifyBoardingCheckinReminder1Day error:", err);
  }
}

export async function notifyBoardingCheckedIn(boardingRecordId: string) {
  try {
    const result = await query(
      `SELECT b.*, p.pet_name as pet_name 
       FROM pet_center.boarding_records b
       JOIN pet_center.pets p ON b.pet_id = p.pet_id
       WHERE b.boarding_record_id = $1`,
      [boardingRecordId]
    );
    const record = result.rows[0];
    if (!record) return;

    await notifyUser(record.owner_user_id, {
      title: "Check-in lưu trú thành công",
      message: `${record.pet_name} đã check-in và bắt đầu kỳ lưu trú tại PetCenter.`,
      notificationType: "BOARDING_CHECKED_IN",
      relatedObjectType: "boarding_record",
      relatedObjectId: record.boarding_record_id,
      dedupeKey: `BOARDING_CHECKED_IN:OWNER:${record.boarding_record_id}`,
      metadata: { petName: record.pet_name, actionUrl: `/owner/boarding` }
    });
  } catch (err) {
    console.error("notifyBoardingCheckedIn error:", err);
  }
}

export async function notifyBoardingUpdateCreated(updateId: string) {
  try {
    const result = await query(
      `SELECT u.*, b.owner_user_id, p.pet_name as pet_name 
       FROM pet_center.boarding_updates u
       JOIN pet_center.boarding_records b ON u.boarding_record_id = b.boarding_record_id
       JOIN pet_center.pets p ON b.pet_id = p.pet_id
       WHERE u.boarding_update_id = $1`,
      [updateId]
    );
    const update = result.rows[0];
    if (!update || update.visibility_status !== 'published') return;

    await notifyUser(update.owner_user_id, {
      title: "Cập nhật tình trạng lưu trú",
      message: `Đã có cập nhật tình trạng mới cho ${update.pet_name}.`,
      notificationType: "BOARDING_UPDATE_CREATED",
      relatedObjectType: "boarding_update",
      relatedObjectId: update.boarding_update_id,
      dedupeKey: `BOARDING_UPDATE_CREATED:OWNER:${update.boarding_update_id}`,
      metadata: { petName: update.pet_name, actionUrl: `/owner/boarding` } // Adjust if details page
    });

    if (update.alert_level === 'urgent') {
      await sendOwnerEmail({
        receiverUserId: update.owner_user_id,
        templateKey: "boarding_update_urgent_owner",
        subject: "PetCenter - Cập nhật KHẨN về tình trạng lưu trú",
        html: templates.getBoardingUpdateUrgentTemplate(update.pet_name),
        relatedObjectType: "boarding_update",
        relatedObjectId: update.boarding_update_id
      });
    }
  } catch (err) {
    console.error("notifyBoardingUpdateCreated error:", err);
  }
}

// -- PAYMENT --

export async function notifyPaymentSuccess(paymentId: string) {
  try {
    const result = await query(
      `SELECT p.*, i.owner_user_id 
       FROM pet_center.payments p
       JOIN pet_center.invoices i ON p.invoice_id = i.invoice_id
       WHERE p.payment_id = $1`,
      [paymentId]
    );
    const payment = result.rows[0];
    if (!payment) return;

    await notifyUser(payment.owner_user_id, {
      title: "Thanh toán thành công",
      message: `Hóa đơn ${payment.invoice_id} đã được thanh toán thành công số tiền ${Number(payment.paid_amount).toLocaleString('vi-VN')} VNĐ.`,
      notificationType: "PAYMENT_SUCCESS",
      relatedObjectType: "payment",
      relatedObjectId: payment.payment_id,
      dedupeKey: `PAYMENT_SUCCESS:OWNER:${payment.payment_id}`,
      metadata: { invoiceCode: payment.invoice_id, actionUrl: `/owner` } // To invoices later
    });

    await sendOwnerEmail({
      receiverUserId: payment.owner_user_id,
      templateKey: "payment_success_owner",
      subject: "PetCenter - Thanh toán thành công",
      html: templates.getPaymentSuccessTemplate(Number(payment.paid_amount), payment.invoice_id),
      relatedObjectType: "payment",
      relatedObjectId: payment.payment_id
    });
  } catch (err) {
    console.error("notifyPaymentSuccess error:", err);
  }
}

export async function notifyPaymentFailed(paymentOrAttemptId: string, invoiceId: string, isAttempt = false) {
  try {
    const result = await query(
      `SELECT owner_user_id FROM pet_center.invoices WHERE invoice_id = $1`,
      [invoiceId]
    );
    const ownerUserId = result.rows[0]?.owner_user_id;
    if (!ownerUserId) return;

    await notifyUser(ownerUserId, {
      title: "Thanh toán thất bại",
      message: `Giao dịch thanh toán cho hóa đơn ${invoiceId} đã thất bại. Vui lòng thử lại.`,
      notificationType: "PAYMENT_FAILED",
      relatedObjectType: isAttempt ? "online_payment_attempt" : "payment",
      relatedObjectId: paymentOrAttemptId,
      dedupeKey: `PAYMENT_FAILED:OWNER:${paymentOrAttemptId}`,
      metadata: { invoiceCode: invoiceId, actionUrl: `/owner` }
    });

    await sendOwnerEmail({
      receiverUserId: ownerUserId,
      templateKey: "payment_failed_owner",
      subject: "PetCenter - Thanh toán thất bại",
      html: templates.getPaymentFailedTemplate(invoiceId),
      relatedObjectType: isAttempt ? "online_payment_attempt" : "payment",
      relatedObjectId: paymentOrAttemptId
    });


  } catch (err) {
    console.error("notifyPaymentFailed error:", err);
  }
}

// -- MEDICAL --

export async function notifyMedicalExamCompleted(examId: string) {
  try {
    const result = await query(
      `SELECT e.*, p.pet_name as pet_name, a.owner_user_id
       FROM pet_center.medical_exams e
       JOIN pet_center.medical_appointments a ON e.appointment_id = a.appointment_id
       JOIN pet_center.pets p ON a.pet_id = p.pet_id
       WHERE e.exam_id = $1`,
      [examId]
    );
    const exam = result.rows[0];
    if (!exam) return;

    const date = new Date(exam.exam_date).toLocaleDateString('vi-VN');

    await notifyUser(exam.owner_user_id, {
      title: "Hoàn tất khám bệnh",
      message: `Phiếu khám bệnh của ${exam.pet_name} ngày ${date} đã hoàn tất.`,
      notificationType: "MEDICAL_EXAM_COMPLETED",
      relatedObjectType: "medical_exam",
      relatedObjectId: exam.exam_id,
      dedupeKey: `MEDICAL_EXAM_COMPLETED:OWNER:${exam.exam_id}`,
      metadata: { petName: exam.pet_name, actionUrl: `/owner/pets/${exam.pet_id}` }
    });

    await sendOwnerEmail({
      receiverUserId: exam.owner_user_id,
      templateKey: "medical_exam_completed_owner",
      subject: "PetCenter - Hoàn tất khám bệnh",
      html: templates.getMedicalExamCompletedTemplate(exam.pet_name, date),
      relatedObjectType: "medical_exam",
      relatedObjectId: exam.exam_id
    });
  } catch (err) {
    console.error("notifyMedicalExamCompleted error:", err);
  }
}
