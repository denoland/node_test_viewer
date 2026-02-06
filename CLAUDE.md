# Node Test Viewer

A web app that tracks daily Node.js compatibility test results run with the Deno
runtime. Live at: https://node-test-viewer.deno.dev/

## Tech Stack

- **Runtime:** Deno
- **Framework:** Fresh 2.2.0 - file-based routing, island architecture
- **UI:** Preact + Preact Signals
- **Styling:** Tailwind CSS v4 with dark mode (`prefers-color-scheme`)
- **Charts:** ApexCharts (loaded dynamically from CDN)
- **Data source:** gzip JSON files from `https://dl.deno.land/node-compat-test/`

## Commands

```sh
deno task dev      # Dev server with hot reload (http://localhost:8000)
deno task build    # Production build
deno task start    # Start production server
deno task check    # Format + lint + type check
deno update        # Update all dependencies to latest compatible versions
```

Always run `deno fmt` before committing. Note: `deno fmt` reformats SVG files in
`static/` - this is pre-existing and harmless, the diffs are expected.

## Project Structure

```
routes/                  # File-based routing (Fresh)
  _app.tsx              # Root layout (header, footer)
  index.tsx             # Home page - summary table + charts
  results/
    [date].tsx          # Day detail page (/results/:date or /results/latest)
    [date]/
      [os].json.tsx     # JSON API for single OS report
      [os].errors.txt.tsx  # Error summary text endpoint
islands/                 # Interactive client-side components (ship JS)
  Chart.tsx             # ApexCharts line chart (pass rates over time)
  SummaryTable.tsx      # Clickable summary table on home page
  ReportTable.tsx       # Accordion-style test results with expand/collapse
  ResultByCategoryChart.tsx  # Heatmap + treemap toggle chart by category
components/              # Server-rendered components (no JS shipped)
  DenoVersion.tsx       # Shows Deno version, links to canary commits
  LinkToJsonAndErrors.tsx  # Links to JSON/errors endpoints
util/
  types.ts              # Core types: SingleResult, TestReport, DayReport, etc.
  report.ts             # Data fetching + caching (WeakValueMap)
  category.ts           # 44 test categories, prefix-to-category mapping
  fresh.ts              # Fresh createDefine() wrapper
  date.ts               # Date utilities
  colorScheme.ts        # Dark mode detection
static/
  styles.css            # Tailwind v4 entry (@import "tailwindcss")
```

## Fresh 2.2.0 Patterns

- `dev.ts` entry point using `Builder` from `fresh/dev`
- `Builder.listen()` takes an async function returning the app (not the app
  directly)
- `tailwind(builder, {})` - 2 args (builder + options), NOT 3
- `app.fsRoutes("/")` is a method on the App instance (not a standalone import)
- `jsxPrecompileSkipElements` in deno.json must include: a, img, source, body,
  html, head, title, meta, script, link, style, base, noscript, template
- `@fresh/plugin-tailwind@0.0.1-alpha.9` uses `@tailwindcss/postcss` v4
  internally
- `nodeModulesDir: "auto"` in deno.json required for PostCSS resolver

## Key Patterns

- **Islands architecture:** Only `islands/` components ship JS to browser.
  Everything else is server-rendered. Props must be serializable (no functions).
- **Data fetching:** `getReportForDate(date)` fetches all 3 OS reports in
  parallel. Uses `WeakValueMap` for GC-friendly caching with NOT_FOUND sentinel.
- **Categories:** 44 test categories in `util/category.ts`. Tests are
  categorized by filename prefix (longest prefix wins, fallback: "others").
  `splitTestNamesByCategory()` groups test names.
- **Types:** `DayReport` = `{ date, linux?, windows?, darwin? }` where each OS
  is a `TestReport` with `results: Record<string, SingleResult>`.
- **SingleResult:** Tuple `[pass/fail/"IGNORE", error|null, options]`.
- **Three OSes tracked:** linux, windows, darwin.
- **Charts loaded from CDN:** ApexCharts imported dynamically in `useEffect` to
  avoid bundling. Types from a separate skypack URL.

## Routing

| URL Pattern                     | File                                        | Description                              |
| ------------------------------- | ------------------------------------------- | ---------------------------------------- |
| `/`                             | `routes/index.tsx`                          | Home: latest results + historical charts |
| `/results/:date`                | `routes/results/[date].tsx`                 | Day detail: charts + accordion table     |
| `/results/:date/:os.json`       | `routes/results/[date]/[os].json.tsx`       | Raw JSON API                             |
| `/results/:date/:os.errors.txt` | `routes/results/[date]/[os].errors.txt.tsx` | Error summary                            |

## Styling

- Tailwind v4 with dark mode via `prefers-color-scheme` (media strategy)
- Color conventions: green=PASS, red=FAIL, gray=IGNORE/N/A
- Responsive: `sm:` breakpoints for desktop, mobile-first defaults
- Layout: `w-full sm:w-4/5 mx-auto` for content width

## Common Operations

**Adding a new route:** Create `routes/path.tsx` with handler and page exports
using `define.handlers()` and `define.page<typeof handler>()`.

**Adding interactivity:** Create island in `islands/` folder. Props must be
serializable. Import and use in routes - Fresh handles hydration automatically.
