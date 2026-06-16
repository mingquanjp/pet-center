# HƯỚNG DẪN KIẾN TRÚC BACKEND PET CENTER

> **Backend:** Express.js 5, TypeScript, tsx  
> **Database:** Neon Postgres, package `pg`  
> **Mục tiêu tài liệu:** Thống nhất cách tổ chức code backend, cách chia module, cách viết API, cách validate request, cách xử lý lỗi, cách phân quyền và cách viết Swagger để toàn bộ team code theo cùng một chuẩn.

---

## 1. Tư duy kiến trúc tổng thể

Backend Pet Center phục vụ nhiều role và nhiều nghiệp vụ: chủ nuôi, nhân viên, bác sĩ, admin, hồ sơ thú cưng, lịch hẹn, khám bệnh, spa, lưu trú, hóa đơn và thông báo.

Nếu gom tất cả route vào `server.ts`, code sẽ nhanh rối khi API tăng lên. Backend nên chia theo domain module:

```txt
Route       -> khai báo endpoint và gắn middleware
Controller  -> nhận request, trả response
Service     -> xử lý nghiệp vụ
Repository  -> truy vấn database
Schema      -> validate params/query/body
Types       -> type riêng của module
```

Công thức dễ nhớ:

```txt
Route không xử lý nghiệp vụ.
Controller không viết SQL.
Service không biết Express response.
Repository không trả HTTP response.
```

---

## 2. Stack backend

Stack hiện tại trong project:

```txt
Express.js 5
TypeScript
tsx
dotenv
cors
pg
```

Stack này đủ để chạy API Express có kết nối Postgres.

Để backend sẵn sàng phát triển nghiệp vụ thật, nên bổ sung:

```txt
swagger-ui-express      -> Swagger UI để test API
swagger-jsdoc           -> tạo OpenAPI spec từ JSDoc
@types/swagger-ui-express
zod                     -> validate request
helmet                  -> security headers
pino
pino-http               -> request logging
```

Khi làm auth, bổ sung:

```txt
bcryptjs hoặc bcrypt    -> hash password
jsonwebtoken hoặc jose  -> JWT
express-rate-limit      -> giới hạn login/API nhạy cảm
```

Khi làm test, bổ sung:

```txt
vitest
supertest
```

---

## 3. Cấu trúc folder đề xuất

```txt
backend/
  docs/
    PetCenter_BE_Express_Architecture_Guide.md
    PetCenter_BE_API_Design.md

  src/
    server.ts
    app.ts

    config/
      env.ts
      cors.ts
      swagger.ts

    db/
      pool.ts
      query.ts
      transactions.ts

    middlewares/
      async-handler.ts
      error-handler.ts
      not-found-handler.ts
      auth.middleware.ts
      role.middleware.ts
      validate.middleware.ts

    shared/
      errors/
        app-error.ts
        http-status.ts
      responses/
        api-response.ts
      types/
        auth.ts
        express.ts
      utils/
        id.ts
        pagination.ts

    routes/
      index.ts

    modules/
      health/
        health.routes.ts
        health.controller.ts

      auth/
        auth.routes.ts
        auth.controller.ts
        auth.service.ts
        auth.repository.ts
        auth.schema.ts
        auth.types.ts

      users/
      pets/
      services/
      appointments/
      medical/
      grooming/
      boarding/
      invoices/
      notifications/
```

---

## 4. Nhiệm vụ từng folder cấp cao

## 4.1. `src/server.ts`

Chỉ làm nhiệm vụ khởi động HTTP server.

Nên có:

```txt
- import app
- đọc PORT từ env config
- app.listen
- log URL server
- xử lý graceful shutdown nếu cần
```

Không nên có:

```txt
- route
- middleware
- query database
- business logic
```

## 4.2. `src/app.ts`

Tạo Express app và gắn các thành phần chính:

```txt
- cors
- helmet
- express.json
- logger
- Swagger UI
- route index
- not found handler
- error handler
```

`app.ts` là nơi lắp ghép hạ tầng Express, không viết nghiệp vụ tại đây.

## 4.3. `src/config/`

Chứa cấu hình ứng dụng.

```txt
env.ts       -> đọc và validate biến môi trường
cors.ts      -> cấu hình CORS
swagger.ts   -> cấu hình OpenAPI/Swagger
```

Tất cả code cần đọc env nên import từ `config/env.ts`, không đọc trực tiếp `process.env` ở nhiều nơi.

## 4.4. `src/db/`

Chứa kết nối database và helper liên quan.

```txt
pool.ts          -> tạo `pg.Pool`
query.ts         -> helper query nếu cần logging/typing chung
transactions.ts  -> helper transaction
```

Quy tắc:

```txt
Chỉ repository được gọi database query.
Controller và route không được gọi pool.query.
```

## 4.5. `src/middlewares/`

Chứa middleware dùng chung.

