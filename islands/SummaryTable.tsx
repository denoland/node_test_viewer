// Copyright 2025 the Deno authors. MIT license.

import type { DaySummary, TestReportMetadata } from "util/types.ts";

const platforms = [
  "linux",
  "windows",
  "darwin",
] as const;

function pct(report: TestReportMetadata): number {
  return report.pass / report.total * 100;
}

function Diff(
  props: {
    current: TestReportMetadata | undefined;
    previous: TestReportMetadata | undefined;
  },
) {
  if (!props.current || !props.previous) return null;
  const diff = pct(props.current) - pct(props.previous);
  const passDiff = props.current.pass - props.previous.pass;
  if (Math.abs(diff) < 0.005 && passDiff === 0) return null;
  const positive = diff >= 0;
  const sign = positive ? "+" : "";
  return (
    <span
      class={`text-xs ml-1 ${
        positive
          ? "text-green-600 dark:text-green-400"
          : "text-red-500 dark:text-red-400"
      }`}
    >
      {sign}
      {diff.toFixed(2)}%{" / "}
      {sign}
      {passDiff}
    </span>
  );
}

export function SummaryTable(
  props: { class?: string; summaryReports: Record<string, DaySummary> },
) {
  const reports = Object.entries(props.summaryReports).sort(
    ([a], [b]) => new Date(b).getTime() - new Date(a).getTime(),
  );

  return (
    <table class={`${props.class ?? ""} table-fixed border-collapse`}>
      <thead>
        <tr>
          <th class="text-left px-2 bg-gray-50 dark:bg-gray-800"></th>
          {platforms.map((platform) => (
            <th
              key={platform}
              class="capitalize text-left px-2 bg-gray-50 dark:bg-gray-800"
            >
              {platform}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {reports.map(([date, summary], i) => {
          const prev = i < reports.length - 1 ? reports[i + 1][1] : undefined;
          return (
            <TableRow key={i} date={date} summary={summary} previous={prev} />
          );
        })}
      </tbody>
    </table>
  );
}

function TableRow(
  props: {
    date: string;
    summary: DaySummary;
    previous: DaySummary | undefined;
  },
) {
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
      class="border-t border-gray-300 dark:border-gray-700 hover:bg-gray-50 cursor-pointer dark:hover:bg-gray-800 transition-colors duration-100"
      onClick={open}
    >
      <td class="text-left py-2 px-2 text-blue-500 dark:text-blue-400">
        {props.date}
      </td>
      {platforms.map((os) => {
        const report = props.summary[os];
        const prev = props.previous?.[os];
        return (
          <td key={os} class="py-2 px-2 text-left font-mono">
            {report
              ? (
                <span>
                  <span>{pct(report).toFixed(2)}%</span>
                  <span class="hidden sm:inline text-xs text-gray-500 dark:text-gray-400 ml-1">
                    ({report.pass}/{report.total})
                  </span>
                  <Diff current={report} previous={prev} />
                </span>
              )
              : <span class="text-gray-400 dark:text-gray-500">N/A</span>}
          </td>
        );
      })}
    </tr>
  );
}
