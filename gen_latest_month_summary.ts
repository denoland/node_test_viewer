// Copyright 2025 the Deno authors. MIT license.

import { addSummaryForDate } from "util/report.ts";

const monthSummary = await addSummaryForDate("2025-04-03");
console.log(monthSummary);

const file = await Deno.open("summary-2025-04.json.gz", {
  create: true,
  write: true,
});

const stream = new Response(JSON.stringify(monthSummary, null, 2)).body!;
stream.pipeThrough(new CompressionStream("gzip")).pipeTo(file.writable);
