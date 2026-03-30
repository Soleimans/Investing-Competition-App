let usdToEurRateCache: { value: number; fetchedAt: number } | null = null;

export async function fetchUsdToEurRate() {
  const now = Date.now();
  if (usdToEurRateCache && now - usdToEurRateCache.fetchedAt < 5 * 60 * 1000) {
    return usdToEurRateCache.value;
  }

  const response = await fetch('https://api.frankfurter.dev/v2/rate/USD/EUR', { cache: 'no-store' });
  if (!response.ok) throw new Error('USD/EUR conversion lookup failed');
  const data = (await response.json()) as { rate?: number };
  if (!data.rate || data.rate <= 0) throw new Error('Invalid USD/EUR conversion rate');

  usdToEurRateCache = { value: data.rate, fetchedAt: now };
  return data.rate;
}

export async function fetchQuoteInEur(ticker: string, quoteCurrency: 'USD' | 'EUR' = 'USD') {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) throw new Error('FINNHUB_API_KEY is missing');

  const response = await fetch(
    `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(ticker)}&token=${apiKey}`,
    { cache: 'no-store' },
  );
  if (!response.ok) throw new Error(`Quote lookup failed for ${ticker}`);

  const data = (await response.json()) as { c?: number };
  if (!data.c || data.c <= 0) throw new Error(`No valid quote returned for ${ticker}`);

  const rate = quoteCurrency === 'USD' ? await fetchUsdToEurRate() : 1;
  return {
    ticker,
    nativePrice: data.c,
    nativeCurrency: quoteCurrency,
    eurPrice: data.c * rate,
    source: quoteCurrency === 'USD' ? 'finnhub+frankfurter' : 'finnhub',
  };
}
