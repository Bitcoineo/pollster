import { NextResponse } from "next/server";
import { auth } from "@/src/auth";

/**
 * Gets the session and returns it with a guaranteed user.id.
 * Returns null if not authenticated — callers should return unauthorized().
 */
export async function getRequiredSession() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session as typeof session & { user: { id: string } };
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
