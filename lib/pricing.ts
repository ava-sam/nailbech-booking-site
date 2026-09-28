export type RemovalType = "none" | "own_with_set" | "own_no_set" | "foreign";
export type Length = "short" | "medium" | "long" | "xlong";
export type DesignTier = "simple" | "standard" | "detailed" | "intricate";

export interface PricingSelection {
  removalType: RemovalType;
  length: Length;
  designTier: DesignTier;
}

export const REMOVAL_INFO: Record<
  RemovalType,
  { title: string; meta: string; price: number | null }
> = {
  none: {
    title: "no removal",
    meta: "一.‧₊˚・✿݁˖",
    price: null,
  },
  own_with_set: {
    title: "removal - previous set",
    meta: "一.‧₊˚・✿݁˖ removal of my work with a new set",
    price: 10,
  },
  own_no_set: {
    title: "removal - previous set",
    meta: "一.‧₊˚・✿݁˖ removal of my own work without a new set",
    price: 15,
  },
  foreign: {
    title: "removal - others work",
    meta: "一.‧₊˚・✿ ݁˖ work done by someone other than me (no acrylic or hardgel)",
    price: 15,
  },
};

export const LENGTH_INFO: Record<Length, { title: string; meta: string; price: number }> = {
  short: { title: "short", meta: "· · ─ ・✿・ ─ · ·", price: 45 },
  medium: { title: "medium", meta: "· · ─ ・✿・ ─ · ·", price: 50 },
  long: { title: "long", meta: "· · ─ ・✿・ ─ · ·", price: 60 },
  xlong: { title: "xlong", meta: "· · ─ ・✿・ ─ · ·", price: 65 },
};

export const DESIGN_INFO: Record<DesignTier, { title: string; meta: string; price: number }> = {
  simple: {
    title: "tier one - simple",
    meta: "✿・༄.° minimal charms, simple nail art",
    price: 5,
  },
  standard: {
    title: "tier two - moderate",
    meta: "✿・༄.° multiple charms, moderate nail art, simple 3D, chrome",
    price: 10,
  },
  detailed: {
    title: "tier three - detailed",
    meta: "✿・༄.° many charms, detailed nail art, layered designs, 3D elements, some mixed techniques",
    price: 15,
  },
  intricate: {
    title: "tier four - intricate",
    meta: "✿・༄.° variety of charms, intricate nail art, complex layered designs, 3D sculpting, varying techniques",
    price: 20,
  },
};

export const PRICING_CONFIG = {
  base: {
    short: LENGTH_INFO.short.price,
    medium: LENGTH_INFO.medium.price,
    long: LENGTH_INFO.long.price,
    xlong: LENGTH_INFO.xlong.price,
  } satisfies Record<Length, number>,

  designTierAdd: {
    simple: DESIGN_INFO.simple.price,
    standard: DESIGN_INFO.standard.price,
    detailed: DESIGN_INFO.detailed.price,
    intricate: DESIGN_INFO.intricate.price,
  } satisfies Record<DesignTier, number>,

  removalAdd: {
    none: REMOVAL_INFO.none.price ?? 0,
    own_with_set: REMOVAL_INFO.own_with_set.price ?? 0,
    own_no_set: REMOVAL_INFO.own_no_set.price ?? 0,
    foreign: REMOVAL_INFO.foreign.price ?? 0,
  } satisfies Record<RemovalType, number>,

  // Flat deposit regardless of total price.
  depositFlat: 10,
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
  const deposit = PRICING_CONFIG.depositFlat;

  return { base, designAdd, removalAdd, total, deposit };
}