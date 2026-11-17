import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { getNarrativeTemplate, getPatient, getPatients } from "@/lib/data/seed";
import { useAuditStore, useNarrativesStore, useRoleStore } from "@/store";
import { NarrativeDetailView } from "./NarrativeDetailView";
import { NarrativesQueueView } from "./NarrativesQueueView";
import { PatientSummaryCard } from "./PatientSummaryCard";
import { PatientTimelineSvg } from "./PatientTimelineSvg";
import { SafetyReviewBlock } from "./SafetyReviewBlock";

afterEach(() => {
  cleanup();
});

describe("Narrative Components", () => {
  const patient1042 = getPatient("CRD301-1042")!;
  const exceptionPatient = getPatient("CRD301-1402")!;
  const allPatients = getPatients();
  const template = getNarrativeTemplate();

  beforeEach(() => {
    localStorage.clear();
    useRoleStore.setState({ role: "writer" });
    useAuditStore.setState({ events: [] });
    useNarrativesStore.setState({
      drafts: {},
      statuses: {},
      reviews: {},
      isGeneratingBatch: false,
      batchProgress: { current: 0, total: 0 },
    });
  });

  describe("PatientTimelineSvg", () => {
    it("renders horizontal study day axis with timeline events and marks AE onset", () => {
      const onSelect = vi.fn();
      render(
        <PatientTimelineSvg
          timeline={patient1042.timeline}
          onsetDay={patient1042.onsetDay}
          resolvedDay={patient1042.resolvedDay}
          event={patient1042.event}
          activeTimelineIndex={null}
          onSelectEntry={onSelect}
        />,
      );

      expect(screen.getByText(/Clinical Study-Day Timeline/)).toBeInTheDocument();
      expect(screen.getByText(/AE Onset \(Day 18\)/)).toBeInTheDocument();
      expect(screen.getByText(/Resolution \(Day 22\)/)).toBeInTheDocument();
      expect(screen.getByText("Day 1")).toBeInTheDocument();
      expect(screen.getByText("Day 18")).toBeInTheDocument();

      // Click on Day 18 node
      const onsetNode = screen.getByRole("button", {
        name: /Study Day 18: Dizziness and systolic BP 82 mmHg/i,
      });
      fireEvent.click(onsetNode);
      expect(onSelect).toHaveBeenCalledWith(1);
    });
  });

  describe("PatientSummaryCard", () => {
    it("renders patient demographics, arm label, event, severity and causality", () => {
      render(<PatientSummaryCard patient={patient1042} activeField="age" />);

      expect(screen.getByText("CRD301-1042")).toBeInTheDocument();
      expect(screen.getAllByText("Velorantib 20 mg")[0]).toBeInTheDocument();
      expect(screen.getByText(/71 yrs · Male/)).toBeInTheDocument();
      expect(screen.getByText("Hypotension")).toBeInTheDocument();
      expect(screen.getByText("Severe")).toBeInTheDocument();
      expect(screen.getByText(/Related to study drug/)).toBeInTheDocument();
    });
  });

  describe("SafetyReviewBlock", () => {
    it("allows Medical Writer to approve narrative and records audit sign_off", () => {
      render(<SafetyReviewBlock patient={patient1042} />);

      const approveBtn = screen.getByRole("button", { name: /Approve Narrative/i });
      expect(approveBtn).toBeEnabled();

      fireEvent.click(approveBtn);

      expect(
        screen.getByText(/Safety Physician Approved · Signed \(prototype\)/i),
      ).toBeInTheDocument();
      expect(useNarrativesStore.getState().statuses["CRD301-1042"]).toBe("reviewed");

      const events = useAuditStore.getState().events;
      expect(events).toHaveLength(1);
      expect(events[0].action).toBe("sign_off");
      expect(events[0].objectId).toBe("CRD301-1042");
    });

    it("gates review actions when viewing as non-writer role", () => {
      useRoleStore.setState({ role: "biostat" });
      render(<SafetyReviewBlock patient={patient1042} />);

      const approveBtn = screen.getAllByRole("button", { name: /Approve Narrative/i })[0];
      expect(approveBtn).toBeDisabled();
      expect(
        screen.getByText(/Safety review actions are role-gated to the/i),
      ).toBeInTheDocument();
      expect(screen.getAllByText(/Biostatistician/i)[0]).toBeInTheDocument();

      // Switch role via button
      const switchBtn = screen.getByRole("button", { name: /Switch to Medical Writer/i });
      fireEvent.click(switchBtn);
      expect(useRoleStore.getState().role).toBe("writer");
    });

    it("blocks review on exception patients and displays verbatim data issue", () => {
      render(<SafetyReviewBlock patient={exceptionPatient} />);

      expect(screen.getByText(/Review Blocked by Open Data Exception/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Resolution date missing in source data; query open/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/Owner:/i)).toBeInTheDocument();
      expect(screen.getByText("Data management")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Approve Narrative/i })).not.toBeInTheDocument();
    });
  });

  describe("NarrativesQueueView (S5)", () => {
    it("renders the table with 12 patients and displays sticky footer with counts", () => {
      render(<NarrativesQueueView patients={allPatients} template={template} />);

      expect(
        screen.getByRole("heading", { name: /Patient Narratives Queue/i }),
      ).toBeInTheDocument();
      expect(screen.getByText("CRD301-1042")).toBeInTheDocument();
      expect(screen.getByText("CRD301-1402")).toBeInTheDocument();

      // Bottom counts: 10 ready · 2 exceptions
      expect(screen.getByText(/10 ready · 2 exceptions/)).toBeInTheDocument();

      // Batch generate button
      expect(
        screen.getByRole("button", { name: /Generate all ready narratives/i }),
      ).toBeInTheDocument();
    });
  });

  describe("NarrativeDetailView (S6)", () => {
    it("renders cited narrative draft and interactive timeline for ready patient", () => {
      render(
        <NarrativeDetailView
          patient={patient1042}
          template={template}
          allPatients={allPatients}
        />,
      );

      expect(
        screen.getByRole("heading", { name: /Patient Narrative · CRD301-1042/i }),
      ).toBeInTheDocument();
      expect(screen.getByText(/Assembled Narrative Draft/)).toBeInTheDocument();
      expect(screen.getAllByText(/hypotension/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/Safety Physician Review/)).toBeInTheDocument();
    });

    it("displays exception refusal notice for exception patient", () => {
      render(
        <NarrativeDetailView
          patient={exceptionPatient}
          template={template}
          allPatients={allPatients}
        />,
      );

      expect(
        screen.getByText(/GCP Regulatory Refusal · Narrative Assembly Blocked/i),
      ).toBeInTheDocument();
      expect(
        screen.getAllByText(/Resolution date missing in source data; query open/i)[0],
      ).toBeInTheDocument();
      expect(screen.getAllByText("Data management")[0]).toBeInTheDocument();
    });
  });
});
