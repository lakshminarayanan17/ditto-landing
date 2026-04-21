"use client";

import React, { useMemo, useState, useCallback } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useQueryState, parseAsStringLiteral } from "nuqs";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { BookingForm, type FormData } from "./BookingForm";
import { MoreSlotsDrawer } from "./MoreSlotsDrawer";
import { CaseStudiesView } from "./CaseStudiesView";
import { formatDateDisplay, getDayName, getNextSixDays, getSlotEndTime } from "@/lib/date-utils";

type InsuranceType = "health" | "term";

const easeTransition = { duration: 0.22, ease: [0.25, 0.1, 0.25, 1.0] as const };
const exitTransition = { duration: 0.15, ease: [0.4, 0, 1, 1] as const };
const instantTransition = { duration: 0 };

const variants = {
  enter: (dir: "forward" | "back") => ({
    opacity: 0,
    y: dir === "forward" ? 10 : -10,
  }),
  center: {
    opacity: 1,
    y: 0,
    transition: easeTransition,
  },
  exit: (dir: "forward" | "back") => ({
    opacity: 0,
    y: dir === "forward" ? -6 : 6,
    transition: exitTransition,
  }),
};

const EARLIEST_TIME = "1:00 PM";

export function SchedulingCard() {
  const earliestDate = useMemo(() => getNextSixDays()[0], []);

  const [activeTab, setActiveTab] = useQueryState(
    "type",
    parseAsStringLiteral(["health", "term"] as const).withDefault("health")
  );
  const [view, setView] = useQueryState(
    "step",
    parseAsStringLiteral(["timeslot", "form", "success", "cases"] as const).withDefault("timeslot")
  );
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState<string | undefined>();
  const [savedFormData, setSavedFormData] = useState<FormData | undefined>();
  const [isRescheduled, setIsRescheduled] = useState(false);
  const [bookedSlot, setBookedSlot] = useState<{
    date: string; dayName: string; timeStart: string; timeEnd: string;
  } | null>(null);
  const reduced = useReducedMotion();

  const goToForm = () => {
    setDirection("forward");
    setView("form");
  };

  const goBack = () => {
    setDirection("back");
    setView("timeslot");
  };

  const goToSuccess = (slot: { date: string; dayName: string; timeStart: string; timeEnd: string }) => {
    setIsRescheduled(!!drawerTitle);
    setBookedSlot(slot);
    setDirection("forward");
    setView("success");
  };

  const goToCases = () => {
    setDirection("forward");
    setView("cases");
  };

  const goBackToSuccess = () => {
    setDirection("back");
    setView("success");
  };

  return (
    <>
      <div className="relative h-[487px] w-full overflow-hidden rounded-[24px] border border-ditto-grey-50 bg-white shadow-[0px_4px_13px_0px_rgba(0,0,0,0.03)] lg:h-[597px] lg:w-[411px] lg:rounded-[30px]">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          {view === "timeslot" && (
            <motion.div
              key="timeslot"
              custom={direction}
              variants={variants}
              initial={reduced ? false : "enter"}
              animate="center"
              exit="exit"
              className="h-full w-full lg:w-[411px]"
            >
              <TimeslotView
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onScheduleClick={goToForm}
                onPickSlots={() => { setDrawerTitle(undefined); setDrawerOpen(true); }}
                earliestDate={earliestDate}
              />
            </motion.div>
          )}
          {view === "form" && (
            <motion.div
              key="form"
              custom={direction}
              variants={variants}
              initial={reduced ? false : "enter"}
              animate="center"
              exit="exit"
              className="h-full w-full lg:w-[411px]"
            >
              <BookingForm
                insuranceType={activeTab}
                selectedDate={formatDateDisplay(earliestDate)}
                selectedDayName={getDayName(earliestDate)}
                selectedTimeStart={EARLIEST_TIME}
                selectedTimeEnd={getSlotEndTime(EARLIEST_TIME)}
                showBackButton
                onBack={goBack}
                onSuccess={goToSuccess}
                onFormDataCapture={setSavedFormData}
              />
            </motion.div>
          )}
          {view === "success" && (bookedSlot ? (
            <motion.div
              key="success"
              custom={direction}
              variants={variants}
              initial={reduced ? false : "enter"}
              animate="center"
              exit="exit"
              className="absolute inset-0 w-full lg:w-[411px]"
            >
              <SuccessView
                insuranceType={activeTab}
                bookedSlot={bookedSlot}
                isRescheduled={isRescheduled}
                onReschedule={() => {
                  setDrawerTitle("Reschedule your Slot");
                  setDrawerOpen(true);
                }}
                onViewCases={goToCases}
              />
            </motion.div>
          ) : <RedirectToTimeslot onRedirect={goBack} />)}
          {view === "cases" && (
            <motion.div
              key="cases"
              custom={direction}
              variants={variants}
              initial={reduced ? false : "enter"}
              animate="center"
              exit="exit"
              className="h-full w-full lg:w-[411px]"
            >
              <CaseStudiesView onBack={goBackToSuccess} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <MoreSlotsDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        activeTab={activeTab}
        onScheduleSuccess={goToSuccess}
        title={drawerTitle}
        skipForm={!!drawerTitle}
        prefillData={drawerTitle ? savedFormData : undefined}
        onFormDataCapture={setSavedFormData}
      />
    </>
  );
}

/* ─── Timeslot View ─── */

// Module-level flag — badge only animates on first ever mount
let _badgeAnimated = false;

function TimeslotView({
  activeTab,
  onTabChange,
  onScheduleClick,
  onPickSlots,
  earliestDate,
}: {
  activeTab: InsuranceType;
  onTabChange: (tab: InsuranceType) => void;
  onScheduleClick: () => void;
  earliestDate: Date;
  onPickSlots: () => void;
}) {
  const [badgeRevealed, setBadgeRevealed] = React.useState(_badgeAnimated);
  const [textRevealed, setTextRevealed] = React.useState(_badgeAnimated);
  const isFirstRun = React.useRef(!_badgeAnimated);

  React.useEffect(() => {
    if (_badgeAnimated) return;
    // Pill + icon pop in first
    const t1 = setTimeout(() => setBadgeRevealed(true), 300);
    // Text sweeps in 220ms later
    const t2 = setTimeout(() => {
      setTextRevealed(true);
      _badgeAnimated = true;
    }, 520);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-5 pb-[26px] lg:px-6 lg:pt-6 lg:pb-[43px]">
        {/* Tabs — smaller on mobile */}
        <div className="flex gap-3 *:flex-1 lg:*:flex-none">
          <TabButton label="Health Insurance" active={activeTab === "health"} onClick={() => onTabChange("health")} />
          <TabButton label="Term Insurance" active={activeTab === "term"} onClick={() => onTabChange("term")} />
        </div>

        {/* Title + badge */}
        <div className="mt-5 lg:mt-[40px]">
          <h2 className="font-heading text-[20px] font-medium leading-tight tracking-tight text-ditto-black lg:text-[21px]">
            Earliest Timeslot for {activeTab === "health" ? "Health" : "Term"} Insurance
          </h2>
          {/* Phase 1: pill pops in */}
          <motion.div
            animate={badgeRevealed ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.72 }}
            transition={{ type: "spring", stiffness: 360, damping: 22 }}
            className="mt-3 inline-flex items-center gap-1.5 overflow-hidden rounded-[14px] bg-ditto-yellow pl-3 pr-3.5 py-1.5 lg:mt-4 lg:rounded-[16px] lg:pl-3.5 lg:pr-4 lg:py-1.5"
          >
            {/* Phase 2: icon bounces in with slight rotation */}
            <motion.div
              animate={badgeRevealed ? { scale: 1, rotate: 0 } : { scale: 0.2, rotate: -25 }}
              transition={{ type: "spring", stiffness: 480, damping: 18, delay: 0.07 }}
            >
              <Image src="/icons/lightning.png" alt="" width={22} height={22} className="lg:h-[25px] lg:w-[25px]" />
            </motion.div>

            {/* Phase 3: text sweeps in left→right with multicolor gradient */}
            <motion.span
              animate={{ clipPath: textRevealed ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className={`whitespace-nowrap font-heading text-[15px] font-medium tracking-tight lg:text-[17px] ${
                isFirstRun.current && textRevealed ? "badge-text-animate" : "text-ditto-black"
              }`}
            >
              Quick Expert Guidance
            </motion.span>
          </motion.div>
        </div>

        {/* Date and time sections */}
        <div className="mt-5 lg:mt-8">
          <div className="flex items-center gap-1.5">
            <Image src="/icons/calendar-date.svg" alt="" width={17} height={17} className="shrink-0 lg:h-[19px] lg:w-[19px]" />
            <span className="font-heading text-[14px] leading-none text-[#1a1a1a] opacity-70 translate-y-[1px] lg:text-[15px] lg:translate-y-[2px]">
              {getDayName(earliestDate)}
            </span>
          </div>
          <p className="mt-2 font-heading text-[22px] font-medium tracking-tight text-[#2c2e30] lg:mt-2.5 lg:text-2xl">
            {formatDateDisplay(earliestDate)}
          </p>
        </div>

        <div className="my-4 border-t border-dashed border-ditto-grey-50 lg:my-5" />

        <div>
          <div className="flex items-center gap-1.5">
            <Image src="/icons/clock-time.svg" alt="" width={17} height={17} className="shrink-0 lg:h-5 lg:w-5" />
            <span className="font-heading text-[14px] leading-none text-[#1a1a1a] opacity-70 translate-y-[1px] lg:text-[15px] lg:translate-y-0">Best Time</span>
          </div>
          <div className="mt-2 flex items-baseline gap-3 lg:mt-2.5 lg:gap-3.5">
            <TimeDisplay time="1:00" period="PM" />
            <span className="font-heading text-[22px] font-medium text-[#1a1a1a] lg:text-2xl">→</span>
            <TimeDisplay time="1:30" period="PM" />
          </div>
        </div>
      </div>

      {/* Buttons — shorter on mobile */}
      <div className="mt-auto shrink-0 flex flex-col gap-3 px-5 pb-[22px] lg:px-6 lg:pb-[27px]">
        <button
          onClick={onScheduleClick}
          className="flex h-[52px] w-full items-center justify-between rounded-[14px] bg-ditto-blue-dark px-5 font-heading text-[17px] font-medium text-white shadow-[0px_2px_6px_0px_rgba(0,37,79,0.14)] transition-colors hover:bg-ditto-blue-active lg:h-[62px] lg:rounded-[18px] lg:px-6 lg:text-xl lg:shadow-[0px_6px_12px_0px_rgba(30,37,75,0.06)]"
        >
          <span>Book this free slot</span>
          <Image src="/icons/phone-calendar.svg" alt="" width={20} height={20} className="lg:h-5 lg:w-[21px]" />
        </button>
        <button
          onClick={onPickSlots}
          className="flex h-[52px] w-full items-center justify-between rounded-[14px] border border-ditto-grey-50 bg-white px-5 font-heading text-[17px] font-medium text-ditto-grey-600 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] transition-colors hover:bg-ditto-grey-100 lg:h-[62px] lg:rounded-[18px] lg:px-6 lg:text-xl lg:shadow-[0px_4px_13px_0px_rgba(0,0,0,0.03)]"
        >
          <span>Pick preferred time (24 slots)</span>
          <Image src="/icons/calendar-slot.svg" alt="" width={20} height={20} className="lg:h-[21px] lg:w-[21px]" />
        </button>
      </div>
    </div>
  );
}

/* ─── Success View ─── */

function SuccessView({
  insuranceType,
  bookedSlot,
  isRescheduled,
  onReschedule,
  onViewCases,
}: {
  insuranceType: InsuranceType;
  bookedSlot: { date: string; dayName: string; timeStart: string; timeEnd: string };
  isRescheduled?: boolean;
  onReschedule: () => void;
  onViewCases: () => void;
}) {
  const label = insuranceType === "health" ? "Health" : "Term";
  const [timeVal, timePeriod] = bookedSlot.timeStart.split(" ");
  const [endVal, endPeriod] = bookedSlot.timeEnd.split(" ");

  const dayAbbr = bookedSlot.dayName.slice(0, 3);

  return (
    <div className="flex h-full flex-col items-center rounded-[24px] bg-transparent px-6 pt-7 pb-6 lg:rounded-none lg:px-6 lg:py-8">
      {/* Stamp */}
      <div className="mix-blend-multiply">
        <Image
          src={insuranceType === "health" ? "/images/stamp-health.png" : "/images/stamp-term.png"}
          alt={`Consultation booked for ${label} insurance`}
          width={109}
          height={109}
          className="h-[88px] w-[88px] lg:h-[109px] lg:w-[109px]"
        />
      </div>

      {/* Heading */}
      <h2 className="mt-3 text-center font-heading text-[23px] font-bold leading-[1.15] tracking-tight text-[#33383b] lg:mt-4 lg:text-[26px]">
        Insurance Advice
        <br />
        {isRescheduled ? "Rescheduled!" : "Scheduled!"}
      </h2>

      {/* Description */}
      <p className="mt-2.5 max-w-[270px] text-center text-[15px] leading-[1.45] text-[#404040] lg:mt-3 lg:max-w-[270px] lg:text-[17px]">
        An advisor from Ditto will call you to discuss your insurance queries on
      </p>

      {/* Date/time card — yellow on mobile */}
      <div className="mt-4 w-full rounded-[18px] bg-[#fff9db] px-5 py-3.5 lg:mt-6 lg:hidden lg:rounded-[19px] lg:px-5 lg:py-4">
        <div className="flex items-center justify-center gap-2.5">
          <Image src="/icons/calendar-date.svg" alt="" width={19} height={19} />
          <span className="font-heading text-[17px] font-medium text-[#1a1a1a]">
            {dayAbbr}, {bookedSlot.date}
          </span>
        </div>
        <div className="my-2.5 border-t border-dashed border-[#e0d9a0]" />
        <div className="flex items-center justify-center gap-2.5">
          <Image src="/icons/clock-time.svg" alt="" width={19} height={19} />
          <span className="font-heading text-[17px] font-medium text-[#1a1a1a]">
            {timeVal} <span className="align-super text-[11px] font-medium">{timePeriod}</span>
          </span>
          <span className="font-heading text-[17px] text-[#1a1a1a]">→</span>
          <span className="font-heading text-[17px] font-medium text-[#1a1a1a]">
            {endVal} <span className="align-super text-[11px] font-medium">{endPeriod}</span>
          </span>
        </div>
      </div>

      {/* Desktop: yellow horizontal date/time banner */}
      <div className="mt-6 hidden w-full items-center rounded-[14px] border border-[#fff7ce] bg-ditto-yellow px-5 py-4 lg:mt-[42px] lg:flex">
        <div className="flex w-full gap-5">
          <div className="shrink-0">
            <div className="flex items-center gap-1.5">
              <Image src="/icons/calendar-date.svg" alt="" width={18} height={18} className="shrink-0" />
              <span className="font-heading text-[14px] leading-none text-[#1a1a1a] opacity-70">{bookedSlot.dayName}</span>
            </div>
            <p className="mt-1 whitespace-nowrap font-heading text-[19px] font-medium text-[#2c2e30]">
              {bookedSlot.date}
            </p>
          </div>
          <div className="shrink-0">
            <div className="flex items-center gap-1.5">
              <Image src="/icons/clock-time.svg" alt="" width={18} height={18} className="shrink-0" />
              <span className="font-heading text-[14px] leading-none text-[#1a1a1a] opacity-70">Time</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2 whitespace-nowrap">
              <span className="font-heading text-[19px] font-medium text-[#1a1a1a]">
                {timeVal} <sup className="text-[11px]">{timePeriod}</sup>
              </span>
              <span className="font-heading text-[20px] text-[#1a1a1a]">→</span>
              <span className="font-heading text-[19px] font-medium text-[#1a1a1a]">
                {endVal} <sup className="text-[11px]">{endPeriod}</sup>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTAs */}
      <div className="mt-auto flex w-full flex-col items-center">
        <button onClick={onViewCases} className="flex h-[48px] w-full items-center justify-center gap-3 rounded-[16px] border border-[#efefef] bg-white shadow-[0px_3px_11px_0px_rgba(0,37,79,0.04)] lg:h-[56px] lg:rounded-[16px]">
          <Image src="/icons/list.svg" alt="" width={16} height={16} className="lg:h-[17px] lg:w-[17px]" />
          <span className="font-heading text-[16px] font-medium text-[#1a1a1a] lg:text-[17px]">
            View Case Studies
          </span>
        </button>

        <button
          onClick={onReschedule}
          className="mt-3.5 text-[14px] font-medium text-[#006ee4] underline lg:mt-4 lg:text-[15px]"
        >
          Reschedule options
        </button>
      </div>
    </div>
  );
}

/* ─── Redirect fallback (when ?step=success but no booked data) ─── */

function RedirectToTimeslot({ onRedirect }: { onRedirect: () => void }) {
  React.useEffect(() => { onRedirect(); }, [onRedirect]);
  return null;
}

/* ─── Helpers ─── */

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-[14px] border border-transparent h-[39px] px-4 text-[15px] font-medium transition-colors lg:h-[51px] lg:rounded-[30px] lg:px-6 lg:text-base ${
        active
          ? "bg-ditto-blue-bg text-ditto-blue-active shadow-[0_0_0_2px_#004EA8]"
          : "bg-white text-[#8e8e8e] shadow-[0_0_0_1.5px_#c8cdd3] lg:text-ditto-black"
      }`}
    >
      {label}
    </button>
  );
}

function TimeDisplay({ time, period }: { time: string; period: string }) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="font-heading text-[22px] font-medium text-[#1a1a1a] lg:text-2xl">{time}</span>
      <span className="font-heading text-[16px] font-medium text-[#1a1a1a] lg:text-[20px]">{period}</span>
    </div>
  );
}

/* ─── Rolling digit animation ─── */

function RollingDigit({ digit, delay }: { digit: number; delay: number }) {
  const cells = React.useMemo(() => {
    const extraCycles = 15;
    return Array.from({ length: extraCycles + digit + 1 }, (_, i) => i % 10);
  }, [digit]);
  const finalIndex = cells.length - 1;

  const anchorRef = React.useRef<HTMLSpanElement | null>(null);
  const [cellHeight, setCellHeight] = React.useState<number | null>(null);

  React.useLayoutEffect(() => {
    if (anchorRef.current) setCellHeight(anchorRef.current.offsetHeight);
  }, []);

  return (
    <span
      className="relative inline-block overflow-hidden leading-none"
      style={{ verticalAlign: "baseline" }}
    >
      {/* Invisible baseline anchor — also used to measure the cell height in px. */}
      <span ref={anchorRef} className="invisible">0</span>
      {cellHeight !== null && (
        <motion.span
          initial={{ y: 0 }}
          animate={{ y: -finalIndex * cellHeight }}
          transition={{ duration: 1.3, delay, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-0 top-0 flex flex-col leading-none"
        >
          {cells.map((d, i) => (
            <span key={i} style={{ height: cellHeight }}>{d}</span>
          ))}
        </motion.span>
      )}
    </span>
  );
}

function RollingTime({ value, startDelay }: { value: string; startDelay: number }) {
  return (
    <span className="inline-flex items-baseline">
      {value.split("").map((ch, i) => {
        if (/[0-9]/.test(ch)) {
          return <RollingDigit key={i} digit={parseInt(ch, 10)} delay={startDelay + i * 0.1} />;
        }
        return <span key={i}>{ch}</span>;
      })}
    </span>
  );
}

