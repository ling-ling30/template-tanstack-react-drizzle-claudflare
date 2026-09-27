import { getDb } from "@repo/data-ops/database/setup";
import { appError } from "@repo/data-ops/errors";
import { createFeedback } from "@repo/data-ops/queries/feedback";
import {
  feedbackInputSchema,
  type FeedbackInput,
} from "@repo/data-ops/zod-schema/feedback";
import { createServerFn } from "@tanstack/react-start";
import { zodInput } from "@/core/validation/zod-input";
import { getOptionalAuthContext } from "@/core/auth/context";

export type { FeedbackInput };

/**
 * Submits user bug reports, feature requests, or general feedback.
 *
 * INTENTIONALLY PUBLIC: Visitors can report issues on public pages (e.g. landing,
 * login, or pricing), while authenticated users automatically have their user/org
 * telemetry attached for triage.
 */
export const submitFeedbackFn = createServerFn({ method: "POST" })
  .validator(zodInput(feedbackInputSchema))
  .handler(async ({ data }) => {
    let userId: string | undefined;
    let userEmail: string | undefined;

    try {
      const auth = await getOptionalAuthContext();
      if (auth?.session) {
        userId = auth.session.userId;
        userEmail = auth.user?.email;
      }
    } catch {
      // Unauthenticated feedback is permitted per above contract
    }

    try {
      const entry = await createFeedback(getDb(), {
        title: data.title,
        description: data.description,
        category: data.category,
        severity: data.severity,
        pageUrl: data.pageUrl,
        metadata: data.metadata,
        userId,
        userEmail,
      });

      return {
        success: true,
        feedbackId: entry.id,
      };
    } catch {
      throw appError(
        "FEEDBACK_FAILED",
        "Unable to record feedback at this time. Please try again later."
      );
    }
  });
