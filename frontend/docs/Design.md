---
name: Pet Center Management System
colors:
  surface: '#fbfaee'
  surface-dim: '#dbdbcf'
  surface-bright: '#fbfaee'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f4e8'
  surface-container: '#efeee2'
  surface-container-high: '#e9e9dd'
  surface-container-highest: '#e4e3d7'
  on-surface: '#1b1c15'
  on-surface-variant: '#3e4946'
  inverse-surface: '#303129'
  inverse-on-surface: '#f2f1e5'
  outline: '#6e7a76'
  outline-variant: '#bdc9c5'
  surface-tint: '#006b5e'
  primary: '#005e53'
  on-primary: '#ffffff'
  primary-container: '#00796b'
  on-primary-container: '#a1feec'
  inverse-primary: '#7ad7c6'
  secondary: '#855300'
  on-secondary: '#ffffff'
  secondary-container: '#fea619'
  on-secondary-container: '#684000'
  tertiary: '#385a40'
  on-tertiary: '#ffffff'
  tertiary-container: '#507357'
  on-tertiary-container: '#cff7d3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#97f3e2'
  primary-fixed-dim: '#7ad7c6'
  on-primary-fixed: '#00201b'
  on-primary-fixed-variant: '#005047'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#c5ecc9'
  tertiary-fixed-dim: '#aad0ae'
  on-tertiary-fixed: '#00210c'
  on-tertiary-fixed-variant: '#2c4e34'
  background: '#fbfaee'
  on-background: '#1b1c15'
  surface-variant: '#e4e3d7'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-margin: 24px
  gutter: 16px
  section-gap: 32px
  large-gap: 48px
---

# Pet Center Management System — Design System

> File này là nguồn chuẩn giao diện cho toàn bộ frontend.  
> Khi code UI hoặc dùng Stitch để sinh màn, luôn đọc file này cùng với `docs/frontend-architecture.md`.

---

## 1. Brand & Style

Hệ thống **Pet Center Management System** được thiết kế dựa trên sự kết hợp giữa tính chuyên nghiệp của một công cụ quản lý vận hành SaaS và sự ấm áp, tin cậy của dịch vụ chăm sóc thú cưng.

Phong cách chủ đạo là **Corporate Modern** kết hợp với **Soft Minimalism**. Giao diện ưu tiên sự rõ ràng, nhẹ mắt, dễ đọc và dễ thao tác.

Các khối nội dung sử dụng:
- Bo góc mềm.
- Khoảng trắng rộng rãi.
- Bóng đổ rất nhẹ.
- Bảng màu pastel tinh chỉnh để tạo cảm giác thân thiện nhưng vẫn chuyên nghiệp.

Mục tiêu thị giác của hệ thống:
- Tạo cảm giác tin cậy như một hệ thống y tế / phòng khám thú y.
- Giữ sự ấm áp, gần gũi với chủ nuôi thú cưng.
- Giảm cảm giác căng thẳng khi làm việc với lịch hẹn, hồ sơ bệnh án, hóa đơn và dịch vụ lưu trú.
- Giúp người dùng quét thông tin nhanh nhờ hệ thống màu trạng thái rõ ràng.

---

## 2. Colors

Bảng màu tập trung vào 3 trục chính:

1. **Xanh ngọc y tế**  
   Đại diện cho sự tin cậy, an toàn, chuyên nghiệp và chăm sóc sức khỏe.

2. **Be ấm nhẹ**  
   Tạo cảm giác thân thiện, mềm mại, phù hợp với dịch vụ chăm sóc thú cưng.

3. **Cam CTA**  
   Dùng cho các hành động quan trọng như đặt lịch, thanh toán, thêm hồ sơ.

---

### 2.1. Primary

- **Primary `#00796B`**  
  Dùng cho nhận diện chính, sidebar active, icon nhấn mạnh, button chính và trạng thái xác nhận.

- **Primary Hover `#00695C`**  
  Dùng cho trạng thái hover của primary button.

- **Primary Active `#00574D`**  
  Dùng cho trạng thái active/pressed của primary button.

- **Primary Container `#D8F3EE`**  
  Dùng cho nền nhạt của badge, filter, table header hoặc các vùng nhấn mạnh nhẹ.

---

### 2.2. Secondary / CTA

- **CTA Orange `#F59E0B`**  
  Dùng cho hành động quan trọng:
  - Đặt lịch khám
  - Thanh toán
  - Thêm hồ sơ thú cưng
  - Xác nhận dịch vụ quan trọng

- **CTA Hover `#D97706`**
- **CTA Active `#B45309`**

