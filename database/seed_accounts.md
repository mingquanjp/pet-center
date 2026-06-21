# Tài khoản demo

Bộ dữ liệu seed dùng chung mật khẩu `12345678` và được thiết kế cho buổi demo Pet Center.

| Vai trò | Họ tên | Email | Kịch bản có sẵn |
|---|---|---|---|
| Chủ thú cưng | Nguyễn Minh Anh | `owner1@gmail.com` | Có 3 thú cưng Milo, Bông, Lucky; lịch khám đã hoàn tất/sắp tới/đã hủy; spa; lưu trú; hóa đơn; lịch sử hoạt động và thông báo. |
| Nhân viên | Trần Thu Hà | `staff1@gmail.com` | Có lịch khám, spa và lưu trú ở đầy đủ trạng thái để tìm kiếm, lọc, xác nhận và theo dõi. |
| Bác sĩ | BS. Nguyễn Hoàng Nam | `nguyenhoangnam@gmail.com` | Có lịch khám tổng quát và xét nghiệm trong ngày tham chiếu, lịch tương lai, lịch sử khám, kết quả, đơn thuốc, tiêm phòng và yêu cầu tái khám. |
| Quản trị viên | Lê Thanh Phương | `admin1@gmail.com` | Có dữ liệu dashboard, người dùng, dịch vụ, thuốc, phòng lưu trú và báo cáo doanh thu 6 tháng. |

Các tài khoản bác sĩ còn lại:

- BS. Trần Mai Phương: `tranmaiphuong@gmail.com`
- BS. Lê Đức Khải: `leduckhai@gmail.com`
- BS. Phạm Thùy Dung: `phamthuydung@gmail.com`

## Chạy seed

Từ thư mục gốc của dự án:

```powershell
python database/seed_data.py
```

Mặc định script lấy ngày hiện tại theo múi giờ `Asia/Ho_Chi_Minh`.

Để cố định ngày tham chiếu cho buổi demo ngày 20/06/2026:

```powershell
$env:SEED_REFERENCE_DATE="2026-06-20"
python database/seed_data.py
```

Seed chạy trong một transaction, rollback khi validation lỗi, đồng bộ sequence và in `DEMO COVERAGE REPORT` sau khi hoàn tất.
