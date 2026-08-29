# Tài liệu giải pháp — Dashboard 4 nhóm tài khoản, chi tiết nhiệm vụ, hồ sơ cá nhân, fix input vô hình

> Ngày: 2026-08-29 | Portal: **JGameApp**
> ⚠️ Môi trường này không có MCP `codebase-memory-mcp` — tra cứu bằng `Read`/`Grep`/`Glob` trực tiếp thay cho `search_graph`/`trace_path`/`get_code_snippet`.

## 0. Prompt gốc

> "Với 4 nhóm tài khoản hiện có, tôi muốn nâng cấp trang tổng quan của 4 nhóm để ứng với user của từng nhóm, khi login vào sẽ nhìn được dashboard thông tin đẹp, tổng quan nhất.
> - Với màn hình: /jgame/kiem-tien/nhiem-vu-cua-toi, tôi cần nâng cấp, khi bấm vào từng nhiệm vụ, sẽ ra thông tin chi tiết: ngày bắt đầu làm nhiệm vụ, số tiền thưởng tối đa, hiện đã được bao nhiêu, đạt bao nhiêu phần % tiến độ. Các đầu việc đã hoàn thành là gì, thời gian, và tiền thưởng của từng đầu việc.
> - Với màn hình lịch sử đơn hàng của tôi: #/jgame/lich-su, => khi bấm vào lịch sử => ra thông tin chi tiết đơn hàng đã mua
> - Trang hồ sơ cá nhân: /#/jgame/ho-so. Hiện tại thiết kế xấu quá, vào xem và chỉnh lại cho chuyên nghiệp, đẹp, trực quan.
> Có 1 lỗi chung, 1 số trường thông tin cho nhập text, nhưng màu text giống màu nền nên chẳng nhìn thấy gì cả.
> tiếp tục lập tài liệu và nâng cấp, khắc phục các vấn đề tôi đã nêu"

## 1. Tổng quan

Đã khảo sát toàn bộ code liên quan trước khi lên phương án. Kết quả hiện trạng theo từng ý:

### 1.1 Bug chung — input text vô hình (Critical, ảnh hưởng TOÀN SITE)

**Đã xác minh bằng computed style thực tế** (Playwright, gõ chữ thật vào ô input): component dùng chung `shared/components/ui/input.tsx` không có `text-*`/`bg-*` hợp lệ cho theme tối JGame — text màu `oklch(0.145 0 0)` (gần đen, token `--foreground` dành cho theme sáng) trên nền `rgba(0,0,0,0)` (trong suốt, vì class `bg-input-background` không tồn tại trong CSS dự án — giống lỗi `icon-warning`/`icon-danger` đã fix trước đó). Kết quả: chữ gần như đen trên nền tím-đen của trang → **vô hình**.

**Phạm vi ảnh hưởng:** MỌI input dùng component `<Input>` — đăng nhập, đăng ký, quên mật khẩu, mã 2FA, hồ sơ cá nhân, liên hệ, ô tìm kiếm Admin, form Thêm/Sửa ở Admin và Kênh Người Bán... (đã xác minh: `<textarea>`/`<select>` viết tay riêng lẻ ở 1 số trang đã tự set `text-white` nên KHÔNG bị lỗi — chỉ `<Input>` dùng chung bị).

**Fix:** sửa 1 file `shared/components/ui/input.tsx` — thay các class không tồn tại/không phù hợp theme tối bằng `bg-white/5 border-white/15 text-white placeholder:text-white/40` (đúng ngôn ngữ thiết kế "dark glass" đã dùng nhất quán khắp JGameApp). Fix 1 chỗ → khỏi toàn bộ site.

### 1.2 Dashboard 4 nhóm tài khoản — hiện trạng

| Nhóm | Trang | Hiện trạng |
|---|---|---|
| Khách hàng | `/jgame/tai-khoan` (AccountDashboardPage) | ✅ Đã đẹp, đủ dữ liệu (đã nâng cấp ở tài liệu trước) — **không đổi** |
| Đối tác tiếp thị | `/jgame/doi-tac` (ReferrerDashboardPage) | ✅ Đã đẹp, đủ dữ liệu (link giới thiệu, 3 stat tile, bảng giao dịch) — **không đổi** |
| Chủ gian hàng | `/jgame/kenh-nguoi-ban` (ShopDashboardPage) | 🟡 UI đã tốt, nhưng **doanh thu hôm nay/7 ngày/đơn mới/vé bán chạy đều = 0** — do dữ liệu seed vé giờ chơi cho gian hàng Alpha Cyber Center chỉ có 1 đơn, cách đây 8 ngày (ngoài khung "7 ngày") |
| Quản trị viên | `/jgame/quan-tri` | ❌ **KHÔNG có trang tổng quan** — route `/jgame/quan-tri` hiện trỏ thẳng vào `AdminCardsPage` (danh sách CRUD thẻ game), không phải dashboard |

