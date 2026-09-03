# Cơ chế Mock Gate & API Service

> File lõi: `shared/services/api/mockGate.ts`, `shared/services/api/ApiConfig.ts`, `shared/services/api/ApiClient.ts`.
> **Đây là điểm quan trọng nhất cần hiểu trước khi sửa bất kỳ ApiService nào trong JGameApp** — toàn bộ 14 `*ApiService.ts` trong module từng tuân theo pattern gate mock dưới đây; hiện phần lớn đã chuyển sang gọi BE thật, chỉ còn 2 điểm lẻ vẫn dùng mock.

## Vì sao có mock gate (bối cảnh trước đây — không còn đúng toàn bộ)

Backend thật cho JGame (`Backend/JGameApi`) **đã tồn tại và đã tích hợp thật với hầu hết các phân hệ**. Cờ toàn cục `JGAME_USE_MOCK` từng dùng để mọi ApiService rẽ nhánh qua **1 điểm gate mock duy nhất** đã **bị xoá khỏi `mockGate.ts`** (`20260902-nc_admin-crud-that-thay-mock.md`) — không còn nơi nào rẽ nhánh theo cờ này. `mockApiCall`/`mockApiError` hiện chỉ còn dùng cục bộ (không qua cờ toàn cục) tại 2 chỗ cụ thể (xem mục "Trạng thái hiện tại" bên dưới), vì BE chưa có endpoint tương ứng.

## Bật/tắt mock (đã lỗi thời — chỉ còn giá trị lịch sử)

```
VITE_JGAME_USE_MOCK=true|false     # KHÔNG còn được code đọc — biến này chỉ còn sót lại trong .env.development.local, không có tác dụng
VITE_JGAME_API_URL=https://jgameapi.vipgame.vn   # .env.production hiện trỏ thẳng BE thật
```

`mockGate.ts` không còn đọc biến `JGAME_USE_MOCK` nữa — mọi ApiService gọi thẳng `apiCall`/`buildJGameUrl` tới BE thật, trừ 2 method lẻ vẫn gọi trực tiếp `mockApiCall`/`mockApiError` không qua cờ nào.

## Trạng thái hiện tại theo phân hệ

- **Đã gọi BE thật hoàn toàn** (không còn `JGAME_USE_MOCK`/`mockApiCall` trong service): `CardApiService`, `OrderApiService`, `AuthApiService`, `AccountApiService`, `ReferrerApiService`, `PlaytimeApiService`, `AccessoryApiService`, `TaskApiService`, `WalletApiService`, `ContactApiService`, `PlaytimeTerminalApiService`, `NetbarboxConnectionApiService`. `ShopOwnerApiService` cũng đã BE thật toàn bộ (my-shop, register, updateShopProfile, setSyncMode, syncNow, dashboard, orders, confirm-used, payouts, CRUD Zone/Vé).
- **Vẫn còn dùng mock cục bộ** (2 chỗ, có lý do cụ thể ghi trong code):
  - `JGameApiServiceAdmin.manualResolveOrder` — BE chưa có endpoint xử lý thủ công đơn hàng.
  - `JGameApiServiceAdmin` — CRUD tạo/sửa/xoá đối tác Referral (`createReferralPartner`/`updateReferralPartner`/`deleteReferralPartner`) — BE hiện chỉ có API đọc, chưa có Create/Update/Delete.
- **`mocks/` chỉ còn 1 file**: `playtimeShops.store.ts` (trước đây có 13 file `*.store.ts`/`*.mock.ts`) — các file mock khác đã bị xoá khi phân hệ tương ứng chuyển sang BE thật.

## Danh sách 14 ApiService thực tế (tất cả static method)

| Service | Vị trí | Domain |
|---|---|---|
| `CardApiService` | `features/Public/catalog/services/` | Danh mục thẻ, mệnh giá |
| `OrderApiService` | `features/Account/User/order/services/` | createOrder, getPayment, getOrderStatus (polling), getCardCode, revealCardCode, getRefund, getMyOrders |
| `AuthApiService` | `features/Public/auth/services/` | register/login/OTP SĐT/2FA |
| `AccountApiService` | `features/Account/User/account/services/` | Hồ sơ, bảo mật |
| `ReferrerApiService` | `features/Account/Partner/services/` | getMyAffiliateStatus, register, summary, transactions |
| `ShopOwnerApiService` | `features/Account/ShopOwner/services/` | Chủ Cybergame (Chợ vé GĐ2) |
| `PlaytimeApiService` | `features/Public/playtime/services/` | Marketplace chợ vé |
| `PlaytimeTerminalApiService` | `features/Account/ShopOwner/services/` | Thiết bị/terminal Chủ Cybergame |
| `NetbarboxConnectionApiService` | `features/Account/ShopOwner/services/` | Kết nối nền tảng NetBarBox |
| `AccessoryApiService` | `features/Public/accessories/services/` | Phụ kiện (GĐ3) |
| `TaskApiService` | `features/Public/tasks/services/` | Nhiệm vụ |
| `WalletApiService` | `features/Public/wallet/services/` | Ví VND + JCoin |
| `ContactApiService` | `features/Public/static-pages/services/` | Form liên hệ |
| `JGameApiServiceAdmin` | `features/Account/Admin/services/` | ~23 method CRUD toàn bộ nghiệp vụ Admin |

## Checklist còn lại cần chuyển hẳn sang BE thật

1. `JGameApiServiceAdmin.manualResolveOrder` + CRUD đối tác Referral (create/update/delete) — chờ BE bổ sung endpoint tương ứng rồi bỏ `mockApiCall`/`mockApiError` tại 2 chỗ này.
2. Rà lại từng `mockApiError` còn sót — đảm bảo BE trả đúng mã lỗi/message tương tự khi có endpoint thật.
3. 2 nghiệp vụ **hoàn toàn chưa có mock UI** (không phải chỉ chưa nối BE thật): đối soát JGame–NCC–jPay (UC-13) và xuất hoá đơn J-Invoice (UC-14) — cần thiết kế từ đầu, không có gì để tham chiếu từ FE hiện tại.
4. OTP hiện chỉ `console.info` giả lập trong `AuthApiService.sendPhoneOtp()` — cần thay bằng gateway Zalo ZNS/SMS thật khi có BE.

## ⚠️ Lưu ý khi thêm ApiService mới

ApiService mới nên gọi thẳng BE thật qua `apiCall`/`buildJGameUrl` (`ApiConfig.ts`/`ApiClient.ts`). Chỉ dùng `mockApiCall`/`mockApiError` (`mockGate.ts`) khi BE thật sự chưa có endpoint — và phải ghi rõ lý do bằng comment tại chỗ gọi, giống 2 trường hợp hiện tại trong `JGameApiServiceAdmin`.
