// Copyright 2025 the Deno authors. MIT license.

import { daysAgo } from "util/date.ts";
import { TestReport } from "util/types.ts";
import { pooledMap } from "@std/async/pool";

const platforms = ["linux", "windows", "darwin"] as const;
const DAYS = 10;

// These tests pass in CI but fail locally, so we exclude them.
const EXCLUDED = new Set([
  "parallel/test-child-process-send-utf8.js", // flaky with debug build
  "parallel/test-dgram-connect-send-empty-packet.js", // flaky with debug build
  "parallel/test-http-agent-maxtotalsockets.js", // flaky with debug build
  "parallel/test-http-pipeline-requests-connection-leak.js", // timeout with debug build
  "parallel/test-net-large-string.js", // timeout with debug build
  "parallel/test-net-write-after-end-nt.js", // flaky with debug build
  "parallel/test-repl-stdin-push-null.js", // failing locally with debug build
  "parallel/test-fs-read-stream-concurrent-reads.js", // flaky with debug build
  "parallel/test-vm-global-property-prototype.js", // flaky with debug build
  "pseudo-tty/test-repl-external-module.js", // failing locally
]);

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
    if (EXCLUDED.has(testName)) {
      continue; // Skip excluded tests
    }
    if (testName.startsWith("internet/")) {
      continue; // Skip internet dependent tests
    }
    if (!map[testName]) {
      map[testName] = [];
    }
    map[testName].push(result[0]);
  }
}

const consistentlyPassing = Object.entries(map).filter(([_, results]) =>
  results.every((r) => r === true)
).map(([testName, _]) => testName);

console.log(
  `[tests]`,
);
for (const test of consistentlyPassing.sort()) {
  console.log(`"${test}" = {}`);
}

function getReport(
  days: number,
  os: "linux" | "windows" | "darwin",
): Promise<TestReport> {
  return fetch(
    `https://node-test-viewer.deno.dev/results/${daysAgo(days)}/${os}.json`,
  ).then((res) => res.json());
}
