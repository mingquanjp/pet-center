import type { PoolClient } from "pg";
import { query } from "../../db/query.js";
import { createId } from "../../shared/utils/id.js";

type QueryClient = Pick<PoolClient, "query">;

export type PetActivityCategory =
  | "medical"
  | "vaccination"
  | "grooming"
  | "boarding"
  | "invoice"
  | "payment"
  | "profile";

export type PetActivityStatus =
  | "scheduled"
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "rejected"
  | "failed";

export type PetActivitySourceType =
  | "medical_appointment"
  | "medical_exam"
  | "vaccination"
  | "prescription"
  | "follow_up_instruction"
  | "grooming_ticket"
  | "boarding_record"
  | "boarding_update"
  | "invoice"
  | "payment"
  | "pet";

export type UpsertPetActivityLogInput = {
  petId: string;
  ownerUserId: string;
  actorUserId?: string | null;
  activityCategory: PetActivityCategory;
  activityType: string;
  activityStatus: PetActivityStatus;
  occurredAt?: Date | string | null;
  title: string;
  summary?: string | null;
  sourceType: PetActivitySourceType;
  sourceId: string;
  visibilityStatus?: "visible" | "hidden";
  metadata?: Record<string, unknown>;
};

export async function upsertPetActivityLog(
  input: UpsertPetActivityLogInput,
  client?: QueryClient
): Promise<string> {
  const executor = client ?? { query };
  const activityLogId = await createId("elog", client);
  const result = await executor.query<{ activity_log_id: string }>(
    `INSERT INTO pet_center.pet_activity_logs (
       activity_log_id, pet_id, owner_user_id, actor_user_id,
       activity_category, activity_type, activity_status, occurred_at,
       title, summary, source_type, source_id, visibility_status, metadata
     )
     VALUES (
       $1, $2, $3, $4,
       $5, $6, $7, COALESCE($8::timestamptz, now()),
       $9, $10, $11, $12, $13, $14::jsonb
     )
     ON CONFLICT (source_type, source_id, activity_type)
     DO UPDATE SET
       pet_id = EXCLUDED.pet_id,
       owner_user_id = EXCLUDED.owner_user_id,
       actor_user_id = EXCLUDED.actor_user_id,
       activity_category = EXCLUDED.activity_category,
       activity_status = EXCLUDED.activity_status,
       occurred_at = EXCLUDED.occurred_at,
       title = EXCLUDED.title,
       summary = EXCLUDED.summary,
       visibility_status = EXCLUDED.visibility_status,
       metadata = EXCLUDED.metadata
     RETURNING activity_log_id`,
    [
      activityLogId,
      input.petId,
      input.ownerUserId,
      input.actorUserId ?? null,
      input.activityCategory,
      input.activityType,
      input.activityStatus,
      input.occurredAt ?? null,
      input.title,
      input.summary ?? null,
      input.sourceType,
      input.sourceId,
      input.visibilityStatus ?? "visible",
      JSON.stringify(input.metadata ?? {})
    ]
  );

  return result.rows[0]!.activity_log_id;
}

export type PetActivityContext = {
  pet_id: string;
  pet_name: string;
  owner_user_id: string;
};

export async function findGroomingActivityContext(ticketId: string): Promise<PetActivityContext | null> {
  const result = await query<PetActivityContext>(
    `SELECT gt.pet_id, p.pet_name, gt.owner_user_id
     FROM pet_center.grooming_tickets gt
     JOIN pet_center.pets p ON p.pet_id = gt.pet_id
     WHERE gt.grooming_ticket_id = $1
     LIMIT 1`,
    [ticketId]
  );

  return result.rows[0] ?? null;
}

export async function findInvoiceActivityContext(invoiceId: string): Promise<PetActivityContext | null> {
  const result = await query<PetActivityContext>(
    `SELECT i.pet_id, p.pet_name, i.owner_user_id
     FROM pet_center.invoices i
     JOIN pet_center.pets p ON p.pet_id = i.pet_id
     WHERE i.invoice_id = $1
     LIMIT 1`,
    [invoiceId]
  );

  return result.rows[0] ?? null;
}
