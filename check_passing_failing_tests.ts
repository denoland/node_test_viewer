// Copyright 2025 the Deno authors. MIT license.

import { daysAgo } from "util/date.ts";
import { TestReport } from "util/types.ts";
import { pooledMap } from "@std/async/pool";

const platforms = ["linux", "windows", "darwin"] as const;
const DAYS = 10;

const tasks = platforms.map((os) =>
  [...Array(DAYS).keys()].map((i) => [i + 1, os] as const)
).flat();

const iter = pooledMap(6, tasks, async ([days, os]) => {
  try {
    console.error(`Fetching report for ${days} days ago on ${os}`);
    return await getReport(days, os);
  } catch (error) {
    console.error(
      `Error fetching report for ${days} days ago on ${os}:`,
      error,
    );
  }
});

const reports = (await Array.fromAsync(iter)).filter(Boolean) as TestReport[];

const map = {} as Record<string, (boolean | "IGNORE")[]>;

console.error(`${reports.length} reports fetched.`);

for (const report of reports) {
  for (const [testName, result] of Object.entries(report.results)) {
    if (!map[testName]) {
      map[testName] = [];
    }
    map[testName].push(result[0]);
  }
}

const consistentlyPassing = Object.entries(map).filter(([testName, results]) =>
  results.every((r) => r)
).map(([testName, results]) => testName);
const consistentlyFailing = Object.entries(map).filter(([testName, results]) =>
  results.every((r) => !r)
).map(([testName, results]) => testName);
const ignoredTests = Object.entries(map).filter(([testName, results]) =>
  results.some((r) => r === "IGNORE")
).map(([testName, results]) => testName);
const flakyTests = Object.entries(map).filter(([testName, results]) =>
  results.some((r) => r === false) && results.some((r) => r === true)
).map(([testName, results]) => testName);

const totalTests = Object.keys(map).length - Object.keys(ignoredTests).length;

function percentage(part: number, total: number): string {
  return ((part / total) * 100).toFixed(2) + "%";
}

console.log(
  `## Consistently Passing Tests(${consistentlyPassing.length} - ${
    percentage(consistentlyPassing.length, totalTests)
  }):`,
);
for (const test of consistentlyPassing) {
  console.log(`- ${test}`);
}

console.log(
  `\n## Consistently Failing Tests(${consistentlyFailing.length} - ${
    percentage(consistentlyFailing.length, totalTests)
  }):`,
);
for (const test of consistentlyFailing) {
  console.log(`- ${test}`);
}

console.log(
  `\n## Ignored Tests(${ignoredTests.length} - ${
    percentage(ignoredTests.length, totalTests)
  }):`,
);
for (const test of ignoredTests) {
  console.log(`- ${test}`);
}

console.log(
  `\n## Flaky Tests(${flakyTests.length} - ${
    percentage(flakyTests.length, totalTests)
  }):`,
);
for (const test of flakyTests) {
  console.log(`- ${test}`);
}

function getReport(
  days: number,
  os: "linux" | "windows" | "darwin",
): Promise<TestReport> {
  return fetch(
    `https://node-test-viewer.deno.dev/results/${daysAgo(days)}/${os}.json`,
  ).then((res) => res.json());
}
