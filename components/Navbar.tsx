import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href={user ? '/app' : '/'}><strong>Invest League</strong></Link>
        <div className="row">
          {user ? (
            <>
              <Link href="/app/profile" className="badge">{user.name}</Link>
              <form action="/api/auth/logout" method="post">
                <button className="button secondary" type="submit">Log out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="badge">Login</Link>
              <Link href="/register" className="button">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
