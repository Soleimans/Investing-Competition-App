import { AvatarUpload } from '@/components/AvatarUpload';

export default function RegisterPage() {
  return (
    <main className="page auth-shell">
      <form className="card stack" method="post" action="/api/auth/register">
        <h1 style={{ margin: 0 }}>Create account</h1>
        <input className="input" name="name" placeholder="Name" required minLength={3} maxLength={30} />
        <input className="input" type="password" name="password" placeholder="Password" required minLength={8} />
        <AvatarUpload />
        <button className="button" type="submit">Register</button>
      </form>
    </main>
  );
}
