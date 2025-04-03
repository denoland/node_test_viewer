// Copyright 2025 the Deno authors. MIT license.

import type { PageProps } from "fresh";

export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Node test viewer</title>
        <link rel="stylesheet" href="/styles.css" />
        <link rel="icon" href="/node.svg" />
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
