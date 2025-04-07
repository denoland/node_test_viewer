// Copyright 2025 the Deno authors. MIT license.
// @deno-types=https://cdn.skypack.dev/-/apexcharts@v3.26.1-JfauDUVk6IgccJUyzphD/dist=es2020,mode=types/types/apexcharts.d.ts

import { useEffect, useRef } from "preact/hooks";
import type { DayReport, TestReport } from "util/types.ts";
import { categories, splitTestNamesByCategory } from "util/category.ts";

export function ResultByCategoryChart(
  props: { class?: string; report: DayReport },
) {
  const chartRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let chart: ApexCharts | undefined;
    (async () => {
      const { default: ApexCharts } = await import(
        "https://esm.sh/apexcharts@4.5.0"
      );
      const { windows, linux, darwin } = props.report;
      const testCategories = splitTestNamesByCategory(
        getTestNames(props.report),
      );
      const linuxPass = linux
        ? testCategories.map(([, testNames]) => {
          const rate = getRateForSubset(linux, testNames)!;
          const { pass, total } = rate;
          return pass / total * 100;
        })
        : [];
      const windowsPass = windows
        ? testCategories.map(([, testNames]) => {
          const rate = getRateForSubset(windows, testNames)!;
          const { pass, total } = rate;
          return pass / total * 100;
        })
        : [];
      const darwinPass = darwin
        ? testCategories.map(([, testNames]) => {
          const rate = getRateForSubset(darwin, testNames)!;
          const { pass, total } = rate;
          return pass / total * 100;
        })
        : [];
      const linuxFail = linuxPass.map((v) => 100 - v);
      const windowsFail = windowsPass.map((v) => 100 - v);
      const darwinFail = darwinPass.map((v) => 100 - v);

      const chart = new ApexCharts(chartRef.current!, {
        chart: {
          type: "bar",
          height: "100%",
          width: "100%",
          stacked: true,
        },
        plotOptions: {
          bar: {
            horizontal: true,
          },
        },
        legend: {
          horizontalAlign: "left",
          position: "top",
        },
        stroke: {
          width: 1,
          colors: ["#fff"],
        },
        dataLabels: {
          enabled: false,
        },
        colors: [
          "rgb(34, 197, 94)",
          "rgb(34, 197, 94)",
          "rgb(34, 197, 94)",
          "rgb(239, 68, 68)",
          "rgb(239, 68, 68)",
          "rgb(239, 68, 68)",
        ],
        series: [
          {
            name: "PASS windows",
            group: "windows",
            data: windowsPass,
          },
          {
            name: "PASS linux",
            group: "linux",
            data: linuxPass,
          },
          {
            name: "PASS darwin",
            group: "darwin",
            data: darwinPass,
          },
          {
            name: "FAIL windows",
            group: "windows",
            data: windowsFail,
          },
          {
            name: "FAIL linux",
            group: "linux",
            data: linuxFail,
          },
          {
            name: "FAIL darwin",
            group: "darwin",
            data: darwinFail,
          },
        ],
        xaxis: {
          categories,
          labels: {
            formatter: (val: number) => val + "%",
          },
          tickAmount: 5,
        },
        yaxis: {
          max: 100,
          min: 0,
        },
        tooltip: {
          y: {
            formatter: (val: number) => val.toFixed(2) + "%",
          },
        },
      });
      chart.render();
    })();

    return () => {
      chart?.destroy();
    };
  }, []);

  return <div class={props.class} ref={chartRef}></div>;
}

function getTestNames(report: DayReport) {
  const testReport = report.windows ?? report.linux ?? report.darwin;
  return Object.keys(testReport?.results ?? {});
}

function getRateForSubset(
  report: TestReport | undefined,
  subset: string[],
): { pass: number; total: number } | undefined {
  if (!report) {
    return undefined;
  }
  const results = report.results;
  const total = subset.length;
  let pass = 0;
  for (const testName of subset) {
    const result = results[testName];
    if (result && result[0]) {
      pass++;
    }
  }
  return { pass, total };
}
