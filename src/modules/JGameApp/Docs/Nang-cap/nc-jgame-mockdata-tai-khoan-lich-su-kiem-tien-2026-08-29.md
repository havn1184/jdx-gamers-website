# Tài liệu giải pháp — Mockdata đầy đủ cho 4 trang tài khoản khách hàng

> Ngày: 2026-08-29 | Portal: **JGameApp**
> ⚠️ Môi trường này không có MCP `codebase-memory-mcp` — B1/B7 tra cứu bằng `Read`/`Grep`/`Glob` trực tiếp trên codebase thay cho `search_graph`/`trace_path`/`get_code_snippet`. Ghi nhận đây là sai khác bắt buộc so với quy tắc gốc (không có công cụ đó trong môi trường hiện tại).

## 0. Prompt gốc

> "Hoàn thiện giao diện cho các trang: #/jgame/kiem-tien/nhiem-vu-cua-toi, #/jgame/kiem-tien/vi-jcoin, #/jgame/lich-su, /#/jgame/tai-khoan. Cần tạo giao diện mockdata đầy đủ, trực quan. sử dụng ppt-nc-toan-trinh để áp dụng đúng quy định"

## 1. Tổng quan

**Hiện trạng (đã kiểm tra bằng Playwright ở lượt review UI trước):** cả 4 trang đã có UI hoàn chỉnh, đúng chuẩn thiết kế JGame (đã audit, không có lỗi console, layout/màu sắc nhất quán). Vấn đề duy nhất là **dữ liệu mock rỗng** cho tài khoản "Khách hàng Demo":

| Trang | Nguồn dữ liệu | Hiện trạng |
|---|---|---|
| `/jgame/tai-khoan` (AccountDashboardPage) | tổng hợp từ 5 store bên dưới | Đơn hàng gần đây: rỗng, tổng đơn = 0 |
| `/jgame/lich-su` (HistoryPage) | `orders.store`, `accessoryOrders.store`, `playtimeOrders.store` | Cả 3 tab (Thẻ game/Phụ kiện/Vé giờ chơi) đều "Chưa có giao dịch nào" |
| `/jgame/kiem-tien/nhiem-vu-cua-toi` (MyTasksPage) | `gameTasks.store` (`userProgress`) | "Bạn chưa đăng ký nhiệm vụ nào" |
| `/jgame/kiem-tien/vi-jcoin` (JcoinWalletPage) | `jcoinWallet.store` | Đã có sẵn 1.200.000 JCoin + 2 giao dịch (seed từ trước) — **đã đạt yêu cầu, giữ nguyên** |

**Nguyên nhân:** `orders.store.ts`, `accessoryOrders.store.ts`, `playtimeOrders.store.ts` chỉ tạo bản ghi qua luồng checkout thật (`createMockOrder`/`createMockAccessoryOrder`/`createMockPlaytimeOrder`), không có seed sẵn cho tài khoản demo — khác với `jcoinWallet.store.ts` đã seed đúng chuẩn. `gameTasks.store.ts` khai báo `userProgress: UserTaskProgress[] = []` tĩnh, không seed.

**Mục tiêu:** Seed dữ liệu demo trực tiếp vào 3 store còn thiếu (`orders`, `accessoryOrders`, `playtimeOrders`) + `gameTasks.store.ts` (`userProgress`), cho tài khoản `DEMO_ACCOUNTS.customer.id` — đúng theo mẫu đã có sẵn ở `jcoinWallet.store.ts`. **Không sửa bất kỳ file `.tsx` nào** (UI đã đúng chuẩn, chỉ thiếu data). Toàn bộ 4 trang mục tiêu dùng chung nguồn dữ liệu này nên tự động "đầy đủ, trực quan" sau khi seed — không cần đổi component.

**Điểm khác biệt so với `jcoinWallet.store.ts`:** 3 store này là **in-memory thuần** (`Map`/mảng), tự comment rõ "reset khi tải lại trang" (không như ví JCoin dùng `localStorage`) → seed bằng cách khởi tạo trực tiếp dữ liệu vào `Map`/mảng ngay sau khai báo, **không cần** cơ chế `seedXxxIfNeeded()` kiểm tra idempotent như ví JCoin (vì mỗi lần tải lại trang, state đã tự reset về rỗng rồi mới seed lại — không có nguy cơ seed trùng).

