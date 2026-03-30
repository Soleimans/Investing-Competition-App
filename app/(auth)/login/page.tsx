export default function LoginPage() {
  return (
    <main className="page auth-shell">
      <form className="card stack" method="post" action="/api/auth/login">
        <h1 style={{ margin: 0 }}>Login</h1>
        <input className="input" name="name" placeholder="Name" required minLength={3} maxLength={30} />
        <input className="input" type="password" name="password" placeholder="Password" required minLength={8} />
        <button className="button" type="submit">Log in</button>
      </form>
    </main>
  );
}