```txt
async-handler.ts       -> bọc async controller
error-handler.ts       -> trả error response thống nhất
not-found-handler.ts   -> xử lý route không tồn tại
auth.middleware.ts     -> xác thực token
role.middleware.ts     -> kiểm tra role
validate.middleware.ts -> validate params/query/body bằng Zod
```

## 4.6. `src/shared/`

Chứa code dùng lại ở nhiều module.

Được đặt ở đây:

```txt
- AppError
- http status constants
- response helpers
- pagination helpers
- shared auth types
- ID helper
```

Không đặt code nghiệp vụ đặc thù của module vào `shared/`.

## 4.7. `src/routes/`

`routes/index.ts` mount toàn bộ module route vào `/api/v1`.

Ví dụ:

```txt
/api/v1/health
/api/v1/auth
/api/v1/pets
/api/v1/appointments
```

## 4.8. `src/modules/`

Chia theo domain nghiệp vụ. Mỗi module tự quản lý route, controller, service, repository, schema và type của nó.

Không chia module theo kỹ thuật kiểu `controllers/`, `services/`, `repositories/` ở cấp root, vì khi dự án lớn sẽ khó theo dõi domain.

---

## 5. Cấu trúc chi tiết một module

Ví dụ module `pets`:

```txt
modules/
  pets/
    pets.routes.ts
    pets.controller.ts
    pets.service.ts
    pets.repository.ts
    pets.schema.ts
    pets.types.ts
```

## 5.1. `*.routes.ts`

Nhiệm vụ:

```txt
- tạo Express Router
- khai báo endpoint
- gắn auth/role middleware
- gắn validate middleware
- gắn controller
- khai báo Swagger JSDoc gần endpoint
```

Ví dụ:

```ts
router.get("/", authMiddleware, requireRole("OWNER", "STAFF", "DOCTOR", "ADMIN"), petsController.listPets);
```

## 5.2. `*.controller.ts`

Nhiệm vụ:

```txt
- đọc req.params, req.query, req.body, req.user
- gọi service
- trả response format thống nhất
```

Không nên:

```txt
- viết SQL
- validate thủ công khi đã có schema
- xử lý business logic dài
```

## 5.3. `*.service.ts`

Nhiệm vụ:

```txt
- xử lý nghiệp vụ
- kiểm tra ownership/quyền nghiệp vụ nếu cần
- gọi repository
- throw AppError khi lỗi domain
```

## 5.4. `*.repository.ts`

Nhiệm vụ:

```txt
- truy vấn Postgres
- map row database thành object service cần
- chứa SQL của module
```

Quy tắc:

```txt
Repository không biết Express request/response.
Repository không throw HTTP response trực tiếp.
```

## 5.5. `*.schema.ts`

Dùng Zod để validate:

```txt
- params
- query
- body
```

Mỗi endpoint có body/query/params phức tạp nên có schema riêng.

## 5.6. `*.types.ts`

Chứa type riêng của module:

```txt
- DTO
- service input
- repository row
- enum/module constants nếu nhỏ
```

---

## 6. Role trong hệ thống

Role logic trong backend nên thống nhất:

```txt
OWNER
STAFF
DOCTOR
ADMIN
```

Database hiện có dùng:

```txt
Owner
Staff
Doctor
Admin
```

Backend nên normalize role sau khi đọc từ database.

Mapping:

```txt
Owner  -> OWNER
Staff  -> STAFF
Doctor -> DOCTOR
Admin  -> ADMIN
```

Quy tắc phân quyền:

```txt
OWNER  -> dữ liệu cá nhân, thú cưng của mình, booking, hóa đơn của mình
STAFF  -> vận hành lịch hẹn, spa, lưu trú, hóa đơn tại quầy
DOCTOR -> lịch khám, hồ sơ y tế, chẩn đoán, đơn thuốc
ADMIN  -> user, service, room type, cấu hình hệ thống
```

---

## 7. Auth middleware

Auth middleware có nhiệm vụ:

```txt
- đọc Authorization header
- verify token
- gắn req.user
```

Không nên:

```txt
- query nghiệp vụ phức tạp
- xử lý role detail
- trả response khác format chung
```

Role middleware có dạng:

```ts
requireRole("ADMIN")
requireRole("STAFF", "ADMIN")
requireRole("OWNER", "STAFF", "DOCTOR", "ADMIN")
```

---

## 8. Validation

Dùng Zod cho request validation.

Middleware validate nên hỗ trợ:

```txt
params
query
body
```

