import { getStudy } from "@/lib/data/seed";
import { DemoButton } from "./DemoButton";
import { ModeToggle } from "./ModeToggle";
import { RoleSwitcher } from "./RoleSwitcher";

export function TopBar() {
  const study = getStudy();

  return (
    <header className="flex h-(--topbar-h) items-center gap-6 border-b border-line bg-card px-6">
      <div className="flex min-w-0 items-baseline gap-3">
        <span className="font-heading text-[22px] font-semibold text-ink">CSR Copilot</span>
        <span aria-hidden className="h-5 w-px self-center bg-line" />
        <span className="truncate text-sm">
          <span className="mr-2 label">Study</span>
          <span className="font-semibold text-ink">{study.id}</span>
          <span className="text-subtle"> · {study.shortName}</span>
        </span>
      </div>
      <div className="ml-auto flex items-center gap-5">
        <RoleSwitcher />
        <ModeToggle />
        <DemoButton />
      </div>
    </header>
  );
}
