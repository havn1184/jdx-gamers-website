---
description: Quy tắc GĐ3 — Review sau code: check-for-skill (static) + check-for-runtime (Playwright) + review thủ công + commit + đóng task/bug. (Quy tắc 3 của ppt-nc-toan-trinh)
---

# QUY TẮC GĐ3 — REVIEW SAU CODE + COMMIT

> Đầu vào: code từ GĐ2 + tài liệu đã approve. 🔍 Tra cứu codebase = codebase-memory-mcp.
> ⚠️ Single-load: tài liệu/skill đã nạp → không đọc lại.

## B1 — Xác Định Phạm Vi
- Tài liệu **đã đọc ở GĐ2** → không đọc lại (cần chi tiết → `get_code_snippet`)
- Xác định: `PORTAL_PATH`, `FEATURE_PATH` (nếu có), `PORTAL_NAME` (cho runtime-check: ketoan, invoice...)

## B2 — Static `check-for-skill`
```
node .claude/skills/checklist-sau-code/scripts/check-for-skill/check-all.cjs {PORTAL_PATH} {FEATURE_PATH}
```
- Chỉ quan tâm file trong `{FEATURE_PATH}` — lỗi cũ ngoài phạm vi → ghi nhận tồn đọng
- Lỗi trong scope → đọc skill (đã nạp → áp dụng, không đọc lại) → sửa → chạy lại
- Script sai (false positive) → đọc skill, code đúng → bỏ qua ghi nhận; script crash → báo user

## B3 — Runtime `check-for-runtime`
```
node .claude/skills/checklist-sau-code/scripts/check-for-runtime/runtime-check.cjs {PORTAL_NAME} {FEATURE_PATH}
```
- Script tự: login → duyệt hash route → bắt console.error/pageerror/requestfailed/HTTP 500/Vite overlay → click nút "Thêm" test dialog
- Lỗi runtime → fix → chạy lại | 404 API → BE chưa deploy, ghi nhận | Không login được → báo user

## B4 — Review Thủ Công (script không check được)
- **B4.1 API mapping:** `read_file` service → field FE **GIỐNG HỆT BE** từng endpoint (VD `accountNumber` không phải `accNum`); số method ≥ endpoint BE (thiếu → **CRITICAL**)
- **B4.2 UI:** Master Page `DmPageHeader`→`DmSearchToolbar`→`DmTable`→`DmTablePagination`; Dialog `maxWidth` + 3 mode (View/Create/Edit) + FK `SearchCombobox`; Button `btn-primary/secondary/danger` (không `bg-*` trực tiếp)
- **B4.3 Routes & Menu:** route đăng ký, `pageId` = `PAGE_ID`; menu đủ `TOP_MENU_ITEMS`/`NAV_MENU_ITEMS`/`PAGE_TO_TOP_MENU`/`pageIdToPath`
- **B4.4 Validate runtime:** input số `100000` → `100.000`; progressive helper (Email/Phone/TaxCode) đổi màu; DatePicker state `yyyy-MM-dd` / UI `dd-MM-yyyy`
- **B4.5 Compile:** `get_errors` = 0

## B5 — Báo Cáo
```
## 📋 Báo Cáo Review — {Tên tính năng}
### Kết quả tự động
| Giai đoạn | Script | Kết quả | Issues |
|-----------|--------|:-------:|:------:|
| Static | check-all.cjs | ✅/❌ | N |
| Runtime | runtime-check.cjs | ✅/❌ | N |
### Kết quả thủ công
| Hạng mục | Kết quả | (B4.1 → B4.4) |
### Lỗi đã fix | ### Vấn đề tồn đọng
### Kết luận
- ✅ PASS — hết critical | - ❌ FAIL — còn critical (liệt kê)
```

## B6 — Commit & Đóng Task
1. `get_errors` → 0
2. `git status --short` → add → commit (load `commit-local-push-server`)
3. `git log origin/development..HEAD` → ≥5 commit → `git push origin development`
4. Inbox: `mcp_hub-mcp_inbox-completed` (taskId) | Bug: `mcp_hub-mcp_bug-close` (bugId) — chỉ sau B5 PASS
