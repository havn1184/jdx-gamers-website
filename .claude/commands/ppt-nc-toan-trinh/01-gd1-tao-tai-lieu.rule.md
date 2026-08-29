---
description: Quy tắc GĐ1 — Tạo tài liệu giải pháp (nâng cấp/fix/bug/inbox task). Tự review bằng checklist riêng, không subagent. Kết thúc: tài liệu đã approve. (Quy tắc 1 của ppt-nc-toan-trinh)
---

# QUY TẮC GĐ1 — TẠO TÀI LIỆU GIẢI PHÁP

> Giai đoạn 1 của toàn trình. Xong → **DỪNG**, chờ user approve → chuyển GĐ2 (`02-gd2-trien-khai-code.rule.md`).
> 🔍 Tra cứu codebase = codebase-memory-mcp (`search_graph`, `trace_path`, `get_architecture`, `get_code_snippet`). 🚫 CẤM grep_search/file_search/semantic_search/vscode_listCodeUsages.
> ⚠️ Single-load: file này + checklist + skill chỉ nạp 1 lần/phiên.

## B1 — Thu Thập Thông Tin
- **A — Mô tả/endpoint:** load `doc-check` → tra projectCode → tìm/lấy đặc tả endpoint (search/get-by-endpoint → get-endpoint/get-by-id) → `get-changes`
- **B — Inbox task:** `inbox-check` → inbox-check → inbox-detail → xác định endpoint → `doc-check`
- **C — Bug report:** `bug-check` → bug-detail → phân tích steps/expected/actual → liên quan API → `doc-check`; thuần FE → ghi rõ file/component lỗi + nguyên nhân

**Kết quả:** danh sách endpoint + request/response schema, mô tả vấn đề, thay đổi BE (nếu có), task/bug ID.

## B2 — Kiểm Tra Tính Hợp Lệ (gate nhanh trước khi soạn)
| Dấu hiệu | Ví dụ |
|----------|-------|
| Mâu thuẫn kiến trúc | Gọi API từ component |
| Xung đột tính năng | Đổi behavior dùng nhiều nơi |
| Logic nghiệp vụ sai | Quy trình trạng thái không hợp lệ |
| Mô tả mâu thuẫn | Expected ≠ đặc tả API |
| Phạm vi không rõ | Sửa shared component ảnh hưởng module khác |

Phát hiện → **DỪNG** báo user:
```
🛑 PHÁT HIỆN VẤN ĐỀ — CẦN XÁC NHẬN
Vấn đề: [...] | Chi tiết: [...] | Phương án: A. [...] B. [...] C. [...]
→ Chọn phương án hoặc cung cấp thêm thông tin.
```

## B3 — Vị Trí Tài Liệu
- Portal: InvoiceApp / AdminApp / PartnerApp / SsoApp / KetoanApp / KiemThuApp / BaseIndexApp (dưới `src/modules/`)
- Tạo file: `{portal}/docs/Nang-cap/nc-{tinh-nang}-{yyyy-mm-dd}.md`

## B4 — Thư Mục Triển Khai
- `search_graph`/`get_architecture` → **đã có** → ghi path, không hỏi; **chưa có** → hỏi: đường dẫn + shortName + portal.

## B5 — Menu
- Tính năng đã có → **[C] Không đổi** (không hỏi) | Mới + rõ yêu cầu → **[A]/[B]** (không hỏi) | Chưa rõ → hỏi: **[A]** TopMenu+NavMenu mới / **[B]** thêm NavMenu có sẵn / **[C]** không đổi

## B6 — Load Skills & Soạn Tài Liệu
- Skills (nạp nếu **chưa trong context** — đã nạp thì dùng lại, không đọc lại): `tao-apiservice` | `tich-hop-api-ui` | `tao-ui-master-page`+`tao-ui-giao-dien`+`filter-phan-trang` | `tao-ui-dialog`+`tao-ui-giao-dien` | `tao-ui-sub-page`+`tao-ui-giao-dien` | `validate-input` | `dat-ten` | `cau-truc-du-an` | `sua-file-an-toan` | `tao-layout-navmenu-topmenu`
- Quan điểm: không tự suy diễn; ưu tiên đơn giản; tránh ảnh hưởng module khác (trừ khi có lý do chính đáng).
- Khung tài liệu 8 mục: **0.** Prompt gốc (nguyên văn) **1.** Tổng quan (mục tiêu/portal/thư mục/shortName) **2.** Thay đổi BE **3.** File xử lý (tạo mới/sửa) **4.** Ánh xạ fields FE=BE **5.** Routes **6.** Menu **7.** Thiết kế UI (kế thừa style dự án, đẹp, UX dễ dùng) **8.** Checklist — Field FE **GIỐNG HỆT BE** (không đổi tên/viết tắt).

## B7 — TỰ REVIEW BẰNG CHECKLIST (không gọi subagent)
- Nạp `.claude/commands/ppt-nc-toan-trinh/checklist-review-tai-lieu.rule.md` (**1 lần duy nhất** trong session) → kiểm tra **22 mục**, mỗi mục kết luận ✅/❌
- Còn **Critical ❌** → sửa tài liệu → review lại (tối đa 1 lần). Hết Critical (Minor 🟡 được phép) → **PASS**
- Sau 1 lần review vẫn Critical → **DỪNG**, báo user quyết định
- Xuất kết luận: Critical ❌ (đã sửa) / Minor 🟡 / **PASS-FAIL**

## B8 — FAST PATH
Không tạo file mới + <20 dòng thay đổi + không đổi kiến trúc → hỏi user: `"ok"` áp dụng ngay (≈ approve → sang GĐ2) / `"review trước"`. **KHÔNG tự code.**

## B9 — Checkpoint Kết Thúc GĐ1
```
✅ GĐ1 — Tài liệu: [đường dẫn] | Portal: [portal] | shortName: [...] | Menu: [A/B/C] | Tự review: PASS (Critical 0)
→ "approve" để sang GĐ2 / "sửa" để chỉnh tài liệu
```
**DỪNG — chờ user approve.** Khi approve → ghi `✅ APPROVED` vào **cuối tài liệu** (GĐ2/GĐ3 xác minh).
