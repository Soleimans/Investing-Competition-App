import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('changeme123', 12);

  const user = await prisma.user.upsert({
    where: { name: 'demo' },
    update: {},
    create: {
      name: 'demo',
      passwordHash,
    },
  });

  const competition = await prisma.competition.upsert({
    where: { slug: 'demo-investing-league' },
    update: {},
    create: {
      name: 'Demo Investing League',
      slug: 'demo-investing-league',
      joinCode: 'DEMO1234',
      startDate: new Date(),
      createdById: user.id,
    },
  });

  await prisma.competitionMember.upsert({
    where: {
      competitionId_userId: {
        competitionId: competition.id,
        userId: user.id,
      },
    },
    update: {
      role: 'OWNER',
      pinned: true,
      lastVisitedAt: new Date(),
    },
    create: {
      competitionId: competition.id,
      userId: user.id,
      role: 'OWNER',
      pinned: true,
      lastVisitedAt: new Date(),
    },
  });

  console.log('Seed complete.');
  console.log('Login: demo / changeme123');
}

main().finally(async () => {
  await prisma.$disconnect();
});
