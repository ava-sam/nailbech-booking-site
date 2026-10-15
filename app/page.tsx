// app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <section className="max-w-2xl mx-auto px-6 py-20 text-center">
      <h1 className="font-heading font-bold text-4xl md:text-5xl text-cream leading-tight">
        Gel-X manicures
      </h1>

      <p className="mt-6 text-sage leading-relaxed">
        hi! my name is becky, thank you for visiting my website and choosing to book with me˚˖ ᵎᵎ 
        if you have any questions regarding booking, price, design, etc., 
        please don't hesitate to drop me a message on instagram (@nailbech) and 
        I'll get back to you as soon as I can ⊹ ࣪ ˖

        with love, 
        becky
        nailbech 
        ・✿・

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