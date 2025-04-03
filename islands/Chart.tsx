// Copyright 2018-2025 the Deno authors. MIT license.
// @deno-types=https://cdn.skypack.dev/-/apexcharts@v3.26.1-JfauDUVk6IgccJUyzphD/dist=es2020,mode=types/types/apexcharts.d.ts

import { useEffect, useRef } from "preact/hooks";

const DAY = 24 * 60 * 60 * 1000;

export const xaxis = {
  type: "datetime",
  max: Math.floor(Date.now() / DAY) * DAY,
};

export function Chart(props: { class?: string }) {
  const chartRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let chart: ApexCharts | undefined;
    (async () => {
      const { default: ApexCharts } = await import(
        "https://cdn.skypack.dev/pin/apexcharts@v3.26.1-JfauDUVk6IgccJUyzphD/mode=imports,min/optimized/apexcharts.js"
      );

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
            data: [
              [new Date("2025-03-28"), 2555],
              [new Date("2025-03-29"), 3945],
              [new Date("2025-03-30"), 2344],
              [new Date("2025-03-31"), 3945],
              [new Date("2025-04-01"), 3244],
              [new Date("2025-04-02"), 3845],
            ],
          },
          {
            name: "windows",
            data: [
              [new Date("2025-03-28"), 1144],
              [new Date("2025-03-29"), 3945],
              [new Date("2025-03-30"), 1144],
              [new Date("2025-03-31"), 3945],
              [new Date("2025-04-01"), 3244],
              [new Date("2025-04-02"), 3845],
            ],
          },
          {
            name: "darwin",
            data: [
              [new Date("2025-03-28"), 1144],
              [new Date("2025-03-29"), 3945],
              [new Date("2025-03-30"), 1144],
              [new Date("2025-03-31"), 3945],
              [new Date("2025-04-01"), 3244],
              [new Date("2025-04-02"), 3845],
            ],
          },
        ],
        xaxis: {
          type: "datetime",
          min: Math.floor(new Date("2025-03-28").getTime() / DAY) * DAY,
          max: Math.floor(Date.now() / DAY) * DAY,
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
