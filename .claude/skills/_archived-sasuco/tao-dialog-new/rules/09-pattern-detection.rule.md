# DLGNEW-09 — Nhận diện pattern dialog (Danh Mục CRUD / Full-Screen Nghiệp Vụ)

**Mức độ:** Thông tin (không phát sinh ERROR/WARN)
**Kiểm tra:** tự động (chỉ mang tính phân loại, không chặn)

## Mô tả
Script tự nhận diện dialog đang theo pattern nào để áp dụng đúng các rule đặc thù (DLGNEW-11, DLGNEW-12, DLGNEW-13, DLGNEW-16):
- Có `DmFormField` → Pattern **Danh Mục CRUD** (kiểu `KHFormDialog`).
- Có `<Label` và `SearchCombobox` → Pattern **Full-Screen Nghiệp Vụ** (kiểu `PTDialog`).
- Không khớp cả hai → Pattern khác/custom.

## Ghi chú
Rule này không tạo issue ERROR/WARN — chỉ dùng nội bộ trong script để bật/tắt các rule theo pattern (xem cách các rule PATTERN A / PATTERN B tự trả `N/A` khi không đúng pattern).
