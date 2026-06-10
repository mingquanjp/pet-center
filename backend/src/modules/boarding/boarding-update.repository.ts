import type { PoolClient } from 'pg';
import { query } from '../../db/query.js';
import { withTransaction } from '../../db/transactions.js';
import { createId } from '../../shared/utils/id.js';
import type {
  BoardingBookingPetRow,
  BoardingRecordCreatedDto,
  BoardingRecordDetailRow,
  BoardingRecordListFilters,
  BoardingRecordListRow,
  BoardingUpdateRow,
  BoardingRoomTypeAvailabilityRow,
  CountRow,
  CreateBoardingRecordInput
} from './boarding.types.js';
import { toAttachmentUrlArray } from './staff/staff-boarding.repository.js';

export async function findPublishedBoardingUpdates(boardingRecordId: string): Promise<BoardingUpdateRow[]> {
  const result = await query<BoardingUpdateRow>(
    `SELECT
       boarding_update_id,
       updated_at,
       update_note,
       attachment_url,
       alert_level
     FROM pet_center.boarding_updates
     WHERE boarding_record_id = $1
       AND visibility_status = 'published'
     ORDER BY updated_at DESC, boarding_update_id DESC`,
    [boardingRecordId]
  );

  return result.rows;
}

export async function findBoardingUpdatesByBoardingRecordId(
  boardingRecordId: string,
  options: { visibilityStatus?: "draft" | "published" } = {}
) {
  const params: unknown[] = [boardingRecordId];
  const clauses = ["bu.boarding_record_id = $1"];

  if (options.visibilityStatus) {
    params.push(options.visibilityStatus);
    clauses.push(`bu.visibility_status = $${params.length}`);
  }

  const sql = `
    SELECT
      bu.boarding_update_id,
      bu.boarding_record_id,
      bu.created_by_user_id,
      staff.full_name AS created_by_full_name,
      bu.updated_at,
      bu.update_note,
      bu.attachment_url,
      bu.alert_level,
      bu.visibility_status
    FROM pet_center.boarding_updates bu
    LEFT JOIN pet_center.users staff ON staff.user_id = bu.created_by_user_id
    WHERE ${clauses.join(" AND ")}
    ORDER BY bu.updated_at DESC
  `;
  const result = await query(sql, params);
  return result.rows;
}

export async function findLatestDraftUpdateByBoardingIdAndUserId(boardingRecordId: string, userId: string) {
  const sql = `
    SELECT
      bu.boarding_update_id,
      bu.boarding_record_id,
      bu.created_by_user_id,
      staff.full_name AS created_by_full_name,
      bu.updated_at,
      bu.update_note,
      bu.attachment_url,
      bu.alert_level,
      bu.visibility_status
    FROM pet_center.boarding_updates bu
    LEFT JOIN pet_center.users staff ON staff.user_id = bu.created_by_user_id
    WHERE bu.boarding_record_id = $1
      AND bu.created_by_user_id = $2
      AND bu.visibility_status = 'draft'
    ORDER BY bu.updated_at DESC
    LIMIT 1
  `;
  const result = await query(sql, [boardingRecordId, userId]);
  return result.rows[0] || null;
}