Không dùng cam cho quá nhiều thành phần để tránh làm giao diện bị ồn.

---

### 2.3. Surface & Background

- **App Background `#F7F6EA`**  
  Nền chính của ứng dụng.

- **Card Surface `#FFFFFF`**  
  Dùng cho card, bảng, form và các vùng nội dung chính.

- **Surface Container `#F1EFE2`**  
  Dùng cho sidebar, filter bar hoặc vùng phụ.

- **Filter Surface `#FBFAF2`**  
  Dùng cho filter bar, note box hoặc section phụ nhẹ.

- **Border Soft `#E6E8DD`**  
  Dùng cho border card, divider nhẹ.

- **Border Strong `#D3DAD6`**  
  Dùng cho input, dropdown, modal, drawer.

---

### 2.4. Text

- **Main Text `#1F261F`**  
  Dùng cho tiêu đề và nội dung chính.

- **Secondary Text `#52605C`**  
  Dùng cho mô tả, label, metadata.

- **Muted Text `#7A837F`**  
  Dùng cho placeholder, empty state, thông tin ít quan trọng.

---

## 3. Semantic Palette

Hệ thống sử dụng màu trạng thái để hỗ trợ quét thông tin nhanh.

### 3.1. Trạng thái thú cưng

| Trạng thái | Background | Text |
|---|---|---|
| Khỏe mạnh | `#DFF3E3` | `#2E7D32` |
| Cần theo dõi | `#FFF3D8` | `#B45309` |
| Đang lưu trú | `#E0F2FE` | `#0369A1` |
| Đang điều trị | `#FDE2E2` | `#B91C1C` |

### 3.2. Trạng thái lịch hẹn / dịch vụ

| Trạng thái | Background | Text |
|---|---|---|
| Chờ xác nhận | `#FFF3D8` | `#B45309` |
| Đã xác nhận | `#D8F3EE` | `#00796B` |
| Đang xử lý | `#E0F2FE` | `#0369A1` |
| Hoàn tất | `#DFF3E3` | `#2E7D32` |
| Đã hủy / Từ chối | `#FDE2E2` | `#B91C1C` |

### 3.3. Trạng thái hóa đơn

| Trạng thái | Background | Text |
|---|---|---|
| Chưa thanh toán | `#FFF3D8` | `#B45309` |
| Đã thanh toán | `#DFF3E3` | `#2E7D32` |
| Quá hạn | `#FDE2E2` | `#B91C1C` |

---

## 4. Typography

Sử dụng font **Inter** cho toàn bộ hệ thống.

### 4.1. Typography tokens

| Token | Font | Size | Weight | Line height | Letter spacing |
|---|---|---:|---:|---:|---:|
| `headline-lg` | Inter | 32px | 700 | 40px | -0.02em |
| `headline-md` | Inter | 24px | 600 | 32px | -0.01em |
| `headline-sm` | Inter | 20px | 600 | 28px | -0.01em |
| `title-md` | Inter | 18px | 600 | 26px | normal |
| `body-lg` | Inter | 16px | 400 | 24px | normal |
| `body-md` | Inter | 14px | 400 | 20px | normal |
| `body-sm` | Inter | 13px | 400 | 18px | normal |
| `label-md` | Inter | 12px | 500 | 16px | normal |
| `label-sm` | Inter | 11px | 600 | 14px | 0.02em |

### 4.2. Nguyên tắc sử dụng

- **Headline Large** dùng cho tiêu đề trang chính.
- **Headline Medium** dùng cho tiêu đề dashboard hoặc tiêu đề màn.
- **Headline Small** dùng cho tiêu đề card lớn.
- **Body 14px** dùng cho bảng dữ liệu, sidebar, form và thông tin quản lý.
- **Body 16px** dùng cho nội dung dài như ghi chú khám bệnh, mô tả bệnh án, hướng dẫn sử dụng thuốc.
- **Label 12px** dùng cho badge, tag, metadata, trạng thái, label phụ.

### 4.3. Text hierarchy

- Tiêu đề chính: `headline-lg` hoặc `headline-md`, màu `#1F261F`.
- Tiêu đề card: `headline-sm`, màu `#1F261F`.
- Nội dung chính: `body-md`, màu `#1F261F`.
- Mô tả phụ: `body-md`, màu `#52605C`.
- Placeholder / empty state: `body-md`, màu `#7A837F`.

---

## 5. Layout & Spacing

Hệ thống sử dụng mô hình **Fixed Grid 12 cột** cho desktop, với chiều rộng nội dung tối đa khoảng **1440px**.

