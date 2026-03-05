import { eq, desc, sql, and } from "drizzle-orm";
import { db } from "@/src/db";
import { polls, options, votes } from "@/src/db/schema";
import { generateSlug } from "./slugs";

export function getVoterIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}

export async function createPoll(
  userId: string,
  question: string,
  optionTexts: string[]
) {
  const slug = generateSlug();

  const poll = await db
    .insert(polls)
    .values({ userId, question, slug })
    .returning()
    .get();

  const optionValues = optionTexts.map((text, i) => ({
    pollId: poll.id,
    text,
    position: i,
  }));

  const createdOptions = await db
    .insert(options)
    .values(optionValues)
    .returning();

  return { ...poll, options: createdOptions };
}

export async function getMyPolls(userId: string) {
  const rows = await db
    .select({
      id: polls.id,
      userId: polls.userId,
      question: polls.question,
      slug: polls.slug,
      status: polls.status,
      createdAt: polls.createdAt,
      updatedAt: polls.updatedAt,
      totalVotes: sql<number>`count(${votes.id})`,
    })
    .from(polls)
    .leftJoin(votes, eq(votes.pollId, polls.id))
    .where(eq(polls.userId, userId))
    .groupBy(polls.id)
    .orderBy(desc(polls.createdAt));

  return rows;
}

export async function getPollBySlug(slug: string) {
  const poll = await db
    .select()
    .from(polls)
    .where(eq(polls.slug, slug))
    .get();

  if (!poll) return null;

  const [pollOptions, results] = await Promise.all([
    db
      .select()
      .from(options)
      .where(eq(options.pollId, poll.id))
      .orderBy(options.position),
    getPollResults(poll.id),
  ]);

  const totalVotes = results.reduce((sum, r) => sum + r.voteCount, 0);

  return { ...poll, options: pollOptions, results, totalVotes };
}

export async function getPollResults(pollId: string) {
  const results = await db
    .select({
      optionId: options.id,
      text: options.text,
      position: options.position,
      voteCount: sql<number>`count(${votes.id})`,
    })
    .from(options)
    .leftJoin(votes, eq(votes.optionId, options.id))
    .where(eq(options.pollId, pollId))
    .groupBy(options.id)
    .orderBy(options.position);

  return results;
}

export async function castVote(
  pollId: string,
  optionId: string,
  voterIp: string
): Promise<{ success: boolean; error?: string }> {
  // Verify the poll is open
  const poll = await db
    .select({ status: polls.status })
    .from(polls)
    .where(eq(polls.id, pollId))
    .get();

  if (!poll) return { success: false, error: "poll_not_found" };
  if (poll.status === "closed") return { success: false, error: "poll_closed" };

  // Verify the option belongs to this poll
  const option = await db
    .select({ id: options.id })
    .from(options)
    .where(and(eq(options.id, optionId), eq(options.pollId, pollId)))
    .get();

  if (!option) return { success: false, error: "invalid_option" };

  try {
    await db.insert(votes).values({ pollId, optionId, voterIp });
    return { success: true };
  } catch (err: unknown) {
    // Drizzle wraps libSQL errors as DrizzleQueryError with a `cause`.
    // The cause is a LibsqlError with code "SQLITE_CONSTRAINT".
    const error = err as { cause?: { code?: string }; message?: string };
    if (
      error.cause?.code === "SQLITE_CONSTRAINT" ||
      error.cause?.code === "SQLITE_CONSTRAINT_UNIQUE" ||
      error.message?.includes("UNIQUE constraint failed")
    ) {
      return { success: false, error: "already_voted" };
    }
    throw err;
  }
}

export async function closePoll(
  pollId: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .update(polls)
    .set({ status: "closed", updatedAt: new Date() })
    .where(and(eq(polls.id, pollId), eq(polls.userId, userId)))
    .returning({ id: polls.id })
    .get();

  return !!result;
}
