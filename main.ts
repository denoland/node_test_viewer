// Copyright 2025 the Deno authors. MIT license.

import { App, fsRoutes, staticFiles } from "fresh";
import { define, type State } from "util/fresh.ts";

export const app = new App<State>();
app.use(staticFiles());

const loggerMiddleware = define.middleware((ctx) => {
  console.log(`${ctx.req.method} ${ctx.req.url}`);
  return ctx.next();
});
app.use(loggerMiddleware);

await fsRoutes(app, {
  dir: "./",
  loadIsland: (path) => import(`./islands/${path}`),
  loadRoute: (path) => import(`./routes/${path}`),
});

if (import.meta.main) {
  await app.listen();
}
