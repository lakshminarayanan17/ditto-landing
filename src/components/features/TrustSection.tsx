"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Calendar } from "lucide-react";

type TrustCard = {
  key: string;
  title: ReactNode;
  subtitle: string;
  topContent: ReactNode;
  // Where this card sits when it has been pushed BEHIND a newer card.
  recedeRotate: number;
  recedeX: number;
  recedeY: number;
  recedeScale: number;
};

const CARDS: TrustCard[] = [
  {
    key: "google",
    title: "Google Ratings",
    subtitle: "Top Rated with 12,000 reviews",
    recedeRotate: -8,
    recedeX: -28,
    recedeY: -22,
    recedeScale: 0.88,
    topContent: (
      <div className="flex items-center gap-2">
        <Image src="/icons/rating-4-9.svg" alt="4.9" width={86} height={48} />
        <Image src="/icons/star.svg" alt="" width={36} height={34} />
      </div>
    ),
  },
  {
    key: "zerodha",
    title: "Backed by Zerodha",
    subtitle: "Backed by Nithin Kamath",
    recedeRotate: 5,
    recedeX: 18,
    recedeY: -12,
    recedeScale: 0.94,
    topContent: (
      <Image
        src="/icons/zerodha-logo.svg"
        alt="Zerodha"
        width={70}
        height={67}
      />
    ),
  },
  {
    key: "linkedin",
    title: (
      <>
        LinkedIn&rsquo;s Top
        <br />
        Startups 2023
      </>
    ),
    subtitle: "Two-time LinkedIn Top Startup",
    // Last card stays in front — these values are unused but typed for shape.
    recedeRotate: 0,
    recedeX: 0,
    recedeY: 0,
    recedeScale: 1,
    topContent: <LinkedInIcon />,
  },
];

function LinkedInIcon() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="64" height="64" rx="10" fill="#0A66C2" />
      <path
        fill="#fff"
        d="M21.6 25h6v22h-6V25zm3-10a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zM33 25h5.7v3h.1c.8-1.5 2.7-3.1 5.6-3.1 6 0 7.1 3.9 7.1 9V47h-6V35.7c0-2.7 0-6.2-3.8-6.2s-4.4 3-4.4 6V47h-6V25z"
      />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.001 21.785h-.005a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.002-5.45 4.436-9.884 9.889-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884z"
      />
    </svg>
  );
}

// Two-phase animation per card on a single shared scroll progress:
//   1. ENTER  — slides up from below into the centered front position.
//   2. RECEDE — when the next card starts entering, this card gets pushed
//               back: rotates to its tilt, shifts x/y, scales down. It does
//               NOT fade out — it stays visible, peeking from behind.
// At progress=1 the result is a fanned deck: card 2 in front straight,
// card 1 behind it tilted right, card 0 farther back tilted left.
function StackCard({
  card,
  index,
  total,
  progress,
}: {
  card: TrustCard;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const isFirst = index === 0;
  const isLast = index === total - 1;

  const phase = 1 / total;
  // Card N's "active" window is roughly [N/total, (N+1)/total].
  // Enter ramp lives in the back half of the previous phase; recede ramp
  // lives in the back half of this card's own phase (i.e. the front half
  // of the next card's enter ramp, so the handoff overlaps).
  const enterStart = isFirst ? 0 : index * phase - phase * 0.5;
  const enterEnd = isFirst ? 0.0001 : index * phase;
  const recedeStart = isLast ? 0.999 : (index + 1) * phase - phase * 0.5;
  const recedeEnd = isLast ? 1 : (index + 1) * phase;

  // No opacity animation — cards stay fully visible. The rising cards are
  // clipped by overflow-hidden on the stage until they reach the stack.
  const y = useTransform(
    progress,
    [enterStart, enterEnd, recedeStart, recedeEnd],
    [isFirst ? 0 : 520, 0, 0, isLast ? 0 : card.recedeY]
  );
  const x = useTransform(
    progress,
    [enterStart, enterEnd, recedeStart, recedeEnd],
    [0, 0, 0, isLast ? 0 : card.recedeX]
  );
  const rotate = useTransform(
    progress,
    [recedeStart, recedeEnd],
    [0, isLast ? 0 : card.recedeRotate]
  );
  const scale = useTransform(
    progress,
    [recedeStart, recedeEnd],
    [1, isLast ? 1 : card.recedeScale]
  );

  return (
    <motion.div
      style={{
        x,
        y,
        rotate,
        scale,
        zIndex: index + 1,
      }}
      className="absolute left-1/2 top-0 h-[337px] w-full max-w-[420px] -translate-x-1/2 overflow-hidden rounded-[28px] border border-[#f1f1f1] bg-white p-8 shadow-[0_8px_40px_rgba(0,0,0,0.08)]"
    >
      <div className="mb-8 flex h-[68px] items-center">{card.topContent}</div>
      <h3 className="mb-6 font-heading text-[28px] font-medium leading-[1.16] tracking-[0.01em] text-[#535353] lg:text-[35px]">
        {card.title}
      </h3>
      <p className="font-heading text-[20px] font-medium leading-[1.16] text-[#535353] lg:text-[24px]">
        {card.subtitle}
      </p>
    </motion.div>
  );
}

export function TrustSection() {
  const cardsRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardsRef,
    offset: ["start start", "end end"],
  });

  return (
    <section className="relative bg-ditto-grey-100 pt-12 lg:pt-20">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-4 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:px-[160px]">
        <div className="self-start lg:sticky lg:top-32 lg:pt-10">
          <h2 className="mb-4 font-heading text-[36px] font-medium leading-[1.18] tracking-[0.02em] text-[#0e3b6b] lg:text-[50px]">
            Why People
            <br />
            Trust Ditto
          </h2>
          <p className="mb-7 max-w-[444px] font-heading text-[18px] leading-[1.22] tracking-[0.01em] text-[#3b3b3b] lg:text-[22px]">
            Trusted by thousands of customers who&rsquo;ve experienced honest advice and real support&mdash;every step of the way.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="#schedule"
              className="inline-flex items-center gap-2 rounded-[13px] bg-[#0274f1] px-5 py-3 font-heading text-[15px] font-medium text-white shadow-sm transition-colors hover:bg-ditto-blue-dark"
            >
              <Calendar className="h-[15px] w-[15px]" strokeWidth={2.2} />
              Book a Free Call
            </Link>
            <Link
              href="https://wa.me/918655930539"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-[13px] bg-[#058340] px-5 py-3 font-heading text-[15px] font-medium text-white shadow-sm transition-colors hover:bg-[#04702f]"
            >
              <WhatsAppIcon />
              Whatsapp Us
            </Link>
          </div>
        </div>

        {/* Cards column: tall scroll container with one sticky stage.
            overflow-hidden clips the rising cards until they reach the stack. */}
        <div ref={cardsRef} className="relative h-[220vh]">
          <div className="sticky top-32 h-[480px] overflow-hidden">
            <div className="relative h-full pt-6">
              {CARDS.map((c, i) => (
                <StackCard
                  key={c.key}
                  card={c}
                  index={i}
                  total={CARDS.length}
                  progress={scrollYProgress}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
