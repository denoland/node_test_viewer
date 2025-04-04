// Copyright 2025 the Deno authors. MIT license.

import type { DaySummary, MonthSummary } from "util/types.ts";

const platforms = [
  "linux",
  "windows",
  "darwin",
] as const;

export function SummaryTable(
  props: { class?: string; summary: MonthSummary },
) {
  const reports = Object.entries(props.summary.reports).sort(
    ([a], [b]) => new Date(b).getTime() - new Date(a).getTime(),
  );

  return (
    <table class={`${props.class ?? ""} table-fixed border-collapse`}>
      <tr>
        <th></th>
        {platforms.map((platform) => (
          <th key={platform} class="capitalize">{platform}</th>
        ))}
      </tr>
      {reports.map(([date, summary], i) => {
        return <TableRow key={i} date={date} summary={summary} />;
      })}
    </table>
  );
}

function TableRow(props: { date: string; summary: DaySummary }) {
  const open = (e: MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      globalThis.open(
        "/results/" + props.date,
        "_blank",
        "noopener,noreferrer",
      );
    } else {
      location.href = "/results/" + props.date;
    }
  };

  return (
    <tr
      class="border-t border-grey-500 hover:bg-gray-50 cursor-pointer"
      onClick={open}
    >
      <td class="text-center py-1 text-blue-500">{props.date}</td>
      {platforms.map((os) => props.summary[os]).map((report, i) => (
        <td key={i} class="py-1 text-center font-mono">
          {report
            ? (
              <span>
                <span>{(report.pass / report.total * 100).toFixed(2)}%</span>
                <span class="hidden sm:inline">
                  ({report.pass}/{report.total})
                </span>
              </span>
            )
            : <span class="text-gray-400">N/A</span>}
        </td>
      ))}
    </tr>
  );
}
