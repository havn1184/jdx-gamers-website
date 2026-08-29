# Skills Index — SASUCO InvoiceEasy (Website)

Danh sách toàn bộ skill hiện có trong `Website/.claude/skills/`. Agent đọc file này để xác định skill nào dùng cho yêu cầu nào.

---

## Nhóm: Nền tảng UI (Foundation)

Quy tắc UI dùng chung cho mọi loại giao diện — các skill khác đều kế thừa từ đây.

| Trigger keywords | Skill | Mô tả |
|-----------------|-------|-------|
| buttons btn-primary/btn-secondary, icon action, data-qa, format currency/date/number, SearchCombobox foreignKey, textarea invoice-textarea | [tao-ui-giao-dien](./tao-ui-giao-dien/SKILL.md) | Nền tảng UI dùng chung — mọi skill tao-master-page/tao-dialog/tao-ui-sub-page đều kế thừa |
| foundation KetoanApp, DmFormField, DmFormInput, DmFieldValue, TableSearchCombobox, className h-[30px]/rounded-lg | [tao-ui-giao-dien-new](./tao-ui-giao-dien-new/SKILL.md) | Nền tảng UI KetoanApp (cập nhật từ code thực tế PTDialog/KHFormDialog) |
| tạo dialog, DialogHeader, maxWidth bắt buộc, nút X custom, validate onBlur, view mode div | [tao-ui-dialog](./tao-ui-dialog/SKILL.md) | Quy tắc Dialog/Form nền tảng — load kèm tao-ui-giao-dien |
| tạo master page, table Thao tác, header bg, data-qa bắt buộc | [tao-ui-master-page](./tao-ui-master-page/SKILL.md) | Master Page nền tảng — load kèm tao-ui-giao-dien + filter-phan-trang |
| trang full-screen không dialog, breadcrumb, wizard nhiều bước, form quá nhiều field | [tao-ui-sub-page](./tao-ui-sub-page/SKILL.md) | Sub Page (trang chi tiết/wizard) — load kèm tao-ui-giao-dien |
| tạo dialog hoặc right drawer, test create/update từng bản ghi | [dialog-drawer-ui](./dialog-drawer-ui/SKILL.md) | Dialog hoặc Right Drawer cho CRUD — kế thừa tao-dialog-new, dùng Sheet cho drawer |
| file .page.tsx/Dialog.tsx/component, maxWidth dialog, nút X, data-qa | [page-dialog-conventions](./page-dialog-conventions/SKILL.md) | Quy tắc Page/Dialog/Component |
| viết custom hook use*.ts, page hook, dialog hook, data hook, reset state | [hook-conventions](./hook-conventions/SKILL.md) | Quy tắc viết custom hook |
| viết/sửa *ApiService.ts, apiCall(), buildApiUrl() | [api-service-conventions](./api-service-conventions/SKILL.md) | Quy tắc viết API Service |

---

## Nhóm: Tạo trang/Dialog nghiệp vụ (KetoanApp)

| Trigger keywords | Skill | Mô tả |
|-----------------|-------|-------|
| tạo dialog, sửa dialog, mô tả field bằng tiếng Việt hoặc ảnh | [tao-dialog](./tao-dialog/SKILL.md) | Tạo/sửa Dialog — tự đặt tên file theo dat-ten, đảm bảo reset data |
| dialog MỚI KetoanApp, Full-Screen Nghiệp Vụ, Dialog Danh Mục CRUD, 3 mode View/Create/Edit | [tao-dialog-new](./tao-dialog-new/SKILL.md) | 2 pattern dialog từ code thực tế (PTDialog/KHFormDialog) |
| dialog full-screen KetoanApp, EditableDataTable, Lưu & Ghi sổ | [tao-dialog-full](./tao-dialog-full/SKILL.md) | Dialog full-screen cho Phiếu thu/chi, Tiền gửi/vay |
| tạo/sửa Master Page KetoanApp, DmPageHeader, DmTable, bảng cây | [tao-master-page](./tao-master-page/SKILL.md) | Master Page KetoanApp — bảng phẳng/cấu hình cột/tree table |
| trang Phiếu thu/chi/Tiền gửi/vay, isPosted, ghi sổ | [tao-phieu-thu](./tao-phieu-thu/SKILL.md) | Extend tao-master-page — màu sắc theo trạng thái ghi sổ |
| trang Số Dư Đầu Kỳ, SDDK, Nhập số dư | [tao-sddk-page](./tao-sddk-page/SKILL.md) | Extend tao-master-page — không phân trang, dialog chung Create/Edit |
| trang Báo cáo, sổ sách, Drawer tham số, hàng Tổng cộng | [tao-bao-cao](./tao-bao-cao/SKILL.md) | Trang báo cáo — Drawer tham số + Master page kết quả |
| Tham chiếu chứng từ, ChonChungTuThamChieuDrawer, deep-link ?view={id} | [tao-chung-tu](./tao-chung-tu/SKILL.md) | Gắn field tham chiếu chứng từ vào dialog/drawer bất kỳ |
| hiển thị dạng cây, parentId, grade, combobox phân cấp | [tao-cay](./tao-cay/SKILL.md) | Chuyển danh sách phẳng → hiển thị cây |
| cập nhật cột Thao tác, Edit/Xóa/Nhân bản/Ngừng kích hoạt | [update-action](./update-action/SKILL.md) | Chuẩn hóa action cột thao tác — Pattern A/B/C |
| review UI, kiểm tra convention, soát lỗi UI KetoanApp | [review-ui-convention](./review-ui-convention/SKILL.md) | Đối chiếu UI với tao-ui-giao-dien-new + tao-phieu-thu |