### 5.1. Spacing Rhythm

Toàn bộ spacing dựa trên hệ **8px**.

Các khoảng cách chính:
- 8px: khoảng cách rất nhỏ giữa icon và text.
- 16px: khoảng cách giữa các item trong card.
- 24px: padding card, khoảng cách giữa các block vừa.
- 32px: khoảng cách giữa các section lớn.
- 48px: khoảng cách lớn giữa các vùng nội dung quan trọng.

### 5.2. Layout desktop

- Sidebar cố định bên trái.
- Nội dung chính nằm bên phải.
- Dashboard dùng grid card rõ ràng.
- Các bảng dữ liệu có thể chiếm toàn bộ chiều rộng content.

### 5.3. Layout tablet

- Sidebar có thể thu gọn thành icon-only.
- Bảng dữ liệu cho phép cuộn ngang.
- Card chuyển sang 2 cột.

### 5.4. Layout mobile

- Layout chuyển thành 1 cột.
- Ưu tiên card thay vì bảng.
- Navigation chuyển thành bottom nav hoặc drawer.

---

## 6. Elevation & Depth

Phân cấp thị giác sử dụng **Tonal Layering** kết hợp **Soft Shadows**.

### 6.1. Level 0 — App Background

- Dùng `#F7F6EA`.
- Là nền tổng thể của ứng dụng.

### 6.2. Level 1 — Cards / Panels

- Dùng `#FFFFFF`.
- Shadow: `0 4px 16px rgba(31, 38, 31, 0.05)`.
- Border nhẹ: `#E6E8DD`.

### 6.3. Level 2 — Dropdown / Popover / Modal

- Dùng `#FFFFFF`.
- Shadow: `0 16px 40px rgba(31, 38, 31, 0.12)`.
- Border: `#D3DAD6`.

### 6.4. Divider

- Dùng `#E6E8DD`.
- Không dùng divider quá đậm để giữ giao diện mềm.

---

## 7. Shapes

Ngôn ngữ hình khối cần thể hiện sự **thân thiện, ấm áp, dễ tiếp cận**.

### 7.1. Container & Cards

- Bo góc 16px.
- Dùng cho dashboard cards, pet cards, profile panels, invoice cards.

### 7.2. Buttons & Inputs

- Bo góc 12px.
- Tạo sự đồng bộ với card lớn.

### 7.3. Badges / Tags

- Dạng pill, bo góc tối đa.
- Background dùng màu nhạt, text dùng màu đậm tương ứng.

### 7.4. Avatar / Pet Image

- Ảnh thú cưng dùng dạng tròn hoặc bo góc 16px.
- Avatar người dùng dùng dạng tròn.

---

## 8. Components

### 8.1. Sidebar

Sidebar là khu vực điều hướng chính theo role.

Sidebar chỉ chứa các **module nghiệp vụ chính** của từng role. Không đặt các chức năng hệ thống phụ trong sidebar.

Không đặt trong sidebar:
- Thông báo
- Hồ sơ cá nhân
- Đăng xuất
- Trợ giúp

Các chức năng này nằm trên header hoặc user menu.

Sidebar style:
- Background: `#F1EFE2`
- Text: `#3F4A46`
- Icon: `#52605C`
- Active background: `#00796B`
- Active text: `#FFFFFF`
- Active icon: `#FFFFFF`
- Border phải: `#E6E8DD`

#### Sidebar Chủ nuôi

1. Tổng quan  
2. Thú cưng  
3. Lịch hẹn  
4. Sổ sức khỏe  
5. Dịch vụ spa  
6. Lưu trú  
7. Hóa đơn  

Không hiển thị trong sidebar Chủ nuôi:
- Thông báo
- Hồ sơ cá nhân
- Đăng xuất

Thông báo được truy cập qua icon chuông trên header.

Hồ sơ cá nhân được truy cập qua avatar/user menu trên header.

#### Sidebar Nhân viên

1. Tổng quan  
2. Lịch hẹn  
3. Hồ sơ thú cưng  
4. Dịch vụ spa  
5. Lưu trú  
6. Hóa đơn  

Không hiển thị trong sidebar Nhân viên:
- Thông báo
- Hồ sơ cá nhân
- Đăng xuất
- Cài đặt hệ thống

#### Sidebar Bác sĩ

1. Tổng quan  
2. Lịch khám  
3. Khám bệnh  
4. Hồ sơ bệnh án  
5. Đơn thuốc  
6. Lịch sử điều trị  

