import { Link } from "@tanstack/react-router";
import { AlertCircle, Home } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { logger } from "@/core/logger/logger";

interface DefaultErrorComponentProps {
  // Anything can be thrown, so the router types this as unknown.
  error?: unknown;
  reset?: () => void;
}

export function DefaultErrorComponent({
  error: thrown,
  reset,
}: DefaultErrorComponentProps) {
  const error =
    thrown instanceof Error
      ? thrown
      : thrown == null
        ? undefined
        : new Error(String(thrown));

  useEffect(() => {
    if (thrown != null) {
      logger.error("Client React Boundary Crash", thrown);
    }
  }, [thrown]);

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="bg-destructive/10 mx-auto flex h-20 w-20 items-center justify-center rounded-full">
        <AlertCircle className="text-destructive h-10 w-10" />
      </div>
      <h1 className="mt-6 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Oops! Something went wrong.
      </h1>
      <p className="text-muted-foreground mt-4 max-w-md text-lg">
        We encountered an unexpected error while trying to process your request.
        Our team has been notified.
      </p>

      {error && (
        <div className="bg-muted mt-6 w-full max-w-lg overflow-auto rounded-md p-4 text-left">
          <p className="text-muted-foreground font-mono text-sm">
            {error.message || "Unknown error occurred"}
          </p>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {reset && (
          <Button onClick={reset} variant="default" size="lg">
            Try Again
          </Button>
        )}
        <Button asChild variant={reset ? "outline" : "default"} size="lg">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Return to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function DefaultNotFoundComponent() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="bg-primary/10 mx-auto flex h-20 w-20 items-center justify-center rounded-full">
        <AlertCircle className="text-primary h-10 w-10" />
      </div>
      <h1 className="mt-6 text-4xl font-extrabold tracking-tight lg:text-5xl">
        404
      </h1>
      <p className="text-muted-foreground mt-4 max-w-md text-lg">
        We couldn't find the page you were looking for. It might have been
        removed, renamed, or did not exist in the first place.
      </p>

      <div className="mt-8">
        <Button asChild size="lg">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Return to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
