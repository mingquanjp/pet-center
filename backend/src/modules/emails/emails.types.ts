export interface EmailLogRow {
  email_log_id: string;
  receiver_user_id: string | null;
  receiver_email: string;
  template_key: string;
  subject: string;
  related_object_type: string | null;
  related_object_id: string | null;
  status: "pending" | "sent" | "failed";
  provider_message_id: string | null;
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
  metadata: Record<string, unknown>;
}

export interface SendEmailPayload {
  receiverUserId: string;
  receiverEmail: string;
  templateKey: string;
  subject: string;
  relatedObjectType?: string;
  relatedObjectId?: string;
  metadata?: Record<string, unknown>;
  html: string;
}
