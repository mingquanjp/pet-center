from __future__ import annotations

import base64
import hashlib
import json
import os
import random
from collections import Counter, defaultdict
from datetime import date, datetime, time, timedelta, timezone
from decimal import Decimal
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

PASSWORD = "12345678"
RANDOM_SEED = 20260616
SCHEMA = "pet_center"
DEMO_FOCUS_DATES = (date(2026, 6, 20),)
try:
    VIETNAM_TZ = ZoneInfo("Asia/Ho_Chi_Minh")
except ZoneInfoNotFoundError:
    # Windows Python may not bundle the IANA database. Việt Nam is UTC+7 year-round.
    VIETNAM_TZ = timezone(timedelta(hours=7), name="Asia/Ho_Chi_Minh")

PET_IMAGES = {
    "Dog": [
        "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=900&q=80",
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
    ],
    "Other": [
        "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=900&q=80",
        "https://images.unsplash.com/photo-1452857297128-d9c29adba80b?auto=format&fit=crop&w=900&q=80",
    ],
}
BOARDING_IMAGE = "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80"
LAB_REPORT_URL = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
RECEIPT_URL = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"

MEDICAL_SERVICES = [
    ("svc1", "Khám tổng quát", "medical", "Kiểm tra sức khỏe định kỳ và tư vấn chăm sóc.", 45, 180_000),
    ("svc2", "Tiêm phòng", "medical", "Tiêm phòng và theo dõi phản ứng sau tiêm.", 30, 220_000),
    ("svc3", "Xét nghiệm", "medical", "Xét nghiệm máu hoặc mẫu bệnh phẩm theo chỉ định.", 60, 350_000),
    ("svc4", "Tái khám", "medical", "Đánh giá tiến triển sau điều trị.", 30, 120_000),
]
GROOMING_SERVICES = [
    ("svc5", "Tắm và sấy cơ bản", "grooming", "Làm sạch lông, khử mùi nhẹ và sấy khô.", 45, 120_000),
    ("svc6", "Cắt tỉa lông", "grooming", "Cắt tỉa gọn gàng theo giống và nhu cầu chăm sóc.", 60, 180_000),
    ("svc7", "Gói tắm và cắt tỉa", "grooming", "Tắm, sấy và cắt tỉa lông trong một liệu trình.", 90, 280_000),
    ("svc8", "Chăm sóc móng", "grooming", "Cắt, mài móng và vệ sinh đệm chân.", 30, 70_000),
    ("svc9", "Massage thư giãn", "grooming", "Massage nhẹ giúp thú cưng thư giãn.", 45, 150_000),
]
BOARDING_SERVICES = [
    ("svc10", "Lưu trú tiêu chuẩn", "boarding", "Chi phí lưu trú theo ngày tại khu tiêu chuẩn.", 1_440, 180_000),
    ("svc11", "Phòng riêng tiêu chuẩn", "boarding", "Chi phí lưu trú theo ngày tại phòng riêng tiêu chuẩn.", 1_440, 280_000),
    ("svc12", "Phòng riêng cao cấp", "boarding", "Chi phí lưu trú theo ngày tại phòng riêng cao cấp.", 1_440, 450_000),
    ("svc13", "Chăm sóc yên tĩnh", "boarding", "Chi phí lưu trú theo ngày tại khu chăm sóc yên tĩnh.", 1_440, 500_000),
    ("svc14", "Theo dõi đặc biệt", "boarding", "Chi phí lưu trú theo ngày tại phòng theo dõi đặc biệt.", 1_440, 650_000),
]
MEDICINE_SERVICE = ("svc15", "Thuốc theo đơn", "medicine", "Thuốc được cấp theo đơn của bác sĩ thú y.", 10, 0)
SERVICES = MEDICAL_SERVICES + GROOMING_SERVICES + BOARDING_SERVICES + [MEDICINE_SERVICE]

EXAM_TYPES = [
    ("ext_general", "general_checkup", "Khám tổng quát", "Đánh giá sức khỏe tổng quát.", "svc1", "active"),
    ("ext_vaccine", "vaccination", "Tiêm phòng", "Tiêm phòng theo lịch khuyến nghị.", "svc2", "active"),
    ("ext_lab", "lab_test", "Xét nghiệm", "Xét nghiệm hỗ trợ chẩn đoán.", "svc3", "active"),
    ("ext_recheck", "recheck", "Tái khám", "Theo dõi đáp ứng điều trị.", "svc4", "active"),
]
EXAM_TYPE_SERVICE = {row[0]: row[4] for row in EXAM_TYPES}
SERVICE_BY_ID = {row[0]: row for row in SERVICES}
SERVICE_DURATION = {row[0]: row[4] for row in SERVICES}
SERVICE_PRICE = {row[0]: row[5] for row in SERVICES}

ROOM_TYPES = [
    ("rt1", "Khu lưu trú tiêu chuẩn", 12, 180_000, "Khu sinh hoạt chung, vệ sinh hằng ngày và theo dõi định kỳ.", "active"),
    ("rt2", "Phòng riêng tiêu chuẩn", 6, 280_000, "Phòng riêng thoáng mát, phù hợp thú cưng cần không gian riêng.", "active"),
    ("rt3", "Phòng riêng cao cấp", 4, 450_000, "Phòng rộng, camera theo dõi và thời gian vận động riêng.", "active"),
    ("rt4", "Khu chăm sóc yên tĩnh", 3, 500_000, "Không gian ít tiếng ồn cho thú cưng nhạy cảm.", "active"),
    ("rt5", "Phòng theo dõi đặc biệt", 2, 650_000, "Theo dõi sát cho thú cưng cần chăm sóc đặc biệt.", "active"),
]
ROOM_SERVICE = {"rt1": "svc10", "rt2": "svc11", "rt3": "svc12", "rt4": "svc13", "rt5": "svc14"}

MEDICINES = [
    ("med1", "Amoxicillin 250 mg", "tablet", "Kháng sinh dùng theo chỉ định bác sĩ.", "Uống sau ăn.", 12_000, "active"),
    ("med2", "Doxycycline 100 mg", "tablet", "Kháng sinh điều trị một số nhiễm khuẩn.", "Uống cùng nhiều nước.", 15_000, "active"),
    ("med3", "Meloxicam 1,5 mg", "tablet", "Thuốc giảm đau và kháng viêm.", "Dùng đúng liều theo cân nặng.", 18_000, "active"),
    ("med4", "Prednisolone 5 mg", "tablet", "Thuốc kháng viêm theo đơn.", "Không tự ý ngừng thuốc.", 8_000, "active"),
    ("med5", "Men vi sinh thú y", "packet", "Hỗ trợ cân bằng hệ vi sinh đường ruột.", "Trộn cùng thức ăn.", 20_000, "active"),
    ("med6", "Dung dịch nhỏ mắt", "bottle", "Vệ sinh và hỗ trợ giảm kích ứng mắt.", "Nhỏ theo hướng dẫn.", 65_000, "active"),
    ("med7", "Thuốc tẩy giun", "tablet", "Kiểm soát giun đường ruột.", "Dùng theo cân nặng.", 45_000, "active"),
    ("med8", "Dung dịch phòng ve rận", "tube", "Phòng ve, rận và bọ chét ngoài da.", "Nhỏ dọc sống lưng.", 120_000, "active"),
    ("med9", "Vitamin tổng hợp", "tablet", "Bổ sung vitamin và khoáng chất.", "Uống sau ăn.", 10_000, "active"),
    ("med10", "Dung dịch vệ sinh tai", "bottle", "Làm sạch ráy tai và mùi khó chịu.", "Dùng ngoài da.", 75_000, "active"),
    ("med11", "Gel hỗ trợ tiêu búi lông", "tube", "Hỗ trợ mèo đào thải búi lông.", "Dùng trực tiếp hoặc trộn thức ăn.", 95_000, "active"),
    ("med12", "Bột điện giải thú y", "packet", "Bù nước và điện giải.", "Pha đúng lượng nước.", 25_000, "active"),
    ("med13", "Thuốc bảo vệ niêm mạc dạ dày", "tablet", "Hỗ trợ giảm kích ứng dạ dày.", "Uống trước ăn.", 14_000, "active"),
    ("med14", "Kem bôi da kháng khuẩn", "tube", "Hỗ trợ chăm sóc vùng da tổn thương nhẹ.", "Chỉ dùng ngoài da.", 85_000, "active"),
    ("med15", "Dung dịch sát khuẩn vết thương", "bottle", "Làm sạch vết trầy xước ngoài da.", "Tránh để thú cưng liếm.", 55_000, "active"),
    ("med16", "Siro hỗ trợ hô hấp", "bottle", "Hỗ trợ làm dịu đường hô hấp.", "Lắc kỹ trước khi dùng.", 110_000, "active"),
    ("med17", "Viên hỗ trợ khớp", "blister", "Bổ sung dưỡng chất cho sụn khớp.", "Dùng liên tục theo đợt.", 160_000, "inactive"),
    ("med18", "Bột bổ sung canxi", "packet", "Bổ sung canxi theo nhu cầu dinh dưỡng.", "Không dùng quá liều.", 35_000, "inactive"),
]
MEDICINE_BY_ID = {row[0]: row for row in MEDICINES}

