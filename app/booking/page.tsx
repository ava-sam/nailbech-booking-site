"use client";

import { useEffect, useState, useMemo, Suspense, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { calculatePrice, RemovalType, Length, DesignTier } from "@/lib/pricing";

interface Slot {
  date: string;
  time: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function formatTimeLabel(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  const d = new Date(2000, 0, 1, hour, minute);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatDateLabel(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function ScheduleForm() {
  const params = useSearchParams();
  const removalType = (params.get("removalType") ?? "none") as RemovalType;
  const length = (params.get("length") ?? "short") as Length;
  const designTier = (params.get("designTier") ?? "simple") as DesignTier;
  const price = calculatePrice({ removalType, length, designTier });

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1); // 1-indexed

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSlots() {
      setLoading(true);
      setLoadError(null);
      setSelectedDate(null);
      setSelectedTime(null);
      try {
        const res = await fetch(
          `/api/available-slots?year=${viewYear}&month=${viewMonth}`
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to load");
        setSlots(json.slots ?? []);
      } catch {
        setLoadError("Couldn't load available times. Try refreshing.");
      } finally {
        setLoading(false);
      }
    }
    loadSlots();
  }, [viewYear, viewMonth]);

  const availableDates = useMemo(() => new Set(slots.map((s) => s.date)), [slots]);
  const timesForSelectedDate = useMemo(
    () =>
      slots
        .filter((s) => s.date === selectedDate)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [slots, selectedDate]
  );

  const canGoPrev =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth() + 1);

  function goToPrevMonth() {
    if (!canGoPrev) return;
    if (viewMonth === 1) {
      setViewYear((y) => y - 1);
      setViewMonth(12);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    if (viewMonth === 12) {
      setViewYear((y) => y + 1);
      setViewMonth(1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  const firstWeekday = new Date(viewYear, viewMonth - 1, 1).getDay(); // 0 = Sun
  const numDays = new Date(viewYear, viewMonth, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: numDays }, (_, i) => i + 1),
  ];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      setSubmitError("Pick a date and time first.");
      return;
    }
    setSubmitError(null);

    const bookingId = crypto.randomUUID();

    const { error: insertError } = await supabase.from("bookings").insert({
      id: bookingId,
      client_name: name,
      client_phone: phone,
      client_email: email,
      removal_type: removalType,
      length,
      design_tier: designTier,
      price: price.total,
      deposit_amount: price.deposit,
      appointment_date: selectedDate,
      appointment_time: selectedTime,
    });

    if (insertError) {
      setSubmitError("Something went wrong submitting your booking. Try again.");
      return;
    }

    // Best-effort — the booking is already saved even if the notification
    // email fails, so we don't block on this.
    fetch("/api/notify-booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking_id: bookingId }),
    }).catch(() => {});

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <section className="max-w-md mx-auto px-6 py-20 text-center">
        <div className="w-14 h-14 rounded-full bg-lotus/15 border border-lotus/30 flex items-center justify-center mx-auto mb-6">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#E3B8BE"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        <h1 className="font-display text-3xl text-cream mb-2">
          You&apos;re booked!
        </h1>
        <p className="text-sage text-sm mb-8">
          Your appointment is pending until your deposit is confirmed.
        </p>

        {selectedDate && selectedTime && (
          <div className="bg-surface rounded-xl p-6 mb-8 text-left">
            <div className="flex justify-between text-sm mb-3">
              <span className="text-sage">Date</span>
              <span className="text-cream">{formatDateLabel(selectedDate)}</span>
            </div>
            <div className="flex justify-between text-sm mb-3">
              <span className="text-sage">Time</span>
              <span className="text-cream">{formatTimeLabel(selectedTime)}</span>
            </div>
            <div className="border-t border-white/10 my-3" />
            <div className="flex justify-between text-sm">
              <span className="text-sage">Deposit due</span>
              <span className="text-lotus font-medium">
                ${price.deposit.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <p className="text-sage text-sm leading-relaxed mb-8">
          Send your deposit via Zelle or Apple Cash to confirm — you&apos;ll
          get a calendar invite once it&apos;s received.
        </p>

        <Link
          href="/contact"
          className="block w-full bg-lotus text-ink py-3 rounded-full font-medium hover:opacity-90 transition-opacity mb-4"
        >
          View Deposit Info
        </Link>
        <Link
          href="/"
          className="text-sage text-sm hover:text-cream transition-colors"
        >
          Back to home
        </Link>
      </section>
    );
  }

  return (
    <section className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl text-cream mb-2">Pick a date</h1>
      <p className="text-sage text-sm mb-8">
        Total ${price.total.toFixed(2)} · Deposit ${price.deposit.toFixed(2)}
      </p>

      <div className="bg-surface rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={goToPrevMonth}
            disabled={!canGoPrev}
            className="text-sage disabled:opacity-30 px-2 text-lg"
          >
            ‹
          </button>
          <span className="text-cream font-medium">
            {MONTH_NAMES[viewMonth - 1]} {viewYear}
          </span>
          <button
            type="button"
            onClick={goToNextMonth}
            className="text-sage px-2 text-lg"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs text-sage mb-2">
          {WEEKDAY_LABELS.map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) return <div key={i} />;
            const dateStr = `${viewYear}-${pad(viewMonth)}-${pad(day)}`;
            const hasAvailability = availableDates.has(dateStr);
            const isSelected = dateStr === selectedDate;
            return (
              <button
                key={i}
                type="button"
                disabled={!hasAvailability}
                onClick={() => {
                  setSelectedDate(dateStr);
                  setSelectedTime(null);
                }}
                className={`aspect-square rounded-lg text-sm flex items-center justify-center transition-colors ${
                  isSelected
                    ? "bg-lotus text-ink font-medium"
                    : hasAvailability
                    ? "bg-ink text-cream border border-jade/40 hover:border-jade"
                    : "text-sage/30 cursor-not-allowed"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-4 mt-4 text-xs text-sage">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-ink border border-jade/40 inline-block" />
            Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-lotus inline-block" />
            Selected
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded border border-white/10 inline-block" />
            No availability
          </span>
        </div>
      </div>

      {loading && <p className="text-sage mb-8">Loading availability…</p>}
      {loadError && <p className="text-lotus text-sm mb-8">{loadError}</p>}

      {selectedDate && timesForSelectedDate.length > 0 && (
        <div className="mb-8">
          <h2 className="text-cream font-medium mb-3">
            {formatDateLabel(selectedDate)}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {timesForSelectedDate.map((slot) => (
              <button
                key={slot.time}
                type="button"
                onClick={() => setSelectedTime(slot.time)}
                className={`rounded-lg px-4 py-3 text-sm border transition-colors ${
                  selectedTime === slot.time
                    ? "bg-lotus text-ink border-lotus"
                    : "bg-surface text-cream border-white/10 hover:border-jade"
                }`}
              >
                {formatTimeLabel(slot.time)}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedDate && selectedTime && (
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

          {submitError && <p className="text-lotus text-sm">{submitError}</p>}

          <button
            type="submit"
            className="w-full bg-lotus text-ink py-3 rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            Confirm booking
          </button>
        </form>
      )}
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