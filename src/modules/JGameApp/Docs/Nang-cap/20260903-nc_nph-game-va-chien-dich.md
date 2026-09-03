# Nâng cấp: Cổng NPH - Chiến dịch Game, đa dạng nhiệm vụ, gói nạp quỹ, hành vi gamer, trang giới thiệu API

**Ngày tạo:** 03/09/2026
**Project:** Website (React). Phụ thuộc Backend đã thiết kế + code xong ở
`Backend/JGameApi/Docs/Nang-cap/20260903-nc_nph-game-va-chien-dich.md` - ĐỌC TRƯỚC tài liệu đó để
biết chính xác API/DTO/enum. App có tài liệu song song `App/Docs/Nang-cap/20260903-nc_nph-game-va-chien-dich.md`.
**Trạng thái:** Chờ duyệt (GATE 1) - CHƯA CODE, phụ thuộc Backend đã xong (mở rộng cổng NPH đã có ở
`20260903-nc_quan-tri-nha-phat-hanh-game.md`, tài liệu đó vẫn còn hiệu lực cho phần đã thiết kế trước).

---

## 1. Phạm vi tác động

Cổng NPH (`features/Account/Nph/`) đã được thiết kế ở `20260903-nc_quan-tri-nha-phat-hanh-game.md`
(đăng nhập, dashboard, nhiệm vụ, giao dịch, ví, cài đặt) - tài liệu này chỉ bổ sung thêm 4 nhóm màn/
luồng MỚI, không thiết kế lại phần đã có:

1. Quản lý Chiến dịch/Game (mới hoàn toàn).
2. Mở rộng form tạo/sửa nhiệm vụ: chọn Game thuộc về, 5 loại yêu cầu mới.
3. Danh sách người tham gia 1 nhiệm vụ (hành vi gamer).
4. Chọn gói nạp quỹ khi nạp tiền + trang giới thiệu mô hình tích hợp API (nội dung tĩnh, công khai
   không cần đăng nhập).

### 1.2 Danh sách file/module tác động

| File | Loại |
|---|---|
| `features/Account/Nph/types/nph.types.ts` (+`PublisherGame`, `TaskParticipant`, `TopupPackage`, mở rộng `RequirementType` +5 giá trị) | Sửa |
| `features/Account/Nph/services/NphApiService.ts` (+API games CRUD/dashboard/toggle, participants, topup-packages) | Sửa |
| `features/Account/Nph/games/pages/NphGamesPage.tsx` + hook (danh sách + tạo/sửa chiến dịch) | Mới |
| `features/Account/Nph/games/pages/NphGameDashboardPage.tsx` + hook (chi tiêu/còn lại/hiệu quả 1 chiến dịch) | Mới |
| `features/Account/Nph/tasks/pages/NphTasksPage.tsx` (form +chọn Game, +5 loại yêu cầu mới, +field từ khoá khi KeywordSearch) | Sửa |
| `features/Account/Nph/tasks/pages/NphTaskParticipantsPage.tsx` + hook (danh sách người tham gia, phân trang) | Mới |
| `features/Account/Nph/wallet/pages/NphWalletPage.tsx` (+chọn gói nạp trước khi nhập số tiền tự do) | Sửa |
| `features/Account/Nph/components/NphLayout.tsx` (+menu "Chiến dịch") | Sửa |
| `features/Public/PublisherIntegration/pages/PublisherIntegrationPage.tsx` (mới, trang giới thiệu tích hợp API, công khai) | Mới |
| `routes/routeConfig.tsx` (+route `nph/chien-dich`, `nph/chien-dich/:id`, `nph/nhiem-vu/:id/nguoi-tham-gia`, +route công khai `doi-tac/tich-hop-api`) | Sửa |
| `features/Account/Admin/services/JGameApiServiceAdmin.ts` (+CRUD gói nạp quỹ) | Sửa |
| `features/Account/Admin/publisher-topup-packages/pages/AdminPublisherTopupPackagesPage.tsx` + hook (mới) | Mới |
| `features/Account/Admin/components/AdminLayout.tsx` (+menu "Gói nạp quỹ NPH") | Sửa |

## 2. Endpoint mới/sửa dùng ở màn này (chi tiết field xem tài liệu Backend mục 3.3)

