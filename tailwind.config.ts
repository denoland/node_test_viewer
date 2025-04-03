// Copyright 2025 the Deno authors. MIT license.

import type { Config } from "tailwindcss";

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx}",
  ],
} satisfies Config;
