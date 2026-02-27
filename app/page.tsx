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
            <span className="bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] bg-clip-text text-transparent">
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

      {/* Footer */}
      <footer className="border-t border-divider px-6 py-8">
        <div className="mx-auto flex max-w-4xl items-center justify-center gap-3">
          <span className="text-sm text-muted">Built by Bitcoineo</span>
          <a
            href="https://x.com/Bitcoineo"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter / X"
            className="rounded-full p-1.5 text-muted hover:text-foreground transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href="https://github.com/Bitcoineo"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="rounded-full p-1.5 text-muted hover:text-foreground transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}
