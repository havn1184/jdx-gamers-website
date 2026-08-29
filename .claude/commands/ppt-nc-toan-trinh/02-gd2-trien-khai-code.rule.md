---
description: Quy tắc GĐ2 — Triển khai code từ tài liệu đã approve (GĐ1). Kết thúc: code compile 0 errors, đối chiếu tài liệu xong. (Quy tắc 2 của ppt-nc-toan-trinh)
---

# QUY TẮC GĐ2 — TRIỂN KHAI CODE

> Đầu vào: tài liệu có `✅ APPROVED` ở cuối. Xong → **DỪNG**, chờ user "ok" → GĐ3 (`03-gd3-review-commit.rule.md`).
> 🔍 Tra cứu codebase = codebase-memory-mcp. 🚫 CẤM grep_search/file_search/semantic_search.
> ⚠️ Single-load: skill/tài liệu đã nạp → không đọc lại.

## B1 — Xác Minh
- Tài liệu **đã đọc ở GĐ1** → dùng lại, **KHÔNG đọc lại**
- Phải có `✅ APPROVED` — chưa có → **DỪNG**

## B2 — Load Skills
- Skill đã nạp ở GĐ1 B6 → **dùng lại, không đọc lại**
- Chỉ đọc thêm nếu liên quan (và chưa có trong context): `date-input`, `cdn-upload`, `them-nhanh-fk`, `auto-code-generation`

## B3 — Triển Khai Code
- **Thứ tự:** types → services → hooks → components → dialogs → pages → route → menu
- **Quy tắc:** không thêm ngoài tài liệu; không `any`; comments tiếng Việt; logic trong hooks; không gọi API từ component
- Sau mỗi nhóm file: `get_errors` → sửa compile errors trước khi tiếp tục

## B4 — Đối Chiếu Tài Liệu vs Code
- Endpoint → ApiService method? | Field response → type? | Màn hình/dialog → đã tạo? Route + lazy? | Menu? Barrel `index.ts`? | Compile 0 errors?
- Thiếu → bổ sung ngay, lặp đến khi tất cả ✅

## B5 — Checkpoint Kết Thúc GĐ2
```
✅ GĐ2 — Files mới: [...] | Files sửa: [...] | Compile: 0 errors
→ "ok" để sang GĐ3 (Review + Commit)
```
**DỪNG — chờ user xác nhận.**
