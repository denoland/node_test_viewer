// Copyright 2025 the Deno authors. MIT license.

type SingleResultOption = {
  usesNodeTest?: boolean;
};

export type SingleResult =
  | [true, null, SingleResultOption]
  | ["IGNORE", null, SingleResultOption]
  | [false, ErrorExit, SingleResultOption]
  | [false, ErrorTimeout, SingleResultOption]
  | [false, ErrorUnexpected, SingleResultOption];

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
  ignore: number;
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
