# Rule: Ánh Xạ File → Repo & Nhánh

> Dự án có **14 Git repo độc lập**: 1 Root + `.github` + `Docker` + 11 Portal.
> Mỗi repo có `.git` riêng, branch riêng. Xác định **đúng repo** trước khi commit.

## Bảng ánh xạ file → repo

| File path | Repo Git | Thư mục git | Scope |
| --------- | -------- | ----------- | :----: |
| `src/modules/InvoiceApp/**` | `jdx-portal-invoice` | `src/modules/InvoiceApp/` | `invoice` |
| `src/modules/AdminApp/**` | `jdx-portal-admin` | `src/modules/AdminApp/` | `admin` |
| `src/modules/PartnerApp/**` | `jdx-portal-partner` | `src/modules/PartnerApp/` | `partner` |
| `src/modules/SsoApp/**` | `jdx-portal-sso` | `src/modules/SsoApp/` | `sso` |
| `src/modules/KetoanApp/**` | `jdx-portal-accounting` | `src/modules/KetoanApp/` | `ketoan` |
| `src/modules/CrmApp/**` | `jdx-portal-crm` | `src/modules/CrmApp/` | `crm` |
| `src/modules/TaiSanApp/**` | `jdx-portal-taisan` | `src/modules/TaiSanApp/` | `taisan` |
| `src/modules/KiemThuApp/**` | `jdx-portal-kiemthu` | `src/modules/KiemThuApp/` | `kiemthu` |
| `src/modules/BaseIndexApp/**` | `jdx-portal-baseindex` | `src/modules/BaseIndexApp/` | `baseindex` |
| `src/modules/JpayApp/**` | `jdx-portal-jpay` | `src/modules/JpayApp/` | `jpay` |
| `src/modules/JGameApp/**` | `jdx-portal-jgame` | `src/modules/JGameApp/` | `jgame` |
| `.github/**` | `jdx-portal-agentskill` | `.github/` | `agentskill` |
| `Docker/**` | `sasuco-docker-website` | `Docker/` | `docker` |
| Còn lại (`src/shared/`, `src/App.tsx`, config, ...) | `webinvoice` (root) | `./` (project root) | `root` |

> **LƯU Ý 1:** `.github/` và `Docker/` là **repo độc lập** — KHÔNG commit chúng ở root.
> Root `.gitignore` đã chặn cả 2 thư mục này (chỉ còn file di sản force-track — nếu sửa phải commit đúng repo tương ứng).
>
> **LƯU Ý 2:** Nếu sửa cả root + portal → commit riêng từng repo, không gộp chung.

## Quy ước nhánh

TẤT CẢ repo (trừ Docker) dùng chung **2 nhánh: `main` + `development`**:

| Nhánh | Mục đích | Hành động |
| ----- | -------- | --------- |
| `main` | Production | 🚫 DỪNG — không commit trực tiếp lên `main`. Dùng `development`. |
| `development` | Lập trình hàng ngày | ✅ Tiếp tục |
| `development-*` | Nhánh từng lập trình viên | ✅ Tiếp tục |

Nếu đang ở `main`, switch về `development` trước khi commit:

```bash
git checkout development    # nhánh này đã tồn tại trên remote
```

> ⚠️ **NGOẠI LỆ DUY NHẤT — Repo Docker** (`sasuco-docker-website`):
> Chỉ có **1 nhánh `master`** trên remote (KHÔNG có `development`) — commit trực tiếp lên `master`. Không cố checkout `development` (sẽ lỗi).
>
> ℹ️ **Repo mới `jdx-portal-jgame`**: remote đang **trống (chưa có commit nào)** — local đã tạo sẵn nhánh `development` (unborn) tại `src/modules/JGameApp/`. Commit đầu tiên phải push kèm `-u`: `git push -u origin development` để tạo nhánh trên remote (các lần push sau dùng script bình thường).
