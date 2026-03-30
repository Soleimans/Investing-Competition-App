import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/forms';
import { createSession, verifyPassword } from '@/lib/auth';

export async function POST(request: Request) {
  const formData = await request.formData();
  const parsed = loginSchema.safeParse({
    name: formData.get('name'),
    password: formData.get('password'),
  });

  if (!parsed.success) return NextResponse.json({ error: 'Invalid login data' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { name: parsed.data.name } });
  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  await createSession(user.id);
  return NextResponse.redirect(new URL('/app', request.url), 303);
}