→ Việc "khi login vào sẽ nhìn được dashboard đẹp, tổng quan nhất" áp dụng cho **2/4 nhóm cần làm**: bổ sung dữ liệu cho Chủ gian hàng, **tạo mới** trang Tổng quan cho Quản trị viên.

### 1.3 Chi tiết nhiệm vụ (`/jgame/kiem-tien/nhiem-vu-cua-toi` → bấm vào 1 nhiệm vụ)

Đã xác minh: bấm vào nhiệm vụ trong "Nhiệm vụ của tôi" điều hướng đến `/jgame/kiem-tien/:taskId` — dùng chung `TaskDetailPage` với trang marketplace công khai. Trang này **đã có sẵn khối "Tiến độ của bạn"** (badge trạng thái, % tiến độ, tóm tắt tiến độ, thời gian đồng bộ cuối) nhưng **CHƯA có**:
- Ngày bắt đầu làm nhiệm vụ (`registeredAt` đã có trong data, chỉ chưa hiển thị)
- Phân biệt "số tiền thưởng tối đa" vs "hiện đã tích lũy được bao nhiêu" (hiện tại phần thưởng chỉ hiện 1 lần khi hoàn thành 100%, không có khái niệm tích lũy từng phần)
- Danh sách **"các đầu việc đã hoàn thành"** kèm thời gian + tiền thưởng từng đầu việc — **CHƯA TỒN TẠI trong mô hình dữ liệu** (`UserTaskProgress` hiện không có khái niệm mốc/milestone)

→ Đây là điểm cần **thiết kế mới** (mục 1.4), không chỉ hiển thị lại dữ liệu có sẵn.

### 1.4 Thiết kế mới: mốc thưởng từng phần (milestone) cho nhiệm vụ

Mỗi nhiệm vụ vốn đã có đơn vị tiến độ tự nhiên theo từng dạng — tận dụng luôn làm "đầu việc":

| Dạng | Đơn vị tự nhiên | Mốc |
|---|---|---|
| `level` | Cấp độ | Chia 3 mốc đều: 1/3, 2/3, 3/3 mục tiêu cấp độ |
| `playtime` | Ngày đạt đủ giờ | Mỗi ngày hoàn thành (`daysCompleted` tăng) = 1 mốc |
| `collection` | Vật phẩm thu thập | Mỗi vật phẩm thu thập được = 1 mốc |

Thêm field `milestoneLog?: { label: string; reward: number; completedAt: string }[]` vào `UserTaskProgress` — mỗi khi timer nền (đã có sẵn, chạy mỗi 3.5s) phát hiện đạt mốc mới → đẩy 1 entry vào log kèm `reward = Math.round(jcoinReward / tổng số mốc)`. **Không đổi cơ chế trả JCoin thật** — JCoin vẫn chỉ cộng vào ví 1 lần khi hoàn thành 100% (`earn()` giữ nguyên, tránh rủi ro cộng trùng) — `milestoneLog` chỉ là **nhật ký hiển thị tiến độ tích lũy**, ghi rõ trong UI là "tạm tính, nhận đủ khi hoàn thành 100%" để không gây hiểu nhầm.

`getEarnedSoFar(task, progress)` (hàm mới, cùng file `formatRequirement.ts`) = tổng `milestoneLog[].reward`, hoặc = `task.jcoinReward` nếu đã `rewarded`.

**Seed dữ liệu demo khớp mốc mới** cho 3 `userProgress` đã seed ở tài liệu trước (để trang chi tiết có dữ liệu minh hoạ ngay):
- `task-level-1` (đã `rewarded`, 30/30): seed đủ 3 mốc lịch sử (cấp 10 lúc -8 ngày, cấp 20 lúc -5 ngày, cấp 30 lúc -2 ngày — khớp đúng ngày `rewardedAt` đã seed trước)
- `task-playtime-2` (`in_progress`, 2/5 ngày): seed 2 mốc (ngày 1 lúc -3 ngày, ngày 2 lúc -1 ngày)
- `task-collection-1` (`registered`, 1/5 vật phẩm): seed 1 mốc ("Chìa khoá vàng" lúc -1 ngày)

