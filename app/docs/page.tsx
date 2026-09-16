import Link from 'next/link';
import { THEMES, CardTheme } from '@/lib/themes';

export const metadata = {
  title: 'API Reference',
  description:
    'Complete GitGlyph API reference: every endpoint, query parameter, theme palette, response shape, error handling, rate limits, and embed examples.',
};

type ParamDoc = {
  name: string;
  type: string;
  defaultSource: string;
  allowed: string;
  description: string;
  appliesTo?: string[];
};

type EndpointDoc = {
  id: string;
  method: 'GET';
  path: string;
  summary: string;
  dataSource: string;
  response: string;
  dimensions: string;
  exampleUrl: string;
  params: ParamDoc[];
};

const ENDPOINTS: EndpointDoc[] = [
  {
    id: 'stats',
    method: 'GET',
    path: '/api/stats',
    summary:
      'Aggregated GitHub profile metrics: total stars earned across your owned repositories, total commits in the past year, total PRs opened, total issues opened, public repo count, and follower count.',
    dataSource:
      'GitHub GraphQL `user(login).contributionsCollection` + `repositories(first: 100)` query. Falls back to REST `/users/{login}` if the GraphQL call fails or no token is configured (loses star/commit/PR/issue detail in fallback mode).',
    response:
      'SVG image (image/svg+xml). Horizontal layout is 450×195 viewBox units; vertical is 320×285. Responsive by default — drops width/height and scales fluidly to any container. Pass ?width=N (200–4000) to lock to a fixed intrinsic size.',
    dimensions: '450×195 (horizontal) · 320×285 (vertical)',
    exampleUrl: '/api/stats?theme=tokyo-night',
    params: [
      {
        name: 'username',
        type: 'string',
        defaultSource: 'GITHUB_USERNAME env',
        allowed: 'any GitHub login',
        description:
          'Per-request override. Defaults to the GITHUB_USERNAME environment variable, then hardcoded "ahmedtrooper" if neither is set.',
      },
      {
        name: 'theme',
        type: 'string',
        defaultSource: "'light'",
        allowed: 'light, dark, tokyo-night, dracula, nord, radical, catppuccin',
        description: 'Preset color palette. See the Themes section below for hex values.',
      },
      {
        name: 'layout',
        type: 'string',
        defaultSource: "'horizontal'",
        allowed: 'horizontal, vertical',
        description:
          'Stats card orientation. Vertical stacks all 6 metrics in a single column (320×285), ideal for narrow sidebars.',
      },
      {
        name: 'custom_title',
        type: 'string',
        defaultSource: "{name}'s GitHub Stats",
        allowed: 'any string (≤38 chars)',
        description:
          'Overrides the card header text. Auto-generated from the user\'s GitHub `name` field, falling back to their `login`. Truncated with an ellipsis past 38 characters.',
      },
      {
        name: 'hide_border',
        type: 'boolean',
        defaultSource: "'false'",
        allowed: 'true, false',
        description:
          'Hides the outer 1px stroke so the card blends seamlessly into a parent background of the same color.',
      },
      {
        name: 'bg_color',
        type: 'hex string',
        defaultSource: 'Theme bg',
        allowed: '3, 6, or 8-digit hex (no #)',
        description: 'Override the card background fill. Pass the hex without the leading # (e.g. 1a1b26).',
      },
      {
        name: 'border_color',
        type: 'hex string',
        defaultSource: 'Theme border',
        allowed: '3, 6, or 8-digit hex (no #)',
        description: 'Override the outer border stroke color (ignored if hide_border=true).',
      },
      {
        name: 'title_color',
        type: 'hex string',
        defaultSource: 'Theme title',
        allowed: '3, 6, or 8-digit hex (no #)',
        description: 'Override the header title text color.',
      },
      {
        name: 'text_color',
        type: 'hex string',
        defaultSource: 'Theme text',
        allowed: '3, 6, or 8-digit hex (no #)',
        description:
          'Override both body label color and stat-value bold color. Metric values reuse the same hex.',
      },
      {
        name: 'width',
        type: 'integer',
        defaultSource: 'Responsive (no width attr)',
        allowed: '200–4000',
        description:
          'Optional fixed pixel width. Overrides responsive scaling for badge-style embeds. Out-of-range or non-numeric values silently fall back to fluid.',
      },
    ],
  },
  {
    id: 'streak',
    method: 'GET',
    path: '/api/streak',
    summary:
      'Contribution streak metrics: total contributions in the past year, current consecutive-day streak with start/end dates, and all-time longest streak with its date range.',
    dataSource:
      'GitHub GraphQL `user(login).contributionsCollection.contributionCalendar.weeks.contributionDays` query. Streaks are computed client-side from the per-day count array.',
    response:
      'SVG image (image/svg+xml). Horizontal layout is 450×195 viewBox units; vertical is 320×270. Same responsive + ?width= rules as the stats card.',
    dimensions: '450×195 (horizontal) · 320×270 (vertical)',
    exampleUrl: '/api/streak?theme=dracula&layout=vertical',
    params: [
      {
        name: 'username',
        type: 'string',
        defaultSource: 'GITHUB_USERNAME env',
        allowed: 'any GitHub login',
        description: 'Per-request username override. Same fallback chain as /api/stats.',
      },
      {
        name: 'theme',
        type: 'string',
        defaultSource: "'light'",
        allowed: 'light, dark, tokyo-night, dracula, nord, radical, catppuccin',
        description: 'Preset palette.',
      },
      {
        name: 'layout',
        type: 'string',
        defaultSource: "'horizontal'",
        allowed: 'horizontal, vertical',
        description: 'Vertical stacks Total / Current / Max streaks in a single column (320×270).',
      },
      {
        name: 'custom_title',
        type: 'string',
        defaultSource: "{name}'s Contribution Streak",
        allowed: 'any string (≤38 chars)',
        description: 'Overrides the card header text.',
      },
      {
        name: 'hide_border',
        type: 'boolean',
        defaultSource: "'false'",
        allowed: 'true, false',
        description: 'Hide the outer border stroke.',
      },
      {
        name: 'bg_color / border_color / title_color / text_color',
        type: 'hex string',
        defaultSource: 'Theme defaults',
        allowed: '3, 6, or 8-digit hex (no #)',
        description: 'Per-color overrides. Same semantics as /api/stats.',
      },
      {
        name: 'width',
        type: 'integer',
        defaultSource: 'Responsive',
        allowed: '200–4000',
        description: 'Optional fixed pixel width.',
      },
    ],
  },
  {
    id: 'languages',
    method: 'GET',
    path: '/api/languages',
    summary:
      "Top 5 programming languages by total bytes across your owned non-fork repositories, with each language's percentage of the total and its GitHub-assigned color.",
    dataSource:
      'GitHub GraphQL `user(login).repositories(first: 100, isFork: false, orderBy: STARGAZERS DESC).languages(first: 8, orderBy: SIZE DESC)` query. Bytes are summed per language across all 100 repos, then top 5 are returned with their percent of total.',
    response:
      'SVG image (image/svg+xml). Single layout, 450×195 viewBox units. Shows a proportional color bar plus a 2-column legend with name and percent.',
    dimensions: '450×195',
    exampleUrl: '/api/languages?theme=nord',
    params: [
      {
        name: 'username',
        type: 'string',
        defaultSource: 'GITHUB_USERNAME env',
        allowed: 'any GitHub login',
        description: 'Per-request username override.',
      },
      {
        name: 'theme',
        type: 'string',
        defaultSource: "'light'",
        allowed: 'light, dark, tokyo-night, dracula, nord, radical, catppuccin',
        description: 'Preset palette.',
      },
      {
        name: 'custom_title',
        type: 'string',
        defaultSource: "{name}'s Top Languages",
        allowed: 'any string (≤38 chars)',
        description: 'Overrides the card header text.',
      },
      {
        name: 'hide_border',
        type: 'boolean',
        defaultSource: "'false'",
        allowed: 'true, false',
        description: 'Hide the outer border stroke.',
      },
      {
        name: 'bg_color / border_color / title_color / text_color',
        type: 'hex string',
        defaultSource: 'Theme defaults',
        allowed: '3, 6, or 8-digit hex (no #)',
        description: 'Per-color overrides.',
      },
      {
        name: 'width',
        type: 'integer',
        defaultSource: 'Responsive',
        allowed: '200–4000',
        description: 'Optional fixed pixel width.',
      },
    ],
  },
  {
    id: 'pin',
    method: 'GET',
    path: '/api/pin',
    summary:
      "Single-repository card with name, description, primary language with its color, star count, fork count, and a \"Public\"/\"Fork\" badge derived from the repo's visibility.",
    dataSource:
      'GitHub GraphQL `repository(owner, name)` query. Takes either `repo=owner/name` or just `repo=name` (in which case owner falls back to GITHUB_USERNAME env, then "ahmedtrooper").',
    response:
      'SVG image (image/svg+xml). Single layout, 450×140 viewBox units. The badge in the top-right says "Fork" for forked repos, "Public" for non-fork public repos — never includes a "PUBLIC" pill (the repo card\'s own badge already signals its visibility).',
    dimensions: '450×140',
    exampleUrl: '/api/pin?repo=AhmedTrooper/GitGlyph&theme=catppuccin',
    params: [
      {
        name: 'repo',
        type: 'string',
        defaultSource: 'GITHUB_REPO env',
        allowed: '"name" or "owner/name"',
        description:
          'Required. If just "name" is passed, owner resolves from GITHUB_USERNAME env. If "owner/name" is passed, both are extracted directly. Required env or query.',
      },
      {
        name: 'username',
        type: 'string',
        defaultSource: 'GITHUB_USERNAME env',
        allowed: 'any GitHub login',
        description: 'Used as owner only when ?repo is just a name (no slash).',
      },
      {
        name: 'theme',
        type: 'string',
        defaultSource: "'light'",
        allowed: 'light, dark, tokyo-night, dracula, nord, radical, catppuccin',
        description: 'Preset palette.',
      },
      {
        name: 'custom_title',
        type: 'string',
        defaultSource: 'repo.name',
        allowed: 'any string (≤38 chars)',
        description: 'Overrides the card header (defaults to the repo name).',
      },
      {
        name: 'hide_border',
        type: 'boolean',
        defaultSource: "'false'",
        allowed: 'true, false',
        description: 'Hide the outer border stroke.',
      },
      {
        name: 'bg_color / border_color / title_color / text_color',
        type: 'hex string',
        defaultSource: 'Theme defaults',
        allowed: '3, 6, or 8-digit hex (no #)',
        description: 'Per-color overrides.',
      },
      {
        name: 'width',
        type: 'integer',
        defaultSource: 'Responsive',
        allowed: '200–4000',
        description: 'Optional fixed pixel width.',
      },
    ],
  },
];

