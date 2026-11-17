import {
  DatabaseZap,
  FileText,
  Gauge,
  GitCompareArrows,
  History,
  House,
  ListChecks,
  SlidersHorizontal,
  TrendingUp,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { NavIcon } from "@/lib/nav";

export const NAV_ICONS: Record<NavIcon, LucideIcon> = {
  home: House,
  setup: DatabaseZap,
  workspace: FileText,
  reconciliation: ListChecks,
  narratives: Users,
  patient: UserRound,
  changes: GitCompareArrows,
  audit: History,
  quality: Gauge,
  autonomy: SlidersHorizontal,
  value: TrendingUp,
};
