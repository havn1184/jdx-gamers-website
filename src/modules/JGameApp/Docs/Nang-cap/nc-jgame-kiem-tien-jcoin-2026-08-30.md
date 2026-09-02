# Tài liệu giải pháp — Phân hệ "Kiếm tiền" (Nhiệm vụ trải nghiệm/test game) + Ví JCoin

> Ngày: 2026-08-30 | Portal: **JGameApp**

## 0. Prompt gốc

> "tôi cần xây dựng thêm 1 menu mới là: Kiếm tiền. Trang này mô tả các nhiệm vụ cho user thực hiện các nhiệm vụ trải nghiệm game, test game. có game sẽ yêu cầu người chơi đạt cấp độ nào đó, có game sẽ yêu cầu hàng ngày vào chơi tối thiểu bao nhiêu giờ và chơi trong bao nhiêu ngày, có game thì yêu cầu phải sưu tập đủ món đồ nào đó. tùy từng yêu cầu, người chơi sẽ nhận đc số jcoin phù hợp. jcoin này có thể được dùng để mua thẻ nạp, mua vé giờ chơi, mua linh kiện nhưng không thể rút ra tiền mặt. Các nhiệm vụ đều có giới hạn số lượng và sẽ luôn up date số lượng người tham gia làm nhiệm vụ. [...] Hãy xây dựng giao diện trang mới này thật chuyên nghiệp. chú ý rằng, các game sẽ tự đồng bộ các trạng thái đạt được về jgame để hiển thị được trạng thái, tiến độ thực hiện được nhiệm vụ cũng như tiến độ thanh toán của nhà phát hành game đối với mỗi yêu cầu làm nhiệm vụ game"

## 1. Mô hình nghiệp vụ

**Nhiệm vụ (GameTask)**: do nhà phát hành game đăng tải, trả thưởng bằng **JCoin** (tiền ảo nội bộ JGame — không rút tiền mặt, chỉ tiêu trong hệ sinh thái JGame: Nạp thẻ / Chợ vé / Phụ kiện). Mỗi nhiệm vụ thuộc **1 trong 3 dạng yêu cầu**:

| Dạng | Yêu cầu | Ví dụ hiển thị tiến độ |
|---|---|---|
| **Đạt cấp độ** (`level`) | Đạt level X trong game | "Cấp độ hiện tại: 32/50" |
| **Thời lượng chơi** (`playtime`) | Chơi ≥ N giờ/ngày, đủ M ngày | "Ngày 4/7 · Hôm nay đã chơi 1.5/2 giờ" |
| **Sưu tập vật phẩm** (`collection`) | Thu thập đủ bộ item | "Đã thu thập 3/5 vật phẩm" |

**Đồng bộ**: Vì "game tự đồng bộ trạng thái về JGame", toàn bộ tiến độ (`UserTaskProgress`) được mô phỏng bằng 1 tiến trình nền (giống cơ chế slot Chợ vé GĐ2) tự cập nhật ngẫu nhiên theo thời gian + đúng dạng yêu cầu, kèm mốc "Đồng bộ lần cuối". Khi đạt đủ điều kiện → tự động chuyển trạng thái "Hoàn thành" và cộng JCoin vào ví.

**Thanh toán từ NPH**: Mỗi nhiệm vụ có `publisherFundStatus` (đã cấp quỹ JCoin cho đợt nhiệm vụ này hay chưa) — hiển thị badge tin cậy cho người chơi, tương tự cơ chế Công nợ ở Chủ Cybergame GĐ2.

**Giới hạn số lượng**: mỗi nhiệm vụ có `slotLimit`/`slotUsed`, tự tăng dần mô phỏng người khác đang đăng ký (cùng cơ chế timer nền GĐ2), hết slot → không đăng ký được nữa.

## 2. Quyết định thiết kế

