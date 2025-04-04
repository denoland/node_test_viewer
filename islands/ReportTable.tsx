// Copyright 2025 the Deno authors. MIT license.

import type { DayReport, SingleResult, TestReport } from "util/types.ts";
import { DenoVersion } from "components/DenoVersion.tsx";

export function ReportTable(props: { class?: string; report: DayReport }) {
  const { report } = props;

  const testNames = getTestNames(report);
  const nodeVersion = getNodeVersion(report);

  return (
    <table
      class={`border-collapse table-fixed ${props.class ?? ""}`}
    >
      <tr>
        <th class="align-bottom" colSpan={2}>Test file</th>
        <th class="align-top">
          Linux<br />
          <Summary report={report.linux} />
          <br />
          <p class="font-normal text-sm text-gray-700">
            rev <DenoVersion version={report.linux?.denoVersion} />
          </p>
        </th>
        <th>
          Windows<br />
          <Summary report={report.windows} />
          <br />
          <p class="font-normal text-sm text-gray-700">
            rev <DenoVersion version={report.windows?.denoVersion} />
          </p>
        </th>
        <th>
          Darwin<br />
          <Summary report={report.darwin} />
          <br />
          <p class="font-normal text-sm text-gray-700">
            rev <DenoVersion version={report.darwin?.denoVersion} />
          </p>
        </th>
      </tr>
      {testNames.map((testName) => {
        const linux = report.linux?.results[testName];
        const windows = report.windows?.results[testName];
        const darwin = report.darwin?.results[testName];

        return (
          <tr key={testName} class="border-t border-gray-300 font-mono">
            <td colSpan={2} class="text-xs py-1 whitespace-nowrap">
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

function Summary(props: { report: TestReport | undefined }) {
  if (!props.report) {
    return (
      <span class="font-normal text-sm text-gray-700">
        N/A
      </span>
    );
  }
  const { total, pass } = props.report;
  return (
    <span class="font-normal text-sm text-gray-700">
      {pass}/{total} ({(pass / total * 100).toFixed(2)}%)
    </span>
  );
}
