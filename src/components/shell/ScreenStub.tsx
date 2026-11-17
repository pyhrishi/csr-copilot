import { Construction } from "lucide-react";
import type { ReactNode } from "react";

import { getScreen, type ScreenId } from "@/lib/nav";

interface ScreenStubProps {
  screen: ScreenId;
  /** The entity this instance shows, e.g. the section or patient from the URL. */
  subject?: ReactNode;
}

/** Placeholder for a screen that a later milestone builds. Says what it will show and when. */
export function ScreenStub({ screen: id, subject }: ScreenStubProps) {
  const screen = getScreen(id);
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-8 py-10">
      <header className="flex flex-col gap-2">
        <p className="label">
          {screen.id} · {screen.label}
        </p>
        <h1>{screen.title}</h1>
        {subject && <p className="text-lg text-ink">{subject}</p>}
      </header>

      <p className="max-w-[65ch]">{screen.summary}</p>

      <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm">
        <dt className="self-center label">Journey</dt>
        <dd>{screen.journey ?? "Study overview"}</dd>
        <dt className="self-center label">Requirements</dt>
        <dd>{screen.requirements.join(" · ") || "—"}</dd>
      </dl>

      <div
        role="status"
        className="flex items-start gap-3 rounded-lg border border-line bg-card p-4 text-sm"
      >
        <Construction aria-hidden className="mt-0.5 size-4 shrink-0 text-amber" />
        <p>
          <span className="font-semibold text-ink">Coming in {screen.milestone}.</span> This screen
          is a placeholder until that milestone in docs/build-plan.md is built.
        </p>
      </div>
    </div>
  );
}
