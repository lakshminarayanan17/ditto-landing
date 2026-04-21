"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CASE_STUDIES = [
  {
    title: "Doctor's Call",
    bg: "#273848",
    titleColor: "#cde1f5",
    bodyColor: "#a6bacf",
    problem: "Claim was stuck due to unclear diagnosis notes, leaving the user unsure what exactly went wrong.",
    solution: "Ditto arranged a quick doctor call to validate details and align records.",
    image: "/images/case-doctor-cropped.png",
    fontSize: 20.35,
    tracking: "0.2px",
    lineHeight: "1.2",
    problemTop: 226.66,
    solutionTop: 345.08,
    imagePos: { top: 60, left: 18, width: 180, height: 155 },
    imageObjectPosition: "center center",
  },
  {
    title: "Frivolous grounds",
    bg: "#a3c6ed",
    titleColor: "#0c3660",
    bodyColor: "#0b3967",
    problem: "After a short hospital stay, the user received a rejection with a vague policy reason they couldn't understand.",
    solution: "Ditto reviewed the case, identified it as an invalid rejection, and escalated it.",
    image: "/images/case-frivolous-phone.png",
    fontSize: 22.2,
    tracking: "0.44px",
    lineHeight: "1.22",
    problemTop: 64.76,
    solutionTop: 217.41,
    imagePos: { top: 300, left: 178, width: 147, height: 138 },
    imageObjectPosition: "center center",
  },
  {
    title: "Discharge Intricacies",
    bg: "#7861c2",
    titleColor: "#ffffff",
    bodyColor: "#ece6ff",
    problem: "Post discharge, the customer submitted hospital papers, but key details were missing in the final discharge summary.",
    solution: "Ditto coordinated with the hospital to correct and reissue the documents.",
    image: "/images/case-discharge.png",
    fontSize: 22.2,
    tracking: "0.44px",
    lineHeight: "1.22",
    problemTop: 64.76,
    solutionTop: 217.41,
    imagePos: { top: 280, left: 150, width: 175, height: 175 },
    imageObjectPosition: "center top",
  },
  {
    title: "Reimbursement",
    bg: "#bcc2c8",
    titleColor: "#103153",
    bodyColor: "#193959",
    problem: "After a short hospital stay, the user received a rejection with a vague policy reason they couldn't understand.",
    solution: "Ditto reviewed the case, identified it as an invalid rejection, and escalated it with backing.",
    image: "/images/case-reimbursement.png",
    fontSize: 22.2,
    tracking: "0.44px",
    lineHeight: "1.22",
    problemTop: 64.76,
    solutionTop: 217.41,
    imagePos: { top: 290, left: 180, width: 145, height: 149 },
    imageObjectPosition: "center center",
  },
];

const STACK_PROPS = [
  { rotate: 0, scale: 1, y: 0 },
  { rotate: -4.7, scale: 0.98, y: 3 },
  { rotate: 3.6, scale: 0.96, y: 6 },
  { rotate: 5.5, scale: 0.94, y: 9 },
];

const N = CASE_STUDIES.length;

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function CaseCard({ study }: { study: typeof CASE_STUDIES[number] }) {
  return (
    <div className="relative h-full w-full">
      <h3
        className="absolute left-[18.5px] top-[18px] font-heading font-bold leading-[0.95]"
        style={{ color: study.titleColor, fontSize: 29.6 }}
      >
        {study.title}
      </h3>

      <p
        className="absolute left-[18.5px] font-heading font-medium"
        style={{
          color: study.bodyColor,
          top: study.problemTop,
          fontSize: study.fontSize,
          letterSpacing: study.tracking,
          lineHeight: study.lineHeight,
          width: 287.7,
        }}
      >
        {study.problem}
      </p>

      <p
        className="absolute left-[18.5px] font-heading font-medium"
        style={{
          color: study.bodyColor,
          top: study.solutionTop,
          fontSize: study.fontSize,
          letterSpacing: study.tracking,
          lineHeight: study.lineHeight,
          width: 287.7,
        }}
      >
        {study.solution}
      </p>

      {study.image && (
        <div
          className="absolute overflow-hidden"
          style={{
            top: study.imagePos.top,
            left: study.imagePos.left,
            width: study.imagePos.width,
            height: study.imagePos.height,
          }}
        >
          <Image
            src={study.image}
            alt={study.title}
            width={study.imagePos.width}
            height={study.imagePos.height}
            className="h-full w-full object-cover"
            style={{ objectPosition: study.imageObjectPosition }}
          />
        </div>
      )}
    </div>
  );
}

export function CaseStudiesView({ onBack }: { onBack: () => void }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % N);
  }, []);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + N) % N);
  }, []);

  return (
    <div className="flex h-full flex-col items-center px-5 pb-4 pt-[27px] lg:px-6 lg:pb-8 lg:pt-[41px]">
      <div className="relative mx-auto h-[370px] w-[274px] lg:h-[438.53px] lg:w-[324.73px]">
      <div className="absolute inset-0 origin-top-left scale-[0.844] lg:scale-100" style={{ width: 324.73, height: 438.53 }}>
        {CASE_STUDIES.map((study, cardIndex) => {
          const stackPos = mod(cardIndex - activeIndex, N);
          const props = STACK_PROPS[stackPos];

          return (
            <motion.div
              key={cardIndex}
              animate={{
                rotate: props.rotate,
                scale: props.scale,
                y: props.y,
                zIndex: N - stackPos,
              }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const }}
              className="absolute inset-0 overflow-hidden"
              style={{ backgroundColor: study.bg, borderRadius: 16.65 }}
            >
              <CaseCard study={study} />
            </motion.div>
          );
        })}
      </div>
      </div>

      <div className="mt-auto flex w-full items-center gap-2 pt-3 lg:mt-[50px] lg:gap-3 lg:pt-0">
        <button
          onClick={goPrev}
          className="flex h-[36px] w-[46px] shrink-0 items-center justify-center rounded-[10px] bg-ditto-grey-100 lg:h-[40px] lg:w-[54px] lg:rounded-[14px]"
        >
          <ChevronLeft className="h-4 w-4 text-[#4e7293] lg:h-5 lg:w-5" />
        </button>

        <button
          onClick={onBack}
          className="flex h-[36px] flex-1 items-center justify-center rounded-[10px] bg-ditto-grey-100 lg:h-[40px] lg:rounded-[14px]"
        >
          <span className="font-heading text-[15px] font-medium text-[#4e7293] lg:text-[20px]">
            Back to confirmation
          </span>
        </button>

        <button
          onClick={goNext}
          className="flex h-[36px] w-[46px] shrink-0 items-center justify-center rounded-[10px] bg-ditto-grey-100 lg:h-[40px] lg:w-[54px] lg:rounded-[14px]"
        >
          <ChevronRight className="h-4 w-4 text-[#4e7293] lg:h-5 lg:w-5" />
        </button>
      </div>
    </div>
  );
}
