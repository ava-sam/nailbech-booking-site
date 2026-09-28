"use client";

import { useEffect, useState, useMemo, Suspense, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { CONTACT_INFO } from "@/lib/contactInfo";
import {
  calculatePrice,
  REMOVAL_INFO,
  LENGTH_INFO,
  DESIGN_INFO,
  RemovalType,
  Length,
  DesignTier,
} from "@/lib/pricing";

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
  const [instagram, setInstagram] = useState("");
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
      client_instagram: instagram || null,
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

        <h1 className="font-display italic text-3xl text-cream mb-2">
          You&apos;re booked!
        </h1>
        <p className="text-sage text-sm mb-6">
          Your appointment is pending until your deposit is confirmed.
        </p>
        <p className="text-sage text-xs mb-8">
          Once confirmed, check your spam/junk folder if you don&apos;t see
          the calendar invite email in your main inbox.
        </p>

        {selectedDate && selectedTime && (
          <div className="bg-surface rounded-xl p-6 mb-8 text-left space-y-3">
            <div className="flex items-center gap-2.5 mb-1">
              <Image src="/logo.png" alt="" width={28} height={28} className="flex-shrink-0" />
              <span className="font-display italic text-lg text-cream">nailbech</span>
            </div>

            <div className="border-t border-white/10 pt-3">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-sage">Date</span>
                <span className="font-body font-semibold text-cream">{formatDateLabel(selectedDate)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-sage">Time</span>
                <span className="font-body font-semibold text-cream">{formatTimeLabel(selectedTime)}</span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-sage">Length</span>
                <span className="text-cream">{LENGTH_INFO[length].title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-sage">Design</span>
                <span className="text-cream">{DESIGN_INFO[designTier].title}</span>
              </div>
              {removalType !== "none" && (
                <div className="flex justify-between text-sm">
                  <span className="text-sage">Removal</span>
                  <span className="text-cream">{REMOVAL_INFO[removalType].title}</span>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-sage">Total</span>
                <span className="font-semibold text-cream">${price.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-sage">Deposit due</span>
                <span className="text-lotus font-medium">
                  ${price.deposit.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-3 space-y-1.5">
              <p className="text-sage text-[11px] uppercase tracking-wide">Booked as</p>
              <div className="flex justify-between text-sm">
                <span className="text-sage">Name</span>
                <span className="text-cream">{name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-sage">Phone</span>
                <span className="text-cream">{phone}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-sage">Email</span>
                <span className="text-cream">{email}</span>
              </div>
              {instagram && (
                <div className="flex justify-between text-sm">
                  <span className="text-sage">Instagram</span>
                  <span className="text-cream">{instagram}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <p className="text-sage text-sm leading-relaxed mb-6">
          Send your deposit to confirm — you&apos;ll get a calendar invite
          once it&apos;s received. Check your spam inbox!
        </p>

        <p className="text-sage text-sm font-semibold uppercase tracking-wide mb-3 text-left">
          Contact &amp; payment
        </p>
        <div className="bg-surface rounded-xl p-6 mb-8 text-left space-y-4">
          <div>
            <p className="text-sage text-xs uppercase tracking-wide mb-1">
              Apple Cash (preferred)
            </p>
            <p className="text-cream text-sm font-semibold">{CONTACT_INFO.appleCash}</p>
          </div>
          <div>
            <p className="text-sage text-xs uppercase tracking-wide mb-1">
              Zelle
            </p>
            <p className="text-cream text-sm font-semibold">{CONTACT_INFO.zelle}</p>
            <p className="text-sage text-xs mt-1">
              Put ONLY a random emoji in the memo/note
            </p>
          </div>
          <div className="border-t border-white/10 pt-4">
            <p className="text-sage text-xs uppercase tracking-wide mb-1">
              Questions? Reach out directly
            </p>
            <p className="text-cream text-sm">{CONTACT_INFO.phone}</p>
            <p className="text-cream text-sm">{CONTACT_INFO.email}</p>
          </div>
        </div>

        <div className="flex justify-center gap-6 text-sm">
          <Link
            href="/"
            className="text-sage hover:text-cream transition-colors"
          >
            Back to home
          </Link>
          <Link
            href="/gallery"
            className="text-sage hover:text-cream transition-colors"
          >
            View gallery
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-2xl mx-auto px-6 py-16">
      <p className="text-sage text-xs font-semibold tracking-wide mb-1.5">
        booking · step 2 of 2
      </p>
      <h1 className="font-display italic text-3xl text-cream mb-2">Pick a date</h1>
      <p className="text-sage text-sm mb-8">
        Total ${price.total.toFixed(2)} · ${price.deposit.toFixed(2)} deposit due
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
          <h2 className="font-display italic text-cream text-xl mb-3">
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
          <input
            type="text"
            placeholder="Instagram handle (optional)"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            className="w-full bg-surface text-cream border border-white/10 rounded-lg px-4 py-3 placeholder:text-sage"
          />

          <div className="rounded-xl bg-lotus/[0.08] shadow-[inset_0_0_0_1px_rgba(227,184,190,0.25)] px-4 py-3.5">
            <p className="text-lotus text-xs leading-relaxed">
              $10 deposit is required. I will manually approve your appointment
              once deposit is received. Deposit info is available on next page.
            </p>
          </div>

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