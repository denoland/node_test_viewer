// Copyright 2025 the Deno authors. MIT license.

/** Returns a string representing the date n days ago in YYYY-MM-DD format */
export function daysAgo(n: number): string {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date.toISOString().split("T")[0];
}
