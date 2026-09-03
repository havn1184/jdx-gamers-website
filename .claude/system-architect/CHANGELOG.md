# Changelog — system-architect (JGameApp)

> Phiên bản hiện tại: **v1.4.0** (2026-09-02)
>
> **Quy tắc bắt buộc:** mỗi khi nội dung kiến trúc trong bất kỳ file nào của `Website/.claude/system-architect/` thay đổi (đổi cấu trúc thư mục, đổi cơ chế mock/API, đổi mô hình auth/phân quyền, đổi routing/layout, đổi pattern quản lý state...) do 1 thay đổi **đã được duyệt** (approved trong `Docs/Nang-cap/` hoặc do user yêu cầu trực tiếp) — PHẢI:
> 1. Bump version (semver: `MAJOR.MINOR.PATCH` — MAJOR khi đổi kiến trúc nền tảng/breaking, MINOR khi thêm cơ chế/thành phần kiến trúc mới, PATCH khi sửa/làm rõ nội dung đã có).
> 2. Thêm 1 dòng vào bảng bên dưới: **thời gian, version, nội dung thay đổi, tài liệu/file liên quan**.
> 3. Cập nhật dòng "Phiên bản hiện tại" ở đầu file này.
>
> Xem quy trình đầy đủ tại `Website/.claude/skills/checklist-sau-code/SKILL.md` § Cập nhật tài liệu nghiệp vụ/kiến trúc.

| Thời gian | Version | Nội dung thay đổi | Tài liệu/file liên quan |
|---|---|---|---|
| 2026-09-02 | v1.4.0 | Danh gia vé giờ chơi tu 1 rating tong the len 4 tieu chi (Ve sinh/Do an/Thai do phuc vu/Cau hinh may tinh, BE tu tinh tong the) - them trang `chu-cybergame/danh-gia` (ShopReviewsPage) va `quan-tri/danh-gia` (AdminReviewsPage), thong nhat lai cach tinh rating trung binh shop (truoc do PlaytimeService va ShopOwnerService tinh khac cach nhau) | cho-ve-cybergame.md, quan-tri-admin.md, routing-va-layout.md, 20260902-nc_danh-gia-phong-game-da-tieu-chi.md |
| 2026-09-02 | v1.3.0 | Sửa mô tả sai "chưa có backend thật" (BE JGameApi đã tồn tại, cờ `JGAME_USE_MOCK` đã bị xoá khỏi mockGate.ts, hầu hết ApiService đã gọi BE thật) - cập nhật danh sách 14 ApiService thực tế (thêm WalletApiService, PlaytimeTerminalApiService, NetbarboxConnectionApiService), sửa danh sách component UI dùng chung cho đúng thực tế (chỉ button/badge/input) | 00-tong-quan-kien-truc.md, mock-gate-va-api.md |
| 2026-09-02 | v1.2.0 | Them trang Quan tri "Tai khoan he thong" (`/jgame/quan-tri/tai-khoan`) - danh sach phan trang THAT server-side dau tien trong khu Admin JGameApp (cac trang CRUD danh muc cu deu loc phia FE), loc theo 4 nhom nghiep vu, khoa/mo khoa dang nhap, reset mat khau, xem so du vi (chi doc) | quan-tri-admin.md, routing-va-layout.md, AdminUsersPage.tsx, 20260902-nc_quan-tri-tai-khoan-he-thong.md |
| 2026-09-02 | v1.1.0 | StorefrontHeader dropdown avatar doi tu "luon hien Tai khoan cua toi + moi muc mua sam" sang theo NGU CANH tai khoan (AccountRole uu tien admin > Chu Cybergame > doi tac > khach hang, giong dieu huong sau dang nhap) - sua loi sai ngu canh khi dang nhap Chu Cybergame/Doi tac/Admin van thay menu khach hang thuong | routing-va-layout.md, StorefrontHeader.tsx |
| 2026-08-30 | v1.0.0 | Khởi tạo bộ tài liệu kiến trúc system-architect cho JGameApp — khảo sát mã nguồn thực tế (cấu trúc thư mục Public/Account, cơ chế mock gate, hệ thống auth độc lập, routing/layout, mock store & state) | `00-tong-quan-kien-truc.md`, `mock-gate-va-api.md`, `auth-va-phan-quyen.md`, `routing-va-layout.md`, `du-lieu-mock-va-state.md` |
