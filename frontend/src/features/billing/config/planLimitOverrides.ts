import type { PlanLimits, PricingPlanKey } from "../../common/constants/pricingPlans";

/**
 * Plan Limit Overrides
 *
 * Edit this file directly in code to override plan limits for development/testing.
 * These values take precedence over the default PRICING_PLANS values.
 *
 * Example:
 *   overrides.single_free = { storage_limit: 500, crm_analysis_per_day: 10 };
 *
 * Set a field to undefined to fall back to the default plan value.
 */

export type PlanLimitOverrides = Partial<Record<PricingPlanKey, Partial<PlanLimits>>>;

export const PLAN_LIMIT_OVERRIDES: PlanLimitOverrides = {
  // Example overrides for development:
  // single_free: {
  //   storage_limit: 200,
  //   leads_discovery_per_day: 5,
  //   email_sending_per_day: 10,
  //   crm_analysis_per_day: 5,
  //   leads_analysis_per_day: 5,
  //   ask_ai_per_month: 200,
  //   agent_ai_per_month: 50,
  //   other_ai_per_day: 20,
  // },
};

/**
 * Apply overrides to a plan's base limits.
 * Returns the merged limits object.
 */
export const applyPlanLimitOverrides = (
  planKey: PricingPlanKey,
  baseLimits: PlanLimits,
): PlanLimits => {
  const override = PLAN_LIMIT_OVERRIDES[planKey];
  if (!override) return baseLimits;

  return {
    ...baseLimits,
    ...Object.fromEntries(
      Object.entries(override).filter(([, v]) => v !== undefined),
    ),
  } as PlanLimits;
};
