# Component Documentation

This document explains every component and page in the app: what it does, what data it needs, and how it fits into the overall flow.

---

## Pages

### `src/app/page.tsx` — Home (recipe grid)

**Type:** Server Component
**Auth:** Redirects to `/login` if not authenticated.

Fetches all recipes from the database (including the first image and ingredient list) and renders them as a grid of `RecipeCard` components. If there are no recipes yet, shows an empty state with a link to create the first one.

**Data fetched:**
```
Recipe { title, description, prepTime, cookTime, images[0], ingredients[], author }
```

---

### `src/app/login/page.tsx` — Login

**Type:** Client Component (`"use client"`)
**Auth:** Public — accessible without being logged in.

A centered form with email and password fields. On submit it calls `signIn("credentials", ...)` from NextAuth. On success, redirects to `/`. On failure, shows an inline error message.

**State:** `email`, `password`, `error`, `loading`

---

### `src/app/recipes/new/page.tsx` — New recipe

**Type:** Server Component (wraps a Client Component)
**Auth:** Redirects to `/login` if not authenticated.

A simple page that renders the shared `<RecipeForm />` with no initial data, which means it operates in "create" mode.

---

### `src/app/recipes/[id]/page.tsx` — Recipe detail

**Type:** Server Component
**Auth:** Redirects to `/login` if not authenticated.

Fetches a single recipe by its `id` (from the URL) and displays everything: title, author, timing, description, all images in a grid, the ingredient list, and the numbered steps. Has an "Edit" link in the top-right corner.

Returns a 404 if the recipe ID doesn't exist.

**Data fetched:**
```
Recipe { title, description, prepTime, cookTime, servings, author, images[], ingredients[], steps[] }
```

---

### `src/app/recipes/[id]/edit/page.tsx` — Edit recipe

**Type:** Server Component (wraps a Client Component)
**Auth:** Redirects to `/login` if not authenticated.

Fetches the existing recipe data and pre-fills the shared `<RecipeForm />` with it, putting it in "edit" mode. Returns 404 if the recipe doesn't exist.

---

## Components

### `src/components/Navbar.tsx`

**Type:** Client Component (`"use client"`)

The sticky top navigation bar. It reads the session with `useSession()` and conditionally renders:
- When **logged in**: the app name (link to `/`), an "+ Add recipe" button, the user's name, and a "Sign out" button.
- When **logged out**: just the app name.

The sign-out button calls `signOut()` from NextAuth, which clears the session cookie and redirects to `/login`.

---

### `src/components/RecipeCard.tsx`

**Type:** Server Component (no hooks, no state)

A card displayed in the recipe grid on the home page. It links to the recipe detail page (`/recipes/[id]`).

**Structure:**
- If the recipe has at least one image → shows it as a cover photo (using Next.js `<Image>` for optimised loading).
- If no image → shows a placeholder emoji.
- Below: title, optional description (clamped to 2 lines), and a meta row with total time / servings / ingredient count.

**Props:**
```ts
recipe: {
  id, title, description,
  prepTime, cookTime, servings,
  images: [{ path, alt }],
  ingredients: [{ id, name, quantity, unit }],
  author: { id, name }
}
```

---

### `src/components/RecipeForm.tsx`

**Type:** Client Component (`"use client"`)

The most complex component — a fully controlled form used for both **creating** and **editing** recipes. The `initial` prop determines which mode it operates in:
- `initial` is `undefined` → **create mode**: empty form, `POST /api/recipes`.
- `initial` has an `id` → **edit mode**: pre-filled form, `PUT /api/recipes/:id`.

**Form sections:**
1. **Basic info** — title (required), description, prep time, cook time, servings.
2. **Ingredients** — a dynamic list. Each row has quantity, unit, and name fields. Rows can be added or removed. Empty-name rows are filtered out before submission.
3. **Steps** — a dynamic list of numbered text areas. Rows can be added or removed. Empty rows are filtered out before submission.
4. **Photos** — shown only in create mode (file input, `multiple`). After the recipe is created, images are uploaded one-by-one to `POST /api/upload`.

**State managed:** `title`, `description`, `prepTime`, `cookTime`, `servings`, `ingredients[]`, `steps[]`, `imageFiles[]`, `loading`, `error`

---

## Lib / Infrastructure

### `src/lib/db.ts` — Prisma singleton

Exports a single `prisma` instance. In development, it's stored on `globalThis` to avoid creating a new connection on every hot-reload. In production, a fresh client is created once at startup.

```ts
import { prisma } from "@/lib/db";
const recipes = await prisma.recipe.findMany();
```

---

### `src/lib/auth.ts` — NextAuth configuration

Exports `authOptions` used by both the NextAuth API route and server-side session checks (`getServerSession`).

**Strategy:** JWT (stateless — no database session table needed).
**Provider:** Credentials — email + bcrypt password check against the `User` table.
**Callbacks:**
- `jwt` — adds `user.id` to the JWT token on first sign-in.
- `session` — exposes `user.id` on the session object so server components can use it.

---

### `src/app/providers.tsx` — Client-side session provider

A thin wrapper that renders `<SessionProvider>` from `next-auth/react`. It must be a Client Component because `SessionProvider` uses React context. It's imported in `layout.tsx` to wrap the entire app.

---

## API Routes

### `GET /api/recipes` — List all recipes

Returns all recipes with author, first image, and ingredients. Requires auth.

### `POST /api/recipes` — Create a recipe

Accepts JSON body: `{ title, description?, prepTime?, cookTime?, servings?, ingredients[], steps[] }`. Creates the recipe with the session user as author. Returns the new recipe (201).

### `GET /api/recipes/[id]` — Get one recipe

Returns a single recipe with all relations. Returns 404 if not found.

### `PUT /api/recipes/[id]` — Update a recipe

Replaces ingredients and steps (delete-all then re-insert). Accepts the same body shape as POST.

### `DELETE /api/recipes/[id]` — Delete a recipe

Deletes the recipe and all related records (cascade). Returns 204.

### `POST /api/upload` — Upload a recipe image

Accepts `multipart/form-data` with fields `file` (image) and `recipeId`. Saves the file to `uploads/{recipeId}/{uuid}.ext` on disk, creates an `Image` record in the database, and returns the record (201).

### `GET /api/static/[...path]` — Serve uploaded images (dev only)

Reads a file from the `uploads/` directory and returns it with the appropriate `Content-Type`. Protected against path traversal attacks. In production this route is bypassed — Caddy serves the `uploads/` volume directly.
