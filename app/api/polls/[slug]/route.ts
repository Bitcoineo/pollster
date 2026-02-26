import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { polls } from "@/src/db/schema";
import { getRequiredSession, unauthorized } from "@/src/lib/auth-helpers";
import { getPollBySlug, closePoll } from "@/src/lib/polls";

// GET /api/polls/[slug] — get poll with results (public)
export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const poll = await getPollBySlug(params.slug);

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    return NextResponse.json(poll);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/polls/[slug] — close poll (auth required, creator only)
export async function PATCH(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getRequiredSession();
    if (!session) return unauthorized();

    // Look up the poll by slug
    const poll = await db
      .select({ id: polls.id, userId: polls.userId })
      .from(polls)
      .where(eq(polls.slug, params.slug))
      .get();

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    const closed = await closePoll(poll.id, session.user.id);

    if (!closed) {
      return NextResponse.json(
        { error: "Forbidden — you are not the creator of this poll" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
