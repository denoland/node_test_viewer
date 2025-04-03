// Copyright 2025 the Deno authors. MIT license.

export type SingleResult = [
  pass: boolean,
  error?: ErrorExit | ErrorTimeout | ErrorUnexpected,
];
type ErrorExit = {
  code: number;
  stderr: string;
};
type ErrorTimeout = {
  timeout: number;
};
type ErrorUnexpected = {
  message: string;
};

/** The metadata of the test report */
export type TestReportMetadata = {
  date: string;
  denoVersion: string;
  os: string;
  arch: string;
  nodeVersion: string;
  runId: string | null;
  total: number;
  pass: number;
};

/** The test report format, which is stored in JSON file */
export type TestReport = TestReportMetadata & {
  results: Record<string, SingleResult>;
};

export type DayReport = {
  date: string;
  windows: TestReport | undefined;
  linux: TestReport | undefined;
  darwin: TestReport | undefined;
};

export type DaySummary = {
  date: string;
  windows: TestReportMetadata | undefined;
  linux: TestReportMetadata | undefined;
  darwin: TestReportMetadata | undefined;
};

export type MonthSummary = {
  reports: Record<string, DaySummary>;
  month: string;
};
