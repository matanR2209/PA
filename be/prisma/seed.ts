import dotenv from 'dotenv';
dotenv.config({ override: true });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DEV_USER_ID = process.env.DEFAULT_USER_ID ?? 'usr_dev';

async function main() {
  const existing = await prisma.user.findUnique({ where: { id: DEV_USER_ID } });

  if (existing) {
    console.log(`Dev user already exists: ${DEV_USER_ID}`);
    return;
  }

  const user = await prisma.user.create({
    data: {
      id:       DEV_USER_ID,
      email:    'dev@ideapa.local',
      password: 'no-auth-yet', // placeholder — not used until auth is built
    },
  });

  console.log(`Dev user created: ${user.id} (${user.email})`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
