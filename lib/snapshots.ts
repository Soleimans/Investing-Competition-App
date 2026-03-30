import { prisma } from '@/lib/prisma';
import { fetchQuoteInEur, fetchUsdToEurRate } from '@/lib/market';
import { toNumber } from '@/lib/utils';

type PriceKey = `${string}:${string}`;

function makeKey(ticker: string, quoteCurrency: string): PriceKey {
  return `${ticker.toUpperCase()}:${quoteCurrency.toUpperCase()}`;
}

function getSnapshotTimestamp() {
  const now = new Date();
  now.setSeconds(0, 0);
  now.setMinutes(Math.floor(now.getMinutes() / 15) * 15);
  return now;
}

export async function refreshMarketData() {
  const competitions = await prisma.competition.findMany({
    where: { OR: [{ endDate: null }, { endDate: { gte: new Date() } }] },
    include: { members: true, transactions: true },
  });

  const stockPositions = competitions.flatMap((competition) =>
    competition.transactions.filter((transaction) => transaction.assetType === 'STOCK'),
  );

  const uniqueSymbols = Array.from(
    new Set(stockPositions.map((transaction) => makeKey(transaction.ticker, transaction.quoteCurrency))),
  );

  const priceMap = new Map<PriceKey, number>();
  const usdToEurRate = uniqueSymbols.some((symbol) => symbol.endsWith(':USD')) ? await fetchUsdToEurRate() : 1;

  for (const symbol of uniqueSymbols) {
    const [ticker, quoteCurrency] = symbol.split(':') as [string, 'USD' | 'EUR'];
    try {
      const quote = await fetchQuoteInEur(ticker, quoteCurrency);
      priceMap.set(symbol, quote.eurPrice);
      await prisma.symbolPriceSnapshot.create({
        data: { ticker, price: quote.eurPrice, currency: 'EUR', source: quote.source, fetchedAt: getSnapshotTimestamp() },
      });
    } catch (error) {
      console.error(`Failed to fetch ${symbol}`, error);
    }
  }

  const snapshottedAt = getSnapshotTimestamp();

  for (const competition of competitions) {
    for (const member of competition.members) {
      const transactions = competition.transactions.filter((transaction) => transaction.userId === member.userId);
      let totalCost = 0;
      let totalValue = 0;

      for (const transaction of transactions) {
        const quantity = toNumber(transaction.quantity);
        const entryPrice = toNumber(transaction.pricePerShare);
        const costFx = transaction.assetType === 'CASH' || transaction.quoteCurrency === 'EUR' ? 1 : usdToEurRate;
        const costEur = quantity * entryPrice * costFx;
        totalCost += costEur;

        if (transaction.assetType === 'CASH') {
          totalValue += costEur;
          continue;
        }

        totalValue += quantity * (priceMap.get(makeKey(transaction.ticker, transaction.quoteCurrency)) ?? (entryPrice * costFx));
      }

      await prisma.portfolioSnapshot.create({
        data: {
          competitionId: competition.id,
          userId: member.userId,
          totalCost,
          totalValue,
          pnl: totalValue - totalCost,
          snapshottedAt,
        },
      });
    }
  }

  return { competitions: competitions.length, tickers: uniqueSymbols.length };
}
