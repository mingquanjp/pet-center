-- PostgreSQL initialization script for Pet Center.

BEGIN;

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;

DROP SCHEMA IF EXISTS pet_center CASCADE;
CREATE SCHEMA pet_center;
SET search_path TO pet_center, public;

CREATE TABLE users (
    user_id VARCHAR(30) PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email public.citext NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    phone_number VARCHAR(20),
    address TEXT,
    role VARCHAR(30) NOT NULL,
    account_status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_users_role CHECK (role IN ('Owner', 'Staff', 'Doctor', 'Admin')),
    CONSTRAINT chk_users_account_status CHECK (account_status IN ('active', 'locked', 'inactive')),
    CONSTRAINT chk_users_email_format CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
    CONSTRAINT chk_users_phone_number CHECK (phone_number IS NULL OR phone_number ~ '^[0-9+() .-]{8,20}$')
);

CREATE TABLE pets (
    pet_id VARCHAR(30) PRIMARY KEY,
    owner_user_id VARCHAR(30) NOT NULL REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    pet_name VARCHAR(100) NOT NULL,
    species VARCHAR(30) NOT NULL,
    breed VARCHAR(100),
    gender VARCHAR(20),
    birth_date DATE,
    estimated_age NUMERIC(5,2),
    fur_color VARCHAR(80),
    weight_kg NUMERIC(7,2),
    profile_image_url TEXT,
    identifying_marks TEXT,
    pet_status VARCHAR(20) NOT NULL DEFAULT 'active',
    CONSTRAINT chk_pets_species CHECK (species IN ('Dog', 'Cat', 'Other')),
    CONSTRAINT chk_pets_gender CHECK (gender IS NULL OR gender IN ('male', 'female', 'unknown')),
    CONSTRAINT chk_pets_age CHECK (estimated_age IS NULL OR estimated_age >= 0),
    CONSTRAINT chk_pets_weight CHECK (weight_kg IS NULL OR weight_kg > 0),
    CONSTRAINT chk_pets_birth_date CHECK (birth_date IS NULL OR birth_date <= CURRENT_DATE),
    CONSTRAINT chk_pets_status CHECK (pet_status IN ('active', 'inactive', 'deceased')),
    CONSTRAINT chk_pets_age_source CHECK (birth_date IS NOT NULL OR estimated_age IS NOT NULL)
);

