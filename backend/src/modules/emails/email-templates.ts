const wrapEmail = (title: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; margin: 0; padding: 40px 20px; color: #374151; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .header { background-color: #059669; color: #ffffff; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 1px; }
    .content { padding: 40px 30px; line-height: 1.6; font-size: 16px; }
    .content h2 { color: #111827; font-size: 22px; margin-top: 0; margin-bottom: 20px; font-weight: 700; }
    .content p { margin: 0 0 16px; }
    .highlight { color: #059669; font-weight: 600; }
    .footer { background-color: #f3f4f6; padding: 24px; text-align: center; font-size: 14px; color: #6b7280; }
    .footer p { margin: 4px 0; }
    .button { display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; margin-top: 20px; text-align: center; }
    
    /* Box styles */
    .info-box { background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; margin: 24px 0; border-radius: 12px; }
    .warning-box { background-color: #fffbeb; border: 1px solid #fde68a; padding: 20px; margin: 24px 0; border-radius: 12px; }
    .error-box { background-color: #fef2f2; border: 1px solid #fecaca; padding: 20px; margin: 24px 0; border-radius: 12px; }
    
    /* Box text */
    .info-box p { color: #166534; margin: 0; }
    .warning-box p { color: #92400e; margin: 0; }
    .error-box p { color: #991b1b; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>PetCenter</h1>
    </div>
    <div class="content">
      <h2>${title}</h2>
      ${content}
      <br/>
      <p>Trân trọng,<br><span class="highlight">Đội ngũ PetCenter</span></p>
    </div>
    <div class="footer">
      <p>Đây là email tự động từ hệ thống PetCenter. Vui lòng không trả lời email này.</p>
      <p>&copy; ${new Date().getFullYear()} PetCenter. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const getAppointmentCreatedTemplate = (petName: string, scheduledAt: string) => wrapEmail(
  "Đặt lịch khám thành công",
  `
  <p>Chào bạn,</p>
  <p>Hệ thống đã ghi nhận yêu cầu đặt lịch khám cho bé <span class="highlight">${petName}</span> vào <span class="highlight">${scheduledAt}</span>.</p>
  <div class="info-box">
    <p>Lịch của bạn đang chờ xác nhận từ nhân viên PetCenter. Chúng tôi sẽ thông báo ngay khi lịch được phê duyệt.</p>
  </div>
  `
);

export const getAppointmentConfirmedTemplate = (petName: string, scheduledAt: string) => wrapEmail(
  "Lịch khám đã được xác nhận",
  `
  <p>Tuyệt vời!</p>
  <p>Lịch khám của bé <span class="highlight">${petName}</span> vào <span class="highlight">${scheduledAt}</span> đã được <b>xác nhận thành công</b>.</p>
  <p>Bạn vui lòng đưa bé đến phòng khám đúng giờ để chúng tôi có thể phục vụ tốt nhất nhé.</p>
  `
);

export const getAppointmentRejectedTemplate = (petName: string, scheduledAt: string) => wrapEmail(
  "Lịch khám bị từ chối",
  `
  <p>Chào bạn,</p>
  <p>Rất tiếc, lịch khám của bé <span class="highlight">${petName}</span> vào thời gian <span class="highlight">${scheduledAt}</span> không thể thực hiện được do phòng khám đã kín lịch hoặc có sự kiện đột xuất.</p>
  <div class="warning-box">
    <p>Bạn vui lòng truy cập ứng dụng để đặt lại lịch vào một khung giờ khác, hoặc liên hệ trực tiếp hotline để được hỗ trợ nhanh nhất.</p>
  </div>
  `
);

export const getAppointmentReminderTemplate = (petName: string, scheduledAt: string) => wrapEmail(
  "Nhắc nhở lịch khám ngày mai",
  `
  <p>Chào bạn,</p>
  <p>PetCenter xin nhắc nhở bạn về lịch khám cho bé <span class="highlight">${petName}</span> vào <b>ngày mai</b>, lúc <span class="highlight">${scheduledAt}</span>.</p>
  <p>Vui lòng sắp xếp thời gian đưa bé đến đúng giờ nhé!</p>
  `
);

export const getBoardingCreatedTemplate = (petName: string, checkIn: string) => wrapEmail(
  "Đặt phòng lưu trú thành công",
  `
  <p>Chào bạn,</p>
  <p>Bạn đã tạo thành công phiếu đặt phòng lưu trú cho bé <span class="highlight">${petName}</span> với dự kiến check-in vào <span class="highlight">${checkIn}</span>.</p>
  <div class="info-box">
    <p>Lịch lưu trú đang ở trạng thái chờ xác nhận. PetCenter sẽ liên hệ hoặc gửi thông báo cho bạn trong thời gian sớm nhất.</p>
  </div>
  `
);

export const getBoardingConfirmedTemplate = (petName: string, checkIn: string) => wrapEmail(
  "Lịch lưu trú đã được xác nhận",
  `
  <p>Chào bạn,</p>
  <p>Lịch lưu trú của bé <span class="highlight">${petName}</span> (Check-in: <span class="highlight">${checkIn}</span>) đã được <b>xác nhận</b>.</p>
  <p>Hãy chuẩn bị hành trang cho bé và đưa bé đến PetCenter đúng ngày nhé.</p>
  `
);

export const getBoardingRejectedTemplate = (petName: string, checkIn: string) => wrapEmail(
  "Lịch lưu trú bị từ chối",
  `
  <p>Chào bạn,</p>
  <p>Rất tiếc, lịch lưu trú của bé <span class="highlight">${petName}</span> (Check-in: <span class="highlight">${checkIn}</span>) đã bị <b>từ chối</b> do trung tâm đã hết phòng trống phù hợp.</p>
  <div class="warning-box">
    <p>Vui lòng liên hệ với PetCenter để được tư vấn thêm hoặc đổi ngày lưu trú.</p>
  </div>
  `
);

export const getBoardingCancelledTemplate = (petName: string, checkIn: string) => wrapEmail(
  "Lịch lưu trú đã hủy",
  `
  <p>Chào bạn,</p>
  <p>Lịch lưu trú của bé <span class="highlight">${petName}</span> (Check-in: <span class="highlight">${checkIn}</span>) đã được <b>hủy bỏ</b> thành công theo yêu cầu.</p>
  <p>Hẹn gặp lại bé ở những dịp khác tại PetCenter!</p>
  `
);

export const getBoardingReminderTemplate = (petName: string, checkIn: string) => wrapEmail(
  "Nhắc nhở lịch check-in lưu trú",
  `
  <p>Chào bạn,</p>
  <p>Ngày mai là ngày bé <span class="highlight">${petName}</span> sẽ bắt đầu kỳ nghỉ tại PetCenter (Check-in: <span class="highlight">${checkIn}</span>).</p>
  <p>Bạn nhớ mang đủ giấy tờ tiêm phòng (nếu có) và đồ dùng cần thiết của bé nhé!</p>
  `
);

export const getPaymentSuccessTemplate = (amount: number, invoiceId: string) => wrapEmail(
  "Thanh toán thành công",
  `
  <p>Cảm ơn bạn!</p>
  <p>Chúng tôi đã nhận được khoản thanh toán cho hóa đơn <span class="highlight">${invoiceId}</span>.</p>
  <div class="info-box" style="text-align: center;">
    <p style="font-size: 24px; font-weight: 800;">${amount.toLocaleString()} VNĐ</p>
  </div>
  <p>Chúc bạn và thú cưng luôn mạnh khỏe và vui vẻ!</p>
  `
);

export const getPaymentFailedTemplate = (invoiceId: string) => wrapEmail(
  "Thanh toán thất bại",
  `
  <p>Chào bạn,</p>
  <p>Giao dịch thanh toán online cho hóa đơn <span class="highlight">${invoiceId}</span> của bạn đã <b>không thành công</b> hoặc bị hủy.</p>
  <div class="error-box">
    <p>Vui lòng kiểm tra lại tài khoản ngân hàng/ví điện tử hoặc thử thực hiện thanh toán lại trên ứng dụng.</p>
  </div>
  `
);

export const getMedicalExamCompletedTemplate = (petName: string, date: string) => wrapEmail(
  "Hoàn tất khám bệnh",
  `
  <p>Chào bạn,</p>
  <p>Bé <span class="highlight">${petName}</span> đã hoàn thành buổi khám bệnh vào ngày <span class="highlight">${date}</span>.</p>
  <p>Bạn có thể xem chi tiết toa thuốc và dặn dò của bác sĩ trực tiếp trên ứng dụng PetCenter.</p>
  `
);

export const getGroomingCreatedTemplate = (petName: string, scheduledAt: string) => wrapEmail(
  "Đặt lịch Spa thành công",
  `
  <p>Chào bạn,</p>
  <p>Lịch Spa/Grooming cho bé <span class="highlight">${petName}</span> vào lúc <span class="highlight">${scheduledAt}</span> đã được ghi nhận.</p>
  <div class="info-box">
    <p>Lịch đang ở trạng thái chờ. Chúng tôi sẽ thông báo ngay khi có nhân viên tiếp nhận.</p>
  </div>
  `
);

export const getGroomingCompletedTemplate = (petName: string, date: string) => wrapEmail(
  "Hoàn tất dịch vụ Spa",
  `
  <p>Tuyệt vời!</p>
  <p>Bé <span class="highlight">${petName}</span> đã thực hiện xong dịch vụ Spa/Grooming vào ngày <span class="highlight">${date}</span>.</p>
  <p>Bé đang rất thơm tho và sạch sẽ, bạn hãy đến đón bé về nhé!</p>
  `
);

export const getBoardingUpdateUrgentTemplate = (petName: string) => wrapEmail(
  "[QUAN TRỌNG] Cập nhật lưu trú khẩn cấp",
  `
  <p>Chào bạn,</p>
  <div class="error-box">
    <p>Vừa có một báo cáo <b>cần sự chú ý ngay lập tức</b> liên quan đến tình hình lưu trú của bé <span class="highlight">${petName}</span>.</p>
  </div>
  <p>Vui lòng mở ứng dụng PetCenter để xem chi tiết hoặc gọi ngay cho hotline của chúng tôi để được hỗ trợ kịp thời!</p>
  `
);
