BEGIN;

CREATE SEQUENCE IF NOT EXISTS pet_center.own_id_seq;
CREATE SEQUENCE IF NOT EXISTS pet_center.stf_id_seq;
CREATE SEQUENCE IF NOT EXISTS pet_center.doc_id_seq;
CREATE SEQUENCE IF NOT EXISTS pet_center.adm_id_seq;
CREATE SEQUENCE IF NOT EXISTS pet_center.prt_id_seq;
CREATE SEQUENCE IF NOT EXISTS pet_center.pet_id_seq;
CREATE SEQUENCE IF NOT EXISTS pet_center.hp_id_seq;
CREATE SEQUENCE IF NOT EXISTS pet_center.svc_id_seq;
CREATE SEQUENCE IF NOT EXISTS pet_center.med_id_seq;
CREATE SEQUENCE IF NOT EXISTS pet_center.appt_id_seq;
CREATE SEQUENCE IF NOT EXISTS pet_center.mex_id_seq;
CREATE SEQUENCE IF NOT EXISTS pet_center.efd_id_seq;
CREATE SEQUENCE IF NOT EXISTS pet_center.efv_id_seq;
CREATE SEQUENCE IF NOT EXISTS pet_center.rx_id_seq;
CREATE SEQUENCE IF NOT EXISTS pet_center.rxi_id_seq;
CREATE SEQUENCE IF NOT EXISTS pet_center.vac_id_seq;
CREATE SEQUENCE IF NOT EXISTS pet_center.fui_id_seq;
CREATE SEQUENCE IF NOT EXISTS pet_center.spa_id_seq;
CREATE SEQUENCE IF NOT EXISTS pet_center.gti_id_seq;
CREATE SEQUENCE IF NOT EXISTS pet_center.rt_id_seq;
CREATE SEQUENCE IF NOT EXISTS pet_center.brd_id_seq;
CREATE SEQUENCE IF NOT EXISTS pet_center.bup_id_seq;
CREATE SEQUENCE IF NOT EXISTS pet_center.inv_id_seq;
CREATE SEQUENCE IF NOT EXISTS pet_center.inl_id_seq;
CREATE SEQUENCE IF NOT EXISTS pet_center.pay_id_seq;
CREATE SEQUENCE IF NOT EXISTS pet_center.noti_id_seq;
CREATE SEQUENCE IF NOT EXISTS pet_center.elog_id_seq;
CREATE SEQUENCE IF NOT EXISTS pet_center.rem_id_seq;

DO $$
DECLARE
    item RECORD;
    max_value BIGINT;
BEGIN
    FOR item IN
        SELECT *
        FROM (VALUES
            ('own',  'users',                     'user_id'),
            ('stf',  'users',                     'user_id'),
            ('doc',  'users',                     'user_id'),
            ('adm',  'users',                     'user_id'),
            ('prt',  'password_reset_tokens',     'reset_token_id'),
            ('pet',  'pets',                      'pet_id'),
            ('hp',   'pet_health_profiles',       'health_profile_id'),
            ('svc',  'services',                  'service_id'),
            ('med',  'medicines',                 'medicine_id'),
            ('appt', 'medical_appointments',      'appointment_id'),
            ('mex',  'medical_exams',             'exam_id'),
            ('efd',  'exam_field_definitions',    'field_definition_id'),
            ('efv',  'medical_exam_field_values', 'field_value_id'),
            ('rx',   'prescriptions',             'prescription_id'),
            ('rxi',  'prescription_items',        'prescription_item_id'),
            ('vac',  'vaccinations',              'vaccination_id'),
            ('fui',  'follow_up_instructions',    'follow_up_id'),
            ('spa',  'grooming_tickets',          'grooming_ticket_id'),
            ('gti',  'grooming_ticket_items',     'grooming_ticket_item_id'),
            ('rt',   'room_types',                'room_type_id'),
            ('brd',  'boarding_records',          'boarding_record_id'),
            ('bup',  'boarding_updates',          'boarding_update_id'),
            ('inv',  'invoices',                  'invoice_id'),
            ('inl',  'invoice_lines',             'invoice_line_id'),
            ('pay',  'payments',                  'payment_id'),
            ('noti', 'notifications',             'notification_id'),
            ('elog', 'email_logs',                 'email_log_id'),
            ('rem',  'notification_reminders',    'reminder_id')
        ) AS prefixes(prefix, table_name, column_name)
    LOOP
        EXECUTE format(
            'SELECT max(substring(%1$I FROM %2$L)::bigint)
             FROM pet_center.%3$I
             WHERE %1$I ~ %4$L',
            item.column_name,
            '^' || item.prefix || '([0-9]+)$',
            item.table_name,
            '^' || item.prefix || '[0-9]+$'
        )
        INTO max_value;

        IF max_value IS NULL THEN
            PERFORM setval(
                ('pet_center.' || item.prefix || '_id_seq')::regclass,
                1,
                false
            );
        ELSE
            PERFORM setval(
                ('pet_center.' || item.prefix || '_id_seq')::regclass,
                max_value,
                true
            );
        END IF;
    END LOOP;
END
$$;

COMMIT;
