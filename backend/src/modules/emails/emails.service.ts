import { query } from "../../db/query.js";
import * as repo from "./emails.repository.js";
import nodemailer from "nodemailer";

interface SendOwnerEmailOptions {
  receiverUserId: string;
  templateKey: string;
  subject: string;
  html: string;
  relatedObjectType?: string;
  relatedObjectId?: string;
  metadata?: Record<string, unknown>;
}

const getTransporter = () => {
  if (!process.env.SMTP_HOST) {
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export async function sendOwnerEmail(options: SendOwnerEmailOptions) {
  try {
    const userResult = await query<{ email: string, role: string }>(
      `SELECT email, role FROM pet_center.users WHERE user_id = $1 AND account_status = 'active'`,
      [options.receiverUserId]
    );

    const user = userResult.rows[0];

    if (!user) {
      return { skipped: true, reason: "USER_NOT_FOUND_OR_INACTIVE" };
    }

    if (user.role !== "Owner") {
      return { skipped: true, reason: "NON_OWNER" };
    }

    let log;
    try {
      log = await repo.createEmailLog({
        receiverUserId: options.receiverUserId,
        receiverEmail: user.email,
        templateKey: options.templateKey,
        subject: options.subject,
        relatedObjectType: options.relatedObjectType,
        relatedObjectId: options.relatedObjectId,
        metadata: options.metadata,
      });

      const transporter = getTransporter();

      if (!transporter) {
        console.log(`[DEV EMAIL MOCK] To: ${user.email} | Subject: ${options.subject}`);
        await repo.updateEmailLogStatus(log.email_log_id, "sent", "mock_message_id");
        return { skipped: false, success: true, messageId: "mock_message_id" };
      }

      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || '"PetCenter" <noreply@petcenter.com>',
        to: user.email,
        subject: options.subject,
        html: options.html,
      });

      await repo.updateEmailLogStatus(log.email_log_id, "sent", info.messageId);
      return { skipped: false, success: true, messageId: info.messageId };
    } catch (innerError: any) {
      if (log) {
        await repo.updateEmailLogStatus(log.email_log_id, "failed", innerError.message);
      }
      throw innerError;
    }
  } catch (error: any) {
    console.error("Failed to send email:", error);
    // Don't throw, just log and return error so we don't break the main flow
    return { skipped: false, success: false, error: error.message };
  }
}
