// Copyright 2025 the Deno authors. MIT license.

import { define } from "util/fresh.ts";
import {
  getLatestDaySummary,
  getReportForDate,
  getSummaryForLatestMonth,
} from "util/report.ts";

export const handler = define.handlers({
  async GET(ctx) {
    let { date, os } = ctx.params;

    if (os !== "linux" && os !== "windows" && os !== "darwin") {
      return new Response("Invalid os: " + os, { status: 400 });
    }

    if (date === "latest") {
      const monthSummary = await getSummaryForLatestMonth();
      const daySummary = getLatestDaySummary(monthSummary);
      if (!daySummary) {
        return { data: { report: null } };
      }
      date = daySummary.date;
    }

    const dayReport = await getReportForDate(date);

    const singleReport = dayReport[os];

    if (!singleReport) {
      return new Response(`No report found for ${date} on ${os}`, {
        status: 404,
      });
    }

    const errors = Object.entries(singleReport.results).map(
      ([name, [, error]]) => {
        if (error && "code" in error) {
          const err = error.stderr.split("\n")[0]!
            .replace(/^error: Uncaught \(in promise\) /, "")
            .replace(/^error: Uncaught /, "");
          return [name, err] as const;
        }
        return null;
      },
    ).filter((x) => x !== null);

    const errorMap = {} as Record<string, number>;
    errors.forEach(([, error]) => {
      errorMap[error] = (errorMap[error] ?? 0) + 1;
    });

    const text = Object.entries(errorMap)
      .sort(([, a], [, b]) => b - a)
      .map(([error, count]) => `(${count}) ${error}`)
      .join("\n");

    return new Response(text, { headers: { "Content-Type": "text/plain" } });
  },
});
