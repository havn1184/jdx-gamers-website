# Giải Pháp: Merge Code An Toàn Từ Developer Branch (Script Tự Động)

> Ngày: 2026-08-13 | Phạm vi: Skill `merge-code-from-devs` | Kiến trúc: 12 repo độc lập (1 Root + 1 Docker + 1 .github + 9 Portal)

## 1. Bối Cảnh & Vấn Đề

### 1.1 Sự cố mất working tree (xảy ra 2 lần: 09/08, 13/08/2026)

Khi agent chạy lệnh git trực tiếp từ terminal để merge, gặp các lỗi:

1. **CWD bị đổi sai repo**: Lệnh `git merge` chạy trong **ROOT repo** thay vì repo portal (vd: KetoanApp). Hệ quả: ROOT branch di sản `development-tuan` (vẫn track 418 file KiemThuApp + 203 TaiSanApp + 571 CrmApp + 239 .github) → `git checkout development` xóa toàn bộ file nested repos khỏi đĩa → app crash (`Cannot find module` → `_c10 is not defined`).
2. **Không có cơ chế phòng thủ**: không kiểm tra `git rev-parse --show-toplevel` trước lệnh; không tạo backup; không kiểm tra working tree sạch.
3. **Agent tự quyết resolve conflict / reset** → rủi ro mất code âm thầm.

### 1.2 Mục tiêu

| # | Yêu cầu | Giải pháp |
|---|---------|-----------|
| 1 | **Agent không gọi trực tiếp lệnh git** | Skill chỉ chạy script + đọc kết quả JSON + báo cáo |
| 2 | **Script merge tự động, đúng repo tuyệt đối** | Script nhận `--portal` → resolve path từ map cố định → luôn chạy `git` với `cwd` chỉ định (không phụ thuộc CWD terminal) + kiểm tra `show-toplevel` khớp |
| 3 | **Kiểm tra trước & sau** | 2 script `1-check-pre-merge` / `3-check-post-merge` cho kết quả đảm bảo |
| 4 | **Backup 2 bên trước khi merge** | Tạo `backup/<branch>-<timestamp>` cho cả nguồn và đích (không xóa, không reset) |
| 5 | **Cấm lệnh xóa/reset commit** | Script KHÔNG chứa: `git reset`, `git branch -D`, `git push --force`, `git clean`, `rm -rf` |

## 2. Kiến Trúc Giải Pháp

```
Agent (theo SKILL.md)
   │  chạy (KHÔNG gọi git trực tiếp)
   ▼
┌────────────────────────────────────────────────────────────┐
│ scripts/                                                   │
│  ├── main-merge.cjs        ← ENTRY POINT (điều phối 1 lệnh)│
│  ├── main-merge-lib.cjs   ← dùng chung (main): resolve repo + git │
│  ├── 1-check-pre-merge.cjs  ← BƯỚC 1: kiểm tra TRƯỚC         │
│  ├── 2-merge-safe.cjs       ← BƯỚC 2: backup + merge an toàn │
│  └── 3-check-post-merge.cjs ← BƯỚC 3: kiểm tra SAU           │
└────────────────────────────────────────────────────────────┘
   │  mọi lệnh git đều chạy với cwd = repo đã resolve
   ▼
12 Git repos (ROOT / Docker / .github / 9 Portal)
```

### 2.1 Nguyên tắc an toàn cốt lõi