Không hiển thị trong sidebar Bác sĩ:
- Thông báo
- Hồ sơ cá nhân
- Đăng xuất
- Hóa đơn
- Lưu trú
- Dịch vụ spa

#### Sidebar Admin

1. Tổng quan  
2. Quản lý tài khoản  
3. Nhân viên  
4. Bác sĩ  
5. Dịch vụ  
6. Loại phòng  
7. Thuốc  
8. Cài đặt  

Admin không xử lý nghiệp vụ vận hành hằng ngày như:
- Tiếp nhận spa
- Check-in lưu trú
- Check-out lưu trú
- Cập nhật chăm sóc
- Khám bệnh
- Kê đơn

#### Nút cuối sidebar

Nút cuối sidebar dùng cho hành động hỗ trợ.

Ví dụ:
- “Liên hệ trung tâm”
- “Hỗ trợ kỹ thuật”

Style:
- Background: `#00796B`
- Text: `#FFFFFF`
- Radius: 12px

---

### 8.2. Header

Header là khu vực truy cập nhanh cho các chức năng hệ thống dùng chung.

Header gồm:
- Global search hoặc search theo màn hiện tại.
- Icon trợ giúp.
- Icon thông báo.
- Avatar người dùng.
- Tên người dùng.
- Role hiện tại.
- User menu.

Header style:
- Background: `#FBFAEE` hoặc `#FFFFFF` tùy layout màn.
- Border bottom: `#E6E8DD`.
- Text chính: `#1F261F`.
- Text phụ: `#52605C`.
- Icon: `#52605C`.
- Icon hover: `#00796B`.

#### Search trên header

Search dùng cho tìm kiếm nhanh theo ngữ cảnh màn.

Placeholder thay đổi theo role hoặc module:
- Chủ nuôi: “Tìm kiếm thú cưng, lịch hẹn...”
- Nhân viên: “Tìm kiếm lịch hẹn, thú cưng, chủ nuôi...”
- Bác sĩ: “Tìm kiếm lịch khám, hồ sơ bệnh án...”
- Admin: “Tìm kiếm tài khoản, nhân viên...”

Search style:
- Background: `#FFFFFF` hoặc `#F5F4E8`.
- Border: `#D3DAD6`.
- Focus border: `#00796B`.
- Radius: 12px.

#### Notification Button

Thông báo hiển thị bằng icon chuông trên header.

Style:
- Icon màu `#1F261F` hoặc `#52605C`.
- Hover icon: `#00796B`.
- Nếu có thông báo chưa đọc, hiển thị dot nhỏ màu `#BA1A1A` hoặc `#F59E0B`.
- Không đặt mục “Thông báo” trong sidebar.

Khi click icon chuông:
- Mở Notification Dropdown hoặc Notification Drawer.
- Hiển thị danh sách thông báo gần đây.
- Có nút “Xem tất cả”.

Route xem tất cả thông báo vẫn tồn tại:
- `/owner/notifications`
- `/staff/notifications`
- `/doctor/notifications`
- `/admin/notifications`

Nhưng các route này không xuất hiện trong sidebar.

#### User Menu

Avatar trên header mở user menu.

User menu gồm:
- Hồ sơ cá nhân
- Đổi mật khẩu
- Đăng xuất

Không đặt “Hồ sơ cá nhân” trong sidebar.

Không đặt “Đăng xuất” trong sidebar nếu đã có user menu.

User menu style:
- Dùng DropdownMenu hoặc Popover.
- Background: `#FFFFFF`.
- Border: `#D3DAD6`.
- Shadow: `0 16px 40px rgba(31, 38, 31, 0.12)`.
- Radius: 12px.

---

### 8.3. Buttons

#### Primary Button

Dùng cho hành động chính thông thường.

- Background: `#00796B`
- Text: `#FFFFFF`
- Hover: `#00695C`
- Active: `#00574D`
- Radius: 12px

Ví dụ:
- Chỉnh sửa hồ sơ
- Lưu thay đổi
- Xác nhận

#### CTA Button

Dùng cho hành động nổi bật nhất trên màn.

- Background: `#F59E0B`
- Text: `#FFFFFF`
- Hover: `#D97706`
- Active: `#B45309`
- Radius: 12px

Ví dụ:
- Đặt lịch khám
- Thanh toán
- Thêm hồ sơ thú cưng

#### Ghost / Outline Button

Dùng cho hành động phụ.

- Background: transparent hoặc `#FFFFFF`
- Border: `#00796B`
- Text: `#00796B`
- Hover background: `#D8F3EE`
- Radius: 12px

