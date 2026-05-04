"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Calendar } from "lucide-react";

type TrustCard = {
  key: string;
  title: ReactNode;
  subtitle: string;
  topContent: ReactNode;
  rotateZ: number;
};

// Stable per-card Z-rotation (pieterkoopt uses random ±5; we hand-pick for
// determinism so SSR matches client and the visual feels intentional).
const CARDS: TrustCard[] = [
  {
    key: "google",
    title: "Google Ratings",
    subtitle: "Top Rated with 12,000 reviews",
    rotateZ: -4,
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
    rotateZ: 3,
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
    rotateZ: 0,
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

// Pieterkoopt's stacking effect (mwg_effect031 — GSAP):
//   gsap.to(n, { rotationZ: 10*(Math.random()-0.5), scale: 0.7, rotationX: 40,
//     scrollTrigger: { pin, start: "top 20%", end: "+=window.innerHeight", scrub } })
//   gsap.to(n, { autoAlpha: 0, scrollTrigger: { start: "top -80%", end: "+=20vh" } })
// Translated to Motion: each slide pins for ~1 viewport, the card tips back
// 40° on X, scales to 0.7, picks up a small Z tilt, then fades out.
function StackSlide({
  card,
  index,
  total,
}: {
  card: TrustCard;
  index: number;
  total: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 20%", "start -80%"],
  });

  const isLast = index === total - 1;
  const rotateX = useTransform(scrollYProgress, [0, 1], [0, isLast ? 0 : 40]);
  const rotateZ = useTransform(
    scrollYProgress,
    [0, 1],
    [0, isLast ? 0 : card.rotateZ]
  );
  const scale = useTransform(scrollYProgress, [0, 1], [1, isLast ? 1 : 0.7]);
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.7, 1],
    [1, 1, isLast ? 1 : 0]
  );

  return (
    <div ref={ref} className="relative h-[100vh] lg:h-[110vh]">
      <div className="sticky top-[18vh] flex justify-center lg:justify-start">
        <motion.div
          style={{
            rotateX,
            rotateZ,
            scale,
            opacity,
            transformStyle: "preserve-3d",
            transformOrigin: "center top",
          }}
          className="relative w-full max-w-[420px] overflow-hidden rounded-[28px] border border-[#f1f1f1] bg-white p-8 shadow-[0_1px_60px_rgba(0,0,0,0.06)] lg:h-[337px]"
        >
          <div className="mb-8 flex h-[68px] items-center">
            {card.topContent}
          </div>
          <h3 className="mb-6 font-heading text-[28px] font-medium leading-[1.16] tracking-[0.01em] text-[#535353] lg:text-[35px]">
            {card.title}
          </h3>
          <p className="font-heading text-[20px] font-medium leading-[1.16] text-[#535353] lg:text-[24px]">
            {card.subtitle}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export function TrustSection() {
  return (
    <section
      className="relative bg-ditto-grey-100 pt-12 lg:pt-20"
      style={{ perspective: "1500px" }}
    >
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

        <div className="relative">
          {CARDS.map((c, i) => (
            <StackSlide key={c.key} card={c} index={i} total={CARDS.length} />
          ))}
        </div>
      </div>
    </section>
  );
}
