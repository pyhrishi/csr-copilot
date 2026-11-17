import type { Fact, SlotFormat } from "@/lib/types";
import { SlotError } from "./errors";

type CountValue = { n: number; N: number; pct: number };

function isCount(value: Fact["value"]): value is CountValue {
  return (
    typeof value.n === "number" && typeof value.N === "number" && typeof value.pct === "number"
  );
}

/**
 * Renders a fact in a slot format. `display` is the TLF's canonical rendering; `n`, `pct` and
 * `n_pct` are only defined for count facts (kind "n_pct"). Anything else throws.
 */
export function formatFact(fact: Fact, format: SlotFormat): string {
  if (format === "display") return fact.display;
  if (fact.kind !== "n_pct" || !isCount(fact.value)) {
    throw new SlotError(`Format "${format}" needs a count fact; ${fact.id} is ${fact.kind}`);
  }
  const { n, pct } = fact.value;
  const percent = `${pct.toFixed(1)}%`;
  switch (format) {
    case "n":
      return String(n);
    case "pct":
      return percent;
    case "n_pct":
      return `${n} (${percent})`;
  }
}

/**
 * Describes how a fact changed between two TLF versions, e.g. "+1 patient (+0.3 percentage
 * points)". The percentage-point change is taken from the one-decimal percentages the TLF shows,
 * so it always agrees with the two displayed cells. Non-count facts only say whether they changed.
 */
export function formatFactChange(before: Fact, after: Fact): string {
  if (!isCount(before.value) || !isCount(after.value)) {
    return before.display === after.display ? "No change" : "Value changed";
  }
  const dn = after.value.n - before.value.n;
  const dTenths = Math.round(after.value.pct * 10) - Math.round(before.value.pct * 10);
  if (dn === 0 && dTenths === 0) return "No change";
  const sign = (x: number) => (x > 0 ? "+" : x < 0 ? "−" : "±");
  const patients = `${sign(dn)}${Math.abs(dn)} patient${Math.abs(dn) === 1 ? "" : "s"}`;
  const points = `${sign(dTenths)}${(Math.abs(dTenths) / 10).toFixed(1)} percentage points`;
  return `${patients} (${points})`;
}