Ví dụ:
- Xem hồ sơ
- Quay lại danh sách
- Xem tất cả

#### Destructive Button

Dùng cho hành động nguy hiểm.

- Background: `#BA1A1A`
- Text: `#FFFFFF`
- Hover: `#93000A`
- Radius: 12px

Ví dụ:
- Từ chối
- Hủy yêu cầu
- Xác nhận hủy

---

### 8.4. Inputs

- Background: `#FFFFFF`
- Border: `#D3DAD6`
- Focus border: `#00796B`
- Placeholder: `#7A837F`
- Text: `#1F261F`
- Radius: 12px
- Label: rõ ràng, đặt phía trên input hoặc trong form layout nhất quán.

---

### 8.5. Status Chips

Status chip dùng dạng pill.

Nguyên tắc:
- Không dùng màu đậm toàn chip.
- Dùng background nhạt và text đậm.
- Có thể kèm icon nhỏ.
- Không dùng chỉ màu sắc để biểu thị trạng thái; nên kèm label rõ ràng.

Ví dụ:
- Khỏe mạnh: `#DFF3E3` + `#2E7D32`
- Cần theo dõi: `#FFF3D8` + `#B45309`
- Đang lưu trú: `#E0F2FE` + `#0369A1`
- Đã hủy: `#FDE2E2` + `#B91C1C`

---

### 8.6. Pet Profile Cards

Pet card dùng cho màn danh sách thú cưng.

Nội dung nên có:
- Ảnh thú cưng
- Tên thú cưng
- ID
- Loài / giống
- Tuổi
- Giới tính
- Badge trạng thái
- Button “Xem hồ sơ”

Không nên nhồi:
- Lịch hẹn chi tiết
- Note nhắc nhở dài
- Box vaccine
- Nút đặt lịch trên từng card nếu màn chỉ là danh sách hồ sơ

---

### 8.7. Timeline / Activity Cards

Dùng cho “Hoạt động gần đây” trong chi tiết hồ sơ thú cưng và nhật ký chăm sóc lưu trú.

Style:
- Card trắng lớn.
- Timeline dọc rõ ràng.
- Dot timeline dùng màu theo loại hoạt động:
  - Khám bệnh: `#00796B`
  - Spa: `#F59E0B`
  - Tiêm chủng: `#8A9691`
  - Lưu trú: `#0369A1`
- Note box dùng nền `#FBFAF2` hoặc `#F1EFE2`.
- Note box bo góc 12px.
- Time badge dùng nền `#F1EFE2`, text `#52605C`.

---

### 8.8. Data Tables

- Header background: `#D8F3EE`
- Header text: `#003D36`
- Row background: `#FFFFFF`
- Row border: `#E6E8DD`
- Text chính: `#1F261F`
- Text phụ: `#52605C`

Bảng nên có:
- Search
- Filter
- Pagination
- Row action rõ ràng

---

### 8.9. Dialog / Modal

Dialog dùng cho thao tác xác nhận ngắn.

Ví dụ:
- Xác nhận thanh toán
- Từ chối lưu trú
- Xác nhận tiếp nhận spa
- Xác nhận hủy yêu cầu

Style:
- Background: `#FFFFFF`
- Border: `#D3DAD6`
- Shadow: `0 16px 40px rgba(31, 38, 31, 0.12)`
- Radius: 16px
- Overlay màu đen opacity nhẹ, không quá tối
- Header rõ ràng
- Footer có 2 nút: phụ bên trái, chính bên phải

Không dùng Dialog cho form dài có nhiều trường hoặc upload media.

---

### 8.10. Sheet / Drawer

Sheet dùng cho form dài hoặc thao tác cập nhật có nhiều nội dung.

Ví dụ:
- Cập nhật chăm sóc lưu trú
- Check-in lưu trú
- Check-out lưu trú
- Notification Drawer

Style:
- Background: `#FFFFFF`
- Border-left: `#D3DAD6`
- Shadow: `0 16px 40px rgba(31, 38, 31, 0.12)`
- Width desktop: 520px - 640px tùy nội dung
- Body có thể scroll
- Footer sticky nếu form dài

---

## 9. Usage Rules

### 9.1. Màu nền

- App background luôn dùng `#F7F6EA`.
- Sidebar dùng `#F1EFE2`.
- Card, form, bảng dùng `#FFFFFF`.
- Filter bar hoặc section phụ dùng `#FBFAF2`.

### 9.2. Màu nút

