# Kiếm tiền — Nhiệm vụ trải nghiệm game + Ví JCoin

> Route: `/jgame/kiem-tien` (marketplace nhiệm vụ, public), `/jgame/kiem-tien/:taskId` (chi tiết, public — tiến độ chỉ khi đã đăng nhập), `/jgame/kiem-tien/nhiem-vu-cua-toi` (nhiệm vụ đã đăng ký, cần đăng nhập), `/jgame/vi` (ví VND + JCoin, cần đăng nhập).
> Code: `features/Public/tasks/` (marketplace + detail + service/types/utils/components dùng chung), `features/Account/User/tasks/` (nhiệm vụ của tôi), `features/Public/wallet/` (ví).
> Backend thật: `JGameApi` (`/api/tasks*`, `/api/wallet*`) — nghiệp vụ gốc tại `Backend/.claude/business-rules/kiem-tien-jcoin.md`.
> Nguồn thiết kế: `Docs/Nang-cap/nc-jgame-kiem-tien-jcoin-2026-08-30.md` (APPROVED), `Docs/Nang-cap/20260902-nc_nhiem-vu-web-dong-bo.md` (đồng bộ nội dung với App, đã code 02/09/2026).
>
> **⚠️ Phân hệ này KHÔNG có trong URD gốc — phát sinh sau, cần đưa vào lần rà soát BA tiếp theo.**

## Mô hình nghiệp vụ

**Nhiệm vụ (`GameTask`)** do nhà phát hành game đăng tải, trả thưởng bằng **JCoin** — tiền ảo nội bộ JGame, **không rút được tiền mặt**, chỉ tiêu trong hệ sinh thái JGame (nạp thẻ / chợ vé / phụ kiện). Mỗi nhiệm vụ thuộc **1 trong 3 dạng yêu cầu**:

| Dạng (`TaskRequirementType`) | Yêu cầu | Đơn vị tiến độ |
|---|---|---|
| `level` — Cấp độ | Đạt cấp X trong game | "12/30 cấp" |
| `playtime` — Giờ chơi | Chơi ≥ N giờ/ngày, đủ M ngày | "3/7 ngày" |
| `collection` — Sưu tập | Thu thập đủ bộ vật phẩm | "2/5 vật phẩm" |

**Nguyên tắc câu chữ (đồng bộ App):** câu diễn giải yêu cầu (`requirementSummary`, VD "Chơi tối thiểu 2 giờ mỗi ngày, đủ 7 ngày"), `percent`, `status`, `milestones`, `events` đều do Backend tính và trả về — Website và App chỉ hiển thị, **không tự dựng câu hay ước lượng** (đã xoá `getEarnedSoFar` ước lượng JCoin tuyến tính).

## Chi tiết nhiệm vụ — thứ tự khối (giống App)

1. Tên game + badge quỹ NPH + chip trạng thái nhiệm vụ (Đang mở / Đã đóng / Hết suất / Hết hạn dd/MM).
2. Thưởng JCoin + "Còn X/Y suất" (đỏ nhấp nháy khi ≤ 5%) + hạn `endAt` nếu có.
3. "Nhiệm vụ này là gì?" — `description` + nút Tải Android / Tải iOS (chỉ khi BE có URL).
4. "Bạn cần đạt gì?" (`TaskRequirementCard`) — `requirementSummary` + chip mục tiêu / giờ mỗi ngày / hạn + danh sách vật phẩm.
5. "Các bước thực hiện" (`TaskStepsList`) — `steps[]` từ BE, stepper tô done/current/upcoming theo tiến độ (`getStepState`, cùng quy tắc với App); fallback 4 bước chung chỉ khi BE chưa trả `steps`.
6. "Tiến độ của bạn" (`TaskProgressPanel`, chỉ khi đã đăng nhập và đã đăng ký) — badge trạng thái, "3/7 ngày · 43%", progress bar có vạch mốc, danh sách mốc + thời điểm đạt, "Đồng bộ lần cuối" + nút **Đồng bộ ngay**, nhật ký 3 event mới nhất + "Xem tất cả". Hoàn thành: banner chúc mừng + thời điểm nhận thưởng + link Xem ví. Khách / chưa đăng ký: khối mờ mời đăng nhập / đăng ký.
7. Mã đăng ký (`registrationCode`, luôn hiển thị lại được, có nút Sao chép).
8. CTA: khách "Đăng nhập để đăng ký"; đã đăng nhập "Đăng ký nhiệm vụ" hoặc disabled "Đã đủ số lượng" / "Nhiệm vụ đã đóng" / "Đã hết hạn".

