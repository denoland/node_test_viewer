#!/usr/bin/env -S deno run -A --watch=static/,routes/
// Copyright 2025 the Deno authors. MIT license.
import { tailwind } from "@fresh/plugin-tailwind";

import { Builder } from "fresh/dev";

const builder = new Builder();

const importApp = async () => {
  const { app } = await import("./main.ts");
  tailwind(builder, {});
  return app;
};

if (Deno.args.includes("build")) {
  const applySnapshot = await builder.build();
  const app = await importApp();
  applySnapshot(app);
} else {
  await builder.listen(importApp);
}
