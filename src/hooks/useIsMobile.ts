"use client";

import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 1024; // matches Tailwind's `lg:`

function subscribe(callback: () => void) {
  const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.innerWidth < MOBILE_BREAKPOINT;
}

function getServerSnapshot() {
  return false; // assume desktop during SSR
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
