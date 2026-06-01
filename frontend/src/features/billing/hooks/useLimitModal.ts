import { useEffect, useState } from "react";

const LIMIT_REACHED_EVENT = "leadsgrid:limit-reached";

export type LimitReachedDetail = {
  action: string;
  current: number;
  limit: number;
};

export const showLimitModal = (detail: LimitReachedDetail) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(LIMIT_REACHED_EVENT, { detail }));
};

export const useLimitModal = () => {
  const [modalData, setModalData] = useState<LimitReachedDetail | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<LimitReachedDetail>).detail;
      setModalData(detail);
      setOpen(true);
    };

    window.addEventListener(LIMIT_REACHED_EVENT, handler);
    return () => window.removeEventListener(LIMIT_REACHED_EVENT, handler);
  }, []);

  const close = () => {
    setOpen(false);
    setModalData(null);
  };

  return { open, modalData, close };
};