| Method | Route | Auth | Ghi chú |
|---|---|---|---|
| GET | `/api/publisher/games` | JWT Publisher | Danh sách chiến dịch + tóm tắt |
| POST | `/api/publisher/games` | JWT Publisher | Tạo chiến dịch |
| PUT | `/api/publisher/games/{id}` | JWT Publisher | Sửa chiến dịch |
| POST | `/api/publisher/games/{id}/toggle-status` | JWT Publisher | Bật/tắt cả chiến dịch |
| GET | `/api/publisher/games/{id}/dashboard` | JWT Publisher | Ngân sách + hiệu quả |
| GET | `/api/publisher/tasks/{id}/participants` | JWT Publisher | Phân trang `page`/`pageSize` |
| GET | `/api/publisher/wallet/topup-packages` | JWT Publisher | Danh sách gói đang bật |
| POST | `/api/publisher/wallet/topup` | JWT Publisher | Thêm field tuỳ chọn `packageId` |
| GET/POST/PUT | `/api/admin/publisher-topup-packages` | JWT Admin | Admin CRUD gói |
| POST/PUT | `/api/publisher/tasks`, `/api/publisher/tasks/{id}` | JWT Publisher | Request thêm `gameId`, `requirementKeyword`; `requirementType` chấp nhận thêm 5 giá trị số nguyên `3..7` |

**Enum `RequirementType` đầy đủ sau nâng cấp** (số nguyên, không đổi 3 giá trị đầu):

| Giá trị | Tên | Ý nghĩa | Field liên quan |
|---|---|---|---|
| 0 | Level | Đạt cấp độ | `requirementTargetValue` |
| 1 | Playtime | Giờ chơi/ngày | `requirementHoursPerDay`, `requirementTargetValue` (số ngày) |
| 2 | Collection | Sưu tầm vật phẩm | `requirementItemNames`, `requirementTargetValue` |
| 3 | MatchCount | Số trận đấu | `requirementTargetValue` |
| 4 | DailyCheckin | Số ngày checkin | `requirementTargetValue` |
| 5 | VideoWatch | Số video/phút xem | `requirementTargetValue` |
| 6 | DownloadRetain | Số ngày giữ máy | `requirementTargetValue` |
| 7 | KeywordSearch | Tìm từ khoá | `requirementKeyword`, `requirementTargetValue` (mặc định 1) |

**Enum `GamePlatform`:** `0 = Web`, `1 = App`, `2 = Pc` (có thể chọn nhiều, dùng checkbox nhóm).

## 3. Thiết kế UI

### 3.1 `NphGamesPage` (route `/jgame/nph/chien-dich`)

