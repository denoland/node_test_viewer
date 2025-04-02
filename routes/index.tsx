import { define } from "../utils.ts";
import { Rev } from "components/Rev.tsx";
import { Chart } from "islands/Chart.tsx";
import { DailyTable } from "islands/DailyTable.tsx";

export default define.page(function () {
  return (
    <div class="w-full">
      <Header />
      <LatestResults />
      <div class="pt-10 pb-5 border-b border-dashed">
        <div class="text-sm text-gray-600 text-center">
          TODO: chart is not working yet
        </div>
        <div class="w-full flex justify-center">
          <Chart class="w-4/5 h-[200px]" />
        </div>
        <div class="mt-10 text-sm text-gray-600 text-center">
          TODO: table is not working yet
        </div>
        <div class="mt-10">
          <DailyTable
            class="mx-auto w-4/5"
            data={new Array(20).fill(0).map((_, i) => ({
              date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
              data: data.map((item) => ({
                ...item,
                pass: Math.floor(Math.random() * item.total),
              })),
            }))}
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

function LatestResults() {
  return (
    <div class="w-full pt-10 pb-5 border-b border-dashed">
      <div class="px-10 text-sm text-gray-500">
        This page tracks the ratio of passed Node test cases with{" "}
        <a href="https://github.com/denoland/deno" target="_blank">Deno</a>{" "}
        runtime
      </div>
      <h2 class="px-10">
        <span class="font-bold text-xl">Latest results</span>{" "}
        (<a class="text-blue-500" href={"/" + date}>{date}</a>)
      </h2>
      <div class="mt-4 w-full flex items-center justify-evenly">
        {data.map((item) => (
          <div class="text-center" key={item.name}>
            <header class="font-semibold text-md capitalize">
              {item.name}
            </header>
            <div>
              {item.pass}/{item.total}{" "}
              ({(item.pass / item.total * 100).toFixed(2)}%)
            </div>
            <div class="text-sm text-gray-500">
              rev <Rev rev={item.rev} />
            </div>
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
