import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db, getFirebaseAuth, isFirebaseConfigured } from "../../../lib/firebase";
import {
  PRICING_PLANS,
  type PlanLimitValue,
} from "../../common/constants/pricingPlans";
import { applyPlanLimitOverrides } from "../config/planLimitOverrides";
import type { AppSettings } from "../../settings/types/settings";
import {
  SETTINGS_DEFAULTS,
} from "../../settings/constants/settingsDefaults";
import {
  type UsageAction,
  type LimitCheckResult,
  UNLIMITED_SOFT_CAP,
  DISABLE_PLAN_LIMITS,
} from "../constants/usage";

const STORAGE_KEY = "leadsgrid.settings.v1";

const getLocalSettings = (): AppSettings => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as AppSettings;
    }
  } catch {
    // ignore
  }
  return SETTINGS_DEFAULTS;
};

const getUserId = (): string | null => {
  const auth = getFirebaseAuth();
  return auth?.currentUser?.uid ?? null;
};

const getTodayKey = (): string => {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
};

const getMonthKey = (): string => {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
};

const resolveLimit = (raw: PlanLimitValue): number => {
  if (raw === "unlimited") return UNLIMITED_SOFT_CAP;
  return raw;
};

const actionToLimitKey: Record<UsageAction, keyof typeof PRICING_PLANS["single_free"]["limits"]> = {
  storage_limit: "storage_limit",
  leads_discovery_per_day: "leads_discovery_per_day",
  email_sending_per_day: "email_sending_per_day",
  crm_analysis_per_day: "crm_analysis_per_day",
  leads_analysis_per_day: "leads_analysis_per_day",
  ask_ai_per_month: "ask_ai_per_month",
  agent_ai_per_month: "agent_ai_per_month",
  other_ai_per_day: "other_ai_per_day",
};

const actionToDailyField: Record<string, string> = {
  leads_discovery_per_day: "leadsDiscovery",
  email_sending_per_day: "emailSending",
  crm_analysis_per_day: "crmAnalysis",
  leads_analysis_per_day: "leadsAnalysis",
  other_ai_per_day: "otherAi",
};

const actionToMonthlyField: Record<string, string> = {
  ask_ai_per_month: "askAi",
  agent_ai_per_month: "agentAi",
};

type DailyUsageDoc = {
  date: string;
  leadsDiscovery: number;
  emailSending: number;
  crmAnalysis: number;
  leadsAnalysis: number;
  otherAi: number;
};

type MonthlyUsageDoc = {
  month: string;
  askAi: number;
  agentAi: number;
};

const getPlanLimits = () => {
  const settings = getLocalSettings();
  const planKey = settings.billing?.currentPlan ?? "single_free";
  const baseLimits = PRICING_PLANS[planKey].limits;
  return applyPlanLimitOverrides(planKey, baseLimits);
};

const getDailyDocRef = (userId: string) =>
  doc(db, "users", userId, "usage", "daily");

const getMonthlyDocRef = (userId: string) =>
  doc(db, "users", userId, "usage", "monthly");

const getDailyUsage = async (): Promise<DailyUsageDoc> => {
  const userId = getUserId();
  const today = getTodayKey();
  if (!userId || !isFirebaseConfigured) {
    return {
      date: today,
      leadsDiscovery: 0,
      emailSending: 0,
      crmAnalysis: 0,
      leadsAnalysis: 0,
      otherAi: 0,
    };
  }

  try {
    const ref = getDailyDocRef(userId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      const empty: DailyUsageDoc = {
        date: today,
        leadsDiscovery: 0,
        emailSending: 0,
        crmAnalysis: 0,
        leadsAnalysis: 0,
        otherAi: 0,
      };
      await setDoc(ref, empty);
      return empty;
    }

    const data = snap.data() as DailyUsageDoc;
    if (data.date !== today) {
      const reset: DailyUsageDoc = {
        date: today,
        leadsDiscovery: 0,
        emailSending: 0,
        crmAnalysis: 0,
        leadsAnalysis: 0,
        otherAi: 0,
      };
      await setDoc(ref, reset);
      return reset;
    }

    return {
      date: data.date ?? today,
      leadsDiscovery: data.leadsDiscovery ?? 0,
      emailSending: data.emailSending ?? 0,
      crmAnalysis: data.crmAnalysis ?? 0,
      leadsAnalysis: data.leadsAnalysis ?? 0,
      otherAi: data.otherAi ?? 0,
    };
  } catch {
    return {
      date: today,
      leadsDiscovery: 0,
      emailSending: 0,
      crmAnalysis: 0,
      leadsAnalysis: 0,
      otherAi: 0,
    };
  }
};

