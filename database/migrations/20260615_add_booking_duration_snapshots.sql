BEGIN;

ALTER TABLE pet_center.medical_appointments
  ADD COLUMN duration_minutes INTEGER;

UPDATE pet_center.medical_appointments ma
SET duration_minutes = COALESCE(s.estimated_duration_minutes, 60)
FROM pet_center.exam_types et
LEFT JOIN pet_center.services s ON s.service_id = et.service_id
WHERE et.exam_type_id = ma.exam_type_id;

UPDATE pet_center.medical_appointments
SET duration_minutes = 60
WHERE duration_minutes IS NULL;

ALTER TABLE pet_center.medical_appointments
  ALTER COLUMN duration_minutes SET NOT NULL,
  ADD CONSTRAINT chk_medical_appointments_duration
    CHECK (duration_minutes > 0);

ALTER TABLE pet_center.grooming_tickets
  ADD COLUMN duration_minutes INTEGER;

UPDATE pet_center.grooming_tickets gt
SET duration_minutes = durations.total_duration_minutes
FROM (
  SELECT
    gti.grooming_ticket_id,
    COALESCE(
      SUM(COALESCE(s.estimated_duration_minutes, 30) * gti.quantity),
      30
    )::INTEGER AS total_duration_minutes
  FROM pet_center.grooming_ticket_items gti
  JOIN pet_center.services s ON s.service_id = gti.service_id
  GROUP BY gti.grooming_ticket_id
) durations
WHERE durations.grooming_ticket_id = gt.grooming_ticket_id;

UPDATE pet_center.grooming_tickets
SET duration_minutes = 30
WHERE duration_minutes IS NULL;

ALTER TABLE pet_center.grooming_tickets
  ALTER COLUMN duration_minutes SET NOT NULL,
  ADD CONSTRAINT chk_grooming_duration
    CHECK (duration_minutes > 0);

COMMIT;
