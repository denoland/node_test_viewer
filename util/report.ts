// Copyright 2025 the Deno authors. MIT license.

import { toJson } from "@std/streams";
import type {
  DayReport,
  DaySummary,
  MonthSummary,
  TestReport,
  TestReportMetadata,
} from "./types.ts";

import { WeakValueMap } from "@kt3k/weak-value-map";
import { maxBy } from "@std/collections/max-by";

const NOT_FOUND = Symbol("NOT_FOUND");
const reportCache = new WeakValueMap<string, TestReport | typeof NOT_FOUND>();
const summaryCache = new WeakValueMap<string, MonthSummary>();

/**
 * Fetch the report for a specific date and OS.
 *
 * @param date The date e.g. 2025-04-02
 * @param os The os
 * @returns
 */
export async function fetchReport(
  date: string,
  os: "linux" | "windows" | "darwin",
): Promise<TestReport | typeof NOT_FOUND | undefined> {
  console.log("fetching", date, os);
  try {
    const res = await fetch(
      `https://dl.deno.land/node-compat-test/${date}/report-${os}.json.gz`,
    );
    if (res.status === 404) {
      return NOT_FOUND;
    }
    const report = await toJson(
      res.body!.pipeThrough(new DecompressionStream("gzip")),
    );
    return report as TestReport;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

/** Gets the report. Caches the response from the storage. */
export async function getReport(
  date: string,
  os: "linux" | "windows" | "darwin",
): Promise<TestReport | undefined> {
  let report = reportCache.get(date + os);
  if (!report) {
    report = await fetchReport(date, os);
    if (report !== undefined) {
      reportCache.set(date + os, report);
    }
  } else {
    console.log("cache hit", date, os);
  }
  if (report === NOT_FOUND) {
    return undefined;
  }
  return report;
}

export async function getReportForDate(date: string): Promise<DayReport> {
  const windows = await getReport(date, "windows");
  const linux = await getReport(date, "linux");
  const darwin = await getReport(date, "darwin");
  return {
    date,
    windows,
    linux,
    darwin,
  };
}

function extractMetadata(
  report: TestReport | undefined,
): TestReportMetadata | undefined {
  if (!report) {
    return undefined;
  }
  const { date, denoVersion, os, arch, nodeVersion, runId, total, pass } =
    report;
  return {
    date,
    denoVersion,
    os,
    arch,
    nodeVersion,
    runId,
    total,
    pass,
  };
}

/** Gets the report summary for the given date. */
export async function getDaySummary(date: string): Promise<DaySummary> {
  const reports = await getReportForDate(date);
  return {
    date,
    windows: extractMetadata(reports.windows),
    linux: extractMetadata(reports.linux),
    darwin: extractMetadata(reports.darwin),
  };
}

export async function fetchMonthSummary(
  month: string,
): Promise<MonthSummary> {
  console.log("fetching", month);
  const res = await fetch(
    `https://dl.deno.land/node-compat-test/summary-${month}.json.gz`,
  );
  if (res.status === 404) {
    return { reports: {}, month };
  }
  try {
    const summary = await toJson(
      res.body!.pipeThrough(new DecompressionStream("gzip")),
    );
    return summary as MonthSummary;
  } catch (e) {
    console.error(e);
    return { reports: {}, month };
  }
}

export async function getMonthSummary(
  month: string,
): Promise<MonthSummary> {
  let summary = summaryCache.get(month);
  if (!summary) {
    summary = await fetchMonthSummary(month);
    summaryCache.set(month, summary);
  } else {
    console.log("cache hit", month);
  }
  return summary;
}

/** Get the month summary of the given month.
 *
 * The month 0 means this month, -1 means last month, -2 means the month before last month, etc.
 */
export async function getSummaryForMonth(month: number): Promise<MonthSummary> {
  const date = new Date();
  const monthName = new Date(
    date.getFullYear(),
    date.getMonth() + month,
    15,
  ).toISOString().slice(0, 7);
  return await getMonthSummary(monthName);
}

export async function getSummaryForLatestMonth(): Promise<MonthSummary> {
  const summary = await getSummaryForMonth(0);

  if (Object.keys(summary.reports).length > 0) {
    return summary;
  }

  return await getSummaryForMonth(-1);
}

export async function getSummariesForLatestMonths(
  n: number,
): Promise<MonthSummary[]> {
  const summaries = [];
  for (let i = 0; i < 4; i++) {
    const summary = await getSummaryForMonth(-i);
    if (Object.keys(summary.reports).length > 0) {
      summaries.push(summary);
    }
    if (summaries.length >= n) {
      break;
    }
  }
  return summaries;
}

export async function addDaySummaryByDate(
  monthSummary: MonthSummary,
  date: string,
) {
  const dateSummary = await getDaySummary(date);
  monthSummary.reports[date] = dateSummary;
  // sort the reports by date
  const reports = Object.entries(monthSummary.reports).sort(
    ([a], [b]) => new Date(a).getTime() - new Date(b).getTime(),
  );
  monthSummary.reports = Object.fromEntries(reports);
  return monthSummary;
}

export function getLatestDaySummary(
  summary: MonthSummary,
): DaySummary | undefined {
  return maxBy(
    Object.values(summary.reports),
    (summary) => new Date(summary.date).getTime(),
  );
}

export function isEmpty(report: DayReport) {
  return (
    !report.windows &&
    !report.linux &&
    !report.darwin
  );
}