- Hành động chính: `#00796B`.
- CTA quan trọng: `#F59E0B`.
- Hành động phụ: outline hoặc ghost màu `#00796B`.
- Hành động nguy hiểm: `#BA1A1A`.

### 9.3. Màu trạng thái

- Không dùng màu trạng thái quá đậm cho nền lớn.
- Luôn dùng container nhạt + text đậm.
- Badge phải có độ tương phản tốt và dễ đọc.

### 9.4. Màu cam

Màu cam chỉ dùng cho:
- CTA chính.
- Warning.
- Nhắc nhở sắp đến hạn.

Không dùng cam cho:
- Sidebar active.
- Tiêu đề chính.
- Quá nhiều icon trên cùng một màn.

### 9.5. Màu xanh ngọc

Màu xanh ngọc dùng cho:
- Nhận diện hệ thống.
- Sidebar active.
- Primary button.
- Link quan trọng.
- Icon nhấn mạnh.
- Trạng thái xác nhận.

Không dùng xanh ngọc đậm cho mảng nền quá lớn để tránh nặng mắt.

### 9.6. Sidebar & Header

- Sidebar chỉ chứa module nghiệp vụ chính.
- Thông báo luôn nằm trên header bằng icon chuông.
- Hồ sơ cá nhân nằm trong avatar/user menu.
- Đăng xuất nằm trong avatar/user menu.
- Không đặt Thông báo / Hồ sơ cá nhân / Đăng xuất trong sidebar.

---

## 10. Screen-specific Color Guidance

### 10.1. Auth Screens

- Nền tổng: `#F7F6EA`.
- Form card: `#FFFFFF`.
- Illustration panel: gradient nhẹ từ `#D8F3EE` sang `#FBFAF2`.
- Primary CTA:
  - Đăng nhập: `#00796B`
  - Đăng ký: `#00796B`
- Link chuyển màn: `#00796B`.

### 10.2. Dashboard Chủ nuôi

- Background: `#F7F6EA`.
- Sidebar: `#F1EFE2`.
- Active sidebar: `#00796B`.
- Summary cards: `#FFFFFF`.
- CTA “Đặt lịch khám”: `#F59E0B`.
- Outline button “Thêm hồ sơ thú cưng”: `#00796B`.

### 10.3. Danh sách thú cưng

- Page background: `#F7F6EA`.
- Pet cards: `#FFFFFF`.
- Pet card border: `#E6E8DD`.
- Badge trạng thái theo Pet-specific chips.
- Button “Xem hồ sơ”: outline `#00796B`.
- CTA “Thêm hồ sơ thú cưng”: `#F59E0B`.

### 10.4. Chi tiết hồ sơ thú cưng

- Banner profile: `#FFFFFF` hoặc gradient rất nhẹ `#FFFFFF → #D8F3EE`.
- Badge “Khỏe mạnh”: `#DFF3E3` + `#2E7D32`.
- Tabs active: `#00796B`.
- Timeline dot:
  - Khám bệnh: `#00796B`
  - Spa: `#F59E0B`
  - Tiêm chủng: `#8A9691`
- Note box: `#FBFAF2`.

### 10.5. Lịch hẹn

- Chờ xác nhận: `#FFF3D8` + `#B45309`.
- Đã xác nhận: `#D8F3EE` + `#00796B`.
- Đã hủy: `#FDE2E2` + `#B91C1C`.
- CTA đặt lịch: `#F59E0B`.

### 10.6. Dịch vụ spa

- Chờ tiếp nhận: `#FFF3D8` + `#B45309`.
- Đã tiếp nhận: `#D8F3EE` + `#00796B`.
- Hoàn tất: `#DFF3E3` + `#2E7D32`.
- Đã hủy: `#FDE2E2` + `#B91C1C`.
- CTA tạo yêu cầu spa: `#F59E0B`.
- Button tiếp nhận: `#00796B`.
- Button hoàn tất: `#F59E0B` hoặc `#00796B` tùy mức ưu tiên trên màn.

### 10.7. Lưu trú

- Chờ xác nhận: `#FFF3D8` + `#B45309`.
- Chờ check-in: `#E0F2FE` + `#0369A1`.
- Đang lưu trú: `#D8F3EE` + `#00796B`.
- Đã trả thú cưng / Hoàn tất: `#DFF3E3` + `#2E7D32`.
- Đã hủy / Từ chối: `#FDE2E2` + `#B91C1C`.
- CTA tạo lưu trú tại quầy: `#F59E0B`.
- Button xác nhận / cập nhật: `#00796B`.
- Button từ chối / hủy: dùng destructive.

### 10.8. Hóa đơn

