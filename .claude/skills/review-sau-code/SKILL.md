---
name: review-sau-code
description: "Review sau khi code xong 1 tính năng/nc_ trong Website JGameApp: chạy gộp script kiểm tra tuân thủ skill (layer, hook, TS strict, security, perf, route, field FE=BE) + script kiểm tra lỗi đã gặp (LESSONS.md: PagedResult .items, enum int 2 chiều, hook try/finally, class theme không tồn tại, fallback _MAP), tsc/build, kiểm thử, governance + CHANGELOG. Dùng khi: review sau code, kiểm tra tuân thủ skill, tránh tái phạm lỗi cũ, hoàn thiện theo nc_ (Phase 3 của ppt-nc-toan-trinh gốc workspace)."
---

# Review sau code — Website (JGameApp)

> Chuẩn chung 3 phân hệ: **B1 tuân thủ skill (script) -> B2 lỗi đã gặp (script + LESSONS.md) -> B3 build & kiểm tra tĩnh -> B4 kiểm thử thủ công -> B5 governance + CHANGELOG**. Quy trình toàn trình ở `.claude/skills/ppt-nc-toan-trinh/rules/06-phase3-review-hoan-thien.rule.md` (gốc workspace). Skill `checklist-sau-code` là kho script gốc (được gọi lại ở B1); giai đoạn Playwright runtime của nó không áp dụng cho JGameApp.

## Chạy nhanh (từ gốc workspace)

```bash
node Website/.claude/skills/review-sau-code/scripts/check-all.cjs                                        # toàn module
node Website/.claude/skills/review-sau-code/scripts/check-all.cjs Website/src/modules/JGameApp/features/Public/tasks
node Website/.claude/skills/review-sau-code/scripts/check-all.cjs --only lessons
cd Website && npx tsc --noEmit
```

## B1 — Tuân thủ skill (script còn hiệu lực trong `checklist-sau-code/scripts/check-for-skill/`)

| Script | Skill | Kiểm tra |
|---|---|---|
| `check-layer.cjs` | cau-truc-du-an | Không gọi API/service trong `.tsx`, không hook state trong component (phải ở `hooks/`) |
| `check-hook-patterns.cjs`, `check-hook-props.cjs` | hook-conventions | Pattern hook page/dialog/data, props hook |
| `check-ts-strict.cjs`, `check-undef-symbols.cjs` | quy-tac-code | Không `any`, import đủ symbol |
| `check-syntax.cjs` | sua-file-an-toan | JSX/TS hợp lệ, không mất Unicode |
| `check-vietnamese.cjs`, `check-file-size.cjs` | quy-tac-code | Comment tiếng Việt, file không quá lớn |
| `check-performance-react.cjs`, `-render.cjs`, `-bundle.cjs` | quy-tac-code § Perf | memo/callback, render thừa, import nặng |
| `check-security.cjs` | quy-tac-code § Security | XSS, secrets, injection |
| `check-circular-deps.cjs`, `check-dead-files.cjs`, `check-unused-deps.cjs`, `check-app-isolation.cjs` | cau-truc-du-an | Vòng import, file chết, package thừa, không import chéo module |
| `check-menu-routes.cjs` | cau-truc-du-an § routeConfig | Route/pageId khai báo đủ |
| `check-a11y.cjs`, `check-grid-span.cjs` | quy-tac-giao-dien (workspace mục 7) | A11y, grid |
| `check-validate.cjs` | quy-tac-code § Validate | Validate form |
| `check-be-dto-fields.cjs` | api-service-conventions | Field trong `*Dto` FE khớp property DTO C# Backend |

`FAIL` phải sửa hết trong phạm vi feature; lỗi cũ ngoài phạm vi ghi tồn đọng. Script gợi ý skill đã archive -> chỉ coi là tín hiệu chung.

## B2 — Lỗi đã gặp (`scripts/lessons/*.cjs` + `LESSONS.md`)

Script: WEB-L01 PagedResult `.items`, WEB-L02 enum int 2 chiều, WEB-L03 hook catch/finally + state lỗi, WEB-L04 class/token theme không tồn tại, WEB-L05 fallback `_MAP`. Mục "Thủ công" trong [LESSONS.md](LESSONS.md) phải đối chiếu và ghi kết quả. Sửa 1 lỗi thật -> thêm dòng LESSONS.md + script `scripts/lessons/<ID>-<slug>.cjs` (`{ id, title, source, check(rootDir) }`).

## B3 — Build & kiểm tra tĩnh

- `cd Website && npx tsc --noEmit` (hoặc `npm run build`) 0 lỗi.
- `check-all.cjs` không còn ERROR/FAIL.

## B4 — Kiểm thử thủ công

- `npm run dev` với `.env.development.local` trỏ Backend DevLocal; thao tác theo kịch bản mục 5 tài liệu nc_ (dùng skill `find-bug-by-logs`/Playwright headless để chụp + bắt console error nếu cần).
- Field FE = BE từng endpoint; enum map đủ giá trị; Loading/Empty/Error; guard route; responsive.

## B5 — Governance + CHANGELOG

- `Website/.claude/business-rules/{miền}.md`, `system-architect/routing-va-layout.md`, `auth-va-phan-quyen.md` + bump version + 1 dòng `CHANGELOG.md` của thư mục bị sửa (quy trình ở `checklist-sau-code` § Giai đoạn 0).

## Checklist hoàn thành

- [ ] `check-all.cjs` không còn ERROR/FAIL; WARN có lý do
- [ ] Mục "Thủ công" LESSONS.md đã đối chiếu; lỗi mới đã thêm vào LESSONS.md
- [ ] `tsc` sạch; kiểm thử mục 5 đạt
- [ ] Governance + CHANGELOG đã cập nhật