---

## Nhóm: Quy tắc code & quy ước chung

| Trigger keywords | Skill | Mô tả |
|-----------------|-------|-------|
| TypeScript strict, tránh any, React hooks, import order, ApiLogger, không refactor ngoài phạm vi | [quy-tac-code](./quy-tac-code/SKILL.md) | Quy tắc code TypeScript/React |
| đặt tên Page/Dialog/Component/Hook/Service, shortName, Business vs Admin portal | [dat-ten](./dat-ten/SKILL.md) | Quy chuẩn đặt tên file |
| tổ chức modules/features/shared, đặt file vào portal nào | [cau-truc-du-an](./cau-truc-du-an/SKILL.md) | Cấu trúc thư mục dự án |
| trường ngày tháng, DatePicker, format yyyy-MM-dd/dd-MM-yyyy, dt_ prefix | [date-input](./date-input/SKILL.md) | Quy tắc nhập/hiển thị ngày tháng |
| validate form trước khi gọi API, inline error, progressive helper message, border đỏ/xanh | [validate-input](./validate-input/SKILL.md) | Validate input client-side |
| search/filter/pagination, useDebounce 800ms, PagingUtils, sessionStorage/localStorage | [filter-phan-trang](./filter-phan-trang/SKILL.md) | Filter & phân trang trang danh sách |
| TokenRefreshService, auto refresh access token, JWT decode, logout stop service | [refresh-token](./refresh-token/SKILL.md) | JWT refresh token service |
| nhiều tool call liên tiếp, giới hạn đọc file/MCP/Playwright, batching, checkpoint | [rate-limit-rules](./rate-limit-rules/SKILL.md) | Chống rate limit khi thao tác dài nhiều bước |
| replace_string_in_file, refactor, đổi tên biến, tránh mất Unicode/encoding | [sua-file-an-toan](./sua-file-an-toan/SKILL.md) | Quy tắc sửa file an toàn |

---

## Nhóm: API & tích hợp

| Trigger keywords | Skill | Mô tả |
|-----------------|-------|-------|
| viết ApiService từ backend docs, apiCall/buildApiUrl/ApiResponse/PagingInfo, Admin vs Business | [tao-apiservice](./tao-apiservice/SKILL.md) | Tạo API Service từ backend docs |
| tạo types/hooks kết nối API→UI, validate trước API, UI chỉ render | [tich-hop-api-ui](./tich-hop-api-ui/SKILL.md) | Tích hợp API Service vào UI |
| tra cứu request/response API, tìm endpoint, projectCode, auth requirements | [doc-check](./doc-check/SKILL.md) | Tra cứu đặc tả API endpoint |

---

## Nhóm: Layout & Menu

| Trigger keywords | Skill | Mô tả |
|-----------------|-------|-------|
| tạo NavMenu/TopMenu portal, PAGE_TO_TOP_MENU, NAV_MENU_ITEMS, auto-discovery sơ đồ dự án | [tao-layout-navmenu-topmenu](./tao-layout-navmenu-topmenu/SKILL.md) | NavMenu/TopMenu cho từng portal |

---

## Nhóm: Kiểm thử & QA

| Trigger keywords | Skill | Mô tả |
|-----------------|-------|-------|
| review code trước commit, check-for-skill tĩnh, check-for-runtime Playwright, bảo mật/circular deps/a11y | [checklist-sau-code](./checklist-sau-code/SKILL.md) | Checklist sau code — 2 giai đoạn tĩnh + runtime |
| test form CRUD, kiểm tra field mapping FE-BE, verify payload API | [test-ui](./test-ui/SKILL.md) | Test UI tự động bằng Playwright |
| verify field update sau khi lưu, regression test form | [test-field-update](./test-field-update/SKILL.md) | Test tự động field trên UI |
| test dialog nhiều tab, field mapping từng tab, FK ID vs display | [test-form-multi-tab](./test-form-multi-tab/SKILL.md) | Test form đa tab |
| bug khó tìm nguyên nhân, console/network logs, Playwright headless | [find-bug-by-logs](./find-bug-by-logs/SKILL.md) | Tìm nguyên nhân lỗi bằng logs runtime |

