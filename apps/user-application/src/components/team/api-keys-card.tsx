import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Check, Copy, Key, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createApiKeyFn,
  listApiKeysFn,
  revokeApiKeyFn,
} from "@/core/functions/api-keys";

export function ApiKeysCard({
  organizationSlug,
}: {
  organizationSlug: string;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const queryKey = ["api-keys", organizationSlug];

  const keysQuery = useQuery({
    queryKey,
    queryFn: () => listApiKeysFn({ data: { organizationSlug } }),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) =>
      createApiKeyFn({ data: { organizationSlug, name } }),
    onSuccess: (res) => {
      setRevealedKey(res.secretKey);
      setKeyName("");
      void queryClient.invalidateQueries({ queryKey });
      toast.success(t("apiKeys.createdSuccess", "API key generated."));
    },
    onError: () => {
      toast.error(t("errors.INTERNAL"));
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) =>
      revokeApiKeyFn({ data: { organizationSlug, id } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
      toast.success(t("apiKeys.revokedSuccess", "API key revoked."));
    },
  });

  async function handleCopy() {
    if (!revealedKey) return;
    await navigator.clipboard.writeText(revealedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success(t("common.copied", "Copied to clipboard."));
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Key className="size-5" />
            {t("apiKeys.title", "API Keys")}
          </CardTitle>
          <CardDescription>
            {t(
              "apiKeys.desc",
              "Authenticate programmatic requests and automation integrations."
            )}
          </CardDescription>
        </div>
        <Dialog
          open={createOpen}
          onOpenChange={(open) => {
            setCreateOpen(open);
            if (!open) {
              setRevealedKey(null);
              setKeyName("");
            }
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="size-4" />
              {t("apiKeys.createBtn", "Create Key")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            {revealedKey ? (
              <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle>
                    {t("apiKeys.saveTitle", "Save Your API Key")}
                  </DialogTitle>
                  <DialogDescription>
                    {t(
                      "apiKeys.saveDesc",
                      "Make sure to copy your API key now. You will not be able to see it again!"
                    )}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={revealedKey}
                    className="font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="size-4 text-green-500" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                </div>
                <DialogFooter>
                  <Button onClick={() => setCreateOpen(false)}>
                    {t("actions.done", "Done")}
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (keyName.trim()) createMutation.mutate(keyName.trim());
                }}
              >
                <DialogHeader>
                  <DialogTitle>
                    {t("apiKeys.modalTitle", "Generate API Key")}
                  </DialogTitle>
                  <DialogDescription>
                    {t(
                      "apiKeys.modalDesc",
                      "Name your API key to remember its purpose (e.g. Zapier, GitHub Actions)."
                    )}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="key-name">{t("common.name", "Name")}</Label>
                  <Input
                    id="key-name"
                    placeholder="e.g. Zapier Integration"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    required
                    disabled={createMutation.isPending}
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateOpen(false)}
                    disabled={createMutation.isPending}
                  >
                    {t("actions.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || !keyName.trim()}
                  >
                    {createMutation.isPending
                      ? t("common.loading")
                      : t("apiKeys.generate", "Generate Key")}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {keysQuery.isLoading ? (
          <p className="text-muted-foreground text-sm">{t("common.loading")}</p>
        ) : !keysQuery.data?.length ? (
          <p className="text-muted-foreground text-sm">
            {t(
              "apiKeys.empty",
              "No active API keys yet. Create one to get started."
            )}
          </p>
        ) : (
          <div className="space-y-3">
            {keysQuery.data.map((k) => (
              <div
                key={k.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{k.name}</p>
                  <p className="text-muted-foreground font-mono text-xs">
                    {k.prefix}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground text-xs">
                    {k.lastUsedAt
                      ? t("apiKeys.lastUsed", {
                          date: new Date(k.lastUsedAt).toLocaleDateString(),
                        })
                      : t("apiKeys.neverUsed", "Never used")}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    disabled={revokeMutation.isPending}
                    onClick={() => {
                      if (
                        confirm(
                          t(
                            "apiKeys.revokeConfirm",
                            "Revoke this API key? Any integration using it will immediately stop working."
                          )
                        )
                      ) {
                        revokeMutation.mutate(k.id);
                      }
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