- Chưa thanh toán: `#FFF3D8` + `#B45309`.
- Đã thanh toán: `#DFF3E3` + `#2E7D32`.
- Quá hạn: `#FDE2E2` + `#B91C1C`.
- CTA thanh toán: `#F59E0B`.
- Button xác nhận thanh toán tại quầy: `#00796B`.

---

## 11. Accessibility Notes

- Không đặt text trắng trên nền cam hoặc xanh quá nhạt.
- Badge luôn dùng nền nhạt + text đậm để đảm bảo đọc được.
- Text chính dùng `#1F261F`, tránh dùng xám nhạt cho nội dung quan trọng.
- Placeholder không được quá nhạt; dùng `#7A837F`.
- Không dùng chỉ màu sắc để biểu thị trạng thái; nên kèm icon hoặc label.
- Button cần có trạng thái hover/focus rõ ràng.
- Các action nguy hiểm cần có label rõ, không chỉ dùng icon.
- Icon thông báo có dot chưa đọc nhưng vẫn cần label hoặc tooltip “Thông báo”.
- Avatar menu cần có trạng thái focus để hỗ trợ keyboard navigation.

---

## 12. shadcn/ui Usage

Dự án sử dụng **shadcn/ui** làm nền tảng UI primitive.

shadcn/ui cung cấp component nền, còn `design.md` quyết định giao diện cuối cùng.

Nguyên tắc:
- Button dùng từ shadcn/ui nhưng màu, radius, hover, size phải theo `design.md`.
- Dialog dùng từ shadcn/ui nhưng overlay, spacing, title, footer phải theo `design.md`.
- Sheet dùng từ shadcn/ui nhưng width, padding, footer sticky phải theo `design.md`.
- Badge dùng từ shadcn/ui hoặc custom wrapper nhưng màu trạng thái phải theo Semantic Palette.
- Card dùng từ shadcn/ui nhưng radius, border, shadow phải theo Elevation & Depth.
- DropdownMenu dùng cho avatar/user menu.
- Notification có thể dùng DropdownMenu hoặc Sheet tùy độ dài nội dung.
- Không được dùng style mặc định của shadcn/ui nếu nó lệch với `design.md`.

Component primitive nằm ở:

```txt
src/components/ui/
```

Component chung tự viết nằm ở:

```txt
src/components/common/
```

Component nghiệp vụ nằm ở:

```txt
src/features/<domain>/components/
```

Ví dụ:

```txt
src/components/ui/button.tsx
src/components/ui/dialog.tsx
src/components/ui/sheet.tsx
src/components/ui/dropdown-menu.tsx

src/features/boarding/components/staff/CareUpdateDrawer.tsx
src/features/boarding/components/staff/RejectBoardingModal.tsx
src/features/invoices/components/staff/ConfirmPaymentModal.tsx
```

Không được:
- Tự build lại Button nếu shadcn/ui đã có Button.
- Tự build modal bằng div fixed nếu shadcn/ui đã có Dialog.
- Tự build drawer bằng div fixed nếu shadcn/ui đã có Sheet.
- Đưa logic nghiệp vụ vào `src/components/ui/`.
- Sửa component shadcn/ui chỉ để phục vụ riêng một màn.

Nếu cần style riêng cho nghiệp vụ:
- Tạo wrapper trong feature.
- Wrapper được phép dùng shadcn/ui bên trong.

---

## 13. Implementation Notes

Phần này dùng để team FE khai báo các token từ `design.md` vào code.

### 13.1. Nơi khai báo theme

Khai báo màu, font, radius, shadow trong:

```txt
src/app/globals.css
```

hoặc tách riêng:

```txt
src/styles/theme.css
```

Nếu tách riêng, import trong `globals.css`.

Ví dụ:

```css
@import '../styles/theme.css';
```

### 13.2. Token cần khai báo bắt buộc

Khi khởi tạo frontend nền, bắt buộc khai báo:

```txt
- App background
- Card background
- Sidebar background
- Text chính
- Text phụ
- Border
- Primary
- CTA
- Success / warning / info / danger
- Radius
- Shadow
- Font Inter
```

Không được hard-code màu rải rác trong từng màn nếu màu đó đã có trong `design.md`.

### 13.3. CSS variables gợi ý

