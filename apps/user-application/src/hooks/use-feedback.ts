import { useMutation } from "@tanstack/react-query";
import { submitFeedbackFn } from "@/core/functions/feedback";

export function useSubmitFeedback() {
  return useMutation({
    mutationFn: submitFeedbackFn,
  });
}
