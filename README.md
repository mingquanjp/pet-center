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
- Backend: Express.js 5, TypeScript, tsx, dotenv, cors
- Database: Neon Postgres, package `pg`
- Package manager: pnpm
- Version control: Git/GitHub

## Cấu Trúc Thư Mục

```txt
pet_center/
  frontend/              # Ứng dụng Next.js
  backend/               # Express.js API
  database/              # Tài liệu database/ERD
  spec/                  # Tài liệu đặc tả hiện có
  package.json           # Script chạy chung cho workspace
  pnpm-workspace.yaml    # Khai báo pnpm workspace
  pnpm-lock.yaml         # Lockfile dùng chung
  .nvmrc                 # Node.js version khuyến nghị
  .gitignore
  README.md
```

## Yêu Cầu Môi Trường

Cần cài đặt trước:

- Node.js 22 LTS, project đã có file `.nvmrc` để thống nhất version Node cho team
- pnpm, dùng để cài dependency và chạy scripts
- Git
- Tài khoản Neon để lấy Postgres connection string

Kiểm tra version:

```bash
node -v
pnpm -v
git --version
```

Nếu `node -v` đã là Node 22.x và `pnpm -v` chạy được, có thể bỏ qua bước cài môi trường và chuyển sang phần clone/cài dependencies.

Corepack không bắt buộc nếu máy đã có pnpm và lệnh `pnpm -v` chạy được. Nếu máy chưa có pnpm, bật pnpm qua Corepack. Bước này chỉ cần làm một lần trên máy:

```bash
corepack enable
corepack prepare pnpm@latest --activate
pnpm -v
```

Nếu máy chưa có Node.js 22, hãy cài Node.js 22 LTS trước. Có thể dùng `nvm`, Homebrew hoặc installer chính thức của Node.js, tùy môi trường của từng thành viên.

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

Nếu pnpm hỏi approve build scripts cho `sharp`, `unrs-resolver` hoặc `esbuild`, có thể approve vì đây là dependency hợp lệ của Next.js/tsx:

```bash
pnpm approve-builds sharp unrs-resolver esbuild
pnpm install
```

## Thiết Lập Biến Môi Trường

### Frontend

Tạo file:

```txt
frontend/.env.local
```

Nội dung:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Backend

Tạo file:

```txt
backend/.env
```

Nội dung:

```env
PORT=8080
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require
```

Lấy `DATABASE_URL` từ Neon Dashboard, mục Connect. Không commit file `.env` lên Git.

Có file mẫu:

```txt
backend/.env.example
```

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
```

## Kiểm Tra Hệ Thống

Kiểm tra backend:

```txt
http://localhost:8080/health
```

Kết quả mong muốn:

```json
{
  "status": "ok"
}
```

Kiểm tra backend kết nối Neon Postgres:

```txt
http://localhost:8080/db/health
```

Kết quả mong muốn:

```json
{
  "database": "connected",
  "now": "..."
}
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
```

## Lưu Ý Khi Phát Triển

- Sau khi sửa `.env` hoặc `.env.local`, cần restart dev server.
- Frontend chỉ dùng `NEXT_PUBLIC_API_URL` để gọi backend.
- Không đưa `DATABASE_URL` vào frontend.
- Không commit `node_modules`, `.env`, `.env.local`, `.next`, `dist`.
- Commit `pnpm-lock.yaml` để cả team dùng cùng dependency version.

## Troubleshooting

Nếu frontend báo lỗi:

```txt
Failed to parse URL from undefined/health
```

Kiểm tra `frontend/.env.local` đã có:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Sau đó restart frontend:

```bash
pnpm dev:frontend
```

Nếu backend trả 404 ở `/db/health`, kiểm tra file `backend/src/server.ts` đã có route `/db/health` và restart backend.

Nếu backend báo thiếu `DATABASE_URL`, kiểm tra `backend/.env` đã có connection string Neon đúng định dạng.
