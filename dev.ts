#!/usr/bin/env -S deno run -A --watch=static/,routes/
// Copyright 2025 the Deno authors. MIT license.
import { tailwind } from "@fresh/plugin-tailwind";

import { Builder } from "fresh/dev";
import { app } from "./main.ts";

const builder = new Builder();
tailwind(builder, app, {});
if (Deno.args.includes("build")) {
  await builder.build(app);
} else {
  await builder.listen(app);
}
