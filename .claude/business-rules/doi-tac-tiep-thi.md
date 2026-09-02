# Đối tác tiếp thị liên kết (Referrer / CTV)

> Route: `/jgame/doi-tac/dang-ky` (đăng ký), `/jgame/doi-tac` (dashboard), `/jgame/doi-tac/lien-ket` (quản lý đa liên kết), `/jgame/doi-tac/thanh-toan` (yêu cầu rút hoa hồng) — tất cả cần đăng nhập + đã đăng ký làm đối tác (trừ trang đăng ký).
> Route quản trị: `/jgame/quan-tri/doi-tac-referral` (danh sách đối tác + giao dịch), `/jgame/quan-tri/doi-tac-referral/thanh-toan` (duyệt yêu cầu rút), `/jgame/quan-tri/doi-tac-referral/ty-le-hoa-hong` (cấu hình tỷ lệ hoa hồng), `/jgame/quan-tri/doi-tac-referral/bao-cao` (báo cáo tổng hợp).
> Code: `features/Account/Partner/` (đối tác), `features/Account/Admin/referral/` (quản trị).
> Nguồn thiết kế: `Docs/Nang-cap/nc-jgame-chuyen-admin-ve-jgameapp-va-role-2026-08-29.md` mục 3.2 (bản đầu) + `Backend/JGameApi/Docs/Nang-cap/20260901-nc_doi-tac-tiep-thi-nang-cap.md` (nâng cấp đa liên kết + đo lường click/chuyển đổi + đối soát/thanh toán — nguồn tham chiếu kỹ thuật hiện hành).
> Quy tắc nghiệp vụ đầy đủ (dùng chung Web/App/Backend): `Backend/.claude/business-rules/doi-tac-tiep-thi.md`.

## Mô hình vai trò

**Không phải role loại trừ** — là 1 "hồ sơ" gắn thêm vào tài khoản Member đã có, xác định bằng bản ghi `AffiliatePartner.userId = userId`. 1 khách hàng có thể vừa mua hàng vừa là đối tác (giống mô hình Chủ Cybergame ở Chợ vé GĐ2).

## Đăng ký làm đối tác

Form: tên hiển thị, kênh quảng bá → tạo `AffiliatePartner` gắn `userId` hiện tại, tự sinh **liên kết mặc định** (mã giới thiệu + đường dẫn chia sẻ, không xoá được). Guard `RequireAffiliate` chặn dashboard khi chưa đăng ký, tự điều hướng sang trang đăng ký.

## Đa liên kết theo kênh quảng bá

Trang "Liên kết của tôi" (`/jgame/doi-tac/lien-ket`) cho phép tạo thêm nhiều liên kết ngoài liên kết mặc định — mỗi liên kết chọn 1 kênh quảng bá (Facebook/YouTube/TikTok/Zalo/Khác) + nhập 1 nhãn tự đặt để dễ nhận biết (VD "Bài viết Fanpage tháng 9"). Bảng liệt kê hiển thị theo từng liên kết: số click, số đơn, tỷ lệ chuyển đổi. Liên kết mặc định không có nút xoá.

## Ghi nhận nguồn referer & tính hoa hồng

1. Gắn mã referer vào URL truy cập (VD `jgame.vn/?ref=CODE`) → lưu trong `localStorage` trình duyệt (key `jgame_referrer`, hạn 30 ngày) — mô hình **last-click attribution**. Đồng thời gửi 1 lượt ghi nhận click về Backend (không chặn trải nghiệm nếu API lỗi/chậm).
2. Người dùng dùng nhiều mã referer khác nhau trong 1 phiên (của cùng đối tác hay khác đối tác) → mã **gần nhất trước khi hoàn tất thanh toán** được ghi nhận. Hàm dùng chung `getActiveReferrerCode()` (trong `shared/hooks/useReferrerAttribution.ts`) là nơi duy nhất mọi luồng đọc mã hiện có.
3. Hoàn tất đăng ký/thanh toán trong thời gian hiệu lực của mã → giao dịch gắn với đúng liên kết tương ứng, không phụ thuộc việc đăng ký tài khoản ngay lúc click hay sau đó.
4. Chỉ tính hoa hồng trên giao dịch ở trạng thái **thành công cuối cùng** (`SUCCESS`/`USED` tuỳ loại đơn) — không tính trên đơn hết hạn/đã hoàn tiền.
5. Giao dịch thành công sau đó bị khiếu nại/hoàn tiền thủ công → hoa hồng đã ghi nhận PHẢI được đảo (reverse) tương ứng.
6. **Mọi đơn hàng hoàn tất (Thẻ nạp/Vé giờ chơi/Phụ kiện) đều lưu lại mã referer vào chính đơn hàng đó để truy vết sau này** — kể cả khi không đủ điều kiện tính hoa hồng (mã không hợp lệ, hoặc loại đơn không tính hoa hồng như Phụ kiện).
7. **Phụ kiện gamer KHÔNG tính hoa hồng** — chỉ Thẻ nạp và Vé giờ chơi mới tạo giao dịch hoa hồng. Đây là quyết định phạm vi rõ ràng, không phải thiếu sót.
8. **Tỷ lệ hoa hồng nay cấu hình theo loại (Thẻ nạp/Vé giờ chơi), dùng chung toàn hệ thống** — không còn là tỷ lệ cố định 5% riêng từng đối tác như trước. Quản trị viên thay đổi qua trang cấu hình, có lưu lịch sử thay đổi.

