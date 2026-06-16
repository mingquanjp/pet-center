# Pet Center

Pet Center là dự án quản lý trung tâm chăm sóc thú cưng. Repository này gồm frontend Next.js, backend Express.js và kết nối Neon Postgres.

[GitHub Repository](https://github.com/mingquanjp/pet-center)

## Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=000)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=fff)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=fff)
![Express](https://img.shields.io/badge/Express.js-5-000?logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=fff)
![pnpm](https://img.shields.io/badge/pnpm-11-F69220?logo=pnpm&logoColor=fff)
![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?logo=github)

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS 4, ESLint
- Backend: Express.js 5, TypeScript, tsx, dotenv, cors, helmet, pino, zod
- API docs/testing: Swagger UI, swagger-jsdoc
- Database: Neon Postgres, package `pg`
- Package manager: pnpm
- Version control: Git/GitHub

## Cấu Trúc Thư Mục

```txt
pet-center/
  frontend/              # Ứng dụng Next.js
  backend/               # Express.js API
    docs/                # Tài liệu kiến trúc backend và API design
    scripts/             # Script vận hành backend, ví dụ init database
    src/
      app.ts             # Tạo Express app, middleware, Swagger, routes
      server.ts          # Khởi động HTTP server
      config/            # env, cors, logger, swagger config
      db/                # pg pool, query helper, transaction helper
      middlewares/       # error handler, validation, auth/role middleware
      modules/           # Module nghiệp vụ theo domain
      routes/            # Mount API version /api/v1
      shared/            # Error, response, type, utility dùng chung
  database/              # SQL schema/ERD
  package.json           # Script chạy chung cho workspace
  pnpm-workspace.yaml    # Khai báo pnpm workspace
  pnpm-lock.yaml         # Lockfile dùng chung
  .nvmrc                 # Node.js version khuyến nghị
  .gitignore
  README.md
```

Tài liệu backend:

```txt
backend/docs/PetCenter_BE_Express_Architecture_Guide.md
backend/docs/PetCenter_BE_API_Design.md
```

## Yêu Cầu Môi Trường

Cần cài đặt trước:

- Node.js 22 LTS, project có file `.nvmrc` để thống nhất version Node cho team
- pnpm, dùng để cài dependency và chạy scripts
- Git
- Tài khoản Neon để lấy Postgres connection string

Kiểm tra version:

```bash
node -v
pnpm -v
git --version
```

Nếu `node -v` đã là Node 22.x và `pnpm -v` chạy được, có thể bỏ qua bước cài môi trường.

Nếu máy chưa có pnpm, bật pnpm qua Corepack:

```bash
corepack enable
corepack prepare pnpm@latest --activate
pnpm -v
```

## Clone Dự Án

```bash
git clone git@github.com:mingquanjp/pet-center.git
cd pet-center
```

Nếu clone bằng HTTPS:

```bash
git clone https://github.com/mingquanjp/pet-center.git
cd pet-center
```

## Cài Đặt Dependencies

Dùng pnpm tại thư mục root:

```bash
pnpm install
```

Repository này dùng pnpm workspace, nên không cần chạy `pnpm install` riêng trong `frontend` và `backend`.

Nếu pnpm hỏi approve build scripts cho dependency hợp lệ của project, chạy:

```bash
pnpm approve-builds
pnpm install
```

## Thiết Lập Biến Môi Trường

### Frontend

Frontend không cần tạo file `.env.local` để chạy local. Mặc định frontend gọi backend tại:

```txt
http://localhost:8080/api/v1
```

Chỉ cần cấu hình `NEXT_PUBLIC_API_URL` khi muốn trỏ frontend sang API khác với mặc định.

### Backend

Tạo file:

```txt
backend/.env
```

Nội dung:

```env
PORT=8080
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=verify-full
```

Lấy `DATABASE_URL` từ Neon Dashboard, mục Connect. Không commit file `.env` lên Git.

Có file mẫu:

```txt
backend/.env.example
```

## Khởi Tạo Database Neon

Script SQL chính nằm tại:

```txt
database/init_db.sql
```

Chạy init database:

```bash
pnpm --filter backend run db:init
```

Lưu ý: script này có dòng:

```sql
DROP SCHEMA IF EXISTS pet_center CASCADE;
```

Nghĩa là khi chạy lại, toàn bộ schema `pet_center` hiện có sẽ bị xóa và tạo mới theo `database/init_db.sql`.

## Cách Chạy Dự Án

Chạy frontend và backend cùng lúc từ root:

```bash
pnpm dev
```

Hoặc chạy riêng từng phần.

Frontend:

```bash
pnpm dev:frontend
```

Backend:

```bash
pnpm dev:backend
```

Địa chỉ local:

```txt
Frontend: http://localhost:3000
Backend:  http://localhost:8080
Swagger:  http://localhost:8080/api-docs
```

## Kiểm Tra Hệ Thống

Kiểm tra backend theo API prefix mới:

```txt
http://localhost:8080/api/v1/health
```

Kết quả mong muốn:

```json
{
  "success": true,
  "data": {
    "status": "ok"
  },
  "message": "OK"
}
```

Kiểm tra backend kết nối Neon Postgres:

```txt
http://localhost:8080/api/v1/db/health
```

Kết quả mong muốn:

```json
{
  "success": true,
  "data": {
    "database": "connected",
    "now": "..."
  },
  "message": "OK"
}
```

Swagger UI:

```txt
http://localhost:8080/api-docs
```

Các endpoint cũ vẫn được giữ tạm để tương thích README/FE cũ:

```txt
http://localhost:8080/health
http://localhost:8080/db/health
```

Kiểm tra frontend:

```txt
http://localhost:3000
```

Nếu frontend gọi backend thành công, màn hình sẽ hiển thị trạng thái backend.

## Scripts

Root:

```bash
pnpm dev            # Chạy frontend và backend
pnpm dev:frontend   # Chạy Next.js
pnpm dev:backend    # Chạy Express API
pnpm build          # Build frontend và backend
pnpm lint           # Kiểm tra lint/typecheck frontend và backend
```

Frontend:

```bash
cd frontend
pnpm dev
pnpm build
pnpm start
pnpm lint
```

Backend:

```bash
cd backend
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm db:init
```

## Backend Architecture

Backend hiện được tổ chức theo domain module. Module chuẩn nên có:

```txt
module.routes.ts       # Khai báo endpoint và Swagger JSDoc
module.controller.ts   # Nhận request, gọi service, trả response
module.service.ts      # Xử lý nghiệp vụ
module.repository.ts   # Truy vấn database
module.schema.ts       # Validate request bằng Zod
module.types.ts        # Type riêng của module
```

Các API mới nên đi theo prefix:

```txt
/api/v1
```

Response thành công dùng format:

```json
{
  "success": true,
  "data": {},
  "message": "OK"
}
```

Response lỗi dùng format:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

Chi tiết xem:

```txt
backend/docs/PetCenter_BE_Express_Architecture_Guide.md
backend/docs/PetCenter_BE_API_Design.md
```

## Lưu Ý Khi Phát Triển

- Sau khi sửa `.env`, cần restart dev server backend.
- Frontend mặc định gọi `http://localhost:8080/api/v1`; chỉ dùng `NEXT_PUBLIC_API_URL` khi cần đổi API base URL.
- Không đưa `DATABASE_URL` vào frontend.
- Không commit `node_modules`, `.env`, `.next`, `dist`.
- Commit `pnpm-lock.yaml` để cả team dùng cùng dependency version.
- API mới dùng prefix `/api/v1`.
- API dùng cho frontend nên có Swagger JSDoc để test ở `/api-docs`.
- SQL chỉ nên nằm trong repository layer.
- Controller không viết SQL trực tiếp.

## Troubleshooting

Nếu frontend không gọi được API, kiểm tra backend đang chạy tại:

```txt
http://localhost:8080/api/v1/health
```

Sau đó restart frontend nếu cần:

```bash
pnpm dev:frontend
```

Nếu backend báo thiếu `DATABASE_URL`, kiểm tra `backend/.env` đã có connection string Neon đúng định dạng.

Nếu `/api/v1/db/health` trả `DATABASE_UNAVAILABLE`, kiểm tra:

- `backend/.env` có đúng `DATABASE_URL`
- Neon database đang active
- Connection string dùng `sslmode=verify-full`
- Mạng local có thể kết nối tới Neon

Nếu Swagger không mở được, kiểm tra backend đang chạy tại:

```txt
http://localhost:8080
```