const getMonthlyUsage = async (): Promise<MonthlyUsageDoc> => {
  const userId = getUserId();
  const thisMonth = getMonthKey();
  if (!userId || !isFirebaseConfigured) {
    return {
      month: thisMonth,
      askAi: 0,
      agentAi: 0,
    };
  }

  try {
    const ref = getMonthlyDocRef(userId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      const empty: MonthlyUsageDoc = {
        month: thisMonth,
        askAi: 0,
        agentAi: 0,
      };
      await setDoc(ref, empty);
      return empty;
    }

    const data = snap.data() as MonthlyUsageDoc;
    if (data.month !== thisMonth) {
      const reset: MonthlyUsageDoc = {
        month: thisMonth,
        askAi: 0,
        agentAi: 0,
      };
      await setDoc(ref, reset);
      return reset;
    }

    return {
      month: data.month ?? thisMonth,
      askAi: data.askAi ?? 0,
      agentAi: data.agentAi ?? 0,
    };
  } catch {
    return {
      month: thisMonth,
      askAi: 0,
      agentAi: 0,
    };
  }
};

const getStorageCount = async (): Promise<number> => {
  const userId = getUserId();
  if (!userId || !isFirebaseConfigured) {
    return 0;
  }

  try {
    const coll = collection(db, "users", userId, "leads");
    const q = query(coll, where("isDeleted", "==", false));
    const snap = await getDocs(q);
    return snap.size;
  } catch {
    return 0;
  }
};

const getBinCount = async (): Promise<number> => {
  const userId = getUserId();
  if (!userId || !isFirebaseConfigured) {
    return 0;
  }

  try {
    const coll = collection(db, "users", userId, "leads");
    const q = query(coll, where("isDeleted", "==", true));
    const snap = await getDocs(q);
    return snap.size;
  } catch {
    return 0;
  }
};

export const usageTracker = {
  async checkLimit(action: UsageAction, count = 1): Promise<LimitCheckResult> {
    if (DISABLE_PLAN_LIMITS) {
      return {
        allowed: true,
        current: 0,
        limit: UNLIMITED_SOFT_CAP,
        remaining: UNLIMITED_SOFT_CAP,
        action,
      };
    }

    const limits = getPlanLimits();
    const limitKey = actionToLimitKey[action];
    const limit = resolveLimit(limits[limitKey]);

    if (action === "storage_limit") {
      const current = await getStorageCount();
      return {
        allowed: current + count <= limit,
        current,
        limit,
        remaining: Math.max(0, limit - current),
        action,
      };
    }

    if (action in actionToDailyField) {
      const usage = await getDailyUsage();
      const field = actionToDailyField[action];
      const current = ((usage as unknown) as Record<string, number>)[field] ?? 0;
      return {
        allowed: current + count <= limit,
        current,
        limit,
        remaining: Math.max(0, limit - current),
        action,
      };
    }

    if (action in actionToMonthlyField) {
      const usage = await getMonthlyUsage();
      const field = actionToMonthlyField[action];
      const current = ((usage as unknown) as Record<string, number>)[field] ?? 0;
      return {
        allowed: current + count <= limit,
        current,
        limit,
        remaining: Math.max(0, limit - current),
        action,
      };
    }

    return {
      allowed: true,
      current: 0,
      limit,
      remaining: limit,
      action,
    };
  },

  async checkBinLimit(count = 1): Promise<LimitCheckResult> {
    if (DISABLE_PLAN_LIMITS) {
      return {
        allowed: true,
        current: 0,
        limit: UNLIMITED_SOFT_CAP,
        remaining: UNLIMITED_SOFT_CAP,
        action: "storage_limit",
      };
    }

    const BIN_LIMIT = 100;
    const current = await getBinCount();
    return {
      allowed: current + count <= BIN_LIMIT,
      current,
      limit: BIN_LIMIT,
      remaining: Math.max(0, BIN_LIMIT - current),
      action: "storage_limit",
    };
  },

  async incrementUsage(action: UsageAction, count = 1): Promise<void> {
    if (DISABLE_PLAN_LIMITS) {
      return;
    }
    try {
      const userId = getUserId();
      if (!userId || !isFirebaseConfigured) {
        return;
      }

      if (action in actionToDailyField) {
        const usage = await getDailyUsage();
        const field = actionToDailyField[action];
        const next = { ...usage, [field]: ((usage as unknown) as Record<string, number>)[field] + count };
        await setDoc(getDailyDocRef(userId), next);
        return;
      }

      if (action in actionToMonthlyField) {
        const usage = await getMonthlyUsage();
        const field = actionToMonthlyField[action];
        const next = { ...usage, [field]: ((usage as unknown) as Record<string, number>)[field] + count };
        await setDoc(getMonthlyDocRef(userId), next);
        return;
      }
    } catch {
      // Silently fail on permission errors; the analysis gate should still open
    }
  },

  async getStorageCount(): Promise<number> {
    return getStorageCount();
  },
};
