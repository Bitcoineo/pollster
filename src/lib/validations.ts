import { z } from "zod/v4";

export const createPollSchema = z.object({
  question: z.string().min(1, "Question is required").max(500),
  options: z
    .array(z.string().min(1, "Option text is required").max(200))
    .min(2, "At least 2 options required")
    .max(6, "At most 6 options allowed"),
});

export const castVoteSchema = z.object({
  optionId: z.string().min(1, "Option ID is required"),
});
