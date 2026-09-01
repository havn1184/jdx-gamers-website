# Kiếm tiền — Nhiệm vụ trải nghiệm game + Ví JCoin

> Route: `/jgame/kiem-tien` (marketplace nhiệm vụ), `/jgame/kiem-tien/:taskId` (chi tiết), `/jgame/kiem-tien/nhiem-vu-cua-toi` (nhiệm vụ đã đăng ký, cần đăng nhập), `/jgame/kiem-tien/vi-jcoin` (ví, cần đăng nhập).
> Code: `features/Public/tasks/` (marketplace, public), `features/Account/User/tasks/` (nhiệm vụ của tôi, ví — cần đăng nhập), `mocks/gameTasks.store.ts`, `mocks/jcoinWallet.store.ts`.
> Nguồn thiết kế: `Docs/Nang-cap/nc-jgame-kiem-tien-jcoin-2026-08-30.md` (✅ APPROVED).
>
> **⚠️ Phân hệ này KHÔNG có trong URD gốc — phát sinh sau, cần đưa vào lần rà soát BA tiếp theo.**

## Mô hình nghiệp vụ

**Nhiệm vụ (`GameTask`)** do nhà phát hành game đăng tải, trả thưởng bằng **JCoin** — tiền ảo nội bộ JGame, **không rút được tiền mặt**, chỉ tiêu trong hệ sinh thái JGame (nạp thẻ / chợ vé / phụ kiện). Mỗi nhiệm vụ thuộc **1 trong 3 dạng yêu cầu**:

| Dạng (`TaskRequirementType`) | Yêu cầu | Cách hiển thị tiến độ |
|---|---|---|
| `level` — Đạt cấp độ | Đạt level X trong game | "Cấp độ hiện tại: 32/50" |
| `playtime` — Thời lượng chơi | Chơi ≥ N giờ/ngày, đủ M ngày | "Ngày 4/7 · Hôm nay đã chơi 1.5/2 giờ" |
| `collection` — Sưu tập vật phẩm | Thu thập đủ bộ item | "Đã thu thập 3/5 vật phẩm" |

## Đồng bộ tiến độ (mock)

Vì "game tự đồng bộ trạng thái về JGame" là bối cảnh nghiệp vụ giả định (chưa có game/NPH thật nào tích hợp), tiến độ (`UserTaskProgress`) hiện được **mô phỏng bằng 1 tiến trình nền** tự cập nhật ngẫu nhiên theo thời gian, đúng dạng yêu cầu, kèm mốc "Đồng bộ lần cuối". Đạt đủ điều kiện → tự động chuyển "Hoàn thành" và cộng JCoin vào ví.

## Thanh toán từ nhà phát hành (publisher fund status)

Mỗi nhiệm vụ có `publisherFundStatus` (đã cấp quỹ JCoin cho đợt nhiệm vụ này hay chưa) — hiển thị badge tin cậy cho người chơi trước khi đăng ký, tương tự cơ chế Công nợ ở Kênh Người Bán (Chợ vé GĐ2).

## Giới hạn số lượng (slot)

Mỗi nhiệm vụ có `slotLimit`/`slotUsed`, tự tăng dần mô phỏng người khác đang đăng ký (cùng cơ chế timer nền của Chợ vé) — hết slot thì không đăng ký được nữa.

## Ví JCoin

- Sổ giao dịch riêng (`earn`/`spend`), **không liên kết cổng thanh toán thật** — đúng bản chất "không rút được tiền mặt", chỉ là điểm số nội bộ.
- Tích hợp vào checkout: tuỳ chọn **"Dùng số dư JCoin"** ở cả 3 luồng thanh toán (Nạp thẻ, Vé giờ chơi, Phụ kiện) — trừ tối đa `min(số dư, tổng tiền)`, phần còn lại vẫn qua QR như bình thường.

## Đăng ký nhiệm vụ

Yêu cầu đăng nhập (`requireAuth`) — **không** cần hồ sơ riêng như Chủ gian hàng/Đối tác tiếp thị (mọi khách hàng làm nhiệm vụ được ngay, không cần "đăng ký vai trò" trước).

## Ảnh minh hoạ nhiệm vụ

Dùng ảnh gradient + icon (không sourcing ảnh game thật) — vì game/nhà phát hành trong nhiệm vụ là hư cấu cho mục đích demo, khác với logo NCC thẻ game (cần đúng thương hiệu để người dùng nhận diện).

## Chưa triển khai

- Chưa có tích hợp thật nào với "nhà phát hành game" — toàn bộ dữ liệu nhiệm vụ và tiến độ là mock cố định + timer giả lập, chưa có API/webhook nhận đồng bộ trạng thái từ game thật.
- Chưa có trang Admin quản lý nhiệm vụ (tạo/duyệt nhiệm vụ do NPH đăng) — hiện danh sách nhiệm vụ chỉ seed cứng trong `mocks/gameTasks.store.ts`.
