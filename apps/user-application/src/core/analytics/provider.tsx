import React, { createContext, useContext, useCallback } from "react";

interface AnalyticsContextType {
  trackEvent: (eventName: string, properties?: Record<string, any>) => void;
  identifyUser: (userId: string, traits?: Record<string, any>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(
  undefined
);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  // Stubbed methods for generic analytics tracking.
  // Replace these with actual calls to PostHog, Vercel Analytics, etc.
  const trackEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    if (import.meta.env.DEV) {
      console.log(`[Analytics] Event: ${eventName}`, properties);
    }
    // e.g., posthog.capture(eventName, properties)
  }, []);

  const identifyUser = useCallback((userId: string, traits?: Record<string, any>) => {
    if (import.meta.env.DEV) {
      console.log(`[Analytics] Identify User: ${userId}`, traits);
    }
    // e.g., posthog.identify(userId, traits)
  }, []);

  return (
    <AnalyticsContext.Provider value={{ trackEvent, identifyUser }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
}
