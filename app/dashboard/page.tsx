import Link from "next/link";
import { getRequiredSession } from "@/src/lib/auth-helpers";
import { getMyPolls } from "@/src/lib/polls";

export default async function DashboardPage() {
  const session = await getRequiredSession();
  if (!session) return null; // middleware handles redirect

  const polls = await getMyPolls(session.user.id);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">My Polls</h1>
        <Link
          href="/dashboard/new"
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-fg shadow-md shadow-primary/20 hover:bg-primary-hover transition-all"
        >
          Create Poll
        </Link>
      </div>

      {polls.length === 0 ? (
        <div className="mt-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-card text-3xl">
            📊
          </div>
          <p className="mt-4 text-lg font-semibold">No polls yet</p>
          <p className="mt-1 text-sm text-muted">
            Create your first poll and share it with the world.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {polls.map((poll) => (
            <Link
              key={poll.id}
              href={`/dashboard/polls/${poll.slug}`}
              className="block rounded-2xl border border-card-border bg-card p-5 hover:border-primary/30 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-bold truncate">{poll.question}</h2>
                  <p className="mt-1.5 text-sm text-muted">
                    {poll.totalVotes} vote{poll.totalVotes !== 1 ? "s" : ""} · Created{" "}
                    {new Date(poll.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                    poll.status === "open"
                      ? "bg-accent-light text-accent"
                      : "bg-card text-muted border border-card-border"
                  }`}
                >
                  {poll.status === "open" ? "Open" : "Closed"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
