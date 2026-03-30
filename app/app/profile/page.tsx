import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <main className="page">
      <div className="card stack" style={{ maxWidth: 640 }}>
        <h1 style={{ margin: 0 }}>Profile</h1>
        {user.profileImageDataUrl ? <img src={user.profileImageDataUrl} alt={user.name} className="avatar" /> : null}
        <div><strong>Name:</strong> {user.name}</div>
        <div className="muted">Password reset is intentionally not included because this app is for a private group.</div>
      </div>
    </main>
  );
}
