// Pure pricing logic — no UI, no state, easy to test on its own before
// it's wired into the booking form.

export type RemovalType = "none" | "own" | "foreign";
export type Length = "short" | "medium" | "long" | "xl";
export type DesignTier = "simple" | "standard" | "intricate";

export interface PricingSelection {
  removalType: RemovalType;
  length: Length;
  designTier: DesignTier;
}

// Edit these numbers to match her real pricing — everything else in the
// app just reads from this config, so this is the only place prices live.
export const PRICING_CONFIG = {
  base: {
    short: 45,
    medium: 55,
    long: 65,
    xl: 75,
  } satisfies Record<Length, number>,

  designTierAdd: {
    simple: 0,
    standard: 15,
    intricate: 30,
  } satisfies Record<DesignTier, number>,

  removalAdd: {
    none: 0,
    own: 10,      // removal of her own previous set
    foreign: 15,  // removal of another salon's work
  } satisfies Record<RemovalType, number>,

  depositPercent: 0.3, // 30% deposit, adjust as needed
};

export interface PriceBreakdown {
  base: number;
  designAdd: number;
  removalAdd: number;
  total: number;
  deposit: number;
}

export function calculatePrice(selection: PricingSelection): PriceBreakdown {
  const base = PRICING_CONFIG.base[selection.length];
  const designAdd = PRICING_CONFIG.designTierAdd[selection.designTier];
  const removalAdd = PRICING_CONFIG.removalAdd[selection.removalType];

  const total = base + designAdd + removalAdd;
  const deposit = Math.round(total * PRICING_CONFIG.depositPercent * 100) / 100;

  return { base, designAdd, removalAdd, total, deposit };
}