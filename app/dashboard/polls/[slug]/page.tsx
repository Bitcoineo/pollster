import { notFound, redirect } from "next/navigation";
import { getRequiredSession } from "@/src/lib/auth-helpers";
import { getPollBySlug } from "@/src/lib/polls";
import PollAdmin from "./poll-admin";

export default async function PollAdminPage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await getRequiredSession();
  if (!session) return null; // middleware handles redirect

  const poll = await getPollBySlug(params.slug);
  if (!poll) notFound();

  // If not the creator, redirect to the public voting page
  if (poll.userId !== session.user.id) {
    redirect(`/poll/${params.slug}`);
  }

  return (
    <PollAdmin
      poll={poll}
      slug={params.slug}
    />
  );
}
