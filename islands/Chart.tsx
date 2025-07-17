// Copyright 2025 the Deno authors. MIT license.
// @deno-types=https://cdn.skypack.dev/-/apexcharts@v3.26.1-JfauDUVk6IgccJUyzphD/dist=es2020,mode=types/types/apexcharts.d.ts

import { useEffect, useRef } from "preact/hooks";
import { DaySummary } from "util/types.ts";
import { isDarktheme } from "util/colorScheme.ts";

const DAY = 24 * 60 * 60 * 1000;

export const xaxis = {
  type: "datetime",
  max: Math.floor(Date.now() / DAY) * DAY,
};

const extractData = (
  os: "linux" | "windows" | "darwin",
  summaryReports: Record<string, DaySummary>,
) => {
  const dates = Object.keys(summaryReports).sort();
  const data = dates
    .filter((date) => summaryReports[date][os])
    .map((date) => {
      const report = summaryReports[date][os]!;
      return [new Date(report.date), report.pass];
    });
  return data;
};

export function Chart(
  props: { class?: string; summaryReports: Record<string, DaySummary> },
) {
  const chartRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let chart: ApexCharts | undefined;
    (async () => {
      const { default: ApexCharts } = await import(
        "https://cdn.skypack.dev/pin/apexcharts@v3.26.1-JfauDUVk6IgccJUyzphD/mode=imports,min/optimized/apexcharts.js"
      );
      const isDark = isDarktheme();

      const linuxData = extractData("linux", props.summaryReports);
      const windowsData = extractData("windows", props.summaryReports);
      const darwinData = extractData("darwin", props.summaryReports);

      const chart = new ApexCharts(chartRef.current!, {
        chart: {
          type: "line",
          height: "100%",
          width: "100%",
          foreColor: isDark ? "#fff" : "#000",
        },
        legend: {
          horizontalAlign: "left",
          position: "top",
          showForSingleSeries: true,
          labels: {
            colors: isDark ? ["#fff"] : ["#000"],
          },
        },
        stroke: {
          curve: "straight",
          width: 1.7,
          colors: isDark ? ["#fff"] : ["#000"],
        },
        series: [
          {
            name: "linux",
            data: linuxData,
          },
          {
            name: "windows",
            data: windowsData,
          },
          {
            name: "darwin",
            data: darwinData,
          },
        ],
        xaxis: { type: "datetime" },
        yaxis: {
          min: 0,
          max: 4000,
          tickAmount: 4,
        },
        tooltip: {
          theme: isDark ? "dark" : "light",
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
