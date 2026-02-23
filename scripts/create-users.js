'use strict';
// Usage: docker compose exec app node scripts/create-users.js
//
// Edit the USERS array below, then run the command above on your VPS.

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// ── Configure your users here ──────────────────────────────────────────────
const USERS = [
  { name: 'Gauthier', email: 'gauthier@nosrecettes.online', password: 'change-me-now' },
  { name: 'Partenaire', email: 'partenaire@nosrecettes.online', password: 'change-me-now' },
];
// ──────────────────────────────────────────────────────────────────────────

const prisma = new PrismaClient();

async function main() {
  for (const u of USERS) {
    const passwordHash = await bcrypt.hash(u.password, 12);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, passwordHash },
      create: { name: u.name, email: u.email, passwordHash },
    });
    console.log(`Created/updated: ${u.email}`);
  }
}

main()
  .then(() => console.log('Done.'))
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
