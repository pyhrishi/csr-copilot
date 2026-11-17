import type { Fact, Finding } from "@/lib/types";

/**
 * Extracts a slot-enabled template string from a contentEditable container.
 * Elements with data-slot or data-fact-id are serialized back to slot syntax {F:...}.
 */
export function extractTemplateFromDom(container: HTMLElement): string {
  let result = "";

  function walk(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent || "";
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.dataset.slot) {
        result += el.dataset.slot;
      } else if (el.dataset.factId) {
        result += `{F:${el.dataset.factId}}`;
      } else if (el.tagName === "BR") {
        result += "\n";
      } else {
        for (const child of Array.from(el.childNodes)) {
          walk(child);
        }
      }
    }
  }

  for (const child of Array.from(container.childNodes)) {
    walk(child);
  }

  return result;
}

/**
 * Creates an atomic non-editable number chip element for insertion into contentEditable.
 */
export function createChipElement(factId: string, display: string, rawSlot?: string): HTMLSpanElement {
  const span = document.createElement("span");
  span.setAttribute("contenteditable", "false");
  span.contentEditable = "false";
  span.className =
    "inline-flex items-center px-1.5 py-0.2 rounded text-xs font-mono tabular font-medium text-teal bg-teal-tint border border-teal/40 mx-0.5 align-baseline select-none cursor-default";
  span.dataset.slot = rawSlot || `{F:${factId}}`;
  span.dataset.factId = factId;
  span.textContent = display;
  return span;
}

/**
 * Inserts a fact chip into the current selection inside container, or appends it to container.
 */
export function insertChipAtSelection(container: HTMLElement, fact: Fact): boolean {
  const chip = createChipElement(fact.id, fact.display);

  if (typeof window === "undefined") {
    container.appendChild(chip);
    return true;
  }

  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0 && container.contains(sel.anchorNode)) {
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(chip);
    range.setStartAfter(chip);
    range.setEndAfter(chip);
    sel.removeAllRanges();
    sel.addRange(range);
    return true;
  }

  container.appendChild(chip);
  return true;
}

/**
 * Applies a fix (like STAT-001 descriptive replacement) to a sentence template.
 */
export function applySuggestionToTemplate(template: string, finding: Finding): string {
  if (finding.fix && Array.isArray(finding.fix.span)) {
    const [start, end] = finding.fix.span;
    return template.slice(0, start) + finding.fix.replacement + template.slice(end);
  }

  if (finding.ruleId === "STAT-001") {
    // Fallback: replace "significantly more common" or "significantly"
    return template
      .replace(/\bsignificantly more common\b/gi, "more frequent")
      .replace(/\bsignificantly more frequent\b/gi, "more frequent")
      .replace(/\bsignificantly (higher|lower|greater|fewer)\b/gi, "numerically $1")
      .replace(/\bsignificantly\s+/gi, "");
  }

  return template;
}
