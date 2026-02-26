import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPollBySlug } from "@/src/lib/polls";
import PollVote from "./poll-vote";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const poll = await getPollBySlug(params.slug);
  if (!poll) return { title: "Poll not found" };

  return {
    title: poll.question,
    description: `Vote on: ${poll.question}`,
    openGraph: { title: poll.question },
  };
}

export default async function PublicPollPage({ params }: Props) {
  const poll = await getPollBySlug(params.slug);
  if (!poll) notFound();

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <PollVote
        poll={poll}
        slug={params.slug}
      />
    </div>
  );
}
