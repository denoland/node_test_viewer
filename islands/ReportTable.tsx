// Copyright 2025 the Deno authors. MIT license.

import type { DayReport, SingleResult, TestReport } from "util/types.ts";
import {} from "util/report.ts";
import { splitTestNamesByCategory } from "util/category.ts";
import { DenoVersion } from "components/DenoVersion.tsx";
import { LinkToJsonAndErrors } from "components/LinkToJsonAndErrors.tsx";
import { ComponentChildren } from "preact";
import { useState } from "preact/hooks";

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
            <p class="font-normal font-mono text-sm text-gray-700">
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
            <p class="font-normal font-mono text-sm text-gray-700">
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
            <p class="font-normal font-mono text-sm text-gray-700">
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
          <tbody key={category}>
            <tr class="text-center bg-gray-50 border-t border-gray-300">
              <td
                colSpan={TEST_NAME_COLSPAN}
                class="text-sm font-bold text-left py-1 px-3"
              >
                {category}
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

              return (
                <tr
                  key={testName}
                  class="border-t border-gray-300 font-mono"
                >
                  <td
                    colSpan={TEST_NAME_COLSPAN}
                    class="text-xs py-1 whitespace-nowrap sm:overflow-visible overflow-scroll px-1"
                  >
                    <span class="relative group">
                      <a
                        href={`https://github.com/nodejs/node/blob/v${nodeVersion}/test/${testName}`}
                        class="hover:text-blue-500"
                        target="_blank"
                      >
                        {testName}
                      </a>
                      <div class="sm:block hidden">
                        <CommandTooltip path={testName} />
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
      <span class="text-gray-500 text-sm font-normal">
        N/A
      </span>
    );
  }
  return (
    <span class="text-gray-500 text-sm font-normal">
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
    return <span class="text-gray-400">N/A</span>;
  }
  if (result[0] === true) {
    return <span class="text-green-500">PASS</span>;
  }
  if (result[0] === "IGNORE") {
    return <span class="text-gray-500">IGNORE</span>;
  }
  const error = result[1];
  if (error) {
    if ("code" in error) {
      return (
        <span class="text-red-500 relative group">
          FAIL<Tooltip
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
        <span class="text-red-500 relative group">
          T/O<Tooltip text={`Timed out after ${error.timeout}ms`} />
        </span>
      );
    } else if ("message" in error) {
      return (
        <span class="text-red-500 relative group">
          FAIL<Tooltip text={error.message} />
        </span>
      );
    }
  }

  return <span class="text-gray-400">INVL</span>;
}

function Tooltip(props: { text: ComponentChildren; class?: string }) {
  return (
    <pre class="absolute w-[50vw] top-[18px] left-1/2 translate-x-[-65%] overflow-scroll px-4 py-2 text-xs font-mono text-left hidden group-hover:block text-white bg-gray-800 border border-gray-900 rounded shadow-lg z-10">
      {props.text}
    </pre>
  );
}
function CommandTooltip(props: { path: string; useNodeTest?: boolean }) {
  const [copied0, setCopied0] = useState(false);
  const [copied1, setCopied1] = useState(false);
  const command0 =
    `NODE_TEST_KNOWN_GLOBALS=0 NODE_SKIP_FLAG_CHECK=1 deno run -A --unstable-bare-node-builtins --unstable-node-globals --unstable-detect-cjs --quiet tests/node_compat/runner/suite/test/${props.path}`;
  const command1 = `./tools/node_compat_tests.js --filter ${props.path}`;
  const copy0 = () => {
    navigator.clipboard.writeText(command0);
    setCopied0(true);
    setTimeout(() => {
      setCopied0(false);
    }, 2000);
  };
  const copy1 = () => {
    navigator.clipboard.writeText(command1);
    setCopied1(true);
    setTimeout(() => {
      setCopied1(false);
    }, 2000);
  };
  return (
    <div class="absolute w-[50vw] top-[14px] left-0 overflow-scroll px-4 py-3 text-xs font-mono text-left hidden group-hover:block text-white bg-gray-800 border border-gray-900 rounded shadow-lg z-10">
      You can run this test with the command below (<button
        type="button"
        onClick={copy1}
        class="text-blue-500"
      >
        {copied1 ? "Copied!" : "Click to copy"}
      </button>):
      <br />
      <br />
      <pre class="font-mono border border-gray-500 rounded px-4 py-2 overflow-scroll">
        <code class="text-gray-200">{command1}</code>
      </pre>
      <br />
      <br />
      Or, without using wrapper script (<button
        type="button"
        onClick={copy0}
        class="text-blue-500"
      >
        {copied0 ? "Copied!" : "Click to copy"}
      </button>):
      <br />
      <br />
      <pre class="font-mono border border-gray-500 rounded px-4 py-2 overflow-scroll">
        <code class="text-gray-200">{command0}</code>
      </pre>
    </div>
  );
}

function Summary(
  props: { data: { pass: number; total: number } | undefined },
) {
  if (!props.data) {
    return (
      <span class="font-normal font-mono text-sm text-gray-700">
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
      <span class="text-gray-600 text-xs sm:text-[smaller] ml-1">
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
