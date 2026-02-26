# Pollster

Create polls, share them with anyone, and watch votes roll in — live.

**[Live Demo](https://pollster-bitcoineo.vercel.app)**

## Features

- **Real-time results** — votes stream in via Server-Sent Events (SSE) with no page refresh
- **Anonymous voting** — anyone with the link can vote, no account required
- **One vote per person** — IP-based deduplication enforced at the database level
- **Google OAuth + email/password** — poll creators sign in to manage their polls
- **Poll lifecycle** — create, share, monitor live, and close when you're done
- **Shareable links** — every poll gets a unique short URL
- **Gamified interactions** — confetti on vote, staggered result animations, live vote ping indicators
- **Warm organic UI** — amber/orange design system with dark mode support

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 14](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Database | [Turso](https://turso.tech) (libSQL / SQLite) |
| ORM | [Drizzle ORM](https://orm.drizzle.team) |
| Auth | [Auth.js v5](https://authjs.dev) (NextAuth beta) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com) |
| Real-time | Server-Sent Events (SSE) |
| Deployment | [Vercel](https://vercel.com) |

## Getting Started

### Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io)
- A [Turso](https://turso.tech) database (or use a local SQLite file for development)
- Google OAuth credentials (optional — email/password works without it)

### Setup

```bash
git clone https://github.com/your-username/pollster.git
cd pollster
pnpm install
```

Copy the environment template and fill in your values:

```bash
cp .env.example .env.local
```

The required variables are documented in `.env.example`:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Turso database URL (or omit for local `file:local.db`) |
| `DATABASE_AUTH_TOKEN` | Turso auth token (not needed for local dev) |
| `NEXTAUTH_URL` | Your app URL (`http://localhost:3000` for dev) |
| `NEXTAUTH_SECRET` | Random secret — generate with `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (optional) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret (optional) |

Run migrations and start the dev server:

```bash
pnpm db:generate    # generate migration files (only needed after schema changes)
pnpm db:migrate     # apply migrations
pnpm dev            # start at http://localhost:3000
```

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/polls` | Required | Create a new poll |
| `GET` | `/api/polls` | Required | List your polls |
| `GET` | `/api/polls/[slug]` | Public | Get poll data + results |
| `POST` | `/api/polls/[slug]/vote` | Public | Cast a vote (IP-tracked) |
| `PATCH` | `/api/polls/[slug]` | Creator | Close a poll |
| `GET` | `/api/polls/[slug]/stream` | Public | SSE stream of live results |

**Auth** is handled via Auth.js session cookies. Public endpoints require no authentication. The `PATCH` close endpoint verifies the caller is the poll's creator.

**Vote deduplication**: `POST /vote` returns `409` if the same IP has already voted on that poll.

## Deploying to Vercel

1. Push your repo to GitHub

2. Create a Turso database:
   ```bash
   turso db create pollster
   turso db tokens create pollster
   ```

3. Import the project in [Vercel](https://vercel.com/new) and add environment variables:
   - `DATABASE_URL` — your Turso database URL
   - `DATABASE_AUTH_TOKEN` — your Turso auth token
   - `NEXTAUTH_URL` — your Vercel deployment URL
   - `NEXTAUTH_SECRET` — a random secret
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — if using Google OAuth

4. Deploy. The build script runs migrations automatically before building.

## License

MIT
