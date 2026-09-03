# Lỗi đã gặp — Website (JGameApp)

> Mỗi dòng = 1 bài học từ lỗi thật. Có script trong `scripts/lessons/<ID>-*.cjs` thì `check-all.cjs` tự kiểm; "Thủ công" = agent đối chiếu khi review.
> **Phát hiện lỗi mới -> thêm dòng (ID kế tiếp) + script nếu quét được.** Đọc bảng này ở Phase 1 (tự review checklist 3) để không thiết kế lặp lại.

| ID | Bài học | Nguồn / ngày | Kiểm tra |
|---|---|---|---|
| WEB-L01 | BE trả `PagedResult<T>` -> phải đọc `result.data.items`, không ép `data` thành mảng (crash `data.map is not a function`) | Admin referral tab Giao dịch, báo cáo - 6fc51fd, c53c51e 2026-09-02 | Script |
| WEB-L02 | Enum BE là int: map cả chiều đọc (int -> union) LẪN chiều ghi (union -> int) trước khi POST/PUT; gửi chuỗi -> 400 khác shape `ApiResponse` | nc_shop-owner-zone-ve-crud 1.3 (`setSyncMode`) | Script |
| WEB-L03 | Hook fetch phải `try/catch/finally` + state lỗi; thiếu -> treo "Đang tải..." vĩnh viễn, lỗi bị nuốt | nc_shop-owner-zone-ve-crud 1.3 (`useShopZonesTickets`, `useShopSync`) | Script |
| WEB-L04 | Không dùng class/token theme không tồn tại (`bg-input-background`, `icon-warning`) - Input dùng chung từng vô hình toàn site | f9f023c 2026-08-29 | Script |
| WEB-L05 | `X_MAP[value]` phải có fallback khi BE thêm giá trị enum mới | pattern `_MAP`; App 378fca6 | Script |
| WEB-L06 | Response mở rộng field (vd `partnerId/partnerName` trong giao dịch) phải cập nhật type TS + `check-be-dto-fields`; đừng tự suy "additive nên không cần" | 6fc51fd (thiếu tên đối tác) | Script `check-be-dto-fields.cjs` (B1) |
| WEB-L07 | Header/dropdown theo ngữ cảnh 4 nhóm user (User/Admin/ShopOwner/Partner) - thêm vai trò mới phải rà `StorefrontHeader.tsx` + guard `routeConfig.tsx` | 4457126 2026-09-01 | Thủ công (grep vai trò mới trong `layout/`) |
| WEB-L08 | Enum dạng chuỗi trong mock cũ ≠ int từ BE thật - khi nối BE thật phải đổi `normalize*` và mọi so sánh `=== 'active'` | architecture.instructions.md (quyết định enum int) | Thủ công (grep literal trạng thái trong hooks/pages) |
| WEB-L09 | Deploy: field BE bị đổi kiểu/xoá làm FE cũ vỡ - master doc chiều 12 phải chốt "deploy đồng thời" hoặc BE tương thích ngược | nc_nhiem-vu-mo-ta-tien-do 1.4 | Thủ công |
| WEB-L10 | `checklist-sau-code/check-all.cjs` cũ liệt kê 16 script không còn tồn tại và bỏ qua im lặng - dùng `review-sau-code/scripts/check-all.cjs` (chỉ script có thật) | rà soát 2026-09-03 | - |
