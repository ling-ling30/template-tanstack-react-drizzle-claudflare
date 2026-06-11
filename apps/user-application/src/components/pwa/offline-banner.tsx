import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export function OfflineBanner() {
  const { t } = useTranslation();
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const update = () => setIsOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <div
      role="alert"
      className="fixed top-0 right-0 left-0 z-50 bg-secondary px-4 py-2 text-center text-sm font-medium text-secondary-foreground"
    >
      {t("pwa.offline")}
    </div>
  );
}
