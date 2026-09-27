/* eslint-disable i18next/no-literal-string */
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, Lock } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | SaaS Starter" },
      {
        name: "description",
        content:
          "Privacy Policy explaining data handling, GDPR compliance, and edge storage.",
      },
    ],
  }),
  component: PrivacyPolicyPage,
});

export function PrivacyPolicyPage() {
  const lastUpdated = "September 27, 2026";

  const sections = [
    { id: "overview", title: "1. Overview & Commitment" },
    { id: "collection", title: "2. Information We Collect" },
    { id: "usage", title: "3. How We Use Your Data" },
    { id: "edge-infrastructure", title: "4. Cloudflare Edge & Data Hosting" },
    { id: "sharing", title: "5. Sub-processors & Third Parties" },
    { id: "retention", title: "6. Data Retention & Deletion" },
    { id: "gdpr-ccpa", title: "7. Your Rights (GDPR & CCPA)" },
    { id: "cookies", title: "8. Cookies & Local Storage" },
    { id: "security", title: "9. Security Safeguards" },
    { id: "contact", title: "10. Contact Privacy Team" },
  ];

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Top Navbar */}
      <header className="surface-glass border-border sticky top-0 z-50 w-full border-b transition-colors">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6 sm:px-8">
          <Link
            to="/"
            className="text-foreground surface-press flex items-center gap-2 text-sm font-medium tracking-tight transition-opacity hover:opacity-80"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <Lock className="text-primary size-4" />
            <span className="text-muted-foreground font-mono text-xs">
              Data Protection
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12 sm:px-8 sm:py-16">
        {/* Header Banner */}
        <div className="border-border/60 border-b pb-8">
          <div className="text-primary flex items-center gap-2 font-mono text-xs">
            <ShieldCheck className="size-3.5" />
            <span>GDPR & CCPA COMPLIANCE</span>
          </div>
          <h1 className="display-title mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground mt-3 text-sm">
            Effective Date: {lastUpdated} · Version 1.2
          </p>
        </div>

        {/* Content Layout */}
        <div className="mt-10 flex flex-col gap-12 lg:flex-row">
          {/* Table of contents sidebar */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-24 space-y-1 text-xs">
              <span className="text-muted-foreground font-mono font-semibold tracking-wider uppercase">
                Table of Contents
              </span>
              <nav className="mt-2 space-y-1">
                {sections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="text-muted-foreground hover:bg-muted hover:text-foreground block rounded-md px-2 py-1.5 transition-colors"
                  >
                    {sec.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Legal Text Sections */}
          <article className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed">
            <section id="overview" className="scroll-mt-24 space-y-3">
              <h2 className="text-foreground text-xl font-semibold tracking-tight">
                1. Overview & Commitment
              </h2>
              <p className="text-muted-foreground">
                We are committed to protecting your privacy and treating
                customer data with transparency and respect. This Privacy Policy
                details how we collect, utilize, store, and safeguard your
                personal data when you use our SaaS applications, API services,
                and websites.
              </p>
            </section>

            <section id="collection" className="scroll-mt-24 space-y-3">
              <h2 className="text-foreground text-xl font-semibold tracking-tight">
                2. Information We Collect
              </h2>
              <ul className="text-muted-foreground list-disc space-y-1.5 pl-5">
                <li>
                  <strong className="text-foreground">
                    Account Information:
                  </strong>{" "}
                  Name, email address, authentication credentials, and
                  organization profile.
                </li>
                <li>
                  <strong className="text-foreground">Payment Details:</strong>{" "}
                  Billing address, tax identifiers, and transaction history.
                  Sensitive card tokens are processed directly by certified
                  payment gateways and never touch our edge servers unencrypted.
                </li>
                <li>
                  <strong className="text-foreground">
                    Usage Telemetry & Logs:
                  </strong>{" "}
                  API requests, edge latency metrics, browser user agent, IP
                  address, and error reports.
                </li>
              </ul>
            </section>

            <section id="usage" className="scroll-mt-24 space-y-3">
              <h2 className="text-foreground text-xl font-semibold tracking-tight">
                3. How We Use Your Data
              </h2>
              <p className="text-muted-foreground">
                We process your information to provide and operate the Service,
                authenticate sessions, enforce role-based access control,
                invoice subscriptions, defend against DDoS attacks and bots (via
                Turnstile), and send essential system notifications. We do not
                sell or monetize personal data.
              </p>
            </section>

            <section
              id="edge-infrastructure"
              className="scroll-mt-24 space-y-3"
            >
              <h2 className="text-foreground text-xl font-semibold tracking-tight">
                4. Cloudflare Edge & Data Hosting
              </h2>
              <p className="text-muted-foreground">
                Our infrastructure is built natively on Cloudflare Workers,
                Cloudflare D1 (distributed SQLite), and Cloudflare R2
                (S3-compatible object storage). Data is encrypted in transit
                using TLS 1.3 and at rest with AES-256. Routing is optimized to
                keep compute and query processing as close as possible to your
                physical region.
              </p>
            </section>

            <section id="sharing" className="scroll-mt-24 space-y-3">
              <h2 className="text-foreground text-xl font-semibold tracking-tight">
                5. Sub-processors & Third Parties
              </h2>
              <p className="text-muted-foreground">
                We engage trusted third-party sub-processors solely to assist in
                delivering the Service:
              </p>
              <ul className="text-muted-foreground list-disc space-y-1 pl-5">
                <li>
                  <strong className="text-foreground">Cloudflare, Inc.</strong>{" "}
                  — Edge compute, DNS, bot mitigation, and storage.
                </li>
                <li>
                  <strong className="text-foreground">Payment Gateways</strong>{" "}
                  (Midtrans, Doku, Stripe) — Transaction settlement and fraud
                  detection.
                </li>
                <li>
                  <strong className="text-foreground">
                    Transactional Email
                  </strong>{" "}
                  — System notifications and password reset delivery.
                </li>
              </ul>
            </section>

            <section id="retention" className="scroll-mt-24 space-y-3">
              <h2 className="text-foreground text-xl font-semibold tracking-tight">
                6. Data Retention & Deletion
              </h2>
              <p className="text-muted-foreground">
                We retain customer data for as long as your workspace account
                remains active. When an organization owner deletes a workspace,
                all associated records in D1 and files in R2 are immediately
                decoupled and irreversibly purged within 30 days, except where
                legal compliance mandates retention.
              </p>
            </section>

            <section id="gdpr-ccpa" className="scroll-mt-24 space-y-3">
              <h2 className="text-foreground text-xl font-semibold tracking-tight">
                7. Your Rights (GDPR & CCPA)
              </h2>
              <p className="text-muted-foreground">
                Under European GDPR and California CCPA regulations, you have
                the right to access your personal data, rectify inaccuracies,
                request erasure ("right to be forgotten"), restrict processing,
                and export your workspace data in a portable machine-readable
                format.
              </p>
            </section>

            <section id="cookies" className="scroll-mt-24 space-y-3">
              <h2 className="text-foreground text-xl font-semibold tracking-tight">
                8. Cookies & Local Storage
              </h2>
              <p className="text-muted-foreground">
                We use strictly necessary HTTP-only authentication session
                cookies to maintain your login state. We also utilize browser
                localStorage to persist your UI theme preference (dark/light)
                and language selection. We do not deploy third-party cross-site
                advertising trackers.
              </p>
            </section>

            <section id="security" className="scroll-mt-24 space-y-3">
              <h2 className="text-foreground text-xl font-semibold tracking-tight">
                9. Security Safeguards
              </h2>
              <p className="text-muted-foreground">
                We implement defense-in-depth architecture: signed URLs,
                column-level AES-256-GCM encryption for third-party API
                credentials, rate-limiting sliding windows, Turnstile bot
                verification, and scoped organization RBAC access guards.
              </p>
            </section>

            <section
              id="contact"
              className="scroll-mt-24 space-y-3 border-t pt-6"
            >
              <h2 className="text-foreground text-xl font-semibold tracking-tight">
                10. Contact Privacy Team
              </h2>
              <p className="text-muted-foreground">
                For questions regarding data processing or to exercise your GDPR
                rights, contact our Data Protection Officer at{" "}
                <span className="text-foreground font-mono">
                  privacy@yourdomain.com
                </span>
                .
              </p>
            </section>
          </article>
        </div>
      </main>
    </div>
  );
}
