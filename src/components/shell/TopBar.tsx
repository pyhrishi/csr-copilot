import { getStudy } from "@/lib/data/seed";
import { DemoButton } from "./DemoButton";
import { ModeToggle } from "./ModeToggle";
import { RoleSwitcher } from "./RoleSwitcher";
import { TeamSyncButton } from "./TeamSyncButton";

export function TopBar() {
  const study = getStudy();

  return (
    <header className="flex h-[var(--topbar-h,64px)] items-center gap-6 border-b border-line bg-card px-6 shadow-2xs">
      <div className="flex min-w-0 items-baseline gap-3">
        <span className="font-heading text-[22px] font-semibold text-ink tracking-tight">CSR Copilot</span>
        <span aria-hidden className="h-5 w-px self-center bg-line" />
        <span className="truncate text-sm">
          <span className="mr-2 label">Study</span>
          <span className="font-semibold text-ink">{study.id}</span>
          <span className="text-subtle"> · {study.shortName}</span>
        </span>
      </div>
      <div className="ml-auto flex items-center gap-3 sm:gap-4">
        <RoleSwitcher />
        <ModeToggle />
        <TeamSyncButton />
        <DemoButton />
      </div>
    </header>
  );
}
