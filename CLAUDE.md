# Node Test Viewer

A web app that tracks daily Node.js compatibility test results run with the Deno
runtime. Live at: https://node-test-viewer.deno.dev/

## Tech Stack

- **Runtime:** Deno
- **Framework:** Fresh 2.x (alpha.29) - file-based routing, island architecture
- **UI:** Preact + Preact Signals
- **Styling:** Tailwind CSS 3.4 with dark mode (`darkMode: "media"`)
- **Charts:** ApexCharts (loaded from CDN)
- **Data source:** gzip JSON files from `https://dl.deno.land/node-compat-test/`

## Commands

```sh
deno task dev      # Dev server with hot reload (http://localhost:8000)
deno task build    # Production build
deno task start    # Start production server
deno task check    # Format + lint + type check
```

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
  ReportTable.tsx       # Detailed test results table with categories
  ResultByCategoryChart.tsx  # Horizontal stacked bar chart by category
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
  styles.css            # Tailwind directives
  node-deno.svg         # Logo
```

## Key Patterns

- **Islands architecture:** Only `islands/` components ship JS to browser.
  Everything else is server-rendered.
- **Data fetching:** `getReportForDate(date)` fetches all 3 OS reports in
  parallel. Uses `WeakValueMap` for GC-friendly caching.
- **Categories:** 44 test categories in `util/category.ts`. Tests are
  categorized by filename prefix. `splitTestNamesByCategory()` groups test
  names.
- **Types:** `DayReport` = `{ date, linux?, windows?, darwin? }` where each OS
  is a `TestReport` with `results: Record<string, SingleResult>`.
- **SingleResult:** Tuple `[pass/fail/"IGNORE", error|null, options]`.
- **Three OSes tracked:** linux, windows, darwin.

## Routing

| URL Pattern                     | File                                        | Description                              |
| ------------------------------- | ------------------------------------------- | ---------------------------------------- |
| `/`                             | `routes/index.tsx`                          | Home: latest results + historical charts |
| `/results/:date`                | `routes/results/[date].tsx`                 | Day detail: category chart + test table  |
| `/results/:date/:os.json`       | `routes/results/[date]/[os].json.tsx`       | Raw JSON API                             |
| `/results/:date/:os.errors.txt` | `routes/results/[date]/[os].errors.txt.tsx` | Error summary                            |

## Styling

- Tailwind with dark mode via OS media query
- Color conventions: green=PASS, red=FAIL, gray=IGNORE/N/A
- Responsive: `sm:` breakpoints for desktop, mobile-first defaults
