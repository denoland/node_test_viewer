// Copyright 2025 the Deno authors. MIT license.

import { getTestCategory } from "./category.ts";

Deno.test("getTestCategory()", () => {
  const testCases = [
    ["parallel/test-assert.js", "assert"],
    ["paralle/test-crypto.js", "crypto"],
    ["parallel/test-http.js", "http"],
    ["parallel/test-unknown.js", "others"],
    ["es-module/test-foo.js", "module"],
  ];

  for (const [input, expected] of testCases) {
    const result = getTestCategory(input);
    if (result !== expected) {
      throw new Error(
        `Expected ${input} to be in category ${expected}, but got ${result}`,
      );
    }
  }
});
