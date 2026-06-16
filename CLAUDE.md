# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm start:dev          # watch mode (development)
pnpm build              # compile to dist/
pnpm start              # run compiled dist/main.js
pnpm lint               # ESLint with auto-fix
pnpm test               # Jest

# TypeORM migrations (requires a valid DATABASE_URL in .env)
pnpm migration:generate -- -d src/data-source.ts migrations/MigrationName
pnpm migration:run      -- -d src/data-source.ts
pnpm migration:revert   -- -d src/data-source.ts
```

Copy `.env.example` to `.env` and fill in all values before running.

## Architecture

**armory-backend** is a NestJS REST API for "Armería TFALP" — a firearms/ammunition e-commerce platform. It uses TypeORM with PostgreSQL and Cloudinary for image storage.

### Bootstrap behaviour

`main.ts` runs `usersService.seedAdmin()` on every startup. This creates (or promotes) the superadmin account using `SUPERADMIN_EMAIL` / `ADMIN_PASSWORD` env vars. All routes are prefixed with `/api`. CORS is restricted to `FRONTEND_URL` and `ADMIN_URL`.

`app.module.ts` uses `synchronize: true` — TypeORM auto-syncs the schema from entities. **There are no migration files** in this repo; schema changes are applied automatically. Do not set `synchronize: false` without introducing proper migrations first.

### Auth & guards

Two guards are composed on protected routes:

| Guard | File | Behaviour |
|---|---|---|
| `JwtAuthGuard` | `auth/jwt-auth.guard.ts` | Validates Bearer token; attaches full `User` entity to `req.user` via `JwtStrategy.validate()` |
| `SuperadminGuard` | `users/superadmin.guard.ts` | Requires `req.user.role === 'superadmin'`; must follow `JwtAuthGuard` |

Public reads (product list, individual product, categories, brands, store config) use no guard. Mutations always require `JwtAuthGuard`. User management (`/api/users`) requires both guards stacked.

### Module structure

Each domain has the standard NestJS quartet: `*.entity.ts`, `*.controller.ts`, `*.service.ts`, `*.module.ts`. The service holds all business logic; controllers are thin. No repository class — services inject TypeORM `Repository<Entity>` directly.

### Cross-module dependencies

`AmmoSalesService` depends on `AmmoStockService` to write stock history after every sale or reversal. Both operations run inside a `DataSource.transaction()` to keep the stock quantity and the sale record consistent. When a sale is deleted, the stock is restored and a `sale_reversal` history entry is written.

### Image uploads

`UploadsModule` exposes `POST /api/uploads/image` (auth-guarded). It accepts a `multipart/form-data` file via Multer (memory storage) and streams it directly to Cloudinary under the `armory/products` folder, returning the `secure_url`. The URL is then stored on the product entity.

Product images are tracked in a separate `product_images` table (`ProductImage` entity). `product.imageUrl` is kept in sync with `images[0].url` as a convenience denormalization. When updating images, the service calls `imageRepo.delete({ product: { id } })` (not `remove()`) to avoid cascade conflicts before inserting the new set.

### Store config

`StoreConfig` is a simple key-value table seeded with defaults on module init (`OnModuleInit`). `GET /api/store-config/public` is unauthenticated and returns only the keys in `PUBLIC_KEYS` (currently `whatsapp_number`, `whatsapp_greeting`). The admin endpoint returns and updates all keys.

### Protected superadmin account

`UsersService` reads `SUPERADMIN_EMAIL` from config. Any update or delete targeting that email is rejected with a `ForbiddenException`. The seed also re-promotes the account to `superadmin` if its role was manually downgraded.

### Path alias

`@/*` maps to `src/*` in `tsconfig.json`. Use `@/` for imports within `src/`.
