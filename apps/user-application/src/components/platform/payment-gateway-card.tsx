import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import {
  paymentConfigInputSchema,
  type PaymentConfigInput,
  type PaymentKeySlot,
} from "@repo/data-ops/zod-schema/payment-config";
import {
  getPaymentConfigFn,
  savePaymentConfigFn,
  testPaymentConfigFn,
  type KeyState,
} from "@/core/functions/payment-config";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { SubmitButton } from "@/components/forms/submit-button";

type Gateway = "doku" | "midtrans";
type Env = "sandbox" | "production";
const ENVS: Env[] = ["sandbox", "production"];
const QUERY_KEY = ["payment-config"];

const STATE_BADGE: Record<KeyState, "success" | "info" | "coral" | "neutral"> =
  {
    saved: "success",
    env: "info",
    unreadable: "coral",
    missing: "neutral",
  };

function formatErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  return "An unexpected error occurred";
}

/**
 * Operator settings for the payment gateway: which gateway and environment
 * take new checkouts, and the sandbox/production keys for DOKU and Midtrans.
 * Secret keys are write-only here: the server only reports whether each is configured.
 */
export function PaymentGatewayCard() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => getPaymentConfigFn(),
  });

  const save = useMutation({ mutationFn: savePaymentConfigFn });
  const test = useMutation({
    mutationFn: (v: { provider: Gateway; environment: Env }) =>
      testPaymentConfigFn({ data: v }),
    onSuccess: (result, v) => {
      const where = `${t(`paymentGateway.${v.provider}`)} ${t(`paymentGateway.env.${v.environment}`)}`;
      if (result.ok) toast.success(t("paymentGateway.testOk", { where }));
      else if (result.detail === "missing")
        toast.error(t("paymentGateway.testMissing", { where }));
      else
        toast.error(
          t("paymentGateway.testFail", { where, detail: result.detail })
        );
    },
    onError: (error) => toast.error(formatErrorMessage(error)),
  });

  const emptyValues: PaymentConfigInput = {
    provider: "doku",
    environment: "sandbox",
    doku: {
      sandbox: { clientId: "", secretKey: "" },
      production: { clientId: "", secretKey: "" },
    },
    midtrans: {
      sandbox: { serverKey: "" },
      production: { serverKey: "" },
    },
    clear: [],
  };
  const valuesFrom = (d: NonNullable<typeof data>): PaymentConfigInput => ({
    ...emptyValues,
    provider: d.provider === "midtrans" ? "midtrans" : "doku",
    environment: d.environment,
    doku: {
      sandbox: { clientId: d.doku.sandbox.clientId, secretKey: "" },
      production: { clientId: d.doku.production.clientId, secretKey: "" },
    },
  });

  const form = useForm({
    defaultValues: data ? valuesFrom(data) : emptyValues,
    validators: { onChange: paymentConfigInputSchema },
    onSubmit: async ({ value }) => {
      try {
        const result = await save.mutateAsync({ data: value });
        await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        if (result.ready) toast.success(t("paymentGateway.saved"));
        else toast.warning(t("paymentGateway.notReady"));
      } catch (error) {
        toast.error(formatErrorMessage(error));
      }
    },
  });

  useEffect(() => {
    if (data) form.reset(valuesFrom(data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (!data) return <Skeleton className="h-96 w-full lg:col-span-2" />;

  const keyState = (gateway: Gateway, env: Env): KeyState =>
    gateway === "doku"
      ? data.doku[env].secretKey
      : data.midtrans[env].serverKey;

  function slotBlock(gateway: Gateway, env: Env) {
    const slot = `${gateway}.${env}` as PaymentKeySlot;
    const state = keyState(gateway, env);
    const secretName =
      gateway === "doku"
        ? (`doku.${env}.secretKey` as const)
        : (`midtrans.${env}.serverKey` as const);
    return (
      <div key={slot} className="space-y-3 rounded-lg border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">
              {t(`paymentGateway.env.${env}`)}
            </p>
            <Badge variant={STATE_BADGE[state]} size="sm">
              {t(`paymentGateway.keyState.${state}`)}
            </Badge>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={test.isPending}
            onClick={() => test.mutate({ provider: gateway, environment: env })}
          >
            {t("paymentGateway.test")}
          </Button>
        </div>

        {gateway === "doku" ? (
          <form.Field name={`doku.${env}.clientId`}>
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    {t("paymentGateway.clientId")}
                  </FieldLabel>
                  <Input
                    id={field.name}
                    autoComplete="off"
                    placeholder="BRN-…"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
        ) : null}

        <form.Field name={secretName}>
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  {t(
                    gateway === "doku"
                      ? "paymentGateway.secretKey"
                      : "paymentGateway.serverKey"
                  )}
                </FieldLabel>
                <Input
                  id={field.name}
                  type="password"
                  autoComplete="new-password"
                  placeholder={t(
                    state === "missing"
                      ? "paymentGateway.enterKey"
                      : "paymentGateway.keepKey"
                  )}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        {state === "saved" || state === "unreadable" ? (
          <form.Field name="clear">
            {(field) => {
              const marked = field.state.value.includes(slot);
              return (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    field.handleChange(
                      marked
                        ? field.state.value.filter((s) => s !== slot)
                        : [...field.state.value, slot]
                    )
                  }
                >
                  {t(
                    marked
                      ? "paymentGateway.undoRemove"
                      : "paymentGateway.remove"
                  )}
                </Button>
              );
            }}
          </form.Field>
        ) : null}
      </div>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>{t("paymentGateway.title")}</CardTitle>
          <Badge variant="neutral" size="sm">
            {t(`paymentGateway.source.${data.source}`)}
          </Badge>
        </div>
        <CardDescription>{t("paymentGateway.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {data.source === "fake" ? (
            <Alert>
              <AlertDescription>
                {t("paymentGateway.localFake")}
              </AlertDescription>
            </Alert>
          ) : null}
          {!data.configKeySet ? (
            <Alert variant="destructive">
              <AlertTitle>
                {t("paymentGateway.configKeyMissingTitle")}
              </AlertTitle>
              <AlertDescription>
                {t("paymentGateway.configKeyMissingBody")}
                <code className="bg-muted mt-1 block rounded px-2 py-1 font-mono text-xs">
                  {"npx wrangler secret put PAYMENT_CONFIG_KEY"}
                </code>
              </AlertDescription>
            </Alert>
          ) : null}

          <form
            method="post"
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field name="provider">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      {t("paymentGateway.provider")}
                    </FieldLabel>
                    <Select
                      name={field.name}
                      value={field.state.value}
                      onValueChange={(v) => field.handleChange(v as Gateway)}
                    >
                      <SelectTrigger id={field.name}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="doku">
                          {t("paymentGateway.doku")}
                        </SelectItem>
                        <SelectItem value="midtrans">
                          {t("paymentGateway.midtrans")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </form.Field>
              <form.Field name="environment">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      {t("paymentGateway.environment")}
                    </FieldLabel>
                    <Select
                      name={field.name}
                      value={field.state.value}
                      onValueChange={(v) => field.handleChange(v as Env)}
                    >
                      <SelectTrigger id={field.name}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ENVS.map((e) => (
                          <SelectItem key={e} value={e}>
                            {t(`paymentGateway.env.${e}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </form.Field>
            </div>

            <form.Subscribe selector={(s) => s.values.environment}>
              {(env) =>
                env === "production" ? (
                  <Alert>
                    <AlertDescription>
                      {t("paymentGateway.productionWarning")}
                    </AlertDescription>
                  </Alert>
                ) : null
              }
            </form.Subscribe>

            {(["doku", "midtrans"] as const).map((gateway) => (
              <section key={gateway} className="space-y-3">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold">
                    {t(`paymentGateway.${gateway}`)}
                  </h3>
                  <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                    <span>{t("paymentGateway.notifyUrl")}</span>
                    <code className="bg-muted rounded px-1.5 py-0.5 font-mono">
                      {data.notifyUrls[gateway]}
                    </code>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      aria-label={t("paymentGateway.copy")}
                      onClick={() =>
                        navigator.clipboard
                          .writeText(data.notifyUrls[gateway])
                          .then(() => toast.success(t("paymentGateway.copied")))
                      }
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {ENVS.map((env) => slotBlock(gateway, env))}
                </div>
              </section>
            ))}

            <p className="text-muted-foreground text-xs">
              {t("paymentGateway.testHint")}
            </p>

            <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <SubmitButton disabled={!canSubmit} isSubmitting={isSubmitting}>
                  {t("paymentGateway.save")}
                </SubmitButton>
              )}
            </form.Subscribe>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
