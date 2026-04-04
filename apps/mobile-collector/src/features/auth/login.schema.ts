import { z } from "zod";

export const collectorLoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export type CollectorLoginInput = z.infer<typeof collectorLoginSchema>;
