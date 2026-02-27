"use client";

import { useEffect, useRef, useState } from "react";
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
  const [confirming, setConfirming] = useState(false);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [countBump, setCountBump] = useState(false);
  const [votePing, setVotePing] = useState(false);
  const prevTotalRef = useRef(initialPoll.totalVotes);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/poll/${slug}`
      : `/poll/${slug}`;

  // SSE for real-time updates
  useEffect(() => {
    const es = new EventSource(`/api/polls/${slug}/stream`);

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.totalVotes !== prevTotalRef.current) {
        prevTotalRef.current = data.totalVotes;
        setCountBump(true);
        setVotePing(true);
        setTimeout(() => setCountBump(false), 400);
        setTimeout(() => setVotePing(false), 600);
      }
      setResults(data.results);
      setTotalVotes(data.totalVotes);
      setStatus(data.status);

      if (data.status === "closed") {
        es.close();
      }
    };

    return () => es.close();
  }, [slug]);

  function startConfirm() {
    setConfirming(true);
    confirmTimer.current = setTimeout(() => setConfirming(false), 5000);
  }

  function cancelConfirm() {
    setConfirming(false);
    if (confirmTimer.current) clearTimeout(confirmTimer.current);
  }

  async function handleClose() {
    if (confirmTimer.current) clearTimeout(confirmTimer.current);
    setConfirming(false);
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

  const maxVotes = Math.max(...results.map((r) => r.voteCount), 0);
  const maxCount = results.filter((r) => r.voteCount === maxVotes).length;
  const hasLeader = maxVotes > 0 && maxCount === 1 && totalVotes >= 3;

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-muted hover:text-foreground transition-colors duration-200"
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
              ? "bg-accent-light text-accent animate-breathe"
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
          className="shrink-0 rounded-full border border-card-border bg-card px-6 py-3 text-sm font-semibold hover:border-primary/40 active:scale-95 transition-all duration-200"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>

      {/* Results */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="relative text-lg font-bold">
            Results (
            <span
              key={totalVotes}
              className={`inline-block ${countBump ? "animate-count-bump" : ""}`}
            >
              {totalVotes}
            </span>
            {" "}vote{totalVotes !== 1 ? "s" : ""})
            {votePing && (
              <span className="absolute -right-4 top-0 h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-vote-ping rounded-full bg-primary" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
            )}
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

        <div className="mt-4 space-y-3">
          {results.map((result) => {
            const pct = totalVotes > 0 ? (result.voteCount / totalVotes) * 100 : 0;
            const isLeading = hasLeader && result.voteCount === maxVotes;
            return (
              <div key={result.optionId}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className={isLeading ? "font-semibold" : "font-medium text-foreground/80"}>
                    {result.text}
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted">
                    {isLeading && (
                      <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary">
                        Leading
                      </span>
                    )}
                    {pct.toFixed(0)}%
                  </span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-[var(--bar-track)]">
                  <div
                    className={`h-full rounded-full transition-all duration-600 ease-out ${
                      isLeading
                        ? "bg-gradient-to-r from-[var(--bar-from)] to-[var(--bar-to)]"
                        : "bg-[var(--bar-muted)] opacity-80"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Close poll */}
      {status === "open" && (
        <div className="mt-10">
          {closing ? (
            <span className="text-sm font-medium text-muted">Closing...</span>
          ) : confirming ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted">Are you sure?</span>
              <button
                onClick={handleClose}
                className="rounded-full bg-danger/10 px-4 py-1.5 text-sm font-semibold text-danger hover:bg-danger/20 active:scale-95 transition-all duration-200"
              >
                Yes, close
              </button>
              <button
                onClick={cancelConfirm}
                className="rounded-full px-4 py-1.5 text-sm font-medium text-muted hover:text-foreground active:scale-95 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={startConfirm}
              className="rounded-full border border-danger/30 px-6 py-2.5 text-sm font-semibold text-danger hover:bg-danger-light active:scale-95 transition-all duration-200"
            >
              Close Poll
            </button>
          )}
        </div>
      )}
    </div>
  );
}
