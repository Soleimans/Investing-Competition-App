import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { joinCompetitionSchema } from '@/lib/forms';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL('/login', request.url), 303);

  const formData = await request.formData();
  const parsed = joinCompetitionSchema.safeParse({ joinCode: String(formData.get('joinCode') || '').toUpperCase() });
  if (!parsed.success) return NextResponse.json({ error: 'Invalid join code' }, { status: 400 });

  const competition = await prisma.competition.findUnique({ where: { joinCode: parsed.data.joinCode } });
  if (!competition) return NextResponse.json({ error: 'Competition not found' }, { status: 404 });

  await prisma.competitionMember.upsert({
    where: { competitionId_userId: { competitionId: competition.id, userId: user.id } },
    update: { lastVisitedAt: new Date(), pinned: true },
    create: { competitionId: competition.id, userId: user.id, role: 'MEMBER', lastVisitedAt: new Date(), pinned: true },
  });

  await prisma.competitionMember.updateMany({
    where: { userId: user.id, competitionId: { not: competition.id }, pinned: true },
    data: { pinned: false },
  });

  return NextResponse.redirect(new URL(`/app/competitions/${competition.id}`, request.url), 303);
}
