// Copyright 2025 the Deno authors. MIT license.
// @deno-types=https://cdn.skypack.dev/-/apexcharts@v3.26.1-JfauDUVk6IgccJUyzphD/dist=es2020,mode=types/types/apexcharts.d.ts

import { useEffect, useRef, useState } from "preact/hooks";
import type { DayReport, TestReport } from "util/types.ts";
import { splitTestNamesByCategory } from "util/category.ts";
import { isDarktheme } from "util/colorScheme.ts";

interface CategoryData {
  name: string;
  testCount: number;
  linux: number;
  windows: number;
  darwin: number;
  avg: number;
}

function buildCategoryData(report: DayReport): CategoryData[] {
  const testCategories = splitTestNamesByCategory(getTestNames(report));
  return testCategories.map(([name, testNames]) => {
    const linuxRate = getRateForSubset(report.linux, testNames);
    const windowsRate = getRateForSubset(report.windows, testNames);
    const darwinRate = getRateForSubset(report.darwin, testNames);
    const linux = linuxRate ? linuxRate.pass / linuxRate.total * 100 : -1;
    const windows = windowsRate
      ? windowsRate.pass / windowsRate.total * 100
      : -1;
    const darwin = darwinRate ? darwinRate.pass / darwinRate.total * 100 : -1;
    const vals = [linux, windows, darwin].filter((v) => v >= 0);
    const avg = vals.length > 0
      ? vals.reduce((a, b) => a + b) / vals.length
      : 0;
    return { name, testCount: testNames.length, linux, windows, darwin, avg };
  });
}

function Heatmap(
  props: { report: DayReport; class?: string },
) {
  const chartRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let chart: ApexCharts | undefined;
    (async () => {
      const { default: ApexCharts } = await import(
        "https://esm.sh/apexcharts@4.5.0"
      );
      const isDark = isDarktheme();
      const data = buildCategoryData(props.report);
      const textColor = isDark ? "#9ca3af" : "#6b7280";

      const osNames = ["Darwin", "Windows", "Linux", "Overall"] as const;
      const osKeys = ["darwin", "windows", "linux", "avg"] as const;

      const series = osNames.map((osName, i) => ({
        name: osName,
        data: data.map((d) => ({
          x: d.name,
          y: Math.round(d[osKeys[i]] * 100) / 100,
        })),
      }));

      chart = new ApexCharts(chartRef.current!, {
        chart: {
          type: "heatmap",
          height: 650,
          toolbar: { show: false },
          fontFamily: "ui-monospace, monospace",
          foreColor: textColor,
        },
        plotOptions: {
          heatmap: {
            radius: 2,
            enableShades: false,
            colorScale: {
              ranges: [
                {
                  from: -1,
                  to: -0.01,
                  color: isDark ? "#374151" : "#e5e7eb",
                  name: "N/A",
                },
                {
                  from: 0,
                  to: 49.99,
                  color: isDark ? "#b45252" : "#dc6868",
                  name: "0-50%",
                },
                {
                  from: 50,
                  to: 79.99,
                  color: isDark ? "#b08a3e" : "#d4a64a",
                  name: "50-80%",
                },
                {
                  from: 80,
                  to: 94.99,
                  color: isDark ? "#4a8c5c" : "#5ba06e",
                  name: "80-95%",
                },
                {
                  from: 95,
                  to: 100,
                  color: isDark ? "#2d7a42" : "#3a8f50",
                  name: "95-100%",
                },
              ],
            },
          },
        },
        dataLabels: {
          enabled: true,
          formatter: (val: number) => val < 0 ? "N/A" : val.toFixed(0) + "%",
          style: {
            fontSize: "10px",
            fontWeight: 400,
            colors: ["#fff"],
          },
        },
        stroke: {
          width: 2,
          colors: [isDark ? "#111827" : "#fff"],
        },
        legend: {
          show: true,
          position: "top",
          horizontalAlign: "left",
          fontSize: "11px",
          labels: { colors: textColor },
        },
        xaxis: {
          labels: {
            style: { colors: textColor, fontSize: "10px" },
            rotate: -45,
            rotateAlways: true,
          },
          tooltip: { enabled: false },
        },
        yaxis: {
          labels: {
            style: { colors: textColor, fontSize: "12px" },
          },
        },
        tooltip: {
          y: {
            formatter: (val: number) => val < 0 ? "N/A" : val.toFixed(2) + "%",
          },
          theme: isDark ? "dark" : "light",
        },
        series,
      });
      chart.render();
    })();
    return () => {
      chart?.destroy();
    };
  }, []);

  return <div class={props.class} ref={chartRef}></div>;
}

