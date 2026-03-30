# Invest League

A Railway-ready private investing competition app built with Next.js, Prisma, PostgreSQL, Finnhub, and Frankfurter.

## What this starter already does

- username-style login with **name + password only**
- stores an optional profile picture in PostgreSQL as a data URL
- lets users create competitions
- lets users join competitions with a join code
- automatically opens the user's pinned / most recent competition first
- lets users record stock or cash BUY transactions
- supports fractional quantities like `0.5 SPY` or `1.2 SPY`
- refreshes current stock prices every 15 minutes through a protected job endpoint
- converts stock values into **EUR** for competition totals
- stores portfolio snapshots so the competition screen can show **all members** on the historical chart

## Important data safety notes

For Railway, your data safety should come from these choices:

1. **Use Railway PostgreSQL**, not local files.
2. **Do not store uploads on the app filesystem**. This starter stores profile pictures in Postgres so redeploys do not wipe them.
3. Enable **database backups / snapshots** in your Railway project.
4. Keep a copy of your `DATABASE_URL`, `AUTH_SECRET`, and `CRON_SECRET` in a password manager.
5. Consider setting up a small scheduled database dump outside Railway as an extra backup.

## Local setup

```bash
cp .env.example .env
npm install
npm run db:push
npm run seed
npm run dev
```

Login after seeding:

- name: `demo`
- password: `changeme123`

## Environment variables

```env
DATABASE_URL="postgresql://..."
APP_URL="https://your-app.up.railway.app"
AUTH_SECRET="long-random-secret"
CRON_SECRET="second-long-random-secret"
FINNHUB_API_KEY="your-finnhub-key"
```

## Deploy to Railway

### 1. Create services
- one **Web Service** for this Next.js app
- one **PostgreSQL** service

### 2. Set environment variables
Copy the variables above into Railway.

### 3. Build and start commands
- Build: `npm run build`
- Start: `npm run start`

### 4. Run migrations
This regenerated build expects Prisma migrations to be present. On a fresh database, the start command runs `prisma migrate deploy` automatically.

If you need local setup before migrations are created, you can still use:

```bash
npm run db:push
npm run seed
```

## 15-minute market refresh

Create a Railway cron or external scheduler that calls:

```text
POST /api/jobs/refresh-market-data
Authorization: Bearer YOUR_CRON_SECRET
```

Schedule:

```cron
*/15 * * * *
```

## Valuation rules

- **Stocks / ETFs**: user enters ticker, quantity, and entry price. The app fetches latest price every 15 minutes and converts totals to **EUR**.
- **Cash**: user enters quantity and price per unit in EUR. Cash value does not change.
- Portfolio totals, leaderboard, and chart values are stored in **EUR** snapshots.

## Current MVP limitations

- only BUY transactions are implemented
- stock quotes are fetched from Finnhub and converted to EUR using a USD/EUR rate
- EUR-native stocks are supported by setting the stock currency to EUR when adding the transaction
- there is no password reset flow
- there is no sell logic, dividend logic, or benchmark comparison yet

## Best next improvements

- add SELL transactions
- auto-detect ticker currency from a symbol lookup API
- add admin competition settings page
- add export and backup tools
- add benchmark comparison
