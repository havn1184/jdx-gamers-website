# Dữ liệu Mock & Quản lý State

> Thư mục: `src/modules/JGameApp/mocks/` (13 file), dùng chung toàn app, không tách theo Public/Account (xem [00-tong-quan-kien-truc.md](00-tong-quan-kien-truc.md)).

## Danh sách mock store

| File | Domain | Kiểu lưu |
|---|---|---|
| `cardProducts.mock.ts` | Danh mục thẻ + mệnh giá (GĐ1) | in-memory (dữ liệu tĩnh, không đổi) |
| `orders.store.ts` | Đơn hàng thẻ game + state machine | in-memory (`Map`, reset khi reload) |
| `authUsers.store.ts` | Tài khoản người dùng + 4 tài khoản demo (seed tự động) | **localStorage** (`jgame_auth_users_db`) |
| `loginHistory.store.ts` | Lịch sử đăng nhập/hoạt động | **localStorage** |
| `affiliatePartners.store.ts` | Đối tác tiếp thị (Referrer) | in-memory |
| `playtimeShops.store.ts` | Gian hàng/Zone/Vé chợ vé + timer slot realtime giả lập | in-memory (`setInterval` chạy nền) |
| `playtimeOrders.store.ts` | Đơn vé giờ chơi + state machine riêng | in-memory |
| `shopPayouts.mock.ts` | Công nợ/kỳ thanh toán Shop Owner | in-memory |
| `freeTicketClaims.store.ts` | Giới hạn 1 vé 0đ/người/tuần | **localStorage** (theo tuần ISO) |
| `accessories.mock.ts` | Danh mục sản phẩm phụ kiện | in-memory (dữ liệu tĩnh) |
| `accessoryOrders.store.ts` | Đơn hàng phụ kiện + state machine riêng (giao hàng vật lý) | in-memory |
| `gameTasks.store.ts` | Nhiệm vụ + tiến độ (timer nền cập nhật ngẫu nhiên) | in-memory |
| `jcoinWallet.store.ts` | Ví JCoin (earn/spend) | in-memory (seed số dư demo) |

## Nguyên tắc chọn in-memory vs localStorage

- **localStorage**: dữ liệu người dùng kỳ vọng "tồn tại thật" qua các lần ghé thăm — tài khoản đã đăng ký, lịch sử hoạt động, giỏ hàng, giới hạn vé 0đ/tuần (business rule thật, không được reset mỗi lần F5).
- **in-memory** (`Map`/mảng module-level): dữ liệu giao dịch/nghiệp vụ — chấp nhận mất khi reload vì mục tiêu là demo UI/luồng, không phải nguồn dữ liệu bền vững thay cho backend thật.

## Pattern chung của 1 mock store (vd. `orders.store.ts`)

- State giữ trong 1 `Map`/mảng ở module scope + biến đếm `seq` để sinh id tăng dần (`genId(prefix)`).
- Có hàm `seedDemo*()` chạy khi module load, gắn với `DEMO_ACCOUNTS.customer.id` (từ `authUsers.store.ts`) — để các trang Lịch sử/Dashboard có dữ liệu minh hoạ ngay khi đăng nhập bằng tài khoản demo, không cần tự thao tác trước.
- Các hàm đọc/ghi state được `ApiService` tương ứng gọi bên trong `mockApiCall(() => ...)` — factory **tính toán tại thời điểm gọi**, không cache, để phản ánh đúng state mock hiện tại (VD: slot vé vừa bị timer nền giảm đi).

## Timer nền (mô phỏng realtime)

2 domain có cơ chế `setInterval` chạy nền ngay khi module được import, không cần hành động của người dùng:

- `playtimeShops.store.ts` — mỗi 4-6 giây, chọn ngẫu nhiên 1-2 vé đang active và giảm `availableSlots` 1 đơn vị (không âm) — mô phỏng người khác đang mua. FE poll lại mỗi 3 giây để thấy số chỗ giảm dần trực tiếp.
- `gameTasks.store.ts` — tăng dần `slotUsed` + tiến độ ngẫu nhiên cho người dùng đã đăng ký nhiệm vụ, đúng theo dạng yêu cầu (level/playtime/collection) của từng nhiệm vụ.

Đây là cách mô phỏng URD FR-7.2.2 ("đẩy sự kiện realtime") **mà không cần WebSocket/SSE thật** — khi có backend thật, các hàm polling ở FE (`usePaymentStatus`, tương tự) giữ nguyên interface, chỉ đổi nguồn dữ liệu.

## `CartContext` — trường hợp đặc biệt duy nhất dùng React Context cho state nghiệp vụ

Giỏ hàng phụ kiện (`contexts/CartContext.tsx`) là domain **duy nhất** có giỏ hàng đa sản phẩm trong toàn app — quản lý qua Context (không phải mock store), persist `localStorage` (`jgame_cart`), API: `addItem/updateQuantity/removeItem/clear/totalAmount`. Thẻ game và vé giờ chơi **không** dùng giỏ hàng (mỗi đơn chốt ngay theo luồng "Đặt ngay") — xem lý do trong `business-rules/cho-ve-cybergame.md`.

## Khi chuyển sang backend thật

Không cần sửa `ApiService`/page/hook (đã tách qua mock gate — xem `mock-gate-va-api.md`) — chỉ cần **xoá dần** các file trong `mocks/` khi từng domain tương ứng đã có BE thật thay thế, và tắt `VITE_JGAME_USE_MOCK` theo từng giai đoạn nếu muốn chuyển dần domain-by-domain (lưu ý: hiện tại là 1 cờ toàn cục, muốn chuyển từng phần cần tách cờ theo domain).
