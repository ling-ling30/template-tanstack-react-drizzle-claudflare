import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function InviteMemberDialog({
  organizationId,
  onInvited,
}: {
  organizationId?: string;
  onInvited?: () => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await authClient.organization.inviteMember({
        email,
        role,
        ...(organizationId ? { organizationId } : {}),
      });

      if (res.error) {
        toast.error(res.error.message || t("errors.INTERNAL"));
      } else {
        toast.success(t("team.inviteSent", { email }));
        setEmail("");
        setRole("member");
        setOpen(false);
        onInvited?.();
      }
    } catch {
      toast.error(t("errors.INTERNAL"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <UserPlus className="size-4" />
          {t("team.inviteMember")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("team.inviteMember")}</DialogTitle>
            <DialogDescription>{t("team.inviteDesc")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="invite-email">{t("common.email", "Email")}</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="invite-role">{t("team.roleLabel", "Role")}</Label>
              <Select
                value={role}
                onValueChange={(val) => setRole(val as "admin" | "member")}
                disabled={loading}
              >
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">
                    {t("roles.member", "Member")}
                  </SelectItem>
                  <SelectItem value="admin">
                    {t("roles.admin", "Admin")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              {t("actions.cancel")}
            </Button>
            <Button type="submit" disabled={loading || !email}>
              {loading
                ? t("common.loading")
                : t("team.sendInvite", "Send invitation")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
