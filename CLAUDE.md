# Pollster

Multi-user poll/voting app. Authenticated users create polls with shareable links. Anyone with the link can vote (no login required). Results update in real-time via SSE.

## Tech Stack
- **Framework**: Next.js 14 (App Router), TypeScript
- **Database**: Turso/SQLite via Drizzle ORM (`@libsql/client`)
- **Auth**: Auth.js v5 (`next-auth@5.0.0-beta.30`) — email/password + Google OAuth, JWT strategy
- **Styling**: Tailwind CSS 3, dark mode via `class` strategy
- **Deployment**: Vercel

## File Structure
```
app/
  layout.tsx                          Root layout (auth-aware nav, dark mode)
  page.tsx                            Landing page
  auth/signin/                        Sign in (page + client form)
  auth/signup/                        Sign up (page + client form)
  dashboard/
    page.tsx                          List my polls (server component)
    new/page.tsx                      Create poll form (client component)
    polls/[slug]/
      page.tsx                        Admin view (server, auth-gated)
      poll-admin.tsx                  Admin client (SSE, close poll, copy link)
  poll/[slug]/
    page.tsx                          Public voting (server, generates OG metadata)
    poll-vote.tsx                     Voting client (radio form → results with SSE)
  api/
    auth/[...nextauth]/route.ts       NextAuth handler
    auth/signup/route.ts              Credentials registration (bcrypt + zod)
    polls/route.ts                    POST create, GET list (auth required)
    polls/[slug]/route.ts             GET poll (public), PATCH close (auth, creator only)
    polls/[slug]/vote/route.ts        POST cast vote (public, IP-tracked)
    polls/[slug]/stream/route.ts      GET SSE real-time results (public)
src/
  auth.ts                             Full NextAuth config (DrizzleAdapter, providers, JWT callbacks)
  auth.config.ts                      Edge-compatible config for middleware (no DB imports)
  db/schema.ts                        All table definitions (auth + app)
  db/index.ts                         Drizzle client (libSQL with Turso/local fallback)
  db/migrate.ts                       Custom migration runner (Turso-compatible SQLite DDL)
  lib/auth-helpers.ts                 getRequiredSession(), unauthorized()
  lib/polls.ts                        All data access (createPoll, getMyPolls, getPollBySlug, castVote, closePoll, getPollResults, getVoterIp)
  lib/slugs.ts                        nanoid(8) slug generation
  lib/validations.ts                  Zod schemas (createPollSchema, castVoteSchema)
  components/ThemeToggle.tsx           Dark mode toggle
middleware.ts                          Route protection
drizzle.config.ts                      Drizzle Kit config
```

## Database Schema

**Auth tables** (match `@auth/drizzle-adapter` exactly — singular table names):
- `user` — id, name, email (unique), emailVerified, image, hashedPassword
- `account` — composite PK (provider, providerAccountId), userId FK cascade
- `session` — sessionToken PK, userId FK cascade
- `verificationToken` — composite PK (identifier, token)

**App tables**:
- `poll` — id, userId (FK), question, slug (unique), status (open/closed), createdAt, updatedAt
- `option` — id, pollId (FK), text, position
- `vote` — id, pollId (FK), optionId (FK), voterIp, createdAt
  - `uniqueIndex(pollId, voterIp)` enforces one vote per IP per poll at the DB level

## API Contract

| Method | Route                      | Auth     | Purpose              |
|--------|----------------------------|----------|----------------------|
| POST   | `/api/polls`               | Required | Create poll          |
| GET    | `/api/polls`               | Required | List my polls        |
| GET    | `/api/polls/[slug]`        | Public   | Get poll + results   |
| POST   | `/api/polls/[slug]/vote`   | Public   | Cast vote (IP-tracked) |
| PATCH  | `/api/polls/[slug]`        | Creator  | Close poll           |
| GET    | `/api/polls/[slug]/stream` | Public   | SSE real-time results |

## Auth Strategy
- Split config pattern: `auth.config.ts` (Edge, no DB) + `auth.ts` (full, with DrizzleAdapter)
- Middleware protects `/dashboard/:path*` and `/api/polls` (top-level only)
- `/api/polls/[slug]` is NOT in the middleware matcher — GET is public, PATCH checks auth in-handler
- JWT strategy — `session.user.id` flows via jwt + session callbacks
- Credentials provider: bcrypt hash (cost 12), zod validation
- Google OAuth: `allowDangerousEmailAccountLinking: true`

## SSE Approach
Vercel hobby tier has a 10s function timeout. Uses **send-and-close** pattern:
1. Server queries current results, sends one `data:` event + `retry: 2000`
2. Server closes the stream
3. Browser's `EventSource` auto-reconnects after 2s
4. Client calls `es.close()` when poll status is `"closed"`

## Vote Integrity
- **Double votes**: UNIQUE index on `(pollId, voterIp)` — DB rejects, API returns 409
- **Counting**: `SELECT COUNT(*)` from votes table on every read (no cached counters)
- **Drizzle error detection**: Catch `DrizzleQueryError` with `cause.code === "SQLITE_CONSTRAINT"`
- **IP extraction**: `x-forwarded-for` header, first value. Fallback `"unknown"` for local dev

## Coding Standards
- Auth patterns copied from Project 14 (Streaks) — same stack, same adapter quirks
- Server components for initial data, client components for interactivity (SSE, forms)
- Data access functions in `src/lib/polls.ts` — route handlers stay thin
- Zod validation on all POST/PATCH inputs
- `localStorage` for vote memory (UX only — server UNIQUE constraint is the real enforcement)

## Workflow
- After completing each feature, verify it works before moving to the next one
- If any verification fails, fix it before continuing
- Never skip testing between features

## Commands
- `pnpm dev` — start dev server
- `pnpm build` — run migrations + build (`tsx src/db/migrate.ts && next build`)
- `pnpm lint` — ESLint
- `pnpm db:generate` — generate Drizzle migration files
- `pnpm db:migrate` — apply migrations via custom runner
