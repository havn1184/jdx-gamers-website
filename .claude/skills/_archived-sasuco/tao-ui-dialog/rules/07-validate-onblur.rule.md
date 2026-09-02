# DLG-07 — Validate onBlur, không validate onChange

**Mức độ:** ERROR

Form trong dialog phải validate ở sự kiện `onBlur`, KHÔNG validate ngay khi gõ (`onChange`) — tránh làm phiền người dùng khi đang nhập dở.
