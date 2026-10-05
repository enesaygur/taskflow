export const PLAN_LIMITS = {
  FREE: 3,
  PRO: 15,
  ENTERPRISE: Infinity,
} as const;

export const PRICE_TO_PLAN: Record<string, "PRO" | "ENTERPRISE"> = {
  [process.env.STRIPE_PRICE_PRO as string]: "PRO",
  [process.env.STRIPE_PRICE_ENTERPRISE as string]: "ENTERPRISE",
};
