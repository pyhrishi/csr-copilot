"use client";

import { useId, useState } from "react";
import { AlertCircle, Calendar } from "lucide-react";

interface PatientTimelineSvgProps {
  timeline: [day: number, text: string][];
  onsetDay: number;
  resolvedDay: number | null;
  event: string;
  activeTimelineIndex: number | null;
  onSelectEntry?: (index: number) => void;
  className?: string;
}

export function PatientTimelineSvg({
  timeline,
  onsetDay,
  resolvedDay,
  event,
  activeTimelineIndex,
  onSelectEntry,
  className = "",
}: PatientTimelineSvgProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const filterId = useId();

  if (!timeline || timeline.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-subtle bg-paper-2 rounded-lg border border-line">
        No timeline entries available for this patient.
      </div>
    );
  }

  const days = timeline.map(([d]) => d);
  const minDay = Math.min(...days, 1);
  const maxDay = Math.max(...days, onsetDay, resolvedDay ?? 0, 30);
  const dayRange = Math.max(maxDay - minDay, 1);

  const svgWidth = 860;
  const svgHeight = 170;
  const paddingX = 70;
  const axisY = 85;
  const availableWidth = svgWidth - paddingX * 2;

  const getX = (day: number) => {
    return paddingX + ((day - minDay) / dayRange) * availableWidth;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-teal" />
          <h3 className="text-sm font-semibold text-ink">
            Clinical Study-Day Timeline
          </h3>
          <span className="text-xs text-subtle font-mono">
            (Study Day {minDay} to {maxDay})
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-subtle">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-critical border border-critical" />
            <span>AE Onset (Day {onsetDay})</span>
          </div>
          {resolvedDay !== null && (
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal border border-teal" />
              <span>Resolution (Day {resolvedDay})</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-ink/30 border border-ink/40" />
            <span>Clinical Milestone</span>
          </div>
        </div>
      </div>

      <div
        className="w-full overflow-x-auto bg-card rounded-xl border border-line p-3 shadow-xs"
        role="region"
        aria-label="Patient clinical timeline"
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full min-w-[720px] h-auto select-none overflow-visible"
        >
          <defs>
            <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* Background study day grid track */}
          <line
            x1={paddingX - 20}
            y1={axisY}
            x2={svgWidth - paddingX + 20}
            y2={axisY}
            stroke="var(--line)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Event interval highlight (from onset to resolution if available) */}
          {resolvedDay !== null && resolvedDay >= onsetDay && (
            <line
              x1={getX(onsetDay)}
              y1={axisY}
              x2={getX(resolvedDay)}
              y2={axisY}
              stroke="var(--critical)"
              strokeWidth="4"
              strokeOpacity="0.4"
            />
          )}

          {/* Timeline Nodes & Connectors */}
          {timeline.map(([day, text], index) => {
            const cx = getX(day);
            const isOnset = day === onsetDay;
            const isResolved = resolvedDay !== null && day === resolvedDay;
            const isSelected = activeTimelineIndex === index;
            const isHovered = hoveredIndex === index;
            const isTop = index % 2 === 0;

            const textY = isTop ? axisY - 38 : axisY + 44;
            const lineEndY = isTop ? axisY - 14 : axisY + 14;

            let nodeColor = "var(--ink)";
            let fillColor = "var(--card)";
            let strokeWidth = 2;

            if (isOnset) {
              nodeColor = "var(--critical)";
              fillColor = isSelected || isHovered ? "var(--critical)" : "var(--critical-tint)";
              strokeWidth = 3;
            } else if (isResolved) {
              nodeColor = "var(--teal)";
              fillColor = isSelected || isHovered ? "var(--teal)" : "var(--teal-tint)";
              strokeWidth = 2.5;
            } else if (isSelected || isHovered) {
              nodeColor = "var(--teal)";
              fillColor = "var(--teal-tint)";
              strokeWidth = 3;
            }

            // Truncate text for timeline pill if too long
            const truncatedText =
              text.length > 32 ? `${text.slice(0, 30)}…` : text;

            return (
              <g
                key={`node-${index}-${day}`}
                className="cursor-pointer transition-all duration-200"
                onClick={() => onSelectEntry?.(index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                tabIndex={0}
                role="button"
                aria-label={`Study Day ${day}: ${text}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectEntry?.(index);
                  }
                }}
              >
                {/* Connector line between axis and milestone pill */}
                <line
                  x1={cx}
                  y1={axisY}
                  x2={cx}
                  y2={lineEndY}
                  stroke={isSelected || isHovered ? "var(--teal)" : "var(--line)"}
                  strokeWidth={isSelected || isHovered ? "2" : "1.5"}
                  strokeDasharray={isSelected || isHovered ? undefined : "3,3"}
                />

                {/* Day label on the axis */}
                <text
                  x={cx}
                  y={isTop ? axisY + 16 : axisY - 8}
                  textAnchor="middle"
                  className={`text-[11px] font-mono font-semibold ${
                    isOnset
                      ? "fill-critical font-bold"
                      : isSelected || isHovered
                      ? "fill-teal font-bold"
                      : "fill-muted"
                  }`}
                >
                  Day {day}
                </text>

                {/* Milestone Node Circle */}
                <circle
                  cx={cx}
                  cy={axisY}
                  r={isOnset ? (isSelected || isHovered ? 8 : 7) : isSelected || isHovered ? 7 : 5}
                  fill={fillColor}
                  stroke={nodeColor}
                  strokeWidth={strokeWidth}
                />

                {/* Outer focus/pulse ring when selected */}
                {(isSelected || isHovered) && (
                  <circle
                    cx={cx}
                    cy={axisY}
                    r={isOnset ? 13 : 11}
                    fill="none"
                    stroke={nodeColor}
                    strokeWidth="2"
                    strokeOpacity="0.4"
                  />
                )}

                {/* Milestone label badge/pill */}
                <g transform={`translate(${cx}, ${textY})`}>
                  <rect
                    x="-75"
                    y="-14"
                    width="150"
                    height="28"
                    rx="6"
                    className={`transition-all duration-150 ${
                      isOnset
                        ? "fill-critical-tint stroke-critical"
                        : isSelected || isHovered
                        ? "fill-teal-tint stroke-teal"
                        : "fill-paper stroke-line"
                    }`}
                    strokeWidth={isSelected || isHovered ? "1.5" : "1"}
                    filter={isSelected || isHovered ? `url(#${filterId})` : undefined}
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    className={`text-[10px] font-medium leading-none ${
                      isOnset
                        ? "fill-critical font-semibold"
                        : isSelected || isHovered
                        ? "fill-teal font-semibold"
                        : "fill-body"
                    }`}
                  >
                    {isOnset ? `Onset: ${event}` : truncatedText}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected / Hovered Timeline Entry Detail Inspector */}
      {(() => {
        const activeIdx = hoveredIndex !== null ? hoveredIndex : activeTimelineIndex;
        if (activeIdx === null || !timeline[activeIdx]) return null;
        const [day, text] = timeline[activeIdx];
        const isOnset = day === onsetDay;

        return (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-teal-tint/50 border border-teal/20 text-xs text-ink transition-all">
            <div className="flex items-center gap-1.5 font-mono font-bold text-teal shrink-0">
              {isOnset ? (
                <AlertCircle className="h-4 w-4 text-critical shrink-0" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-teal inline-block" />
              )}
              <span>Day {day}:</span>
            </div>
            <div className="flex-1 font-medium">{text}</div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-subtle shrink-0">
              Entry #{activeIdx + 1}
            </span>
          </div>
        );
      })()}
    </div>
  );
}
