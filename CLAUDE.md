# Recipe App — CLAUDE.md

A personal recipe-tracking web app for two users, self-hosted on a VPS.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | SQLite via Prisma ORM |
| Auth | NextAuth.js v4 (credentials) |
| Image storage | Local filesystem (`/uploads`) |
| Deployment | Docker + Caddy (auto HTTPS) |
| Node version | 18.x (must use `npm_config_ignore_engines=true` for installs) |

## Commands

```bash
# Development
npm run dev              # Start dev server on :3000

# Database
npm run db:migrate       # Create + apply new migration
npm run db:seed          # Seed the two user accounts
npm run db:studio        # Open Prisma Studio (DB GUI)

# Production (on VPS)
docker compose up -d --build
```

## Project Structure

```
src/
  app/
    api/
      auth/[...nextauth]/  # NextAuth handler
      recipes/             # CRUD: GET /api/recipes, POST /api/recipes
      recipes/[id]/        # GET, PUT, DELETE /api/recipes/:id
      upload/              # POST /api/upload (multipart/form-data)
      static/[...path]/    # Serves /uploads/* in dev (Caddy handles it in prod)
    login/                 # Login page
    recipes/new/           # Add recipe
    recipes/[id]/          # View recipe
    recipes/[id]/edit/     # Edit recipe
    page.tsx               # Home (recipe grid)
    layout.tsx             # Root layout (Navbar, SessionProvider)
    providers.tsx          # Client-side SessionProvider wrapper
  components/
    Navbar.tsx             # Top nav with auth state
    RecipeCard.tsx         # Card shown in the recipe grid
    RecipeForm.tsx         # Shared add/edit form (client component)
  lib/
    db.ts                  # Prisma singleton
    auth.ts                # NextAuth config + options
  types/
    next-auth.d.ts         # Augment Session type with user.id
prisma/
  schema.prisma            # Models: User, Recipe, Ingredient, Step, Image
  seed.ts                  # Seeds 2 user accounts
uploads/                   # Stored recipe images (gitignored)
Dockerfile                 # Multi-stage build (Node 20 Alpine)
docker-compose.yml         # App + Caddy services
Caddyfile                  # Reverse proxy + auto HTTPS (replace yourdomain.com)
```

## Data Models

- **User** — id, name, email, passwordHash
- **Recipe** — title, description, prepTime, cookTime, servings → belongs to User
- **Ingredient** — name, quantity, unit, order → belongs to Recipe (cascade delete)
- **Step** — order, instruction → belongs to Recipe (cascade delete)
- **Image** — path, alt → belongs to Recipe (cascade delete)

## Auth

- Two user accounts seeded via `prisma/seed.ts`
- Credentials: `you@example.com / changeme` and `her@example.com / changeme`
- **Change these passwords before deploying** (update seed or use Prisma Studio)
- All routes redirect to `/login` if unauthenticated

## Environment Variables

See `.env` for development. For production create `.env.production`:

```env
DATABASE_URL=file:/app/data/production.db
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
NEXTAUTH_URL=https://yourdomain.com
```

## Deployment on VPS

1. Clone repo on VPS
2. Create `.env` with production values
3. Update `Caddyfile` with your domain
4. `docker compose up -d --build`
5. Caddy handles HTTPS automatically via Let's Encrypt

## Image Uploads

- Dev: served through `/api/static/[...path]` (Next.js API route)
- Prod: served directly by Caddy from the shared `app_uploads` Docker volume (faster)
- Files stored at `uploads/{recipeId}/{uuid}.ext`
- Path stored in the `Image` table

## Known Constraints

- Node 18.16.1 installed locally — slightly below the official requirement for Next.js 14 and Prisma 5
- Always prefix npm installs with `npm_config_ignore_engines=true`
- On VPS/Docker, Node 20 is used (see Dockerfile) — no issues there
