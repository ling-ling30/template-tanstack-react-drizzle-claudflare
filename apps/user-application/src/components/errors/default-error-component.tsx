import { Link } from "@tanstack/react-router";
import { AlertCircle, Home } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { logger } from "@/core/logger/logger";

interface DefaultErrorComponentProps {
  error?: Error;
  reset?: () => void;
}

export function DefaultErrorComponent({ error, reset }: DefaultErrorComponentProps) {
  useEffect(() => {
    if (error) {
      logger.error("Client React Boundary Crash", error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-10 w-10 text-destructive" />
      </div>
      <h1 className="mt-6 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Oops! Something went wrong.
      </h1>
      <p className="mt-4 text-lg text-muted-foreground max-w-md">
        We encountered an unexpected error while trying to process your request. Our team has been notified.
      </p>
      
      {error && (
        <div className="mt-6 rounded-md bg-muted p-4 text-left w-full max-w-lg overflow-auto">
          <p className="text-sm font-mono text-muted-foreground">
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <AlertCircle className="h-10 w-10 text-primary" />
      </div>
      <h1 className="mt-6 text-4xl font-extrabold tracking-tight lg:text-5xl">
        404
      </h1>
      <p className="mt-4 text-lg text-muted-foreground max-w-md">
        We couldn't find the page you were looking for. It might have been removed, renamed, or did not exist in the first place.
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
