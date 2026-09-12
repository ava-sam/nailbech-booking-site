import type { Metadata } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import Link from "next/link";
import { CONTACT_INFO } from "@/lib/contactInfo";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Nailbech — Gel-X Manicures",
  description: "Book a gel-x appointment on campus.",
};

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/booking", label: "Book" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${workSans.variable}`}>
      <body className="bg-ink text-cream font-body min-h-screen flex flex-col">
        <header className="border-b border-white/5">
          <nav className="max-w-4xl mx-auto flex items-center justify-between px-6 py-5">
            <Link href="/" className="font-display text-lg tracking-wide">
              nailbech
            </Link>
            <div className="flex gap-6 text-sm">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sage hover:text-cream transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-white/5 mt-16">
          <div className="max-w-4xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-sage">
            <span>&copy; {new Date().getFullYear()} Nailbech</span>
            <div className="flex gap-5">
              <a
                href={CONTACT_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-lotus transition-colors"
              >
                Instagram
              </a>
              <a
                href={CONTACT_INFO.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-lotus transition-colors"
              >
                TikTok
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}