import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function GlobalProgressBar() {
  const isPending = useRouterState({ select: (s) => s.status === "pending" });
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;

    if (isPending) {
      setVisible(true);
      setProgress(10);
      
      // Simulate progress
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 300);
    } else {
      setProgress(100);
      timeout = setTimeout(() => {
        setVisible(false);
        setTimeout(() => setProgress(0), 200); // Reset after fade out
      }, 300);
    }

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [isPending]);

  if (!visible && progress === 0) return null;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] h-1 bg-transparent transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
