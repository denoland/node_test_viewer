// Copyright 2025 the Deno authors. MIT license.
// @deno-types=https://cdn.skypack.dev/-/apexcharts@v3.26.1-JfauDUVk6IgccJUyzphD/dist=es2020,mode=types/types/apexcharts.d.ts

import { useEffect, useRef } from "preact/hooks";
import { MonthSummary } from "util/types.ts";

const DAY = 24 * 60 * 60 * 1000;

export const xaxis = {
  type: "datetime",
  max: Math.floor(Date.now() / DAY) * DAY,
};

const extractData = (
  os: "linux" | "windows" | "darwin",
  summary: MonthSummary,
) => {
  const dates = Object.keys(summary.reports).sort();
  const data = dates
    .filter((date) => summary.reports[date][os])
    .map((date) => {
      const report = summary.reports[date][os]!;
      return [new Date(report.date), report.pass];
    });
  return data;
};

export function Chart(props: { class?: string; summary: MonthSummary }) {
  const chartRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let chart: ApexCharts | undefined;
    (async () => {
      const { default: ApexCharts } = await import(
        "https://cdn.skypack.dev/pin/apexcharts@v3.26.1-JfauDUVk6IgccJUyzphD/mode=imports,min/optimized/apexcharts.js"
      );

      const dates = Object.keys(props.summary.reports).sort();

      const linuxData = extractData("linux", props.summary);
      const windowsData = extractData("windows", props.summary);
      const darwinData = extractData("darwin", props.summary);
      console.log("linuxData", linuxData);
      console.log("windowsData", windowsData);
      console.log("darwinData", darwinData);

      const chart = new ApexCharts(chartRef.current!, {
        chart: {
          type: "line",
          height: "100%",
          width: "100%",
        },
        legend: {
          horizontalAlign: "left",
          position: "top",
          showForSingleSeries: true,
        },
        stroke: {
          curve: "straight",
          width: 1.7,
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
        xaxis: {
          type: "datetime",
          min: Math.floor(new Date("2025-04-02").getTime() / DAY) * DAY,
          max: Math.floor(Date.now() / DAY) * DAY,
        },
        yaxis: {
          min: 0,
          max: 4000,
          tickAmount: 4,
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
