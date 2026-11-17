import { FileQuestion } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-8 py-10">
      <p className="label">Not found</p>
      <h1>This page doesn&apos;t exist</h1>
      <p className="flex items-center gap-2">
        <FileQuestion aria-hidden className="size-4 text-subtle" />
        The address doesn&apos;t match a screen, section or patient in study CRD-301.
      </p>
      <p>
        <Link href="/" className="font-semibold text-teal underline underline-offset-4">
          Go to Study home
        </Link>
      </p>
    </div>
  );
}