```css
@layer base {
  :root {
    --app-background: #F7F6EA;
    --sidebar-background: #F1EFE2;
    --card-surface: #FFFFFF;
    --filter-surface: #FBFAF2;

    --text-main: #1F261F;
    --text-secondary: #52605C;
    --text-muted: #7A837F;

    --primary-green: #00796B;
    --primary-green-hover: #00695C;
    --primary-green-active: #00574D;

    --cta-orange: #F59E0B;
    --cta-orange-hover: #D97706;
    --cta-orange-active: #B45309;

    --border-soft: #E6E8DD;
    --border-strong: #D3DAD6;

    --success-bg: #DFF3E3;
    --success-text: #2E7D32;

    --warning-bg: #FFF3D8;
    --warning-text: #B45309;

    --info-bg: #E0F2FE;
    --info-text: #0369A1;

    --danger-bg: #FDE2E2;
    --danger-text: #B91C1C;

    --radius-card: 16px;
    --radius-control: 12px;

    --shadow-card: 0 4px 16px rgba(31, 38, 31, 0.05);
    --shadow-modal: 0 16px 40px rgba(31, 38, 31, 0.12);
  }

  body {
    background: var(--app-background);
    color: var(--text-main);
    font-family: Inter, system-ui, sans-serif;
  }
}
```

### 13.4. Typography utilities gợi ý

```css
@layer components {
  .heading-lg {
    font-size: 32px;
    line-height: 40px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .heading-md {
    font-size: 24px;
    line-height: 32px;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .heading-sm {
    font-size: 20px;
    line-height: 28px;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .title-md {
    font-size: 18px;
    line-height: 26px;
    font-weight: 600;
  }

  .body-lg {
    font-size: 16px;
    line-height: 24px;
    font-weight: 400;
  }

  .body-md {
    font-size: 14px;
    line-height: 20px;
    font-weight: 400;
  }

  .body-sm {
    font-size: 13px;
    line-height: 18px;
    font-weight: 400;
  }

  .label-md {
    font-size: 12px;
    line-height: 16px;
    font-weight: 500;
  }

  .label-sm {
    font-size: 11px;
    line-height: 14px;
    font-weight: 600;
    letter-spacing: 0.02em;
  }
}
```

### 13.5. Tailwind token naming gợi ý

Trong `tailwind.config.ts`, nên map các token thành namespace `petcenter`.

Ví dụ:

```ts
colors: {
  petcenter: {
    background: '#F7F6EA',
    sidebar: '#F1EFE2',
    card: '#FFFFFF',
    filter: '#FBFAF2',

    text: '#1F261F',
    textSecondary: '#52605C',
    textMuted: '#7A837F',

    border: '#E6E8DD',
    borderStrong: '#D3DAD6',

    primary: '#00796B',
    primaryHover: '#00695C',
    primaryActive: '#00574D',

    cta: '#F59E0B',
    ctaHover: '#D97706',
    ctaActive: '#B45309',

    successBg: '#DFF3E3',
    successText: '#2E7D32',

    warningBg: '#FFF3D8',
    warningText: '#B45309',

    infoBg: '#E0F2FE',
    infoText: '#0369A1',

    dangerBg: '#FDE2E2',
    dangerText: '#B91C1C',
  },
}
```

Sau đó dùng:

```tsx
<div className="bg-petcenter-background text-petcenter-text">
  <div className="rounded-lg border border-petcenter-border bg-petcenter-card shadow-card">
    Nội dung
  </div>
</div>
```

---

## 14. Prompt Rules for Stitch

Khi dùng Stitch để tạo hoặc sửa UI, prompt luôn mở đầu bằng:

```txt
Đọc kỹ docs/design.md, docs/frontend-architecture.md, đặc tả SRS và mô tả dự án trước khi chỉnh.
Giữ nguyên design system hiện tại, chỉ sửa đúng phần được yêu cầu.
```

Quy tắc:
- Không tự ý đổi màu ngoài `design.md`.
- Không tự ý đổi font ngoài `design.md`.
- Không tự ý đổi radius ngoài `design.md`.
- Không tự ý tạo style mới nếu `design.md` đã có quy chuẩn.
- Component shadcn/ui phải được custom theo `design.md`.
- Nếu UI cần style mới chưa có trong `design.md`, phải bổ sung vào `design.md` trước rồi mới áp dụng.

---

## 15. Final Direction

Bảng màu giúp hệ thống nhìn:
- Sạch hơn.
- Ít vàng hơn.
- Tin cậy hơn.
- Chuyên nghiệp hơn.
- Phù hợp hơn với hệ thống chăm sóc thú cưng kết hợp yếu tố y tế.

Tổng thể vẫn giữ được tinh thần:
**xanh ngọc cho y tế và tin cậy, be cho sự ấm áp, cam cho hành động quan trọng.**
