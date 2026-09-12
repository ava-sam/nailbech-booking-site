"use client";

import { useEffect, useState, Suspense, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { calculatePrice, RemovalType, Length, DesignTier } from "@/lib/pricing";

interface Slot {
  id: string;
  date: string;
  time: string;
}

function ScheduleForm() {
  const params = useSearchParams();
  const removalType = (params.get("removalType") ?? "none") as RemovalType;
  const length = (params.get("length") ?? "short") as Length;
  const designTier = (params.get("designTier") ?? "simple") as DesignTier;
  const price = calculatePrice({ removalType, length, designTier });

  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSlots() {
      try {
        const res = await fetch("/api/available-slots");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to load slots");
        setSlots(json.slots ?? []);
      } catch {
        setError("Couldn't load available times. Try refreshing.");
      }
    }
    loadSlots();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedSlot) {
      setError("Pick a time slot first.");
      return;
    }
    setError(null);

    const { error: insertError } = await supabase.from("bookings").insert({
      client_name: name,
      client_phone: phone,
      client_email: email,
      removal_type: removalType,
      length,
      design_tier: designTier,
      price: price.total,
      deposit_amount: price.deposit,
      slot_id: selectedSlot,
    });

    if (insertError) {
      setError("Something went wrong submitting your booking. Try again.");
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <section className="max-w-xl mx-auto px-6 py-20 text-center">
        <h1 className="font-display text-3xl text-cream mb-4">
          You&apos;re booked!
        </h1>
        <p className="text-sage leading-relaxed">
          Your appointment is pending until your deposit is confirmed. Send $
          {price.deposit.toFixed(2)} via Zelle or Apple Cash using the info on
          the contact page — you&apos;ll get a confirmation once it&apos;s
          received.
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl text-cream mb-2">Pick a time</h1>
      <p className="text-sage text-sm mb-8">
        Total ${price.total.toFixed(2)} · Deposit ${price.deposit.toFixed(2)}
      </p>

      {slots.length === 0 && !error && (
        <p className="text-sage mb-8">
          No open slots right now — check back soon.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 mb-8">
        {slots.map((slot) => (
          <button
            key={slot.id}
            type="button"
            onClick={() => setSelectedSlot(slot.id)}
            className={`rounded-lg px-4 py-3 text-sm border transition-colors ${
              selectedSlot === slot.id
                ? "bg-lotus text-ink border-lotus"
                : "bg-surface text-cream border-white/10 hover:border-jade"
            }`}
          >
            {slot.date} · {slot.time}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full bg-surface text-cream border border-white/10 rounded-lg px-4 py-3 placeholder:text-sage"
        />
        <input
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="w-full bg-surface text-cream border border-white/10 rounded-lg px-4 py-3 placeholder:text-sage"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-surface text-cream border border-white/10 rounded-lg px-4 py-3 placeholder:text-sage"
        />

        {error && <p className="text-lotus text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-lotus text-ink py-3 rounded-full font-medium hover:opacity-90 transition-opacity"
        >
          Confirm booking
        </button>
      </form>
    </section>
  );
}

export default function SchedulePage() {
  return (
    <Suspense fallback={null}>
      <ScheduleForm />
    </Suspense>
  );
}