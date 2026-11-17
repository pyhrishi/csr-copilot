import type { Metadata } from "next";

import { ScreenStub } from "@/components/shell/ScreenStub";
import { getScreen } from "@/lib/nav";

export const metadata: Metadata = { title: getScreen("S8").title };

export default function Page() {
  return <ScreenStub screen="S8" />;
}
