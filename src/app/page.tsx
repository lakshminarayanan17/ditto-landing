import { Suspense } from "react";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { HeroContent } from "@/components/features/HeroContent";
import { SchedulingCard } from "@/components/features/SchedulingCard";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-ditto-grey-100">
      <Navbar />

      <main className="flex-1">
        <section className="mx-auto max-w-[1440px] px-4 lg:px-[160px]">
          <div className="flex flex-col items-center gap-6 py-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16 lg:py-24">
            {/* Left: Hero content */}
            <div className="flex-1">
              <HeroContent />
            </div>

            {/* Right: Scheduling card */}
            <div id="schedule" className="w-full shrink-0 lg:w-auto">
              <Suspense fallback={<div className="h-[597px] w-full animate-pulse rounded-[30px] bg-white lg:w-[411px]" />}>
                <SchedulingCard />
              </Suspense>
            </div>
          </div>

          {/* Hero image — below card on mobile, hidden on desktop (shown inside HeroSection) */}
          <div className="mx-auto -mt-4 mb-10 w-full max-w-[343px] overflow-hidden rounded-2xl lg:hidden">
            <Image
              src="/images/professional-advice.png"
              alt="Professional Advice — Which life insurance is best for me?"
              width={636}
              height={336}
              sizes="343px"
              className="h-auto w-full"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