**Portal:** JGameApp | **shortName:** không đổi (dùng lại `tai-khoan`/`lich-su`/`kiem-tien` đã có).

## 2. Thay đổi BE

**Không có.** Toàn bộ 4 trang là mock thuần phía FE (`JGAME_USE_MOCK` mặc định `true`, xem `shared/services/api/mockGate.ts`), chưa có BE thật cho portal này.

## 3. File xử lý (chỉ SỬA, không tạo file mới)

| File | Thay đổi |
|---|---|
| `mocks/orders.store.ts` | Thêm 5 bản ghi `OrderRecord` demo (thẻ game) vào `store` ngay sau khai báo `const store = new Map<string, OrderRecord>()` |
| `mocks/accessoryOrders.store.ts` | Thêm 3 bản ghi `AccessoryOrder` demo (phụ kiện) vào `store` |
| `mocks/playtimeOrders.store.ts` | Thêm 3 bản ghi `PlaytimeOrder` demo (vé giờ chơi) vào `store` |
| `mocks/gameTasks.store.ts` | Thay `const userProgress: UserTaskProgress[] = []` bằng mảng đã seed 3 `UserTaskProgress` (đủ 3 trạng thái registered/in_progress/rewarded) |
| `features/Account/User/history/pages/HistoryPage.tsx` | Polish nhỏ (không bắt buộc, đi kèm luôn): thêm CTA "Nạp thẻ ngay" vào `EmptyState` — đồng bộ với `MyTasksPage`/`TasksMarketplacePage` đã có CTA khi rỗng, phòng trường hợp user thật chưa từng mua gì |

Không tạo file mới. Không sửa `jcoinWallet.store.ts` (đã seed sẵn, đạt yêu cầu).

## 4. Ánh xạ fields FE=BE

Không áp dụng (không có BE). Toàn bộ field seed dùng **đúng nguyên type đã định nghĩa sẵn**, không đổi/thêm field mới:
- `OrderRecord` (extends `OrderSummary`) — `features/Account/User/order/types/order.types.ts`
- `AccessoryOrder` — `features/Public/accessories/types/accessory.types.ts`
- `PlaytimeOrder` — `features/Public/playtime/types/playtime.types.ts`
- `UserTaskProgress` — `features/Public/tasks/types/task.types.ts`

### 4.1 Dữ liệu seed cụ thể

**`orders.store.ts`** (denomination lấy từ `cardProducts.mock.ts` — đúng id/mệnh giá catalog thật, không bịa):

| id | Thẻ | Mệnh giá | SL | Trạng thái | Thời gian |
|---|---|---|---|---|---|
| ORD-DEMO01 | Garena (`garena-100000`) | 100.000đ | 1 | SUCCESS (kèm serial/pin) | -2 ngày |
| ORD-DEMO02 | Zing/VNG (`zing-200000`) | 200.000đ | 1 | SUCCESS | -5 ngày |
| ORD-DEMO03 | VTC/Vcoin (`vcoin-50000`) | 50.000đ | 2 (=100.000đ) | SUCCESS | -9 ngày |
| ORD-DEMO04 | BIT (`bit-20000`) | 20.000đ | 1 | SUCCESS | -16 ngày |
| ORD-DEMO05 | Appota (`appota-card-100000`) | 100.000đ | 1 | REFUNDED (kèm `refundReason`, `refundedAt`) | -20 ngày |

**`accessoryOrders.store.ts`** (sản phẩm lấy từ `accessories.mock.ts`):

| id | Sản phẩm | Tổng tiền | Trạng thái | Thời gian |
|---|---|---|---|---|
| ACO-DEMO01 | Chuột Logitech G502 HERO ×1 | 990.000 + 30.000 ship = 1.020.000đ | DELIVERED | -6 ngày |
| ACO-DEMO02 | Bàn phím Corsair K70 RGB + Tai nghe HyperX Cloud II | 4.280.000 + 60.000 ship = 4.340.000đ | SHIPPING (kèm `trackingCode`) | -2 ngày |
| ACO-DEMO03 | Ghế Gaming DXRacer Formula ×1 | 4.290.000 + 30.000 ship = 4.320.000đ | PACKING | -1 ngày |

