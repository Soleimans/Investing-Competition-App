import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect('/app');

  return (
    <main className="hero page">
      <div className="grid grid-2" style={{ alignItems: 'center' }}>
        <div className="stack">
          <span className="badge">Railway-ready</span>
          <h1 style={{ fontSize: 52, lineHeight: 1.05, margin: 0 }}>Private investing competitions for your group</h1>
          <p className="muted" style={{ fontSize: 18 }}>
            Create leagues, join by code, record stock purchases, and compare portfolio performance on a shared leaderboard.
          </p>
          <div className="row">
            <Link href="/register" className="button">Create account</Link>
            <Link href="/login" className="button secondary">Login</Link>
          </div>
        </div>
        <div className="card stack">
          <h2 style={{ margin: 0 }}>Included in this starter</h2>
          <div className="muted">Name + password authentication</div>
          <div className="muted">Competition creation and join codes</div>
          <div className="muted">Transaction entry by ticker</div>
          <div className="muted">15-minute market refresh endpoint</div>
          <div className="muted">Stored portfolio snapshots for historical charts</div>
        </div>
      </div>
    </main>
  );
}
