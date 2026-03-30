import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { addTransactionSchema } from '@/lib/forms';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ competitionId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL('/login', request.url), 303);

  const { competitionId } = await params;
  const membership = await prisma.competitionMember.findUnique({
    where: { competitionId_userId: { competitionId, userId: user.id } },
  });
  if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const formData = await request.formData();
  const assetType = String(formData.get('assetType') || 'STOCK').toUpperCase();
  const parsed = addTransactionSchema.safeParse({
    assetType,
    ticker: String(formData.get('ticker') || '').toUpperCase(),
    companyName: formData.get('companyName') || '',
    quantity: formData.get('quantity'),
    pricePerShare: formData.get('pricePerShare'),
    quoteCurrency: assetType === 'CASH' ? 'EUR' : String(formData.get('quoteCurrency') || 'USD').toUpperCase(),
    executedAt: formData.get('executedAt'),
    note: formData.get('note') || '',
  });

  if (!parsed.success) return NextResponse.json({ error: 'Invalid transaction data' }, { status: 400 });

  await prisma.investmentTransaction.create({
    data: {
      competitionId,
      userId: user.id,
      assetType: parsed.data.assetType,
      ticker: parsed.data.assetType === 'CASH' ? parsed.data.ticker || 'CASH' : parsed.data.ticker,
      companyName: parsed.data.companyName || null,
      quantity: parsed.data.quantity,
      pricePerShare: parsed.data.pricePerShare,
      quoteCurrency: parsed.data.assetType === 'CASH' ? 'EUR' : parsed.data.quoteCurrency,
      executedAt: new Date(parsed.data.executedAt),
      note: parsed.data.note || null,
    },
  });

  return NextResponse.redirect(new URL(`/app/competitions/${competitionId}`, request.url), 303);
}