CREATE TABLE pet_health_profiles (
    health_profile_id VARCHAR(30) PRIMARY KEY,
    pet_id VARCHAR(30) NOT NULL UNIQUE REFERENCES pets(pet_id) ON UPDATE CASCADE ON DELETE CASCADE,
    medical_history TEXT,
    allergy_notes TEXT,
    chronic_condition_notes TEXT,
    food_type VARCHAR(100),
    feeding_portion VARCHAR(150),
    special_care_notes TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE services (
    service_id VARCHAR(30) PRIMARY KEY,
    service_name VARCHAR(150) NOT NULL,
    service_category VARCHAR(30) NOT NULL,
    description TEXT,
    estimated_duration_minutes INTEGER,
    base_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    service_status VARCHAR(20) NOT NULL DEFAULT 'active',
    CONSTRAINT chk_services_category CHECK (service_category IN ('medical', 'grooming', 'boarding', 'medicine', 'other')),
    CONSTRAINT chk_services_duration CHECK (estimated_duration_minutes IS NULL OR estimated_duration_minutes > 0),
    CONSTRAINT chk_services_base_price CHECK (base_price >= 0),
    CONSTRAINT chk_services_status CHECK (service_status IN ('active', 'inactive'))
);

CREATE TABLE exam_types (
    exam_type_id VARCHAR(30) PRIMARY KEY,
    type_code VARCHAR(60) NOT NULL UNIQUE,
    type_name VARCHAR(150) NOT NULL,
    description TEXT,
    service_id VARCHAR(30) REFERENCES services(service_id) ON UPDATE CASCADE ON DELETE SET NULL,
    type_status VARCHAR(20) NOT NULL DEFAULT 'active',
    CONSTRAINT chk_exam_types_code CHECK (type_code IN ('general_checkup', 'vaccination', 'lab_test', 'recheck')),
    CONSTRAINT chk_exam_types_status CHECK (type_status IN ('active', 'inactive'))
);

CREATE TABLE exam_field_definitions (
    field_definition_id VARCHAR(30) PRIMARY KEY,
    exam_type_id VARCHAR(30) NOT NULL REFERENCES exam_types(exam_type_id) ON UPDATE CASCADE ON DELETE CASCADE,
    field_name VARCHAR(80) NOT NULL,
    field_label VARCHAR(150) NOT NULL,
    field_type VARCHAR(20) NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 1,
    option_source VARCHAR(100),
    validation_rule TEXT,
    field_status VARCHAR(20) NOT NULL DEFAULT 'active',
    CONSTRAINT uq_exam_field_name UNIQUE (exam_type_id, field_name),
    CONSTRAINT uq_exam_field_order UNIQUE (exam_type_id, display_order),
    CONSTRAINT chk_exam_field_type CHECK (field_type IN ('text', 'number', 'date', 'select', 'file')),
    CONSTRAINT chk_exam_field_order CHECK (display_order > 0),
    CONSTRAINT chk_exam_field_status CHECK (field_status IN ('active', 'inactive'))
);

CREATE TABLE medical_appointments (
    appointment_id VARCHAR(30) PRIMARY KEY,
    pet_id VARCHAR(30) NOT NULL REFERENCES pets(pet_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    owner_user_id VARCHAR(30) NOT NULL REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    exam_type_id VARCHAR(30) NOT NULL REFERENCES exam_types(exam_type_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    veterinarian_user_id VARCHAR(30) REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE SET NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    symptom_description TEXT,
    appointment_status VARCHAR(30) NOT NULL DEFAULT 'pending',
    internal_note TEXT,
    rejection_reason TEXT,
    handled_by_staff_id VARCHAR(30) REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_medical_appointments_status CHECK (appointment_status IN ('pending_payment', 'pending', 'confirmed', 'rejected', 'cancelled')),
    CONSTRAINT chk_medical_appointments_rejection CHECK (
        (appointment_status = 'rejected' AND rejection_reason IS NOT NULL)
        OR (appointment_status <> 'rejected')
    )
);

CREATE TABLE medical_exams (
    exam_id VARCHAR(30) PRIMARY KEY,
    appointment_id VARCHAR(30) NOT NULL UNIQUE REFERENCES medical_appointments(appointment_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    exam_type_id VARCHAR(30) NOT NULL REFERENCES exam_types(exam_type_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    diagnosis TEXT,
    conclusion TEXT,
    health_note TEXT,
    exam_status VARCHAR(30) NOT NULL DEFAULT 'result_recorded',
    exam_date DATE NOT NULL DEFAULT CURRENT_DATE,
    examined_by_veterinarian_id VARCHAR(30) NOT NULL REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_medical_exams_status CHECK (exam_status IN ('result_recorded', 'prescribed', 'follow_up_required'))
);

CREATE TABLE medical_exam_field_values (
    field_value_id VARCHAR(30) PRIMARY KEY,
    exam_id VARCHAR(30) NOT NULL REFERENCES medical_exams(exam_id) ON UPDATE CASCADE ON DELETE CASCADE,
    field_definition_id VARCHAR(30) NOT NULL REFERENCES exam_field_definitions(field_definition_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    value_text TEXT,
    value_number NUMERIC(12,2),
    value_date DATE,
    file_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_exam_field_value UNIQUE (exam_id, field_definition_id),
    CONSTRAINT chk_exam_field_value_one_type CHECK (
        num_nonnulls(value_text, value_number, value_date, file_url) = 1
    )
);

CREATE TABLE vaccinations (
    vaccination_id VARCHAR(30) PRIMARY KEY,
    pet_id VARCHAR(30) NOT NULL REFERENCES pets(pet_id) ON UPDATE CASCADE ON DELETE CASCADE,
    exam_id VARCHAR(30) REFERENCES medical_exams(exam_id) ON UPDATE CASCADE ON DELETE SET NULL,
    vaccine_name VARCHAR(150) NOT NULL,
    vaccination_date DATE NOT NULL,
    note TEXT,
    CONSTRAINT chk_vaccinations_date CHECK (vaccination_date <= CURRENT_DATE)
);

CREATE TABLE medicines (
    medicine_id VARCHAR(30) PRIMARY KEY,
    medicine_name VARCHAR(150) NOT NULL,
    unit VARCHAR(30) NOT NULL,
    description TEXT,
    usage_note TEXT,
    unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    medicine_status VARCHAR(20) NOT NULL DEFAULT 'active',
    CONSTRAINT chk_medicines_unit CHECK (unit IN ('tablet', 'bottle', 'packet', 'tube', 'ml', 'dose', 'other')),
    CONSTRAINT chk_medicines_unit_price CHECK (unit_price >= 0),
    CONSTRAINT chk_medicines_status CHECK (medicine_status IN ('active', 'inactive'))
);

CREATE TABLE prescriptions (
    prescription_id VARCHAR(30) PRIMARY KEY,
    exam_id VARCHAR(30) NOT NULL UNIQUE REFERENCES medical_exams(exam_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    prescribed_at DATE NOT NULL DEFAULT CURRENT_DATE,
    general_note TEXT
);

CREATE TABLE prescription_items (
    prescription_item_id VARCHAR(30) PRIMARY KEY,
    prescription_id VARCHAR(30) NOT NULL REFERENCES prescriptions(prescription_id) ON UPDATE CASCADE ON DELETE CASCADE,
    medicine_id VARCHAR(30) NOT NULL REFERENCES medicines(medicine_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    medicine_name VARCHAR(150) NOT NULL,
    dosage VARCHAR(120) NOT NULL,
    frequency VARCHAR(120) NOT NULL,
    duration VARCHAR(120) NOT NULL,
    usage_instruction TEXT,
    note TEXT
);

CREATE TABLE follow_up_instructions (
    follow_up_id VARCHAR(30) PRIMARY KEY,
    exam_id VARCHAR(30) NOT NULL UNIQUE REFERENCES medical_exams(exam_id) ON UPDATE CASCADE ON DELETE CASCADE,
    follow_up_date DATE NOT NULL,
    reason TEXT NOT NULL,
    owner_note TEXT,
    CONSTRAINT chk_follow_up_date CHECK (follow_up_date >= CURRENT_DATE)
);

CREATE TABLE service_price_rules (
    price_rule_id VARCHAR(30) PRIMARY KEY,
    service_id VARCHAR(30) NOT NULL REFERENCES services(service_id) ON UPDATE CASCADE ON DELETE CASCADE,
    pricing_condition VARCHAR(150) NOT NULL,
    price_amount NUMERIC(12,2) NOT NULL,
    effective_from DATE NOT NULL,
    price_status VARCHAR(20) NOT NULL DEFAULT 'active',
    CONSTRAINT chk_service_price_amount CHECK (price_amount >= 0),
    CONSTRAINT chk_service_price_status CHECK (price_status IN ('active', 'inactive')),
    CONSTRAINT uq_service_price_rule UNIQUE (service_id, pricing_condition, effective_from)
);

CREATE TABLE grooming_tickets (
    grooming_ticket_id VARCHAR(30) PRIMARY KEY,
    pet_id VARCHAR(30) NOT NULL REFERENCES pets(pet_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    owner_user_id VARCHAR(30) NOT NULL REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    created_by_user_id VARCHAR(30) NOT NULL REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    source_type VARCHAR(20) NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    received_at TIMESTAMPTZ,
    special_request TEXT,
    estimated_total NUMERIC(12,2) NOT NULL DEFAULT 0,
    ticket_status VARCHAR(30) NOT NULL DEFAULT 'pending',
    CONSTRAINT chk_grooming_source_type CHECK (source_type IN ('online', 'counter')),
    CONSTRAINT chk_grooming_total CHECK (estimated_total >= 0),
    CONSTRAINT chk_grooming_status CHECK (ticket_status IN ('pending_payment', 'pending', 'waiting', 'in_progress', 'completed', 'cancelled')),
    CONSTRAINT chk_grooming_received_at CHECK (received_at IS NULL OR received_at >= scheduled_at - INTERVAL '1 day')
);

CREATE TABLE grooming_ticket_items (
    grooming_ticket_item_id VARCHAR(30) PRIMARY KEY,
    grooming_ticket_id VARCHAR(30) NOT NULL REFERENCES grooming_tickets(grooming_ticket_id) ON UPDATE CASCADE ON DELETE CASCADE,
    service_id VARCHAR(30) NOT NULL REFERENCES services(service_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1,
    applied_unit_price NUMERIC(12,2) NOT NULL,
    line_amount NUMERIC(12,2) NOT NULL,
    CONSTRAINT chk_grooming_item_quantity CHECK (quantity > 0),
    CONSTRAINT chk_grooming_item_price CHECK (applied_unit_price >= 0),
    CONSTRAINT chk_grooming_item_amount CHECK (line_amount = quantity * applied_unit_price)
);

CREATE TABLE room_types (
    room_type_id VARCHAR(30) PRIMARY KEY,
    room_type_name VARCHAR(120) NOT NULL UNIQUE,
    capacity INTEGER NOT NULL,
    boarding_unit_price NUMERIC(12,2) NOT NULL,
    description TEXT,
    room_type_status VARCHAR(20) NOT NULL DEFAULT 'active',
    CONSTRAINT chk_room_types_capacity CHECK (capacity > 0),
    CONSTRAINT chk_room_types_price CHECK (boarding_unit_price >= 0),
    CONSTRAINT chk_room_types_status CHECK (room_type_status IN ('active', 'inactive'))
);

CREATE TABLE boarding_records (
    boarding_record_id VARCHAR(30) PRIMARY KEY,
    pet_id VARCHAR(30) NOT NULL REFERENCES pets(pet_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    owner_user_id VARCHAR(30) NOT NULL REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    room_type_id VARCHAR(30) NOT NULL REFERENCES room_types(room_type_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    planned_check_in_date DATE NOT NULL,
    planned_check_out_date DATE NOT NULL,
    planned_check_in_at TIMESTAMPTZ,
    planned_check_out_at TIMESTAMPTZ,
    actual_check_in_at TIMESTAMPTZ,
    actual_check_out_at TIMESTAMPTZ,
    care_request TEXT,
    estimated_total NUMERIC(12,2) NOT NULL DEFAULT 0,
    boarding_status VARCHAR(30) NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    handled_by_staff_id VARCHAR(30) REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_boarding_planned_dates CHECK (planned_check_out_date > planned_check_in_date),
    CONSTRAINT chk_boarding_planned_times CHECK (planned_check_out_at IS NULL OR planned_check_in_at IS NULL OR planned_check_out_at > planned_check_in_at),
    CONSTRAINT chk_boarding_actual_dates CHECK (actual_check_out_at IS NULL OR actual_check_in_at IS NULL OR actual_check_out_at > actual_check_in_at),
    CONSTRAINT chk_boarding_total CHECK (estimated_total >= 0),
    CONSTRAINT chk_boarding_status CHECK (boarding_status IN ('pending_payment', 'pending', 'confirmed', 'staying', 'checked_out', 'rejected', 'cancelled')),
    CONSTRAINT chk_boarding_rejection CHECK (
        (boarding_status = 'rejected' AND rejection_reason IS NOT NULL)
        OR (boarding_status <> 'rejected')
    )
);

CREATE TABLE boarding_updates (
    boarding_update_id VARCHAR(30) PRIMARY KEY,
    boarding_record_id VARCHAR(30) NOT NULL REFERENCES boarding_records(boarding_record_id) ON UPDATE CASCADE ON DELETE CASCADE,
    created_by_user_id VARCHAR(30) NOT NULL REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    update_note TEXT NOT NULL,
    attachment_url TEXT,
    alert_level VARCHAR(20) NOT NULL DEFAULT 'normal',
    visibility_status VARCHAR(20) NOT NULL DEFAULT 'draft',
    CONSTRAINT chk_boarding_updates_alert CHECK (alert_level IN ('normal', 'attention', 'urgent')),
    CONSTRAINT chk_boarding_updates_visibility CHECK (visibility_status IN ('draft', 'published'))
);

CREATE TABLE invoices (
    invoice_id VARCHAR(30) PRIMARY KEY,
    owner_user_id VARCHAR(30) NOT NULL REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    pet_id VARCHAR(30) NOT NULL REFERENCES pets(pet_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    issued_at DATE NOT NULL DEFAULT CURRENT_DATE,
    subtotal_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    surcharge_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_option VARCHAR(20) NOT NULL,
    payment_due_at TIMESTAMPTZ,
    invoice_status VARCHAR(30) NOT NULL DEFAULT 'draft',
    CONSTRAINT chk_invoices_amounts_nonnegative CHECK (
        subtotal_amount >= 0 AND discount_amount >= 0 AND surcharge_amount >= 0 AND total_amount >= 0
    ),
    CONSTRAINT chk_invoices_total CHECK (total_amount = subtotal_amount - discount_amount + surcharge_amount),
    CONSTRAINT chk_invoices_payment_option CHECK (payment_option IN ('online', 'counter')),
    CONSTRAINT chk_invoices_status CHECK (invoice_status IN ('draft', 'pending_payment', 'paid', 'cancelled', 'refunded'))
);

CREATE TABLE invoice_lines (
    invoice_line_id VARCHAR(30) PRIMARY KEY,
    invoice_id VARCHAR(30) NOT NULL REFERENCES invoices(invoice_id) ON UPDATE CASCADE ON DELETE CASCADE,
    service_id VARCHAR(30) REFERENCES services(service_id) ON UPDATE CASCADE ON DELETE SET NULL,
    source_type VARCHAR(30) NOT NULL,
    source_id VARCHAR(30) NOT NULL,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(12,2) NOT NULL,
    line_discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    line_amount NUMERIC(12,2) NOT NULL,
    CONSTRAINT chk_invoice_lines_source CHECK (source_type IN ('medical_exam', 'grooming', 'boarding', 'prescription')),
    CONSTRAINT chk_invoice_lines_quantity CHECK (quantity > 0),
    CONSTRAINT chk_invoice_lines_amounts CHECK (unit_price >= 0 AND line_discount_amount >= 0 AND line_amount >= 0),
    CONSTRAINT chk_invoice_lines_total CHECK (line_amount = quantity * unit_price - line_discount_amount)
);

CREATE TABLE payments (
    payment_id VARCHAR(30) PRIMARY KEY,
    invoice_id VARCHAR(30) NOT NULL REFERENCES invoices(invoice_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    payment_method VARCHAR(30) NOT NULL,
    payment_provider VARCHAR(80),
    transaction_code VARCHAR(100),
    paid_amount NUMERIC(12,2) NOT NULL,
    paid_at TIMESTAMPTZ,
    payment_status VARCHAR(20) NOT NULL,
    receipt_code VARCHAR(100) UNIQUE,
    receipt_url TEXT,
    CONSTRAINT chk_payments_method CHECK (payment_method IN ('e_wallet', 'online_bank_card', 'cash_at_counter', 'card_at_counter')),
    CONSTRAINT chk_payments_amount CHECK (paid_amount > 0),
    CONSTRAINT chk_payments_status CHECK (payment_status IN ('success', 'failed', 'cancelled')),
    CONSTRAINT chk_payments_success_paid_at CHECK ((payment_status = 'success' AND paid_at IS NOT NULL) OR payment_status <> 'success')
);

CREATE TABLE notifications (
    notification_id VARCHAR(30) PRIMARY KEY,
    receiver_user_id VARCHAR(30) NOT NULL REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    delivery_channel VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    notification_status VARCHAR(20) NOT NULL DEFAULT 'unread',
    related_object_type VARCHAR(60),
    related_object_id VARCHAR(30),
    CONSTRAINT chk_notifications_channel CHECK (delivery_channel IN ('app', 'email', 'sms')),
    CONSTRAINT chk_notifications_status CHECK (notification_status IN ('unread', 'read', 'failed')),
    CONSTRAINT chk_notifications_related CHECK (
        (related_object_type IS NULL AND related_object_id IS NULL)
        OR (related_object_type IS NOT NULL AND related_object_id IS NOT NULL)
    )
);

CREATE TABLE pet_activity_logs (
    activity_log_id VARCHAR(30) PRIMARY KEY,
    pet_id VARCHAR(30) NOT NULL REFERENCES pets(pet_id) ON UPDATE CASCADE ON DELETE CASCADE,
    owner_user_id VARCHAR(30) NOT NULL REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    actor_user_id VARCHAR(30) REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE SET NULL,
    activity_category VARCHAR(30) NOT NULL,
    activity_type VARCHAR(60) NOT NULL,
    activity_status VARCHAR(30) NOT NULL DEFAULT 'completed',
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    title VARCHAR(180) NOT NULL,
    summary TEXT,
    source_type VARCHAR(40) NOT NULL,
    source_id VARCHAR(30) NOT NULL,
    visibility_status VARCHAR(20) NOT NULL DEFAULT 'visible',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_pet_activity_category CHECK (
        activity_category IN ('medical', 'vaccination', 'grooming', 'boarding', 'invoice', 'payment', 'profile')
    ),
    CONSTRAINT chk_pet_activity_status CHECK (
        activity_status IN ('scheduled', 'pending', 'confirmed', 'completed', 'cancelled', 'rejected', 'failed')
    ),
    CONSTRAINT chk_pet_activity_source CHECK (
        source_type IN (
            'medical_appointment',
            'medical_exam',
            'vaccination',
            'prescription',
            'follow_up_instruction',
            'grooming_ticket',
            'boarding_record',
            'boarding_update',
            'invoice',
            'payment',
            'pet'
        )
    ),
    CONSTRAINT chk_pet_activity_visibility CHECK (visibility_status IN ('visible', 'hidden')),
    CONSTRAINT uq_pet_activity_source UNIQUE (source_type, source_id, activity_type)
);

CREATE UNIQUE INDEX uq_payments_transaction_code
    ON payments(transaction_code)
    WHERE transaction_code IS NOT NULL;

CREATE UNIQUE INDEX uq_invoice_success_payment
    ON payments(invoice_id)
    WHERE payment_status = 'success';

CREATE INDEX idx_users_role_status ON users(role, account_status);
CREATE INDEX idx_pets_owner ON pets(owner_user_id);
CREATE INDEX idx_pets_species_status ON pets(species, pet_status);
CREATE INDEX idx_health_profiles_pet ON pet_health_profiles(pet_id);
CREATE INDEX idx_services_category_status ON services(service_category, service_status);
CREATE INDEX idx_exam_types_service ON exam_types(service_id);
CREATE INDEX idx_exam_fields_exam_type ON exam_field_definitions(exam_type_id, display_order);
CREATE INDEX idx_medical_appointments_pet_time ON medical_appointments(pet_id, scheduled_at);
CREATE INDEX idx_medical_appointments_owner_status ON medical_appointments(owner_user_id, appointment_status);
CREATE INDEX idx_medical_appointments_vet_time ON medical_appointments(veterinarian_user_id, scheduled_at);
CREATE INDEX idx_medical_appointments_staff ON medical_appointments(handled_by_staff_id);
CREATE INDEX idx_medical_exams_type_date ON medical_exams(exam_type_id, exam_date);
CREATE INDEX idx_medical_exams_vet_date ON medical_exams(examined_by_veterinarian_id, exam_date);
CREATE INDEX idx_exam_values_exam ON medical_exam_field_values(exam_id);
CREATE INDEX idx_exam_values_definition ON medical_exam_field_values(field_definition_id);
CREATE INDEX idx_vaccinations_pet_date ON vaccinations(pet_id, vaccination_date DESC);
CREATE INDEX idx_vaccinations_exam ON vaccinations(exam_id);
CREATE INDEX idx_medicines_name ON medicines(medicine_name);
CREATE INDEX idx_prescriptions_exam ON prescriptions(exam_id);
CREATE INDEX idx_prescription_items_prescription ON prescription_items(prescription_id);
CREATE INDEX idx_prescription_items_medicine ON prescription_items(medicine_id);
CREATE INDEX idx_follow_ups_date ON follow_up_instructions(follow_up_date);
CREATE INDEX idx_service_price_rules_service ON service_price_rules(service_id, effective_from DESC);
CREATE INDEX idx_grooming_tickets_pet_time ON grooming_tickets(pet_id, scheduled_at);
CREATE INDEX idx_grooming_tickets_owner_status ON grooming_tickets(owner_user_id, ticket_status);
CREATE INDEX idx_grooming_tickets_schedule_status ON grooming_tickets(scheduled_at, ticket_status);
CREATE INDEX idx_grooming_ticket_items_ticket ON grooming_ticket_items(grooming_ticket_id);
CREATE INDEX idx_grooming_ticket_items_service ON grooming_ticket_items(service_id);
CREATE INDEX idx_boarding_records_pet_dates ON boarding_records(pet_id, planned_check_in_date, planned_check_out_date);
CREATE INDEX idx_boarding_records_room_dates ON boarding_records(room_type_id, planned_check_in_date, planned_check_out_date);
CREATE INDEX idx_boarding_records_owner_status ON boarding_records(owner_user_id, boarding_status);
CREATE INDEX idx_boarding_records_staff ON boarding_records(handled_by_staff_id);
CREATE INDEX idx_boarding_updates_record_time ON boarding_updates(boarding_record_id, updated_at DESC);
CREATE INDEX idx_boarding_updates_creator ON boarding_updates(created_by_user_id);
CREATE INDEX idx_invoices_owner_status ON invoices(owner_user_id, invoice_status);
CREATE INDEX idx_invoices_pet_issued ON invoices(pet_id, issued_at DESC);
CREATE INDEX idx_invoice_lines_invoice ON invoice_lines(invoice_id);
CREATE INDEX idx_invoice_lines_service ON invoice_lines(service_id);
CREATE INDEX idx_invoice_lines_source ON invoice_lines(source_type, source_id);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_status_paid_at ON payments(payment_status, paid_at DESC);
CREATE INDEX idx_notifications_receiver_status ON notifications(receiver_user_id, notification_status, created_at DESC);
CREATE INDEX idx_notifications_related ON notifications(related_object_type, related_object_id);
CREATE INDEX idx_pet_activity_logs_pet_time ON pet_activity_logs(pet_id, occurred_at DESC);
CREATE INDEX idx_pet_activity_logs_owner_time ON pet_activity_logs(owner_user_id, occurred_at DESC);
CREATE INDEX idx_pet_activity_logs_category_time ON pet_activity_logs(activity_category, occurred_at DESC);
CREATE INDEX idx_pet_activity_logs_source ON pet_activity_logs(source_type, source_id);

COMMIT;