OWNER_NAMES = [
    "Nguyễn Minh Anh", "Phạm Gia Hân", "Võ Quốc Bảo", "Trần Ngọc Mai", "Lê Hoàng Sơn",
    "Đặng Thu Trang", "Bùi Đức Long", "Hoàng Khánh Linh", "Đỗ Anh Tú", "Ngô Phương Vy",
    "Dương Hải Nam", "Hồ Thanh Trúc", "Phan Nhật Minh", "Vũ Yến Nhi", "Mai Tuấn Kiệt",
    "Trương Bảo Ngọc", "Lý Minh Khang", "Nguyễn Thảo My", "Trần Gia Phúc", "Lê Quỳnh Chi",
    "Phạm Đức Anh", "Võ Thanh Tâm", "Đặng Ngọc Huy", "Bùi Khánh An", "Hoàng Minh Châu",
    "Đỗ Quang Vinh", "Ngô Hà My", "Dương Thành Đạt", "Hồ Tú Uyên", "Phan Quốc Việt",
]
STAFF_NAMES = ["Trần Thu Hà", "Nguyễn Quốc Huy", "Lê Bảo Trâm", "Phạm Minh Đức", "Võ Ngọc Lan"]
DOCTOR_NAMES = ["BS. Nguyễn Hoàng Nam", "BS. Trần Mai Phương", "BS. Lê Đức Khải", "BS. Phạm Thùy Dung"]
DOCTOR_EMAILS = ["nguyenhoangnam@gmail.com", "tranmaiphuong@gmail.com", "leduckhai@gmail.com", "phamthuydung@gmail.com"]
ADMIN_NAMES = ["Lê Thanh Phương", "Nguyễn Hải Yến"]
PET_NAMES = [
    "Milo", "Bông", "Lucky", "Luna", "Mochi", "Coco", "Bella", "Max", "Nâu", "Sữa", "Bơ", "Mít",
    "Simba", "Nala", "Toby", "Ruby", "Oscar", "Daisy", "Kiki", "Mimi", "Bento", "Miso", "Cookie",
    "Latte", "Mocha", "Pudding", "Mun", "Sóc", "Nấm", "Mây", "Gấu", "Rex", "Rocky", "Zoe",
    "Loki", "Choco", "Peanut", "Mango", "Gạo", "Bắp", "Kem", "Đốm",
]


