"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { calculatePrice, RemovalType, Length, DesignTier } from "@/lib/pricing";

const REMOVAL_OPTIONS: { value: RemovalType; label: string }[] = [
  { value: "none", label: "No removal needed" },
  { value: "own", label: "Removal — my previous set" },
  { value: "foreign", label: "Removal — another salon's work" },
];

const LENGTH_OPTIONS: { value: Length; label: string }[] = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
];

const DESIGN_OPTIONS: { value: DesignTier; label: string; description: string }[] = [
  { value: "simple", label: "Tier 1", description: "Simple nail art, minimal charms" },
  { value: "standard", label: "Tier 2", description: "Complex nail art, multiple charms" },
  { value: "intricate", label: "Tier 3", description: "Intricate nail art, 3D elements, layered designs" },
];

export default function BookingPage() {
  const router = useRouter();
  const [removalType, setRemovalType] = useState<RemovalType>("none");
  const [length, setLength] = useState<Length>("short");
  const [designTier, setDesignTier] = useState<DesignTier>("simple");

  const price = calculatePrice({ removalType, length, designTier });

  function handleContinue() {
    const params = new URLSearchParams({ removalType, length, designTier });
    router.push(`/booking/schedule?${params.toString()}`);
  }

  return (
    <section className="max-w-xl mx-auto px-6 py-16">
      <h1 className="font-heading font-bold text-3xl text-cream mb-8">Build your set</h1>

      <div className="space-y-6">
        <div>
          <label className="block text-sm text-sage mb-2">
            Do you need removal?
          </label>
          <select
            value={removalType}
            onChange={(e) => setRemovalType(e.target.value as RemovalType)}
            className="w-full bg-surface text-cream border border-white/10 rounded-lg px-4 py-3"
          >
            {REMOVAL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-sage mb-2">Length</label>
          <select
            value={length}
            onChange={(e) => setLength(e.target.value as Length)}
            className="w-full bg-surface text-cream border border-white/10 rounded-lg px-4 py-3"
          >
            {LENGTH_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-sage mb-2">
            Design complexity
          </label>
          <select
            value={designTier}
            onChange={(e) => setDesignTier(e.target.value as DesignTier)}
            className="w-full bg-surface text-cream border border-white/10 rounded-lg px-4 py-3"
          >
            {DESIGN_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label} — {opt.description}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-10 bg-surface rounded-xl p-6">
        <div className="flex justify-between text-sage text-sm mb-1">
          <span>Starting at</span>
          <span>${price.total.toFixed(2)}+</span>
        </div>
        <div className="flex justify-between text-cream font-medium text-lg mb-2">
          <span>Deposit due</span>
          <span>${price.deposit.toFixed(2)}</span>
        </div>
        <p className="text-sage text-xs leading-relaxed">
          Final price may be higher depending on design complexity and
          supplies used — the deposit above is a flat rate.
        </p>
      </div>

      <button
        onClick={handleContinue}
        className="mt-8 w-full bg-lotus text-ink py-3 rounded-full font-medium hover:opacity-90 transition-opacity"
      >
        Continue to time slot
      </button>
    </section>
  );
}