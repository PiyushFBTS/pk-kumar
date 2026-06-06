# P. R. Kumar & Co. — Website

Unified **Next.js 16** (App Router) application — frontend **and** backend (Route Handlers) in one codebase. See `../IMPLEMENTATION_PLAN.md` for the full sprint plan.

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS v4
- Prisma 7 + MySQL (via the `@prisma/adapter-mariadb` driver adapter)
- JWT + bcrypt auth · Nodemailer · Tiptap (added in later sprints)

## Prerequisites

- Node.js 20.9+
- A local MySQL 8 server

## Setup

```bash
npm install

# 1. Configure environment
cp .env.example .env
#    Edit .env → set DATABASE_URL to your local MySQL, e.g.
#    DATABASE_URL="mysql://root:yourpassword@localhost:3306/prkumar"

# 2. Create the database (once)
#    In MySQL: CREATE DATABASE prkumar;

# 3. Generate client + run the first migration
npm run db:generate
npm run db:migrate        # creates tables from prisma/schema.prisma

# 4. Seed baseline content (partners, practice areas, resources, admin user)
npm run db:seed
#    Admin login → admin@prkumar.in / ChangeMe@123  (change in production)

# 5. Start the dev server
npm run dev               # http://localhost:3000
```

## Scripts

| Script                    | Purpose                      |
| ------------------------- | ---------------------------- |
| `npm run dev`             | Start dev server             |
| `npm run build` / `start` | Production build / serve     |
| `npm run lint`            | ESLint                       |
| `npm run typecheck`       | `tsc --noEmit`               |
| `npm run format`          | Prettier write               |
| `npm run db:migrate`      | Create/apply a dev migration |
| `npm run db:seed`         | Seed baseline content        |
| `npm run db:studio`       | Prisma Studio (DB GUI)       |
| `npm run db:reset`        | Drop + recreate + reseed     |

## Structure

```
src/
  app/
    (public)/       marketing pages + shared header/footer layout
    (auth)/         login, register
    account/        signed-in user area (My Articles)
    admin/          admin dashboard + approval queue
  components/       shared UI
  lib/              prisma, auth, email, env, site config
  generated/prisma/ Prisma 7 generated client (gitignored)
prisma/
  schema.prisma     data model
  seed.ts           seed script
prisma.config.ts    Prisma 7 config (datasource url for migrations)
```

> **Note (Prisma 7):** the DB connection URL lives in `prisma.config.ts` (for the CLI/migrations) and is passed to `PrismaClient` via the MariaDB driver adapter in `src/lib/prisma.ts`. The schema `datasource` block no longer contains `url`.
