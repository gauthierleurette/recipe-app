# Deployment Guide

How to deploy the recipe app on a VPS with a custom domain and automatic HTTPS.

---

## Requirements

- A VPS running Linux (Ubuntu 22.04 recommended)
- A domain name pointed at the VPS IP (A record)
- Docker and Docker Compose installed on the server
- Git access to the repository

---

## 1. Server setup (one-time)

SSH into your VPS and install Docker:

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker --version
docker compose version
```

---

## 2. Clone the repository

```bash
git clone https://github.com/gauthierleurette/recipe-app.git
cd recipe-app
git checkout develop   # or main once you merge
```

---

## 3. Configure environment

Create a `.env` file with production values:

```bash
cp .env.example .env
nano .env
```

Fill in the values:

```env
DATABASE_URL=file:/app/data/production.db
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=https://yourdomain.com
```

**Important:** `NEXTAUTH_SECRET` must be a random 32+ byte string. Generate it with:
```bash
openssl rand -base64 32
```

---

## 4. Configure your domain

Edit `Caddyfile` and replace `yourdomain.com` with your actual domain:

```bash
nano Caddyfile
```

```
recipes.yourdomain.com {
    handle /uploads/* {
        root * /srv
        file_server
    }
    reverse_proxy app:3000
}
```

Caddy will automatically obtain and renew a Let's Encrypt TLS certificate for the domain — no manual certificate management needed.

---

## 5. Deploy

```bash
docker compose up -d --build
```

This will:
1. Build the Next.js app image (using Node 20 Alpine)
2. Run database migrations automatically on startup
3. Start the Caddy reverse proxy on ports 80 and 443

Check the logs:

```bash
docker compose logs -f app     # Next.js app logs
docker compose logs -f caddy   # Caddy/HTTPS logs
```

---

## 6. Create user accounts

The seed script is meant for development. On the VPS, create accounts manually using Prisma Studio or a one-off script.

**Option A — one-off Node script (recommended):**

```bash
docker compose exec app node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('your-password', 12);
  await prisma.user.create({
    data: { name: 'Your name', email: 'you@yourdomain.com', passwordHash: hash }
  });
  console.log('User created');
}
main().finally(() => prisma.\$disconnect());
"
```

Repeat for the second user.

**Option B — Prisma Studio (from your local machine, tunnelled to the prod DB):**

Not recommended for production. Edit the DB locally instead.

---

## 7. Updating the app

```bash
git pull origin develop
docker compose up -d --build
```

Docker will rebuild the image and restart the container. The database is stored in a named volume (`app_data`) and is **not** affected by rebuilds.

---

## Data persistence

Data is stored in Docker named volumes — they survive container restarts and rebuilds:

| Volume | Contents |
|---|---|
| `app_data` | SQLite database (`production.db`) |
| `app_uploads` | Uploaded recipe images |
| `caddy_data` | TLS certificates (auto-managed by Caddy) |
| `caddy_config` | Caddy internal config |

---

## Backups

Back up the database and uploads with:

```bash
# Backup database
docker compose exec app sh -c "cp /app/data/production.db /app/data/backup-$(date +%Y%m%d).db"
docker cp recipe-app-app-1:/app/data/backup-$(date +%Y%m%d).db ./backup.db

# Backup uploads
docker run --rm -v recipe-app_app_uploads:/data -v $(pwd):/backup alpine \
  tar czf /backup/uploads-$(date +%Y%m%d).tar.gz -C /data .
```

---

## Troubleshooting

**App not reachable after deploy:**
```bash
docker compose ps          # Are all containers running?
docker compose logs app    # Any startup error?
```

**HTTPS not working:**
```bash
docker compose logs caddy  # Caddy will show certificate errors
```
Make sure your domain A record points to the correct IP and has propagated (can take a few minutes).

**Database issues:**
```bash
docker compose exec app npx prisma migrate status
```
