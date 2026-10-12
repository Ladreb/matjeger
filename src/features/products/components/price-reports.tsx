"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { hideReport, restoreReport } from "@/features/pricing/lib/actions";
import { STORE_LABELS } from "@/features/pricing/lib/stores";
import { formatPrice } from "@/lib/utils";
import { formatReportAge } from "../lib/dashboard";
import type { AdminPriceReport } from "../lib/price-reports";

export function PriceReports({ reports }: { reports: AdminPriceReport[] }) {
  const [failedId, setFailedId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function change(report: AdminPriceReport) {
    if (!report.hidden && !window.confirm("Skjul denne rapporten?")) return;
    setFailedId(null);
    setPendingId(report.id);
    startTransition(async () => {
      try {
        await (report.hidden ? restoreReport : hideReport)(report.id);
      } catch {
        setFailedId(report.id);
      }
      setPendingId(null);
    });
  }

  return (
    <section id="prisrapporter" className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Prisrapporter</h2>
      {reports.length === 0 ? (
        <p className="text-sm text-muted-foreground">Ingen prisrapporter ennå.</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {reports.map((report) => (
            <li
              key={report.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div
                className={
                  report.hidden
                    ? "flex min-w-0 flex-col text-muted-foreground line-through"
                    : "flex min-w-0 flex-col"
                }
              >
                <span className="font-medium">
                  {formatPrice(report.price)}
                  {report.perKg && " per kg"}, {STORE_LABELS[report.store]}
                </span>
                <span className="text-sm text-muted-foreground">
                  {report.postalCode} · {report.reporterName ?? "ukjent"} ·{" "}
                  {formatReportAge(report.ageDays)}
                </span>
                {failedId === report.id && (
                  <span role="alert" className="text-sm text-destructive no-underline">
                    Kunne ikke lagre. Prøv igjen.
                  </span>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                disabled={pendingId === report.id}
                className={report.hidden ? undefined : "text-destructive"}
                onClick={() => change(report)}
              >
                {report.hidden ? "Vis igjen" : "Skjul"}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
