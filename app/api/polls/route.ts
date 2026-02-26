import { NextResponse } from "next/server";
import { getRequiredSession, unauthorized } from "@/src/lib/auth-helpers";
import { createPollSchema } from "@/src/lib/validations";
import { createPoll, getMyPolls } from "@/src/lib/polls";

// POST /api/polls — create a new poll (auth required via middleware)
export async function POST(request: Request) {
  try {
    const session = await getRequiredSession();
    if (!session) return unauthorized();

    const body = await request.json();
    const parsed = createPollSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const poll = await createPoll(
      session.user.id,
      parsed.data.question,
      parsed.data.options
    );

    return NextResponse.json(poll, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/polls — list my polls (auth required via middleware)
export async function GET() {
  try {
    const session = await getRequiredSession();
    if (!session) return unauthorized();

    const polls = await getMyPolls(session.user.id);

    return NextResponse.json({ polls });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
