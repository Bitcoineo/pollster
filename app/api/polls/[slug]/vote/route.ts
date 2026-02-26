import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { polls } from "@/src/db/schema";
import { castVoteSchema } from "@/src/lib/validations";
import { castVote, getVoterIp } from "@/src/lib/polls";

// POST /api/polls/[slug]/vote — cast a vote (public, IP-tracked)
export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();
    const parsed = castVoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Look up poll by slug
    const poll = await db
      .select({ id: polls.id })
      .from(polls)
      .where(eq(polls.slug, params.slug))
      .get();

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    const voterIp = getVoterIp(request);
    const result = await castVote(poll.id, parsed.data.optionId, voterIp);

    if (!result.success) {
      const statusMap: Record<string, number> = {
        poll_not_found: 404,
        poll_closed: 400,
        invalid_option: 400,
        already_voted: 409,
      };
      const status = statusMap[result.error!] || 500;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
