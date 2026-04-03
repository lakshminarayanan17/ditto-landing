"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Phone, X } from "lucide-react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => {
    setMobileOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Escape key closes menu
  useEffect(() => {
    if (!mobileOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [mobileOpen, closeMenu]);

  // Focus trap: move focus into drawer, trap Tab within it
  useEffect(() => {
    if (!mobileOpen || !menuRef.current) return;

    const panel = menuRef.current;
    const focusable = () =>
      panel.querySelectorAll<HTMLElement>(
        'button, a, input, textarea, [tabindex]:not([tabindex="-1"])'
      );

    // Focus first element
    focusable()[0]?.focus();

    const trapFocus = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const nodes = focusable();
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", trapFocus);
    return () => document.removeEventListener("keydown", trapFocus);
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-ditto-grey-50 bg-white">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6 lg:px-[160px]">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/icons/ditto-logo.svg"
            alt="ditto"
            width={63}
            height={22}
            className="md:h-[29px] md:w-[84px]"
            priority
          />
        </Link>

        {/* Mobile hamburger */}
        <button
          ref={triggerRef}
          className="flex items-center justify-center md:hidden"
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
        >
          <Image src="/icons/menu.svg" alt="" width={24} height={24} />
        </button>

        {/* Nav + CTA grouped right (desktop only) */}
        <div className="hidden items-center gap-2 md:flex">
          <nav className="flex items-center gap-2">
            <NavDropdown label="Health Insurance" />
            <NavDropdown label="Term Insurance" />
            <NavLink label="Claims" hasIndicator />
            <NavLink label="Careers" />
          </nav>

          <Link
            href="#schedule"
            className="ml-4 flex items-center gap-2 rounded-[14px] bg-ditto-blue px-5 py-2.5 font-heading text-base font-medium text-white shadow-sm transition-colors hover:bg-ditto-blue-dark"
          >
            <Phone className="h-[18px] w-[18px]" />
            Schedule a Call
          </Link>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={closeMenu}
          />

          {/* Panel */}
          <div ref={menuRef} className="absolute right-0 top-0 flex h-full w-[280px] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-ditto-grey-50 px-5 py-5">
              <Image
                src="/icons/ditto-logo.svg"
                alt="ditto"
                width={63}
                height={22}
              />
              <button
                onClick={closeMenu}
                aria-label="Close menu"
              >
                <X className="h-6 w-6 text-ditto-black" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
              <MobileNavLink label="Health Insurance" />
              <MobileNavLink label="Term Insurance" />
              <MobileNavLink label="Claims" />
              <MobileNavLink label="Careers" />
            </nav>

            <div className="border-t border-ditto-grey-50 px-5 py-5">
              <Link
                href="#schedule"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-ditto-blue px-5 py-3 font-heading text-base font-medium text-white shadow-sm"
                onClick={closeMenu}
              >
                <Phone className="h-[18px] w-[18px]" />
                Schedule a Call
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function NavDropdown({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-1 rounded-lg px-4 py-2 font-heading text-base font-medium text-ditto-black transition-colors hover:bg-ditto-grey-100">
      {label}
      <ChevronDown className="h-4 w-4 text-ditto-black" />
    </button>
  );
}

function NavLink({
  label,
  hasIndicator,
}: {
  label: string;
  hasIndicator?: boolean;
}) {
  return (
    <Link
      href="#"
      className="flex items-center gap-1.5 rounded-lg px-4 py-2 font-heading text-base font-medium text-ditto-grey-900 transition-colors hover:bg-ditto-grey-100"
    >
      {hasIndicator && (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ditto-blue" />
      )}
      {label}
    </Link>
  );
}

function MobileNavLink({ label }: { label: string }) {
  return (
    <Link
      href="#"
      className="rounded-lg px-4 py-3 font-heading text-base font-medium text-ditto-black transition-colors hover:bg-ditto-grey-100"
    >
      {label}
    </Link>
  );
}
