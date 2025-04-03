// Copyright 2025 the Deno authors. MIT license.

import { toJson } from "@std/streams";
import { type TestReport } from "./types.ts";
import { WeakValueMap } from "@kt3k/weak-value-map";

const NOT_FOUND = Symbol("NOT_FOUND");
const map = new WeakValueMap<string, TestReport | typeof NOT_FOUND>();

/**
 * Fetch the report for a specific date and OS.
 *
 * @param date The date e.g. 2025-04-02
 * @param os The os
 * @returns
 */
export async function fetchReport(
  date: string,
  os: "linux" | "windows" | "darwin",
): Promise<TestReport | typeof NOT_FOUND | undefined> {
  try {
    const res = await fetch(
      `https://dl.deno.land/node-compat-test/${date}/report-${os}.json.gz`,
    );
    if (res.status === 404) {
      return NOT_FOUND;
    }
    const report = await toJson(
      res.body!.pipeThrough(new DecompressionStream("gzip")),
    );
    return report as TestReport;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

/** Gets the report. Caches the response from the storage. */
export async function getReport(
  date: string,
  os: "linux" | "windows" | "darwin",
): Promise<TestReport | undefined> {
  let report = map.get(date + os);
  if (!report) {
    report = await fetchReport(date, os);
    if (report !== undefined) {
      map.set(date + os, report);
    }
  } else {
    console.log("cache hit", date, os);
  }
  if (report === NOT_FOUND) {
    return undefined;
  }
  return report;
}
