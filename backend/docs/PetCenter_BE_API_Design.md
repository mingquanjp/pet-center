# HƯỚNG DẪN THIẾT KẾ API BACKEND PET CENTER

> **Mục tiêu tài liệu:** Thống nhất REST API convention, response format, error format, pagination, filter, auth, RBAC và Swagger cho backend Pet Center.

---

## 1. Nguyên tắc tổng thể

API backend dùng REST convention và version prefix:

```txt
/api/v1
```

Swagger UI dùng để test API:

```txt
/api-docs
```

Nguyên tắc:

```txt
- URL dùng danh từ số nhiều
- HTTP method thể hiện hành động
- Response format thống nhất
- Error format thống nhất
- Validate request trước khi vào controller
- API cần đăng nhập phải có Bearer token
- API cần role phải khai báo role rõ ràng trong route và Swagger
```

---

## 2. URL naming

Dùng kebab-case nếu endpoint có nhiều từ:

```txt
/api/v1/medical-appointments
/api/v1/boarding-records
/api/v1/grooming-tickets
```

Tài nguyên chính dùng danh từ số nhiều:

```txt
/users
/pets
/services
/invoices
/notifications
```

Tài nguyên con:

```txt
/pets/:petId/health-profile
/pets/:petId/vaccinations
/invoices/:invoiceId/payments
```

Action đặc biệt chỉ dùng khi REST CRUD không diễn tả tốt:

```txt
/boarding-records/:boardingRecordId/check-in
/boarding-records/:boardingRecordId/check-out
/notifications/:notificationId/read
```

---

## 3. HTTP methods

```txt
GET     -> lấy dữ liệu
POST    -> tạo mới hoặc thực hiện action
PATCH   -> cập nhật một phần
PUT     -> thay thế toàn bộ resource, hạn chế dùng
DELETE  -> xóa hoặc hủy resource nếu nghiệp vụ cho phép
```

Ví dụ:

```txt
GET    /api/v1/pets
POST   /api/v1/pets
GET    /api/v1/pets/:petId
PATCH  /api/v1/pets/:petId
DELETE /api/v1/pets/:petId
```

---

## 4. Status code

```txt
200 OK                   -> lấy/cập nhật thành công
201 Created              -> tạo mới thành công
204 No Content           -> xóa thành công, không cần body
400 Bad Request          -> request sai logic hoặc input sai
401 Unauthorized         -> chưa đăng nhập/token sai
403 Forbidden            -> đăng nhập rồi nhưng không có quyền
404 Not Found            -> không tìm thấy resource
409 Conflict             -> trùng dữ liệu hoặc xung đột trạng thái
422 Unprocessable Entity -> validation fail nếu muốn tách với 400
500 Internal Server Error -> lỗi không mong đợi
```

Khuyến nghị dùng `400` cho validation để đơn giản, hoặc `422` nếu team muốn tách validation lỗi schema với lỗi request logic.

---

## 5. Response format

## 5.1. Success object

```json
{
  "success": true,
  "data": {
    "petId": "pet_001",
    "petName": "Milo"
  },
  "message": "OK"
}
```

## 5.2. Success list

```json
{
  "success": true,
  "data": [
    {
      "petId": "pet_001",
      "petName": "Milo"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

## 5.3. Empty success

```json
{
  "success": true,
  "data": null,
  "message": "Updated successfully"
}
```

## 5.4. Error

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Pet not found"
  }
}
```