def b64url(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode("ascii").rstrip("=")


def password_hash(password: str, label: str) -> str:
    salt = b64url(hashlib.sha256(f"pet-center:{label}".encode()).digest()[:16])
    key = hashlib.scrypt(password.encode(), salt=salt.encode(), n=16_384, r=8, p=1, dklen=64)
    return f"scrypt${salt}${b64url(key)}"


def money(value: int | float | Decimal) -> Decimal:
    return Decimal(str(value)).quantize(Decimal("0.01"))


def reference_date() -> date:
    raw = os.environ.get("SEED_REFERENCE_DATE")
    if raw:
        try:
            return date.fromisoformat(raw)
        except ValueError as exc:
            raise RuntimeError("SEED_REFERENCE_DATE phải có định dạng YYYY-MM-DD.") from exc
    return datetime.now(VIETNAM_TZ).date()


def local_dt(day: date, hour: int, minute: int = 0) -> datetime:
    return datetime.combine(day, time(hour, minute), tzinfo=VIETNAM_TZ)


def month_start(day: date, offset: int = 0) -> date:
    month_index = day.year * 12 + day.month - 1 + offset
    return date(month_index // 12, month_index % 12 + 1, 1)


def safe_month_day(day: date, offset: int, wanted_day: int) -> date:
    start = month_start(day, offset)
    next_start = month_start(day, offset + 1)
    last_day = (next_start - timedelta(days=1)).day
    return start.replace(day=min(wanted_day, last_day))


def load_database_url() -> str:
    if os.environ.get("DATABASE_URL"):
        return os.environ["DATABASE_URL"]
    env_file = Path(__file__).resolve().parents[1] / "backend" / ".env"
    if env_file.exists():
        lines = env_file.read_text(encoding="utf-8").splitlines()
        for index, raw_line in enumerate(lines):
            line = raw_line.strip()
            if not line.startswith("DATABASE_URL="):
                continue
            value = line.split("=", 1)[1].strip().strip("\"'")
            continuation = index + 1
            while continuation < len(lines) and lines[continuation].startswith("/"):
                value += lines[continuation].strip()
                continuation += 1
            return value
    raise RuntimeError("DATABASE_URL chưa được cấu hình trong biến môi trường hoặc backend/.env.")


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
        try:
            import psycopg2

            return psycopg2.connect(database_url)
        except ImportError as exc:
            raise RuntimeError("Cần cài psycopg hoặc psycopg2 để chạy seed.") from exc


def many(cur, table: str, columns: list[str], rows: list[tuple]) -> None:
    if not rows:
        return
    placeholders = ", ".join(
        "%s::jsonb" if column in {"metadata"} else "%s"
        for column in columns
    )
    cur.executemany(
        f"INSERT INTO {SCHEMA}.{table} ({', '.join(columns)}) VALUES ({placeholders})",
        rows,
    )


def grooming_surcharge(weight_kg: Decimal) -> int:
    weight = float(weight_kg)
    if weight < 5:
        return 0
    return 50_000 * (int((weight - 5) // 3) + 1)


def build_users(today: date) -> list[tuple]:
    rows = []
    roles = [
        ("Owner", "own", "owner", OWNER_NAMES),
        ("Staff", "stf", "staff", STAFF_NAMES),
        ("Doctor", "doc", "doctor", DOCTOR_NAMES),
        ("Admin", "adm", "admin", ADMIN_NAMES),
    ]
    for role, id_prefix, email_prefix, names in roles:
        role_hash = password_hash(PASSWORD, role)
        for index, name in enumerate(names, 1):
            rows.append((
                f"{id_prefix}{index}",
                name,
                DOCTOR_EMAILS[index - 1] if role == "Doctor" else f"{email_prefix}{index}@gmail.com",
                role_hash,
                f"09{role[0].encode()[0] % 10}{index:07d}",
                f"{20 + index} đường Nguyễn Văn Trỗi, TP. Hồ Chí Minh",
                role,
                "inactive" if (role, index) in {("Owner", 30), ("Staff", 5), ("Admin", 2)} else "active",
                local_dt(today - timedelta(days=420 - index * 7), 9),
            ))
    return rows


def build_pets(today: date) -> tuple[list[tuple], list[tuple], dict[str, str], dict[str, Decimal]]:
    pets = []
    profiles = []
    owner_by_pet: dict[str, str] = {}
    weight_by_pet: dict[str, Decimal] = {}
    owner_ids = ["own1"] * 3
    for owner_index in range(2, 11):
        owner_ids.extend([f"own{owner_index}"] * 2)
    owner_ids.extend(f"own{owner_index}" for owner_index in range(11, 31))
    owner_ids.append("own2")

    for index, (pet_name, owner_id) in enumerate(zip(PET_NAMES, owner_ids), 1):
        if index == 1:
            species, breed, gender, weight = "Dog", "Poodle", "male", Decimal("4.50")
        elif index == 2:
            species, breed, gender, weight = "Cat", "Anh lông ngắn", "female", Decimal("6.20")
        elif index == 3:
            species, breed, gender, weight = "Dog", "Golden Retriever", "male", Decimal("11.50")
        else:
            species = ["Dog", "Cat", "Other"][index % 3]
            breeds = {
                "Dog": ["Corgi", "Shiba Inu", "Poodle", "Labrador"],
                "Cat": ["Anh lông ngắn", "Mèo Xiêm", "Mèo mướp", "Maine Coon"],
                "Other": ["Thỏ", "Hamster", "Bọ ú"],
            }
            breed = breeds[species][index % len(breeds[species])]
            gender = "male" if index % 2 else "female"
            base_weight = {"Dog": 4.2, "Cat": 3.1, "Other": 0.8}[species]
            weight = money(base_weight + (index % 9) * (1.15 if species == "Dog" else 0.35))
        pet_id = f"pet{index}"
        birth = today - timedelta(days=365 * (1 + index % 8) + index * 9)
        owner_by_pet[pet_id] = owner_id
        weight_by_pet[pet_id] = money(weight)
        pets.append((
            pet_id, owner_id, pet_name, species, breed, gender, birth, None,
            ["Nâu", "Trắng", "Vàng kem", "Xám", "Đen"][index % 5],
            money(weight), PET_IMAGES[species][(index - 1) % len(PET_IMAGES[species])],
            "Đeo vòng cổ xanh" if index == 1 else ("Có đốm trắng ở ngực" if index % 7 == 0 else None),
        ))
        profiles.append((
            f"hp{index}", pet_id,
            "Chưa ghi nhận bệnh sử nghiêm trọng." if index % 4 else "Từng rối loạn tiêu hóa nhẹ.",
            "Không ghi nhận dị ứng." if index % 5 else "Nhạy cảm với thức ăn nhiều dầu mỡ.",
            None, "Thức ăn hạt kết hợp thức ăn ướt", "Hai bữa mỗi ngày",
            "Theo dõi cân nặng định kỳ." if index % 6 == 0 else None,
            local_dt(today - timedelta(days=index % 30), 10),
        ))
    return pets, profiles, owner_by_pet, weight_by_pet


def build_exam_fields() -> tuple[list[tuple], dict[str, list[tuple[str, str]]]]:
    specs = {
        "ext_general": [
            ("temperature_c", "Nhiệt độ (°C)", "number", True),
            ("heart_rate", "Nhịp tim", "number", True),
            ("clinical_notes", "Ghi chú lâm sàng", "text", False),
        ],
        "ext_vaccine": [
            ("vaccine_lot", "Lô vắc xin", "text", True),
            ("vaccine_brand", "Hãng vắc xin", "text", True),
            ("next_due_date", "Ngày nhắc lại", "date", False),
        ],
        "ext_lab": [
            ("sample_type", "Loại mẫu", "select", True),
            ("lab_summary", "Tóm tắt xét nghiệm", "text", True),
            ("report_file", "Tệp kết quả", "file", False),
        ],
        "ext_recheck": [
            ("progress_note", "Ghi chú tiến triển", "text", True),
            ("weight_kg", "Cân nặng (kg)", "number", False),
            ("next_recheck_date", "Ngày tái khám tiếp theo", "date", False),
        ],
    }
    rows = []
    by_type: dict[str, list[tuple[str, str]]] = defaultdict(list)
    for exam_type_id, fields in specs.items():
        for order, (name, label, field_type, required) in enumerate(fields, 1):
            field_id = f"efd{len(rows) + 1}"
            rows.append((field_id, exam_type_id, name, label, field_type, required, order, None, None, "active"))
            by_type[exam_type_id].append((field_id, field_type))
    return rows, by_type


def build_medical(
    today: date,
    owner_by_pet: dict[str, str],
    fields_by_type: dict[str, list[tuple[str, str]]],
) -> dict[str, list[tuple]]:
    appointments = []
    exams = []
    values = []
    vaccinations = []
    prescriptions = []
    prescription_items = []
    follow_ups = []
    completed_specs = []

    owner1_types = ["ext_general", "ext_vaccine", "ext_lab", "ext_recheck"]
    for index in range(1, 41):
        pet_id = ["pet1", "pet1", "pet3", "pet3"][index - 1] if index <= 4 else f"pet{1 + (index * 7) % 42}"
        exam_type_id = owner1_types[index - 1] if index <= 4 else list(EXAM_TYPE_SERVICE)[index % 4]
        doctor_id = "doc1" if index <= 12 else f"doc{2 + index % 3}"
        day = today - timedelta(days=12 + index * 5)
        completed_specs.append((index, pet_id, exam_type_id, doctor_id, day))

    for index, pet_id, exam_type_id, doctor_id, day in completed_specs:
        service_id = EXAM_TYPE_SERVICE[exam_type_id]
        appointment_id = f"appt{index}"
        exam_id = f"mex{index}"
        hour = 8 + (index % 8)
        minute = 30 if index % 2 else 0
        exam_status = "follow_up_required" if index in {4, 9, 16, 23} else ("prescribed" if index <= 15 else "result_recorded")
        appointments.append((
            appointment_id, pet_id, owner_by_pet[pet_id], exam_type_id, doctor_id,
            local_dt(day, hour, minute), SERVICE_DURATION[service_id],
            ["Ăn kém hai ngày", "Kiểm tra sức khỏe định kỳ", "Hắt hơi nhẹ", "Theo dõi sau điều trị"][index % 4],
            "confirmed", "completed" if exam_status != "follow_up_required" else "follow_up",
            "Đã tiếp nhận và hoàn tất khám.", None, f"stf{1 + index % 4}",
        ))
        exams.append((
            exam_id, appointment_id,
            "Sức khỏe ổn định" if exam_type_id != "ext_lab" else "Chỉ số viêm nhẹ",
            "Tiếp tục theo dõi tại nhà và duy trì dinh dưỡng phù hợp.",
            "Thú cưng tỉnh táo, phản xạ tốt.", exam_status, day, doctor_id,
        ))
        for field_id, field_type in fields_by_type[exam_type_id]:
            value_text = value_number = value_date = file_url = None
            if field_type in {"text", "select"}:
                value_text = {
                    "ext_general": "Thể trạng tốt, niêm mạc hồng.",
                    "ext_vaccine": "Nobivac, lô NV-2026.",
                    "ext_lab": "Mẫu máu; các chỉ số chính trong giới hạn theo dõi.",
                    "ext_recheck": "Đáp ứng điều trị tốt.",
                }[exam_type_id]
            elif field_type == "number":
                value_number = money("38.50" if exam_type_id == "ext_general" else "5.20")
            elif field_type == "date":
                value_date = today + timedelta(days=30 + index)
            elif field_type == "file":
                file_url = LAB_REPORT_URL
            values.append((f"efv{len(values) + 1}", exam_id, field_id, value_text, value_number, value_date, file_url, local_dt(day, hour + 1)))
        if exam_type_id == "ext_vaccine" or index in {1, 3, 6, 7, 11, 13, 17, 19, 21}:
            vaccinations.append((
                f"vac{len(vaccinations) + 1}", pet_id, exam_id,
                ["Vắc xin dại", "Vắc xin 5 bệnh", "Vắc xin 7 bệnh"][len(vaccinations) % 3],
                day, "Không ghi nhận phản ứng bất thường sau tiêm.",
            ))
        if index <= 20:
            prescription_id = f"rx{index}"
            prescriptions.append((prescription_id, exam_id, day, "Dùng thuốc đúng liều và tái khám khi có dấu hiệu bất thường."))
            medicine_ids = [f"med{1 + index % 10}", f"med{1 + (index + 4) % 10}"]
            for medicine_id in medicine_ids:
                prescriptions_qty = 2 if MEDICINE_BY_ID[medicine_id][2] in {"bottle", "tube"} else 6
                prescription_items.append((
                    f"rxi{len(prescription_items) + 1}", prescription_id, medicine_id,
                    prescriptions_qty, "1 đơn vị", "2 lần mỗi ngày", "5 ngày",
                    MEDICINE_BY_ID[medicine_id][4], None,
                ))
        if exam_status == "follow_up_required":
            follow_ups.append((
                f"fui{len(follow_ups) + 1}", exam_id, today + timedelta(days=7 + len(follow_ups) * 2),
                "Đánh giá lại đáp ứng điều trị.", "Đặt lịch vào buổi sáng.", "pending", None,
            ))

    future_specs = [
        ("pet1", "ext_vaccine", "doc2", DEMO_FOCUS_DATES[0] + timedelta(days=1), 9, "rejected", "waiting"),
        ("pet2", "ext_general", "doc1", DEMO_FOCUS_DATES[0] + timedelta(days=2), 10, "cancelled", "waiting"),
        ("pet3", "ext_recheck", "doc1", DEMO_FOCUS_DATES[0] + timedelta(days=3), 14, "rejected", "waiting"),
        ("pet1", "ext_general", "doc1", DEMO_FOCUS_DATES[0], 13, "confirmed", "waiting"),
        ("pet2", "ext_vaccine", "doc2", DEMO_FOCUS_DATES[0], 13, "confirmed", "waiting"),
        ("pet3", "ext_lab", "doc3", DEMO_FOCUS_DATES[0], 14, "confirmed", "waiting"),
        ("pet6", "ext_recheck", "doc4", DEMO_FOCUS_DATES[0], 14, "confirmed", "waiting"),
        ("pet7", "ext_lab", "doc1", DEMO_FOCUS_DATES[0], 16, "confirmed", "waiting"),
        ("pet8", "ext_recheck", "doc2", DEMO_FOCUS_DATES[0], 16, "confirmed", "waiting"),
        ("pet9", "ext_general", "doc3", DEMO_FOCUS_DATES[0], 15, "confirmed", "waiting"),
        ("pet10", "ext_vaccine", "doc4", DEMO_FOCUS_DATES[0], 15, "pending", "waiting"),
    ]
    statuses = ["rejected", "cancelled"]
    while len(future_specs) < 40:
        position = len(future_specs)
        status = statuses[position % len(statuses)]
        exam_type_id = list(EXAM_TYPE_SERVICE)[position % 4]
        future_specs.append((
            f"pet{1 + (position + 3) % 42}", exam_type_id, f"doc{1 + position % 4}",
            today + timedelta(days=1 + position // 4), 8 + position % 8,
            status, "waiting",
        ))
    for offset, (pet_id, exam_type_id, doctor_id, day, hour, status, examination_status) in enumerate(future_specs, 41):
        service_id = EXAM_TYPE_SERVICE[exam_type_id]
        appointments.append((
            f"appt{offset}", pet_id, owner_by_pet[pet_id], exam_type_id,
            doctor_id if status == "confirmed" else None,
            local_dt(day, hour, 0 if offset in {51, 55, 59} else (30 if offset % 2 else 0)), SERVICE_DURATION[service_id],
            "Lịch hẹn phục vụ kiểm tra và chăm sóc định kỳ.", status, examination_status,
            None, "Bác sĩ không còn khung giờ phù hợp." if status == "rejected" else None,
            f"stf{1 + offset % 4}" if status in {"confirmed", "rejected"} else None,
        ))

    return {
        "medical_appointments": appointments,
        "medical_exams": exams,
        "medical_exam_field_values": values,
        "vaccinations": vaccinations[:16],
        "prescriptions": prescriptions,
        "prescription_items": prescription_items,
        "follow_up_instructions": follow_ups,
    }


def build_grooming(
    today: date,
    owner_by_pet: dict[str, str],
    weight_by_pet: dict[str, Decimal],
) -> tuple[list[tuple], list[tuple]]:
    tickets = []
    items = []
    active_generated_specs = {
        6: ("pet4", "svc5", DEMO_FOCUS_DATES[0], "pending"),
        7: ("pet5", "svc8", DEMO_FOCUS_DATES[0], "waiting"),
        8: ("pet6", "svc5", DEMO_FOCUS_DATES[0], "pending"),
        9: ("pet7", "svc8", DEMO_FOCUS_DATES[0], "waiting"),
        10: ("pet8", "svc9", DEMO_FOCUS_DATES[0], "in_progress"),
    }
    focus_grooming_times = {
        4: (13, 0),
        6: (13, 30),
        7: (14, 0),
        8: (14, 30),
        9: (15, 0),
        10: (16, 0),
    }
    owner1_specs = [
        ("pet1", "svc5", today - timedelta(days=120), "completed"),
        ("pet2", "svc6", today - timedelta(days=75), "completed"),
        ("pet3", "svc7", today - timedelta(days=30), "completed"),
        ("pet2", "svc9", DEMO_FOCUS_DATES[0], "in_progress"),
        ("pet1", "svc8", today - timedelta(days=10), "cancelled"),
    ]
    specs = list(owner1_specs)
    for index in range(6, 56):
        if index in active_generated_specs:
            specs.append(active_generated_specs[index])
            continue
        status = "completed" if index % 2 == 0 else "cancelled"
        day = today - timedelta(days=7 + index * 3)
        specs.append((f"pet{1 + index % 42}", f"svc{5 + index % 5}", day, status))
    for index, (pet_id, service_id, day, status) in enumerate(specs, 1):
        duration = SERVICE_DURATION[service_id]
        if index in focus_grooming_times:
            hour, minute = focus_grooming_times[index]
        else:
            hour = 8 + ((index * 2) % 9)
            minute = 30 if index % 2 else 0
        if hour == 17 and duration > 60:
            hour = 16
        scheduled = local_dt(day, hour, minute)
        surcharge = grooming_surcharge(weight_by_pet[pet_id])
        total = SERVICE_PRICE[service_id] + surcharge
        tickets.append((
            f"spa{index}", pet_id, owner_by_pet[pet_id],
            owner_by_pet[pet_id] if index % 3 else f"stf{1 + index % 4}",
            "online" if index % 3 else "counter", scheduled, duration,
            scheduled + timedelta(minutes=10) if status in {"waiting", "in_progress", "completed"} else None,
            "Thao tác nhẹ quanh vùng tai." if index % 4 == 0 else None,
            money(total), status,
        ))
        items.append((f"gti{index}", f"spa{index}", service_id, 1, money(total), money(total)))
    return tickets, items


def build_boarding(today: date, owner_by_pet: dict[str, str]) -> tuple[list[tuple], list[tuple]]:
    records = []
    updates = []
    owner1_specs = [
        ("pet3", "rt1", today - timedelta(days=150), 2, "checked_out"),
        ("pet3", "rt3", today - timedelta(days=65), 3, "checked_out"),
        ("pet3", "rt2", DEMO_FOCUS_DATES[0], 4, "staying"),
        ("pet1", "rt4", DEMO_FOCUS_DATES[0], 2, "confirmed"),
    ]
    specs = list(owner1_specs)
    statuses = ["pending", "confirmed", "staying", "checked_out", "rejected", "cancelled"]
    active_room_sequence = ["rt1"] * 8 + ["rt2"] * 4 + ["rt3"] * 3 + ["rt4"]
    active_room_index = 0
    for index in range(5, 36):
        status = statuses[(index - 5) % len(statuses)]
        if status == "checked_out":
            start = today - timedelta(days=25 + index * 3)
        elif status == "staying":
            start = DEMO_FOCUS_DATES[0]
        elif status in {"rejected", "cancelled"}:
            start = today - timedelta(days=4 + index)
        else:
            start = DEMO_FOCUS_DATES[0]
        if status in {"pending", "confirmed", "staying"}:
            room_id = active_room_sequence[active_room_index]
            active_room_index += 1
        else:
            room_id = f"rt{1 + index % 5}"
        specs.append((f"pet{1 + index % 42}", room_id, start, 1 + index % 4, status))

    for index, (pet_id, room_id, start, nights, status) in enumerate(specs, 1):
        planned_hour = 13 + (index % 4) if status in {"pending", "confirmed", "staying"} and start in DEMO_FOCUS_DATES else 9 + index % 3
        planned_in = local_dt(start, planned_hour)
        planned_out = local_dt(start + timedelta(days=nights), 16)
        actual_in = planned_in + timedelta(minutes=15) if status in {"staying", "checked_out"} else None
        actual_out = planned_out - timedelta(minutes=20) if status == "checked_out" else None
        price = next(row[3] for row in ROOM_TYPES if row[0] == room_id)
        records.append((
            f"brd{index}", pet_id, owner_by_pet[pet_id], room_id, planned_in, planned_out,
            actual_in, actual_out, "Cho ăn theo khẩu phần đã ghi trong hồ sơ.",
            money(price * nights), status, local_dt(start - timedelta(days=5), 10),
            "Loại phòng đã đủ công suất trong thời gian yêu cầu." if status == "rejected" else None,
            f"stf{1 + index % 4}" if status not in {"pending", "cancelled"} else None,
        ))
        if status in {"staying", "checked_out"} and len(updates) < 12:
            updates.append((
                f"bup{len(updates) + 1}", f"brd{index}", f"stf{1 + index % 4}",
                (actual_in or planned_in) + timedelta(hours=5),
                "Thú cưng ăn uống tốt, vận động bình thường và nghỉ ngơi ổn định.",
                [BOARDING_IMAGE] if len(updates) % 2 == 0 else None,
                "normal", "published",
            ))
    return records, updates


def prescription_total(prescription_id: str, items: list[tuple]) -> int:
    total = 0
    for item in items:
        if item[1] == prescription_id:
            total += int(item[3]) * int(MEDICINE_BY_ID[item[2]][5])
    return total


def build_billing(
    today: date,
    data: dict[str, list[tuple]],
    owner_by_pet: dict[str, str],
) -> tuple[list[tuple], list[tuple], list[tuple]]:
    exams = {row[0]: row for row in data["medical_exams"]}
    appointments = {row[0]: row for row in data["medical_appointments"]}
    grooming = {row[0]: row for row in data["grooming_tickets"]}
    grooming_items = {row[1]: row for row in data["grooming_ticket_items"]}
    boarding = {row[0]: row for row in data["boarding_records"]}
    prescriptions = {row[0]: row for row in data["prescriptions"]}

    sources: dict[str, list[dict]] = defaultdict(list)
    for exam_id, exam in exams.items():
        appointment = appointments[exam[1]]
        service_id = EXAM_TYPE_SERVICE[appointment[3]]
        sources["medical_exam"].append({
            "source_id": exam_id, "pet_id": appointment[1], "owner_id": appointment[2],
            "service_id": service_id, "amount": SERVICE_PRICE[service_id],
            "description": SERVICE_BY_ID[service_id][1],
        })
    for ticket_id, ticket in grooming.items():
        item = grooming_items[ticket_id]
        sources["grooming"].append({
            "source_id": ticket_id, "pet_id": ticket[1], "owner_id": ticket[2],
            "service_id": item[2], "amount": int(ticket[9]), "description": SERVICE_BY_ID[item[2]][1],
        })
    for record_id, record in boarding.items():
        service_id = ROOM_SERVICE[record[3]]
        sources["boarding"].append({
            "source_id": record_id, "pet_id": record[1], "owner_id": record[2],
            "service_id": service_id, "amount": int(record[9]), "description": SERVICE_BY_ID[service_id][1],
        })
    exam_by_id = {row[0]: row for row in data["medical_exams"]}
    for prescription_id, prescription in prescriptions.items():
        exam = exam_by_id[prescription[1]]
        appointment = appointments[exam[1]]
        amount = prescription_total(prescription_id, data["prescription_items"])
        sources["prescription"].append({
            "source_id": prescription_id, "pet_id": appointment[1], "owner_id": appointment[2],
            "service_id": "svc15", "amount": amount, "description": "Thuốc theo đơn bác sĩ",
        })

    paid_specs: list[tuple[str, dict, date]] = []
    used_keys: set[tuple[str, str]] = set()
    monthly_categories = ["medical_exam", "grooming", "boarding", "prescription", "medical_exam", "grooming"]
    for month_offset in range(-5, 1):
        for slot, source_type in enumerate(monthly_categories):
            candidates = sources[source_type]
            if month_offset == -5:
                candidates = [source for source in candidates if source["owner_id"] == "own1"] or candidates
            source = candidates[((month_offset + 5) * 6 + slot) % len(candidates)]
            attempts = 0
            while (source_type, source["source_id"]) in used_keys and attempts < len(candidates):
                source = candidates[(candidates.index(source) + 1) % len(candidates)]
                attempts += 1
            paid_specs.append((source_type, source, safe_month_day(today, month_offset, 5 + slot * 3)))
            used_keys.add((source_type, source["source_id"]))
    for source_type, source in [(kind, item) for kind, values in sources.items() for item in values]:
        if len(paid_specs) >= 40:
            break
        if (source_type, source["source_id"]) not in used_keys:
            paid_specs.append((source_type, source, safe_month_day(today, 0, 24 + len(paid_specs) % 4)))
            used_keys.add((source_type, source["source_id"]))

    trend_factors = {-5: Decimal("0.70"), -4: Decimal("0.78"), -3: Decimal("0.75"), -2: Decimal("0.88"), -1: Decimal("0.92"), 0: Decimal("1.00")}
    target_current_revenue = Decimal("1700000")
    paid_discounts = [Decimal("0") for _ in paid_specs]
    for month_offset, factor in trend_factors.items():
        indices = [
            index for index, (_kind, _source, paid_date) in enumerate(paid_specs)
            if (paid_date.year, paid_date.month) == (month_start(today, month_offset).year, month_start(today, month_offset).month)
        ]
        base_total = sum(Decimal(paid_specs[index][1]["amount"]) for index in indices)
        desired_total = (target_current_revenue * factor).quantize(Decimal("1"))
        adjustable = [index for index in indices if paid_specs[index][0] != "grooming"]
        adjustable_total = sum(Decimal(paid_specs[index][1]["amount"]) for index in adjustable)
        required_discount = base_total - desired_total
        ensure(required_discount >= 0 and required_discount < adjustable_total, f"Không thể tạo xu hướng doanh thu tháng {month_offset}.")
        remaining = required_discount
        for position, index in enumerate(adjustable):
            amount = Decimal(paid_specs[index][1]["amount"])
            if position == len(adjustable) - 1:
                discount = remaining
            else:
                discount = (required_discount * amount / adjustable_total).quantize(Decimal("1"))
                discount = min(discount, amount - Decimal("1"))
            paid_discounts[index] = discount
            remaining -= discount

    pending_specs: list[tuple[str, dict, date, str]] = []
    for source_type in ["grooming", "boarding"]:
        source = next(source for source in sources[source_type] if source["owner_id"] == "own1" and (source_type, source["source_id"]) not in used_keys)
        pending_specs.append((source_type, source, today, "pending_payment"))
        used_keys.add((source_type, source["source_id"]))
    all_sources = [(kind, source) for kind, values in sources.items() for source in values]
    for source_type, source in all_sources:
        if len(pending_specs) >= 35:
            break
        key = (source_type, source["source_id"])
        if key in used_keys:
            continue
        pending_specs.append((source_type, source, today - timedelta(days=len(pending_specs) % 12), "cancelled" if len(pending_specs) >= 31 else "pending_payment"))
        used_keys.add(key)

    invoices = []
    lines = []
    payments = []

    def append_invoice(source_type: str, source: dict, issued_at: date, status: str, discount_value: Decimal = Decimal("0")) -> None:
        index = len(invoices) + 1
        subtotal = money(source["amount"])
        discount = money(discount_value)
        surcharge = money(0)
        total = subtotal - discount
        payment_option = "online" if index % 2 else "counter"
        invoices.append((
            f"inv{index}", source["owner_id"], source["pet_id"], issued_at,
            subtotal, discount, surcharge, total, payment_option,
            local_dt(issued_at + timedelta(days=3), 23, 59) if status == "pending_payment" else None,
            status,
        ))
        lines.append((
            f"inl{index}", f"inv{index}", source["service_id"], source_type, source["source_id"],
            source["description"], 1, subtotal, discount, total,
        ))
        if status == "paid":
            payments.append((
                f"pay{len(payments) + 1}", f"inv{index}",
                "online" if payment_option == "online" else "at_counter",
                f"DEMO-{issued_at:%Y%m}-{index:03d}", total, local_dt(issued_at, 15, index % 60),
                "success", f"PT-{index:04d}", RECEIPT_URL,
            ))

    for index, (source_type, source, paid_date) in enumerate(paid_specs):
        append_invoice(source_type, source, paid_date, "paid", paid_discounts[index])
    for source_type, source, issued_at, status in pending_specs:
        append_invoice(source_type, source, issued_at, status)
    return invoices, lines, payments


def build_notifications(today: date, data: dict[str, list[tuple]]) -> list[tuple]:
    notifications = []
    related = [
        ("medical_appointment", row[0], row[2]) for row in data["medical_appointments"]
    ] + [
        ("grooming_ticket", row[0], row[2]) for row in data["grooming_tickets"]
    ] + [
        ("boarding_record", row[0], row[2]) for row in data["boarding_records"]
    ] + [
        ("invoice", row[0], row[1]) for row in data["invoices"]
    ]
    owner1_related = [item for item in related if item[2] == "own1"]
    selected = owner1_related[:8] + related
    for index, (object_type, object_id, receiver_id) in enumerate(selected[:100], 1):
        labels = {
            "medical_appointment": "lịch khám",
            "grooming_ticket": "phiếu spa",
            "boarding_record": "lượt lưu trú",
            "invoice": "hóa đơn",
        }
        notifications.append((
            f"noti{index}", receiver_id, f"Cập nhật {labels[object_type]}",
            f"Trung tâm vừa cập nhật thông tin cho {labels[object_type]} {object_id}.",
            "app", local_dt(today - timedelta(days=index % 45), 8 + index % 12),
            "unread" if index % 3 == 0 else "read", object_type, object_id,
        ))
    return notifications


def build_activity_logs(today: date, data: dict[str, list[tuple]]) -> list[tuple]:
    logs = []

    def add(pet_id: str, owner_id: str, actor_id: str | None, category: str, activity_type: str,
            status: str, occurred_at: datetime, title: str, summary: str, source_type: str,
            source_id: str, metadata: dict | None = None) -> None:
        logs.append((
            f"pal{len(logs) + 1}", pet_id, owner_id, actor_id, category, activity_type,
            status, occurred_at, title, summary, source_type, source_id, "visible",
            json.dumps(metadata or {}, ensure_ascii=False), occurred_at,
        ))

    appointment_by_id = {row[0]: row for row in data["medical_appointments"]}
    for exam in data["medical_exams"]:
        appointment = appointment_by_id[exam[1]]
        add(appointment[1], appointment[2], exam[7], "medical", "medical_exam_recorded", "completed",
            local_dt(exam[6], 16), "Đã có kết quả khám", exam[3], "medical_exam", exam[0],
            {"appointmentId": appointment[0]})
    for vaccination in data["vaccinations"]:
        owner_id = next(row[1] for row in data["pets"] if row[0] == vaccination[1])
        add(vaccination[1], owner_id, None, "vaccination", "vaccination_recorded", "completed",
            local_dt(vaccination[4], 16), f"Đã tiêm {vaccination[3]}", vaccination[5],
            "vaccination", vaccination[0])
    for ticket in data["grooming_tickets"]:
        status = "completed" if ticket[10] == "completed" else ("cancelled" if ticket[10] == "cancelled" else "scheduled")
        add(ticket[1], ticket[2], ticket[3], "grooming", "grooming_status_updated", status,
            ticket[5], "Cập nhật dịch vụ spa", ticket[7] or "Phiếu spa đã được cập nhật.",
            "grooming_ticket", ticket[0], {"ticketStatus": ticket[10]})
    for record in data["boarding_records"]:
        status = "completed" if record[10] == "checked_out" else ("rejected" if record[10] == "rejected" else "confirmed")
        add(record[1], record[2], record[13], "boarding", "boarding_status_updated", status,
            record[6] or record[4], "Cập nhật lưu trú", record[8], "boarding_record", record[0],
            {"boardingStatus": record[10]})
    for invoice in data["invoices"]:
        if len(logs) >= 120:
            break
        add(invoice[2], invoice[1], None, "invoice", "invoice_issued",
            "completed" if invoice[10] == "paid" else "pending",
            local_dt(invoice[3], 14), "Hóa đơn đã được tạo",
            f"Tổng thanh toán {int(invoice[7]):,} VND.", "invoice", invoice[0],
            {"invoiceStatus": invoice[10]})
    return logs[:120]


def build_seed() -> tuple[dict[str, list[tuple]], date]:
    random.seed(RANDOM_SEED)
    today = reference_date()
    data: dict[str, list[tuple]] = {}
    data["users"] = build_users(today)
    pets, profiles, owner_by_pet, weight_by_pet = build_pets(today)
    data["pets"] = pets
    data["pet_health_profiles"] = profiles
    data["services"] = [
        (service_id, name, category, description, duration, money(price), "active")
        for service_id, name, category, description, duration, price in SERVICES
    ]
    data["exam_types"] = EXAM_TYPES
    fields, fields_by_type = build_exam_fields()
    data["exam_field_definitions"] = fields
    data.update(build_medical(today, owner_by_pet, fields_by_type))
    medicine_stocks = [120, 84, 46, 32, 150, 24, 92, 18, 110, 36, 22, 70, 40, 16, 55, 28, 0, 5]
    data["medicines"] = [
        row[:6] + (medicine_stocks[index],) + row[6:]
        for index, row in enumerate(MEDICINES)
    ]
    grooming, grooming_items = build_grooming(today, owner_by_pet, weight_by_pet)
    data["grooming_tickets"] = grooming
    data["grooming_ticket_items"] = grooming_items
    data["room_types"] = ROOM_TYPES
    boarding, boarding_updates = build_boarding(today, owner_by_pet)
    data["boarding_records"] = boarding
    data["boarding_updates"] = boarding_updates
    invoices, invoice_lines, payments = build_billing(today, data, owner_by_pet)
    data["invoices"] = invoices
    data["invoice_lines"] = invoice_lines
    data["payments"] = payments
    data["notifications"] = build_notifications(today, data)
    data["pet_activity_logs"] = build_activity_logs(today, data)
    validate_demo_coverage(data, today)
    return data, today


def ensure(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def contains_mojibake(value: object) -> bool:
    if isinstance(value, str):
        return any(token in value for token in ("Ã", "Â", "Ä", "Æ", "áº", "á»"))
    if isinstance(value, dict):
        return any(contains_mojibake(key) or contains_mojibake(item) for key, item in value.items())
    if isinstance(value, (list, tuple)):
        return any(contains_mojibake(item) for item in value)
    return False


def max_concurrent(rows: list[tuple[datetime, datetime]]) -> int:
    points: list[tuple[datetime, int]] = []
    for start, end in rows:
        points.append((start, 1))
        points.append((end, -1))
    active = 0
    peak = 0
    for _moment, delta in sorted(points, key=lambda item: (item[0], item[1])):
        active += delta
        peak = max(peak, active)
    return peak


def validate_demo_coverage(data: dict[str, list[tuple]], today: date) -> None:
    ensure(len(data["users"]) == 41, "Phải có đúng 30 Owner, 5 Staff, 4 Doctor và 2 Admin.")
    ensure(Counter(row[6] for row in data["users"]) == {"Owner": 30, "Staff": 5, "Doctor": 4, "Admin": 2}, "Sai số lượng user theo vai trò.")
    ensure([row[2] for row in data["users"] if row[6] == "Doctor"] == DOCTOR_EMAILS, "Email bác sĩ phải là họ tên không dấu.")
    ensure(len(data["pets"]) == 42, "Phải có đúng 42 thú cưng.")
    ensure([row[2] for row in data["pets"] if row[1] == "own1"] == ["Milo", "Bông", "Lucky"], "Owner demo phải có đúng Milo, Bông và Lucky.")
    ensure(len({row[10] for row in data["pets"]}) >= 18, "Ảnh thú cưng cần đa dạng hơn.")
    expected_counts = {
        "medical_appointments": 80, "medical_exams": 40, "vaccinations": 16,
        "prescriptions": 20, "grooming_tickets": 55, "boarding_records": 35,
        "invoices": 75, "payments": 40, "notifications": 100, "pet_activity_logs": 120,
    }
    for table, expected in expected_counts.items():
        ensure(len(data[table]) == expected, f"{table} phải có {expected} bản ghi, hiện có {len(data[table])}.")
    ensure(len(data["medicines"]) == 18, "Phải có đúng 18 thuốc.")
    ensure(all(row[6] >= 0 for row in data["medicines"]), "Tồn kho thuốc không được âm.")
    ensure(len({row[6] for row in data["medicines"]}) >= 10, "Tồn kho thuốc cần có dữ liệu đa dạng.")
    ensure(len(data["boarding_updates"]) == 12, "Boarding update phải có đúng 12 bản ghi.")
    ensure(len(data["grooming_ticket_items"]) == len(data["grooming_tickets"]), "Mỗi grooming ticket phải có đúng một item.")

    appointments = data["medical_appointments"]
    appointment_statuses = {row[8] for row in appointments}
    ensure({"pending", "confirmed", "rejected", "cancelled"} <= appointment_statuses, "Thiếu trạng thái lịch khám cho staff.")
    ensure(all(row[6] == SERVICE_DURATION[EXAM_TYPE_SERVICE[row[3]]] for row in appointments), "Duration lịch khám không khớp service.")
    ensure(all(8 <= row[5].astimezone(VIETNAM_TZ).hour < 17 and row[5] + timedelta(minutes=row[6]) <= local_dt(row[5].date(), 17) for row in appointments), "Có lịch khám ngoài giờ 08:00-17:00.")
    ensure(all(row[5].minute in {0, 30} for row in appointments), "Giờ khám phải cách nhau theo bước 30 phút.")
    ensure(all(row[5].date() >= today for row in appointments if row[8] in {"pending", "confirmed"} and row[9] == "waiting"), "Lịch pending/confirmed chưa xử lý phải ở hôm nay hoặc tương lai.")
    doctor_today = [row for row in appointments if row[4] == "doc1" and row[5].date() == today and row[8] == "confirmed"]
    ensure(len(doctor_today) >= 2 and {"ext_general", "ext_lab"} <= {row[3] for row in doctor_today}, "Doctor demo thiếu lịch tổng quát và xét nghiệm hôm nay.")
    ensure(len([row for row in appointments if row[4] == "doc1" and today - timedelta(days=183) <= row[5].date() <= today]) >= 10, "Doctor demo thiếu lịch sử 6 tháng.")
    for focus_day in DEMO_FOCUS_DATES:
        focus_appointments = [row for row in appointments if row[5].date() == focus_day and row[8] in {"pending_payment", "pending", "confirmed"}]
        focus_confirmed = [row for row in focus_appointments if row[8] == "confirmed"]
        focus_type_counts = Counter(row[3] for row in focus_appointments)
        ensure(len(focus_appointments) >= 8, f"Ngày {focus_day} phải có ít nhất 8 lịch khám active.")
        ensure(len(focus_confirmed) >= 7, f"Ngày {focus_day} phải có ít nhất 7 lịch khám đã xác nhận.")
        ensure(all(focus_type_counts[exam_type_id] >= 2 for exam_type_id in EXAM_TYPE_SERVICE), f"Ngày {focus_day} phải có ít nhất 2 lịch cho mỗi loại khám.")
        ensure(all(13 <= row[5].hour < 17 for row in focus_appointments), f"Lịch khám ngày {focus_day} phải nằm trong khung 13:00-17:00.")
        focus_intervals = [(row[5], row[5] + timedelta(minutes=row[6])) for row in focus_appointments]
        active_doctor_count = len([row for row in data["users"] if row[6] == "Doctor" and row[7] == "active"])
        ensure(max_concurrent(focus_intervals) <= active_doctor_count - 1, f"Ngày {focus_day} phải chừa ít nhất 1 slot khám.")
    confirmed_by_doctor: dict[str, list[tuple]] = defaultdict(list)
    for appointment in appointments:
        if appointment[8] == "confirmed" and appointment[4]:
            confirmed_by_doctor[appointment[4]].append(appointment)
    for doctor_id, doctor_appointments in confirmed_by_doctor.items():
        for index, appointment in enumerate(doctor_appointments):
            start = appointment[5]
            end = start + timedelta(minutes=appointment[6])
            for other in doctor_appointments[index + 1:]:
                other_start = other[5]
                other_end = other_start + timedelta(minutes=other[6])
                ensure(not (start < other_end and end > other_start), f"Bác sĩ {doctor_id} có lịch khám chồng lấn.")

    grooming_statuses = {row[10] for row in data["grooming_tickets"]}
    ensure({"pending", "waiting", "in_progress", "completed", "cancelled"} <= grooming_statuses, "Thiếu trạng thái grooming.")
    ensure(all(row[6] == SERVICE_DURATION[next(item[2] for item in data["grooming_ticket_items"] if item[1] == row[0])] for row in data["grooming_tickets"]), "Duration grooming không khớp service.")
    ensure(all(row[5] + timedelta(minutes=row[6]) <= local_dt(row[5].date(), 18) for row in data["grooming_tickets"]), "Có lịch grooming kết thúc sau 18:00.")
    ensure(all(row[5].date() < today for row in data["grooming_tickets"] if row[10] == "completed"), "Grooming completed phải nằm trong quá khứ.")
    active_grooming = [row for row in data["grooming_tickets"] if row[10] in {"pending", "waiting", "in_progress"}]
    ensure(all(row[5].date() in DEMO_FOCUS_DATES and 13 <= row[5].hour < 17 for row in active_grooming), "Spa active phải tập trung trong khung 13:00-17:00 ngày 20/06.")
    active_staff_count = len([row for row in data["users"] if row[6] == "Staff" and row[7] == "active"])
    for focus_day in DEMO_FOCUS_DATES:
        focus_grooming_intervals = [
            (row[5], row[5] + timedelta(minutes=row[6]))
            for row in active_grooming
            if row[5].date() == focus_day
        ]
        ensure(max_concurrent(focus_grooming_intervals) <= active_staff_count - 1, f"Ngày {focus_day} phải chừa ít nhất 1 slot spa.")

    boarding_statuses = {row[10] for row in data["boarding_records"]}
    ensure({"pending", "confirmed", "staying", "checked_out", "rejected"} <= boarding_statuses, "Thiếu trạng thái boarding.")
    ensure(all(row[6] is not None and row[7] is not None for row in data["boarding_records"] if row[10] == "checked_out"), "Boarding checked_out thiếu thời gian thực tế.")
    ensure(all(row[6] is not None and row[7] is None for row in data["boarding_records"] if row[10] == "staying"), "Boarding staying có thời gian không hợp lệ.")
    ensure(all(row[12] for row in data["boarding_records"] if row[10] == "rejected"), "Boarding rejected thiếu lý do.")
    active_boarding = [row for row in data["boarding_records"] if row[10] in {"pending", "confirmed", "staying"}]
    ensure(all(row[4].date() in DEMO_FOCUS_DATES and 13 <= row[4].hour < 17 for row in active_boarding), "Boarding active phải tập trung check-in trong khung 13:00-17:00 ngày 20/06.")
    for room_id, _name, capacity, *_rest in ROOM_TYPES:
        room_records = [row for row in data["boarding_records"] if row[3] == room_id and row[10] in {"pending", "confirmed", "staying"}]
        for record in room_records:
            overlap = sum(other[4] < record[5] and other[5] > record[4] for other in room_records)
            ensure(overlap <= capacity - 1, f"Room {room_id} phải chừa ít nhất 1 slot.")
        ensure(any(row[3] == room_id for row in data["boarding_records"]), f"Room {room_id} chưa có lịch sử sử dụng.")

    invoice_by_id = {row[0]: row for row in data["invoices"]}
    success_by_invoice = {row[1] for row in data["payments"] if row[6] == "success"}
    ensure(all(row[4] - row[5] + row[6] == row[7] for row in data["invoices"]), "Có invoice sai công thức tổng.")
    ensure(all(row[0] in success_by_invoice for row in data["invoices"] if row[10] == "paid"), "Invoice paid thiếu payment success.")
    ensure(all(row[5] is not None for row in data["payments"] if row[6] == "success"), "Payment success thiếu paid_at.")
    ensure(all(invoice_by_id[row[1]][7] == row[4] for row in data["payments"] if row[6] == "success"), "Số tiền payment không khớp invoice.")
    revenue_months = {(row[5].year, row[5].month) for row in data["payments"] if row[6] == "success"}
    expected_months = {(month_start(today, offset).year, month_start(today, offset).month) for offset in range(-5, 1)}
    ensure(expected_months <= revenue_months, "Chưa đủ doanh thu paid cho 6 tháng.")
    monthly_revenue = {
        (month_start(today, offset).year, month_start(today, offset).month): sum(
            row[4] for row in data["payments"]
            if row[6] == "success"
            and (row[5].year, row[5].month) == (month_start(today, offset).year, month_start(today, offset).month)
        )
        for offset in range(-5, 1)
    }
    current_revenue = monthly_revenue[(today.year, today.month)]
    expected_factors = [Decimal("0.70"), Decimal("0.78"), Decimal("0.75"), Decimal("0.88"), Decimal("0.92"), Decimal("1.00")]
    actual_values = [monthly_revenue[(month_start(today, offset).year, month_start(today, offset).month)] for offset in range(-5, 1)]
    ensure(len(set(actual_values)) == 6, "Doanh thu các tháng không được giống nhau.")
    ensure(actual_values[-1] > actual_values[-2], "Doanh thu tháng gần nhất phải cao hơn tháng trước.")
    ensure(all(abs(value / current_revenue - factor) <= Decimal("0.01") for value, factor in zip(actual_values, expected_factors)), "Xu hướng doanh thu 6 tháng không đúng mục tiêu.")
    lines_by_invoice: dict[str, set[str]] = defaultdict(set)
    for line in data["invoice_lines"]:
        lines_by_invoice[line[1]].add(line[3])
    for year, month in expected_months:
        month_invoice_ids = {row[1] for row in data["payments"] if row[6] == "success" and (row[5].year, row[5].month) == (year, month)}
        ensure(len(month_invoice_ids) >= 5, f"Tháng {year}-{month:02d} có dưới 5 invoice paid.")
        month_sources = set().union(*(lines_by_invoice[invoice_id] for invoice_id in month_invoice_ids))
        ensure({"medical_exam", "grooming", "boarding", "prescription"} <= month_sources, f"Tháng {year}-{month:02d} thiếu nhóm doanh thu.")

    owner1_appointments = [row for row in appointments if row[2] == "own1"]
    ensure(len([row for row in owner1_appointments if row[9] in {"completed", "follow_up"}]) >= 4, "Owner demo thiếu 4 lịch khám hoàn tất.")
    ensure(any(row[5].date() >= today and row[8] == "confirmed" for row in owner1_appointments), "Owner demo thiếu lịch khám active.")
    ensure(any(row[8] == "cancelled" for row in owner1_appointments), "Owner demo thiếu lịch khám đã hủy.")
    ensure(len([row for row in data["grooming_tickets"] if row[2] == "own1" and row[10] == "completed"]) >= 3, "Owner demo thiếu 3 spa hoàn tất.")
    ensure(any(row[2] == "own1" and row[10] == "in_progress" for row in data["grooming_tickets"]), "Owner demo thiếu spa đang xử lý.")
    ensure(len([row for row in data["boarding_records"] if row[2] == "own1" and row[10] == "checked_out"]) >= 2, "Owner demo thiếu 2 lượt đã trả phòng.")
    ensure(any(row[2] == "own1" and row[10] == "staying" for row in data["boarding_records"]), "Owner demo thiếu lượt đang lưu trú.")
    ensure(len([row for row in data["invoices"] if row[1] == "own1" and row[10] == "paid"]) >= 5, "Owner demo thiếu 5 invoice paid.")
    ensure(len([row for row in data["invoices"] if row[1] == "own1" and row[10] == "pending_payment"]) >= 2, "Owner demo thiếu 2 invoice chờ thanh toán.")
    ensure(len([row for row in data["notifications"] if row[1] == "own1"]) >= 8, "Owner demo thiếu 8 thông báo.")
    ensure(len([row for row in data["pet_activity_logs"] if row[2] == "own1"]) >= 10, "Owner demo thiếu 10 activity log.")
    ensure(len({row[7] for row in data["medical_exams"]}) >= 3, "Cần ít nhất 3 bác sĩ có dữ liệu khám.")
    ensure(not contains_mojibake(data), "Dữ liệu còn chuỗi lỗi encoding.")


INSERT_ORDER = [
    ("users", ["user_id", "full_name", "email", "password_hash", "phone_number", "address", "role", "account_status", "created_at"]),
    ("pets", ["pet_id", "owner_user_id", "pet_name", "species", "breed", "gender", "birth_date", "estimated_age", "fur_color", "weight_kg", "profile_image_url", "identifying_marks"]),
    ("pet_health_profiles", ["health_profile_id", "pet_id", "medical_history", "allergy_notes", "chronic_condition_notes", "food_type", "feeding_portion", "special_care_notes", "updated_at"]),
    ("services", ["service_id", "service_name", "service_category", "description", "estimated_duration_minutes", "base_price", "service_status"]),
    ("exam_types", ["exam_type_id", "type_code", "type_name", "description", "service_id", "type_status"]),
    ("exam_field_definitions", ["field_definition_id", "exam_type_id", "field_name", "field_label", "field_type", "is_required", "display_order", "option_source", "validation_rule", "field_status"]),
    ("medical_appointments", ["appointment_id", "pet_id", "owner_user_id", "exam_type_id", "veterinarian_user_id", "scheduled_at", "duration_minutes", "symptom_description", "appointment_status", "examination_status", "internal_note", "rejection_reason", "handled_by_staff_id"]),
    ("medical_exams", ["exam_id", "appointment_id", "diagnosis", "conclusion", "health_note", "exam_status", "exam_date", "examined_by_veterinarian_id"]),
    ("medical_exam_field_values", ["field_value_id", "exam_id", "field_definition_id", "value_text", "value_number", "value_date", "file_url", "created_at"]),
    ("vaccinations", ["vaccination_id", "pet_id", "exam_id", "vaccine_name", "vaccination_date", "note"]),
    ("medicines", ["medicine_id", "medicine_name", "unit", "description", "usage_note", "unit_price", "stock_quantity", "medicine_status"]),
    ("prescriptions", ["prescription_id", "exam_id", "prescribed_at", "general_note"]),
    ("prescription_items", ["prescription_item_id", "prescription_id", "medicine_id", "quantity", "dosage", "frequency", "duration", "usage_instruction", "note"]),
    ("follow_up_instructions", ["follow_up_id", "exam_id", "follow_up_date", "reason", "owner_note", "follow_up_status", "completed_at"]),
    ("grooming_tickets", ["grooming_ticket_id", "pet_id", "owner_user_id", "created_by_user_id", "source_type", "scheduled_at", "duration_minutes", "received_at", "special_request", "estimated_total", "ticket_status"]),
    ("grooming_ticket_items", ["grooming_ticket_item_id", "grooming_ticket_id", "service_id", "quantity", "applied_unit_price", "line_amount"]),
    ("room_types", ["room_type_id", "room_type_name", "capacity", "boarding_unit_price", "description", "room_type_status"]),
    ("boarding_records", ["boarding_record_id", "pet_id", "owner_user_id", "room_type_id", "planned_check_in_at", "planned_check_out_at", "actual_check_in_at", "actual_check_out_at", "care_request", "estimated_total", "boarding_status", "created_at", "rejection_reason", "handled_by_staff_id"]),
    ("boarding_updates", ["boarding_update_id", "boarding_record_id", "created_by_user_id", "updated_at", "update_note", "attachment_url", "alert_level", "visibility_status"]),
    ("invoices", ["invoice_id", "owner_user_id", "pet_id", "issued_at", "subtotal_amount", "discount_amount", "surcharge_amount", "total_amount", "payment_option", "payment_due_at", "invoice_status"]),
    ("invoice_lines", ["invoice_line_id", "invoice_id", "service_id", "source_type", "source_id", "description", "quantity", "unit_price", "line_discount_amount", "line_amount"]),
    ("payments", ["payment_id", "invoice_id", "payment_method", "transaction_code", "paid_amount", "paid_at", "payment_status", "receipt_code", "receipt_url"]),
    ("notifications", ["notification_id", "receiver_user_id", "title", "message", "delivery_channel", "created_at", "notification_status", "related_object_type", "related_object_id"]),
    ("pet_activity_logs", ["activity_log_id", "pet_id", "owner_user_id", "actor_user_id", "activity_category", "activity_type", "activity_status", "occurred_at", "title", "summary", "source_type", "source_id", "visibility_status", "metadata", "created_at"]),
]
DEPENDENT_CLEANUP_ORDER = [
    "online_payment_attempts",
    "notification_reminders",
    "email_logs",
    "password_reset_tokens",
]


def sync_id_sequences(cur) -> None:
    targets = {
        "own": ("users", "user_id"), "stf": ("users", "user_id"), "doc": ("users", "user_id"),
        "adm": ("users", "user_id"), "pet": ("pets", "pet_id"), "hp": ("pet_health_profiles", "health_profile_id"),
        "svc": ("services", "service_id"), "med": ("medicines", "medicine_id"), "appt": ("medical_appointments", "appointment_id"),
        "mex": ("medical_exams", "exam_id"), "efd": ("exam_field_definitions", "field_definition_id"),
        "efv": ("medical_exam_field_values", "field_value_id"), "rx": ("prescriptions", "prescription_id"),
        "rxi": ("prescription_items", "prescription_item_id"), "vac": ("vaccinations", "vaccination_id"),
        "fui": ("follow_up_instructions", "follow_up_id"), "spa": ("grooming_tickets", "grooming_ticket_id"),
        "gti": ("grooming_ticket_items", "grooming_ticket_item_id"), "rt": ("room_types", "room_type_id"),
        "brd": ("boarding_records", "boarding_record_id"), "bup": ("boarding_updates", "boarding_update_id"),
        "inv": ("invoices", "invoice_id"), "inl": ("invoice_lines", "invoice_line_id"),
        "pay": ("payments", "payment_id"), "noti": ("notifications", "notification_id"),
    }
    for prefix, (table, column) in targets.items():
        cur.execute(
            f"SELECT max(substring({column} FROM %s)::bigint) FROM {SCHEMA}.{table} WHERE {column} ~ %s",
            (f"^{prefix}([0-9]+)$", f"^{prefix}[0-9]+$"),
        )
        maximum = cur.fetchone()[0]
        cur.execute(
            "SELECT setval(%s::regclass, %s, %s)",
            (f"{SCHEMA}.{prefix}_id_seq", maximum or 1, maximum is not None),
        )


def validate_database_coverage(cur, today: date) -> dict[str, int]:
    counts = {}
    for table, _columns in INSERT_ORDER:
        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.{table}")
        counts[table] = cur.fetchone()[0]

    checks = [
        ("duration lịch khám bị null", "SELECT COUNT(*) FROM pet_center.medical_appointments WHERE duration_minutes IS NULL"),
        ("duration grooming bị null", "SELECT COUNT(*) FROM pet_center.grooming_tickets WHERE duration_minutes IS NULL"),
        ("invoice sai tổng", "SELECT COUNT(*) FROM pet_center.invoices WHERE subtotal_amount - discount_amount + surcharge_amount <> total_amount"),
        ("invoice paid thiếu payment success", """
            SELECT COUNT(*) FROM pet_center.invoices i
            WHERE i.invoice_status = 'paid'
              AND NOT EXISTS (SELECT 1 FROM pet_center.payments p WHERE p.invoice_id = i.invoice_id AND p.payment_status = 'success')
        """),
        ("grooming completed không ở quá khứ", "SELECT COUNT(*) FROM pet_center.grooming_tickets WHERE ticket_status = 'completed' AND scheduled_at::date >= %s"),
        ("boarding checked_out thiếu thời gian thực tế", "SELECT COUNT(*) FROM pet_center.boarding_records WHERE boarding_status = 'checked_out' AND (actual_check_in_at IS NULL OR actual_check_out_at IS NULL)"),
    ]
    for label, sql in checks:
        cur.execute(sql, (today,) if "%s" in sql else None)
        ensure(cur.fetchone()[0] == 0, f"Database validation lỗi: {label}.")

    focus_day = DEMO_FOCUS_DATES[0]
    cur.execute("""
        SELECT scheduled_at, duration_minutes
        FROM pet_center.medical_appointments
        WHERE appointment_status IN ('pending_payment', 'pending', 'confirmed')
          AND examination_status IN ('waiting', 'examining')
    """)
    appointment_intervals = [
        (row[0].astimezone(VIETNAM_TZ), row[0].astimezone(VIETNAM_TZ) + timedelta(minutes=row[1]))
        for row in cur.fetchall()
    ]
    ensure(all(start.date() == focus_day and 13 <= start.hour < 17 for start, _end in appointment_intervals), "Database có lịch khám active ngoài khung 13:00-17:00 ngày 20/06.")
    cur.execute("SELECT COUNT(*) FROM pet_center.users WHERE role = 'Doctor' AND account_status = 'active'")
    ensure(max_concurrent(appointment_intervals) <= cur.fetchone()[0] - 1, "Database không còn slot khám trống.")

    cur.execute("""
        SELECT scheduled_at, duration_minutes
        FROM pet_center.grooming_tickets
        WHERE ticket_status IN ('pending_payment', 'pending', 'waiting', 'in_progress')
    """)
    grooming_intervals = [
        (row[0].astimezone(VIETNAM_TZ), row[0].astimezone(VIETNAM_TZ) + timedelta(minutes=row[1]))
        for row in cur.fetchall()
    ]
    ensure(all(start.date() == focus_day and 13 <= start.hour < 17 for start, _end in grooming_intervals), "Database có spa active ngoài khung 13:00-17:00 ngày 20/06.")
    cur.execute("SELECT COUNT(*) FROM pet_center.users WHERE role = 'Staff' AND account_status = 'active'")
    ensure(max_concurrent(grooming_intervals) <= cur.fetchone()[0] - 1, "Database không còn slot spa trống.")

    cur.execute("""
        SELECT br.room_type_id, rt.capacity, br.planned_check_in_at, br.planned_check_out_at
        FROM pet_center.boarding_records br
        JOIN pet_center.room_types rt ON rt.room_type_id = br.room_type_id
        WHERE br.boarding_status IN ('pending_payment', 'pending', 'confirmed', 'staying')
    """)
    boarding_by_room: dict[str, tuple[int, list[tuple[datetime, datetime]]]] = {}
    for room_type_id, capacity, planned_in, planned_out in cur.fetchall():
        start = planned_in.astimezone(VIETNAM_TZ)
        end = planned_out.astimezone(VIETNAM_TZ)
        ensure(start.date() == focus_day and 13 <= start.hour < 17, "Database có boarding active ngoài khung 13:00-17:00 ngày 20/06.")
        boarding_by_room.setdefault(room_type_id, (capacity, []))[1].append((start, end))
    for room_type_id, (capacity, intervals) in boarding_by_room.items():
        ensure(max_concurrent(intervals) <= capacity - 1, f"Database không còn slot boarding trống cho {room_type_id}.")

    cur.execute("SELECT COUNT(DISTINCT stock_quantity), MIN(stock_quantity), MAX(stock_quantity) FROM pet_center.medicines")
    stock_variety, minimum_stock, maximum_stock = cur.fetchone()
    ensure(stock_variety >= 10 and minimum_stock == 0 and maximum_stock >= 100, "Dữ liệu tồn kho thuốc chưa phù hợp.")

    cur.execute("""
        SELECT COUNT(DISTINCT date_trunc('month', paid_at))
        FROM pet_center.payments
        WHERE payment_status = 'success'
          AND paid_at::date >= %s
          AND paid_at::date < %s
    """, (month_start(today, -5), month_start(today, 1)))
    ensure(cur.fetchone()[0] == 6, "Database chưa có đủ 6 tháng doanh thu.")
    cur.execute("""
        SELECT date_trunc('month', paid_at)::date, SUM(paid_amount)
        FROM pet_center.payments
        WHERE payment_status = 'success'
          AND paid_at::date >= %s
          AND paid_at::date < %s
        GROUP BY 1
        ORDER BY 1
    """, (month_start(today, -5), month_start(today, 1)))
    revenue_values = [row[1] for row in cur.fetchall()]
    expected_factors = [Decimal("0.70"), Decimal("0.78"), Decimal("0.75"), Decimal("0.88"), Decimal("0.92"), Decimal("1.00")]
    ensure(len(revenue_values) == 6 and len(set(revenue_values)) == 6, "Database có xu hướng doanh thu không hợp lệ.")
    ensure(revenue_values[-1] > revenue_values[-2], "Doanh thu database tháng gần nhất không cao hơn tháng trước.")
    ensure(all(abs(value / revenue_values[-1] - factor) <= Decimal("0.01") for value, factor in zip(revenue_values, expected_factors)), "Tỷ lệ doanh thu database không đúng mục tiêu.")
    cur.execute("""
        SELECT COUNT(*) FROM (
            SELECT date_trunc('month', p.paid_at), il.source_type
            FROM pet_center.payments p
            JOIN pet_center.invoice_lines il ON il.invoice_id = p.invoice_id
            WHERE p.payment_status = 'success'
              AND p.paid_at::date >= %s
              AND p.paid_at::date < %s
            GROUP BY 1, 2
        ) coverage
    """, (month_start(today, -5), month_start(today, 1)))
    ensure(cur.fetchone()[0] == 24, "Database chưa đủ 4 nhóm doanh thu trong cả 6 tháng.")
    return counts


def print_report(counts: dict[str, int]) -> None:
    print("\nDEMO COVERAGE REPORT")
    print("- Owner pages: PASS")
    print("- Staff pages: PASS")
    print("- Doctor pages: PASS")
    print("- Admin dashboard: PASS")
    print("- Revenue comparison 6 months: PASS")
    print("- Service reports: PASS")
    print("- Boarding reports: PASS")
    print("- History and activity pages: PASS")
    print("\nTABLE COUNTS")
    for table, count in counts.items():
        print(f"- {table}: {count}")


def seed() -> None:
    data, today = build_seed()
    conn = connect(load_database_url())
    try:
        cur = conn.cursor()
        cur.execute(f"SET search_path TO {SCHEMA}, public")
        for table in DEPENDENT_CLEANUP_ORDER:
            cur.execute(f"DELETE FROM {SCHEMA}.{table}")
        for table, _columns in reversed(INSERT_ORDER):
            cur.execute(f"DELETE FROM {SCHEMA}.{table}")
        for table, columns in INSERT_ORDER:
            many(cur, table, columns, data[table])
            print(f"seeded {table}: {len(data[table])}")
        sync_id_sequences(cur)
        counts = validate_database_coverage(cur, today)
        conn.commit()
        print_report(counts)
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    seed()
