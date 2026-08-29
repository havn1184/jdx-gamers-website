# CHECKLIST TỰ REVIEW TÀI LIỆU GIẢI PHÁP (22 mục)

> Dùng trong GĐ1 B7 của `ppt-nc-toan-trinh`. Mỗi mục kết luận ✅/❌, **đối chiếu codebase bằng codebase-memory-mcp** — không tự suy luận.
> Ghi chú: các mục trùng chủ đề với B2 (Kiểm tra hợp lệ) là kiểm tra **chi tiết hơn trên tài liệu hoàn chỉnh** — B2 = gate nhanh, checklist = rà soát cuối. Không lặp, bổ trợ nhau.
> ⚠️ Single-load: file này chỉ nạp 1 lần/phiên.

## 1. LOGIC (nghiệp vụ + API)

| # | Mục kiểm tra | Cách kiểm tra | Mức |
|---|--------------|---------------|:---:|
| 1 | Mục tiêu đúng yêu cầu user (mục 0) | So tài liệu vs prompt gốc | 🔴 |
| 2 | Endpoint đúng method + path | Đối chiếu vs đặc tả BE | 🔴 |
| 3 | Field FE = BE (không đổi tên/viết tắt) | So mục 4 vs đặc tả BE | 🔴 |
| 4 | Quy trình nghiệp vụ hợp lệ | `trace_path` luồng gọi | 🔴 |
| 5 | Validate đúng nghiệp vụ | Đặc tả BE + code form có sẵn | 🟡 |
| 6 | Task/Bug ID đúng | So với B1 | 🟡 |

## 2. TUÂN THỦ SKILL

| # | Mục kiểm tra | Cách kiểm tra | Mức |
|---|--------------|---------------|:---:|
| 7 | Đủ skill cho từng loại file | Danh sách file vs bảng skill | 🔴 |
| 8 | Tên file theo `dat-ten`, thư mục theo `cau-truc-du-an` | So mục 3 vs skill | 🔴 |
| 9 | Pattern theo skill, không tự sáng tạo | Đối chiếu từng file vs skill | 🔴 |
| 10 | Menu đúng `tao-layout-navmenu-topmenu` (nếu A/B) | So mục 6 vs skill | 🟡 |

## 3. NỘI DUNG THỪA

| # | Mục kiểm tra | Cách kiểm tra | Mức |
|---|--------------|---------------|:---:|
| 11 | Không file/field/endpoint thừa | Rà mục 3 | 🟡 |
| 12 | Phạm vi tối thiểu (không sửa ngoài yêu cầu) | So mục 3 vs prompt gốc | 🔴 |
| 13 | Không mô tả lặp/không liên quan | Đọc lại tài liệu | 🟡 |

## 4. XUNG ĐỘT VỚI CODEBASE

| # | Mục kiểm tra | Cách kiểm tra | Mức |
|---|--------------|---------------|:---:|
| 14 | File "tạo mới" chưa tồn tại | `search_graph(label="Class/Interface/Function")` | 🔴 |
| 15 | File "sửa" tồn tại đúng đường dẫn | `get_code_snippet`/`search_graph` | 🔴 |
| 16 | Không đổi behavior dùng nhiều nơi | `trace_path` symbol bị sửa | 🔴 |
| 17 | Không ảnh hưởng module/portal khác | `search_graph` import vào symbol | 🟡 |
| 18 | Route/pageId/menu mới không trùng | `search_graph(label="Route")` | 🟡 |

## 5. KẾ THỪA

| # | Mục kiểm tra | Cách kiểm tra | Mức |
|---|--------------|---------------|:---:|
| 19 | Tái sử dụng utils/components/hooks có sẵn | `search_graph` tên util/component | 🔴 |
| 20 | Kế thừa pattern dialog/page có sẵn | Đọc 1-2 file tương tự | 🟡 |
| 21 | Endpoint trùng method+path → dùng lại, không tạo mới | `search_graph(label="Method")` trong service | 🔴 |
| 22 | Type FK dùng interface có sẵn | `search_graph(label="Interface")` | 🟡 |

## 6. KẾT LUẬN REVIEW

```
📋 KẾT QUẢ TỰ REVIEW TÀI LIỆU
Critical ❌: [danh sách # — lý do] | Critical ❌ đã sửa: [...] | Minor 🟡: [...]
→ Kết luận: ✅ PASS (hết Critical) / ❌ FAIL (sửa rồi review lại, tối đa 1 lần)
```