1. **Repo path là nguồn chân lý duy nhất**: từ `--portal` → `PORTAL_MAP` → `D:\JDX-SOUCRE-MAIN-FE-PORTAL\Jdx-portal-root\src\modules\<App>`. Mọi lệnh git chạy qua `execFileSync('git', args, { cwd: repoPath })` — **không bao giờ** dựa vào CWD terminal.
2. **Kiểm tra `show-toplevel` khớp** trước mọi thao tác — phát hiện ngay nếu máy đang ở repo khác.
3. **Backup trước, merge sau (IDEMPOTENT)**: backup 2 bên (nguồn + đích) bằng `git branch` (thuần tạo, không đổi working tree). **Chỉ tạo backup MỚI nếu CHƯA có backup trỏ đúng commit hiện tại của branch** — script chạy lại nhiều lần (retry/lỗi/merge abort) sẽ **DÙNG LẠI backup cũ** (đánh dấu `reused: true`), không tạo backup trùng lặp.
4. **Conflict → ABORT, không resolve thủ công**: `git merge --abort` (chỉ hủy merge đang dở, không reset commit nhánh).
5. **Output JSON chuẩn**: mọi script xuất `{ ok, errors[], warnings[], data{} }` + exit code → agent đọc để báo cáo.
6. **Ràng buộc branch (script tự chặn)**: `--target main/master` ❌ · `--target` không bắt đầu `development` ❌ · `--branch main/master` ❌ · `--branch` trùng `--target` ❌.
7. **Gate xác nhận**: `2-merge-safe` (giống `main-merge`) **bắt buộc `--yes`** — không `--yes` chỉ pre-check rồi DỪNG (exit 2).
8. **Khôi phục branch gốc**: script lưu branch hiện tại trước khi chạy; khi fail/abort/xong → `git switch` về branch gốc (không để repo mắc kẹt ở branch khác).

### 2.2 Bản đồ Portal → Repo (PORTAL_MAP)

| Alias | Thư mục (so với ROOT `D:\JDX-SOUCRE-MAIN-FE-PORTAL\Jdx-portal-root`) | Hợp lệ merge? |
|-------|----------------------------------------------------------------------|:---:|
| `root` | `.` | 🚫 CẤM |
| `docker` | `Docker` | 🚫 CẤM |
| `agentskill` | `.github` | 🚫 CẤM |
| `invoice` / `invoiceapp` | `src/modules/InvoiceApp` | ✅ |
| `admin` / `adminapp` | `src/modules/AdminApp` | ✅ |
| `partner` / `partnerapp` | `src/modules/PartnerApp` | ✅ |
| `sso` / `ssoapp` | `src/modules/SsoApp` | ✅ |
| `ketoan` / `ketoanapp` / `accounting` | `src/modules/KetoanApp` | ✅ |
| `crm` / `crmapp` | `src/modules/CrmApp` | ✅ |
| `taisan` / `taisanapp` | `src/modules/TaiSanApp` | ✅ |
| `kiemthu` / `kiemthuapp` | `src/modules/KiemThuApp` | ✅ |
| `baseindex` / `baseindexapp` | `src/modules/BaseIndexApp` | ✅ |

> 🚫 **GIỚI HẠN PHẠM VI TUYỆT ĐỐI:** merge từ dev branch CHỈ được tác động vào **repo PORTAL app** (`src/modules/<App>`). CẤM merge vào `root`, `docker`, `agentskill` — các repo quản lý cấu hình/deploy/skill toàn cục. Script `resolveMergeRepoPath()` **chặn 2 lớp**: (1) alias bị cấm → lỗi ngay; (2) repo path không nằm trong `src/modules/` → lỗi. Không thể lan tác động sang repo khác kể cả khi CWD terminal sai.

## 3. Đặc Tả Script

### 3.0 `main-merge.cjs` — SCRIPT ĐIỀU PHỐI (entry point — 1 lệnh hoàn thành)

```bash
node main-merge.cjs --portal <alias> --branch <nguồn> [--target development] [--yes] [--push]
```

> 🧑‍💻 **Thiếu tham số → HỎI NHẬP tương tác:** mọi script (kể cả `main-merge`) khi chưa truyền đủ `--portal` / `--branch` / `--target` sẽ **hiển thị prompt nhập tên đầy đủ** kèm danh sách giá trị hợp lệ. Chạy từ terminal thật (TTY) → user gõ giá trị rồi Enter. Chạy qua agent/pipe (không TTY) → script báo lỗi yêu cầu truyền tham số (exit 1).

Tự động chạy đủ 4 phase: `[B1] PRE-CHECK → [B2] CONFIRM → [B3] MERGE-SAFE → [B4] POST-CHECK`.

- **Không `--yes`:** chỉ chạy pre-check rồi DỪNG (exit 2, phase `waiting-confirm`) — agent báo cáo + chờ user duyệt.
- **`--yes`:** chạy trọn — backup 2 bên → switch → merge `--no-ff` (conflict → abort) → post-check.
- **`--push`:** push `origin/<đích>` sau merge (mặc định KHÔNG push).
- Giữ nguyên ràng buộc an toàn: không reset, không xóa, conflict abort, backup 2 bên.

