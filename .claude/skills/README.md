# Skills Index — JDX-Gamers Website

Danh sách toàn bộ skill hiện có trong `Website/.claude/skills/`. Agent đọc file này để xác định skill nào dùng cho yêu cầu nào.

> Dự án chỉ có 1 module: `JGameApp`. Các skill viết cho kiến trúc đa-portal/đa-repo cũ (SASUCO InvoiceEasy —
> KetoanApp, InvoiceApp, AdminApp...) đã được chuyển vào [`_archived-sasuco/`](./_archived-sasuco/README.md) —
> không dùng cho công việc trong `src/modules/JGameApp/`, chỉ giữ tham khảo lịch sử.

---

## Nhóm: Quy tắc code & quy ước chung

| Trigger keywords | Skill | Mô tả |
|-----------------|-------|-------|
| TypeScript strict, tránh any, React hooks, import order, ApiLogger, route trong routeConfig.tsx, không refactor ngoài phạm vi | [quy-tac-code](./quy-tac-code/SKILL.md) | Quy tắc code TypeScript/React |
| tổ chức modules/features/shared, đặt file vào đâu trong JGameApp | [cau-truc-du-an](./cau-truc-du-an/SKILL.md) | Cấu trúc thư mục dự án |
| viết custom hook use*.ts, page hook, dialog hook, data hook, reset state | [hook-conventions](./hook-conventions/SKILL.md) | Quy tắc viết custom hook |
| viết/sửa *ApiService.ts, apiCall(), buildJGameUrl() | [api-service-conventions](./api-service-conventions/SKILL.md) | Quy tắc viết API Service |
| nhiều tool call liên tiếp, giới hạn đọc file/MCP/Playwright, batching, checkpoint | [rate-limit-rules](./rate-limit-rules/SKILL.md) | Chống rate limit khi thao tác dài nhiều bước |
| replace_string_in_file, refactor, đổi tên biến, tránh mất Unicode/encoding | [sua-file-an-toan](./sua-file-an-toan/SKILL.md) | Quy tắc sửa file an toàn |

---

## Nhóm: Kiểm thử & QA

| Trigger keywords | Skill | Mô tả |
|-----------------|-------|-------|
| review code trước commit, check-for-skill tĩnh, bảo mật/circular deps/a11y/performance | [checklist-sau-code](./checklist-sau-code/SKILL.md) | Checklist sau code (giai đoạn 2 Playwright hiện chưa áp dụng cho JGameApp — xem cảnh báo đầu file) |
| bug khó tìm nguyên nhân, console/network logs, Playwright headless | [find-bug-by-logs](./find-bug-by-logs/SKILL.md) | Tìm nguyên nhân lỗi bằng logs runtime |
| đồng bộ thiết kế lại trang khi API JGame trả field mới chưa hiển thị | [dong-bo-thiet-ke-mockdata](./dong-bo-thiet-ke-mockdata/SKILL.md) | Đồng bộ thiết kế/mockdata theo response API JGame |

---

## Nhóm: Vận hành / Quy trình Agent

| Trigger keywords | Skill | Mô tả |
|-----------------|-------|-------|
| xử lý bug BackendReplied/Fixed/NeedMoreInfo | [bug-check](./bug-check/SKILL.md) | Quy trình xử lý bug FrontendWeb |
| kiểm tra Inbox Tasks, xác định skill áp dụng trước khi thực thi | [inbox-check](./inbox-check/SKILL.md) | Quy trình xử lý Inbox Tasks hàng loạt |
| làm task inbox theo ID cụ thể, so sánh BE fix đủ chưa | [lam-task-inbox](./lam-task-inbox/SKILL.md) | Xử lý 1 task inbox cụ thể — không dùng cho check hàng loạt |
| trả lời câu hỏi kỹ thuật được giao, không tự ý sửa code | [question-check](./question-check/SKILL.md) | Xử lý Questions kỹ thuật cho FrontendWeb |
| thực thi yêu cầu từ inbox từ đầu đến cuối, 5 bước B0-B4 | [dev-workflow](./dev-workflow/SKILL.md) | Điều phối toàn bộ quy trình phát triển Frontend |

---

## Nhóm: Build / Triển khai

| Trigger keywords | Skill | Mô tả |
|-----------------|-------|-------|
| build docker image web, build production, push Docker Hub | [build-docker](./build-docker/SKILL.md) | Hướng dẫn chạy script build Docker (không tự chạy) |

---

## Đã archive (không dùng cho JGameApp)

Quy ước UI/dialog/master-page kiểu KetoanApp (Dialog, SearchCombobox, PagingUtils, ConfirmDialog,
ValidationErrorDialog, DatePicker — các component này không tồn tại trong `shared/components/ui/` của JGameApp)
và quy trình đa-repo/multi-portal (merge, commit-push, export menu permission...) đã được chuyển vào
[`_archived-sasuco/`](./_archived-sasuco/README.md). `refresh-token` và `doc-check` cũng đã archive vì mô tả
service/tool chưa tồn tại trong JGameApp (chưa có backend thật). Xem README trong thư mục đó để biết danh sách đầy đủ
và lý do.

---

## Quy tắc chọn skill

1. Đọc các trigger keywords trong bảng trên.
2. Nếu yêu cầu khớp → load SKILL.md tương ứng **trước khi** thực thi (Claude Code cũng tự động đối chiếu `description` trong frontmatter của mỗi skill để gợi ý).
3. Nếu không khớp skill nào → hỏi lại user hoặc tham khảo `checklist-sau-code` để biết quy tắc review chung. Không tự ý nạp skill trong `_archived-sasuco/` trừ khi user yêu cầu tham khảo lịch sử.

> ⚠️ Index này có thể lệch so với danh sách skill thực tế theo thời gian — nếu không tìm thấy trigger phù hợp, hãy xem trực tiếp thư mục `.claude/skills/`.
