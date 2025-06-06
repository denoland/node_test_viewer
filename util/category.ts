// Copyright 2025 the Deno authors. MIT license.

export const categories = [
  "assert",
  "buffer",
  "child-process",
  "cluster",
  "console",
  "crypto",
  "dgram",
  "dns",
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
  "process",
  "promise",
  "querystring",
  "quic",
  "readline",
  "repl",
  "sqlite",
  "stdio",
  "stream",
  "string-decoder",
  "timers",
  "tls",
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
  "test-blob": "web",
  "test-buffer": "buffer",
  "test-child-process": "child-process",
  "test-cluster": "cluster",
  "test-console": "console",
  "test-crypto": "crypto",
  "test-cwd": "process",
  "test-dgram": "dgram",
  "test-dns": "dns",
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
  "test-performance": "web",
  "test-process": "process",
  "test-promise": "promise",
  "test-readable": "stream",
  "test-querystring": "querystring",
  "test-quic": "quic",
  "test-readline": "readline",
  "test-repl": "repl",
  "test-require": "module",
  "test-shadow-realm": "web",
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