**Exit code:** `0` = xong toàn bộ · `1` = lỗi chặn/abort · `2` = pre-check PASS đang chờ duyệt.

### 3.1 `1-check-pre-merge.cjs` — Kiểm tra TRƯỚC

```bash
node 1-check-pre-merge.cjs --portal <alias> --branch <nguồn> [--target development]
```

**Kiểm tra (mỗi mục có pass/fail rõ ràng):**

| # | Kiểm tra | Chặn (FAIL) | Cảnh báo (WARN) |
|---|----------|:---:|:---:|
| 1 | Portal hợp lệ + repo tồn tại + có `.git` | ✅ | |
| 2 | `git rev-parse --show-toplevel` KHỚP repo mong muốn | ✅ | |
| 3 | Working tree sạch (không tracked M/D, bỏ qua `??`) | ✅ | |
| 4 | Branch nguồn tồn tại (local hoặc `origin/<nguồn>`) | ✅ | |
| 5 | Branch đích (`target`) tồn tại | ✅ | |
| 6 | Diff `nguồn..đích` KHÔNG có file xóa (D) — nguồn không được xóa file đang có ở đích | ✅ | |
| 7 | Số commit mới `đích..nguồn` (sẽ được merge) | | ✅ in ra |
| 8 | **🔴 Điều kiện BẮT BUỘC: nguồn phải chứa MỌI commit của đích** — `nguồn..đích` phải = 0 (nhánh dev đã merge hết code mới của development) | ✅ **BLOCK** | |
| 9 | Kiểm tra trạng thái backup hiện có — **chỉ cảnh báo** (sẽ dùng lại backup cùng commit, không chặn merge) | | ✅ |
| 10 | **🔴 Branch hợp lệ** — `--target` ≠ main/master + bắt đầu `development*` + `--branch` ≠ `--target` + `--branch` ≠ main/master | ✅ **BLOCK** | |

**Output:** JSON `{ ok, repoPath, topLevelMatch, workingTreeClean, sourceBranch, targetBranch, deletedFiles[], commitsNew, commitsBehind, backupNames, errors[], warnings[] }`
**Exit code:** `0` = sẵn sàng merge · `1` = có lỗi chặn · `2` = chỉ cảnh báo.

### 3.2 `2-merge-safe.cjs` — Thực hiện merge (backup 2 bên)

```bash
node 2-merge-safe.cjs --portal <alias> --branch <nguồn> [--target development] [--yes] [--push]
```

**Luồng thực thi (từng bước đều ghi log + kiểm tra):**

```
1. Resolve repo từ --portal (PORTAL_MAP) → verify .git + show-toplevel khớp + validate branch (chặn main/lạ/trùng)
2. Chạy lại toàn bộ pre-check (tự gọi logic check-pre) — lỗi chặn → ABORT ngay
   → 🛑 KHÔNG --yes: DỪNG (exit 2, phase waiting-confirm) — KHÔNG merge
3. git fetch origin        (lỗi mạng → WARN, không chặn)
4. Đảm bảo branch nguồn local (nếu chỉ có origin/<nguồn> → git branch <nguồn> origin/<nguồn>)
5. TẠO BACKUP 2 BÊN IDEMPOTENT (git branch — thuần tạo, KHÔNG đổi working tree):
     backup/<nguồn>-<ts>  ← tại commit nguồn hiện tại
     backup/<đích>-<ts>   ← tại commit đích hiện tại
6. git switch <đích>      (working tree đã sạch ở bước 2 → an toàn)
7. git merge <nguồn> --no-ff --no-edit
     - THÀNH CÔNG → tiếp tục
     - CONFLICT/FAIL  → git merge --abort → báo FAIL (KHÔNG resolve, KHÔNG reset)
8. [--push] git push origin <đích>   (mặc định KHÔNG push — chỉ merge local)
9. Xuất JSON kết quả
```

**Output JSON:** `{ ok, repoPath, backupsCreated[], targetBranch, sourceBranch, mergeCommit, pushed, errors[], warnings[] }`
**Exit code:** `0` = merge thành công · `1` = lỗi (đã abort, working tree nguyên trạng).

