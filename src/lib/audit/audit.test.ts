import { describe, expect, it } from "vitest";

import * as audit from ".";
import {
  EMPTY_LOG,
  appendEvent,
  eventsForObject,
  listEvents,
  restoreLog,
  systemClock,
  type NewAuditEvent,
} from ".";

/** Deterministic clock: one second per tick from a fixed instant, ids evt-1, evt-2 … */
function testClock(start = Date.UTC(2026, 10, 2, 9, 0, 0)) {
  let tick = 0;
  return {
    now: () => new Date(start + tick * 1000),
    newId: () => `evt-${++tick}`,
  };
}

const event = (overrides: Partial<NewAuditEvent> = {}): NewAuditEvent => ({
  actor: "Demo writer",
  role: "writer",
  action: "generate",
  objectId: "12.2-s1",
  detail: "Simulated generation",
  versions: { model: "simulated", prompt: "section@v1", template: "sections@v1" },
  ...overrides,
});

describe("audit log", () => {
  it("appends events with an injected id and timestamp, returning a new log", () => {
    const clock = testClock();
    const one = appendEvent(EMPTY_LOG, event(), clock);
    const two = appendEvent(one, event({ action: "accept", role: "writer" }), clock);
    expect(EMPTY_LOG).toHaveLength(0);
    expect(one).toHaveLength(1);
    expect(two.map((e) => [e.id, e.action])).toEqual([
      ["evt-1", "generate"],
      ["evt-2", "accept"],
    ]);
    expect(two[0].at < two[1].at).toBe(true);
    expect(two[0].versions).toEqual(event().versions);
  });

  it("freezes the log, each event and its versions", () => {
    const log = appendEvent(EMPTY_LOG, event(), testClock());
    expect(Object.isFrozen(log)).toBe(true);
    expect(Object.isFrozen(log[0])).toBe(true);
    expect(Object.isFrozen(log[0].versions)).toBe(true);
    expect(() => {
      (log as unknown as unknown[]).push({});
    }).toThrow();
    expect(() => {
      (log[0] as { detail: string }).detail = "rewritten";
    }).toThrow();
  });

  it("has no update or delete API", () => {
    const exported = Object.keys(audit);
    for (const name of exported) expect(name).not.toMatch(/update|delete|remove|edit|clear|set/i);
  });

  it("refuses events without an actor or object, duplicate ids and out-of-order times", () => {
    const clock = testClock();
    expect(() => appendEvent(EMPTY_LOG, event({ actor: " " }), clock)).toThrow(/actor/);
    expect(() => appendEvent(EMPTY_LOG, event({ objectId: "" }), clock)).toThrow(/object/);
    const log = appendEvent(EMPTY_LOG, event(), { now: clock.now, newId: () => "same" });
    expect(() => appendEvent(log, event(), { now: clock.now, newId: () => "same" })).toThrow(
      /Duplicate/,
    );
    const earlier = { now: () => new Date(Date.UTC(2020, 0, 1)), newId: () => "earlier" };
    expect(() => appendEvent(log, event(), earlier)).toThrow(/time order/);
  });

  it("lists and filters events by action, role, actor and object", () => {
    const clock = testClock();
    let log = EMPTY_LOG;
    log = appendEvent(log, event(), clock);
    log = appendEvent(log, event({ action: "edit", objectId: "12.2-s3" }), clock);
    log = appendEvent(
      log,
      event({
        action: "sign_off",
        role: "biostat",
        actor: "Demo biostatistician",
        objectId: "12.2",
      }),
      clock,
    );
    log = appendEvent(log, event({ action: "accept", objectId: "12.2-s3" }), clock);

    expect(listEvents(log)).toHaveLength(4);
    expect(listEvents(log, { action: "sign_off" }).map((e) => e.objectId)).toEqual(["12.2"]);
    expect(listEvents(log, { role: "writer" })).toHaveLength(3);
    expect(listEvents(log, { actor: "Demo biostatistician" })).toHaveLength(1);
    expect(eventsForObject(log, "12.2-s3").map((e) => e.action)).toEqual(["edit", "accept"]);
    expect(eventsForObject(log, "nothing")).toEqual([]);
  });

  it("restores a persisted log as frozen events", () => {
    const log = appendEvent(EMPTY_LOG, event(), testClock());
    const restored = restoreLog(JSON.parse(JSON.stringify(log)));
    expect(restored).toEqual(log);
    expect(Object.isFrozen(restored[0])).toBe(true);
    expect(restoreLog([{ ...log[0], versions: undefined }])[0].versions).toBeUndefined();
  });

  it("uses the system clock by default", () => {
    expect(systemClock.newId()).not.toBe(systemClock.newId());
    expect(systemClock.now()).toBeInstanceOf(Date);
    const [e] = appendEvent(EMPTY_LOG, event());
    expect(Date.parse(e.at)).not.toBeNaN();
  });
});