const RESPONSE_HEADERS = [
  {
    name: 'Content-Type',
    value: 'image/svg+xml; charset=utf-8',
    note: 'Always. Even error responses are valid SVG so the README embed shows a styled error card instead of a broken image.',
  },
  {
    name: 'Cache-Control',
    value: 'public, max-age=0, s-maxage=18000, stale-while-revalidate=86400',
    note: 'Success path. Browser cache disabled, but Vercel Edge CDN caches for 5 hours (18000s) and serves stale for 24h while revalidating in the background. Zero compute hours per README view.',
  },
  {
    name: 'Cache-Control',
    value: 'no-cache, no-store, must-revalidate',
    note: 'Error path. Never cached — the next request retries the upstream immediately.',
  },
];

const ENV_VARS = [
  {
    name: 'GITHUB_TOKEN',
    required: true,
    description:
      'A GitHub Personal Access Token. A classic PAT with 0 scopes (no checkboxes ticked) is sufficient and recommended — it raises the rate limit from 60 to 5,000 requests/hour and only reads public data. Fine-grained tokens also work but offer no advantage here.',
  },
  {
    name: 'GITHUB_USERNAME',
    required: false,
    description:
      'Default GitHub login for all four endpoints when no ?username= is passed. If unset, falls back to "ahmedtrooper".',
  },
  {
    name: 'GITHUB_REPO',
    required: false,
    description:
      'Default repo for /api/pin. Format "name" (owner from GITHUB_USERNAME) or "owner/name".',
  },
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: false,
    description:
      'Public base URL. Used by metadata (OpenGraph image, sitemap, canonical) and shown in the playground README snippet preview. Defaults to "https://git-glyph.vercel.app".',
  },
];

