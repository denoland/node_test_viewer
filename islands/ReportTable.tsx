// Copyright 2025 the Deno authors. MIT license.

import type { DayReport, SingleResult, TestReport } from "util/types.ts";
import { splitTestNamesByCategory } from "util/category.ts";
import { DenoVersion } from "components/DenoVersion.tsx";
import { LinkToJsonAndErrors } from "components/LinkToJsonAndErrors.tsx";
import { ComponentChildren } from "preact";
import { useEffect, useState } from "preact/hooks";

const TEST_NAME_COLSPAN = 2;

function ExpandIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      class={`inline-block w-4 h-4 mr-1 transition-transform duration-200 ${
        expanded ? "rotate-90" : ""
      }`}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fill-rule="evenodd"
        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
        clip-rule="evenodd"
      />
    </svg>
  );
}

function CategorySummary({
  report,
  testNames,
}: {
  report: TestReport | undefined;
  testNames: string[];
}) {
  const rate = getRateForSubset(report, testNames);
  if (!rate) {
    return (
      <span class="text-gray-500 dark:text-gray-400 text-sm font-normal">
        N/A
      </span>
    );
  }
  const fail = rate.total - rate.pass;
  return (
    <div>
      <span class="underline decoration-dotted">
        {(rate.pass / rate.total * 100).toFixed(2)}%
      </span>
      <div class="text-xs text-gray-500 dark:text-gray-400">
        {rate.pass}/{rate.total} passing
        {fail > 0 && (
          <span class="text-red-500 dark:text-red-400 ml-1">
            ({fail} fail)
          </span>
        )}
      </div>
    </div>
  );
}

type SortMode =
  | "name"
  | "pass-rate-desc"
  | "pass-rate-asc"
  | "pass-count-desc"
  | "pass-count-asc";

function getSortValue(
  report: DayReport,
  testNames: string[],
  mode: SortMode,
): number {
  // Aggregate across all available OSes for sorting
  let totalPass = 0;
  let totalCount = 0;
  for (const os of ["linux", "windows", "darwin"] as const) {
    const r = report[os];
    if (!r) continue;
    const rate = getRateForSubset(r, testNames);
    if (rate) {
      totalPass += rate.pass;
      totalCount += rate.total;
    }
  }
  if (totalCount === 0) return mode.includes("desc") ? -1 : Infinity;
  if (mode.startsWith("pass-rate")) return totalPass / totalCount;
  return totalPass;
}

