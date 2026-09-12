export type RemovalType = "none" | "own" | "foreign";
export type Length = "short" | "medium" | "long";
export type DesignTier = "simple" | "standard" | "intricate";

export interface PricingSelection {
  removalType: RemovalType;
  length: Length;
  designTier: DesignTier;
}

export const PRICING_CONFIG = {
  base: {
    short: 45,
    medium: 50,
    long: 60,
  } satisfies Record<Length, number>,

  // Tier 1/2/3 minimums — real final price may run higher.
  designTierAdd: {
    simple: 5,      // Tier 1: simple nail art, minimal charms
    standard: 10,   // Tier 2: complex nail art, multiple charms
    intricate: 15,  // Tier 3: intricate nail art, 3D elements, layered designs
  } satisfies Record<DesignTier, number>,

  // PLACEHOLDER — she hasn't given real removal pricing yet. Update these
  // once she does; nothing else needs to change.
  removalAdd: {
    none: 0,
    own: 10,
    foreign: 15,
  } satisfies Record<RemovalType, number>,

  // Flat deposit regardless of total price.
  depositFlat: 10,
};

export interface PriceBreakdown {
  base: number;
  designAdd: number;
  removalAdd: number;
  total: number; // starting-at minimum, not a guaranteed final price
  deposit: number;
}

export function calculatePrice(selection: PricingSelection): PriceBreakdown {
  const base = PRICING_CONFIG.base[selection.length];
  const designAdd = PRICING_CONFIG.designTierAdd[selection.designTier];
  const removalAdd = PRICING_CONFIG.removalAdd[selection.removalType];

  const total = base + designAdd + removalAdd;
  const deposit = PRICING_CONFIG.depositFlat;

  return { base, designAdd, removalAdd, total, deposit };
}