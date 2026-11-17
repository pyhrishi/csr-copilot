import "@testing-library/jest-dom/vitest";

// Node 25+ ships an experimental global `localStorage` that shadows jsdom's and is non-functional
// without --localstorage-file. Vitest exposes the JSDOM instance as `globalThis.jsdom`; point the
// Web Storage globals back at its working implementation.
const dom = (globalThis as { jsdom?: { window: Window } }).jsdom;
if (dom) {
  for (const key of ["localStorage", "sessionStorage"] as const) {
    Object.defineProperty(globalThis, key, {
      value: dom.window[key],
      configurable: true,
      writable: true,
    });
  }
}
