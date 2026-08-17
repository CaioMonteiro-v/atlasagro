"use client";

import { Download } from "lucide-react";
import { toCsv } from "@/lib/utils";

export function ExportCsvButton({
  rows,
  filename,
}: {
  rows: Array<Record<string, string>>;
  filename: string;
}) {
  function exportCsv() {
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={exportCsv}
      disabled={rows.length === 0}
      className="btn-secondary"
    >
      <Download className="h-4 w-4" />
      Exportar CSV
    </button>
  );
}
