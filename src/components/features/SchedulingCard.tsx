"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useQueryState, parseAsStringLiteral } from "nuqs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type InsuranceType = "health" | "term";
type CardView = "timeslot" | "form";

const springTransition = { type: "spring" as const, visualDuration: 0.3, bounce: 0.15 };
const instantTransition = { duration: 0 };

const variants = {
  enter: (dir: "forward" | "back") => ({
    opacity: 0,
    x: dir === "forward" ? 40 : -40,
  }),
  center: { opacity: 1, x: 0 },
  exit: (dir: "forward" | "back") => ({
    opacity: 0,
    x: dir === "forward" ? -40 : 40,
  }),
};

export function SchedulingCard() {
  const [activeTab, setActiveTab] = useState<InsuranceType>("health");
  const [view, setView] = useQueryState(
    "step",
    parseAsStringLiteral(["timeslot", "form"] as const).withDefault("timeslot")
  );
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const reduced = useReducedMotion();

  const transition = reduced ? instantTransition : springTransition;

  const goToForm = () => {
    setDirection("forward");
    setView("form");
  };

  const goBack = () => {
    setDirection("back");
    setView("timeslot");
  };

  return (
    <motion.div
      layout
      transition={transition}
      className="relative w-[411px] overflow-hidden rounded-[30px] border border-ditto-grey-50 bg-white shadow-[0px_4px_13px_0px_rgba(0,0,0,0.03)]"
    >
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        {view === "timeslot" ? (
          <motion.div
            key="timeslot"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            className="w-[411px]"
          >
            <TimeslotView
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onScheduleClick={goToForm}
            />
          </motion.div>
        ) : (
          <motion.div
            key="form"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            className="w-[411px]"
          >
            <FormView
              activeTab={activeTab}
              onBack={goBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Timeslot View (existing) ─── */

function TimeslotView({
  activeTab,
  onTabChange,
  onScheduleClick,
}: {
  activeTab: InsuranceType;
  onTabChange: (tab: InsuranceType) => void;
  onScheduleClick: () => void;
}) {
  return (
    <>
      <div className="p-6">
        {/* Tabs */}
        <div className="flex gap-2">
          <TabButton
            label="Health Insurance"
            active={activeTab === "health"}
            onClick={() => onTabChange("health")}
          />
          <TabButton
            label="Term Insurance"
            active={activeTab === "term"}
            onClick={() => onTabChange("term")}
          />
        </div>

        {/* Content */}
        <div className="mt-8">
          <h2 className="font-heading text-[21px] font-medium leading-tight tracking-tight text-ditto-black">
            Earliest Timeslot for{" "}
            {activeTab === "health" ? "Health" : "Term"} Insurance
          </h2>

          {/* Quick Expert Guidance badge */}
          <div className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-ditto-yellow px-4 py-1.5">
            <Image src="/icons/lightning.png" alt="" width={25} height={25} />
            <span className="font-heading text-[17px] font-medium tracking-tight text-ditto-black">
              Quick Expert Guidance
            </span>
          </div>
        </div>

        {/* Date */}
        <div className="mt-10">
          <div className="flex items-center gap-2">
            <Image src="/icons/calendar-date.svg" alt="" width={20} height={20} />
            <span className="font-heading text-[15px] text-[#1a1a1a] opacity-70">Saturday</span>
          </div>
          <p className="mt-2 font-heading text-2xl font-medium tracking-tight text-[#2c2e30]">
            04 Apr, 2026
          </p>
        </div>

        {/* Separator */}
        <div className="my-5 border-t border-dashed border-ditto-grey-50" />

        {/* Time */}
        <div>
          <div className="flex items-center gap-2">
            <Image src="/icons/clock-time.svg" alt="" width={20} height={20} />
            <span className="font-heading text-[15px] text-[#1a1a1a] opacity-70">Best Time</span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <TimeDisplay time="1:00" period="PM" />
            <ArrowRight className="h-5 w-5 text-[#1a1a1a]" />
            <TimeDisplay time="1:30" period="PM" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 px-6 pb-6">
        <button
          onClick={onScheduleClick}
          className="flex h-[62px] w-full items-center justify-between rounded-[18px] bg-ditto-blue-dark px-6 font-heading text-xl font-medium text-white shadow-[0px_6px_12px_0px_rgba(30,37,75,0.06)] transition-colors hover:bg-ditto-blue-active"
        >
          <span>Schedule a Free Call</span>
          <Image src="/icons/phone-calendar.svg" alt="" width={21} height={20} />
        </button>
        <button className="flex h-[62px] w-full items-center justify-between rounded-[18px] border border-ditto-grey-50 bg-white px-6 font-heading text-xl font-medium text-ditto-grey-600 shadow-[0px_4px_13px_0px_rgba(0,0,0,0.03)] transition-colors hover:bg-ditto-grey-100">
          <span>Pick preferred time (24 slots)</span>
          <Image src="/icons/calendar-slot.svg" alt="" width={21} height={21} />
        </button>
      </div>
    </>
  );
}

/* ─── Schema ─── */

const scheduleSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .max(10, "Enter a valid phone number")
    .regex(/^\d+$/, "Only digits allowed"),
  email: z
    .string()
    .min(1, "Email is required")
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Enter a valid email"
    ),
  note: z.string().optional(),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

/* ─── Form View ─── */

function FormView({
  activeTab,
  onBack,
}: {
  activeTab: InsuranceType;
  onBack: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { name: "", phone: "", email: "", note: "" },
  });

  useEffect(() => {
    const t = setTimeout(() => setFocus("name"), 350);
    return () => clearTimeout(t);
  }, [setFocus]);

  const onSubmit = (data: ScheduleFormData) => {
    // TODO: wire to API
    console.log("Schedule call:", data);
  };

  const insuranceLabel = activeTab === "health" ? "Health" : "Term";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6" noValidate>
      {/* Back link */}
      <button
        type="button"
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-[15px] text-[#1a1a1a] opacity-70 transition-opacity hover:opacity-100"
      >
        <Image src="/icons/arrow-back.svg" alt="" width={12} height={11} />
        <span className="font-heading">Go back</span>
      </button>

      {/* Yellow summary banner */}
      <div className="relative h-[134px] overflow-hidden rounded-[18px] border border-[#fff7ce] bg-ditto-yellow px-5 pt-5">
        <Image
          src="/icons/lightning-large.png"
          alt=""
          width={86}
          height={86}
          className="absolute right-0 top-0"
        />
        <h3 className="relative z-10 text-[20px] font-semibold leading-tight tracking-tight text-[#33383b]">
          {insuranceLabel} Insurance Advice
        </h3>
        <div className="relative z-10 mt-4 flex gap-8">
          <div>
            <div className="flex items-center gap-1.5 opacity-70">
              <Image src="/icons/calendar-date.svg" alt="" width={18} height={18} className="-mt-1" />
              <span className="font-heading text-[14px] text-[#1a1a1a]">Saturday</span>
            </div>
            <p className="mt-1 font-heading text-[19px] font-medium text-[#2c2e30]">
              04 Apr, 2026
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 opacity-70">
              <Image src="/icons/clock-time.svg" alt="" width={18} height={18} className="-mt-0.5" />
              <span className="font-heading text-[14px] text-[#1a1a1a]">Time</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-heading text-[19px] font-medium text-[#1a1a1a]">1:00 <sup className="text-[11px]">PM</sup></span>
              <span className="font-heading text-[20px] text-[#1a1a1a]">→</span>
              <span className="font-heading text-[19px] font-medium text-[#1a1a1a]">1:30 <sup className="text-[11px]">PM</sup></span>
            </div>
          </div>
        </div>
      </div>

      {/* Form fields */}
      <div className="mt-5 flex flex-col gap-[18px]" role="group" aria-label="Contact details">
        <FormField
          fieldId="field-name"
          icon={<Image src="/icons/user.svg" alt="" width={20} height={20} />}
          error={errors.name?.message}
        >
          <input
            {...register("name")}
            id="field-name"
            aria-label="Full name"
            aria-describedby={errors.name ? "field-name-error" : undefined}
            aria-invalid={!!errors.name}
            placeholder="Your name"
            className="w-full bg-transparent font-heading text-base text-[#222223] placeholder:text-[#999] focus:outline-none"
          />
        </FormField>

        <FormField
          fieldId="field-phone"
          prefix={"+91\u00a0-\u00a0"}
          icon={<Image src="/icons/mobile-phone.svg" alt="" width={18} height={20} />}
          error={errors.phone?.message}
        >
          <input
            {...register("phone")}
            id="field-phone"
            aria-label="Phone number"
            aria-describedby={errors.phone ? "field-phone-error" : undefined}
            aria-invalid={!!errors.phone}
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="9897969594"
            className="w-full bg-transparent font-heading text-base text-[#222223] placeholder:text-[#999] focus:outline-none"
          />
        </FormField>

        <FormField
          fieldId="field-email"
          icon={<Image src="/icons/email.svg" alt="" width={20} height={20} />}
          error={errors.email?.message}
        >
          <input
            {...register("email")}
            id="field-email"
            aria-label="Email address"
            aria-describedby={errors.email ? "field-email-error" : undefined}
            aria-invalid={!!errors.email}
            type="email"
            placeholder="your@email.com"
            className="w-full bg-transparent font-heading text-base text-[#222223] placeholder:text-[#999] focus:outline-none"
          />
        </FormField>

        <div>
          <div className="overflow-hidden rounded-2xl border-[1.5px] border-[#eeeeef]">
            <textarea
              {...register("note")}
              aria-label="Additional notes"
              placeholder="Tell us about your insurance needs..."
              className="h-[80px] w-full resize-none bg-white px-4 py-3.5 font-heading text-base text-[#222223] placeholder:text-[#999] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Submit button */}
      <div className="mt-5">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-[62px] w-full items-center justify-between rounded-[18px] bg-ditto-blue-dark px-6 font-heading text-xl font-medium text-white shadow-[0px_6px_12px_0px_rgba(30,37,75,0.06)] transition-colors hover:bg-ditto-blue-active disabled:opacity-70"
        >
          <span>Schedule a Free Call</span>
          <Image src="/icons/phone-calendar.svg" alt="" width={21} height={20} />
        </button>
      </div>
    </form>
  );
}

/* ─── Shared Helpers ─── */

function FormField({
  children,
  icon,
  prefix,
  error,
  fieldId,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  prefix?: string;
  error?: string;
  fieldId: string;
}) {
  return (
    <div className="relative">
      <div
        className={`flex items-center overflow-hidden rounded-[14px] border-[1.5px] transition-colors ${
          error ? "border-red-400" : "border-[#eeeeef]"
        }`}
      >
        <div className="flex flex-1 items-center px-4 py-3.5">
          {prefix && (
            <span className="shrink-0 whitespace-nowrap font-heading text-base font-medium text-[#222223]">
              {prefix}
            </span>
          )}
          {children}
        </div>
        <div className="px-4">{icon}</div>
      </div>
      {error && (
        <p
          id={`${fieldId}-error`}
          role="alert"
          aria-live="assertive"
          className="absolute bottom-[-14px] left-4 text-[10px] leading-none text-red-500"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border-2 px-6 py-2.5 text-base font-semibold transition-all ${
        active
          ? "border-ditto-blue-active bg-ditto-blue-bg text-ditto-blue-active"
          : "border-ditto-grey-50 bg-white text-ditto-black hover:border-ditto-grey-400"
      }`}
    >
      {label}
    </button>
  );
}

function TimeDisplay({ time, period }: { time: string; period: string }) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="font-heading text-2xl font-medium text-[#1a1a1a]">{time}</span>
      <span className="font-heading text-[13px] font-medium text-[#1a1a1a]">{period}</span>
    </div>
  );
}
