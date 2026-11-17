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
