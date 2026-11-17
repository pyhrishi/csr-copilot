import { AlertTriangle, CheckCircle2, UserCheck } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Patient } from "@/lib/types";

interface ExceptionsListProps {
  exceptions: readonly Patient[];
}

export function ExceptionsList({ exceptions }: ExceptionsListProps) {
  if (exceptions.length === 0) {
    return (
      <div id="exceptions" className="space-y-3 scroll-mt-6">
        <h3 className="label text-teal flex items-center gap-1.5">
          <CheckCircle2 className="size-4 text-teal" aria-hidden="true" />
          <span>Clinical Data Exceptions</span>
        </h3>
        <div className="rounded-xl border border-teal/30 bg-teal-tint/20 p-6 text-center text-xs text-teal font-medium flex items-center justify-center gap-2">
          <CheckCircle2 className="size-4 text-teal" aria-hidden="true" />
          <span>No open clinical data exceptions. All patient safety records verified.</span>
        </div>
      </div>
    );
  }

  return (
    <div id="exceptions" className="space-y-3 scroll-mt-6">
      <div className="flex items-center justify-between">
        <h3 className="label text-teal flex items-center gap-1.5">
          <AlertTriangle className="size-4 text-amber" aria-hidden="true" />
          <span>Clinical Data Exceptions</span>
        </h3>
        <span className="text-xs text-amber font-semibold flex items-center gap-1">
          <span>{exceptions.length} open queries</span>
          <span className="text-subtle font-normal">· Skipped in automated narrative batch</span>
        </span>
      </div>

      <div className="rounded-xl border border-line bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-paper-2 hover:bg-paper-2 border-b border-line">
              <TableHead className="w-[140px] font-bold text-ink">Patient ID</TableHead>
              <TableHead className="w-[140px] font-bold text-ink">Treatment Arm</TableHead>
              <TableHead className="min-w-[200px] font-bold text-ink">Clinical Event</TableHead>
              <TableHead className="min-w-[300px] font-bold text-ink">Source Data Issue</TableHead>
              <TableHead className="w-[160px] font-bold text-ink">Owner</TableHead>
              <TableHead className="w-[140px] font-bold text-ink">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exceptions.map((patient) => {
              return (
                <TableRow
                  key={patient.id}
                  className="border-b border-line/70 hover:bg-amber-tint/20 transition-colors"
                >
                  {/* Patient ID */}
                  <TableCell className="font-bold tabular text-ink">
                    {patient.id}
                  </TableCell>

                  {/* Treatment Arm */}
                  <TableCell className="text-xs font-medium text-body">
                    {patient.armLabel}
                  </TableCell>

                  {/* Event */}
                  <TableCell>
                    <div className="text-sm font-semibold text-ink">{patient.event}</div>
                    <div className="text-xs text-subtle mt-0.5">
                      {patient.seriousness} · Severity: {patient.severity}
                    </div>
                  </TableCell>

                  {/* Data Issue (Quoted verbatim) */}
                  <TableCell>
                    <div className="rounded-md border border-amber/30 bg-amber-tint/40 p-2 text-xs font-medium text-amber">
                      &ldquo;{patient.dataIssue}&rdquo;
                    </div>
                    <div className="text-[11px] text-subtle mt-1">
                      Action: Narrative generation blocked until resolution date is verified.
                    </div>
                  </TableCell>

                  {/* Owner: Data management */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-body">
                      <UserCheck className="size-3.5 text-teal" aria-hidden="true" />
                      <span>Data management</span>
                    </div>
                    <div className="text-[11px] text-subtle mt-0.5">DM Query Active</div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 rounded-[6px] border border-amber/30 bg-amber-tint px-2 py-0.5 text-xs font-semibold text-amber tabular">
                      <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
                      <span>Open query</span>
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="bg-amber-tint/30 px-4 py-3 border-t border-line text-xs text-amber flex items-start gap-2">
          <AlertTriangle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
          <p>
            <strong>Regulatory Protocol Notice:</strong> Under the fictional sponsor&rsquo;s data-management process,
            automated narrative generation is refused for patient records with unresolved source queries.
            Both exceptions will be excluded from the batch generation run in Section 12.3 narratives.
          </p>
        </div>
      </div>
    </div>
  );
}
