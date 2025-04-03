// Copyright 2025 the Deno authors. MIT license.

import { createDefine } from "fresh";

// deno-lint-ignore no-empty-interface
export interface State {}

export const define = createDefine<State>();