export async function insertBoardingUpdate(params: {
  boardingUpdateId?: string;
  boardingRecordId: string;
  createdByUserId?: string;
  userId?: string;
  updateNote?: string;
  description?: string;
  attachmentUrl?: string | string[] | null;
  attachmentUrls?: string[] | null;
  alertLevel: "normal" | "attention" | "urgent";
  visibilityStatus: "draft" | "published";
}) {
  const sql = `
    INSERT INTO pet_center.boarding_updates (
      boarding_update_id,
      boarding_record_id,
      created_by_user_id,
      update_note,
      attachment_url,
      alert_level,
      visibility_status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const result = await query(sql, [
    params.boardingUpdateId ?? await createId("bup"),
    params.boardingRecordId,
    params.createdByUserId ?? params.userId,
    params.updateNote ?? params.description,
    toAttachmentUrlArray(params),
    params.alertLevel,
    params.visibilityStatus
  ]);
  return result.rows[0];
}

export async function insertBoardingUpdateIfNotDuplicate(params: {
  boardingUpdateId?: string;
  boardingRecordId: string;
  createdByUserId?: string;
  userId?: string;
  updateNote?: string;
  description?: string;
  attachmentUrl?: string | string[] | null;
  attachmentUrls?: string[] | null;
  alertLevel: "normal" | "attention" | "urgent";
  visibilityStatus: "draft" | "published";
}) {
  return withTransaction(async (client) => {
    const createdByUserId = params.createdByUserId ?? params.userId;
    const updateNote = params.updateNote ?? params.description;

    await client.query(
      "SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))",
      [params.boardingRecordId, createdByUserId ?? "anonymous"]
    );

    if (params.visibilityStatus === "published") {
      const duplicate = await client.query(
        `SELECT *
         FROM pet_center.boarding_updates
         WHERE boarding_record_id = $1
           AND created_by_user_id IS NOT DISTINCT FROM $2
           AND update_note = $3
           AND alert_level = $4
           AND visibility_status = 'published'
           AND updated_at >= NOW() - INTERVAL '2 minutes'
         ORDER BY updated_at DESC
         LIMIT 1`,
        [params.boardingRecordId, createdByUserId, updateNote, params.alertLevel]
      );

      if (duplicate.rows[0]) {
        return duplicate.rows[0];
      }
    }

    const result = await client.query(
      `INSERT INTO pet_center.boarding_updates (
        boarding_update_id,
        boarding_record_id,
        created_by_user_id,
        update_note,
        attachment_url,
        alert_level,
        visibility_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        params.boardingUpdateId ?? await createId("bup", client),
        params.boardingRecordId,
        createdByUserId,
        updateNote,
        toAttachmentUrlArray(params),
        params.alertLevel,
        params.visibilityStatus
      ]
    );

    return result.rows[0];
  });
}

export async function updateBoardingUpdate(params: {
  boardingUpdateId: string;
  updateNote?: string;
  description?: string;
  attachmentUrl?: string | string[] | null;
  attachmentUrls?: string[] | null;
  alertLevel: "normal" | "attention" | "urgent";
  visibilityStatus: "draft" | "published";
}) {
  const sql = `
    UPDATE pet_center.boarding_updates
    SET update_note = $2,
        attachment_url = $3,
        alert_level = $4,
        visibility_status = $5,
        updated_at = NOW()
    WHERE boarding_update_id = $1
    RETURNING *
  `;
  const result = await query(sql, [
    params.boardingUpdateId,
    params.updateNote ?? params.description,
    toAttachmentUrlArray(params),
    params.alertLevel,
    params.visibilityStatus
  ]);
  return result.rows[0];
}

export async function publishDraftBoardingUpdate(params: {
  boardingUpdateId: string;
  updateNote?: string;
  description?: string;
  attachmentUrl?: string | string[] | null;
  attachmentUrls?: string[] | null;
  alertLevel: "normal" | "attention" | "urgent";
}) {
  return updateBoardingUpdate({
    boardingUpdateId: params.boardingUpdateId,
    updateNote: params.updateNote,
    description: params.description,
    attachmentUrl: params.attachmentUrl,
    attachmentUrls: params.attachmentUrls,
    alertLevel: params.alertLevel,
    visibilityStatus: "published"
  });
}

export async function deleteDraftBoardingUpdate(boardingRecordId: string, userId: string) {
  const sql = `
    DELETE FROM pet_center.boarding_updates
    WHERE boarding_update_id = (
      SELECT boarding_update_id
      FROM pet_center.boarding_updates
      WHERE boarding_record_id = $1
        AND created_by_user_id = $2
        AND visibility_status = 'draft'
      ORDER BY updated_at DESC
      LIMIT 1
    )
  `;
  await query(sql, [boardingRecordId, userId]);
}

export async function createInitialBoardingUpdate(params: {
  boardingUpdateId: string;
  boardingRecordId: string;
  createdByUserId: string;
  updateNote: string;
}, client: PoolClient) {
  const sql = `
    INSERT INTO pet_center.boarding_updates (
      boarding_update_id,
      boarding_record_id,
      created_by_user_id,
      updated_at,
      update_note,
      attachment_url,
      alert_level,
      visibility_status
    )
    VALUES (
      $1, $2, $3, NOW(), $4, ARRAY[]::TEXT[], 'normal', 'published'
    )
  `;
  await client.query(sql, [
    params.boardingUpdateId,
    params.boardingRecordId,
    params.createdByUserId,
    params.updateNote
  ]);
}

