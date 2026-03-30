import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/forms';
import { createSession, hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  const formData = await request.formData();
  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    password: formData.get('password'),
    profileImageDataUrl: formData.get('profileImageDataUrl') || undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid registration data' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { name: parsed.data.name } });
  if (existing) return NextResponse.json({ error: 'Name is already taken' }, { status: 409 });

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      passwordHash: await hashPassword(parsed.data.password),
      profileImageDataUrl: parsed.data.profileImageDataUrl || null,
    },
  });

  await createSession(user.id);
  return NextResponse.redirect(new URL('/app', request.url));
}
