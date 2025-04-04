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
        <div class="w-full">
          <Header />
          <Component />
          <Footer />
        </div>
      </body>
    </html>
  );
}

function Header() {
  return (
    <div class="w-full flex justify-between items-center px-2 sm:px-7 py-3 border-b border-dashed">
      <h1 class="text-md font-semibold">
        <a href="/">
          <img class="h-8 inline mr-1" src="/node-deno.svg" /> Node test viewer
        </a>
      </h1>
    </div>
  );
}

function Footer() {
  return (
    <div class="py-5 text-sm text-center">
      <a
        class="text-blue-500"
        href="https://github.com/denoland/node_test_viewer"
        target="_blank"
      >
        source of this page
      </a>
      ・
      <a
        class="text-blue-500"
        href="https://github.com/denoland/deno"
        target="_blank"
      >
        deno
      </a>
    </div>
  );
}
