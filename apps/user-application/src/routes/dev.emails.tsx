import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  invitationEmail,
  resetPasswordEmail,
  verificationEmail,
  welcomeEmail,
} from "@/core/email/templates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Laptop, Smartphone } from "lucide-react";

export const Route = createFileRoute("/dev/emails")({
  component: EmailPreviewPage,
});

type TemplateKey = "verification" | "resetPassword" | "invitation" | "welcome";

const TEMPLATES: Record<
  TemplateKey,
  {
    label: string;
    render: () => { subject: string; text: string; html: string };
  }
> = {
  verification: {
    label: "Email Verification",
    render: () =>
      verificationEmail(
        "https://example.com/verify-email?token=sample-token-123"
      ),
  },
  resetPassword: {
    label: "Reset Password",
    render: () =>
      resetPasswordEmail(
        "https://example.com/reset-password?token=sample-token-456"
      ),
  },
  invitation: {
    label: "Team Invitation",
    render: () =>
      invitationEmail({
        organizationName: "Acme Corp",
        inviteUrl: "https://example.com/invite/sample-invite-789",
        role: "admin",
      }),
  },
  welcome: {
    label: "Welcome Onboarding",
    render: () =>
      welcomeEmail({
        name: "Alex",
        appUrl: "https://example.com/acme-corp/app",
      }),
  },
};

function EmailPreviewPage() {
  const [activeTemplate, setActiveTemplate] =
    useState<TemplateKey>("invitation");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const current = TEMPLATES[activeTemplate].render();

  return (
    <div className="bg-muted/30 min-h-screen p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Email Template Previewer
            </h1>
            <p className="text-muted-foreground text-sm">
              Live in-browser preview of transactional emails for local design &
              testing.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={device === "desktop" ? "default" : "outline"}
              size="sm"
              onClick={() => setDevice("desktop")}
            >
              <Laptop className="mr-1.5 size-4" /> Desktop
            </Button>
            <Button
              variant={device === "mobile" ? "default" : "outline"}
              size="sm"
              onClick={() => setDevice("mobile")}
            >
              <Smartphone className="mr-1.5 size-4" /> Mobile
            </Button>
          </div>
        </header>

        <Card>
          <CardHeader className="border-b pb-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(TEMPLATES) as TemplateKey[]).map((key) => (
                  <Button
                    key={key}
                    variant={activeTemplate === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTemplate(key)}
                  >
                    {TEMPLATES[key].label}
                  </Button>
                ))}
              </div>
              <div className="text-muted-foreground font-mono text-xs">
                Subject:{" "}
                <span className="text-foreground font-medium">
                  {current.subject}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex justify-center p-6">
            <div
              className="overflow-hidden rounded-lg border shadow-sm transition-[width] duration-250 ease-out motion-reduce:transition-none"
              style={{
                width: device === "mobile" ? "375px" : "600px",
                height: "640px",
              }}
            >
              <iframe
                title="Email Preview"
                srcDoc={current.html}
                className="size-full border-0 bg-white"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
