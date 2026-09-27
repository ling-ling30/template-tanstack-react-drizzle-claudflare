/* eslint-disable i18next/no-literal-string */
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Shield, FileText } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | SaaS Starter" },
      {
        name: "description",
        content:
          "Terms of Service, acceptable use policy, and subscription agreement.",
      },
    ],
  }),
  component: TermsOfServicePage,
});

export function TermsOfServicePage() {
  const lastUpdated = "September 27, 2026";

  const sections = [
    { id: "acceptance", title: "1. Acceptance of Terms" },
    { id: "accounts", title: "2. User Accounts & Security" },
    { id: "subscription", title: "3. Subscriptions, Payments & Refunds" },
    { id: "acceptable-use", title: "4. Acceptable Use & API Rate Limits" },
    { id: "ip", title: "5. Intellectual Property & Customer Data" },
    { id: "sla", title: "6. Service Availability & Modifications" },
    { id: "termination", title: "7. Account Cancellation & Termination" },
    { id: "liability", title: "8. Limitation of Liability" },
    { id: "governing-law", title: "9. Governing Law" },
    { id: "contact", title: "10. Contact Us" },
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
            <Shield className="text-primary size-4" />
            <span className="text-muted-foreground font-mono text-xs">
              Legal Policy
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12 sm:px-8 sm:py-16">
        {/* Header Banner */}
        <div className="border-border/60 border-b pb-8">
          <div className="text-primary flex items-center gap-2 font-mono text-xs">
            <FileText className="size-3.5" />
            <span>LEGAL AGREEMENT</span>
          </div>
          <h1 className="display-title mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
            Terms of Service
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
            <section id="acceptance" className="scroll-mt-24 space-y-3">
              <h2 className="text-foreground text-xl font-semibold tracking-tight">
                1. Acceptance of Terms
              </h2>
              <p className="text-muted-foreground">
                By creating an account, accessing, or using this
                Software-as-a-Service platform ("Service"), you agree to be
                bound by these Terms of Service ("Terms"). If you are entering
                into this agreement on behalf of a company or other legal
                entity, you represent that you have the authority to bind such
                entity.
              </p>
            </section>

            <section id="accounts" className="scroll-mt-24 space-y-3">
              <h2 className="text-foreground text-xl font-semibold tracking-tight">
                2. User Accounts & Security
              </h2>
              <p className="text-muted-foreground">
                You must provide accurate and complete registration information.
                You are solely responsible for safeguarding your authentication
                credentials, API keys, and all activities conducted under your
                organization workspace. Promptly notify us upon becoming aware
                of any breach of security or unauthorized use.
              </p>
            </section>

            <section id="subscription" className="scroll-mt-24 space-y-3">
              <h2 className="text-foreground text-xl font-semibold tracking-tight">
                3. Subscriptions, Payments & Refunds
              </h2>
              <p className="text-muted-foreground">
                Certain tiers of the Service are billed on a recurring
                subscription basis. Fees are billed in advance on a monthly or
                annual cycle. Unless otherwise stated in an Order Form, all fees
                are non-refundable except where required by applicable statutory
                law. Downgrading your tier may result in the reduction of
                storage quotas, compute limits, or seats.
              </p>
            </section>

            <section id="acceptable-use" className="scroll-mt-24 space-y-3">
              <h2 className="text-foreground text-xl font-semibold tracking-tight">
                4. Acceptable Use & API Rate Limits
              </h2>
              <p className="text-muted-foreground">
                You agree not to misuse the Service, reverse engineer source
                code, violate edge rate limits, distribute malware, or transmit
                unlawful material. We reserve the right to throttle, suspend, or
                terminate workspaces that abuse API endpoints, bypass security
                verification, or impact edge server stability.
              </p>
            </section>

            <section id="ip" className="scroll-mt-24 space-y-3">
              <h2 className="text-foreground text-xl font-semibold tracking-tight">
                5. Intellectual Property & Customer Data
              </h2>
              <p className="text-muted-foreground">
                You retain full ownership of all data, files, and content
                uploaded into your workspace ("Customer Data"). We claim no
                intellectual property rights over your content. We grant you a
                limited, non-exclusive, revocable license to use our platform
                strictly in accordance with these Terms.
              </p>
            </section>

            <section id="sla" className="scroll-mt-24 space-y-3">
              <h2 className="text-foreground text-xl font-semibold tracking-tight">
                6. Service Availability & Modifications
              </h2>
              <p className="text-muted-foreground">
                We make commercially reasonable efforts to ensure 99.9% edge
                platform availability. However, the Service is provided on an
                "as is" and "as available" basis without warranties of any kind.
                We reserve the right to update features, modify schemas, or
                deprecate endpoints with reasonable advance notice.
              </p>
            </section>

            <section id="termination" className="scroll-mt-24 space-y-3">
              <h2 className="text-foreground text-xl font-semibold tracking-tight">
                7. Account Cancellation & Termination
              </h2>
              <p className="text-muted-foreground">
                Organization owners may cancel their subscription or permanently
                delete their workspace at any time via the Workspace Settings
                Danger Zone. Upon deletion, all associated D1 records, sessions,
                and R2 assets are queued for irreversible erasure in compliance
                with data privacy standards.
              </p>
            </section>

            <section id="liability" className="scroll-mt-24 space-y-3">
              <h2 className="text-foreground text-xl font-semibold tracking-tight">
                8. Limitation of Liability
              </h2>
              <p className="text-muted-foreground">
                To the maximum extent permitted by law, in no event shall the
                Service providers or affiliates be liable for indirect,
                incidental, special, consequential, or punitive damages,
                including loss of profits, data, or business goodwill arising
                out of your access or inability to access the Service.
              </p>
            </section>

            <section id="governing-law" className="scroll-mt-24 space-y-3">
              <h2 className="text-foreground text-xl font-semibold tracking-tight">
                9. Governing Law
              </h2>
              <p className="text-muted-foreground">
                These Terms shall be governed by and construed in accordance
                with the laws applicable in your principal place of business,
                without regard to conflict of law principles.
              </p>
            </section>

            <section
              id="contact"
              className="scroll-mt-24 space-y-3 border-t pt-6"
            >
              <h2 className="text-foreground text-xl font-semibold tracking-tight">
                10. Contact Us
              </h2>
              <p className="text-muted-foreground">
                If you have questions regarding these Terms of Service or need
                legal clarification, please contact our support desk at{" "}
                <span className="text-foreground font-mono">
                  legal@yourdomain.com
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
