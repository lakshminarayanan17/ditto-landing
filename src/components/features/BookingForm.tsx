"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/useIsMobile";

/* ─── Schema ─── */

const SOURCE_OPTIONS = ["Instagram", "YouTube", "LinkedIn", "Reddit", "Word of mouth", "Other"] as const;

const COUNTRIES = [
  { code: "IN", dial: "+91", flag: "🇮🇳" },
  { code: "US", dial: "+1", flag: "🇺🇸" },
  { code: "GB", dial: "+44", flag: "🇬🇧" },
  { code: "AE", dial: "+971", flag: "🇦🇪" },
  { code: "SG", dial: "+65", flag: "🇸🇬" },
  { code: "AU", dial: "+61", flag: "🇦🇺" },
  { code: "CA", dial: "+1", flag: "🇨🇦" },
  { code: "DE", dial: "+49", flag: "🇩🇪" },
] as const;

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
  source: z.string().optional(),
  note: z.string().optional(),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

/* ─── Props ─── */

export type FormData = { name: string; phone: string; email: string; source?: string; note?: string; countryCode?: string };

interface BookingFormProps {
  insuranceType: "health" | "term";
  selectedDate: string;
  selectedDayName: string;
  selectedTimeStart: string;
  selectedTimeEnd: string;
  onSuccess?: (slot: { date: string; dayName: string; timeStart: string; timeEnd: string }) => void;
  showBackButton?: boolean;
  onBack?: () => void;
  submitDisabled?: boolean;
  submitLabel?: string;
  prefillData?: FormData;
  onFormDataCapture?: (data: FormData) => void;
  onCountryChange?: (countryCode: string) => void;
}

/* ─── Component ─── */

