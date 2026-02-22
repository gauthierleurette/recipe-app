# Development Guide

How to run the project locally, make changes, and manage the database.

---

## Prerequisites

- **Node.js >= 20** (required by Next.js 14 and Prisma 5)
- **npm** (comes with Node)
- **Git**

---

## First-time setup

```bash
# Clone and install
git clone https://github.com/gauthierleurette/recipe-app.git
cd recipe-app
git checkout develop
npm install

# Set up environment
cp .env.example .env
# The default .env works for local development without any changes

# Create the database and seed user accounts
npx prisma migrate dev

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Log in with one of the seeded accounts:
- `you@example.com` / `changeme`
- `her@example.com` / `changeme`

---

## Changing user credentials

### Option A — Edit the seed file (easiest)

Open [prisma/seed.ts](../prisma/seed.ts) and update the `users` array:

```ts
const users = [
  { name: "Gauthier", email: "gauthier@example.com", password: "my-secure-password" },
  { name: "Sophie", email: "sophie@example.com", password: "her-secure-password" },
];
```

Then re-run the seed:

```bash
npm run db:seed
```

The `upsert` logic means it won't create duplicates — it skips existing emails. If you're changing a password for an account that already exists, delete the user first via Prisma Studio, then re-seed.

### Option B — Prisma Studio (no code needed)

```bash
npm run db:studio
```

This opens a GUI at [http://localhost:5555](http://localhost:5555) where you can view and edit all tables directly. To change a password:

1. Open the `User` table.
2. Find the user and click the row.
3. You **cannot** paste a plain password — it must be hashed. Use the Node REPL to generate a hash first:

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('new-password', 12).then(console.log)"
```

Copy the output hash into the `passwordHash` field in Studio and save.

### Option C — One-line Node script

```bash
node -e "
const {PrismaClient} = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
bcrypt.hash('new-password', 12).then(hash =>
  prisma.user.update({ where: { email: 'you@example.com' }, data: { passwordHash: hash } })
).then(() => { console.log('Done'); prisma.\$disconnect(); });
"
```

---

## Available commands

```bash
npm run dev          # Start dev server on http://localhost:3000 (hot reload)
npm run build        # Production build (used by Docker)
npm run start        # Run the production build locally

npm run db:migrate   # Create and apply a new migration after schema changes
npm run db:seed      # Re-run the seed script (create/update users)
npm run db:studio    # Open Prisma Studio (database GUI)

npm run lint         # Run ESLint
```

---

## Making schema changes

1. Edit [prisma/schema.prisma](../prisma/schema.prisma)
2. Run:
```bash
npm run db:migrate
# Prisma will prompt for a migration name, e.g. "add_tags_to_recipe"
```
3. Prisma generates a SQL file in `prisma/migrations/` and applies it to your local DB.
4. Commit both the updated `schema.prisma` and the new migration file.

---

## Project structure at a glance

```
src/
  app/              Next.js App Router — pages and API routes
  components/       Reusable React components
  lib/              Shared utilities (db client, auth config)
  types/            TypeScript type augmentations
prisma/
  schema.prisma     Database schema
  seed.ts           Seeds the initial user accounts
  migrations/       Auto-generated SQL migration files
docs/               This documentation
uploads/            Recipe images (gitignored, created at runtime)
Dockerfile          Production Docker image
docker-compose.yml  Orchestrates app + Caddy
Caddyfile           Caddy reverse proxy config (HTTPS)
CLAUDE.md           AI assistant context file
```

---

## Git workflow

```
main        ← stable, production-ready code
develop     ← active development branch
```

Work on `develop`, and merge to `main` when you want to deploy a stable version.

```bash
# Start working
git checkout develop
git pull origin develop

# Make changes, then commit
git add <files>
git commit -m "feat: describe your change"
git push origin develop

# When ready to deploy
git checkout main
git merge develop
git push origin main
# Then on the VPS: git pull && docker compose up -d --build
```
