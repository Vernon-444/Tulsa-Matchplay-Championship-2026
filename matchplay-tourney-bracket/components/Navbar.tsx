"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback, useEffect, useRef } from "react";

function GlitterOverlay({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <span className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-lg" aria-hidden>
      {Array.from({ length: 12 }).map((_, i) => (
        <span key={i} className="glitter-particle" />
      ))}
    </span>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span className="flex h-6 w-6 flex-col items-center justify-center gap-1.5">
      <span
        className={`block h-0.5 w-5 rounded-full bg-[#162B49] transition-transform ${open ? "translate-y-2 rotate-45" : ""}`}
      />
      <span
        className={`block h-0.5 w-5 rounded-full bg-[#162B49] transition-transform ${open ? "opacity-0" : ""}`}
      />
      <span
        className={`block h-0.5 w-5 rounded-full bg-[#162B49] transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`}
      />
    </span>
  );
}

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  } else {
    window.location.href = `/#${id}`;
  }
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeDropdown = useCallback(() => setDropdownOpen(false), []);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const handleScrollTo = useCallback((id: string) => {
    closeMenu();
    closeDropdown();
    scrollToSection(id);
  }, [closeMenu, closeDropdown]);

  const loginLinkClass =
    "block rounded-lg bg-[#c6202e] px-4 py-2.5 text-center text-sm font-medium text-[#F8F1E0] transition-colors hover:bg-[#EBAD21] hover:text-[#162B49] focus:outline-none focus:ring-2 focus:ring-[#EBAD21] focus:ring-offset-2 focus:ring-offset-[var(--page-bg)]";

  const navLinkBase = "w-full rounded-lg px-3 py-2 text-center text-sm text-[#162B49] hover:bg-[#162B49]/10 md:w-auto md:px-4";
  const scorekeeperClass = "relative overflow-visible scorekeeper-highlight " + navLinkBase;
  const showGlitter = dropdownOpen || menuOpen;

  const navLinks = (
    <>
      <button
        type="button"
        onClick={() => handleScrollTo("hero")}
        className={navLinkBase}
      >
        About
      </button>
      <Link
        href="/scorekeeper"
        onClick={() => { closeMenu(); closeDropdown(); }}
        className={scorekeeperClass}
      >
        <span className="relative z-10">Matchplay Score Keeper {"{new}"}</span>
        <GlitterOverlay active={showGlitter} />
      </Link>
      <button
        type="button"
        onClick={() => handleScrollTo("brackets")}
        className={navLinkBase}
      >
        Brackets
      </button>
      <button
        type="button"
        onClick={() => handleScrollTo("highlight-matches")}
        className={navLinkBase}
      >
        Highlight Matches
      </button>
      <button
        type="button"
        onClick={() => handleScrollTo("results")}
        className={navLinkBase}
      >
        Results
      </button>
      <Link
        href="/login"
        onClick={() => { closeMenu(); closeDropdown(); }}
        className={`mt-2 w-full md:mx-0 md:w-auto ${loginLinkClass}`}
      >
        Admin login
      </Link>
    </>
  );

  return (
    <header className="relative sticky top-0 z-50 bg-[#162B49] px-4 pt-4">
      {/* Single wrapper needed: sticky applies to one element that contains both desktop nav and mobile hamburger + dropdown. Nav bar (cream, rounded) stays unchanged. */}
      <nav className="mx-auto hidden max-w-7xl items-center justify-between gap-3 rounded-xl border border-[#162B49]/30 bg-[var(--page-bg)] px-4 py-3 shadow-xl md:flex">
        <Link
          href="/"
          className="flex min-w-0 flex-1 items-center gap-3 transition-opacity hover:opacity-90 md:flex-initial"
          aria-label="Home"
          onClick={closeMenu}
        >
          <Image
            src="/favicon.ico"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 rounded-full object-cover"
          />
          <h1 className="truncate text-xl font-semibold text-[#162B49]">
            Tulsa Matchplay Disc Golf Championship 2026
          </h1>
        </Link>

        <div ref={dropdownRef}>
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#162B49]/10 text-[#162B49] transition-colors hover:bg-[#162B49]/20 focus:outline-none focus:ring-2 focus:ring-[#162B49] focus:ring-offset-2 focus:ring-offset-[var(--page-bg)]"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
              aria-label="Site menu"
            >
              <HamburgerIcon open={dropdownOpen} />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 top-full z-10 mt-1 flex min-w-[200px] flex-col rounded-lg border border-[#162B49]/30 bg-[var(--page-bg)] px-3 pt-1 pb-3 shadow-xl">
                {navLinks}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile: floating/sticky hamburger only */}
      <div className="flex justify-end md:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#162B49]/30 bg-[var(--page-bg)] text-[#162B49] shadow-lg transition-colors hover:bg-[#162B49]/10 focus:outline-none focus:ring-2 focus:ring-[#162B49] focus:ring-offset-2 focus:ring-offset-[var(--page-bg)]"
          aria-expanded={menuOpen}
          aria-label="Toggle menu"
        >
          <HamburgerIcon open={menuOpen} />
        </button>
      </div>

      {/* Mobile menu dropdown (floating panel with title, image, links) */}
      <div
        className={`absolute right-4 left-4 top-full z-10 mt-2 overflow-hidden rounded-xl border border-[#162B49]/30 bg-[var(--page-bg)] shadow-xl transition-[max-height] duration-200 md:hidden ${menuOpen ? "max-h-[85vh]" : "max-h-0 opacity-0"}`}
        aria-hidden={!menuOpen}
      >
        <div className="flex flex-col gap-3 px-4 py-4 text-center">
          <Link
            href="/"
            onClick={closeMenu}
            className="flex flex-col items-center gap-2 transition-opacity hover:opacity-90"
            aria-label="Home"
          >
            <Image
              src="/favicon.ico"
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-full object-cover"
            />
            <h2 className="max-w-full break-words px-2 text-center text-base font-semibold leading-snug text-[#162B49]">
              Tulsa Matchplay Disc Golf Championship 2026
            </h2>
          </Link>
          <p className="text-xs text-[#162B49]/80">
            64-player double elimination bracket
          </p>
          <div className="flex flex-col gap-1 border-t border-[#162B49]/20 pt-3">
            {navLinks}
          </div>
        </div>
      </div>
    </header>
  );
}