---

## Nhóm: Clone / Vẽ theo mẫu

| Trigger keywords | Skill | Mô tả |
|-----------------|-------|-------|
| clone URL, phân tích giao diện web có sẵn, snapshot màn hình nghiệp vụ | [clone-web-playwright](./clone-web-playwright/SKILL.md) | Clone UI/UX từ web bằng Playwright |
| vẽ frontend theo ảnh chụp màn hình, MISA ASP, sinh code từ ảnh | [ve-theo-template](./ve-theo-template/SKILL.md) | Sinh code SASUCO từ ảnh giao diện tham khảo |

---

## Nhóm: Vận hành / Quy trình Agent

| Trigger keywords | Skill | Mô tả |
|-----------------|-------|-------|
| xử lý bug BackendReplied/Fixed/NeedMoreInfo | [bug-check](./bug-check/SKILL.md) | Quy trình xử lý bug FrontendWeb |
| kiểm tra Inbox Tasks, xác định skill áp dụng trước khi thực thi | [inbox-check](./inbox-check/SKILL.md) | Quy trình xử lý Inbox Tasks hàng loạt |
| làm task inbox theo ID cụ thể, so sánh BE fix đủ chưa | [lam-task-inbox](./lam-task-inbox/SKILL.md) | Xử lý 1 task inbox cụ thể — không dùng cho check hàng loạt |
| trả lời câu hỏi kỹ thuật được giao, không tự ý sửa code | [question-check](./question-check/SKILL.md) | Xử lý Questions kỹ thuật cho FrontendWeb |
| thực thi yêu cầu từ inbox từ đầu đến cuối, 5 bước B0-B4 | [dev-workflow](./dev-workflow/SKILL.md) | Điều phối toàn bộ quy trình phát triển Frontend |
| đối chiếu tài liệu Hub Docs với màn hình portal thực tế | [update-tai-lieu-van-ban-hubdocs](./update-tai-lieu-van-ban-hubdocs/SKILL.md) | Hiệu chỉnh tài liệu Hub Docs (bắt buộc có docCode/groupCode) |

---

## Nhóm: Git & Triển khai

| Trigger keywords | Skill | Mô tả |
|-----------------|-------|-------|
| hoàn thành feature/bug/refactor, tự tóm tắt commit, auto push theo ngưỡng | [commit-local-push-server](./commit-local-push-server/SKILL.md) | Commit local + auto push (kiến trúc 14 repo) |
| merge code từ nhánh developer vào development, qua script an toàn | [merge-code-from-devs](./merge-code-from-devs/SKILL.md) | Merge code an toàn (backup 2 bên, abort khi conflict) |
| build docker image web, build production, push Docker Hub | [build-docker](./build-docker/SKILL.md) | Hướng dẫn chạy script build Docker (không tự chạy) |
| tách portal thành repo độc lập, phân tích dependencies vào shared | [cach-refactor-kien-truc-doc-lap](./cach-refactor-kien-truc-doc-lap/SKILL.md) | Refactor portal thành độc lập — chỉ copy file liên quan |
| xuất menu & page permission ra JSON, quét PAGE_FEATURES | [export-menu-page-permission](./export-menu-page-permission/SKILL.md) | Export cấu trúc menu & phân quyền portal |

---

## Nhóm: Tối ưu & Meta

| Trigger keywords | Skill | Mô tả |
|-----------------|-------|-------|
| skill nào tốn token nhất, ma trận ưu tiên tối ưu skill | [optimize-skill-sasuco](./optimize-skill-sasuco/SKILL.md) | Thống kê tần suất dùng skill theo git log |

---

## Tài nguyên dùng chung (không phải skill)

- [`templates-for-skills/`](./templates-for-skills/) — thư viện template tham chiếu (dialog, master-page, sub-page, foundation, auto-code-generation) được các skill tạo trang/dialog ở trên trích dẫn. Không có `SKILL.md`, không tự nạp độc lập.

---

## Quy tắc chọn skill

1. Đọc các trigger keywords trong bảng trên.
2. Nếu yêu cầu khớp → load SKILL.md tương ứng **trước khi** thực thi (Claude Code cũng tự động đối chiếu `description` trong frontmatter của mỗi skill để gợi ý).
3. Nhiều skill "Tạo trang/Dialog nghiệp vụ" và "Nền tảng UI" có quan hệ kế thừa (vd tao-dialog-new kế thừa tao-ui-dialog + tao-ui-giao-dien) — đọc mục "Dùng khi" trong SKILL.md để biết skill nào cần load kèm.
4. Nếu không khớp skill nào → hỏi lại user hoặc tham khảo `checklist-sau-code` để biết quy tắc review chung.

> ⚠️ Index này có thể lệch so với danh sách skill thực tế theo thời gian — nếu không tìm thấy trigger phù hợp, hãy xem trực tiếp thư mục `.claude/skills/`.
