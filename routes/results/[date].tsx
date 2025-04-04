// Copyright 2025 the Deno authors. MIT license.

import { define } from "util/fresh.ts";
import { getReportForDate, isEmpty } from "util/report.ts";
import { ReportTable } from "islands/ReportTable.tsx";

export const handler = define.handlers({
  async GET(ctx) {
    const { date } = ctx.params;
    const report = await getReportForDate(date);

    return {
      data: { report },
    };
  },
});

/** This page displays the results for a specific date. */
export default define.page<typeof handler>((props) => {
  const { report } = props.data;
  if (isEmpty(report)) {
    return <div>Page not found</div>;
  }

  return (
    <>
      <div class="w-full">
        <p class="pt-3 px-2 sm:px-10">
          <a href="/" class="text-blue-500">&laquo; Back</a>
        </p>
        <h2 class="pt-6 pb-3 px-2 w-full sm:w-4/5 mx-auto text-xl border-b border-dashed">
          <span class="font-bold">Results</span> {report.date}
        </h2>
      </div>
      <div class="w-full pt-4 pb-5 border-b border-dashed">
        <ReportTable class="mx-auto w-full sm:w-4/5" report={report} />
      </div>
    </>
  );
});