**`playtimeOrders.store.ts`** (shop/zone/ticket lấy từ `playtimeShops.store.ts` — đúng data thật của gian hàng, nhất quán với Trang chủ/Chợ vé):

| id | Gian hàng — Khu | Giờ | Trạng thái | Thời gian |
|---|---|---|---|---|
| PTK-DEMO01 | Alpha Cyber Center — Khu Thường (`tk-alpha-std-2h`) | 2h, 20.000đ | USED (kèm `redeemCode`) | -8 ngày |
| PTK-DEMO02 | Nova Gaming House — Khu VIP (`tk-nova-vip-2h`) | 2h ×2 = 60.000đ | CONFIRMED (kèm `redeemCode`) | -3 ngày |
| PTK-DEMO03 | Phoenix Esports Zone — Khu Thường (`tk-phoenix-std-2h`) | 2h, 18.000đ | CONFIRMED | -1 ngày |

**`gameTasks.store.ts`** (`userProgress`, khớp cả 3 dạng yêu cầu + khớp giao dịch JCoin đã seed sẵn):

| taskId | Trạng thái | Tiến độ | Ghi chú |
|---|---|---|---|
| `task-level-1` (Vũ Trụ Thần Thoại) | `rewarded`, `currentLevel: 30` | Hoàn thành | **Khớp đúng** giao dịch "+85.000 — Hoàn thành nhiệm vụ Đạt cấp độ 30 — Vũ Trụ Thần Thoại" đã có sẵn trong `jcoinWallet.store.ts` |
| `task-playtime-2` (Nông Trại Vui Vẻ 3D) | `in_progress`, `daysCompleted: 2`, `todayHours: 0.4` | 2/5 ngày | Minh hoạ dạng "thời lượng chơi" đang dở |
| `task-collection-1` (Đảo Kho Báu Kỳ Bí) | `registered`, `itemsCollected: ['Chìa khoá vàng']` | 1/5 vật phẩm | Minh hoạ dạng "sưu tập" mới bắt đầu |

→ Sau seed, `MyTasksPage` hiển thị đủ 3 badge trạng thái (Đã đăng ký/Đang thực hiện/Đã nhận thưởng); các entry `in_progress`/`registered` vẫn được timer nền (đã có sẵn, mỗi 3.5s) tiếp tục mô phỏng tiến độ tăng dần — đúng tinh thần "game tự đồng bộ trạng thái" đã thiết kế từ trước.

### 4.2 Tác động dây chuyền lên trang Tổng quan (`/jgame/tai-khoan`)

Không sửa code trang này — `useAccountDashboard.page.fetchData.ts` đã tự tổng hợp từ 3 API đơn hàng + API nhiệm vụ ở trên, nên sau khi seed sẽ tự động hiển thị: **Tổng đơn hàng = 11** (5+3+3), **Nhiệm vụ đang làm = 1**, **3 đơn hàng gần nhất** (sắp theo `createdAt` giảm dần, tự trộn cả 3 loại).

## 5. Routes

Không đổi — dùng nguyên route đã có: `/jgame/tai-khoan`, `/jgame/lich-su`, `/jgame/kiem-tien/nhiem-vu-cua-toi`, `/jgame/kiem-tien/vi-jcoin`.

## 6. Menu

**[C] Không đổi** — cả 4 tính năng đã có sẵn trong `CustomerLayout` sidebar, không thêm/đổi menu.

## 7. Thiết kế UI

**Không đổi UI hiện tại** — đã audit bằng Playwright (đăng nhập thật, chụp screenshot 4 trang), xác nhận layout/màu sắc/component đã đúng chuẩn `tao-ui-giao-dien` (Card, Badge, `jgame-gradient-brand`, format tiền tệ/ngày giờ nhất quán). Việc "hoàn thiện, trực quan" đạt được **hoàn toàn qua seed dữ liệu** — không cần đổi bố cục.

