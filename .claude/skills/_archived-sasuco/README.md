# Archive — Skill từ dự án SASUCO InvoiceEasy cũ

Các skill trong thư mục này thuộc dự án khác trước đó — **SASUCO InvoiceEasy**, một hệ thống kế toán/hóa đơn
có kiến trúc 9 portal độc lập (InvoiceApp, AdminApp, PartnerApp, SsoApp, KetoanApp, CrmApp, TaiSanApp, KiemThuApp,
BaseIndexApp), mỗi portal 1 git repo riêng.

**Dự án hiện tại (JDX-Gamers) không dùng các skill này** vì:
- `src/modules/` chỉ có 1 module duy nhất là `JGameApp` — không có kiến trúc đa-portal/đa-repo.
- Bộ component UI dùng chung mà nhiều skill ở đây giả định (Dialog, SearchCombobox, PagingUtils, ConfirmDialog,
  ValidationErrorDialog, DatePicker, `Dm*` component kit...) **không tồn tại** trong `shared/components/ui/` của
  JGameApp (chỉ có: button, card, badge, input, tabs, select, separator).
- Các quy ước đặt tên/route (suffix `Admin`, `/ketoan/<phan-he>/...`, NavMenu/TopMenu chuẩn 9-portal) không khớp
  với cách JGameApp thực sự tổ chức file (xem `Website/.claude/skills/cau-truc-du-an/SKILL.md` và
  `Website/.claude/system-architect/00-tong-quan-kien-truc.md` để biết cấu trúc thật).

**Không xóa** vì có thể còn giá trị tham khảo (VD: pattern reset state dialog, cách tổ chức merge nhiều repo) nếu
sau này JDX-Gamers phát triển thêm module mới có kiến trúc tương tự. Nhưng **không tự động nạp** các skill này khi
làm việc trong JGameApp — nếu 1 skill ở đây thực sự cần dùng lại, hãy đọc nội dung, xác nhận với user, và chuyển
phần còn phù hợp trở lại `Website/.claude/skills/` (ngoài thư mục archive) sau khi đã cập nhật cho đúng thực tế.

## Danh sách đã archive (2026-09-01)

Quy ước UI/dialog/master-page/naming kiểu KetoanApp: `dat-ten`, `date-input`, `filter-phan-trang`, `validate-input`,
`tich-hop-api-ui`, `test-ui`, `test-field-update`, `test-form-multi-tab`, `page-dialog-conventions`, `tao-master-page`,
`tao-phieu-thu`, `tao-chung-tu`, `tao-bao-cao`, `tao-dialog-full`, `tao-sddk-page`, `review-ui-convention`,
`update-action`, `tao-dialog-new`, `tao-dialog`, `tao-ui-dialog`, `tao-ui-master-page`, `tao-ui-giao-dien-new`,
`tao-ui-giao-dien`, `tao-ui-sub-page`, `ve-theo-template`, `tao-layout-navmenu-topmenu`, `tao-apiservice`,
`dialog-drawer-ui`, `tao-cay`, `clone-web-playwright`, `templates-for-skills`.

Quy trình đa-repo/multi-portal: `merge-code-from-devs`, `commit-local-push-server`, `export-menu-page-permission`,
`cach-refactor-kien-truc-doc-lap`, `update-tai-lieu-van-ban-hubdocs`, `optimize-skill-sasuco`.
