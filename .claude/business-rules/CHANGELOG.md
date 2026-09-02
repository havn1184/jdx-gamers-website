# Changelog — business-rules (JGameApp)

> Phiên bản hiện tại: **v1.1.1** (2026-09-02)
>
> **Quy tắc bắt buộc:** mỗi khi nội dung nghiệp vụ trong bất kỳ file nào của `Website/.claude/business-rules/` thay đổi (thêm/sửa/xoá nghiệp vụ, đổi luồng, đổi state machine, đổi mô hình vai trò...) do 1 thay đổi **đã được duyệt** (approved trong `Docs/Nang-cap/` hoặc do user yêu cầu trực tiếp) — PHẢI:
> 1. Bump version (semver: `MAJOR.MINOR.PATCH` — MAJOR khi đổi mô hình nghiệp vụ/breaking, MINOR khi thêm nghiệp vụ mới, PATCH khi sửa/làm rõ nội dung đã có).
> 2. Thêm 1 dòng vào bảng bên dưới: **thời gian, version, nội dung thay đổi, tài liệu/file liên quan**.
> 3. Cập nhật dòng "Phiên bản hiện tại" ở đầu file này.
>
> Xem quy trình đầy đủ tại `Website/.claude/skills/checklist-sau-code/SKILL.md` § Cập nhật tài liệu nghiệp vụ/kiến trúc.

| Thời gian | Version | Nội dung thay đổi | Tài liệu/file liên quan |
|---|---|---|---|
| 2026-09-02 | v1.1.1 | Đơn thẻ hiện logo thương hiệu (CardArt từ field denormalize), tracking phụ kiện hiện ngày giao dự kiến từ Backend — xem `Backend/JGameApi/Docs/Nang-cap/20260902-nc_du-lieu-don-hang-va-webhook-nph.md` | `nap-the-game.md`, `phu-kien-gamer.md` |
| 2026-09-02 | v1.1.0 | Kiếm tiền/JCoin: mô tả lại theo Backend thật — câu yêu cầu/percent/status/mốc/nhật ký do BE tính (bỏ ước lượng FE), chi tiết nhiệm vụ 8 khối đồng bộ App, nút "Đồng bộ ngay" (cooldown 60s), marketplace lọc server-side, Nhiệm vụ của tôi 1 request `{task, progress}[]`, poll 15s dừng khi tab ẩn — xem `Docs/Nang-cap/20260902-nc_nhiem-vu-web-dong-bo.md` | `kiem-tien-jcoin.md` |
| 2026-08-30 | v1.0.0 | Khởi tạo bộ tài liệu nghiệp vụ business-rules cho JGameApp — đối chiếu URD gốc với hiện trạng code thực tế (4 phân hệ chính: nạp thẻ, chợ vé cybergame, phụ kiện gamer, kiếm tiền/JCoin; 2 phân hệ nền tảng: tài khoản, đối tác tiếp thị, quản trị admin) | `00-tong-quan.md`, `auth-tai-khoan.md`, `nap-the-game.md`, `cho-ve-cybergame.md`, `phu-kien-gamer.md`, `kiem-tien-jcoin.md`, `doi-tac-tiep-thi.md`, `quan-tri-admin.md` |
