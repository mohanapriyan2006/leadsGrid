import { useEffect, useState } from "react";
import { apiClient } from "../lib/api";

const POLL_INTERVAL_MS = 30000;

export const useBackendOnline = () => {
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    let isMounted = true;

    const checkHealth = async () => {
      try {
        const response = await apiClient.get("/health");
        if (!isMounted) {
          return;
        }
        setIsBackendOnline(response.status >= 200 && response.status < 300);
      } catch {
        if (isMounted) {
          setIsBackendOnline(false);
        }
      }
    };

    const onBrowserOnline = () => {
      checkHealth();
    };

    const onBrowserOffline = () => {
      setIsBackendOnline(false);
    };

    checkHealth();
    const intervalId = window.setInterval(checkHealth, POLL_INTERVAL_MS);
    window.addEventListener("online", onBrowserOnline);
    window.addEventListener("offline", onBrowserOffline);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener("online", onBrowserOnline);
      window.removeEventListener("offline", onBrowserOffline);
    };
  }, []);

  return isBackendOnline;
};