| Quyết định | Lý do |
|---|---|
| Game trong nhiệm vụ dùng ảnh gradient+icon (như `CardArt` fallback), không sourcing ảnh thật | Đây là game/NPH hư cấu cho mục đích demo — khác trường hợp logo NCC thẻ thật (cần đúng thương hiệu để người dùng nhận diện); sourcing ảnh thật không cần thiết và có thể gây hiểu nhầm là game thật |
| JCoin: ví riêng (`mocks/jcoinWallet.store.ts`), 1 sổ giao dịch (earn/spend), KHÔNG liên kết cổng thanh toán thật | Đúng bản chất "không rút được tiền mặt" — chỉ là điểm số nội bộ |
| Tích hợp JCoin vào checkout: thêm tuỳ chọn **"Dùng số dư JCoin"** ở cả 3 luồng thanh toán (Nạp thẻ, Vé giờ chơi, Phụ kiện) — trừ tối đa `min(số dư, tổng tiền)`, phần còn lại vẫn qua QR như cũ | Đúng yêu cầu "có thể dùng để mua" — làm nhất quán ở cả 3 nơi thay vì chỉ 1 nơi |
| Trang "Kiếm tiền" độc lập, có 3 tab con: **Nhiệm vụ đang mở** / **Nhiệm vụ của tôi** / **Ví JCoin** | Tách bạch rõ 3 luồng thao tác chính, giống mô hình đã dùng ở Chủ Cybergame/Đối tác |
| Đăng ký nhiệm vụ yêu cầu đăng nhập (`requireAuth`), không cần hồ sơ riêng như Chủ Cybergame/Đối tác | Mọi khách hàng đều có thể làm nhiệm vụ ngay, không cần "đăng ký vai trò" trước |

## 3. Danh sách màn hình

| Mã | Trang | Route |
|---|---|---|
| SC-TASK-01 | Nhiệm vụ đang mở (marketplace) | `/jgame/kiem-tien` |
| SC-TASK-02 | Chi tiết nhiệm vụ + tiến độ | `/jgame/kiem-tien/:taskId` |
| SC-TASK-03 | Nhiệm vụ của tôi | `/jgame/kiem-tien/nhiem-vu-cua-toi` (requireAuth) |
| SC-TASK-04 | Ví JCoin (số dư + lịch sử giao dịch) | `/jgame/kiem-tien/vi-jcoin` (requireAuth) |

## 4. Dữ liệu & Mock

- `features/tasks/types/task.types.ts`: `GameTask`, `TaskRequirementType`, `UserTaskProgress`, `TaskStatus`, `JcoinTransaction`
- `mocks/gameTasks.store.ts`: seed ~9 nhiệm vụ (3 mỗi dạng), timer nền tăng `slotUsed` + tiến độ ngẫu nhiên cho người dùng đã đăng ký, tự chuyển `publisherFundStatus`
- `mocks/jcoinWallet.store.ts`: `getBalance(userId)`, `earn(userId, amount, reason)`, `spend(userId, amount, reason)`, `listTransactions(userId)` — seed số dư demo cho tài khoản khách hàng demo

## 5. File xử lý chính

```
JGameApp/
  features/tasks/                       # MỚI
    types/task.types.ts
    services/TaskApiService.ts
    hooks/ (useTaskMarketplace, useTaskDetail, useMyTasks, useJcoinWallet, useRegisterTask.page)
    components/TaskArt.tsx (gradient+icon theo dạng yêu cầu)
    pages/ (TasksMarketplacePage, TaskDetailPage, MyTasksPage, JcoinWalletPage)
  mocks/gameTasks.store.ts              # MỚI
  mocks/jcoinWallet.store.ts            # MỚI
  layout/StorefrontHeader.tsx           # SỬA — thêm nav "Kiếm tiền" + badge số dư JCoin
  routes/routeConfig.tsx                # SỬA — 4 route mới
  features/order/hooks/useOrderConfirm.page.ts        # SỬA — tuỳ chọn dùng JCoin
  features/playtime/hooks/useTicketReserve.page.ts    # SỬA — tuỳ chọn dùng JCoin
  features/accessories/hooks/useAccessoryCheckout.page.ts # SỬA — tuỳ chọn dùng JCoin
  (3 page tương ứng thêm UI toggle "Dùng số dư JCoin")
```

## 6. Checklist
- [ ] 3 dạng nhiệm vụ hiển thị đúng tiến độ tương ứng, tự cập nhật theo thời gian (đồng bộ mô phỏng)
- [ ] Số người tham gia (`slotUsed/slotLimit`) tự tăng, hết slot thì khoá đăng ký
- [ ] Hoàn thành nhiệm vụ → tự cộng JCoin vào ví, chuyển trạng thái "Đã nhận thưởng"
- [ ] Ví JCoin hiển thị đúng lịch sử earn/spend
- [ ] Áp dụng JCoin giảm trừ đúng ở cả 3 luồng thanh toán, trừ đúng số dư sau khi đặt hàng thành công
- [ ] `npm run type-check` sạch, Playwright không lỗi console/page

---