## 5.5. Validation error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": [
      {
        "path": "body.email",
        "message": "Invalid email"
      }
    ]
  }
}
```

---

## 6. Pagination

Danh sách mặc định dùng query:

```txt
page=1
limit=20
```

Ví dụ:

```txt
GET /api/v1/pets?page=1&limit=20
```

Quy tắc:

```txt
- page bắt đầu từ 1
- limit mặc định 20
- limit tối đa 100
- totalPages = ceil(total / limit)
```

Response:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

---

## 7. Filter và search

Filter dùng query param rõ nghĩa:

```txt
GET /api/v1/pets?species=Dog&status=active
GET /api/v1/invoices?paymentStatus=paid
GET /api/v1/medical-appointments?status=confirmed
```

Search text dùng `q`:

```txt
GET /api/v1/pets?q=milo
GET /api/v1/users?q=nguyen
```

Date range:

```txt
GET /api/v1/medical-appointments?from=2026-05-01&to=2026-05-31
```

Sort:

```txt
GET /api/v1/pets?sort=createdAt:desc
GET /api/v1/invoices?sort=totalAmount:asc
```

Whitelist field được sort tại service/repository. Không đưa sort input trực tiếp vào SQL.

---

## 8. Auth

API cần đăng nhập dùng Bearer token:

```txt
Authorization: Bearer <accessToken>
```

Response login đề xuất:

```json
{
  "success": true,
  "data": {
    "accessToken": "...",
    "user": {
      "userId": "usr_001",
      "fullName": "Nguyen Van A",
      "email": "a@example.com",
      "role": "OWNER"
    }
  }
}
```

Role trong API response dùng uppercase:

```txt
OWNER
STAFF
DOCTOR
ADMIN
```

---

## 9. RBAC

Quy tắc role:

```txt
OWNER  -> thao tác với dữ liệu của chính mình
STAFF  -> nghiệp vụ vận hành
DOCTOR -> nghiệp vụ y tế
ADMIN  -> quản trị hệ thống
```

Swagger của endpoint cần có ghi chú role.

Ví dụ:

```txt
Security: BearerAuth
Roles: STAFF, ADMIN
```

---

## 10. Swagger/OpenAPI convention

Dùng:

```txt
swagger-jsdoc
swagger-ui-express
```

Endpoint:

```txt
GET /api-docs
```

OpenAPI metadata:

```txt
title: Pet Center API
version: 1.0.0
basePath/server: http://localhost:8080
```

Tags đề xuất:

```txt
Health
Auth
Users
Pets
Services
Appointments
Medical
Grooming
Boarding
Invoices
Notifications
```

Security scheme:

```yaml
bearerAuth:
  type: http
  scheme: bearer
  bearerFormat: JWT
```

Mỗi endpoint nên có:

```txt
- tags
- summary
- description nếu cần
- security nếu cần token
- parameters
- requestBody
- responses
```

---

## 11. Swagger JSDoc ví dụ

```ts
/**
 * @openapi
 * /api/v1/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Check API health
 *     responses:
 *       200:
 *         description: API is healthy
 */
router.get("/health", healthController.checkHealth);
```

Endpoint cần token:

```ts
/**
 * @openapi
 * /api/v1/pets:
 *   get:
 *     tags:
 *       - Pets
 *     summary: List pets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Pet list
 *       401:
 *         description: Unauthorized
 */
router.get("/", authMiddleware, petsController.listPets);
```

---

## 12. Endpoint map đề xuất

## 12.1. Health

```txt
GET /api/v1/health
GET /api/v1/db/health
```

## 12.2. Auth

```txt
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

## 12.3. Users

```txt
GET   /api/v1/users
GET   /api/v1/users/:userId
PATCH /api/v1/users/:userId
PATCH /api/v1/users/:userId/status
```

Admin dùng để quản lý users. User profile nên dùng `/auth/me` hoặc `/users/me` tùy team chốt.

## 12.4. Pets

```txt
GET    /api/v1/pets
POST   /api/v1/pets
GET    /api/v1/pets/:petId
PATCH  /api/v1/pets/:petId
DELETE /api/v1/pets/:petId
GET    /api/v1/pets/:petId/health-profile
PATCH  /api/v1/pets/:petId/health-profile
GET    /api/v1/pets/:petId/vaccinations
```

## 12.5. Services

```txt
GET    /api/v1/services
POST   /api/v1/services
GET    /api/v1/services/:serviceId
PATCH  /api/v1/services/:serviceId
PATCH  /api/v1/services/:serviceId/status
GET    /api/v1/services/:serviceId/price-rules
POST   /api/v1/services/:serviceId/price-rules
```

## 12.6. Medical appointments

```txt
GET   /api/v1/medical-appointments
POST  /api/v1/medical-appointments
GET   /api/v1/medical-appointments/:appointmentId
PATCH /api/v1/medical-appointments/:appointmentId/confirm
PATCH /api/v1/medical-appointments/:appointmentId/reject
PATCH /api/v1/medical-appointments/:appointmentId/cancel
```

## 12.7. Medical

```txt
GET  /api/v1/medical-exams
POST /api/v1/medical-exams
GET  /api/v1/medical-exams/:examId
POST /api/v1/medical-exams/:examId/field-values
POST /api/v1/medical-exams/:examId/prescriptions
POST /api/v1/medical-exams/:examId/follow-up
```

## 12.8. Grooming

```txt
GET   /api/v1/grooming-tickets
POST  /api/v1/grooming-tickets
GET   /api/v1/grooming-tickets/:ticketId
PATCH /api/v1/grooming-tickets/:ticketId/status
POST  /api/v1/grooming-tickets/:ticketId/items
```

## 12.9. Boarding

