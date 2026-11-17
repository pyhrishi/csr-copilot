// Append-only audit log. There is deliberately no update or delete: events are frozen when
// appended and every append returns a new frozen log. Time and ids are injected so the log is
// deterministic in tests.
import type { AuditEvent } from "@/lib/types";

export type AuditLog = readonly AuditEvent[];
export type NewAuditEvent = Omit<AuditEvent, "id" | "at">;

export interface AuditClock {
  now: () => Date;
  newId: () => string;
}

export const systemClock: AuditClock = {
  now: () => new Date(),
  newId: () => crypto.randomUUID(),
};

export const EMPTY_LOG: AuditLog = Object.freeze([]);

function freezeEvent(event: AuditEvent): AuditEvent {
  return Object.freeze({
    ...event,
    ...(event.versions ? { versions: Object.freeze({ ...event.versions }) } : {}),
  });
}

/** Freezes events restored from storage so they are as immutable as appended ones. */
export function restoreLog(events: readonly AuditEvent[]): AuditLog {
  return Object.freeze(events.map(freezeEvent));
}

/**
 * Appends one event and returns the new log. Refuses an event without an actor or object,
 * a duplicate id, or a timestamp earlier than the last event (the log only moves forward).
 */
export function appendEvent(
  log: AuditLog,
  input: NewAuditEvent,
  clock: AuditClock = systemClock,
): AuditLog {
  if (!input.actor.trim()) throw new Error("An audit event needs a named actor");
  if (!input.objectId.trim()) throw new Error("An audit event needs an object id");
  const event = freezeEvent({ ...input, id: clock.newId(), at: clock.now().toISOString() });
  if (log.some((e) => e.id === event.id)) throw new Error(`Duplicate audit event id ${event.id}`);
  const last = log.at(-1);
  if (last && event.at < last.at) throw new Error("Audit events must be appended in time order");
  return Object.freeze([...log, event]);
}

export interface AuditFilter {
  action?: AuditEvent["action"];
  role?: AuditEvent["role"];
  actor?: string;
  objectId?: string;
}

/** Events in the order they were appended, optionally filtered. */
export function listEvents(log: AuditLog, filter: AuditFilter = {}): AuditEvent[] {
  return log.filter(
    (e) =>
      (filter.action === undefined || e.action === filter.action) &&
      (filter.role === undefined || e.role === filter.role) &&
      (filter.actor === undefined || e.actor === filter.actor) &&
      (filter.objectId === undefined || e.objectId === filter.objectId),
  );
}

/** Everything that happened to one object (a sentence, section, patient, TLF …). */
export function eventsForObject(log: AuditLog, objectId: string): AuditEvent[] {
  return listEvents(log, { objectId });
}
