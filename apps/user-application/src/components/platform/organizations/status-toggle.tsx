import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToggleOrganizationStatus } from "@/hooks/use-platform-organizations";

/**
 * Disable / re-enable an org. Disabling locks every member out of the
 * workspace, so it asks for confirmation; re-enabling is immediate.
 */
export function OrganizationStatusToggle({
  id,
  name,
  status,
}: {
  id: string;
  name: string;
  status: "active" | "disabled";
}) {
  const { t } = useTranslation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const mutation = useToggleOrganizationStatus();

  const apply = async (next: "active" | "disabled") => {
    try {
      await mutation.mutateAsync({ id, status: next });
      toast.success(
        next === "disabled"
          ? t("platform.orgDisabled", { name })
          : t("platform.orgEnabled", { name })
      );
      setConfirmOpen(false);
    } catch {
      toast.error(t("platform.statusChangeFailed"));
    }
  };

  if (status === "disabled") {
    return (
      <Button
        disabled={mutation.isPending}
        onClick={() => apply("active")}
        size="sm"
        variant="outline"
      >
        {t("platform.enable")}
      </Button>
    );
  }

  return (
    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <Button onClick={() => setConfirmOpen(true)} size="sm" variant="outline">
        {t("platform.disable")}
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("platform.disableTitle", { name })}</DialogTitle>
          <DialogDescription>{t("platform.disableBody")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t("actions.cancel")}</Button>
          </DialogClose>
          <Button
            disabled={mutation.isPending}
            onClick={() => apply("disabled")}
            variant="destructive"
          >
            {t("platform.disable")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
