---
name: node-test-viewer
description: Project-specific knowledge for the Node Test Viewer app. Use when working on this codebase - covers Fresh 2.2.0 specifics, data flow, component patterns, and gotchas learned from hands-on development.
metadata:
  author: local
  version: "1.1"
---

# Node Test Viewer - Project-Specific Knowledge

## Fresh 2.2.0

This project uses `@fresh/core@^2.2.0` with
`@fresh/plugin-tailwind@^0.0.1-alpha.9`.

Key patterns:

- `dev.ts` entry point using `Builder` from `fresh/dev`
- `Builder.listen()` takes an async function returning the app (not the app
  directly)
- `tailwind(builder, {})` - 2 args (builder + options), NOT 3 args
- `app.fsRoutes("/")` is a method on the App instance (not a standalone import)
- `jsxPrecompileSkipElements` in deno.json must include: a, img, source, body,
  html, head, title, meta, script, link, style, base, noscript, template

### Migration Notes (from alpha.29 to 2.2.0)

If migrating from an older alpha version:

1. `fsRoutes` is no longer a standalone export - use `app.fsRoutes("/")`
2. `Builder.listen` signature changed - pass a function, not the app
3. `tailwind()` dropped the `app` parameter - just `tailwind(builder, {})`
4. `jsxPrecompileSkipElements` must include additional HTML elements
5. Run `deno update` to update all deps, then fix type errors one by one

## Data Flow

1. Test data lives at `https://dl.deno.land/node-compat-test/`
2. `util/report.ts` fetches gzip-compressed JSON files for each OS/date
3. `WeakValueMap` caching prevents refetching (with NOT_FOUND sentinel)
4. Three OSes: linux, windows, darwin
5. `MonthSummary` -> `DaySummary` (metadata only) -> `DayReport` (full results)

## Component Architecture

### Islands (ship JS to browser)

- `ReportTable.tsx` - Accordion-style test results table with expand/collapse
  per category
- `SummaryTable.tsx` - Clickable rows on home page
- `Chart.tsx` - ApexCharts line chart (loaded dynamically from CDN)
- `ResultByCategoryChart.tsx` - Horizontal stacked bar chart

### Components (server-rendered only)

- `DenoVersion.tsx` - Links canary versions to GitHub commits
- `LinkToJsonAndErrors.tsx` - Links to raw data endpoints

### Key: Islands receive full `DayReport` as props

The `DayReport` object (containing all test results for all OSes) is serialized
and sent to islands. This works because Fresh serializes props for hydration.
Keep this in mind - the full report data is shipped to the client.

## Test Categories

44 categories defined in `util/category.ts`. Categorization logic:

- Special dirs: `pseudo-tty` -> tty, `module-hooks`/`es-module` -> module
- Prefix matching on filename (longest prefix wins)
- Fallback: "others"

## Styling Conventions

- Dark mode: `dark:` prefix classes, detected via `prefers-color-scheme`
- Status colors: green-500/400 (PASS), red-500/400 (FAIL), gray-500/400 (IGNORE)
- Layout: `w-full sm:w-4/5 mx-auto` for content width
- Borders: `border-dashed` for section dividers
- Font: `font-mono` for test names, data values

## Formatting Gotchas

- `deno fmt` reformats SVG files in `static/` - this is pre-existing and
  harmless
- Always run `deno fmt` before committing, but the SVG diffs are expected
- The `deno task check` command includes `deno fmt --check` which will flag SVGs

## ApexCharts Loading

Charts are loaded dynamically from CDN in `useEffect`:

```tsx
const { default: ApexCharts } = await import("https://esm.sh/apexcharts@4.5.0");
```

This avoids bundling the large library. The type definitions come from a
separate skypack URL.

## Common Operations

### Adding a new route

Create `routes/path.tsx` with handler and page exports using `define.handlers()`
and `define.page<typeof handler>()`.

### Adding interactivity

Create island in `islands/` folder. Props must be serializable (no functions).
Import and use in routes - Fresh handles hydration automatically.

### Running locally

```bash
deno task dev  # http://localhost:8000
```

### Checking before commit

```bash
deno fmt && deno task check
```
