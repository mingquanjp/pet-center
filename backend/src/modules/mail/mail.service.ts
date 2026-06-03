import nodemailer from "nodemailer";
import { env } from "../../config/env.js";
import { AppError } from "../../shared/errors/app-error.js";
import { httpStatus } from "../../shared/errors/http-status.js";

function assertSmtpConfigured(): void {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    throw new AppError("SMTP chưa được cấu hình", "SMTP_NOT_CONFIGURED", httpStatus.SERVICE_UNAVAILABLE);
  }
}

function createTransporter() {
  assertSmtpConfigured();

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });
}

function getFromAddress(): string {
  const fromName = env.MAIL_FROM || "PetCenter";
  return `${fromName} <${env.SMTP_USER}>`;
}

export async function sendOwnerAccountCreatedEmail(params: {
  to: string;
  ownerName: string;
  loginEmail: string;
  temporaryPassword: string;
}): Promise<void> {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: getFromAddress(),
    to: params.to,
    subject: "Chào mừng bạn đến với PetCenter - Thông tin tài khoản",
    text: [
      `Xin chào ${params.ownerName},`,
      "",
      "Chào mừng bạn đến với PetCenter! Hồ sơ khách hàng của bạn đã được khởi tạo thành công.",
      "",
      "THÔNG TIN ĐĂNG NHẬP",
      `Email: ${params.loginEmail}`,
      `Mật khẩu tạm thời: ${params.temporaryPassword}`,
      "",
      "Vui lòng đăng nhập và đổi mật khẩu trong lần truy cập đầu tiên để bảo mật thông tin.",
      "",
      "Trân trọng,",
      "Đội ngũ PetCenter"
    ].join("\n"),
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Chào mừng bạn đến với PetCenter</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                
                <!-- Header -->
                <tr>
                  <td align="center" style="background-color: #0D9488; padding: 32px 20px;">
                    <div style="display: inline-flex; align-items: center; justify-content: center; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 64px; height: 64px; margin-bottom: 16px;">
                      <img src="https://api.iconify.design/lucide/paw-print.svg?color=white" alt="PetCenter Logo" width="32" height="32" style="display: block;">
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">PetCenter</h1>
                    <p style="margin: 8px 0 0 0; color: #ccfbf1; font-size: 15px;">Hệ thống chăm sóc thú cưng</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 32px;">
                    <p style="margin: 0 0 20px 0; color: #0f172a; font-size: 16px; line-height: 1.6;">
                      Xin chào <strong style="color: #0D9488;">${params.ownerName}</strong>,
                    </p>
                    <p style="margin: 0 0 24px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                      Chào mừng bạn đến với PetCenter! Hồ sơ khách hàng của bạn đã được khởi tạo thành công bởi nhân viên tại quầy. Dưới đây là thông tin tài khoản để bạn có thể theo dõi dịch vụ của thú cưng:
                    </p>

                    <!-- Credentials Box -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 24px;">
                          <h3 style="margin: 0 0 16px 0; color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">THÔNG TIN ĐĂNG NHẬP</h3>
                          <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td width="120" style="padding: 0 0 12px 0; color: #64748B; font-size: 14px;">Email:</td>
                              <td style="padding: 0 0 12px 0; color: #0f172a; font-size: 15px; font-weight: 600;">${params.loginEmail}</td>
                            </tr>
                            <tr>
                              <td width="120" style="padding: 0; color: #64748B; font-size: 14px;">Mật khẩu:</td>
                              <td style="padding: 0;">
                                <code style="background-color: #e2e8f0; color: #0f172a; padding: 4px 8px; border-radius: 4px; font-size: 15px; font-weight: 600; font-family: monospace;">${params.temporaryPassword}</code>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 0 0 32px 0; color: #475569; font-size: 15px; line-height: 1.6; background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px;">
                      <strong>⚠️ Lưu ý:</strong> Vui lòng đổi mật khẩu ngay trong lần đăng nhập đầu tiên để đảm bảo an toàn cho tài khoản của bạn.
                    </p>

                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center">
                          <a href="http://localhost:3000/login" style="display: inline-block; background-color: #0D9488; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(13, 148, 136, 0.3);">
                            Đăng nhập ngay
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; text-align: center;">
                    <p style="margin: 0 0 8px 0; color: #64748B; font-size: 14px; font-weight: 600;">PetCenter</p>
                    <p style="margin: 0 0 16px 0; color: #94A3B8; font-size: 13px;">Hệ thống chăm sóc thú cưng chuyên nghiệp</p>
                    <p style="margin: 0; color: #cbd5e1; font-size: 12px;">
                      Đây là email tự động, vui lòng không trả lời.<br>
                      Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  });
}
