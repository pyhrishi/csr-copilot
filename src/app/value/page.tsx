import type { Metadata } from "next";

import { ScreenStub } from "@/components/shell/ScreenStub";
import { getScreen } from "@/lib/nav";

export const metadata: Metadata = { title: getScreen("S11").title };

export default function Page() {
  return <ScreenStub screen="S11" />;
}