export function BookingForm({
  insuranceType,
  selectedDate,
  selectedDayName,
  selectedTimeStart,
  selectedTimeEnd,
  onSuccess,
  showBackButton,
  onBack,
  submitDisabled,
  submitLabel,
  prefillData,
  onFormDataCapture,
  onCountryChange,
}: BookingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    watch,
    setFocus,
    setValue,
    reset,
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    mode: "onChange",
    defaultValues: {
      name: prefillData?.name ?? "",
      phone: prefillData?.phone ?? "",
      email: prefillData?.email ?? "",
      source: prefillData?.source ?? "",
      note: prefillData?.note ?? "",
    },
  });

  const initialCountry = COUNTRIES.find((c) => c.code === (prefillData?.countryCode ?? "IN")) ?? COUNTRIES[0];
  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const phoneFieldRef = useRef<HTMLDivElement>(null);
  const countryTriggerRef = useRef<HTMLButtonElement>(null);
  const sourceTriggerRef = useRef<HTMLElement>(null);
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState(prefillData?.source ?? "");
  const [customSource, setCustomSource] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setFocus("name"), 350);
    return () => clearTimeout(t);
  }, [setFocus]);

  const handleFieldFocus = useCallback((e: React.FocusEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
      setTimeout(() => {
        target.closest(".relative, div")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 50);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      }
    }, 50);
  }, []);

  const watchedFields = watch();
  const sourceValue = selectedSource === "Other" ? customSource : selectedSource;
  const allFilled = isValid && !!sourceValue && !!watchedFields.note;

  const onSubmit = (data: ScheduleFormData) => {
    console.log("Schedule call:", {
      ...data,
      insuranceType,
      date: selectedDate,
      time: `${selectedTimeStart} - ${selectedTimeEnd}`,
    });
    toast.success(submitLabel ? "Call rescheduled!" : "Call scheduled!", {
      description: `${selectedDate} at ${selectedTimeStart}`,
    });
    onFormDataCapture?.({ ...data, countryCode: selectedCountry.code });
    onSuccess?.({
      date: selectedDate,
      dayName: selectedDayName,
      timeStart: selectedTimeStart,
      timeEnd: selectedTimeEnd,
    });
  };

  const insuranceLabel = insuranceType === "health" ? "Health" : "Term";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col" noValidate>
      {/* Fixed top: back button + yellow banner */}
      <div className="shrink-0 px-4 pt-4 lg:px-6 lg:pt-6">
        {showBackButton && onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-3 flex items-center gap-1.5 text-[13px] text-[#5F5F5F] transition-opacity hover:opacity-70 lg:mb-4 lg:text-[14px]"
          >
            <Image src="/icons/arrow-back.svg" alt="" width={12} height={11} className="-translate-y-[1.5px]" />
            <span className="font-heading">Go back</span>
          </button>
        )}

        <div className="relative overflow-hidden rounded-[12px] border border-[#fff7ce] bg-ditto-yellow px-4 pb-4 pt-4 lg:rounded-[16px] lg:px-5 lg:pb-5 lg:pt-5">
          <Image
            src="/icons/lightning-large.png"
            alt=""
            width={92}
            height={92}
            className="absolute right-0 top-0 lg:h-[92px] lg:w-[92px] h-[72px] w-[72px]"
          />
          <h3 className="relative z-10 text-[16px] font-semibold leading-tight tracking-tight text-[#33383b] lg:text-[20px]">
            {insuranceLabel} Insurance Advice
          </h3>
          <div className="relative z-10 mt-3 flex gap-4 sm:gap-8 lg:mt-4">
            <div>
              <div className="flex items-center gap-1.5">
                <Image src="/icons/calendar-date.svg" alt="" width={16} height={16} className="shrink-0 lg:h-[18px] lg:w-[18px]" />
                <span className="translate-y-[1px] font-heading text-[13px] leading-none text-[#646259] lg:text-[14px] lg:text-[#1a1a1a] lg:opacity-70">{selectedDayName}</span>
              </div>
              <p className="mt-1 font-heading text-[15px] font-medium text-[#2c2e30] lg:text-[19px]">
                {selectedDate}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Image src="/icons/clock-time.svg" alt="" width={16} height={16} className="shrink-0 lg:h-[18px] lg:w-[18px]" />
                <span className="font-heading text-[13px] leading-none text-[#646259] lg:text-[14px] lg:text-[#1a1a1a] lg:opacity-70">Time</span>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <TimePart value={selectedTimeStart} />
                <span className="font-heading text-[18px] text-[#1a1a1a] lg:text-[20px]">→</span>
                <TimePart value={selectedTimeEnd} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable form fields */}
      <div
        ref={scrollRef}
        onFocus={handleFieldFocus}
        className="min-h-0 flex-1 overflow-y-auto px-4 pt-3 lg:px-6 lg:pt-5"
      >
        <div className="flex flex-col gap-[10px] lg:gap-[14px]">
        <FormField fieldId="field-name" icon={<Image src="/icons/user.svg" alt="" width={20} height={20} />} error={errors.name?.message}>
          <input
            {...register("name")}
            id="field-name"
            aria-label="Full name"
            aria-describedby={errors.name ? "field-name-error" : undefined}
            aria-invalid={!!errors.name}
            placeholder="Enter your Name"
            className="w-full bg-transparent font-heading text-[14px] text-[#222223] placeholder:text-[#999] focus:outline-none lg:text-base"
          />
        </FormField>

        <div className="relative" ref={phoneFieldRef}>
          <div
            className={`flex items-center overflow-hidden rounded-[10px] border-[1.5px] transition-colors lg:rounded-[14px] ${
              errors.phone ? "border-red-400" : "border-[#eeeeef]"
            }`}
          >
            <button
              ref={countryTriggerRef}
              type="button"
              onClick={() => setCountryDropdownOpen((v) => !v)}
              className="flex shrink-0 items-center gap-1 border-r border-[#eeeeef] pl-[13px] pr-2.5 py-2.5 lg:gap-1.5 lg:pl-[15px] lg:pr-3 lg:py-3.5"
            >
              <span className="text-[18px] leading-none lg:text-[20px]">{selectedCountry.flag}</span>
              <ChevronDown className={`h-3 w-3 text-[#666] transition-transform lg:h-3.5 lg:w-3.5 ${countryDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            <div className="flex flex-1 items-center px-2.5 py-2.5 lg:px-3 lg:py-3.5">
              <span className="shrink-0 whitespace-nowrap font-heading text-[14px] font-medium text-[#222223] lg:text-base">
                {selectedCountry.dial}&nbsp;-&nbsp;
              </span>
              <input
                {...register("phone")}
                id="field-phone"
                aria-label="Phone number"
                aria-describedby={errors.phone ? "field-phone-error" : undefined}
                aria-invalid={!!errors.phone}
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="Mobile Number"
                className="w-full bg-transparent font-heading text-[14px] text-[#222223] placeholder:text-[#999] focus:outline-none lg:text-base"
              />
            </div>
            <div className="shrink-0 pr-2 lg:pr-3">
              <NoSpamChip />
            </div>
          </div>
          <FloatingDropdown open={countryDropdownOpen} anchorRef={phoneFieldRef} onClose={() => setCountryDropdownOpen(false)}>
              {COUNTRIES.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    setSelectedCountry(country);
                    setCountryDropdownOpen(false);
                    onCountryChange?.(country.code);
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-3 font-heading text-base transition-colors hover:bg-[#f5f7fa] ${
                    selectedCountry.code === country.code ? "text-[#0771e9]" : "text-[#222223]"
                  }`}
                >
                  <span className="text-[20px] leading-none">{country.flag}</span>
                  <span>{country.dial}</span>
                  <span className="text-[#999]">{country.code}</span>
                </button>
              ))}
          </FloatingDropdown>
          {errors.phone && (
            <p
              id="field-phone-error"
              role="alert"
              aria-live="assertive"
              className="absolute bottom-[-14px] left-4 text-[10px] leading-none text-red-500"
            >
              {errors.phone.message}
            </p>
          )}
        </div>

        <FormField fieldId="field-email" icon={<Image src="/icons/email.svg" alt="" width={20} height={20} />} error={errors.email?.message}>
          <input
            {...register("email")}
            id="field-email"
            aria-label="Email address"
            aria-describedby={errors.email ? "field-email-error" : undefined}
            aria-invalid={!!errors.email}
            type="email"
            placeholder="Email Address"
            className="w-full bg-transparent font-heading text-[14px] text-[#222223] placeholder:text-[#999] focus:outline-none lg:text-base"
          />
        </FormField>

        <div className="relative">
          {selectedSource === "Other" ? (
            <div
              ref={sourceTriggerRef as React.RefObject<HTMLDivElement | null>}
              className="flex w-full items-center rounded-[10px] border-[1.5px] border-[#eeeeef] px-3 py-2.5 lg:rounded-[14px] lg:px-4 lg:py-3.5"
            >
              <span className="shrink-0 font-heading text-[14px] font-medium text-[#222223] lg:text-base">Other:&nbsp;</span>
              <input
                autoFocus
                value={customSource}
                onChange={(e) => {
                  setCustomSource(e.target.value);
                  setValue("source", e.target.value);
                }}
                placeholder="Please specify"
                className="w-full bg-transparent font-heading text-[14px] text-[#222223] placeholder:text-[#999] focus:outline-none lg:text-base"
              />
              <button
                type="button"
                onClick={() => { setSourceDropdownOpen((v) => !v); scrollToBottom(); }}
                className="shrink-0 ml-1"
              >
                <ChevronDown className={`h-4 w-4 text-[#222223] transition-transform lg:h-5 lg:w-5 ${sourceDropdownOpen ? "rotate-180" : ""}`} />
              </button>
            </div>
          ) : (
            <button
              ref={sourceTriggerRef as React.RefObject<HTMLButtonElement | null>}
              type="button"
              onClick={() => { setSourceDropdownOpen((v) => !v); scrollToBottom(); }}
              className="flex w-full items-center justify-between rounded-[10px] border-[1.5px] border-[#eeeeef] px-3 py-2.5 lg:rounded-[14px] lg:px-4 lg:py-3.5"
            >
              <span className={`font-heading text-[14px] lg:text-base ${selectedSource ? "text-[#222223]" : "text-[#999]"}`}>
                {selectedSource || "How did you hear about Ditto?"}
              </span>
              <ChevronDown className={`h-4 w-4 text-[#222223] transition-transform lg:h-5 lg:w-5 ${sourceDropdownOpen ? "rotate-180" : ""}`} />
            </button>
          )}
          <FloatingDropdown open={sourceDropdownOpen} anchorRef={sourceTriggerRef} onClose={() => setSourceDropdownOpen(false)}>
              {SOURCE_OPTIONS.map((option, i) => (
                <React.Fragment key={option}>
                  <button
                    type="button"
                    onClick={() => {
                      if (option === "Other") {
                        setSelectedSource("Other");
                        setCustomSource("");
                        setSourceDropdownOpen(false);
                        scrollToBottom();
                      } else {
                        setSelectedSource(option);
                        setValue("source", option);
                        setSourceDropdownOpen(false);
                        scrollToBottom();
                      }
                    }}
                    className={`flex w-full items-center rounded-[8px] px-3 py-2 font-heading text-[14px] transition-colors hover:bg-[#f2f3f5] lg:py-2.5 lg:text-base ${
                      selectedSource === option ? "text-[#0771e9]" : "text-[#222223]"
                    }`}
                  >
                    {option}
                  </button>
                  {i < SOURCE_OPTIONS.length - 1 && (
                    <div className="mx-2 border-t border-[#f0f0f0]" />
                  )}
                </React.Fragment>
              ))}
          </FloatingDropdown>
        </div>

        <div>
          <div className="overflow-hidden rounded-[10px] border-[1.5px] border-[#eeeeef] lg:rounded-[14px]">
            <textarea
              {...register("note")}
              aria-label="Additional notes"
              placeholder="Enter your query"
              className="h-[60px] w-full resize-none overflow-y-auto bg-white px-3 py-2.5 font-heading text-[14px] text-[#222223] placeholder:text-[#999] focus:outline-none lg:h-[80px] lg:px-4 lg:py-3.5 lg:text-base"
            />
          </div>
        </div>
        </div>
      </div>

      {/* Fixed bottom: submit button */}
      <div className="shrink-0 bg-white px-4 pb-4 pt-[28px] lg:px-6 lg:pb-6 lg:pt-3 lg:shadow-[0px_-6px_39px_0px_rgba(0,0,0,0.04)]">
        <button
          type="submit"
          disabled={isSubmitting || submitDisabled || !allFilled}
          className={`flex h-[45px] w-full items-center justify-between rounded-[12px] px-5 font-heading text-[16px] font-medium text-white shadow-[0px_2px_6px_0px_rgba(0,37,79,0.14)] transition-colors lg:h-[62px] lg:rounded-[18px] lg:px-6 lg:text-xl lg:shadow-[0px_6px_12px_0px_rgba(30,37,75,0.06)] ${allFilled && !submitDisabled ? "bg-ditto-blue-dark hover:bg-ditto-blue-active" : "cursor-default bg-[#c8e1ff]"}`}
        >
          <span>{submitLabel ?? "Book a Free Call"}</span>
          <Image src="/icons/phone-calendar.svg" alt="" width={19} height={19} className="lg:h-5 lg:w-[21px]" />
        </button>
      </div>
    </form>
  );
}

