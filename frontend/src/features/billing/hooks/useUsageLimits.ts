import { useEffect, useState, useCallback } from "react";
import { onSnapshot, doc } from "firebase/firestore";
import { db, getFirebaseAuth, isFirebaseConfigured } from "../../../lib/firebase";
import { usageTracker } from "../services/usageTracker";
import type { UsageAction, LimitCheckResult } from "../constants/usage";

type DailyUsage = {
  date: string;
  leadsDiscovery: number;
  emailSending: number;
  crmAnalysis: number;
  leadsAnalysis: number;
  otherAi: number;
};

type MonthlyUsage = {
  month: string;
  askAi: number;
  agentAi: number;
};

export const useUsageLimits = () => {
  const [daily, setDaily] = useState<DailyUsage | null>(null);
  const [monthly, setMonthly] = useState<MonthlyUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const userId = auth?.currentUser?.uid;
    if (!userId || !isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubDaily = onSnapshot(
      doc(db, "users", userId, "usage", "daily"),
      (snap) => {
        if (snap.exists()) {
          setDaily(snap.data() as DailyUsage);
        }
        setLoading(false);
      },
      () => setLoading(false),
    );

    const unsubMonthly = onSnapshot(
      doc(db, "users", userId, "usage", "monthly"),
      (snap) => {
        if (snap.exists()) {
          setMonthly(snap.data() as MonthlyUsage);
        }
      },
      () => {},
    );

    return () => {
      unsubDaily();
      unsubMonthly();
    };
  }, []);

  const canPerform = useCallback(async (action: UsageAction, count = 1): Promise<boolean> => {
    const result = await usageTracker.checkLimit(action, count);
    return result.allowed;
  }, []);

  const getRemaining = useCallback(async (action: UsageAction): Promise<number> => {
    const result = await usageTracker.checkLimit(action);
    return result.remaining;
  }, []);

  const getCheckResult = useCallback(async (action: UsageAction, count = 1): Promise<LimitCheckResult> => {
    return usageTracker.checkLimit(action, count);
  }, []);

  return {
    daily,
    monthly,
    loading,
    canPerform,
    getRemaining,
    getCheckResult,
  };
};
