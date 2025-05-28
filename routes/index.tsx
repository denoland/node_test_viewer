// Copyright 2025 the Deno authors. MIT license.

import { define } from "util/fresh.ts";
import { DenoVersion } from "components/DenoVersion.tsx";
import { LinkToJsonAndErrors } from "components/LinkToJsonAndErrors.tsx";
import { Chart } from "islands/Chart.tsx";
import { SummaryTable } from "islands/SummaryTable.tsx";
import {
  getLatestDaySummary,
  getSummariesForLatestMonths,
} from "util/report.ts";
import { DaySummary } from "util/types.ts";

export const handler = define.handlers({
  async GET() {
    const monthSummaries = await getSummariesForLatestMonths(2);
    const monthSummary = monthSummaries[0];
    const daySummaries = monthSummaries.reduce(
      (acc, month) => Object.assign(acc, month.reports),
      {} as Record<string, DaySummary>,
    );
    const daySummary = getLatestDaySummary(monthSummary);
    return { data: { daySummaries, monthSummary, daySummary } };
  },
});

export default define.page<typeof handler>(function (props) {
  const { daySummary, daySummaries } = props.data;
  return (
    <>
      <LatestResults summary={daySummary} />
      <div class="pt-10 pb-5 border-b border-dashed">
        <div class="w-full flex justify-center">
          <Chart
            summaryReports={daySummaries}
            class="w-full sm:w-4/5 h-[200px]"
          />
        </div>
        <div class="mt-10">
          <SummaryTable
            class="mx-auto w-full sm:w-4/5"
            summaryReports={daySummaries}
          />
        </div>
      </div>
    </>
  );
});

function LatestResults(props: { summary: DaySummary | undefined }) {
  const date = props.summary?.date;
  const data = [
    ["linux", props.summary?.linux],
    ["windows", props.summary?.windows],
    ["darwin", props.summary?.darwin],
  ] as const;
  return (
    <div class="w-full pt-10 pb-5 border-b border-dashed">
      <div class="px-2 sm:px-10 text-sm text-gray-500">
        This page tracks the ratio of passed Node test cases with{" "}
        <a href="https://github.com/denoland/deno" target="_blank">Deno</a>{" "}
        runtime
      </div>
      <h2 class="px-2 sm:px-10">
        <span class="font-bold text-xl">Latest results</span> ({date
          ? (
            <a class="text-blue-500" href={"/results/" + date}>
              {date}
            </a>
          )
          : <span>N/A</span>})
      </h2>
      <div class="mt-4 w-full flex items-center justify-evenly">
        {data.map(([os, item]) => (
          <div class="text-center" key={os}>
            <header class="font-semibold text-md capitalize">
              {os}
              <br class="inline sm:hidden" />
              <LinkToJsonAndErrors date="latest" os={os} />
            </header>
            {item
              ? (
                <>
                  <div class="font-bold font-mono text-lg">
                    <span class="underline decoration-dotted">
                      {(item.pass / item.total * 100).toFixed(2)}%
                    </span>
                    <span class="text-gray-600 hidden sm:inline text-[smaller] ml-1">
                      ({item.pass}/{item.total})
                    </span>
                  </div>
                  <div class="text-sm font-mono text-gray-500">
                    <DenoVersion version={item?.denoVersion} />
                  </div>
                </>
              )
              : <div class="text-gray-400">N/A</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
