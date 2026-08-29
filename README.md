# JDX-Gamers Website

React + TypeScript + Vite, Tailwind CSS v4, shadcn/ui (radix-nova), React Router.

## Cấu trúc

```
src/
├── modules/    # Portal độc lập (xem .claude/skills/cau-truc-du-an)
├── shared/     # Thư viện dùng chung (components, lib, services, utils)
├── styles/     # CSS toàn cục (globals.css)
├── App.tsx     # Root component + HashRouter
└── main.tsx    # Entry point
```

## Scripts

```
npm run dev       # dev server
npm run build      # typecheck + build production
npm run lint       # oxlint
npm run preview    # preview production build
```
