# Copilot Instructions for freshbytes-admin

## Overview
`freshbytes-admin` is a Nuxt 3–based admin dashboard built with TailwindCSS and Flowbite.
It communicates with a JWT-secured REST API (base URL from `NUXT_PUBLIC_API_LINK`).
Key directories:
- `plugins/`: intercept HTTP requests, restore auth state
- `composables/`: reusable hooks (`useAuth`, `useProducts`, `useClickOutside`, `useFlowbite`)
- `components/`: UI primitives and feature groups (e.g., `components/products/ProductTable.vue`)
- `pages/`: file-system–based routing; nested folders map to nested routes
- `layouts/`: custom layouts (e.g., `home.vue`, `products.vue`)

## Setup & Workflow
- Install: `npm install` (or `pnpm install`, `yarn install`)
- Dev server: `npm run dev` → http://localhost:3000 (hot reload, ESLint on save)
- Build: `npm run build`
- Preview production build: `npm run preview`
- Static site generation: `npm run generate`
- Post-install hook: runs `nuxt prepare` to prebuild .vercel files

## Configuration
- Environment variable: `NUXT_PUBLIC_API_LINK` for backend endpoint
- Defined in `nuxt.config.ts` under `runtimeConfig.public.API_LINK`
- Global CSS in `assets/css/main.css` and Tailwind config via `@tailwindcss/vite` plugin

## Authentication & API
- `plugins/api.js`: attaches `Authorization: Bearer <token>` to `$fetch` calls; logs out on 401
- `plugins/auth.client.ts`: restores tokens from cookies `auth-access-token` / `auth-refresh-token`, fetches current user on init
- `composables/useAuth.ts`: exposes `login()`, `logout()`, `refreshAccessToken()`, `resetPassword()`, `register()`, plus reactive `user`, `accessToken`, `isLoggedIn`

## Conventions & Patterns
- File naming: PascalCase for components (`ProductAddModal.vue`), suffix modals with `Modal` for dialogs
- Group domain components under subfolders (e.g., `components/categories/`) and reuse patterns across features
- Use `useState()` for global reactive state; avoid other state libraries
- API calls with Nuxt `$fetch`; always interpolate `apiBase = useRuntimeConfig().public.API_LINK`
- Route guards: `middleware/auth.js` (restricts authenticated routes), `middleware/guest.ts` (redirects authenticated users away from login/register)

## Key Files to Reference
- `nuxt.config.ts`: module setup, devtools, runtimeConfig
- `plugins/api.js` / `plugins/auth.client.ts`: core HTTP/auth logic
- `composables/useAuth.ts`: JWT lifecycle management
- `components/FormAuth.vue`: example form binding, validation triggers

## Tips for Copilot
- When adding new feature pages, mirror directory structure under `pages/` for routing
- Follow existing modal patterns (props + `v-model:show`) for consistency
- Leverage `useClickOutside` for closing dropdowns/modals
- Run `npm run dev` before generating code to verify routes/loaders live

Please review and let me know if any sections need more detail or clarification.
