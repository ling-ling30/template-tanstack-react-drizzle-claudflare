import { z } from "zod";
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_SEVERITIES,
} from "../drizzle/feedback-schema";

/**
 * Shared validation schema for submitting bugs and feature requests.
 * Used on both client (form validation) and server (server function validator).
 */
export const feedbackInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be under 200 characters"),
  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters")
    .max(2000, "Description must be under 2000 characters"),
  category: z.enum(FEEDBACK_CATEGORIES),
  severity: z.enum(FEEDBACK_SEVERITIES),
  pageUrl: z.string().max(2048),
  metadata: z.string().max(4096).optional(),
});

export type FeedbackInput = z.infer<typeof feedbackInputSchema>;
