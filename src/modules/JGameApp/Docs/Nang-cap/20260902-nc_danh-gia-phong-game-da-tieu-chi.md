# Nâng cấp: Đánh giá phòng game đa tiêu chí + trang "Đánh giá khách hàng" (Chủ Cybergame) và "Đánh giá phòng game" (Admin)

**Ngày tạo:** 02/09/2026
**Project:** Website (JGameApp) - đồng bộ với Backend (JGameApi) và App (Flutter)
**Trạng thái:** Đã code (Phase 2 xong 02/09/2026) - `npx tsc -b` sạch, Vite transform các trang mới không lỗi
**Tài liệu Backend (nguồn contract):** `Backend/JGameApi/Docs/Nang-cap/20260902-nc_danh-gia-phong-game-da-tieu-chi.md`

---

## 1. Phạm vi tác động

### 1.1 Tổng quan

| Mục | Nội dung |
|---|---|
| Loại tác động | Đổi contract đánh giá hiện có (1 sao tổng thể) sang 4 tiêu chí (Vệ sinh/Đồ ăn/Thái độ phục vụ/Cấu hình máy tính) + 2 trang mới (ShopOwner, Admin) |
| Mức độ rủi ro | Trung bình - BREAKING với contract `createReview` hiện tại, phải deploy đồng bộ với Backend |

### 1.2 Hiện trạng thực tế (đã khảo sát)

- `features/Public/playtime/services/PlaytimeApiService.ts`: `createReview(orderId, rating, comment?)` -> `POST {ORDERS_PATH}/{orderId}/review` body `{ rating, comment }`; `getShopReviews(shopId)`; `getMyReviews()`.
- `features/Public/playtime/types/playtime.types.ts`: `interface PlaytimeReview { id, orderId, shopId, shopName, ticketId, zoneName, userId, reviewerName, rating: number, comment?, createdAt }`.
- `features/Account/User/playtime/pages/MyPlaytimeOrdersPage.tsx` (route `ve-da-mua`): component `ReviewForm` nội bộ - 1 dải sao (`useState(5)`) + textarea comment, gọi `createReview`.
- `features/Account/User/reviews/pages/MyPlaytimeReviewsPage.tsx` (route `danh-gia-cua-toi`): danh sách đánh giá của tôi.
- `TicketDetailPage.tsx`, `CybergameShopPage.tsx`: hiển thị review công khai + rating trung bình shop.
- `features/Account/ShopOwner/`: `ShopOwnerLayout.tsx` (menu Tổng quan/Zone & Vé/Đồng bộ/Máy/Khung giờ/Đơn hàng/Công nợ), routes `chu-cybergame*` - **chưa có trang đánh giá**.
- `features/Account/Admin/`: `AdminLayout.tsx`, routes `quan-tri*` - **chưa có trang đánh giá**.

### 1.3 Danh sách file/module tác động

| File/Module | Loại |
|---|---|
| `features/Public/playtime/types/playtime.types.ts` (`PlaytimeReview` +4 field tiêu chí nullable, bỏ tham số `rating` khỏi `createReview`) | Sửa |
| `features/Public/playtime/services/PlaytimeApiService.ts` (`createReview` nhận object 4 tiêu chí + comment) | Sửa |
| `features/Account/User/playtime/pages/MyPlaytimeOrdersPage.tsx` (`ReviewForm` -> 4 dải sao) | Sửa |
| `features/Account/User/reviews/pages/MyPlaytimeReviewsPage.tsx` (hiển thị breakdown 4 tiêu chí, "chưa có breakdown" nếu null) | Sửa |
| `TicketDetailPage.tsx`, `CybergameShopPage.tsx` (hiển thị breakdown khi có) | Sửa |
| `features/Account/ShopOwner/reviews/pages/ShopReviewsPage.tsx` (mới) + `hooks/useShopReviews.page.fetchData.ts` (mới) | Mới |
| `features/Account/ShopOwner/services/ShopOwnerApiService.ts` (+`getMyShopReviews`, `+getMyShopReviewSummary`) - kiểm tra tên file thật khi code, dùng lại service hiện có của ShopOwner | Sửa |
| `features/Account/ShopOwner/components/ShopOwnerLayout.tsx` (+menu "Đánh giá khách hàng") | Sửa |
| `features/Account/Admin/reviews/pages/AdminReviewsPage.tsx` (mới) + `hooks/useAdminReviews.page.fetchData.ts` (mới) | Mới |
| `features/Account/Admin/services/JGameApiServiceAdmin.ts` (+`getReviews`, `+getReviewShopSummary`) | Sửa |
| `features/Account/Admin/components/AdminLayout.tsx` (+menu "Đánh giá phòng game") | Sửa |
| `routes/routeConfig.tsx` (+`chu-cybergame/danh-gia`, +`quan-tri/danh-gia`) | Sửa |
| `.claude/business-rules/` file Chợ vé/Playtime liên quan, `quan-tri-admin.md`, `system-architect/routing-va-layout.md` | Sửa |

---

## 2. Giải pháp nâng cấp

### 2.1 Type & Service

