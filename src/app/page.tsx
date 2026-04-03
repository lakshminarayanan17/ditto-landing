import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/features/HeroSection";
import { SchedulingCard } from "@/components/features/SchedulingCard";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-ditto-grey-100">
      <Navbar />

      <main className="flex-1">
        <section className="mx-auto max-w-[1440px] px-4 lg:px-[160px]">
          <div className="flex flex-col items-center gap-12 py-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16 lg:py-24">
            {/* Left: Hero content */}
            <div className="flex-1">
              <HeroSection />
            </div>

            {/* Right: Scheduling card (desktop only) */}
            <div id="schedule" className="hidden shrink-0 lg:block lg:w-auto">
              <Suspense fallback={<div className="h-[597px] w-[411px] animate-pulse rounded-[30px] bg-white" />}>
                <SchedulingCard />
              </Suspense>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