/* ─── FormField Helper ─── */

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
        className={`flex items-center overflow-hidden rounded-[10px] border-[1.5px] transition-colors lg:rounded-[14px] ${
          error ? "border-red-400" : "border-[#eeeeef]"
        }`}
      >
        <div className="flex flex-1 items-center px-3 py-2.5 lg:px-4 lg:py-3.5">
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

function FloatingDropdown({
  open,
  anchorRef,
  children,
  onClose,
}: {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    if (!open || !anchorRef.current) return;
    let rafId: number;
    const update = () => {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
      rafId = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(rafId);
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (anchorRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      onClose();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose, anchorRef]);

  if (!open || !pos) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      className="fixed z-50 max-h-[260px] overflow-y-auto overscroll-contain rounded-[14px] border border-[#eeeeef] bg-white p-1.5 shadow-[0px_4px_16px_rgba(0,0,0,0.08)]"
      style={{ top: pos.top, left: pos.left, width: pos.width }}
    >
      {children}
    </div>,
    document.body
  );
}

function NoSpamChip() {
  const isMobile = useIsMobile();
  const [phase, setPhase] = useState<"idle" | "expand" | "strike" | "hold">("idle");

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const cycle = () => {
      setPhase("expand");
      timeout = setTimeout(() => {
        setPhase("strike");
        timeout = setTimeout(() => {
          setPhase("hold");
          timeout = setTimeout(() => {
            setPhase("idle");
            timeout = setTimeout(cycle, 800);
          }, 1500);
        }, 400);
      }, 500);
    };
    timeout = setTimeout(cycle, 600);
    return () => clearTimeout(timeout);
  }, []);

  const showText = phase === "expand" || phase === "strike" || phase === "hold";
  const showStrike = phase === "strike" || phase === "hold";

  return (
    <motion.div
      animate={{
        width: showText ? (isMobile ? 75 : 94) : (isMobile ? 26 : 34),
        borderColor: showText ? "#f07c2a" : "#eeeeef",
        backgroundColor: showText ? "#fff8f2" : "#ffffff",
      }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex h-[26px] items-center justify-end gap-1 overflow-hidden rounded-[7px] border lg:h-[34px] lg:gap-[6px] lg:rounded-[10px]"
      style={{ originX: 1 }}
    >
      <AnimatePresence>
        {showText && (
          <motion.span
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.25 }}
            className="shrink-0 whitespace-nowrap pl-[2px] font-heading text-[11px] font-semibold text-[#f07c2a] lg:pl-[10px] lg:text-[13px]"
          >
            No spam
          </motion.span>
        )}
      </AnimatePresence>
      <div className="relative shrink-0 pr-[4px] lg:pr-[8px]">
        <svg width="14" height="16" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[14px] w-[12px] lg:h-[18px] lg:w-[16px]">
          <path d="M4 4.04V15.96C4 17.13 4.92 18.08 6.06 18.08H12.25C13.39 18.08 14.31 17.13 14.31 15.96V4.04C14.31 2.87 13.39 1.92 12.25 1.92H6.06C4.92 1.92 4 2.87 4 4.04Z" stroke="#f07c2a" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="square"/>
          <path d="M10.15 4.83H8.17C8.14 4.83 8.13 4.81 8.13 4.79C8.13 4.76 8.14 4.74 8.17 4.74H10.15C10.17 4.74 10.19 4.76 10.19 4.79C10.19 4.81 10.17 4.83 10.15 4.83Z" stroke="#f07c2a" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="square"/>
          <motion.line
            x1="3" y1="18.5" x2="15.5" y2="1.5"
            stroke="#f07c2a"
            strokeWidth="1.8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: showStrike ? 1 : 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        </svg>
      </div>
    </motion.div>
  );
}

function TimePart({ value }: { value: string }) {
  const parts = value.split(" ");
  if (parts.length < 2) {
    return <span className="font-heading text-[17px] font-medium text-[#1a1a1a] lg:text-[19px]">{value}</span>;
  }
  return (
    <span className="font-heading text-[17px] font-medium text-[#1a1a1a] lg:text-[19px]">
      {parts[0]} <sup className="text-[11px]">{parts[1]}</sup>
    </span>
  );
}