function Treemap(
  props: { report: DayReport; class?: string },
) {
  const chartRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let chart: ApexCharts | undefined;
    (async () => {
      const { default: ApexCharts } = await import(
        "https://esm.sh/apexcharts@4.5.0"
      );
      const isDark = isDarktheme();
      const data = buildCategoryData(props.report);
      const textColor = isDark ? "#9ca3af" : "#6b7280";

      // Square root scale so tiny categories remain visible
      const treemapData = data.map((d) => ({
        x: `${d.name} (${d.avg.toFixed(0)}%)`,
        y: Math.round(Math.sqrt(d.testCount) * 100) / 100,
      }));

      // Color each cell by pass rate
      const colors = data.map((d) => {
        if (d.avg >= 95) return isDark ? "#2d7a42" : "#3a8f50";
        if (d.avg >= 80) return isDark ? "#4a8c5c" : "#5ba06e";
        if (d.avg >= 50) return isDark ? "#b08a3e" : "#d4a64a";
        return isDark ? "#b45252" : "#dc6868";
      });

      chart = new ApexCharts(chartRef.current!, {
        chart: {
          type: "treemap",
          height: 400,
          toolbar: { show: false },
          fontFamily: "ui-monospace, monospace",
          foreColor: textColor,
        },
        plotOptions: {
          treemap: {
            distributed: true,
            enableShades: false,
          },
        },
        colors,
        dataLabels: {
          enabled: true,
          style: {
            fontSize: "12px",
            fontWeight: 500,
          },
          formatter: (
            _text: string,
            op: { value: number; dataPointIndex: number },
          ) => {
            const d = data[op.dataPointIndex];
            return [
              `${d.name}`,
              `${d.avg.toFixed(0)}% · ${d.testCount} tests`,
            ];
          },
        },
        stroke: {
          width: 2,
          colors: [isDark ? "#111827" : "#fff"],
        },
        legend: { show: false },
        tooltip: {
          y: {
            formatter: (_val: number, opts: { dataPointIndex: number }) => {
              const d = data[opts.dataPointIndex];
              const parts = [
                `${d.testCount} tests, avg ${d.avg.toFixed(1)}%`,
              ];
              if (d.linux >= 0) parts.push(`Linux: ${d.linux.toFixed(1)}%`);
              if (d.windows >= 0) {
                parts.push(`Windows: ${d.windows.toFixed(1)}%`);
              }
              if (d.darwin >= 0) parts.push(`Darwin: ${d.darwin.toFixed(1)}%`);
              return parts.join(" · ");
            },
          },
          theme: isDark ? "dark" : "light",
        },
        series: [{ data: treemapData }],
      });
      chart.render();
    })();
    return () => {
      chart?.destroy();
    };
  }, []);

  return <div class={props.class} ref={chartRef}></div>;
}

type ChartMode = "heatmap" | "treemap";

function ChartToggle(
  props: { mode: ChartMode; onChange: (mode: ChartMode) => void },
) {
  const btn =
    "px-3 py-1 text-xs font-mono rounded transition-colors duration-100";
  const active =
    "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100";
  const inactive =
    "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300";
  return (
    <div class="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded p-0.5 w-fit">
      <button
        type="button"
        class={`${btn} ${props.mode === "heatmap" ? active : inactive}`}
        onClick={() => props.onChange("heatmap")}
      >
        Heatmap
      </button>
      <button
        type="button"
        class={`${btn} ${props.mode === "treemap" ? active : inactive}`}
        onClick={() => props.onChange("treemap")}
      >
        Treemap
      </button>
    </div>
  );
}

export function ResultByCategoryChart(
  props: { class?: string; report: DayReport },
) {
  const [mode, setMode] = useState<ChartMode>("heatmap");
  return (
    <div class={props.class}>
      <div class="flex items-center justify-between mt-4 mb-2 px-1">
        <h3 class="text-sm font-bold text-gray-600 dark:text-gray-400">
          {mode === "heatmap"
            ? "Pass rate by category and OS"
            : "Category size and health"}
        </h3>
        <ChartToggle mode={mode} onChange={setMode} />
      </div>
      {mode === "heatmap"
        ? <Heatmap report={props.report} />
        : <Treemap report={props.report} />}
    </div>
  );
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
