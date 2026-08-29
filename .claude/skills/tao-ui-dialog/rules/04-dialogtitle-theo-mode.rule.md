# DLG-04 — DialogTitle theo mode

**Mức độ:** WARN

Nếu dialog dùng chung cho nhiều mode (View/Create/Edit), `DialogTitle` phải thay đổi nội dung tương ứng theo mode (`isViewOnly`, `mode === 'view'|'create'|'edit'`).
