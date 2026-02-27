# Pollster

Create polls, share them with anyone, and watch votes arrive in real time. No page refresh, no websockets — results stream via Server-Sent Events.

**Stack:** `Next.js 14 · TypeScript · Auth.js v5 · Drizzle ORM · Turso (SQLite) · Tailwind CSS · SSE · Vercel`

**Live:** https://pollster-bitcoineo.vercel.app

---

## Why I built this

I wanted to understand Server-Sent Events in a real context: keeping a persistent HTTP connection open, pushing updates from the server as votes arrive, and having the client reflect changes instantly without polling or websockets. Pollster is the result. The SSE stream endpoint broadcasts to every connected client whenever a new vote is recorded.

## Features

- **Real-time results** Votes stream in via SSE with no page refresh
- **Anonymous voting** Anyone with the link can vote, no account required
- **Vote deduplication** IP-based, enforced at the database level (returns 409 on duplicate)
ntication** Google OAuth and email/password for poll creators
- **Poll lifecycle** Create, share, monitor live, and close when done
- **Shareable links** Every poll gets a unique slug-based URL

## Setup

    git clone https://github.com/Bitcoineo/pollster.git
    cd pollster
    pnpm install
    cp .env.example .env.local

Fill in your .env.local:

    DATABASE_URL=           # Turso database URL (or omit for local file:local.db)
    DATABASE_AUTH_TOKEN=    # Turso auth token (not needed for local dev)
    NEXTAUTH_URL=           # http://localhost:3000 for dev
    NEXTAUTH_SECRET=        # openssl rand -base64 32
    GOOGLE_CLIENT_ID=       # Optional
    GOOGLE_CLIENT_SECRET=   # Optional

Run migrations and start:

    pnpm db:migrate
    pnpm dev

Open http://localhost:3000

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/polls | Required | Create a poll |
| GET | /api/polls | Required | List your polls |
| GET | /api/polls/[slug] | Public | Get poll data and results |
| POST | /api/polls/[slug]/vote | Public | Cast a vote (IP-tracked, 409 on duplicate) |
| PATCH | /api/polls/[slug] | Creator | Close a poll |
| GET | /api/polls/[slug]/stream | Public | SSE stream of live results |

## Deploy to Vercel

1. Push to GitHub
2. Import the repo on Vercel
3. Add all environment variables
4. Deploy (migrations run automatically during build)

## GitHub Topics

`nextjs` `typescript` `sse` `real-time` `auth` `authjs` `drizzle-orm` `turso` `sqlite` `tailwind` `vercel` `polling`