const RATE_LIMITS = [
  {
    scope: 'GitHub GraphQL',
    anonymous: '60 req/hr per IP',
    authenticated: '5,000 req/hr per token',
    note: 'Used by /api/stats, /api/streak, /api/languages, /api/pin. A 0-scope PAT is sufficient and is the recommended setup.',
  },
  {
    scope: 'GitHub REST',
    anonymous: '60 req/hr per IP',
    authenticated: '5,000 req/hr per token',
    note: 'Used by /api/stats as a fallback when GraphQL is unavailable.',
  },
  {
    scope: 'GitGlyph (Vercel Edge)',
    anonymous: 'Unlimited (cached)',
    authenticated: 'Unlimited (cached)',
    note: 'Success responses are cached at the edge for 5 hours (s-maxage=18000) and served stale for 24h. Effective GitHub API consumption per unique viewer: once per 5h.',
  },
];

// Shared utility class strings — keeps className lists below readable.
const cardClass =
  'rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_1px_2px_rgb(0_0_0_/_0.04),0_8px_24px_-12px_rgb(0_0_0_/_0.08)]';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans antialiased">
      {/* Ambient gradient — same as home page */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[80rem] h-[40rem] rounded-full bg-[var(--accent)] opacity-[0.06] blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md supports-[backdrop-filter]:bg-[var(--background)]/60">
        <div className="max-w-6xl min-[2400px]:max-w-7xl min-[3840px]:max-w-[1600px] mx-auto px-4 sm:px-6 min-[2400px]:px-12 min-[3840px]:px-24 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-base tracking-tight bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            <span aria-hidden="true" className="text-xl">⚡</span>
            <span>GitGlyph Docs</span>
          </Link>
          <div className="flex items-center gap-2 text-sm font-medium">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors flex items-center gap-1.5"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Playground
            </Link>
            <a
              href="https://github.com/AhmedTrooper/GitGlyph"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-md border border-[var(--border-strong)] text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
              </svg>
              Fork
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl min-[2400px]:max-w-7xl min-[3840px]:max-w-[1600px] mx-auto px-4 sm:px-6 min-[2400px]:px-12 min-[3840px]:px-24 py-10 sm:py-16">
        {/* Page header */}
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--accent-soft)] text-[var(--accent-text)] border border-[var(--accent)]/20 mb-4">
            <span aria-hidden="true">📖</span>
            <span>Source of Truth · API Reference</span>
          </div>
          <h1 className="text-3xl sm:text-5xl min-[2400px]:text-6xl min-[3840px]:text-7xl font-extrabold tracking-tight leading-tight">
            GitGlyph API
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[var(--muted)] max-w-3xl leading-relaxed">
            Every endpoint, every query parameter, every response header, every theme
            palette — all in one place. This page is the source of truth for embedding
            GitGlyph cards in your GitHub README.
          </p>
        </header>

        {/* Quick-start anchors */}
        <nav
          aria-label="On this page"
          className={`${cardClass} p-5 sm:p-6 mb-12`}
        >
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--subtle)] mb-3">
            On this page
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 text-sm">
            {[
              ['#endpoints', 'Endpoints'],
              ['#parameters', 'Query Parameters'],
              ['#themes', 'Themes'],
              ['#headers', 'Response Headers'],
              ['#errors', 'Error Handling'],
              ['#environment', 'Environment Variables'],
              ['#rate-limits', 'Rate Limits'],
              ['#caching', 'Caching Strategy'],
              ['#embed', 'Embed Examples'],
            ].map(([href, label]) => (
              <li key={href}>
                <a
                  href={href}
                  className="block px-3 py-2 rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* ============ ENDPOINTS ============ */}
        <section id="endpoints" className="mb-16">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Endpoints
            </h2>
            <p className="text-sm text-[var(--muted)] mt-2 max-w-3xl">
              All four endpoints return <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-[var(--code-inline-bg)] text-[var(--code-inline-fg)]">image/svg+xml</code>.
              Use them as <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-[var(--code-inline-bg)] text-[var(--code-inline-fg)]">&lt;img src&gt;</code> in any
              README.
            </p>
          </div>

          <div className="space-y-10">
            {ENDPOINTS.map((ep) => (
              <article
                key={ep.id}
                id={ep.id}
                className={`${cardClass} overflow-hidden`}
              >
                <header className="p-5 sm:p-6 border-b border-[var(--border)] bg-[var(--surface-2)]/40">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                    <span className="self-start px-2 py-0.5 rounded-md bg-[var(--success-soft)] text-[var(--success-text)] text-xs font-bold tracking-wide border border-[var(--success)]/20">
                      {ep.method}
                    </span>
                    <code className="font-mono text-base sm:text-lg text-[var(--foreground)] break-all">
                      {ep.path}
                    </code>
                  </div>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">
                    {ep.summary}
                  </p>
                </header>

                <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--subtle)] mb-2">
                      Data Source
                    </h4>
                    <p className="text-sm text-[var(--muted)] leading-relaxed">
                      {ep.dataSource}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--subtle)] mb-2">
                      Response
                    </h4>
                    <p className="text-sm text-[var(--muted)] leading-relaxed">
                      {ep.response}
                    </p>
                    <p className="mt-2 text-xs text-[var(--subtle)] font-mono">
                      Dimensions: {ep.dimensions}
                    </p>
                  </div>
                </div>

                <div className="px-5 sm:px-6 pb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--subtle)] mb-2">
                    Example URL
                  </h4>
                  <pre className="p-3 rounded-lg bg-[var(--code-bg)] text-[var(--code-fg)] text-xs font-mono overflow-x-auto border border-[var(--border)] shadow-inner">
                    <code>{ep.exampleUrl}</code>
                  </pre>
                </div>

                <div className="p-5 sm:p-6 border-t border-[var(--border)]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--subtle)] mb-3">
                    Query Parameters
                  </h4>
                  <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[var(--surface-2)] text-[var(--foreground)] font-semibold border-b border-[var(--border)]">
                        <tr>
                          <th className="p-3 font-semibold">Name</th>
                          <th className="p-3 font-semibold">Type</th>
                          <th className="p-3 font-semibold">Default Source</th>
                          <th className="p-3 font-semibold">Allowed</th>
                          <th className="p-3 font-semibold">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)] font-mono">
                        {ep.params.map((p) => (
                          <tr key={p.name} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                            <td className="p-3 font-semibold text-[var(--accent)] align-top break-all">
                              {p.name}
                            </td>
                            <td className="p-3 text-[var(--subtle)] align-top">{p.type}</td>
                            <td className="p-3 text-[var(--subtle)] align-top whitespace-nowrap">
                              {p.defaultSource}
                            </td>
                            <td className="p-3 text-[var(--muted)] align-top">
                              {p.allowed}
                            </td>
                            <td className="p-3 font-sans text-[var(--muted)] align-top leading-relaxed">
                              {p.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ============ PARAMETERS (consolidated) ============ */}
        <section id="parameters" className="mb-16">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Consolidated Query Parameters
            </h2>
            <p className="text-sm text-[var(--muted)] mt-2 max-w-3xl">
              Every parameter, every endpoint it applies to. Use this as the cheat-sheet.
            </p>
          </div>

          <div className={`overflow-x-auto ${cardClass}`}>
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--surface-2)] text-[var(--foreground)] font-semibold border-b border-[var(--border)]">
                <tr>
                  <th className="p-4 font-semibold">Parameter</th>
                  <th className="p-4 font-semibold">Type</th>
                  <th className="p-4 font-semibold">Default</th>
                  <th className="p-4 font-semibold">Applies To</th>
                  <th className="p-4 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] font-mono text-xs">
                {[
                  ['username', 'string', 'GITHUB_USERNAME env', 'all 4', 'GitHub login. Falls back to env, then "ahmedtrooper".'],
                  ['repo', 'string', 'GITHUB_REPO env', '/api/pin only', 'Either "name" or "owner/name". Required for /api/pin.'],
                  ['theme', 'string', "'light'", 'all 4', 'Preset palette: light, dark, tokyo-night, dracula, nord, radical, catppuccin.'],
                  ['layout', 'string', "'horizontal'", '/api/stats, /api/streak', 'horizontal (450×195) or vertical (320×285 / 320×270).'],
                  ['custom_title', 'string', 'auto-generated', 'all 4', 'Card header text. Truncated at 38 chars.'],
                  ['hide_border', 'boolean', "'false'", 'all 4', 'Hides the outer 1px stroke.'],
                  ['bg_color', 'hex', 'theme.bg', 'all 4', '3/6/8-digit hex without the leading #.'],
                  ['border_color', 'hex', 'theme.border', 'all 4', '3/6/8-digit hex without the leading #. Ignored if hide_border=true.'],
                  ['title_color', 'hex', 'theme.title', 'all 4', '3/6/8-digit hex without the leading #.'],
                  ['text_color', 'hex', 'theme.text', 'all 4', '3/6/8-digit hex. Used for both label and value text.'],
                  ['width', 'integer', 'responsive', 'all 4', '200–4000. Locks intrinsic width; out-of-range falls back to fluid.'],
                ].map(([name, type, def, scope, desc]) => (
                  <tr key={name} className="hover:bg-[var(--surface-2)] transition-colors">
                    <td className="p-4 font-semibold text-[var(--accent)] align-top break-all">
                      {name}
                    </td>
                    <td className="p-4 text-[var(--subtle)] align-top">{type}</td>
                    <td className="p-4 text-[var(--subtle)] align-top whitespace-nowrap">{def}</td>
                    <td className="p-4 text-[var(--muted)] align-top">{scope}</td>
                    <td className="p-4 font-sans text-[var(--muted)] align-top leading-relaxed">
                      {desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ============ THEMES ============ */}
        <section id="themes" className="mb-16">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Themes</h2>
            <p className="text-sm text-[var(--muted)] mt-2 max-w-3xl">
              Seven preset palettes. Each row shows the actual hex values used for the
              card background, border, title, body text, bold values, fire/accent,
              badge background, and badge text.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {(Object.entries(THEMES) as [CardTheme, (typeof THEMES)[CardTheme]][]).map(
              ([id, c]) => (
                <div
                  key={id}
                  className={`${cardClass} overflow-hidden`}
                >
                  <div
                    className="p-5 border-b border-[var(--border)]"
                    style={{
                      background: c.bg,
                      borderColor: c.border,
                      color: c.text,
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <code
                        className="font-mono text-xs"
                        style={{ color: c.title }}
                      >
                        theme={id}
                      </code>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider"
                        style={{
                          background: c.badgeBg,
                          color: c.badgeText,
                          border: `1px solid ${c.border}`,
                        }}
                      >
                        PUBLIC
                      </span>
                    </div>
                    <p
                      className="text-lg font-bold mb-1"
                      style={{ color: c.title }}
                    >
                      Sample Title
                    </p>
                    <p className="text-xs">
                      Body text ·{' '}
                      <span style={{ color: c.bold, fontWeight: 700 }}>Bold value</span>
                    </p>
                  </div>
                  <div className="p-4 bg-[var(--surface)] font-mono text-xs space-y-1.5">
                    {(['bg', 'border', 'title', 'text', 'bold', 'fire', 'badgeBg', 'badgeText'] as const).map(
                      (k) => (
                        <div key={k} className="flex items-center gap-2.5">
                          <span className="w-3 h-3 rounded-sm border border-[var(--border-strong)] flex-shrink-0" style={{ background: c[k] }} />
                          <span className="text-[var(--subtle)] w-20">{k}</span>
                          <span className="text-[var(--foreground)]">{c[k]}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        {/* ============ RESPONSE HEADERS ============ */}
        <section id="headers" className="mb-16">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Response Headers
            </h2>
            <p className="text-sm text-[var(--muted)] mt-2 max-w-3xl">
              Every successful and error response carries these headers.
            </p>
          </div>
          <div className={`overflow-x-auto ${cardClass}`}>
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--surface-2)] text-[var(--foreground)] font-semibold border-b border-[var(--border)]">
                <tr>
                  <th className="p-4 font-semibold">Header</th>
                  <th className="p-4 font-semibold">Value</th>
                  <th className="p-4 font-semibold">When / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {RESPONSE_HEADERS.map((h, i) => (
                  <tr key={i} className="hover:bg-[var(--surface-2)] transition-colors">
                    <td className="p-4 font-mono font-semibold text-[var(--accent)] align-top">
                      {h.name}
                    </td>
                    <td className="p-4 font-mono text-xs text-[var(--foreground)] align-top break-all">
                      {h.value}
                    </td>
                    <td className="p-4 font-sans text-[var(--muted)] align-top leading-relaxed">
                      {h.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ============ ERRORS ============ */}
        <section id="errors" className="mb-16">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Error Handling
            </h2>
            <p className="text-sm text-[var(--muted)] mt-2 max-w-3xl">
              Every error path returns a styled SVG error card with HTTP 200 — never a
              broken image or a 5xx. The embed in your README keeps rendering.
            </p>
          </div>

          <div className={`${cardClass} p-5 sm:p-6`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--subtle)] mb-4">
              Triggered when
            </h3>
            <ul className="space-y-3">
              {[
                ['GITHUB_TOKEN missing', 'When the env var is unset and /api/stats falls back to REST, but the fallback still requires a token for higher rate limits.'],
                ['GitHub user not found', "When the username resolves to a 404. The card returns \"GitHub user 'X' not found\"."],
                ['Repo not found or private', "On /api/pin when the owner/name pair does not resolve. Returns \"Repository 'X/Y' not found or is private\"."],
                ['GraphQL network error', 'When GitHub returns 5xx or the fetch itself throws. /api/stats falls back to REST transparently; other endpoints surface the error.'],
                ['Missing required query param', 'On /api/pin without ?repo and no GITHUB_REPO env — returns "Missing repo parameter. Specify ?repo=repo-name or set GITHUB_REPO."'],
                ['Invalid ?width', 'Out of [200, 4000] or non-numeric — silently ignored, falls back to responsive.'],
                ['Invalid ?theme', 'Unknown theme id — silently falls back to "light".'],
                ['Invalid hex in color override', 'Non-hex string — silently ignored, falls back to theme value.'],
              ].map(([title, body]) => (
                <li key={title} className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-2 border-b border-[var(--border)] last:border-0">
                  <code className="text-sm font-semibold text-[var(--accent)] sm:col-span-1">
                    {title}
                  </code>
                  <span className="text-sm text-[var(--muted)] sm:col-span-2 leading-relaxed">
                    {body}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ============ ENVIRONMENT VARIABLES ============ */}
        <section id="environment" className="mb-16">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Environment Variables
            </h2>
            <p className="text-sm text-[var(--muted)] mt-2 max-w-3xl">
              Configure these in Vercel Project Settings → Environment Variables before
              the first deploy. Only GITHUB_TOKEN is strictly required.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ENV_VARS.map((e) => (
              <div
                key={e.name}
                className={`${cardClass} p-5`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <code className="font-mono text-sm font-bold text-[var(--accent)] break-all">
                    {e.name}
                  </code>
                  {e.required && (
                    <span className="px-2 py-0.5 rounded-md bg-[var(--danger-soft)] text-[var(--danger-text)] text-[10px] font-bold tracking-wide border border-[var(--danger)]/20">
                      REQUIRED
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  {e.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ============ RATE LIMITS ============ */}
        <section id="rate-limits" className="mb-16">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Rate Limits
            </h2>
            <p className="text-sm text-[var(--muted)] mt-2 max-w-3xl">
              Limits you actually hit when serving a popular README.
            </p>
          </div>
          <div className={`overflow-x-auto ${cardClass}`}>
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--surface-2)] text-[var(--foreground)] font-semibold border-b border-[var(--border)]">
                <tr>
                  <th className="p-4 font-semibold">Scope</th>
                  <th className="p-4 font-semibold">Anonymous</th>
                  <th className="p-4 font-semibold">Authenticated</th>
                  <th className="p-4 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {RATE_LIMITS.map((r) => (
                  <tr key={r.scope} className="hover:bg-[var(--surface-2)] transition-colors">
                    <td className="p-4 font-semibold text-[var(--foreground)] align-top">
                      {r.scope}
                    </td>
                    <td className="p-4 font-mono text-xs text-[var(--muted)] align-top">
                      {r.anonymous}
                    </td>
                    <td className="p-4 font-mono text-xs text-[var(--muted)] align-top">
                      {r.authenticated}
                    </td>
                    <td className="p-4 font-sans text-[var(--muted)] align-top leading-relaxed text-sm">
                      {r.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ============ CACHING ============ */}
        <section id="caching" className="mb-16">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Caching Strategy
            </h2>
            <p className="text-sm text-[var(--muted)] mt-2 max-w-3xl">
              How a single GitHub fetch serves thousands of README views.
            </p>
          </div>
          <ol className={`${cardClass} p-5 sm:p-6 space-y-4 list-decimal pl-10`}>
            {[
              'Browser sends GET /api/stats. Browser cache is bypassed (max-age=0).',
              'Vercel Edge CDN checks its cache. If a cached SVG is <5h old, it is served immediately. No GitHub API call. No compute time.',
              'If no cached SVG exists (or it is >5h old), the Edge Function runs, calls GitHub GraphQL with your PAT, and renders the SVG.',
              'The freshly rendered SVG is cached for 5 hours (s-maxage=18000) and marked stale-while-revalidate=86400.',
              'If a request arrives after 5h but before 24h, the stale cached SVG is served while a fresh render happens in the background. The next request gets the fresh one.',
              'A single PAT therefore supports ~5,000 unique visitors per hour for stats alone, with zero GitHub API consumption per repeat viewer.',
            ].map((step, i) => (
              <li
                key={i}
                className="text-sm text-[var(--muted)] leading-relaxed marker:text-[var(--accent)] marker:font-bold"
              >
                {step}
              </li>
            ))}
          </ol>
        </section>

        {/* ============ EMBED EXAMPLES ============ */}
        <section id="embed" className="mb-16">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Embed Examples
            </h2>
            <p className="text-sm text-[var(--muted)] mt-2 max-w-3xl">
              Drop these into any GitHub README, GitLab, Bitbucket, or static site.
              Replace <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-[var(--code-inline-bg)] text-[var(--code-inline-fg)]">your-domain.com</code> with
              your deployed GitGlyph URL (or the canonical{' '}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-[var(--code-inline-bg)] text-[var(--code-inline-fg)]">git-glyph.vercel.app</code> for the
              hosted version).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[
              {
                title: 'Stats · horizontal, dark',
                snippet: '![GitHub Stats](https://your-domain.com/api/stats?theme=dark)',
              },
              {
                title: 'Stats · vertical, tokyo-night',
                snippet:
                  '![GitHub Stats](https://your-domain.com/api/stats?theme=tokyo-night&layout=vertical)',
              },
              {
                title: 'Streak · dracula',
                snippet:
                  '![Contribution Streak](https://your-domain.com/api/streak?theme=dracula)',
              },
              {
                title: 'Top Languages · nord',
                snippet:
                  '![Top Languages](https://your-domain.com/api/languages?theme=nord)',
              },
              {
                title: 'Pinned Repo · catppuccin',
                snippet:
                  '![Pinned Repo](https://your-domain.com/api/pin?repo=AhmedTrooper/GitGlyph&theme=catppuccin)',
              },
              {
                title: 'Custom colors · custom title',
                snippet:
                  '![Stats](https://your-domain.com/api/stats?bg_color=0d1117&title_color=58a6ff&text_color=c9d1d9&custom_title=My%20Open%20Source%20Stats)',
              },
              {
                title: 'Badge-style fixed width',
                snippet:
                  '![Stats](https://your-domain.com/api/stats?width=400)',
              },
              {
                title: 'Username override',
                snippet:
                  '![Stats](https://your-domain.com/api/stats?username=torvalds)',
              },
            ].map((ex) => (
              <div
                key={ex.title}
                className={`${cardClass} overflow-hidden`}
              >
                <div className="px-4 py-2.5 border-b border-[var(--border)] bg-[var(--surface-2)]">
                  <h3 className="text-xs font-semibold text-[var(--muted)]">
                    {ex.title}
                  </h3>
                </div>
                <pre className="p-4 bg-[var(--code-bg)] text-[var(--code-fg)] text-xs font-mono overflow-x-auto">
                  <code>{ex.snippet}</code>
                </pre>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-[var(--border)] text-xs text-[var(--subtle)] text-center">
          GitGlyph · Self-Hosted Dynamic GitHub Stats · Source-of-truth API reference
        </footer>
      </main>
    </div>
  );
}