Bảng: Tên game, Nền tảng (badge Web/App/PC), Ngân sách phân bổ, Đã chi, Còn lại (hoặc "Không giới
hạn" khi `allocatedBudgetJcoin=0`), Số nhiệm vụ, Trạng thái (Đang chạy/Đã tắt), Bật/Tắt, Thao tác Sửa
→ mở `NphGameDashboardPage`. Nút "Tạo chiến dịch mới" → form: tên, mô tả, nền tảng (checkbox), link
tải theo từng nền tảng đã chọn (chỉ hiện field tương ứng), icon + ảnh gallery (upload, tái dùng
component upload ảnh nhiệm vụ đã có), ngân sách phân bổ (input số, để trống/0 = không giới hạn).

### 3.2 `NphGameDashboardPage` (route `/jgame/nph/chien-dich/:id`)

Card tổng quan: Ngân sách/Đã chi/Còn lại (progress bar trực quan), Số nhiệm vụ, Tổng lượt đăng ký,
Tổng lượt hoàn thành, Tỷ lệ hoàn thành (%). Danh sách nhiệm vụ thuộc chiến dịch bên dưới (link tới
`NphTasksPage` lọc theo game).

### 3.3 `NphTasksPage` - mở rộng form

Thêm dropdown "Thuộc chiến dịch" (tuỳ chọn, để trống = nhiệm vụ độc lập, giữ đúng hành vi cũ). Dropdown
"Loại yêu cầu" thêm 5 lựa chọn mới; khi chọn `KeywordSearch` hiện thêm 1 input "Từ khoá cần tìm" (bắt
buộc). Bảng danh sách thêm cột "Chiến dịch" (tên game hoặc "Độc lập") + nút "Xem người tham gia" mở
`NphTaskParticipantsPage`.

### 3.4 `NphTaskParticipantsPage` (route `/jgame/nph/nhiem-vu/:id/nguoi-tham-gia`)

Bảng phân trang: Người chơi (tên + SĐT che theo `maskedPhone` trả sẵn từ BE, không tự che ở FE), Trạng
thái (badge Đang làm/Hoàn thành), Tiến độ (progress bar `currentValue/targetValue`, %), JCoin đã nhận,
Ngày đăng ký, Ngày hoàn thành.

### 3.5 `NphWalletPage` - thêm chọn gói

Trước ô nhập số tiền tự do, hiện danh sách gói (card: Tên gói, Số tiền, "+X JCoin thưởng" nếu có) từ
`GET /api/publisher/wallet/topup-packages`. Chọn 1 gói → khoá ô nhập tự do, gửi kèm `packageId`; bấm
"Nạp số tiền khác" → bỏ chọn gói, quay lại nhập tự do như hiện tại (không đổi hành vi cũ).

### 3.6 `PublisherIntegrationPage` (route công khai `/doi-tac/tich-hop-api`, không cần đăng nhập)

Trang giới thiệu tĩnh cho NPH mới tham khảo trước khi hợp tác - nội dung dựng từ
`Backend/JGameApi/Docs/Doi-tac-NPH/giao-thuc-webhook-tien-do-nhiem-vu.md` (giao thức webhook, chữ ký,
mã lỗi) và mục 7 tài liệu Backend `20260903-nc_nph-doi-tac-tu-phuc-vu.md` (danh sách endpoint tự phục
vụ): sơ đồ luồng (NPH tạo game → tạo nhiệm vụ → nạp quỹ → người chơi hoàn thành → webhook/đồng bộ →
nhận thưởng), bảng endpoint chính, ví dụ request/response webhook, nút CTA "Liên hệ hợp tác". Không
cần API Backend riêng - toàn bộ nội dung tĩnh viết cứng trong component.

### 3.7 `AdminPublisherTopupPackagesPage`

Bảng CRUD đơn giản (tên, số tiền, JCoin thưởng, bật/tắt) - tái dùng pattern
`features/Account/Admin/suppliers/pages/AdminSuppliersPage.tsx`.

## 4. Trình tự thực hiện

1. Types + `NphApiService` mở rộng (games, participants, topup-packages).
2. `NphGamesPage` + `NphGameDashboardPage` + route + menu.
3. Mở rộng `NphTasksPage` (chọn game, 5 loại yêu cầu mới) + `NphTaskParticipantsPage`.
4. Mở rộng `NphWalletPage` (chọn gói).
5. `PublisherIntegrationPage` (trang công khai, độc lập, không phụ thuộc luồng NPH đã đăng nhập).
6. Admin: `AdminPublisherTopupPackagesPage`.
7. Cập nhật governance Website nếu có skill design-system tương ứng (hiện Website chưa có, theo
   `01-kien-truc-tong-quan-workspace.md` mục 7.3 - tuân thủ bảng màu `jgame-theme.css` sẵn có, không
   tự tạo màu mới).

## 5. Checklist

- [ ] Tạo/sửa/bật-tắt chiến dịch - nhiệm vụ thuộc chiến dịch bị tắt biến mất khỏi trang công khai
- [ ] Tạo nhiệm vụ loại mới (đặc biệt KeywordSearch có field từ khoá) lưu đúng
- [ ] Xem người tham gia 1 nhiệm vụ - JCoin đã nhận hiện đúng sau khi hoàn thành
- [ ] Chọn gói nạp - số tiền tự động khoá theo gói, quỹ tăng đúng `amount + bonusJcoin` sau xác nhận
- [ ] Trang giới thiệu API mở được không cần đăng nhập
- [ ] Commit + push

## 6. Tham chiếu

- **Backend (đọc trước, nguồn hợp đồng API/DTO):** `Backend/JGameApi/Docs/Nang-cap/20260903-nc_nph-game-va-chien-dich.md`.
- **App (song song):** `App/Docs/Nang-cap/20260903-nc_nph-game-va-chien-dich.md`.
- **Cổng NPH nền tảng (đã duyệt/code trước, không thiết kế lại):** `20260903-nc_quan-tri-nha-phat-hanh-game.md`.
- Bảng màu/quy tắc giao diện dùng chung: `.claude/system-architect/01-kien-truc-tong-quan-workspace.md` mục 7.
