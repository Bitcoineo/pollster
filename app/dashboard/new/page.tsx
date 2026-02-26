"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatePollPage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function addOption() {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  }

  function removeOption(index: number) {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  }

  function updateOption(index: number, value: string) {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedOptions = options.map((o) => o.trim()).filter((o) => o);
    if (trimmedOptions.length < 2) {
      setError("At least 2 non-empty options are required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim(), options: trimmedOptions }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create poll");
        setLoading(false);
        return;
      }

      const poll = await res.json();
      router.push(`/dashboard/polls/${poll.slug}`);
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight">Create a Poll</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {error && (
          <div className="rounded-xl bg-danger-light px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="question" className="block text-sm font-semibold mb-2">
            Question
          </label>
          <input
            id="question"
            type="text"
            required
            maxLength={500}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full rounded-xl border border-input-border bg-input-bg px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="What do you want to ask?"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-3">
            Options ({options.length}/6)
          </label>
          <div className="space-y-3">
            {options.map((option, i) => (
              <div key={i} className="flex gap-3">
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={option}
                  onChange={(e) => updateOption(i, e.target.value)}
                  className="flex-1 rounded-xl border border-input-border bg-input-bg px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder={`Option ${i + 1}`}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-muted hover:bg-card hover:text-danger transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          {options.length < 6 && (
            <button
              type="button"
              onClick={addOption}
              className="mt-3 text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
            >
              + Add option
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-primary px-4 py-3.5 text-sm font-semibold text-primary-fg shadow-md shadow-primary/20 hover:bg-primary-hover disabled:opacity-50 transition-all"
        >
          {loading ? "Creating..." : "Create Poll"}
        </button>
      </form>
    </div>
  );
}
