// Copyright 2025 the Deno authors. MIT license.

import type { DayReport, SingleResult, TestReport } from "util/types.ts";
import { splitTestNamesByCategory } from "util/category.ts";
import { DenoVersion } from "components/DenoVersion.tsx";
import { LinkToJsonAndErrors } from "components/LinkToJsonAndErrors.tsx";
import { ComponentChildren } from "preact";
import { useEffect, useState } from "preact/hooks";

const TEST_NAME_COLSPAN = 2;

export function ReportTable(props: { class?: string; report: DayReport }) {
  const { report } = props;

  const testCategories = splitTestNamesByCategory(getTestNames(report));
  const nodeVersion = getNodeVersion(report);
  const date = report.date;

  return (
    <table
      class={`border-collapse table-fixed ${props.class ?? ""}`}
    >
      <thead>
        <tr>
          <th class="align-bottom" colSpan={TEST_NAME_COLSPAN}></th>
          <th class="align-top">
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
          <th>
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
          <th>
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
      {testCategories.map(([category, testNames]) => {
        testNames.sort();
        const linux = report.linux;
        const windows = report.windows;
        const darwin = report.darwin;
        return (
          <tbody key={category} id={category}>
            <tr class="text-center bg-gray-50 border-t border-gray-300 dark:bg-gray-800 dark:border-gray-700">
              <td
                colSpan={TEST_NAME_COLSPAN}
                class="text-sm font-bold text-left py-1 px-3"
              >
                {category}
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
              </td>
              <td>
                <span class="text-sm">
                  <Summary data={getRateForSubset(linux, testNames)} />
                </span>
              </td>
              <td>
                <span class="text-sm">
                  <Summary data={getRateForSubset(windows, testNames)} />
                </span>
              </td>
              <td>
                <span class="text-sm">
                  <Summary data={getRateForSubset(darwin, testNames)} />
                </span>
              </td>
            </tr>
            {testNames.map((testName) => {
              const linux = report.linux?.results[testName];
              const windows = report.windows?.results[testName];
              const darwin = report.darwin?.results[testName];

              const resultOption = linux?.[2] ??
                windows?.[2] ??
                darwin?.[2];

              return (
                <tr
                  key={testName}
                  class="border-t border-gray-300 font-mono dark:text-gray-400 dark:border-gray-700"
                >
                  <td
                    colSpan={TEST_NAME_COLSPAN}
                    class="text-xs py-1 whitespace-nowrap sm:overflow-visible overflow-scroll px-1"
                  >
                    <span class="relative group">
                      <a
                        href={`https://github.com/nodejs/node/blob/v${nodeVersion}/test/${testName}`}
                        class="hover:text-blue-500 hover:dark:text-blue-400"
                        target="_blank"
                      >
                        {testName}
                      </a>
                      <div class="sm:block hidden">
                        <CommandTooltip
                          path={testName}
                          useNodeTest={resultOption?.usesNodeTest}
                        />
                      </div>
                    </span>
                  </td>
                  {[linux, windows, darwin].map((result) => (
                    <td class="text-center">
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

function CommandTooltip(props: { path: string; useNodeTest?: boolean }) {
  const [useDev, setUseDev] = useState(false);
  const denoPath = useDev ? "./target/debug/deno" : "deno";
  const denoSubcommand = props.useNodeTest ? "test" : "run";
  const command0 =
    `NODE_TEST_KNOWN_GLOBALS=0 NODE_SKIP_FLAG_CHECK=1 ${denoPath} ${denoSubcommand} -A --unstable-bare-node-builtins --unstable-node-globals --unstable-detect-cjs --quiet tests/node_compat/runner/suite/test/${props.path}`;
  const command1 =
    `${denoPath} -A ./tools/node_compat_tests.js --filter ${props.path}`;
  const [copied0, copy0] = useCopyState(command0);
  const [copied1, copy1] = useCopyState(command1);
  const [pathCopied, copyPath] = useCopyState(props.path);
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
          onClick={copy1}
          class="text-blue-500 dark:text-blue-400"
        >
          {copied1 ? "Copied!" : "Click to copy"}
        </button>):
      </p>
      <pre class="mt-1 font-mono bg-gray-700 px-4 py-2 overflow-scroll dark:bg-gray-900">
        <code class="text-gray-200 dark:text-gray-400">{command1}</code>
      </pre>
      <p class="mt-6 px-4">
        Or, without using wrapper script (<button
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
      <p class="mt-6 px-4">
        Copy the test name to clipboard (<button
          type="button"
          onClick={copyPath}
          class="text-blue-500 dark:text-blue-400"
        >
          {pathCopied ? "Copied!" : "Click to copy"}
        </button>)
      </p>
      <pre class="mt-1 font-mono bg-gray-700 px-4 py-2 overflow-scroll dark:bg-gray-900">
        <code class="text-gray-200 dark:text-gray-400">{props.path}</code>
      </pre>
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