Riêng 1 polish nhỏ đi kèm (mục 3): `HistoryPage.tsx` — `EmptyState` hiện chỉ có icon + text tĩnh, trong khi `MyTasksPage`/`TasksMarketplacePage` đã có thêm link CTA khi rỗng. Thêm `<Link to='/jgame/nap-the'>Nạp thẻ ngay</Link>` vào `EmptyState` cho nhất quán (áp dụng cho cả 3 tab, link đích tuỳ tab: thẻ game → `/jgame/nap-the`, phụ kiện → `/jgame/phu-kien`, vé giờ chơi → `/jgame/cho-ve`).

## 8. Checklist — Field FE giống hệt định nghĩa type có sẵn

- [ ] `OrderRecord`/`AccessoryOrder`/`PlaytimeOrder`/`UserTaskProgress`: seed đủ field bắt buộc theo đúng interface, không thêm field lạ
- [ ] `denominationId`/`productId`/`ticketId`/`taskId` trong seed **phải tồn tại thật** trong `cardProducts.mock.ts`/`accessories.mock.ts`/`playtimeShops.store.ts`/`gameTasks.store.ts` (đã đối chiếu ở mục 4.1)
- [ ] `userId` seed = `DEMO_ACCOUNTS.customer.id` (import từ `authUsers.store.ts`, không hardcode chuỗi)
- [ ] Đơn `SUCCESS` (thẻ game) có đủ `serialFull`/`pinFull` để trang xem mã hoạt động được khi bấm vào
- [ ] Đơn `REFUNDED` có đủ `refundReason`/`refundedAt`
- [ ] Vé `USED`/`CONFIRMED` có đủ `redeemCode`
- [ ] Không seed trạng thái tạm thời cần timer đang chạy (`PENDING`/`PAID` cho thẻ & phụ kiện, `PENDING` cho vé) — tránh trang chi tiết/thanh toán bị "treo" vì không có `setTimeout` nào được lập lịch cho các bản ghi seed thẳng vào Map
- [ ] `task-level-1` seed khớp đúng giao dịch JCoin đã có sẵn (không tạo mâu thuẫn dữ liệu)
- [ ] Build `tsc -b` + `vite build` sạch sau khi seed
- [ ] Test lại bằng Playwright (đăng nhập tài khoản `customer` demo) — cả 4 trang hiển thị dữ liệu, không lỗi console

---

## 📋 Tự review theo checklist 22 mục (rút gọn theo B7)

| # | Mục | Kết luận |
|---|---|---|
| 1 | Mục tiêu đúng prompt gốc | ✅ — đúng 4 trang, đúng yêu cầu "mockdata đầy đủ, trực quan" |
| 2-3 | Endpoint/field đúng BE | N/A (không có BE) |
| 4 | Quy trình nghiệp vụ hợp lệ | ✅ — đối chiếu `createMockOrder`/`registerForTask` để seed đúng shape, không phá state machine (chỉ dùng trạng thái ổn định/kết thúc) |
| 7-9 | Tuân thủ skill, không tự sáng tạo pattern | ✅ — theo đúng mẫu `seedDemoWalletIfNeeded` đã có, dùng `dat-ten`/`cau-truc-du-an` hiện hành (không đổi tên file/thư mục) |
| 11-13 | Không thừa, đúng phạm vi tối thiểu | ✅ — chỉ sửa 4 file mock + 1 polish nhỏ liên quan trực tiếp, không đụng UI/route/menu khác |
| 14-15 | File sửa tồn tại đúng đường dẫn | ✅ — đã `Read` toàn bộ 4 file trước khi lên kế hoạch sửa |
| 16-17 | Không đổi behavior dùng nhiều nơi, không ảnh hưởng module khác | ✅ — chỉ *thêm* dữ liệu, không đổi hàm/API/type; đã kiểm `listMockOrdersByUser`/`listUserProgress`... không bị ảnh hưởng logic |
| 19 | Tái sử dụng type/hook có sẵn | ✅ — dùng nguyên `OrderRecord`/`AccessoryOrder`/`PlaytimeOrder`/`UserTaskProgress`, không tạo type mới |
| 21 | Không tạo trùng hàm | ✅ — không thêm hàm export mới (trừ có thể 1 hàm nội bộ khởi tạo seed nếu cần gọn code, không export) |

**Kết luận: ✅ PASS (Critical: 0, Minor: 0)**

---

✅ APPROVED
