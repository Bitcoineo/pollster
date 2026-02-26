import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { polls } from "@/src/db/schema";
import { getPollResults } from "@/src/lib/polls";

// GET /api/polls/[slug]/stream — SSE endpoint for real-time results (public)
// Uses send-and-close pattern for Vercel serverless compatibility (10s timeout).
// The client's EventSource auto-reconnects after the retry interval.
export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const poll = await db
    .select({ id: polls.id, status: polls.status })
    .from(polls)
    .where(eq(polls.slug, params.slug))
    .get();

  if (!poll) {
    return new Response("Poll not found", { status: 404 });
  }

  const results = await getPollResults(poll.id);
  const totalVotes = results.reduce((sum, r) => sum + r.voteCount, 0);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Set retry interval to 2 seconds
      controller.enqueue(encoder.encode("retry: 2000\n\n"));
      // Send current results
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ results, totalVotes, status: poll.status })}\n\n`
        )
      );
      // Close the stream — EventSource will auto-reconnect after retry interval
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
