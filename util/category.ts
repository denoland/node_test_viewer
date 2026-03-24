// Copyright 2025 the Deno authors. MIT license.

export const categories = [
  "assert",
  "async-hooks",
  "buffer",
  "child-process",
  "cluster",
  "console",
  "crypto",
  "debugger",
  "dgram",
  "diagnostics-channel",
  "dns",
  "domain",
  "events",
  "fs",
  "http",
  "http2",
  "https",
  "inspector",
  "module",
  "net",
  "os",
  "others",
  "path",
  "perf-hooks",
  "permission",
  "process",
  "promise",
  "querystring",
  "quic",
  "readline",
  "repl",
  "sea",
  "snapshot",
  "sqlite",
  "stdio",
  "stream",
  "string-decoder",
  "test-runner",
  "timers",
  "tls",
  "trace-events",
  "tty",
  "url",
  "util",
  "v8",
  "vm",
  "wasm",
  "web",
  "worker",
  "zlib",
] as const;

export type Category = typeof categories[number];

const prefixToCategoryMap: Record<string, Category> = {
  "test-abortcontroller": "web",
  "test-assert": "assert",
  "test-async-hooks": "async-hooks",
  "test-async-local-storage": "async-hooks",
  "test-async-wrap": "async-hooks",
  "test-blob": "web",
  "test-buffer": "buffer",
  "test-build-sea": "sea",
  "test-child-process": "child-process",
  "test-cluster": "cluster",
  "test-console": "console",
  "test-crypto": "crypto",
  "test-cwd": "process",
  "test-debugger": "debugger",
  "test-dgram": "dgram",
  "test-diagnostics-channel": "diagnostics-channel",
  "test-dns": "dns",
  "test-domain": "domain",
  "test-double-tls": "tls",
  "test-event": "events",
  "test-event-target": "web",
  "test-eventsource": "web",
  "test-eventtarget": "web",
  "test-file": "fs",
  "test-force-repl": "repl",
  "test-fs": "fs",
  "test-http": "http",
  "test-http2": "http2",
  "test-https": "https",
  "test-inspect": "util",
  "test-inspector": "inspector",
  "test-listen-fd": "net",
  "test-mime": "util",
  "test-module": "module",
  "test-net": "net",
  "test-next-tick": "process",
  "test-outgoing-message": "http",
  "test-os": "os",
  "test-path": "path",
  "test-perf-hooks": "perf-hooks",
  "test-performance": "web",
  "test-permission": "permission",
  "test-process": "process",
  "test-promise": "promise",
  "test-readable": "stream",
  "test-querystring": "querystring",
  "test-quic": "quic",
  "test-readline": "readline",
  "test-repl": "repl",
  "test-require": "module",
  "test-runner": "test-runner",
  "test-shadow-realm": "web",
  "test-single-executable": "sea",
  "test-snapshot": "snapshot",
  "test-socket": "net",
  "test-sqlite": "sqlite",
  "test-stdin": "stdio",
  "test-stdio": "stdio",
  "test-stdout": "stdio",
  "test-stream": "stream",
  "test-string-decoder": "string-decoder",
  "test-tcp": "net",
  "test-timers": "timers",
  "test-tls": "tls",
  "test-trace-events": "trace-events",
  "test-tty": "tty",
  "test-urlpattern": "web",
  "test-url": "url",
  "test-util": "util",
  "test-v8": "v8",
  "test-vm": "vm",
  "test-wasm": "wasm",
  "test-web": "web",
  "test-whatwg": "web",
  "test-worker": "worker",
  "test-zlib": "zlib",
};

const entries = Object.entries(prefixToCategoryMap).sort(([a], [b]) =>
  b.length - a.length
);

export function getTestCategory(name: string): Category {
  const dir = name.split("/")[0];

  if (dir === "pseudo-tty") {
    return "tty";
  } else if (dir === "module-hooks" || dir === "es-module") {
    return "module";
  } else if (dir === "sea") {
    return "sea";
  } else if (dir === "test-runner") {
    return "test-runner";
  }

  const basename = name.split("/").pop()!;

  for (const [prefix, category] of entries) {
    if (basename.startsWith(prefix)) {
      return category;
    }
  }
  return "others";
}

export function splitTestNamesByCategory(
  names: string[],
): [Category, string[]][] {
  const categories = {} as Record<Category, string[]>;
  for (const name of names) {
    const category = getTestCategory(name);
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(name);
  }
  return Object.entries(categories).sort(([a], [b]) => a.localeCompare(b)) as [
    Category,
    string[],
  ][];
}
