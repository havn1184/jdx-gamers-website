---
description: NÂNG CẤP TOÀN TRÌNH — BỘ ĐIỀU PHỐI. Căn cứ cần gì nạp nấy từ thư mục quy tắc .claude/commands/ppt-nc-toan-trinh/. Nguyên tắc SINGLE-LOAD: mọi skill, file code, file quy tắc chỉ được nạp 1 lần duy nhất trong 1 phiên. Đầu vào: mô tả nâng cấp/fix, bug report, inbox task.
---

# NÂNG CẤP TOÀN TRÌNH — BỘ ĐIỀU PHỐI

## 🧠 NGUYÊN TẮC SINGLE-LOAD (bắt buộc, áp dụng TOÀN TRÌNH)

Mọi file — **skill, file quy tắc, checklist, file code, tài liệu** — **CHỈ được nạp (`read_file`) 1 lần duy nhất trong 1 phiên (session)**, tránh nạp lặp làm tràn ngữ cảnh:

1. Trước mỗi `read_file` → tự hỏi: *"file này đã nạp chưa?"* — Đã nạp → **dùng lại, TUYỆT ĐỐI không đọc lại**
2. Cần đoạn cụ thể từ file đã nạp → `get_code_snippet`/`search_graph` lấy đúng đoạn, **không đọc cả file**
3. Nghi ngờ context bị cắt/tràn → kiểm tra danh sách đã nạp trong session memory (`/memories/session/loaded-files.md`): **ghi lại mỗi lần nạp file**, xóa khi hết phiên
4. Skill đã nạp ở phiên/session trước → áp dụng kiến thức đang có trong context, **không đọc lại SKILL.md**

## 🗂 CẤU TRÚC — CĂN CỨ CẦN GÌ NẠP NẤY

> Các quy tắc giai đoạn nằm trong thư mục: `.claude/commands/ppt-nc-toan-trinh/`

| Giai đoạn | Khi nào nạp | File quy tắc (nếu chưa nạp) | Kết thúc bằng |
|-----------|-------------|-----------------------------|---------------|
| 1. Tạo tài liệu | Bắt đầu GĐ1 | `01-gd1-tao-tai-lieu.rule.md` | chờ user "approve" |
| 1b. Review tài liệu | Tới GĐ1 B7 | `checklist-review-tai-lieu.rule.md` | PASS |
| 2. Code | Sau approve GĐ1 | `02-gd2-trien-khai-code.rule.md` | chờ user "ok" |
| 3. Review + Commit | Sau "ok" GĐ2 | `03-gd3-review-commit.rule.md` | báo cáo + commit |

> **KHÔNG nạp trước** quy tắc của giai đoạn chưa tới — nạp đúng lúc cần, mỗi file đúng 1 lần.

## Quy Tắc Chung
1. **Checkpoint bắt buộc:** sau mỗi giai đoạn DỪNG, báo cáo tóm tắt, chờ user xác nhận trước khi sang giai đoạn kế
2. Tra cứu codebase = codebase-memory-mcp (`search_graph`/`trace_path`/`get_architecture`/`get_code_snippet`); 🚫 CẤM `grep_search`/`file_search`/`semantic_search`/`vscode_listCodeUsages`
3. Không tự suy diễn; ưu tiên đơn giản; tránh ảnh hưởng module khác (trừ khi có lý do chính đáng)

## FAST PATH
Ngay từ đầu thấy: không tạo file mới + <20 dòng + không đổi kiến trúc → hỏi user `"ok"` áp dụng ngay / `"review trước"` rồi mới code (vẫn tuần tự từng giai đoạn, vẫn single-load).

## Đầu Vào
Mô tả nâng cấp/fix | Bug report (bugId) | Inbox task (taskId) | Ảnh giao diện (@vision-bridge nếu cần phân tích ảnh)