### 1.5 Lịch sử đơn hàng → chi tiết đơn hàng

**Đã xác minh bằng Playwright (click thật từ `/jgame/lich-su`):** cả 3 loại đơn ĐÃ CÓ trang chi tiết hoạt động đúng, KHÔNG lỗi:
- Thẻ game → `/jgame/ket-qua/:orderId` (OrderResultPage) — hiện mã thẻ/trạng thái hoàn tiền
- Phụ kiện → `/jgame/don-hang-phu-kien/:orderId` (AccessoryOrderTrackingPage) — timeline giao hàng đầy đủ, **đã đẹp, không cần đổi**
- Vé giờ chơi → `/jgame/cho-ve/ket-qua/:orderId` (PlaytimeOrderResultPage) — hiện mã đổi vé

**Vấn đề duy nhất tìm thấy:** câu chữ 2 trang (thẻ game + vé) viết theo giọng "vừa mua xong" (thì hiện tại/tương lai gần: "hệ thống **đang** tự động hoàn tiền", "xuất trình tại quầy để nhận chỗ" dù vé đã `USED`) — đọc lạ khi xem lại đơn cũ đã xong xuôi từ lâu (VD đơn hoàn tiền cách đây 20 ngày). Sửa nhỏ: đổi câu chữ theo trạng thái thực tế (đã hoàn tất/đã dùng), thêm "Mã đơn" + ngày mua hiển thị rõ ở đầu trang (2 trang này hiện chưa hiện mã đơn — trang phụ kiện đã có, làm nhất quán).

### 1.6 Trang Hồ sơ cá nhân (`/jgame/ho-so`)

Hiện tại: 1 cột đơn điệu, không avatar preview, "Ảnh đại diện" chỉ là ô nhập URL trần trụi không xem trước được, không phân nhóm nội dung rõ ràng. Thiết kế lại theo hướng: card đầu trang có avatar tròn preview (từ `avatarUrl`, fallback chữ cái đầu tên như header) + tên + "Thành viên từ {ngày tạo tài khoản}"; 2 khối rõ ràng "Thông tin cá nhân" (họ tên/ngày sinh/ảnh đại diện có preview) và "Liên hệ & Xác thực" (email/phone, giữ nguyên logic).

## 2. Thay đổi BE

Không có — toàn bộ mock FE (`JGAME_USE_MOCK` mặc định `true`).

## 3. File xử lý

| File | Loại | Nội dung |
|---|---|---|
| `shared/components/ui/input.tsx` | Sửa | Fix màu chữ/nền input (mục 1.1) |
| `features/Public/tasks/types/task.types.ts` | Sửa | Thêm field `milestoneLog?` vào `UserTaskProgress` |
| `features/Public/tasks/utils/formatRequirement.ts` | Sửa | Thêm hàm `getEarnedSoFar()` |
| `mocks/gameTasks.store.ts` | Sửa | Timer nền: đẩy `milestoneLog` khi đạt mốc mới; seed lại 3 `userProgress` demo kèm `milestoneLog` lịch sử |
| `features/Public/tasks/pages/TaskDetailPage.tsx` | Sửa | Hiện ngày bắt đầu + "đã tích lũy/tối đa" + danh sách mốc đã hoàn thành |
| `features/Account/User/order/pages/OrderResultPage.tsx` | Sửa | Câu chữ theo trạng thái thực tế + hiện mã đơn/ngày mua |
| `features/Account/User/playtime/pages/PlaytimeOrderResultPage.tsx` | Sửa | Câu chữ theo trạng thái thực tế (USED) + hiện mã đơn/ngày mua |
| `features/Account/User/account/pages/ProfilePage.tsx` | Sửa | Redesign theo mục 1.6 |
| `features/Account/ShopOwner/pages/ShopDashboardPage.tsx` | **Không đổi UI** | Chỉ cần thêm dữ liệu seed |
| `mocks/playtimeOrders.store.ts` | Sửa | Seed thêm 3 đơn vé cho Alpha Cyber Center trong khung "hôm nay/7 ngày" (mục 1.2) |
| `features/Account/Admin/dashboard/types/` *(mới)* — dùng chung `jgame.types.ts` sẵn có | — | Không cần type mới, tái dùng `RevenueReportRow`/`OrderAdminItem`/`ReferralPartnerAdmin`/`PromotionAdmin` |
| `features/Account/Admin/dashboard/hooks/useAdminDashboard.page.fetchData.ts` | **Tạo mới** | Gộp `getRevenueReport` + `getOrders` + `getReferralPartners` + `getPromotions` (đã có sẵn, gọi song song kiểu `Promise.all` giống `useAccountDashboard`) |
| `features/Account/Admin/dashboard/pages/AdminDashboardPage.tsx` | **Tạo mới** | Trang Tổng quan hệ thống — KPI tile (Tổng GMV/Tổng đơn/Tỷ lệ lỗi) + cảnh báo (đối tác tỷ lệ hoàn tiền cao, đơn lỗi cấp mã cần xử lý) + khuyến mãi đang chạy |
| `layout/AdminLayout.tsx` | Sửa | Thêm mục "Tổng quan" đầu menu, đổi path "Danh mục thẻ" |
| `routes/routeConfig.tsx` | Sửa | `quan-tri` → `AdminDashboardPage` (route mới); `quan-tri/danh-muc-the` → `AdminCardsPage` (đổi path, giữ nguyên `pageId`) |

