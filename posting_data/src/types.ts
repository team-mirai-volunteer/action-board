import { z } from "zod";

export const PostingEventSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  is_active: z.boolean(),
});

export const PostingEventDataSchema = z.object({
  posting_events: z.array(PostingEventSchema),
});

export type PostingEvent = z.infer<typeof PostingEventSchema>;
export type PostingEventData = z.infer<typeof PostingEventDataSchema>;
