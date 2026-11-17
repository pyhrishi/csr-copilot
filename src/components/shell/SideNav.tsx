"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SCREENS } from "@/lib/nav";
import { NAV_ICONS } from "./nav-icons";

const SIDEBAR_STORAGE_KEY = "csr_copilot_sidebar_collapsed";

let sidebarCollapsedState = false;
try {
  if (typeof window !== "undefined") {
    sidebarCollapsedState = localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  }
} catch {
  // ignore
}

const listeners = new Set<() => void>();

function subscribeSidebar(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSidebarSnapshot() {
  return sidebarCollapsedState;
}

function getSidebarServerSnapshot() {
  return false;
}

function setSidebarCollapsed(value: boolean) {
  sidebarCollapsedState = value;
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(value));
  } catch {
    // ignore
  }
  listeners.forEach((l) => l());
}

export function SideNav() {
  const pathname = usePathname();
  const isCollapsed = useSyncExternalStore(
    subscribeSidebar,
    getSidebarSnapshot,
    getSidebarServerSnapshot,
  );

  const toggleCollapsed = () => {
    setSidebarCollapsed(!isCollapsed);
  };

  // Keyboard shortcut: [ toggles sidebar collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "[" &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName) &&
        !(e.target as HTMLElement)?.isContentEditable
      ) {
        e.preventDefault();
        setSidebarCollapsed(!sidebarCollapsedState);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <nav
      aria-label="Screens"
      className={
        "surface-ink sticky top-[calc(var(--banner-h,28px)+var(--topbar-h,64px))] h-[calc(100dvh-var(--banner-h,28px)-var(--topbar-h,64px))] shrink-0 overflow-y-auto overflow-x-hidden bg-ink py-4 transition-[width] duration-300 ease-in-out flex flex-col justify-between select-none " +
        (isCollapsed ? "w-[68px] px-2" : "w-60 px-3")
      }
    >
      <div className="flex flex-col gap-1">
        {/* Navigation Section Title (Visible when expanded) */}
        <div
          className={
            "flex items-center justify-between px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-line/60 transition-opacity duration-200 " +
            (isCollapsed ? "opacity-0 h-0 overflow-hidden py-0" : "opacity-100")
          }
        >
          <span>Screens</span>
          <span className="text-[10px] text-line/40 font-mono">11</span>
        </div>

        {/* Navigation List */}
        <ul className="flex flex-col gap-1">
          {SCREENS.map((screen) => {
            const Icon = NAV_ICONS[screen.icon];
            const active = screen.match.test(pathname);

            const linkContent = (
              <Link
                href={screen.href}
                aria-current={active ? "page" : undefined}
                className={
                  "relative flex items-center rounded-lg text-sm transition-all duration-200 " +
                  (isCollapsed
                    ? "justify-center p-2.5 "
                    : "gap-3 px-3 py-2.5 ") +
                  (active
                    ? "bg-white/10 font-semibold text-white shadow-xs before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r before:bg-teal-light"
                    : "text-line/80 hover:bg-white/5 hover:text-white hover:translate-x-0.5")
                }
              >
                <Icon
                  aria-hidden
                  className={
                    "size-4 shrink-0 transition-transform duration-200 " +
                    (active ? "text-teal-light scale-110" : "text-line/70 group-hover:text-white")
                  }
                />
                {!isCollapsed && (
                  <span className="flex-1 truncate transition-opacity duration-200">
                    {screen.label}
                  </span>
                )}
                {!isCollapsed && (
                  <span
                    className={
                      "text-[11px] tabular transition-colors duration-200 " +
                      (active ? "text-teal-light font-bold" : "text-line/60")
                    }
                  >
                    {screen.id}
                  </span>
                )}
              </Link>
            );

            return (
              <li key={screen.id} className="relative group">
                {isCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger render={linkContent} />
                    <TooltipContent side="right" sideOffset={12} className="bg-ink text-white border border-line/30 shadow-md">
                      <div className="font-semibold text-xs">{screen.label}</div>
                      <div className="text-[10px] text-teal-light font-mono mt-0.5">
                        Screen {screen.id}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  linkContent
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Collapse / Expand Toggle Button at Bottom */}
      <div className="pt-3 border-t border-white/10 mt-2">
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={toggleCollapsed}
                  aria-label="Expand sidebar"
                  className="w-full flex items-center justify-center p-2 rounded-lg text-line/70 hover:bg-white/5 hover:text-white transition-all duration-200"
                />
              }
            >
              <PanelLeftOpen className="size-4 transition-transform duration-300" aria-hidden="true" />
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={12} className="bg-ink text-white border border-line/30">
              <span className="font-semibold text-xs">Expand sidebar</span>
              <kbd className="ml-1.5 px-1 py-0.2 rounded bg-white/10 text-[10px] font-mono">[</kbd>
            </TooltipContent>
          </Tooltip>
        ) : (
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label="Collapse sidebar"
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-line/70 hover:bg-white/5 hover:text-white transition-all duration-200 group"
          >
            <div className="flex items-center gap-2">
              <PanelLeftClose className="size-4 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
              <span>Collapse</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-line/60">
              [
            </kbd>
          </button>
        )}
      </div>
    </nav>
  );
}
