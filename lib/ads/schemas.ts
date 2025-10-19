import { z } from "zod";

// Minimal ad variant shape: no id, no ctr
export const AdVariantSchema = z.object({
  headline: z.string().min(1).max(120),
  description: z.string().min(1).max(300),
  angle: z.string().min(1).max(120).optional(),
});

export type AdVariant = z.infer<typeof AdVariantSchema>;
