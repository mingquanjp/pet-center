BEGIN;

ALTER TABLE pet_center.medical_exams
  ALTER COLUMN examined_by_veterinarian_id DROP NOT NULL,
  ALTER COLUMN exam_date DROP NOT NULL,
  ALTER COLUMN exam_date DROP DEFAULT,
  ALTER COLUMN exam_status SET DEFAULT 'waiting';

ALTER TABLE pet_center.medical_exams
  DROP CONSTRAINT chk_medical_exams_status;

ALTER TABLE pet_center.medical_exams
  ADD CONSTRAINT chk_medical_exams_status
  CHECK (exam_status IN ('waiting', 'examining', 'result_recorded', 'prescribed', 'follow_up_required'));

INSERT INTO pet_center.medical_exams (
  exam_id,
  appointment_id,
  exam_status,
  exam_date,
  examined_by_veterinarian_id
)
SELECT
  'mex' || nextval('pet_center.mex_id_seq'),
  ma.appointment_id,
  CASE
    WHEN ma.examination_status = 'examining' THEN 'examining'
    WHEN ma.examination_status IN ('completed', 'follow_up') THEN 'result_recorded'
    ELSE 'waiting'
  END,
  CASE
    WHEN ma.examination_status IN ('completed', 'follow_up') THEN (ma.scheduled_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
    ELSE NULL
  END,
  ma.veterinarian_user_id
FROM pet_center.medical_appointments ma
LEFT JOIN pet_center.medical_exams me ON me.appointment_id = ma.appointment_id
WHERE me.exam_id IS NULL;

COMMIT;
