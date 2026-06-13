from __future__ import annotations

import base64
import hashlib
import json
import os
import random
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

PASSWORD = "12345678"
RANDOM_SEED = 20260526
SCHEMA = "pet_center"

PET_IMAGE_URLS = {
    "Dog": [
        "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1529472119196-cb724127a98e?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80",
    ],
    "Cat": [
        "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1548247416-ec66f4900b2e?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1561948955-570b270e7c36?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1494256997604-768d1f608cac?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1478098711619-5ab0b478d6e6?auto=format&fit=crop&w=900&q=80",
    ],
    "Other": [
        "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1452857297128-d9c29adba80b?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1520808663317-647b476a81b9?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1555169062-013468b47731?auto=format&fit=crop&w=900&q=80",
    ],
}

BOARDING_IMAGE_URLS = [
    "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=900&q=80",
]

LAB_REPORT_URL = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
RECEIPT_URL = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"


def b64url(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode("ascii").rstrip("=")


def password_hash(password: str, label: str) -> str:
    salt = b64url(hashlib.sha256(f"pet-center:{label}".encode("utf-8")).digest()[:16])
    key = hashlib.scrypt(password.encode("utf-8"), salt=salt.encode("utf-8"), n=16384, r=8, p=1, dklen=64)
    return f"scrypt${salt}${b64url(key)}"


def load_database_url() -> str:
    if os.environ.get("DATABASE_URL"):
        return os.environ["DATABASE_URL"]

    env_file = Path(__file__).resolve().parents[1] / "backend" / ".env"
    if env_file.exists():
        for raw_line in env_file.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            if key.strip() == "DATABASE_URL":
                return value.strip().strip('"').strip("'")

    raise RuntimeError("DATABASE_URL is not set. Set it in the environment or backend/.env.")


def normalize_database_url(database_url: str) -> str:
    parsed = urlsplit(database_url)
    query = dict(parse_qsl(parsed.query, keep_blank_values=True))
    if query.get("sslmode") == "verify-full" and "sslrootcert" not in query:
        query["sslmode"] = "require"
    return urlunsplit((parsed.scheme, parsed.netloc, parsed.path, urlencode(query), parsed.fragment))


def connect(database_url: str):
    database_url = normalize_database_url(database_url)
    try:
        import psycopg

        return psycopg.connect(database_url)
    except ImportError:
        pass

    try:
        import psycopg2

        return psycopg2.connect(database_url)
    except ImportError as exc:
        raise RuntimeError("Install psycopg or psycopg2 to run this script: pip install psycopg[binary]") from exc


def sync_id_sequences(cur) -> None:
    targets = [
        ("own", "users", "user_id"),
        ("stf", "users", "user_id"),
        ("doc", "users", "user_id"),
        ("adm", "users", "user_id"),
        ("prt", "password_reset_tokens", "reset_token_id"),
        ("pet", "pets", "pet_id"),
        ("hp", "pet_health_profiles", "health_profile_id"),
        ("svc", "services", "service_id"),
        ("med", "medicines", "medicine_id"),
        ("appt", "medical_appointments", "appointment_id"),
        ("mex", "medical_exams", "exam_id"),
        ("efd", "exam_field_definitions", "field_definition_id"),
        ("efv", "medical_exam_field_values", "field_value_id"),
        ("rx", "prescriptions", "prescription_id"),
        ("rxi", "prescription_items", "prescription_item_id"),
        ("vac", "vaccinations", "vaccination_id"),
        ("fui", "follow_up_instructions", "follow_up_id"),
        ("spa", "grooming_tickets", "grooming_ticket_id"),
        ("gti", "grooming_ticket_items", "grooming_ticket_item_id"),
        ("rt", "room_types", "room_type_id"),
        ("brd", "boarding_records", "boarding_record_id"),
        ("bup", "boarding_updates", "boarding_update_id"),
        ("inv", "invoices", "invoice_id"),
        ("inl", "invoice_lines", "invoice_line_id"),
        ("pay", "payments", "payment_id"),
        ("noti", "notifications", "notification_id"),
        ("elog", "email_logs", "email_log_id"),
        ("rem", "notification_reminders", "reminder_id"),
    ]

    for prefix, table_name, column_name in targets:
        cur.execute(
            f"""
            SELECT max(substring({column_name} FROM %s)::bigint)
            FROM {SCHEMA}.{table_name}
            WHERE {column_name} ~ %s
            """,
            (f"^{prefix}([0-9]+)$", f"^{prefix}[0-9]+$"),
        )
        max_value = cur.fetchone()[0]
        sequence_name = f"{SCHEMA}.{prefix}_id_seq"

        if max_value is None:
            cur.execute("SELECT setval(%s::regclass, 1, false)", (sequence_name,))
        else:
            cur.execute("SELECT setval(%s::regclass, %s, true)", (sequence_name, max_value))


def many(cur, table: str, columns: list[str], rows: list[tuple]) -> None:
    if not rows:
        return
    placeholders = ", ".join(["%s::jsonb" if table == "pet_activity_logs" and column == "metadata" else "%s" for column in columns])
    column_sql = ", ".join(columns)
    cur.executemany(f"INSERT INTO {SCHEMA}.{table} ({column_sql}) VALUES ({placeholders})", rows)


def money(value: int | float | Decimal) -> Decimal:
    return Decimal(str(value)).quantize(Decimal("0.01"))


def utc_dt(days: int, hour: int = 9, minute: int = 0) -> datetime:
    return datetime.now(timezone.utc).replace(hour=hour, minute=minute, second=0, microsecond=0) + timedelta(days=days)


def make_users() -> tuple[list[tuple], dict[str, list[str]]]:
    role_counts = {"Owner": 300, "Staff": 20, "Doctor": 12, "Admin": 3}
    role_prefix = {"Owner": "owner", "Staff": "staff", "Doctor": "doctor", "Admin": "admin"}
    role_id_prefix = {"Owner": "own", "Staff": "stf", "Doctor": "doc", "Admin": "adm"}
    role_names = {
        "Owner": "Chủ thú cưng",
        "Staff": "Nhân viên trung tâm",
        "Doctor": "Bác sĩ thú y",
        "Admin": "Quản trị viên",
    }

    rows: list[tuple] = []
    ids_by_role: dict[str, list[str]] = {role: [] for role in role_counts}
    password_hash_by_role = {role: password_hash(PASSWORD, f"role:{role}") for role in role_counts}
    for role, count in role_counts.items():
        for index in range(1, count + 1):
            user_id = f"{role_id_prefix[role]}{index}"
            email = f"{role_prefix[role]}{index}@gmail.com"
            ids_by_role[role].append(user_id)
            rows.append(
                (
                    user_id,
                    f"{role_names[role]} {index:03d}",
                    email,
                    password_hash_by_role[role],
                    f"090{random.randint(1000000, 9999999)}",
                    f"{index} Nguyễn Trãi, Quận {random.randint(1, 12)}, TP. Hồ Chí Minh",
                    role,
                    "active" if index % 31 else "inactive",
                    utc_dt(-random.randint(30, 420), 8),
                )
            )
    return rows, ids_by_role


def build_seed() -> dict[str, list[tuple]]:
    random.seed(RANDOM_SEED)
    today = date.today()
    data: dict[str, list[tuple]] = {}

    users, user_ids = make_users()
    data["users"] = users

    grooming_services = [
        ("svc1", "Tắm gội cơ bản", "grooming", 30, 120000),
        ("svc2", "Cắt tỉa lông", "grooming", 45, 180000),
        ("svc3", "Spa & Cắt tỉa", "grooming", 75, 280000),
        ("svc4", "Chăm sóc móng", "grooming", 20, 70000),
        ("svc5", "Massage thư giãn", "grooming", 30, 150000),
    ]
    medical_services = [
        ("svc6", "Khám tổng quát", "medical", 30, 180000),
        ("svc7", "Tiêm phòng", "medical", 25, 220000),
        ("svc8", "Xét nghiệm", "medical", 45, 350000),
        ("svc9", "Tái khám", "medical", 20, 120000),
        ("svc10", "Chụp X-quang", "medical", 40, 450000),
        ("svc11", "Siêu âm", "medical", 40, 500000),
        ("svc12", "Khám răng miệng", "medical", 35, 260000),
        ("svc13", "Khám da liễu", "medical", 35, 240000),
        ("svc14", "Khám mắt", "medical", 25, 210000),
        ("svc15", "Cấp cứu thú cưng", "medical", 60, 700000),
    ]
    boarding_services = [
        ("svc16", "Lưu trú ban ngày", "boarding", 720, 180000),
        ("svc17", "Lưu trú qua đêm", "boarding", 1440, 280000),
        ("svc18", "Giờ chơi vận động", "boarding", 30, 80000),
        ("svc19", "Dắt chó đi dạo", "boarding", 30, 70000),
        ("svc20", "Cho ăn theo yêu cầu", "boarding", 15, 50000),
    ]
    medicine_services = [
        ("svc21", "Cấp phát thuốc", "medicine", 10, 30000),
        ("svc22", "Tiêm thuốc", "medicine", 15, 90000),
        ("svc23", "Tẩy giun", "medicine", 15, 110000),
        ("svc24", "Phòng ve rận", "medicine", 10, 140000),
        ("svc25", "Bổ sung vitamin", "medicine", 10, 100000),
    ]
    services = grooming_services + medical_services + boarding_services + medicine_services
    grooming_descriptions = {
        "svc1": "Làm sạch lông, khử mùi nhẹ và sấy khô cho thú cưng.",
        "svc2": "Cắt tỉa gọn gàng, tạo kiểu lông cơ bản theo nhu cầu chăm sóc.",
        "svc3": "Gói chăm sóc kết hợp tắm gội, cắt tỉa và chăm sóc lông toàn diện.",
        "svc4": "Cắt, mài móng an toàn và vệ sinh vùng đệm chân.",
        "svc5": "Massage nhẹ giúp thú cưng thư giãn và giảm căng thẳng.",
    }
    data["services"] = [
        (sid, name, category, grooming_descriptions.get(sid, f"Dịch vụ {name.lower()} dùng cho dữ liệu kiểm thử trung tâm thú cưng."), duration, money(price), "active")
        for sid, name, category, duration, price in services
    ]

    data["exam_types"] = [
        ("ext_general", "general_checkup", "Khám tổng quát", "Kiểm tra sức khỏe định kỳ cho thú cưng", "svc6", "active"),
        ("ext_vaccine", "vaccination", "Tiêm phòng", "Tiêm phòng và theo dõi sau tiêm", "svc7", "active"),
        ("ext_lab", "lab_test", "Xét nghiệm", "Xét nghiệm máu và mẫu bệnh phẩm", "svc8", "active"),
        ("ext_recheck", "recheck", "Tái khám", "Khám lại sau điều trị hoặc theo dõi", "svc9", "active"),
    ]
    field_specs = {
        "ext_general": [
            ("temperature_c", "Nhiệt độ C", "number", True),
            ("heart_rate", "Nhịp tim", "number", True),
            ("respiratory_rate", "Nhịp thở", "number", False),
            ("body_condition", "Thể trạng", "select", True),
            ("clinical_notes", "Ghi chú lâm sàng", "text", False),
            ("next_visit_date", "Ngày hẹn tiếp theo", "date", False),
        ],
        "ext_vaccine": [
            ("vaccine_lot", "Lô vắc xin", "text", True),
            ("vaccine_brand", "Hãng vắc xin", "text", True),
            ("dose_ml", "Liều tiêm ml", "number", True),
            ("next_due_date", "Ngày nhắc lại", "date", False),
            ("reaction_note", "Ghi chú phản ứng", "text", False),
        ],
        "ext_lab": [
            ("sample_type", "Loại mẫu xét nghiệm", "select", True),
            ("wbc", "WBC", "number", False),
            ("rbc", "RBC", "number", False),
            ("platelet", "Tiểu cầu", "number", False),
            ("lab_summary", "Tóm tắt xét nghiệm", "text", True),
            ("report_file", "Tệp kết quả", "file", False),
        ],
        "ext_recheck": [
            ("progress_note", "Ghi chú tiến triển", "text", True),
            ("weight_kg", "Cân nặng kg", "number", False),
            ("appetite", "Mức ăn uống", "select", False),
            ("medication_response", "Đáp ứng thuốc", "text", False),
            ("next_recheck_date", "Ngày tái khám tiếp theo", "date", False),
        ],
    }
    fields = []
    field_ids_by_type: dict[str, list[tuple[str, str]]] = {}
    for exam_type_id, specs in field_specs.items():
        field_ids_by_type[exam_type_id] = []
        for order, (name, label, field_type, required) in enumerate(specs, 1):
            field_id = f"efd{len(fields) + 1}"
            fields.append((field_id, exam_type_id, name, label, field_type, required, order, None, None, "active"))
            field_ids_by_type[exam_type_id].append((field_id, field_type))
    data["exam_field_definitions"] = fields

    species_breeds = {
        "Dog": ["Poodle", "Corgi", "Golden Retriever", "Husky", "Shiba Inu", "Lai"],
        "Cat": ["Anh lông ngắn", "Ba Tư", "Maine Coon", "Xiêm", "Mèo mướp", "Lai"],
        "Other": ["Thỏ", "Hamster", "Bọ ú", "Vẹt"],
    }
    pet_name_prefixes = [
        "Milo", "Luna", "Coco", "Bella", "Max", "Mochi", "Bông", "Bim", "Kem", "Nâu", "Đen", "Sữa",
        "Lucky", "Daisy", "Oscar", "Ruby", "Kiki", "Mimi", "Simba", "Nala", "Toby", "Bento", "Miso", "Sushi",
        "Mango", "Peanut", "Cookie", "Latte", "Mocha", "Pudding", "Bơ", "Mận", "Mít", "Xoài", "Gạo", "Bắp",
        "Mun", "Sóc", "Nấm", "Bạc", "Mây", "Gấu", "Bé", "Rex", "Rocky", "Zoe", "Loki", "Choco",
    ]
    pet_name_suffixes = [
        "Nắng", "Mây", "Gió", "Mưa", "Sao", "Trăng", "Bạc", "Mun", "Ú", "Nhỏ", "Tròn", "Xinh",
        "Béo", "Lém", "Ngoan", "Khò", "Meo", "Gâu", "Tí", "Tồ", "Bự", "Mượt", "Mềm", "Ấm",
        "Bông", "Kem", "Sữa", "Mật", "Quế", "Dừa", "Đậu", "Bắp", "Gạo", "Mochi", "Panda", "Tiger",
        "Mini", "Happy", "Sunny", "Lucky", "Ruby", "Nâu", "Đốm", "Tuyết", "Cam", "Vàng", "Xám", "Đen",
    ]
    pet_names = [f"{prefix} {suffix}" for prefix in pet_name_prefixes for suffix in pet_name_suffixes if prefix != suffix]
    random.shuffle(pet_names)
    pets = []
    health_profiles = []
    owner_for_pet: dict[str, str] = {}
    for index in range(1, 701):
        pet_id = f"pet{index}"
        owner_id = "own1" if index <= 120 else random.choice(user_ids["Owner"])
        species = random.choices(["Dog", "Cat", "Other"], weights=[48, 42, 10])[0]
        has_birth_date = random.random() < 0.72
        birth_date = today - timedelta(days=random.randint(120, 4300)) if has_birth_date else None
        estimated_age = None if has_birth_date else money(round(random.uniform(0.5, 12.0), 2))
        weight = round(random.uniform(1.0, 45.0), 2) if species == "Dog" else round(random.uniform(0.7, 8.5), 2)
        if species == "Other":
            weight = round(random.uniform(0.2, 4.5), 2)
        owner_for_pet[pet_id] = owner_id
        pets.append(
            (
                pet_id,
                owner_id,
                pet_names[index - 1],
                species,
                random.choice(species_breeds[species]),
                random.choice(["male", "female", "unknown"]),
                birth_date,
                estimated_age,
                random.choice(["Đen", "Trắng", "Nâu", "Vàng", "Xám", "Pha màu"]),
                money(weight),
                random.choice(PET_IMAGE_URLS[species]),
                random.choice(["Bốn chân trắng", "Có sẹo nhỏ", "Đuôi cong", None]),
            )
        )
        health_profiles.append(
            (
                f"hp{index}",
                pet_id,
                random.choice(["Chưa ghi nhận bệnh sử nghiêm trọng", "Từng dị ứng da", "Dễ rối loạn tiêu hóa", "Tiêm phòng định kỳ"]),
                random.choice([None, "Dị ứng thịt gà", "Dị ứng hải sản", "Nhạy cảm với bụi"]),
                random.choice([None, "Thừa cân nhẹ", "Viêm da mạn tính", "Lo lắng khi gặp người lạ"]),
                random.choice(["Thức ăn khô", "Thức ăn ướt", "Khẩu phần kết hợp", "Khẩu phần theo toa"]),
                random.choice(["2 bữa mỗi ngày", "Chia nhỏ 3 bữa mỗi ngày", "Theo ghi chú của chủ nuôi"]),
                random.choice([None, "Cần thao tác nhẹ nhàng", "Giữ ấm sau khi tắm", "Tránh tiếng ồn lớn"]),
                utc_dt(-random.randint(0, 90), 10),
            )
        )
    data["pets"] = pets
    data["pet_health_profiles"] = health_profiles

    data["medicines"] = []
    med_units = ["tablet", "blister", "packet", "tube", "bottle"]
    med_names = ["Amoxicillin", "Doxycycline", "Meloxicam", "Prednisolone", "Vitamin B", "Men vi sinh", "Thuốc tẩy giun", "Thuốc nhỏ mắt"]
    for index in range(1, 81):
        name = f"{random.choice(med_names)} {index}"
        data["medicines"].append(
            (
                f"med{index}",
                name,
                random.choice(med_units),
                f"{name} dùng cho dữ liệu kiểm thử đơn thuốc.",
                "Sử dụng theo hướng dẫn của bác sĩ thú y.",
                money(random.randint(15000, 260000)),
                "active" if index % 17 else "inactive",
            )
        )

    data["room_types"] = [
        ("room_std_cat", "Phòng mèo tiêu chuẩn", 1, money(220000), "Phòng riêng cho một mèo", "active"),
        ("room_vip_cat", "Phòng mèo VIP", 1, money(380000), "Phòng mèo rộng có camera", "active"),
        ("room_std_dog", "Phòng chó tiêu chuẩn", 1, money(260000), "Phòng riêng cho một chó", "active"),
        ("room_vip_dog", "Phòng chó VIP", 1, money(450000), "Phòng chó rộng có camera", "active"),
        ("room_family", "Phòng gia đình", 3, money(620000), "Phòng chung cho thú cưng cùng chủ", "active"),
        ("room_quiet", "Phòng chăm sóc yên tĩnh", 1, money(500000), "Phòng lưu trú hạn chế tiếng ồn", "active"),
        ("room_medical", "Phòng theo dõi y tế", 1, money(650000), "Phòng lưu trú cần theo dõi sức khỏe", "active"),
        ("room_daycare", "Khu chăm sóc ban ngày", 8, money(180000), "Khu sinh hoạt chung ban ngày", "active"),
    ]

    exam_type_ids = [row[0] for row in data["exam_types"]]
    medical_appointments = []
    appointment_context = []
    for index in range(1, 901):
        pet_id = f"pet{random.randint(1, 120)}" if index <= 260 else f"pet{random.randint(1, 700)}"
        owner_id = owner_for_pet[pet_id]
        exam_type_id = random.choice(exam_type_ids)
        status = "confirmed" if index <= 620 else random.choices(["pending_payment", "pending", "confirmed", "rejected", "cancelled"], [15, 20, 50, 8, 7])[0]
        rejection_reason = "Khung giờ yêu cầu không còn trống." if status == "rejected" else None
        scheduled_days = random.randint(-330, -1) if index <= 620 else random.randint(-330, 60)
        scheduled = utc_dt(scheduled_days, random.randint(8, 17), random.choice([0, 30]))
        vet_id = random.choice(user_ids["Doctor"]) if status in ["confirmed", "pending"] else None
        staff_id = random.choice(user_ids["Staff"]) if status != "pending_payment" else None
        appointment_id = f"appt{index}"
        medical_appointments.append(
            (
                appointment_id,
                pet_id,
                owner_id,
                exam_type_id,
                vet_id,
                scheduled,
                random.choice(["Ho và mệt mỏi", "Khám định kỳ", "Ngứa da", "Ăn ít", "Yêu cầu tiêm phòng"]),
                status,
                random.choice([None, "Chủ nuôi muốn đặt lịch buổi sáng", "Thú cưng dễ căng thẳng khi gặp người lạ"]),
                rejection_reason,
                staff_id,
            )
        )
        appointment_context.append((appointment_id, pet_id, owner_id, exam_type_id, vet_id, scheduled, status))
    data["medical_appointments"] = medical_appointments

    confirmed_past = [ctx for ctx in appointment_context if ctx[6] == "confirmed" and ctx[5] <= datetime.now(timezone.utc)]
    random.shuffle(confirmed_past)
    exams = []
    field_values = []
    vaccinations = []
    prescriptions = []
    prescription_items = []
    followups = []
    invoice_sources = []
    medicine_unit_by_id = {row[0]: row[2] for row in data["medicines"]}
    dosage_suffix_by_unit = {
        "tablet": "viên/lần",
        "blister": "viên/lần",
        "packet": "gói/lần",
        "tube": "lần",
        "bottle": "ml/lần",
    }
    for index, (appointment_id, pet_id, owner_id, exam_type_id, vet_id, scheduled, _status) in enumerate(confirmed_past[:550], 1):
        exam_id = f"mex{index}"
        exam_status = random.choices(["result_recorded", "prescribed", "follow_up_required"], [45, 35, 20])[0]
        if vet_id is None:
            vet_id = random.choice(user_ids["Doctor"])
        exams.append(
            (
                exam_id,
                appointment_id,
                random.choice(["Sức khỏe ổn định", "Nhiễm trùng nhẹ", "Viêm da", "Rối loạn tiêu hóa"]),
                random.choice(["Tình trạng ổn định", "Cần dùng thuốc theo hướng dẫn", "Theo dõi tại nhà", "Cần tái khám"]),
                random.choice(["Mức nước cơ thể bình thường", "Đã tư vấn khẩu phần ăn cho chủ nuôi", "Cần cho thú cưng nghỉ ngơi"]),
                exam_status,
                scheduled.date(),
                vet_id,
            )
        )
        invoice_sources.append(("medical_exam", exam_id, owner_id, pet_id, "svc6", random.randint(120000, 420000)))

        for field_id, field_type in field_ids_by_type[exam_type_id]:
            value_text = value_number = value_date = file_url = None
            if field_type == "text":
                value_text = random.choice(["Bình thường", "Có dấu hiệu nhẹ", "Chủ nuôi báo đã cải thiện", "Chưa phát hiện bất thường"])
            elif field_type == "select":
                value_text = random.choice(["bình thường", "nhẹ", "trung bình", "tốt", "giảm"])
            elif field_type == "number":
                value_number = money(round(random.uniform(1, 120), 2))
            elif field_type == "date":
                value_date = today + timedelta(days=random.randint(7, 90))
            elif field_type == "file":
                file_url = LAB_REPORT_URL
            field_values.append((f"efv{len(field_values) + 1}", exam_id, field_id, value_text, value_number, value_date, file_url, utc_dt(-random.randint(0, 300), 12)))

        if index <= 450 or exam_type_id == "ext_vaccine" or random.random() < 0.35:
            vaccinations.append(
                (
                    f"vac{len(vaccinations) + 1}",
                    pet_id,
                    exam_id,
                    random.choice(["Rabies", "DHPPi", "FVRCP", "Bordetella", "Leptospirosis"]),
                    min(scheduled.date(), today),
                    random.choice([None, "Không ghi nhận phản ứng bất lợi", "Đã hẹn mũi tiếp theo"]),
                )
            )
        if index <= 300 or exam_status == "prescribed" or random.random() < 0.42:
            prescription_id = f"rx{len(prescriptions) + 1}"
            prescriptions.append((prescription_id, exam_id, min(scheduled.date(), today), "Dùng đúng liều và liên hệ phòng khám nếu triệu chứng nặng hơn."))
            for _ in range(random.randint(1, 4)):
                med_id = f"med{random.randint(1, 80)}"
                dosage = f"{random.choice([1, 2, 3])} {dosage_suffix_by_unit[medicine_unit_by_id[med_id]]}"
                prescription_items.append(
                    (
                        f"rxi{len(prescription_items) + 1}",
                        prescription_id,
                        med_id,
                        random.choice([10, 14, 1, 5, 2, 30]),
                        dosage,
                        f"{random.choice([1, 2, 3])} lần/ngày",
                        f"{random.choice([3, 5, 7, 10])} ngày",
                        "Ưu tiên dùng sau khi ăn nếu phù hợp.",
                        random.choice([None, "Ngừng dùng nếu thú cưng bị nôn"]),
                    )
                )
            invoice_sources.append(("prescription", prescription_id, owner_id, pet_id, "svc21", random.randint(80000, 600000)))
        if exam_status == "follow_up_required" or random.random() < 0.25:
            followups.append(
                (
                    f"fui{len(followups) + 1}",
                    exam_id,
                    today + timedelta(days=random.randint(3, 45)),
                    random.choice(["Kiểm tra lại triệu chứng", "Đánh giá kết quả xét nghiệm", "Tiêm mũi nhắc lại", "Theo dõi đáp ứng thuốc"]),
                    "Vui lòng đặt lịch phù hợp với phòng khám.",
                )
            )
    data["medical_exams"] = exams
    data["medical_exam_field_values"] = field_values[:3000]
    data["vaccinations"] = vaccinations[:450]
    data["prescriptions"] = prescriptions[:300]
    valid_prescriptions = {row[0] for row in data["prescriptions"]}
    data["prescription_items"] = [row for row in prescription_items if row[1] in valid_prescriptions][:850]
    data["follow_up_instructions"] = followups[:150]

    grooming_tickets = []
    grooming_items = []
    grooming_service_ids = [row[0] for row in data["services"] if row[2] == "grooming"]
    service_price = {row[0]: row[5] for row in data["services"]}
    for index in range(1, 701):
        pet_id = f"pet{random.randint(1, 120)}" if index <= 220 else f"pet{random.randint(1, 700)}"
        owner_id = owner_for_pet[pet_id]
        ticket_id = f"spa{index}"
        selected = random.sample(grooming_service_ids, random.randint(1, 3))
        total = sum(service_price[sid] for sid in selected)
        scheduled = utc_dt(random.randint(-210, 45), random.randint(8, 18), random.choice([0, 30]))
        status = random.choices(["pending_payment", "pending", "waiting", "in_progress", "completed", "cancelled"], [12, 16, 12, 8, 45, 7])[0]
        received = scheduled + timedelta(minutes=random.randint(-60, 90)) if status in ["waiting", "in_progress", "completed"] else None
        grooming_tickets.append(
            (
                ticket_id,
                pet_id,
                owner_id,
                random.choice([owner_id, random.choice(user_ids["Staff"])]),
                random.choice(["online", "counter"]),
                scheduled,
                received,
                random.choice([None, "Vui lòng dùng sữa tắm ít gây kích ứng", "Cắt tỉa ngắn cho mùa nóng", "Thao tác nhẹ quanh vùng tai"]),
                money(total),
                status,
            )
        )
        invoice_sources.append(("grooming", ticket_id, owner_id, pet_id, selected[0], int(total)))
        for sid in selected:
            unit_price = service_price[sid]
            grooming_items.append((f"gti{len(grooming_items) + 1}", ticket_id, sid, 1, unit_price, unit_price))
    data["grooming_tickets"] = grooming_tickets
    data["grooming_ticket_items"] = grooming_items[:1400]

    boarding_records = []
    boarding_updates = []
    room_types = [row[0] for row in data["room_types"]]
    room_price = {row[0]: row[3] for row in data["room_types"]}
    for index in range(1, 401):
        pet_id = f"pet{random.randint(1, 120)}" if index <= 140 else f"pet{random.randint(1, 700)}"
        owner_id = owner_for_pet[pet_id]
        room_type_id = random.choice(room_types)
        start = today + timedelta(days=random.randint(-180, 45))
        nights = random.randint(1, 14)
        end = start + timedelta(days=nights)
        status = random.choices(["pending_payment", "pending", "confirmed", "staying", "checked_out", "rejected", "cancelled"], [10, 12, 25, 8, 35, 5, 5])[0]
        planned_in = datetime.combine(start, datetime.min.time(), tzinfo=timezone.utc).replace(hour=random.randint(8, 11), minute=random.choice([0, 30]))
        planned_out = datetime.combine(end, datetime.min.time(), tzinfo=timezone.utc).replace(hour=random.randint(15, 18), minute=random.choice([0, 30]))
        actual_in = planned_in + timedelta(minutes=random.choice([-15, 0, 15, 30])) if status in ["staying", "checked_out"] else None
        actual_out = planned_out + timedelta(minutes=random.choice([-30, -15, 0, 15, 30])) if status == "checked_out" else None
        record_id = f"brd{index}"
        estimated_total = room_price[room_type_id] * nights
        boarding_records.append(
            (
                record_id,
                pet_id,
                owner_id,
                room_type_id,
                planned_in,
                planned_out,
                actual_in,
                actual_out,
                random.choice(["Cho ăn theo lịch cố định", "Cho uống thuốc buổi tối", "Tăng thời gian chơi vận động", "Ưu tiên phòng yên tĩnh"]),
                estimated_total,
                status,
                "Phòng đã kín trong thời gian yêu cầu." if status == "rejected" else None,
                random.choice(user_ids["Staff"]) if status not in ["pending_payment", "pending"] else None,
            )
        )
        invoice_sources.append(("boarding", record_id, owner_id, pet_id, "svc17", int(estimated_total)))
        for _ in range(random.randint(1, 4)):
            boarding_updates.append(
                (
                    f"bup{len(boarding_updates) + 1}",
                    record_id,
                    random.choice(user_ids["Staff"]),
                    utc_dt(random.randint(-120, 15), random.randint(8, 20)),
                    random.choice(["Ăn uống tốt", "Đã chơi ở khu sinh hoạt chung", "Nghỉ ngơi bình thường", "Cần theo dõi khẩu vị"]),
                    random.choice([None, [random.choice(BOARDING_IMAGE_URLS)]]),
                    random.choices(["normal", "attention", "urgent"], [82, 16, 2])[0],
                    random.choices(["draft", "published"], [20, 80])[0],
                )
            )
    data["boarding_records"] = boarding_records
    data["boarding_updates"] = boarding_updates[:900]

    invoices = []
    invoice_lines = []
    payments = []
    notifications = []
    source_type_labels = {
        "medical_exam": "lần khám bệnh",
        "grooming": "phiếu spa và làm đẹp",
        "boarding": "hồ sơ lưu trú",
        "prescription": "đơn thuốc",
    }
    random.shuffle(invoice_sources)
    for index, source in enumerate(invoice_sources[:1500], 1):
        source_type, source_id, owner_id, pet_id, service_id, amount = source
        invoice_id = f"inv{index}"
        discount = random.choice([0, 0, 0, 10000, 20000, 50000])
        surcharge = random.choice([0, 0, 15000, 30000])
        subtotal = money(amount)
        discount_amount = money(min(discount, max(0, amount - 10000)))
        surcharge_amount = money(surcharge)
        total = subtotal - discount_amount + surcharge_amount
        status = "paid" if index <= 1100 else random.choices(["draft", "pending_payment", "paid", "cancelled"], [10, 25, 55, 10])[0]
        payment_option = random.choice(["online", "counter"])
        invoices.append(
            (
                invoice_id,
                owner_id,
                pet_id,
                today - timedelta(days=random.randint(0, 300)),
                subtotal,
                discount_amount,
                surcharge_amount,
                total,
                payment_option,
                utc_dt(random.randint(-10, 20), 23, 59) if status == "pending_payment" else None,
                status,
            )
        )
        invoice_lines.append(
            (
                f"inl{len(invoice_lines) + 1}",
                invoice_id,
                service_id,
                source_type,
                source_id,
                {
                    "medical_exam": "Phí khám bệnh",
                    "grooming": "Phí spa và làm đẹp",
                    "boarding": "Phí lưu trú",
                    "prescription": "Phí đơn thuốc",
                }[source_type],
                1,
                subtotal,
                discount_amount,
                subtotal - discount_amount,
            )
        )
        if surcharge_amount > 0:
            invoice_lines.append((f"inl{len(invoice_lines) + 1}", invoice_id, None, source_type, source_id, "Phụ thu dịch vụ", 1, surcharge_amount, money(0), surcharge_amount))
        if status == "paid" or random.random() < 0.18:
            pay_status = "success" if status == "paid" else random.choice(["failed", "cancelled"])
            payments.append(
                (
                    f"pay{len(payments) + 1}",
                    invoice_id,
                    "online" if payment_option == "online" else "at_counter",
                    f"TXN{index:06d}" if pay_status == "success" else f"FAIL{index:06d}",
                    total,
                    utc_dt(-random.randint(0, 280), random.randint(8, 22)) if pay_status == "success" else None,
                    pay_status,
                    f"RCPT{index:06d}" if pay_status == "success" else None,
                    RECEIPT_URL if pay_status == "success" else None,
                )
            )
        notifications.append(
            (
                f"noti{len(notifications) + 1}",
                owner_id,
                random.choice(["Cập nhật hóa đơn", "Nhắc lịch hẹn", "Thông báo từ trung tâm thú cưng"]),
                f"Thông báo liên quan đến {source_type_labels[source_type]} {source_id}.",
                random.choice(["app", "email"]),
                utc_dt(-random.randint(0, 120), random.randint(8, 21)),
                random.choices(["unread", "read"], [42, 58])[0],
                source_type,
                source_id,
            )
        )
    for index in range(len(notifications) + 1, 3001):
        receiver = random.choice(data["users"])[0]
        notifications.append(
            (
                f"noti{index}",
                receiver,
                random.choice(["Thông báo hệ thống", "Cập nhật lịch hẹn", "Cập nhật chăm sóc"]),
                "Đây là thông báo seed dùng cho dữ liệu kiểm thử.",
                random.choice(["app", "email"]),
                utc_dt(-random.randint(0, 180), random.randint(8, 21)),
                random.choices(["unread", "read"], [40, 60])[0],
                None,
                None,
            )
        )
    data["invoices"] = invoices
    data["invoice_lines"] = invoice_lines[:2600]
    data["payments"] = payments[:1100]
    data["notifications"] = notifications[:3000]

    exam_by_id = {row[0]: row for row in data["medical_exams"]}
    appointment_by_id = {row[0]: row for row in data["medical_appointments"]}
    exam_type_name = {row[0]: row[2] for row in data["exam_types"]}
    boarding_by_id = {row[0]: row for row in data["boarding_records"]}
    pet_activity_logs = []

    def activity_time(value: date | datetime) -> datetime:
        if isinstance(value, datetime):
            return value
        return datetime.combine(value, datetime.min.time(), tzinfo=timezone.utc).replace(hour=9)

    def append_activity(
        pet_id: str,
        owner_id: str,
        actor_id: str | None,
        category: str,
        activity_type: str,
        status: str,
        occurred_at: date | datetime,
        title: str,
        summary: str | None,
        source_type: str,
        source_id: str,
        metadata: dict | None = None,
    ) -> None:
        pet_activity_logs.append(
            (
                f"pal{len(pet_activity_logs) + 1}",
                pet_id,
                owner_id,
                actor_id,
                category,
                activity_type,
                status,
                activity_time(occurred_at),
                title,
                summary,
                source_type,
                source_id,
                "visible",
                json.dumps(metadata or {}, ensure_ascii=False),
                datetime.now(timezone.utc),
            )
        )

    for exam in data["medical_exams"][:420]:
        exam_id, appointment_id, diagnosis, conclusion, _health_note, exam_status, exam_date, vet_id = exam
        appointment = appointment_by_id[appointment_id]
        exam_type_id = appointment[3]
        append_activity(
            appointment[1],
            appointment[2],
            vet_id,
            "medical",
            "medical_exam_recorded",
            "completed",
            exam_date,
            f"{exam_type_name.get(exam_type_id, 'Khám bệnh')} đã có kết quả",
            conclusion,
            "medical_exam",
            exam_id,
            {"diagnosis": diagnosis, "examStatus": exam_status},
        )

    for vaccination in data["vaccinations"][:360]:
        vaccination_id, pet_id, exam_id, vaccine_name, vaccination_date, note = vaccination
        exam = exam_by_id.get(exam_id)
        appointment = appointment_by_id[exam[1]] if exam else None
        append_activity(
            pet_id,
            owner_for_pet[pet_id],
            exam[7] if exam else None,
            "vaccination",
            "vaccination_recorded",
            "completed",
            vaccination_date,
            f"Đã tiêm {vaccine_name}",
            note or "Mũi nhắc lại được tính sau 1 năm từ ngày tiêm.",
            "vaccination",
            vaccination_id,
            {
                "examId": exam_id,
                "nextReminderPolicy": "vaccination_date_plus_1_year",
                "appointmentId": appointment[0] if appointment else None,
            },
        )

    for ticket in data["grooming_tickets"][:380]:
        ticket_id, pet_id, owner_id, created_by_id, source_type, scheduled_at, _received_at, special_request, _total, ticket_status = ticket
        if ticket_status == "pending_payment":
            status = "pending"
        elif ticket_status in ["waiting", "in_progress"]:
            status = "confirmed"
        elif ticket_status == "completed":
            status = "completed"
        elif ticket_status == "cancelled":
            status = "cancelled"
        else:
            status = "pending"
        append_activity(
            pet_id,
            owner_id,
            created_by_id,
            "grooming",
            "grooming_completed" if ticket_status == "completed" else "grooming_booked",
            status,
            scheduled_at,
            "Cập nhật dịch vụ spa",
            special_request,
            "grooming_ticket",
            ticket_id,
            {"ticketStatus": ticket_status, "sourceType": source_type},
        )

    for update in data["boarding_updates"][:260]:
        update_id, boarding_record_id, created_by_id, updated_at, update_note, attachment_url, alert_level, visibility_status = update
        if visibility_status != "published":
            continue
        boarding = boarding_by_id[boarding_record_id]
        append_activity(
            boarding[1],
            boarding[2],
            created_by_id,
            "boarding",
            "boarding_update_published",
            "completed",
            updated_at,
            "Cập nhật lưu trú",
            update_note,
            "boarding_update",
            update_id,
            {"boardingRecordId": boarding_record_id, "alertLevel": alert_level, "attachmentUrl": attachment_url},
        )

    for invoice in data["invoices"][:320]:
        invoice_id, owner_id, pet_id, issued_at, _subtotal, _discount, _surcharge, total, _payment_option, _due_at, invoice_status = invoice
        append_activity(
            pet_id,
            owner_id,
            None,
            "invoice",
            "invoice_issued",
            "completed" if invoice_status == "paid" else "pending",
            issued_at,
            "Hóa đơn đã được tạo",
            f"Tổng thanh toán: {total} VND",
            "invoice",
            invoice_id,
            {"invoiceStatus": invoice_status},
        )

    pet_activity_logs.sort(key=lambda row: row[7], reverse=True)
    data["pet_activity_logs"] = pet_activity_logs[:1200]

    return data


def seed() -> None:
    data = build_seed()
    insert_order = [
        ("users", ["user_id", "full_name", "email", "password_hash", "phone_number", "address", "role", "account_status", "created_at"]),
        ("pets", ["pet_id", "owner_user_id", "pet_name", "species", "breed", "gender", "birth_date", "estimated_age", "fur_color", "weight_kg", "profile_image_url", "identifying_marks"]),
        ("pet_health_profiles", ["health_profile_id", "pet_id", "medical_history", "allergy_notes", "chronic_condition_notes", "food_type", "feeding_portion", "special_care_notes", "updated_at"]),
        ("services", ["service_id", "service_name", "service_category", "description", "estimated_duration_minutes", "base_price", "service_status"]),
        ("exam_types", ["exam_type_id", "type_code", "type_name", "description", "service_id", "type_status"]),
        ("exam_field_definitions", ["field_definition_id", "exam_type_id", "field_name", "field_label", "field_type", "is_required", "display_order", "option_source", "validation_rule", "field_status"]),
        ("medical_appointments", ["appointment_id", "pet_id", "owner_user_id", "exam_type_id", "veterinarian_user_id", "scheduled_at", "symptom_description", "appointment_status", "internal_note", "rejection_reason", "handled_by_staff_id"]),
        ("medical_exams", ["exam_id", "appointment_id", "diagnosis", "conclusion", "health_note", "exam_status", "exam_date", "examined_by_veterinarian_id"]),
        ("medical_exam_field_values", ["field_value_id", "exam_id", "field_definition_id", "value_text", "value_number", "value_date", "file_url", "created_at"]),
        ("vaccinations", ["vaccination_id", "pet_id", "exam_id", "vaccine_name", "vaccination_date", "note"]),
        ("medicines", ["medicine_id", "medicine_name", "unit", "description", "usage_note", "unit_price", "medicine_status"]),
        ("prescriptions", ["prescription_id", "exam_id", "prescribed_at", "general_note"]),
        ("prescription_items", ["prescription_item_id", "prescription_id", "medicine_id", "quantity", "dosage", "frequency", "duration", "usage_instruction", "note"]),
        ("follow_up_instructions", ["follow_up_id", "exam_id", "follow_up_date", "reason", "owner_note"]),
        ("grooming_tickets", ["grooming_ticket_id", "pet_id", "owner_user_id", "created_by_user_id", "source_type", "scheduled_at", "received_at", "special_request", "estimated_total", "ticket_status"]),
        ("grooming_ticket_items", ["grooming_ticket_item_id", "grooming_ticket_id", "service_id", "quantity", "applied_unit_price", "line_amount"]),
        ("room_types", ["room_type_id", "room_type_name", "capacity", "boarding_unit_price", "description", "room_type_status"]),
        ("boarding_records", ["boarding_record_id", "pet_id", "owner_user_id", "room_type_id", "planned_check_in_at", "planned_check_out_at", "actual_check_in_at", "actual_check_out_at", "care_request", "estimated_total", "boarding_status", "rejection_reason", "handled_by_staff_id"]),
        ("boarding_updates", ["boarding_update_id", "boarding_record_id", "created_by_user_id", "updated_at", "update_note", "attachment_url", "alert_level", "visibility_status"]),
        ("invoices", ["invoice_id", "owner_user_id", "pet_id", "issued_at", "subtotal_amount", "discount_amount", "surcharge_amount", "total_amount", "payment_option", "payment_due_at", "invoice_status"]),
        ("invoice_lines", ["invoice_line_id", "invoice_id", "service_id", "source_type", "source_id", "description", "quantity", "unit_price", "line_discount_amount", "line_amount"]),
        ("payments", ["payment_id", "invoice_id", "payment_method", "transaction_code", "paid_amount", "paid_at", "payment_status", "receipt_code", "receipt_url"]),
        ("notifications", ["notification_id", "receiver_user_id", "title", "message", "delivery_channel", "created_at", "notification_status", "related_object_type", "related_object_id"]),
        ("pet_activity_logs", ["activity_log_id", "pet_id", "owner_user_id", "actor_user_id", "activity_category", "activity_type", "activity_status", "occurred_at", "title", "summary", "source_type", "source_id", "visibility_status", "metadata", "created_at"]),
    ]
    delete_order = [table for table, _columns in reversed(insert_order)]

    database_url = load_database_url()
    conn = connect(database_url)
    try:
        cur = conn.cursor()
        cur.execute(f"SET search_path TO {SCHEMA}, public")
        for table in delete_order:
            cur.execute(f"DELETE FROM {SCHEMA}.{table}")
        for table, columns in insert_order:
            many(cur, table, columns, data[table])
            print(f"seeded {table}: {len(data[table])}")
        sync_id_sequences(cur)
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    seed()
