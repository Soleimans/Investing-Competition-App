import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function AppHomePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const preferred = await prisma.competitionMember.findFirst({
    where: { userId: user.id },
    orderBy: [{ pinned: 'desc' }, { lastVisitedAt: 'desc' }, { joinedAt: 'desc' }],
    include: { competition: true },
  });

  if (preferred) redirect(`/app/competitions/${preferred.competitionId}`);

  return (
    <main className="page">
      <div className="grid grid-2">
        <form className="card stack" method="post" action="/api/competitions">
          <h2 style={{ margin: 0 }}>Create competition</h2>
          <input className="input" name="name" placeholder="Competition name" required />
          <textarea className="textarea" name="description" placeholder="Description" rows={4} />
          <input className="input" type="date" name="startDate" required />
          <button className="button" type="submit">Create</button>
        </form>

        <form className="card stack" method="post" action="/api/competitions/join">
          <h2 style={{ margin: 0 }}>Join competition</h2>
          <input className="input" name="joinCode" placeholder="Join code" required />
          <button className="button" type="submit">Join</button>
        </form>
      </div>

      <div style={{ marginTop: 16 }}>
        <Link href="/app/profile" className="badge">Go to profile</Link>
      </div>
    </main>
  );
}
