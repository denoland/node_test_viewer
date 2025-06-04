// Copyright 2025 the Deno authors. MIT license.

import { define } from "util/fresh.ts";
import {
  getLatestDaySummary,
  getReportForDate,
  getSummaryForLatestMonth,
  isEmpty,
} from "util/report.ts";
import { categories } from "util/category.ts";
import { ReportTable } from "islands/ReportTable.tsx";
import { ResultByCategoryChart } from "islands/ResultByCategoryChart.tsx";

export const handler = define.handlers({
  async GET(ctx) {
    let { date } = ctx.params;

    if (date === "latest") {
      const monthSummary = await getSummaryForLatestMonth();
      const daySummary = getLatestDaySummary(monthSummary);
      if (!daySummary) {
        return { data: { report: null } };
      }
      date = daySummary.date;
    }

    const report = await getReportForDate(date);

    return {
      data: { report },
    };
  },
});

/** This page displays the results for a specific date. */
export default define.page<typeof handler>((props) => {
  const { report } = props.data;
  if (!report || isEmpty(report)) {
    return (
      <div class="w-full border-b border-dashed">
        <div class="px-2 py-6 sm:w-4/5 mx-auto">
          404 Page not found
        </div>
      </div>
    );
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
        <div class="py-3 px-2 mb-2 w-full sm:w-4/5 mx-auto text-xs border-b border-dashed flex flex-wrap">
          {categories.map((category, i) => (
            <>
              {i > 0 && <span class="py-1 text-gray-400">|</span>}
              <a
                key={category}
                class="text-blue-500 hover:underline px-2 py-1"
                href={`#${category}`}
              >
                {category}
              </a>
            </>
          ))}
        </div>
      </div>
      <div class="w-full sm:w-4/5 mx-auto h-[1400px]">
        <ResultByCategoryChart report={report} />
      </div>
      <div class="w-full pt-4 pb-5 border-b border-dashed">
        <ReportTable class="mx-auto w-full sm:w-4/5" report={report} />
      </div>
    </>
  );
});