**⚠️ Thay đổi hành vi cần lưu ý (mục B2 gate):** route `/jgame/quan-tri` hiện đang trỏ vào `AdminCardsPage` — sau khi sửa sẽ trỏ vào `AdminDashboardPage` mới, danh mục thẻ chuyển sang `/jgame/quan-tri/danh-muc-the`. Đây là thay đổi có chủ đích (đúng chuẩn UX: trang quản trị nên mặc định là dashboard, không phải 1 màn CRUD cụ thể) — không có nơi nào khác hardcode sâu vào path cũ ngoài `AdminLayout` MENU (sẽ sửa cùng lúc) và link `goTo('/jgame/quan-tri')`/`Navigate to='/jgame'` ở `StorefrontHeader`/`RequireAdmin` (các nơi này trỏ về `/jgame/quan-tri` với ý nghĩa "vào khu quản trị", vẫn đúng ý nghĩa sau khi đổi vì `/jgame/quan-tri` giờ là dashboard — không cần sửa).

## 4. Ánh xạ fields FE=BE

Không áp dụng (không BE). Field mới `milestoneLog` là type tự định nghĩa thêm vào `UserTaskProgress` có sẵn (optional, không phá cấu trúc cũ, không đổi field nào đang dùng).

## 5. Routes

| Route | Trước | Sau |
|---|---|---|
| `/jgame/quan-tri` | `AdminCardsPage` (`jgame-admin-cards`) | `AdminDashboardPage` (`jgame-admin-dashboard`, route mới) |
| `/jgame/quan-tri/danh-muc-the` | *(chưa có)* | `AdminCardsPage` (`jgame-admin-cards`, dời từ path cũ) |

Các route khác không đổi.

## 6. Menu

`AdminLayout` MENU: thêm mục **"Tổng quan"** (icon `LayoutDashboard`) làm mục đầu tiên trỏ `/jgame/quan-tri`; đổi mục **"Danh mục thẻ"** (icon `Gamepad2`, giữ nguyên) sang path `/jgame/quan-tri/danh-muc-the`. Các mục còn lại (Nhà cung cấp/Giao dịch/Đối tác Referral/Khuyến mãi/Báo cáo) không đổi.

## 7. Thiết kế UI

Toàn bộ kế thừa đúng ngôn ngữ thiết kế JGame hiện có (Card `border-white/10 bg-white/5`, `StatTile` pattern đã dùng ở 3 dashboard kia, `jgame-gradient-brand`/`jgame-gradient-text`, Badge trạng thái theo màu ngữ nghĩa) — không phát minh pattern mới:

