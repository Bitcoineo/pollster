import Link from "next/link";
import { auth } from "@/src/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24 sm:py-32">
        {/* Cool gradient glow */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-br from-indigo-200/40 via-blue-100/30 to-transparent blur-3xl dark:from-indigo-900/20 dark:via-blue-900/10" />
          <div className="absolute inset-0 bg-dots opacity-[0.03] dark:opacity-[0.04]" />
        </div>

        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Create instant{" "}
            <span className="relative inline-block bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] bg-clip-text text-transparent" style={{ transform: "rotate(-2deg)" }}>
              polls
            </span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted sm:text-xl">
            Ask the crowd, get answers instantly. No login required to vote.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            {session ? (
              <Link
                href="/dashboard"
                className="rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-fg shadow-lg shadow-primary/25 hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signup"
                  className="rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-primary-fg shadow-lg shadow-primary/25 hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30 transition-all"
                >
                  Get Started
                </Link>
                <Link
                  href="/auth/signin"
                  className="rounded-full border border-card-border bg-card px-8 py-3.5 text-base font-semibold hover:border-primary/40 transition-all"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-4xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-card-border bg-card p-8 transition-shadow hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-2xl dark:bg-indigo-900/30">
              🔗
            </div>
            <h3 className="mt-5 text-lg font-bold">Shareable Links</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Each poll gets a unique link anyone can use to vote — no account needed.
            </p>
          </div>
          <div className="rounded-2xl border border-card-border bg-card p-8 transition-shadow hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-2xl dark:bg-violet-900/30">
              ⚡
            </div>
            <h3 className="mt-5 text-lg font-bold">Real-time Results</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Watch votes come in live with instant streaming updates.
            </p>
          </div>
          <div className="rounded-2xl border border-card-border bg-card p-8 transition-shadow hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-2xl dark:bg-cyan-900/30">
              🔒
            </div>
            <h3 className="mt-5 text-lg font-bold">One Vote Per Person</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              IP-based tracking ensures every vote counts — once.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
