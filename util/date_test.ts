// Copyright 2025 the Deno authors. MIT license.
import { assertEquals } from "@std/assert";
import { daysAgo } from "./date.ts";

Deno.test("daysAgo", () => {
  const today = new Date();
  const expectedDate = new Date(today);
  expectedDate.setDate(today.getDate() - 5);
  const expectedString = expectedDate.toISOString().split("T")[0];

  assertEquals(daysAgo(5), expectedString);
});