## Đồng bộ tiến độ

- Tiến độ do Backend cập nhật (worker mô phỏng ở DevLocal/Development, tắt ở Production chờ webhook NPH thật — xem Backend). Đạt đủ mục tiêu → BE tự chuyển `completed` và cộng JCoin vào ví (`rewardClaimedAt`).
- **Đồng bộ ngay** (`POST /api/tasks/{id}/progress/sync`): cooldown 60s ở FE khớp `Tasks:Simulation:ManualSyncMinIntervalSeconds` của BE; lỗi `TASK_SYNC_TOO_FREQUENT` hiện toast lỗi.
- Poll nền 15s (không còn 3s): chỉ khi có nhiệm vụ `inProgress`, dừng khi tab ẩn (`document.visibilityState`).

## Marketplace và Nhiệm vụ của tôi

- Marketplace lọc **server-side** (`GET /api/tasks?requirementType=&keyword=`, từ khoá debounce 400ms); card có câu yêu cầu từ BE, badge "Đã đăng ký" (khi đã đăng nhập) hoặc "Đã đóng"/"Đã hết hạn"; empty có nút "Xoá bộ lọc".
- Nhiệm vụ của tôi: **1 request** `GET /api/tasks/my` trả `{ task, progress }[]` (`MyTaskItem`) — không còn gọi N+1 `/progress` từng task; thẻ tổng quan (đang làm / hoàn thành / JCoin đã nhận = tổng `rewardJcoin` các item `completed`), tab Tất cả / Đang làm / Hoàn thành.

## Thanh toán từ nhà phát hành (publisher fund status)

Mỗi nhiệm vụ có `publisherFundStatus` (đã cấp quỹ JCoin cho đợt nhiệm vụ này hay chưa) — hiển thị badge tin cậy cho người chơi trước khi đăng ký, tương tự cơ chế Công nợ ở Chủ Cybergame (Chợ vé GĐ2).

## Giới hạn số lượng (slot) và thời hạn

`slotLimit`/`slotUsed`/`slotsLeft` từ BE (giữ chỗ atomic khi đăng ký); `status` `active|closed` và `endAt` — hết suất / đã đóng / hết hạn thì không đăng ký được.

## Ví (VND + JCoin)

Xem `features/Public/wallet/` và `Backend/.claude/system-architect/20260830-nc_vi-2-loai-tien-thanh-toan.md`: JCoin không quy đổi sang VND, dùng trả trực tiếp khi mua thẻ / vé / phụ kiện (chọn phương thức thanh toán ở checkout).

## Đăng ký nhiệm vụ

Yêu cầu đăng nhập — **không** cần hồ sơ riêng như Chủ Cybergame/Đối tác tiếp thị. BE trả `{ registrationCode }`; FE gọi lại `/progress` để có tiến độ đầy đủ và hiện mã ngay.

## Ảnh minh hoạ nhiệm vụ

Ưu tiên `galleryImages` từ BE (phục vụ tĩnh từ JGameApi); fallback gradient + icon (`TaskArt`) khi rỗng/lỗi ảnh.

## Chưa triển khai

- Chưa có tích hợp thật với nhà phát hành game (webhook nhận tiến độ) — Production hiện tắt worker mô phỏng nên tiến độ chỉ đổi khi có nguồn thật.
- Chưa có trang Admin quản lý nhiệm vụ (tạo/duyệt nhiệm vụ do NPH đăng) — dữ liệu seed từ `TaskSeeder` phía Backend.