```txt
GET   /api/v1/boarding-records
POST  /api/v1/boarding-records
GET   /api/v1/boarding-records/:boardingRecordId
PATCH /api/v1/boarding-records/:boardingRecordId/check-in
PATCH /api/v1/boarding-records/:boardingRecordId/check-out
POST  /api/v1/boarding-records/:boardingRecordId/updates
```

## 12.10. Invoices

```txt
GET   /api/v1/invoices
POST  /api/v1/invoices
GET   /api/v1/invoices/:invoiceId
POST  /api/v1/invoices/:invoiceId/payments
PATCH /api/v1/invoices/:invoiceId/status
```

## 12.11. Notifications

```txt
GET   /api/v1/notifications
PATCH /api/v1/notifications/:notificationId/read
PATCH /api/v1/notifications/read-all
```

---

## 13. API theo role

## 13.1. OWNER

```txt
GET    /api/v1/pets
POST   /api/v1/pets
GET    /api/v1/pets/:petId
PATCH  /api/v1/pets/:petId
POST   /api/v1/medical-appointments
GET    /api/v1/medical-appointments
POST   /api/v1/grooming-tickets
POST   /api/v1/boarding-records
GET    /api/v1/invoices
GET    /api/v1/notifications
```

OWNER chỉ xem/sửa dữ liệu thuộc về mình.

## 13.2. STAFF

```txt
GET   /api/v1/medical-appointments
PATCH /api/v1/medical-appointments/:appointmentId/confirm
PATCH /api/v1/medical-appointments/:appointmentId/reject
GET   /api/v1/grooming-tickets
PATCH /api/v1/grooming-tickets/:ticketId/status
GET   /api/v1/boarding-records
PATCH /api/v1/boarding-records/:boardingRecordId/check-in
PATCH /api/v1/boarding-records/:boardingRecordId/check-out
GET   /api/v1/invoices
POST  /api/v1/invoices/:invoiceId/payments
```

STAFF không sửa chẩn đoán, đơn thuốc, kết quả khám chuyên môn.

## 13.3. DOCTOR

```txt
GET  /api/v1/medical-appointments
POST /api/v1/medical-exams
GET  /api/v1/medical-exams/:examId
POST /api/v1/medical-exams/:examId/prescriptions
POST /api/v1/medical-exams/:examId/follow-up
GET  /api/v1/pets/:petId/health-profile
```

DOCTOR xử lý nghiệp vụ y tế.

## 13.4. ADMIN

```txt
GET   /api/v1/users
PATCH /api/v1/users/:userId/status
POST  /api/v1/services
PATCH /api/v1/services/:serviceId
PATCH /api/v1/services/:serviceId/status
POST  /api/v1/services/:serviceId/price-rules
```

ADMIN quản lý hệ thống, không nên thay thế flow vận hành hằng ngày của STAFF.

---

## 14. Data naming

Database có thể dùng snake_case:

```txt
user_id
full_name
created_at
```

API response nên dùng camelCase:

```json
{
  "userId": "usr_001",
  "fullName": "Nguyen Van A",
  "createdAt": "2026-05-24T10:00:00.000Z"
}
```

Repository hoặc mapper có nhiệm vụ convert snake_case sang camelCase.

--- 

## 15. Date và time

Datetime trong API dùng ISO 8601:

```txt
2026-05-24T15:00:00.000Z
```

Date-only dùng:

```txt
2026-05-24
```

Backend nên lưu timezone-aware value bằng `TIMESTAMPTZ` khi là thời điểm.

---

## 16. File upload

Chưa nên tự ý thêm upload nếu chưa chốt storage.

Khi cần upload ảnh/video:

```txt
- dùng multipart/form-data
- validate size/type
- lưu file vào object storage
- database chỉ lưu URL/metadata
```

Không lưu binary file trực tiếp vào Postgres nếu không có lý do rõ ràng.

---

## 17. Checklist API mới

```txt
[ ] URL dùng /api/v1
[ ] Method dùng REST convention
[ ] Có request schema bằng Zod nếu có input
[ ] Có response format thống nhất
[ ] Có error format thống nhất
[ ] Có auth middleware nếu cần đăng nhập
[ ] Có role middleware nếu cần phân quyền
[ ] Có Swagger JSDoc
[ ] Có status code đúng
[ ] Có pagination/filter/sort nếu là list endpoint
[ ] Test được trên /api-docs
```

---

## 18. Kết luận API design

API backend Pet Center nên ưu tiên tính nhất quán: route có version, response có format chung, lỗi có format chung, role rõ ràng và Swagger test được. Khi thêm endpoint mới, Swagger không phải phần phụ; Swagger là một phần của definition API.