Nếu validation fail, trả:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": []
  }
}
```

Không validate bằng nhiều đoạn `if (!req.body.xxx)` lặp lại trong controller.

---

## 9. Error handling

Dùng `AppError` cho lỗi có chủ đích:

```txt
BAD_REQUEST
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
CONFLICT
VALIDATION_ERROR
INTERNAL_SERVER_ERROR
```

Tất cả lỗi đi qua `error-handler.ts`.

Controller/service không tự format error response.

---

## 10. Response format

Response thành công:

```json
{
  "success": true,
  "data": {},
  "message": "OK"
}
```

Response danh sách có pagination:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

Response lỗi:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

---

## 11. Swagger

Swagger bắt buộc có để test API.

Thư viện đề xuất:

```txt
swagger-ui-express
swagger-jsdoc
```

Mount endpoint:

```txt
GET /api-docs
```

OpenAPI config nằm tại:

```txt
src/config/swagger.ts
```

Quy tắc:

```txt
- Khai báo Swagger JSDoc gần route của module
- Mỗi endpoint public hoặc dùng cho frontend nên có summary, tags, security, params/query/body, response
- Tag đặt theo module: Auth, Pets, Appointments, Medical, Grooming, Boarding, Invoices, Notifications
- Swagger phải test được Bearer token cho API cần đăng nhập
```

---

## 12. Database convention

Database hiện có schema `pet_center`.

Repository nên ghi rõ schema trong SQL hoặc cấu hình search path rõ ràng.

Ví dụ:

```sql
select user_id, full_name, email
from pet_center.users
where user_id = $1
```

Quy tắc SQL:

```txt
- Luôn dùng parameterized query
- Không nối chuỗi input người dùng vào SQL
- Transaction cho flow ghi nhiều bảng
- Repository map snake_case database sang camelCase nếu service/controller cần
```

---

## 13. Module nghiệp vụ đề xuất

## 13.1. `health`

Endpoint:

```txt
GET /api/v1/health
GET /api/v1/db/health
```

Dùng để kiểm tra server và database.

## 13.2. `auth`

Endpoint đề xuất:

```txt
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

## 13.3. `users`

Quản lý user, profile, admin user management.

## 13.4. `pets`

Quản lý thú cưng và health profile cơ bản.

## 13.5. `services`

Quản lý dịch vụ, bảng giá, loại dịch vụ.

## 13.6. `appointments`

Quản lý lịch hẹn khám y tế.

## 13.7. `medical`

Hồ sơ khám, field kết quả khám, vaccine, đơn thuốc, tái khám.

## 13.8. `grooming`

Dịch vụ spa/grooming ticket.

## 13.9. `boarding`

Lưu trú, phòng, check-in, update chăm sóc, check-out.

## 13.10. `invoices`

Hóa đơn, dòng hóa đơn, thanh toán.

## 13.11. `notifications`

Thông báo trên header cho từng user/role.

---

## 14. Quy tắc đặt tên file

```txt
auth.routes.ts
auth.controller.ts
auth.service.ts
auth.repository.ts
auth.schema.ts
auth.types.ts
```

Dùng kebab-case cho file middleware/shared:

```txt
error-handler.ts
not-found-handler.ts
async-handler.ts
api-response.ts
```

---

## 15. Quy trình thêm một API mới

1. Xác định module chứa API.
2. Thêm schema validate trong `*.schema.ts`.
3. Thêm repository method nếu cần database.
4. Thêm service method chứa nghiệp vụ.
5. Thêm controller method trả response.
6. Thêm route và middleware.
7. Thêm Swagger JSDoc.
8. Chạy lint/build.
9. Test bằng Swagger UI.

---

## 16. Checklist code review backend

```txt
[ ] Route có prefix /api/v1 đúng chuẩn
[ ] Endpoint có Swagger
[ ] API cần đăng nhập có auth middleware
[ ] API cần role có requireRole
[ ] Body/query/params được validate bằng schema
[ ] Controller không viết SQL
[ ] Repository không trả HTTP response
[ ] Lỗi đi qua AppError/error handler
[ ] Response đúng format thống nhất
[ ] SQL dùng parameterized query
[ ] Flow ghi nhiều bảng có transaction nếu cần
[ ] pnpm --filter backend run lint pass
[ ] pnpm --filter backend run build pass
```

---

## 17. Những điều không nên làm

```txt
- Không nhét tất cả route vào server.ts
- Không query database trong controller
- Không validate request bằng if/else lặp lại trong mỗi controller
- Không trả response mỗi endpoint một kiểu
- Không bỏ qua Swagger cho endpoint frontend cần dùng
- Không hardcode env ở nhiều file
- Không để SQL nối chuỗi input người dùng
- Không trộn nghiệp vụ của doctor/staff/admin vào cùng một service nếu flow khác nhau rõ ràng
```

---

## 18. Kết luận kiến trúc

Backend nên được phát triển theo module domain, mỗi module có route/controller/service/repository/schema/types riêng. Swagger là công cụ test API mặc định của backend. Mỗi API mới cần có validation, response format thống nhất, error handling thống nhất và role guard rõ ràng nếu liên quan đến quyền truy cập.
