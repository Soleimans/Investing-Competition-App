import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createCompetitionSchema } from '@/lib/forms';
import { prisma } from '@/lib/prisma';
import { makeJoinCode, slugify } from '@/lib/utils';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL('/login', request.url));

  const formData = await request.formData();
  const parsed = createCompetitionSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || '',
    startDate: formData.get('startDate'),
  });

  if (!parsed.success) return NextResponse.json({ error: 'Invalid competition data' }, { status: 400 });

  const slugBase = slugify(parsed.data.name) || 'competition';
  const slug = `${slugBase}-${Math.random().toString(36).slice(2, 7)}`;

  const competition = await prisma.competition.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      startDate: new Date(parsed.data.startDate),
      createdById: user.id,
      joinCode: makeJoinCode(),
      slug,
      members: {
        create: { userId: user.id, role: 'OWNER', pinned: true, lastVisitedAt: new Date() },
      },
    },
  });

  return NextResponse.redirect(new URL(`/app/competitions/${competition.id}`, request.url));
}
