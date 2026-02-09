import { z } from "zod";

export const SeasonSchema = z.object({
  slug: z.string(),
  name: z.string(),
  start_date: z.string(),
  end_date: z.string().nullable(),
  is_active: z.boolean(),
});

export const SeasonDataSchema = z.object({
  seasons: z.array(SeasonSchema),
});

export type Season = z.infer<typeof SeasonSchema>;
export type SeasonData = z.infer<typeof SeasonDataSchema>;
