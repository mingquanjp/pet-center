BEGIN;

ALTER TABLE pet_center.medicines
DROP CONSTRAINT IF EXISTS chk_medicines_unit;

UPDATE pet_center.medicines
SET unit = CASE unit
    WHEN 'ml' THEN 'bottle'
    WHEN 'dose' THEN 'tablet'
    WHEN 'other' THEN 'blister'
    ELSE unit
END
WHERE unit IN ('ml', 'dose', 'other');

ALTER TABLE pet_center.medicines
ADD CONSTRAINT chk_medicines_unit
CHECK (unit IN ('tablet', 'blister', 'packet', 'tube', 'bottle'));

COMMIT;
