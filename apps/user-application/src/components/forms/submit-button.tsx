import type { ComponentProps, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type SubmitButtonProps = ComponentProps<typeof Button> & {
  children: ReactNode;
  isSubmitting?: boolean;
  submittingText?: string;
};

export function SubmitButton({
  children,
  disabled,
  isSubmitting = false,
  submittingText = "Menyimpan",
  ...props
}: SubmitButtonProps) {
  return (
    <Button disabled={disabled || isSubmitting} type="submit" {...props}>
      {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
      {isSubmitting ? submittingText : children}
    </Button>
  );
}
