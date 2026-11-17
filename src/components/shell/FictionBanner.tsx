/** Persistent fiction banner. Rendered once, in the root layout, so it appears on every page. */
export function FictionBanner() {
  return (
    <div
      role="note"
      aria-label="Prototype notice"
      className="flex h-[var(--banner-h,28px)] items-center justify-center bg-ink px-4 text-xs font-semibold tracking-[0.04em] text-teal-light select-none"
    >
      Prototype · fictional study data · not for clinical use
    </div>
  );
}
