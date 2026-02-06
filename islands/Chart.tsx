// Copyright 2025 the Deno authors. MIT license.
// @deno-types=https://cdn.skypack.dev/-/apexcharts@v3.26.1-JfauDUVk6IgccJUyzphD/dist=es2020,mode=types/types/apexcharts.d.ts

import { useEffect, useRef } from "preact/hooks";
import { DaySummary } from "util/types.ts";
import { isDarktheme } from "util/colorScheme.ts";

const extractData = (
  os: "linux" | "windows" | "darwin",
  summaryReports: Record<string, DaySummary>,
) => {
  const dates = Object.keys(summaryReports).sort();
  return dates
    .filter((date) => summaryReports[date][os])
    .map((date) => {
      const report = summaryReports[date][os]!;
      return [
        new Date(report.date).getTime(),
        report.pass / report.total * 100,
      ];
    });
};

export function Chart(
  props: { class?: string; summaryReports: Record<string, DaySummary> },
) {
  const chartRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let chart: ApexCharts | undefined;
    (async () => {
      const { default: ApexCharts } = await import(
        "https://esm.sh/apexcharts@4.5.0"
      );
      const isDark = isDarktheme();
      const textColor = isDark ? "#9ca3af" : "#6b7280";
      const gridColor = isDark ? "#374151" : "#e5e7eb";

      const linuxData = extractData("linux", props.summaryReports);
      const windowsData = extractData("windows", props.summaryReports);
      const darwinData = extractData("darwin", props.summaryReports);

      // Auto-calculate y-axis range from data
      const allValues = [...linuxData, ...windowsData, ...darwinData].map(
        (d) => d[1],
      );
      const minVal = Math.min(...allValues);
      const yMin = Math.max(0, Math.floor(minVal - 2));

      chart = new ApexCharts(chartRef.current!, {
        chart: {
          type: "line",
          height: "100%",
          width: "100%",
          foreColor: textColor,
          toolbar: { show: false },
          fontFamily: "ui-monospace, monospace",
          zoom: { enabled: true },
        },
        grid: {
          borderColor: gridColor,
          strokeDashArray: 3,
        },
        legend: {
          horizontalAlign: "left",
          position: "top",
          fontSize: "12px",
          labels: { colors: textColor },
          markers: { size: 6, shape: "circle" },
        },
        stroke: {
          curve: "smooth",
          width: 2.5,
        },
        colors: [
          isDark ? "#7c9ec6" : "#5b7fa3",
          isDark ? "#c4956e" : "#a07850",
          isDark ? "#7db590" : "#5f9970",
        ],
        markers: {
          size: 3,
          strokeWidth: 0,
          hover: { size: 5 },
        },
        series: [
          { name: "Linux", data: linuxData },
          { name: "Windows", data: windowsData },
          { name: "Darwin", data: darwinData },
        ],
        xaxis: {
          type: "datetime",
          labels: {
            style: { colors: textColor, fontSize: "11px" },
          },
        },
        yaxis: {
          min: yMin,
          max: 100,
          tickAmount: 5,
          labels: {
            formatter: (val: number) => val.toFixed(1) + "%",
            style: { colors: textColor, fontSize: "11px" },
          },
        },
        tooltip: {
          x: { format: "yyyy-MM-dd" },
          y: {
            formatter: (val: number) => val.toFixed(2) + "%",
          },
          theme: isDark ? "dark" : "light",
        },
      });
      chart!.render();
    })();

    return () => {
      chart?.destroy();
    };
  }, []);

  return <div class={props.class} ref={chartRef}></div>;
}
