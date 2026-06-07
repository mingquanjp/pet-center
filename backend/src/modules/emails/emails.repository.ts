import { query } from "../../db/query.js";
import { createId } from "../../shared/utils/id.js";
import type { EmailLogRow } from "./emails.types.js";

export async function createEmailLog(
  payload: {
    receiverUserId: string;
    receiverEmail: string;
    templateKey: string;
    subject: string;
    relatedObjectType?: string;
    relatedObjectId?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<EmailLogRow> {
  const id = await createId("elog");
  
  const result = await query<EmailLogRow>(
    `
      INSERT INTO pet_center.email_logs (
        email_log_id,
        receiver_user_id,
        receiver_email,
        template_key,
        subject,
        related_object_type,
        related_object_id,
        metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
    [
      id,
      payload.receiverUserId,
      payload.receiverEmail,
      payload.templateKey,
      payload.subject,
      payload.relatedObjectType ?? null,
      payload.relatedObjectId ?? null,
      payload.metadata ?? {}
    ]
  );
  return result.rows[0];
}

export async function updateEmailLogStatus(
  emailLogId: string,
  status: "sent" | "failed",
  errorOrMessageId?: string
): Promise<EmailLogRow> {
  const isError = status === "failed";
  const result = await query<EmailLogRow>(
    `
      UPDATE pet_center.email_logs
      SET 
        status = $1,
        ${isError ? "error_message = $2" : "provider_message_id = $2"},
        sent_at = ${status === "sent" ? "now()" : "sent_at"}
      WHERE email_log_id = $3
      RETURNING *
    `,
    [status, errorOrMessageId ?? null, emailLogId]
  );
  return result.rows[0];
}
