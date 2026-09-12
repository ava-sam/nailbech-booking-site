// app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <section className="max-w-2xl mx-auto px-6 py-20 text-center">
      <h1 className="font-display text-4xl md:text-5xl text-cream leading-tight">
        Gel-X, done right on campus.
      </h1>

      <p className="mt-6 text-sage leading-relaxed">
        {/* Replace this with her real bio — a couple sentences on who she is,
            how long she's been doing gel-x, and what makes her sets stand out. */}
        Hi, I'm [Name] — a UCSD student and gel-x nail technician. I specialize
        in long-lasting, natural-looking extensions, built and finished with
        care right here on campus.
      </p>

      <div className="mt-10 flex justify-center gap-4">
        <Link
          href="/booking"
          className="bg-lotus text-ink px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity"
        >
          Book an appointment
        </Link>
        <Link
          href="/gallery"
          className="border border-jade text-jade px-6 py-3 rounded-full font-medium hover:bg-surface transition-colors"
        >
          See my work
        </Link>
      </div>
    </section>
  );
}