> 🛡️ **Ràng buộc tuyệt đối:** script **KHÔNG chứa** `git reset` / `git branch -D` / `git push --force` / `git clean` / `rm`. Backup tạo ra **không bao giờ bị xóa** bởi script — giữ làm phao cứu sinh, agent có thể xóa thủ công sau khi xác nhận ổn.

### 3.3 `3-check-post-merge.cjs` — Kiểm tra SAU

```bash
node 3-check-post-merge.cjs --portal <alias> [--target development] [--source <nguồn>] [--backup-ts <ts>]
```

**Kiểm tra:**

| # | Kiểm tra | Ý nghĩa |
|---|----------|---------|
| 1 | Đang ở branch đích | Merge xong phải đứng ở `target` |
| 2 | Working tree sạch sau merge | Không file M/D dở dang |
| 3 | Backup branches tồn tại (`git branch --list 'backup/*'`) | Phao cứu sinh còn đó |
| 4 | `git log <nguồn>..<đích>` rỗng (nếu có `--source`) | Mọi commit nguồn đã vào đích |
| 5 | HEAD là merge commit (2 parents) hoặc fast-forward hợp lệ | Merge đã hoàn tất đúng dạng |
| 6 | Không có file bị xóa bất thường | Không mất code |

**Output JSON:** `{ ok, currentBranch, workingTreeClean, backups[], sourceMerged, mergeCommit, errors[], warnings[] }`
**Exit code:** `0` = đạt · `1` = có vấn đề cần xử lý (báo agent).

## 4. Kịch Bản Lỗi & Xử Lý

| Tình huống | Script phát hiện | Hành động agent |
|------------|------------------|-----------------|
| CWD/repo sai (show-toplevel không khớp) | `check-pre` FAIL #2 | Dừng, chạy lại đúng `--portal` |
| Working tree bẩn (M/D) | `check-pre` FAIL #3 | Báo user commit/stash trước |
| Nguồn đi sau đích (thiếu commit của đích) | `check-pre` **FAIL #8** | **BLOCK — BẮT BUỘC cập nhật nguồn trước**: merge `development` → nhánh nguồn rồi push, sau đó mới merge lại |
| Nguồn có file xóa (D) so với đích | `check-pre` FAIL #6 | BLOCK — tránh mất code (theo nguyên tắc skill cũ) |
| Merge conflict | `merge-safe` abort | Báo user, hướng dẫn dùng backup / cập nhật nguồn |
| Merge thành công nhưng post-check lỗi | `check-post` FAIL | Báo user, dùng `backup/*` khôi phục thủ công |
| Backup đã có sẵn (cùng commit) | `check-pre` WARN #9 | Tự động dùng lại backup cũ (`reused: true`) — không tạo trùng |

## 5. Kế Hoạch Triển Khai

| Bước | Nội dung | Trạng thái |
|------|----------|:---:|
| 1 | Tạo `docs/giai-phap-merge-an-toan-2026-08-13.md` (tài liệu này) | ✅ |
| 2 | Tạo `scripts/main-merge-lib.cjs` — thư viện dùng chung | ✅ |
| 3 | Tạo `scripts/1-check-pre-merge.cjs` — kiểm tra trước | ✅ |
| 4 | Tạo `scripts/2-merge-safe.cjs` — merge an toàn + backup 2 bên | ✅ |
| 5 | Tạo `scripts/3-check-post-merge.cjs` — kiểm tra sau | ✅ |
| 6 | Tạo `scripts/main-merge.cjs` — script điều phối (entry point 1 lệnh) | ✅ |
| 6 | Cập nhật `SKILL.md` — agent chỉ chạy script + báo cáo, CẤM gọi git trực tiếp | ✅ |
| 7 | Review kỹ tài liệu + script (2 lần) | ✅ |
| 8 | Test thử trên repo KiemThuApp (branch `development-quyen` → `development`) | ⏳ chờ duyệt |

---
> ✅ **APPROVED 2026-08-13** (sau 2 lần review: không còn critical; xác nhận script không chứa lệnh reset/xóa, resolve repo đúng map, backup 2 bên trước merge)
