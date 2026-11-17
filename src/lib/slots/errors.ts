/** Thrown whenever a slot cannot be filled from source data. The slot filler never guesses. */
export class SlotError extends Error {
  override name = "SlotError";
}
