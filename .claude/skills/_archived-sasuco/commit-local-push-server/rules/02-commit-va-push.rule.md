# Rule: Commit & Push

## Format commit message

```text
<type>(<scope>): <mô tả tiếng Việt>
```

| Type | Khi nào |
| ---- | ------- |
| `feat` | Tính năng mới |
| `fix` | Sửa bug |
| `refactor` | Cải tiến code, tái cấu trúc |
| `chore` | Config, skill, dependencies |

Scope = cột `Scope` trong bảng ánh xạ (`root`, `agentskill`, `docker`, `invoice`, `admin`, ...).

## Cách commit theo repo (luôn `cd` vào thư mục repo trước)

```bash
# === REPO ROOT ===
cd <project-root>
git add <files không thuộc portal/.github/Docker>
git commit -m "feat(root): cập nhật cấu hình Vite"

# === REPO .github ===
cd .github
git checkout development   # nếu đang ở main
git add -A
git commit -m "chore(agentskill): cập nhật skill commit-local-push-server"
cd ..

# === REPO DOCKER ===
cd Docker
# master là branch chính — commit trực tiếp (KHÔNG checkout development)
git add -A
git commit -m "chore(docker): cập nhật Dockerfile"
cd ..

# === REPO PORTAL ===
cd src/modules/InvoiceApp
git checkout development   # nếu đang ở main
git add -A
git commit -m "feat(invoice): thêm màn hình quản lý hóa đơn"
cd ../../..  # quay lại root
```

> ⚠️ Luôn `cd` vào thư mục repo trước khi git add/commit. Mỗi repo có `.git` riêng.
> Nếu sửa nhiều repo → commit tuần tự từng repo, không gộp.

## Ngưỡng push (khi KHÔNG có cờ force)

| Repo | Nhánh push | Push khi |
| ---- | ---------- | :------: |
| Root (`webinvoice`) | `development` | ≥ 5 commit |
| Tất cả portal repos | `development` | ≥ 3 commit |
| `.github` (`jdx-portal-agentskill`) | `development` | ≥ 3 commit |
| `Docker` (`sasuco-docker-website`) | `master` | ≥ 3 commit |

> Portal/`.github`/`Docker` push với ngưỡng thấp hơn (3) vì mỗi repo ít commit hơn root.

## Đếm commit chưa push

```bash
# Root / Portal / .github (nhánh development)
git log origin/development..HEAD --oneline

# Docker (nhánh master — ngoại lệ)
git log origin/master..HEAD --oneline
```

## Pull đồng bộ TRƯỚC, rồi Push

> ⚠️ BẮT BUỘC pull trước khi push. Nếu dev khác đã push lên `development`
> (hoặc Docker `master`), `git push origin development` sẽ bị **reject
> non-fast-forward**. Luôn `pull --rebase` để đồng bộ code mới nhất, rồi mới push.

```bash
# Tất cả repo (trừ Docker)
git pull --rebase origin development

# Docker
git pull --rebase origin master
```

> Nếu pull có conflict → DỪNG, không push; xử lý conflict thủ công rồi mới tiếp tục.

```bash
# Tất cả repo (trừ Docker) push lên nhánh development
git push origin development

# Docker push lên master
git push origin master
```