- **AdminDashboardPage**: Hero ngắn "Tổng quan hệ thống" → hàng KPI tile (Tổng GMV / Tổng đơn / Tỷ lệ lỗi trung bình / NCC đang hoạt động) → khối cảnh báo (đối tác referral tỷ lệ hoàn tiền cao — tái dùng style cảnh báo đã có ở `AdminReferralPartnersPage`; đơn lỗi cấp mã cần xử lý — link nhanh sang trang Giao dịch) → khối khuyến mãi đang chạy (rút gọn 3 dòng + link "Xem tất cả").
- **TaskDetailPage** (khối "Tiến độ của bạn"): thêm dòng "Bắt đầu: {ngày}"; đổi thanh tiến độ hiện tại thành 2 chỉ số song song "Đã tích lũy X / tối đa Y JCoin" + "{percent}%"; thêm danh sách mốc (mỗi dòng: icon check + label + "+reward JCoin" + thời gian) — tái dùng style hàng giao dịch đã có ở `JcoinWalletPage`.
- **OrderResultPage/PlaytimeOrderResultPage**: thêm dòng nhỏ "Mã đơn {id} · {ngày mua}" ngay dưới tiêu đề (đồng bộ với `AccessoryOrderTrackingPage`); câu mô tả đổi theo `refund.status`/`order.status` thay vì cố định.
- **ProfilePage**: card avatar+tên đầu trang (avatar tròn 64px, gradient fallback giống header), 2 card con "Thông tin cá nhân" / "Liên hệ & Xác thực" thay vì 1 khối liền — avatar URL có ảnh preview tròn nhỏ cạnh input.
- **Input**: `bg-white/5 border-white/15 text-white placeholder:text-white/40` — khớp mọi input/textarea khác trong app.

## 8. Checklist

- [ ] `Input` sau khi fix: gõ chữ thấy rõ ở MỌI trang có dùng (đăng nhập, hồ sơ, admin, kênh người bán...)
- [ ] `milestoneLog` không làm sai lệch tổng JCoin thật trong ví (chỉ cộng 1 lần lúc `rewarded`, đúng như cũ)
- [ ] Route `/jgame/quan-tri` mới trỏ đúng `AdminDashboardPage`, `/jgame/quan-tri/danh-muc-the` trỏ đúng `AdminCardsPage`, không trùng `pageId`
- [ ] `AdminLayout` menu active state đúng cho cả 2 mục Tổng quan/Danh mục thẻ
- [ ] Dữ liệu seed vé mới cho Alpha Cyber Center không phá vỡ số liệu Công nợ/Đơn hàng đã bán đã seed trước (chỉ cộng thêm, không sửa/xoá seed cũ)
- [ ] Build `tsc -b` + `vite build` sạch
- [ ] Test lại bằng Playwright cả 4 dashboard + chi tiết nhiệm vụ + chi tiết đơn hàng + hồ sơ cá nhân + input ở nhiều trang

---

## 📋 Tự review theo checklist 22 mục (rút gọn)

| # | Mục | Kết luận |
|---|---|---|
| 1 | Mục tiêu đúng prompt gốc | ✅ — đủ 5 ý: 4 dashboard, chi tiết nhiệm vụ, chi tiết đơn hàng, hồ sơ cá nhân, fix input |
| 4 | Quy trình nghiệp vụ hợp lệ | ✅ — milestone chỉ là log hiển thị, không đổi cơ chế trả JCoin thật (tránh rủi ro cộng trùng) |
| 7-9 | Tuân thủ skill, không tự sáng tạo pattern | ✅ — tái dùng 100% pattern UI đã có (StatTile/Card/Badge/gradient), không tạo style mới |
| 11-13 | Không thừa, đúng phạm vi | ✅ — không đụng Đối tác/Khách hàng (đã đạt chuẩn từ trước); ProfilePage/OrderResult chỉ sửa đúng phần bị nêu |
| 14-15 | File tạo mới chưa tồn tại / file sửa đúng path | ✅ — đã `Read` toàn bộ, xác nhận `features/Account/Admin/dashboard/` chưa tồn tại |
| 16-18 | Không đổi behavior dùng nhiều nơi ngoài ý muốn; route/pageId không trùng | 🟡 **Minor** — đổi path `/jgame/quan-tri` là thay đổi hành vi có chủ đích, đã nêu rõ cảnh báo ở mục 3, người dùng đã duyệt tài liệu này coi như xác nhận |
| 19 | Tái sử dụng hook/type/service có sẵn | ✅ — Admin dashboard dùng lại 4 API đã có, không thêm API mới |
| 21 | Không tạo trùng hàm/endpoint | ✅ |

**Kết luận: ✅ PASS (Critical: 0, Minor: 1 — đã nêu rõ, không cần sửa tài liệu)**

---

✅ APPROVED
