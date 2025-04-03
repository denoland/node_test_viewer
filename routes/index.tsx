// Copyright 2025 the Deno authors. MIT license.

import { define } from "../utils.ts";
import { DenoVersion } from "../components/DenoVersion.tsx";
import { Chart } from "islands/Chart.tsx";
import { DailyTable } from "islands/DailyTable.tsx";
import { getLatestDaySummary, getSummaryForLatestMonth } from "util/report.ts";
import { DaySummary } from "util/types.ts";

export const handler = define.handlers({
  async GET() {
    const monthSummary = await getSummaryForLatestMonth();
    const daySummary = getLatestDaySummary(monthSummary);
    return { data: { monthSummary, daySummary } };
  },
});

export default define.page<typeof handler>(function (props) {
  const { monthSummary, daySummary } = props.data;
  console.log("summary", monthSummary);
  return (
    <div class="w-full">
      <Header />
      <LatestResults summary={daySummary} />
      <div class="pt-10 pb-5 border-b border-dashed">
        <div class="w-full flex justify-center">
          <Chart summary={monthSummary} class="w-4/5 h-[200px]" />
        </div>
        <div class="mt-10">
          <DailyTable
            class="mx-auto w-4/5"
            summary={monthSummary}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
});

const data = [
  {
    name: "linux",
    pass: 1144,
    total: 3945,
    rev: "73798b13bbc45acc9896244f034d2427f2b55c55",
  },
  {
    name: "windows",
    pass: 1144,
    total: 3945,
    rev: "73798b13bbc45acc9896244f034d2427f2b55c55",
  },
  {
    name: "darwin",
    pass: 1144,
    total: 3945,
  },
];

const date = "2025-04-02";

function Header() {
  return (
    <div class="w-full flex justify-between items-center px-7 py-3 border-b border-dashed">
      <h1 class="text-md font-semibold">
        <img class="h-8 inline mr-1" src="/node-deno.svg" /> Node test viewer
      </h1>
    </div>
  );
}

function LatestResults(props: { summary: DaySummary | undefined }) {
  const date = props.summary?.date;
  const data = [
    ["linux", props.summary?.linux],
    ["windows", props.summary?.windows],
    ["darwin", props.summary?.darwin],
  ] as const;
  return (
    <div class="w-full pt-10 pb-5 border-b border-dashed">
      <div class="px-10 text-sm text-gray-500">
        This page tracks the ratio of passed Node test cases with{" "}
        <a href="https://github.com/denoland/deno" target="_blank">Deno</a>{" "}
        runtime
      </div>
      <h2 class="px-10">
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
            </header>
            {item
              ? (
                <>
                  <div>
                    {item.pass}/{item.total}{" "}
                    ({(item.pass / item.total * 100).toFixed(2)}%)
                  </div>
                  <div class="text-sm text-gray-500">
                    rev <DenoVersion version={item?.denoVersion} />
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

function Footer() {
  return (
    <div class="py-5 text-sm text-center">
      <a
        class="text-blue-500"
        href="https://github.com/denoland/node_test_viewer"
        target="_blank"
      >
        source of this page
      </a>
      ・
      <a
        class="text-blue-500"
        href="https://github.com/denoland/deno"
        target="_blank"
      >
        deno
      </a>
    </div>
  );
}
