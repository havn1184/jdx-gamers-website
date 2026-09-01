# Changelog — system-architect (JGameApp)

> Phiên bản hiện tại: **v1.0.0** (2026-08-30)
>
> **Quy tắc bắt buộc:** mỗi khi nội dung kiến trúc trong bất kỳ file nào của `Website/.claude/system-architect/` thay đổi (đổi cấu trúc thư mục, đổi cơ chế mock/API, đổi mô hình auth/phân quyền, đổi routing/layout, đổi pattern quản lý state...) do 1 thay đổi **đã được duyệt** (approved trong `Docs/Nang-cap/` hoặc do user yêu cầu trực tiếp) — PHẢI:
> 1. Bump version (semver: `MAJOR.MINOR.PATCH` — MAJOR khi đổi kiến trúc nền tảng/breaking, MINOR khi thêm cơ chế/thành phần kiến trúc mới, PATCH khi sửa/làm rõ nội dung đã có).
> 2. Thêm 1 dòng vào bảng bên dưới: **thời gian, version, nội dung thay đổi, tài liệu/file liên quan**.
> 3. Cập nhật dòng "Phiên bản hiện tại" ở đầu file này.
>
> Xem quy trình đầy đủ tại `Website/.claude/skills/checklist-sau-code/SKILL.md` § Cập nhật tài liệu nghiệp vụ/kiến trúc.

| Thời gian | Version | Nội dung thay đổi | Tài liệu/file liên quan |
|---|---|---|---|
| 2026-08-30 | v1.0.0 | Khởi tạo bộ tài liệu kiến trúc system-architect cho JGameApp — khảo sát mã nguồn thực tế (cấu trúc thư mục Public/Account, cơ chế mock gate, hệ thống auth độc lập, routing/layout, mock store & state) | `00-tong-quan-kien-truc.md`, `mock-gate-va-api.md`, `auth-va-phan-quyen.md`, `routing-va-layout.md`, `du-lieu-mock-va-state.md` |