## Dashboard đối tác

Dữ liệu lấy đúng theo `userId` đang đăng nhập — hiển thị: mã referral mặc định + link chia sẻ, tổng số đơn/hoa hồng, **bảng hiệu suất theo từng liên kết** (click/đơn/tỷ lệ chuyển đổi), bảng giao dịch gần đây theo trạng thái đối soát, lối vào 2 trang "Liên kết của tôi" và "Thanh toán".

## Thanh toán hoa hồng

Trang "Thanh toán" (`/jgame/doi-tac/thanh-toan`): hiển thị số tiền có thể rút (= tổng hoa hồng đã Confirmed trừ đi phần đã yêu cầu rút trước đó), form nhập số tiền muốn rút, và lịch sử các yêu cầu đã gửi kèm trạng thái (Chờ duyệt/Đã duyệt/Đã trả/Từ chối — có lý do khi bị từ chối). Việc chuyển tiền thật diễn ra NGOÀI hệ thống (quản trị viên tự chuyển khoản sau khi duyệt), hệ thống chỉ theo dõi trạng thái để minh bạch hai phía.

## Chưa triển khai

- Hoa hồng đa cấp (đại lý cấp 1/cấp 2, CTV giới thiệu CTV) — URD mục 6.6.5 xếp mức "Could have", chưa code.
- Cơ chế phát hiện gian lận nâng cao (theo dõi tỷ lệ hoàn tiền bất thường theo từng đối tác để cảnh báo Admin) — chặn tự mua qua link của chính mình đã có, giám sát tỷ lệ hoàn tiền theo thời gian thì chưa. Trang "Đối tác Referral" (`/jgame/quan-tri/doi-tac-referral`) có sẵn cột "Tỷ lệ hoàn tiền" nhưng BE (`AffiliatePartnerDocument`) chưa lưu số liệu này → FE map cứng `refundRatePercent = 0` (`mapAffiliatePartnerToAdmin` trong `JGameApiServiceAdmin.ts`), cảnh báo gian lận trên cột này hiện chưa có ý nghĩa thật.
- Hoa hồng từ hành động "hoàn thành nhiệm vụ" (nhận JCoin) của người được giới thiệu — quyết định phạm vi có chủ đích, chưa triển khai ở lần nâng cấp gần nhất.
- Cột "Trạng thái" đối tác ở trang quản trị luôn hiển thị "Đang hoạt động" — `AffiliatePartnerDocument` (Backend) không có field bật/tắt riêng đối tác, FE map cứng `status: 'active'` (mọi bản ghi trả về từ `GetAllAffiliatePartnersAsync` coi như đang hoạt động).

## Sự cố đã xử lý

- **2026-09-02** — tab "Giao dịch" trong `/jgame/quan-tri/doi-tac-referral` crash `result.data.map is not a function` khi bấm vào — cùng nguyên nhân với sự cố dưới đây: `getReferralTransactions` ép response `PagedResult<ReferralTransactionResponse>` thẳng thành mảng, thiếu `.items`. Nhân tiện phát hiện BE chưa từng trả `partnerId`/`partnerName` (cột "Đối tác" luôn rỗng) — đã bổ sung enrichment (`AffiliatePartnerRepository.GetByIdsAsync` batch lookup) vào `AdminService.GetAllReferralTransactionsAsync`, thêm 2 field vào `ReferralTransactionResponse.cs`. FE đọc `orderIdMasked` (trước đó vô tình đọc đúng field `orderId` — lộ id đơn thật ra UI Admin).
- **2026-09-02** — `/jgame/quan-tri/doi-tac-referral` và `/jgame/quan-tri/doi-tac-referral/bao-cao` crash trắng trang (`Cannot read properties of undefined (reading 'toFixed')`, `Object.entries(undefined)`). Nguyên nhân: 2 API GET (`getReferralPartners`, `getReferralReportSummary` trong `JGameApiServiceAdmin.ts`) đã nối dây BE thật nhưng vẫn ép kiểu response thẳng sang type FE thời mock cũ (`ReferralPartnerAdmin`, `ReferralReportSummaryAdmin`) — 2 type này có field (`name`/`status`/`refundRatePercent`, `totalCommission`/`totalCommissionByStatus`/`totalOwed`) không tồn tại trong DTO thật của Backend (`AffiliatePartnerResponse.cs`, `ReferralAdminReportResponse.cs`). Đã thêm mapper `mapAffiliatePartnerToAdmin`/`mapReferralReportSummary` chuyển đổi đúng field. Đã bổ sung `check-be-dto-fields.cjs` vào `check-all.cjs` (checklist-sau-code) để đối chiếu tự động field trong 1 interface `*Dto` (có JSDoc ghi rõ tên file Backend dạng `` `XxxResponse.cs` ``) với property thật trong Backend, tránh lặp lại lỗi đoán nhầm field tương tự.
