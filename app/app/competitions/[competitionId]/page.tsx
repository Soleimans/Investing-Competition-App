import { notFound, redirect } from 'next/navigation';
import { CompetitionChart } from '@/components/CompetitionChart';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatMoney, toNumber } from '@/lib/utils';

function roundTo15Minutes(date: Date) {
  const rounded = new Date(date);
  rounded.setSeconds(0, 0);
  rounded.setMinutes(Math.floor(rounded.getMinutes() / 15) * 15);
  return rounded;
}

export default async function CompetitionPage({ params }: { params: Promise<{ competitionId: string }> }) {
  const { competitionId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const membership = await prisma.competitionMember.findUnique({
    where: { competitionId_userId: { competitionId, userId: user.id } },
    include: { competition: true },
  });
  if (!membership) notFound();

  await prisma.competitionMember.update({
    where: { competitionId_userId: { competitionId, userId: user.id } },
    data: { pinned: true, lastVisitedAt: new Date() },
  });
  await prisma.competitionMember.updateMany({
    where: { userId: user.id, competitionId: { not: competitionId }, pinned: true },
    data: { pinned: false },
  });

  const competition = await prisma.competition.findUnique({
    where: { id: competitionId },
    include: {
      members: { include: { user: true }, orderBy: { joinedAt: 'asc' } },
      transactions: { include: { user: true }, orderBy: { executedAt: 'desc' } },
      portfolioSnapshots: { include: { user: true }, orderBy: { snapshottedAt: 'asc' } },
    },
  });
  if (!competition) notFound();

  const latestByUser = new Map<string, (typeof competition.portfolioSnapshots)[number]>();
  for (let i = competition.portfolioSnapshots.length - 1; i >= 0; i -= 1) {
    const snapshot = competition.portfolioSnapshots[i];
    if (!latestByUser.has(snapshot.userId)) latestByUser.set(snapshot.userId, snapshot);
  }

  const leaderboard = competition.members
    .map((member) => {
      const latest = latestByUser.get(member.userId);
      const memberTransactions = competition.transactions.filter((transaction) => transaction.userId === member.userId);
      const investedCapital = memberTransactions.reduce(
        (sum, transaction) => sum + toNumber(transaction.quantity) * toNumber(transaction.pricePerShare),
        0,
      );
      const totalValue = latest ? toNumber(latest.totalValue) : investedCapital;
      const pnl = latest ? toNumber(latest.pnl) : 0;
      return { member, totalValue, pnl, investedCapital };
    })
    .sort((a, b) => b.totalValue - a.totalValue);

  const myEntry = leaderboard.find((entry) => entry.member.userId === user.id);
  const rank = Math.max(1, leaderboard.findIndex((entry) => entry.member.userId === user.id) + 1 || 1);

  const chartBuckets = new Map<string, Record<string, string | number>>();
  const memberNames = competition.members.map((member) => member.user.name);

  for (const snapshot of competition.portfolioSnapshots) {
    const bucket = roundTo15Minutes(new Date(snapshot.snapshottedAt)).toISOString();
    const row = chartBuckets.get(bucket) ?? {
      timestamp: new Date(bucket).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }) + ' ' +
        new Date(bucket).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    };
    row[snapshot.user.name] = toNumber(snapshot.totalValue);
    chartBuckets.set(bucket, row);
  }

  const chartData = Array.from(chartBuckets.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, row]) => {
      for (const name of memberNames) {
        if (!(name in row)) row[name] = 0;
      }
      return row;
    });

  return (
    <main className="page stack">
      <div className="space-between card">
        <div>
          <h1 style={{ margin: 0 }}>{competition.name}</h1>
          <div className="muted">Join code: {competition.joinCode}</div>
          <div className="muted">Competition currency: EUR</div>
        </div>
        <div className="badge">Started {new Date(competition.startDate).toLocaleDateString()}</div>
      </div>

      <div className="grid grid-3">
        <div className="card"><div className="muted">Your portfolio value</div><h2>{formatMoney(myEntry?.totalValue ?? 0)}</h2></div>
        <div className="card"><div className="muted">Your invested capital</div><h2>{formatMoney(myEntry?.investedCapital ?? 0)}</h2></div>
        <div className="card"><div className="muted">Your rank / P&amp;L</div><h2>#{rank} · <span className={(myEntry?.pnl ?? 0) >= 0 ? 'value-up' : 'value-down'}>{formatMoney(myEntry?.pnl ?? 0)}</span></h2></div>
      </div>

      <div className="grid grid-2">
        <div className="card stack">
          <div className="space-between">
            <h2 style={{ margin: 0 }}>Competition portfolio history</h2>
            <span className="muted">All members in EUR</span>
          </div>
          <CompetitionChart
            data={chartData.length ? chartData : [{ timestamp: 'Start', ...Object.fromEntries(memberNames.map((name) => [name, 0])) }]}
            seriesKeys={memberNames}
          />
        </div>

        <div className="card stack">
          <h2 style={{ margin: 0 }}>Leaderboard</h2>
          <table className="table">
            <thead><tr><th>#</th><th>User</th><th>Value</th><th>P&amp;L</th></tr></thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr key={entry.member.id}>
                  <td>{index + 1}</td>
                  <td>{entry.member.user.name}</td>
                  <td>{formatMoney(entry.totalValue)}</td>
                  <td className={entry.pnl >= 0 ? 'value-up' : 'value-down'}>{formatMoney(entry.pnl)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-2">
        <form className="card stack" method="post" action={`/api/competitions/${competitionId}/transactions`}>
          <h2 style={{ margin: 0 }}>Add investment</h2>
          <select className="input" name="assetType" defaultValue="STOCK" required>
            <option value="STOCK">Stock / ETF</option>
            <option value="CASH">Cash</option>
          </select>
          <input className="input" name="ticker" placeholder="Ticker or CASH label, e.g. SPY or EUR Cash" required />
          <input className="input" name="companyName" placeholder="Company or note (optional)" />
          <input className="input" type="number" step="0.000001" name="quantity" placeholder="Quantity, e.g. 0.5 or 1.2" required />
          <input className="input" type="number" step="0.000001" name="pricePerShare" placeholder="Price per unit in EUR for cash, or quote currency for stocks" required />
          <select className="input" name="quoteCurrency" defaultValue="USD" required>
            <option value="USD">Stock currency: USD</option>
            <option value="EUR">Stock currency: EUR</option>
          </select>
          <input className="input" type="datetime-local" name="executedAt" required />
          <textarea className="textarea" name="note" placeholder="Optional note" rows={3} />
          <button className="button" type="submit">Save investment</button>
        </form>

        <div className="card stack">
          <h2 style={{ margin: 0 }}>Recent transactions</h2>
          <table className="table">
            <thead><tr><th>User</th><th>Type</th><th>Asset</th><th>Qty</th><th>Unit price</th><th>Date</th></tr></thead>
            <tbody>
              {competition.transactions.slice(0, 12).map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.user.name}</td>
                  <td>{transaction.assetType}</td>
                  <td>{transaction.ticker}</td>
                  <td>{toNumber(transaction.quantity)}</td>
                  <td>{formatMoney(toNumber(transaction.pricePerShare), transaction.assetType === 'CASH' ? 'EUR' : transaction.quoteCurrency)}</td>
                  <td>{new Date(transaction.executedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
