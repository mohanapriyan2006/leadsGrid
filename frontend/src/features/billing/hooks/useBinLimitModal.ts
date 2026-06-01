import { useEffect, useState } from "react";

const BIN_LIMIT_REACHED_EVENT = "leadsgrid:bin-limit-reached";

export type BinLimitReachedDetail = {
  current: number;
  limit: number;
};

export const showBinLimitModal = (detail: BinLimitReachedDetail) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(BIN_LIMIT_REACHED_EVENT, { detail }));
};

export const useBinLimitModal = () => {
  const [modalData, setModalData] = useState<BinLimitReachedDetail | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<BinLimitReachedDetail>).detail;
      setModalData(detail);
      setOpen(true);
    };

    window.addEventListener(BIN_LIMIT_REACHED_EVENT, handler);
    return () => window.removeEventListener(BIN_LIMIT_REACHED_EVENT, handler);
  }, []);

  const close = () => {
    setOpen(false);
    setModalData(null);
  };

  return { open, modalData, close };
};
