// Copyright 2025 the Deno authors. MIT license.

import type { DayReport, SingleResult, TestReport } from "util/types.ts";
import { splitTestNamesByCategory } from "util/category.ts";
import { DenoVersion } from "components/DenoVersion.tsx";

const TEST_NAME_COLSPAN = 2;

export function ReportTable(props: { class?: string; report: DayReport }) {
  const { report } = props;

  const testCategories = splitTestNamesByCategory(getTestNames(report));
  const nodeVersion = getNodeVersion(report);

  return (
    <table
      class={`border-collapse table-fixed ${props.class ?? ""}`}
    >
      <tr>
        <th class="align-bottom" colSpan={TEST_NAME_COLSPAN}></th>
        <th class="align-top">
          Linux<br />
          <span class="font-bold">
            <Summary data={report.linux} />
          </span>
          <br />
          <p class="font-normal font-mono text-sm text-gray-700">
            rev <DenoVersion version={report.linux?.denoVersion} />
          </p>
        </th>
        <th>
          Windows<br />
          <span class="font-bold">
            <Summary data={report.windows} />
          </span>
          <br />
          <p class="font-normal font-mono text-sm text-gray-700">
            rev <DenoVersion version={report.windows?.denoVersion} />
          </p>
        </th>
        <th>
          Darwin<br />
          <span class="font-bold">
            <Summary data={report.darwin} />
          </span>
          <br />
          <p class="font-normal font-mono text-sm text-gray-700">
            rev <DenoVersion version={report.darwin?.denoVersion} />
          </p>
        </th>
      </tr>
      {testCategories.map(([category, testNames]) => {
        testNames.sort();
        const linux = report.linux;
        const windows = report.windows;
        const darwin = report.darwin;
        return (
          <>
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
                <tr key={testName} class="border-t border-gray-300 font-mono">
                  <td
                    colSpan={TEST_NAME_COLSPAN}
                    class="text-xs py-1 whitespace-nowrap overflow-scroll px-1"
                  >
                    <a
                      href={`https://github.com/nodejs/node/blob/v${nodeVersion}/test/${testName}`}
                      class="hover:text-blue-500"
                      target="_blank"
                    >
                      {testName}
                    </a>
                  </td>
                  {[linux, windows, darwin].map((result) => (
                    <td class="text-center">
                      <Result result={result} />
                    </td>
                  ))}
                </tr>
              );
            })}
          </>
        );
      })}
    </table>
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
  if (result[0]) {
    return <span class="text-green-500">PASS</span>;
  }
  const error = result[1];
  if (error) {
    if ("code" in error) {
      return (
        <span class="text-red-500 relative group">
          FAIL<Tooltip text={error.stderr} />
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

function Tooltip(props: { text: string }) {
  return (
    <pre class="absolute w-[50vw] top-[18px] left-1/2 translate-x-[-65%] overflow-scroll px-4 py-2 text-xs font-mono text-left hidden group-hover:block text-white bg-gray-800 border border-gray-900 rounded shadow-lg z-10">
      {props.text}
    </pre>
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
