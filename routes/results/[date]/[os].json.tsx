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
      return Response.json({
        error: "Unable to return the report for invalid os: " + os,
      }, { status: 400 });
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
    return Response.json(singleReport);
  },
});
