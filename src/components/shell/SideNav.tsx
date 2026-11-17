"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SCREENS } from "@/lib/nav";
import { NAV_ICONS } from "./nav-icons";

export function SideNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Screens"
      className="surface-ink sticky top-[calc(var(--banner-h)+var(--topbar-h))] h-[calc(100dvh-var(--banner-h)-var(--topbar-h))] w-(--nav-w) shrink-0 overflow-y-auto bg-ink px-3 py-4"
    >
      <ul className="flex flex-col gap-0.5">
        {SCREENS.map((screen) => {
          const Icon = NAV_ICONS[screen.icon];
          const active = screen.match.test(pathname);
          return (
            <li key={screen.id}>
              <Link
                href={screen.href}
                aria-current={active ? "page" : undefined}
                className={
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors " +
                  (active
                    ? "bg-white/10 font-semibold text-white shadow-[inset_3px_0_0_var(--teal-light)]"
                    : "text-line hover:bg-white/5 hover:text-white")
                }
              >
                <Icon aria-hidden className={"size-4 " + (active ? "text-teal-light" : "")} />
                <span className="flex-1">{screen.label}</span>
                <span className="text-[11px] text-line/80 tabular">{screen.id}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
