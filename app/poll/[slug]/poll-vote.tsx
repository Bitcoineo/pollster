"use client";

import { useEffect, useState } from "react";

type Option = {
  id: string;
  text: string;
  position: number;
};

type Result = {
  optionId: string;
  text: string;
  position: number;
  voteCount: number;
};

type Poll = {
  id: string;
  question: string;
  status: string;
  options: Option[];
  results: Result[];
  totalVotes: number;
};

export default function PollVote({
  poll: initialPoll,
  slug,
}: {
  poll: Poll;
  slug: string;
}) {
  const [results, setResults] = useState(initialPoll.results);
  const [totalVotes, setTotalVotes] = useState(initialPoll.totalVotes);
  const [status, setStatus] = useState(initialPoll.status);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState("");

  // Check if user already voted (localStorage)
  useEffect(() => {
    const voted = localStorage.getItem(`voted-${slug}`);
    if (voted) setHasVoted(true);
  }, [slug]);

  // SSE for real-time updates (after voting or if poll is closed)
  useEffect(() => {
    if (!hasVoted && status === "open") return;

    const es = new EventSource(`/api/polls/${slug}/stream`);

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setResults(data.results);
      setTotalVotes(data.totalVotes);
      setStatus(data.status);

      if (data.status === "closed") {
        es.close();
      }
    };

    return () => es.close();
  }, [slug, hasVoted, status]);

  async function handleVote(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOption) return;

    setError("");
    setVoting(true);

    try {
      const res = await fetch(`/api/polls/${slug}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId: selectedOption }),
      });

      if (res.status === 409) {
        // Already voted — show results
        localStorage.setItem(`voted-${slug}`, "true");
        setHasVoted(true);
        setError("You have already voted on this poll");
        setVoting(false);
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to cast vote");
        setVoting(false);
        return;
      }

      localStorage.setItem(`voted-${slug}`, "true");
      setHasVoted(true);
    } catch {
      setError("Something went wrong");
    }
    setVoting(false);
  }

  const showResults = hasVoted || status === "closed";

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">
        {initialPoll.question}
      </h1>

      {status === "closed" && (
        <p className="mt-3 text-sm text-muted">
          This poll is closed. Final results are shown below.
        </p>
      )}

      {error && (
        <div className="mt-5 rounded-xl bg-danger-light px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {!showResults ? (
        /* Voting form */
        <form onSubmit={handleVote} className="mt-8">
          <div className="space-y-3">
            {initialPoll.options.map((option) => (
              <label
                key={option.id}
                className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-5 transition-all ${
                  selectedOption === option.id
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-card-border bg-card hover:border-primary/30 hover:shadow-sm"
                }`}
              >
                <input
                  type="radio"
                  name="option"
                  value={option.id}
                  checked={selectedOption === option.id}
                  onChange={() => setSelectedOption(option.id)}
                  className="h-5 w-5 accent-[var(--primary)]"
                />
                <span className="text-base font-medium">{option.text}</span>
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={!selectedOption || voting}
            className="mt-6 w-full rounded-full bg-primary px-4 py-3.5 text-base font-semibold text-primary-fg shadow-lg shadow-primary/25 hover:bg-primary-hover hover:shadow-xl disabled:opacity-50 transition-all"
          >
            {voting ? "Voting..." : "Vote"}
          </button>
        </form>
      ) : (
        /* Results view */
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted">
              {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
            </p>
            {status === "open" && (
              <div className="flex items-center gap-2 text-xs font-semibold text-accent">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                Live
              </div>
            )}
          </div>

          <div className="mt-5 space-y-4">
            {results.map((result) => {
              const pct =
                totalVotes > 0 ? (result.voteCount / totalVotes) * 100 : 0;
              return (
                <div key={result.optionId}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{result.text}</span>
                    <span className="text-muted">
                      {result.voteCount} ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-card-border">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--bar-from)] to-[var(--bar-to)] transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {hasVoted && status === "open" && (
            <p className="mt-6 text-center text-sm text-muted">
              Thanks for voting! Results update in real-time.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
