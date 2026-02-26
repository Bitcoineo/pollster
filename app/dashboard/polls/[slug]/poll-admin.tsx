"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
  createdAt: number | Date;
  results: Result[];
  totalVotes: number;
};

export default function PollAdmin({
  poll: initialPoll,
  slug,
}: {
  poll: Poll;
  slug: string;
}) {
  const [results, setResults] = useState(initialPoll.results);
  const [totalVotes, setTotalVotes] = useState(initialPoll.totalVotes);
  const [status, setStatus] = useState(initialPoll.status);
  const [copied, setCopied] = useState(false);
  const [closing, setClosing] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/poll/${slug}`
      : `/poll/${slug}`;

  // SSE for real-time updates
  useEffect(() => {
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
  }, [slug]);

  async function handleClose() {
    if (!confirm("Are you sure you want to close this poll? No more votes will be accepted.")) {
      return;
    }

    setClosing(true);
    const res = await fetch(`/api/polls/${slug}`, { method: "PATCH" });

    if (res.ok) {
      setStatus("closed");
    }
    setClosing(false);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-muted hover:text-foreground transition-colors"
          >
            &larr; Back to polls
          </Link>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
            {initialPoll.question}
          </h1>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            status === "open"
              ? "bg-accent-light text-accent"
              : "bg-card text-muted border border-card-border"
          }`}
        >
          {status === "open" ? "Open" : "Closed"}
        </span>
      </div>

      {/* Share link */}
      <div className="mt-6 flex items-center gap-3">
        <input
          readOnly
          value={shareUrl}
          className="flex-1 rounded-xl border border-card-border bg-card px-4 py-3 text-sm text-muted"
        />
        <button
          onClick={copyLink}
          className="shrink-0 rounded-full border border-card-border bg-card px-6 py-3 text-sm font-semibold hover:border-primary/40 transition-all"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>

      {/* Results */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">
            Results ({totalVotes} vote{totalVotes !== 1 ? "s" : ""})
          </h2>
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
            const pct = totalVotes > 0 ? (result.voteCount / totalVotes) * 100 : 0;
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
      </div>

      {/* Close poll button */}
      {status === "open" && (
        <button
          onClick={handleClose}
          disabled={closing}
          className="mt-10 rounded-full border border-danger/30 px-6 py-2.5 text-sm font-semibold text-danger hover:bg-danger-light disabled:opacity-50 transition-all"
        >
          {closing ? "Closing..." : "Close Poll"}
        </button>
      )}
    </div>
  );
}