```ts
export interface PlaytimeReview {
  id: string; orderId: string; shopId: string; shopName: string; ticketId: string; zoneName: string
  userId: string; reviewerName: string
  ratingHygiene: number | null   // Vệ sinh
  ratingFood: number | null      // Đồ ăn
  ratingService: number | null   // Thái độ phục vụ
  ratingEquipment: number | null // Cấu hình máy tính
  rating: number   // tổng thể, BE tính - luôn có giá trị kể cả review cũ
  comment?: string
  createdAt: string
}
```

`createReview(orderId, { ratingHygiene, ratingFood, ratingService, ratingEquipment, comment? })` - đổi từ tham số rời `(orderId, rating, comment?)` sang object 4 tiêu chí (field **giống hệt BE**, không viết tắt).

### 2.2 Form đánh giá (khách hàng) - `MyPlaytimeOrdersPage.tsx`

`ReviewForm` đổi từ 1 `StarPicker` thành 4 `StarPicker` xếp dọc, mỗi cái có nhãn tiêu chí + state riêng (`ratingHygiene/ratingFood/ratingService/ratingEquipment`, mặc định 5 sao như hành vi cũ). Nút "Gửi đánh giá" disable khi thiếu bất kỳ tiêu chí nào (thực tế luôn có giá trị mặc định nên chỉ cần đảm bảo state khởi tạo đủ 4, không cần validate rỗng).

### 2.3 Hiển thị breakdown - `MyPlaytimeReviewsPage.tsx`, `TicketDetailPage.tsx`

Với review có đủ 4 tiêu chí (không null): hiển thị 4 dòng nhỏ "Vệ sinh: X sao", "Đồ ăn: X sao"... dưới rating tổng thể. Với review cũ (4 field null): chỉ hiển thị rating tổng thể như hiện tại, KHÔNG hiển thị dòng breakdown (ẩn hẳn, không hiện "N/A" gây rối UI).

### 2.4 Trang ShopOwner - "Đánh giá khách hàng" (`chu-cybergame/danh-gia`)

- Khối thống kê đầu trang: 4 thẻ trung bình theo tiêu chí + 1 thẻ tổng thể + tổng số đánh giá (gọi `getMyShopReviewSummary`).
- Bảng danh sách phân trang bên dưới (gọi `getMyShopReviews`): người đánh giá, 4 tiêu chí (dạng sao nhỏ), tổng thể, nhận xét, thời gian.
- KHÔNG có thao tác sửa/xoá (đúng phạm vi BE - chỉ xem để "biết và khắc phục").

### 2.5 Trang Admin - "Đánh giá phòng game" (`quan-tri/danh-gia`)

- Bảng TỪNG SHOP: tên shop, trung bình 4 tiêu chí, tổng thể, tổng số đánh giá - **mặc định sắp xếp tăng dần theo tổng thể** (khớp BE trả sẵn thứ tự này, FE không tự sort lại tránh sai khác).
- Bấm vào 1 dòng -> mở danh sách chi tiết đánh giá của đúng shop đó (tái dùng cùng bảng chi tiết như trang ShopOwner nếu tách được component dùng chung `ReviewListTable` - quyết định lúc code, không bắt buộc nếu tăng phức tạp không cần thiết).

---

## 3. Trình tự thực hiện

1. Sửa `playtime.types.ts` + `PlaytimeApiService.ts` (contract mới) - làm TRƯỚC để các bước sau dùng type đúng.
2. Sửa `ReviewForm` (`MyPlaytimeOrdersPage.tsx`) - 4 star picker.
3. Sửa hiển thị breakdown ở `MyPlaytimeReviewsPage.tsx`, `TicketDetailPage.tsx`.
4. Thêm `getMyShopReviews`/`getMyShopReviewSummary` vào service ShopOwner hiện có; tạo `ShopReviewsPage.tsx` + hook; thêm route + menu.
5. Thêm `getReviews`/`getReviewShopSummary` vào `JGameApiServiceAdmin.ts`; tạo `AdminReviewsPage.tsx` + hook; thêm route + menu.
6. `npx tsc -b` sạch; boot dev server kiểm tra 3 trang (đánh giá, ShopOwner, Admin) không lỗi console.
7. Cập nhật governance (business-rules Playtime, `quan-tri-admin.md`, `routing-va-layout.md`, `CHANGELOG.md`).

## 4. Checklist sau khi code xong

- [ ] `npx tsc -b` sạch
- [ ] Test tạo đánh giá 4 tiêu chí qua UI thật, xác nhận Backend nhận đúng field
- [ ] Trang ShopOwner chỉ thấy đúng shop mình (test 2 tài khoản)
- [ ] Trang Admin sort đúng thứ tự BE trả về
- [ ] Review cũ hiển thị không lỗi (ẩn breakdown, giữ tổng thể)
- [ ] Cập nhật business-rules + CHANGELOG.md (bump version)
- [ ] Commit + push

## 5. Tham chiếu

- Backend: `Backend/JGameApi/Docs/Nang-cap/20260902-nc_danh-gia-phong-game-da-tieu-chi.md`
- Pattern tham chiếu: `AdminReferralPartnersPage.tsx` (bảng + tab), `check-be-dto-fields.cjs` (đối chiếu field FE/BE nếu khai báo dạng `*Dto`)
