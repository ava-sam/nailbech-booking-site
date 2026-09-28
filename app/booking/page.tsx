"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  calculatePrice,
  REMOVAL_INFO,
  LENGTH_INFO,
  DESIGN_INFO,
  RemovalType,
  Length,
  DesignTier,
} from "@/lib/pricing";

type SectionKey = "removal" | "length" | "tier";

const REMOVAL_ORDER: RemovalType[] = ["none", "own_with_set", "own_no_set", "foreign"];
const LENGTH_ORDER: Length[] = ["short", "medium", "long", "xlong"];
const TIER_ORDER: DesignTier[] = ["simple", "standard", "detailed", "intricate"];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="8"
      viewBox="0 0 12 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`flex-shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M1 1.5L6 6.5L11 1.5"
        stroke="#F3EFE9"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function BookingPage() {
  const router = useRouter();
  const [removalType, setRemovalType] = useState<RemovalType>("none");
  const [length, setLength] = useState<Length>("short");
  const [designTier, setDesignTier] = useState<DesignTier>("simple");
  const [openSection, setOpenSection] = useState<SectionKey | null>(null);

  const price = calculatePrice({ removalType, length, designTier });

  function handleContinue() {
    const params = new URLSearchParams({ removalType, length, designTier });
    router.push(`/booking/schedule?${params.toString()}`);
  }

  const sections: {
    key: SectionKey;
    label: string;
    selectedTitle: string;
  }[] = [
    { key: "removal", label: "removal", selectedTitle: REMOVAL_INFO[removalType].title },
    { key: "length", label: "length", selectedTitle: LENGTH_INFO[length].title },
    { key: "tier", label: "design tier", selectedTitle: DESIGN_INFO[designTier].title },
  ];

  return (
    <section className="max-w-md mx-auto px-6 py-16">
      <p className="text-sage text-xs font-semibold tracking-wide mb-1.5">
        booking · step 1 of 2
      </p>
      <h1 className="font-display italic text-3xl text-cream mb-8">
        build your set
      </h1>

      <div className="space-y-7">
        {sections.map((section) => {
          const isOpen = openSection === section.key;
          return (
            <div key={section.key}>
              <span className="block text-sage text-sm font-semibold tracking-wide uppercase mb-2">
                {section.label}
              </span>

              <button
                type="button"
                onClick={() => setOpenSection(isOpen ? null : section.key)}
                className="w-full text-left bg-surface rounded-2xl px-[18px] py-4 flex items-center justify-between gap-3.5"
              >
                <span className="font-body font-semibold text-base text-cream truncate">
                  {section.selectedTitle}
                </span>
                <ChevronIcon open={isOpen} />
              </button>

              {isOpen && (
                <div className="flex flex-col gap-2 pt-2.5 px-1">
                  {section.key === "removal" &&
                    REMOVAL_ORDER.map((value) => {
                      const info = REMOVAL_INFO[value];
                      const isSelected = removalType === value;
                      return (
                        <OptionCard
                          key={value}
                          isSelected={isSelected}
                          title={info.title}
                          meta={info.meta}
                          price={info.price === null ? null : `$${info.price}`}
                          onClick={() => setRemovalType(value)}
                        />
                      );
                    })}

                  {section.key === "length" &&
                    LENGTH_ORDER.map((value) => {
                      const info = LENGTH_INFO[value];
                      const isSelected = length === value;
                      return (
                        <OptionCard
                          key={value}
                          isSelected={isSelected}
                          title={info.title}
                          meta={info.meta}
                          price={`$${info.price}`}
                          onClick={() => setLength(value)}
                        />
                      );
                    })}

                  {section.key === "tier" &&
                    TIER_ORDER.map((value) => {
                      const info = DESIGN_INFO[value];
                      const isSelected = designTier === value;
                      return (
                        <OptionCard
                          key={value}
                          isSelected={isSelected}
                          title={info.title}
                          meta={info.meta}
                          price={`+$${info.price}`}
                          onClick={() => setDesignTier(value)}
                        />
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-surface rounded-2xl px-[22px] py-5 flex items-center justify-between">
        <span className="text-sage text-xl">total</span>
        <span className="text-cream font-semibold text-xl">
          ${price.total.toFixed(2)}
        </span>
      </div>

      <button
        onClick={handleContinue}
        className="mt-8 w-full bg-lotus text-ink py-4 rounded-full font-semibold text-[15px] hover:opacity-90 transition-opacity"
      >
        continue to time slot
      </button>
    </section>
  );
}

function OptionCard({
  isSelected,
  title,
  meta,
  price,
  onClick,
}: {
  isSelected: boolean;
  title: string;
  meta: string;
  price: string | null;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-xl px-4 py-3.5 flex items-start justify-between gap-3.5 transition-colors ${
        isSelected
          ? "bg-[#1C2A26] shadow-[inset_0_0_0_1.5px_#E3B8BE]"
          : "bg-white/[0.03] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
      }`}
    >
      <div className="flex flex-col items-start gap-1 text-left min-w-0">
        <span className="font-body font-semibold text-[15px] text-cream">{title}</span>
        <span className="text-xs leading-relaxed text-sage">{meta}</span>
        {price !== null && (
          <span
            className={`mt-0.5 text-xs font-semibold ${
              price.startsWith("+") ? "text-[#C9958E]" : "text-sage"
            }`}
          >
            {price}
          </span>
        )}
      </div>
      <span
        className={`flex-shrink-0 mt-0.5 w-[17px] h-[17px] rounded-full border flex items-center justify-center ${
          isSelected ? "border-lotus" : "border-white/25"
        }`}
      >
        {isSelected && <span className="w-[7px] h-[7px] rounded-full bg-lotus" />}
      </span>
    </button>
  );
}