export function ReportTable(props: { class?: string; report: DayReport }) {
  const { report } = props;

  const testCategories = splitTestNamesByCategory(getTestNames(report));
  const nodeVersion = getNodeVersion(report);
  const date = report.date;

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [sortMode, setSortMode] = useState<SortMode>("name");

  const toggleCategory = (category: string) => {
    setExpanded((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    for (const [category] of testCategories) {
      all[category] = true;
    }
    setExpanded(all);
  };

  const collapseAll = () => {
    setExpanded({});
  };

  const sortedCategories = sortMode === "name"
    ? testCategories
    : [...testCategories].sort((a, b) => {
      const va = getSortValue(report, a[1], sortMode);
      const vb = getSortValue(report, b[1], sortMode);
      return sortMode.endsWith("desc") ? vb - va : va - vb;
    });

  return (
    <div class={props.class ?? ""}>
      <div class="flex flex-wrap items-center justify-between gap-2 mb-2 px-3">
        <div class="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
          <span>Sort:</span>
          {(
            [
              ["name", "Name"],
              ["pass-rate-desc", "Rate \u2193"],
              ["pass-rate-asc", "Rate \u2191"],
              ["pass-count-desc", "Passing \u2193"],
              ["pass-count-asc", "Passing \u2191"],
            ] as [SortMode, string][]
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSortMode(mode)}
              class={`px-1.5 py-0.5 rounded ${
                sortMode === mode
                  ? "bg-blue-500 text-white dark:bg-blue-600"
                  : "text-blue-500 dark:text-blue-400 hover:underline"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div class="flex gap-2">
          <button
            type="button"
            onClick={expandAll}
            class="text-xs text-blue-500 dark:text-blue-400 hover:underline"
          >
            Expand all
          </button>
          <span class="text-gray-400">|</span>
          <button
            type="button"
            onClick={collapseAll}
            class="text-xs text-blue-500 dark:text-blue-400 hover:underline"
          >
            Collapse all
          </button>
        </div>
      </div>
      <table class="border-collapse table-fixed w-full">
        <thead>
          <tr>
            <th
              class="align-bottom bg-gray-50 dark:bg-gray-800"
              colSpan={TEST_NAME_COLSPAN}
            >
            </th>
            <th class="align-top text-left px-1 bg-gray-50 dark:bg-gray-800">
              Linux
              <br class="inline sm:hidden" />
              <LinkToJsonAndErrors date={date} os="linux" />
              <br />
              <span class="font-bold">
                <Summary data={report.linux} />
              </span>
              <br />
              <Ignored report={report.linux} />
              <p class="font-normal font-mono text-sm text-gray-700 dark:text-gray-400">
                rev <DenoVersion version={report.linux?.denoVersion} />
              </p>
            </th>
            <th class="text-left px-1 bg-gray-50 dark:bg-gray-800">
              Windows
              <br class="inline sm:hidden" />
              <LinkToJsonAndErrors date={date} os="windows" />
              <br />
              <span class="font-bold">
                <Summary data={report.windows} />
              </span>
              <br />
              <Ignored report={report.linux} />
              <p class="font-normal font-mono text-sm text-gray-700 dark:text-gray-400">
                rev <DenoVersion version={report.windows?.denoVersion} />
              </p>
            </th>
            <th class="text-left px-1 bg-gray-50 dark:bg-gray-800">
              Darwin
              <br class="inline sm:hidden" />
              <LinkToJsonAndErrors date={date} os="darwin" />
              <br />
              <span class="font-bold">
                <Summary data={report.darwin} />
              </span>
              <br />
              <Ignored report={report.linux} />
              <p class="font-normal font-mono text-sm text-gray-700 dark:text-gray-400">
                rev <DenoVersion version={report.darwin?.denoVersion} />
              </p>
            </th>
          </tr>
        </thead>
        {sortedCategories.map(([category, testNames]) => {
          testNames.sort();
          const linux = report.linux;
          const windows = report.windows;
          const darwin = report.darwin;
          const isExpanded = !!expanded[category];
          return (
            <tbody key={category} id={category}>
              <tr
                class="bg-gray-50 border-t border-gray-300 dark:bg-gray-800 dark:border-gray-700 cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-100"
                onClick={() => toggleCategory(category)}
              >
                <td
                  colSpan={TEST_NAME_COLSPAN}
                  class="text-sm font-bold text-left py-2 px-3"
                >
                  <ExpandIcon expanded={isExpanded} />
                  {category}
                  <span class="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">
                    ({testNames.length} tests)
                  </span>
                  {isExpanded && (
                    <CopyFailedTestCasesButton
                      tests={testNames.filter((testName) => {
                        const linuxResult = linux?.results[testName];
                        const windowsResult = windows?.results[testName];
                        const darwinResult = darwin?.results[testName];
                        return (
                          (linuxResult && linuxResult[0] === false) ||
                          (windowsResult && windowsResult[0] === false) ||
                          (darwinResult && darwinResult[0] === false)
                        );
                      })}
                    />
                  )}
                </td>
                <td class="text-left text-sm font-mono py-2 px-1">
                  <CategorySummary
                    report={linux}
                    testNames={testNames}
                  />
                </td>
                <td class="text-left text-sm font-mono py-2 px-1">
                  <CategorySummary
                    report={windows}
                    testNames={testNames}
                  />
                </td>
                <td class="text-left text-sm font-mono py-2 px-1">
                  <CategorySummary
                    report={darwin}
                    testNames={testNames}
                  />
                </td>
              </tr>
              {isExpanded &&
                testNames.map((testName) => {
                  const linux = report.linux?.results[testName];
                  const windows = report.windows?.results[testName];
                  const darwin = report.darwin?.results[testName];

                  const resultOption = linux?.[2] ??
                    windows?.[2] ??
                    darwin?.[2];

                  return (
                    <tr
                      key={testName}
                      class="border-t border-gray-300 font-mono dark:text-gray-400 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-100"
                    >
                      <td
                        colSpan={TEST_NAME_COLSPAN}
                        class="text-xs py-2 whitespace-nowrap sm:overflow-visible overflow-scroll px-3"
                      >
                        <span class="relative group">
                          <CopyableTestName testName={testName} />
                          <div class="sm:block hidden">
                            <CommandTooltip
                              path={testName}
                              nodeVersion={nodeVersion}
                              useNodeTest={resultOption?.usesNodeTest}
                            />
                          </div>
                        </span>
                      </td>
                      {[linux, windows, darwin].map((result) => (
                        <td class="text-left py-2 px-1">
                          <Result result={result} />
                        </td>
                      ))}
                    </tr>
                  );
                })}
            </tbody>
          );
        })}
      </table>
    </div>
  );
}

function Ignored(props: { report: TestReport | undefined }) {
  const { report } = props;
  if (!report) {
    return (
      <span class="text-gray-500 text-sm font-normal dark:text-gray-400">
        N/A
      </span>
    );
  }
  return (
    <span class="text-gray-500 text-sm font-normal dark:text-gray-400">
      {report?.ignore ?? 0} ignored
    </span>
  );
}

function getTestNames(report: DayReport) {
  const testReport = report.windows ?? report.linux ?? report.darwin;
  return Object.keys(testReport?.results ?? {});
}

function getNodeVersion(report: DayReport) {
  const testReport = report.windows ?? report.linux ?? report.darwin;
  return testReport?.nodeVersion;
}

function Result(
  props: { result: SingleResult | undefined },
) {
  const { result } = props;
  if (!result) {
    return <span class="text-gray-400 dark:text-gray-500">N/A</span>;
  }
  if (result[0] === true) {
    return <span class="text-green-500 dark:text-green-400">PASS</span>;
  }
  if (result[0] === "IGNORE") {
    return <span class="text-gray-500 dark:text-gray-400">IGNORE</span>;
  }
  const error = result[1];
  if (error) {
    if ("code" in error) {
      return (
        <span class="text-red-500 dark:text-red-400 relative group">
          FAIL<ErrorTooltip
            text={error.stderr.trim() || (
              <span class="italic">
                Empty stderr output from the test run<br />
                Process exit code: {error.code}
              </span>
            )}
          />
        </span>
      );
    } else if ("timeout" in error) {
      return (
        <span class="text-red-500 dark:text-red-400 relative group">
          T/O<ErrorTooltip text={`Timed out after ${error.timeout}ms`} />
        </span>
      );
    } else if ("message" in error) {
      return (
        <span class="text-red-500 dark:text-red-400 relative group">
          FAIL<ErrorTooltip text={error.message} />
        </span>
      );
    }
  }

  return <span class="text-gray-400 dark:text-gray-500">INVL</span>;
}

function ErrorTooltip(props: { text: ComponentChildren; class?: string }) {
  return (
    <pre class="absolute w-[50vw] top-[18px] left-1/2 translate-x-[-65%] overflow-scroll px-4 py-2 text-xs font-mono text-left hidden group-hover:block text-white bg-gray-800 border border-gray-900 rounded shadow-lg z-10">
      {props.text}
    </pre>
  );
}

function useCopyState(text: string) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  return [copied, copy] as const;
}

function getShortTestName(testName: string): string {
  return testName.replace(/^[^/]*\//, "");
}

function CopyIcon() {
  return (
    <svg
      class="inline-block w-3.5 h-3.5 ml-1 opacity-0 group-hover:opacity-50 transition-opacity duration-150"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      class="inline-block w-3.5 h-3.5 ml-1 text-green-500 dark:text-green-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CopyableTestName({ testName }: { testName: string }) {
  const shortName = getShortTestName(testName);
  const [copied, copy] = useCopyState(shortName);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        copy();
      }}
      class="hover:text-blue-500 hover:dark:text-blue-400 cursor-pointer inline-flex items-center"
      title={copied ? "Copied!" : `Click to copy: ${shortName}`}
    >
      {testName}
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
}

function CommandTooltip(
  props: { path: string; nodeVersion?: string; useNodeTest?: boolean },
) {
  const [useDev, setUseDev] = useState(false);
  const testName = getShortTestName(props.path);
  const command0 = `./x test-compat ${testName}`;
  const [copied0, copy0] = useCopyState(command0);

  useEffect(() => {
    if (localStorage["useDevDeno"] === "true") {
      setUseDev(true);
    }
  }, []);
  return (
    <div class="absolute w-[50vw] top-[14px] -left-[25px] overflow-scroll pt-3 pb-5 text-xs font-mono text-left hidden group-hover:block bg-gray-100 border border-gray-500 rounded shadow-lg z-10 dark:bg-gray-800 dark:border-gray-700">
      <p class="px-4 text-right">
        <label class="mx-4 inline-flex items-center">
          <input
            onChange={(e) => {
              const checked = e.currentTarget.checked;
              setUseDev(checked);
              localStorage["useDevDeno"] = checked.toString();
            }}
            type="checkbox"
            class="mr-2"
            checked={useDev}
          />
          <span>Use dev build of Deno</span>
        </label>
      </p>
      <p class="px-4">
        You can run this test with the command below (<button
          type="button"
          onClick={copy0}
          class="text-blue-500 dark:text-blue-400"
        >
          {copied0 ? "Copied!" : "Click to copy"}
        </button>):
      </p>
      <pre class="mt-1 font-mono bg-gray-700 px-4 py-2 overflow-scroll dark:bg-gray-900">
        <code class="text-gray-200 dark:text-gray-400">{command0}</code>
      </pre>
      {props.nodeVersion && (
        <p class="mt-6 px-4">
          <a
            href={`https://github.com/nodejs/node/blob/v${props.nodeVersion}/test/${props.path}`}
            class="text-blue-500 dark:text-blue-400 hover:underline"
            target="_blank"
          >
            View source on GitHub
          </a>
        </p>
      )}
    </div>
  );
}

function Summary(
  props: { data: { pass: number; total: number } | undefined },
) {
  if (!props.data) {
    return (
      <span class="font-normal font-mono text-sm text-gray-700 dark:text-gray-400">
        N/A
      </span>
    );
  }
  const { total, pass } = props.data;
  return (
    <span class="font-mono">
      <span class="underline decoration-dotted">
        {(pass / total * 100).toFixed(2)}%
      </span>
      <span class="text-gray-600 text-xs sm:text-[smaller] ml-1 dark:text-gray-400">
        ({pass}/{total})
      </span>
    </span>
  );
}

function getRateForSubset(
  report: TestReport | undefined,
  subset: string[],
): { pass: number; total: number } | undefined {
  if (!report) {
    return undefined;
  }
  const results = report.results;
  let pass = 0;
  let fail = 0;
  for (const testName of subset) {
    const result = results[testName];
    if (result && result[0] === true) {
      pass++;
    } else if (result && result[0] === false) {
      fail++;
    }
  }
  return { pass, total: pass + fail };
}

function CopyFailedTestCasesButton(props: { tests: string[] }) {
  const [copied, copy] = useCopyState(
    props.tests.join("\n"),
  );
  return (
    <button
      class="ml-2 text-xs font-normal text-gray-500 hover:underline dark:text-gray-400"
      onClick={copy}
      type="button"
    >
      {copied ? "copied!" : "copy failed test case names"}
    </button>
  );
}
