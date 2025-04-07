// Copyright 2025 the Deno authors. MIT license.

import { addDaySummaryByDate, fetchMonthSummary } from "util/report.ts";

const monthSummary = await fetchMonthSummary("2025-04");
await addDaySummaryByDate(monthSummary, "2025-04-03");
await addDaySummaryByDate(monthSummary, "2025-04-04");
await addDaySummaryByDate(monthSummary, "2025-04-05");
await addDaySummaryByDate(monthSummary, "2025-04-06");
await addDaySummaryByDate(monthSummary, "2025-04-07");
console.log(monthSummary);

const file = await Deno.open("summary-2025-04.json.gz", {
  create: true,
  write: true,
});

const stream = new Response(JSON.stringify(monthSummary, null, 2)).body!;
stream.pipeThrough(new CompressionStream("gzip")).pipeTo(file.writable);
