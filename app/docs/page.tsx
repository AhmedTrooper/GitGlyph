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
        defaultSource: '"{name}\'s GitHub Stats"',
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
        defaultSource: '"{name}\'s Contribution Streak"',
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
      'Top 5 programming languages by total bytes across your owned non-fork repositories, with each language\'s percentage of the total and its GitHub-assigned color.',
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
        defaultSource: '"{name}\'s Top Languages"',
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
      'Single-repository card with name, description, primary language with its color, star count, fork count, and a "Public"/"Fork" badge derived from the repo\'s visibility.',
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

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#090d13] text-zinc-900 dark:text-zinc-100 font-sans antialiased">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-[#090d13]/80 backdrop-blur-md">
        <div className="max-w-6xl min-[2400px]:max-w-7xl min-[3840px]:max-w-[1600px] mx-auto px-4 sm:px-6 min-[2400px]:px-12 min-[3840px]:px-24 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 font-bold text-lg tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent"
          >
            <span className="text-2xl">⚡</span>
            <span>GitGlyph Docs</span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-medium">
            <Link
              href="/"
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              ← Playground
            </Link>
            <a
              href="https://github.com/AhmedTrooper/GitGlyph"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Fork on GitHub ↗
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl min-[2400px]:max-w-7xl min-[3840px]:max-w-[1600px] mx-auto px-4 sm:px-6 min-[2400px]:px-12 min-[3840px]:px-24 py-10 sm:py-16">
        {/* Page header */}
        <header className="mb-12">
          <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-4">
            <span>📖</span>
            <span>Source of Truth · API Reference</span>
          </p>
          <h1 className="text-3xl sm:text-5xl min-[2400px]:text-6xl min-[3840px]:text-7xl font-extrabold tracking-tight leading-tight">
            GitGlyph API
          </h1>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
            Every endpoint, every query parameter, every response header, every theme
            palette — all in one place. This page is the source of truth for embedding
            GitGlyph cards in your GitHub README.
          </p>
        </header>

        {/* Quick-start anchors */}
        <nav
          aria-label="On this page"
          className="mb-12 p-4 sm:p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50"
        >
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
            On this page
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
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
                  className="block px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* ============ ENDPOINTS ============ */}
        <section id="endpoints" className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Endpoints
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-8">
            All four endpoints return <code className="font-mono text-xs">image/svg+xml</code>.
            Use them as <code className="font-mono text-xs">&lt;img src&gt;</code> in any
            README.
          </p>

          <div className="space-y-12">
            {ENDPOINTS.map((ep) => (
              <article
                key={ep.id}
                id={ep.id}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 overflow-hidden"
              >
                <header className="p-5 sm:p-6 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                    <span className="self-start px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold tracking-wide">
                      {ep.method}
                    </span>
                    <code className="font-mono text-base sm:text-lg text-zinc-900 dark:text-zinc-100 break-all">
                      {ep.path}
                    </code>
                  </div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {ep.summary}
                  </p>
                </header>

                <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                      Data Source
                    </h4>
                    <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {ep.dataSource}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                      Response
                    </h4>
                    <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {ep.response}
                    </p>
                    <p className="mt-2 text-xs text-zinc-500 font-mono">
                      Dimensions: {ep.dimensions}
                    </p>
                  </div>
                </div>

                <div className="px-5 sm:px-6 pb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                    Example URL
                  </h4>
                  <pre className="p-3 rounded-lg bg-zinc-950 text-zinc-200 text-xs font-mono overflow-x-auto border border-zinc-800">
                    <code>{ep.exampleUrl}</code>
                  </pre>
                </div>

                <div className="p-5 sm:p-6 border-t border-zinc-200 dark:border-zinc-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
                    Query Parameters
                  </h4>
                  <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 font-semibold">
                        <tr>
                          <th className="p-3">Name</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Default Source</th>
                          <th className="p-3">Allowed</th>
                          <th className="p-3">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono">
                        {ep.params.map((p) => (
                          <tr key={p.name}>
                            <td className="p-3 font-semibold text-blue-600 dark:text-blue-400 align-top break-all">
                              {p.name}
                            </td>
                            <td className="p-3 text-zinc-500 align-top">{p.type}</td>
                            <td className="p-3 text-zinc-500 align-top whitespace-nowrap">
                              {p.defaultSource}
                            </td>
                            <td className="p-3 text-zinc-700 dark:text-zinc-300 align-top">
                              {p.allowed}
                            </td>
                            <td className="p-3 font-sans text-zinc-600 dark:text-zinc-400 align-top leading-relaxed">
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
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Consolidated Query Parameters
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            Every parameter, every endpoint it applies to. Use this as the cheat-sheet.
          </p>

          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 font-semibold">
                <tr>
                  <th className="p-4">Parameter</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Default</th>
                  <th className="p-4">Applies To</th>
                  <th className="p-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono text-xs">
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
                  <tr key={name}>
                    <td className="p-4 font-semibold text-blue-600 dark:text-blue-400 align-top break-all">
                      {name}
                    </td>
                    <td className="p-4 text-zinc-500 align-top">{type}</td>
                    <td className="p-4 text-zinc-500 align-top whitespace-nowrap">{def}</td>
                    <td className="p-4 text-zinc-700 dark:text-zinc-300 align-top">{scope}</td>
                    <td className="p-4 font-sans text-zinc-600 dark:text-zinc-400 align-top leading-relaxed">
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
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Themes</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            Seven preset palettes. Each row shows the actual hex values used for the
            card background, border, title, body text, bold values, fire/accent,
            badge background, and badge text.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {(Object.entries(THEMES) as [CardTheme, (typeof THEMES)[CardTheme]][]).map(
              ([id, c]) => (
                <div
                  key={id}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
                >
                  <div
                    className="p-5 border-b"
                    style={{
                      background: c.bg,
                      borderColor: c.border,
                      color: c.text,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
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
                      className="text-lg font-bold"
                      style={{ color: c.title }}
                    >
                      Sample Title
                    </p>
                    <p className="text-xs">
                      Body text ·{' '}
                      <span style={{ color: c.bold, fontWeight: 700 }}>Bold value</span>
                    </p>
                  </div>
                  <div className="p-4 bg-white dark:bg-zinc-900 font-mono text-xs space-y-1">
                    {(['bg', 'border', 'title', 'text', 'bold', 'fire', 'badgeBg', 'badgeText'] as const).map(
                      (k) => (
                        <div key={k} className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-sm border border-zinc-300 dark:border-zinc-700 flex-shrink-0" style={{ background: c[k] }} />
                          <span className="text-zinc-500 w-20">{k}</span>
                          <span className="text-zinc-900 dark:text-zinc-100">{c[k]}</span>
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
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Response Headers
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            Every successful and error response carries these headers.
          </p>
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 font-semibold">
                <tr>
                  <th className="p-4">Header</th>
                  <th className="p-4">Value</th>
                  <th className="p-4">When / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {RESPONSE_HEADERS.map((h, i) => (
                  <tr key={i}>
                    <td className="p-4 font-mono font-semibold text-blue-600 dark:text-blue-400 align-top">
                      {h.name}
                    </td>
                    <td className="p-4 font-mono text-xs text-zinc-900 dark:text-zinc-100 align-top break-all">
                      {h.value}
                    </td>
                    <td className="p-4 font-sans text-zinc-600 dark:text-zinc-400 align-top leading-relaxed">
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
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Error Handling
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            Every error path returns a styled SVG error card with HTTP 200 — never a
            broken image or a 5xx. The embed in your README keeps rendering.
          </p>

          <div className="space-y-3">
            {[
              {
                status: 'Triggered when',
                examples: [
                  ['GITHUB_TOKEN missing', 'When the env var is unset and /api/stats falls back to REST, but the fallback still requires a token for higher rate limits.'],
                  ['GitHub user not found', 'When the username resolves to a 404. The card returns "GitHub user \'X\' not found".'],
                  ['Repo not found or private', 'On /api/pin when the owner/name pair does not resolve. Returns "Repository \'X/Y\' not found or is private".'],
                  ['GraphQL network error', 'When GitHub returns 5xx or the fetch itself throws. /api/stats falls back to REST transparently; other endpoints surface the error.'],
                  ['Missing required query param', 'On /api/pin without ?repo and no GITHUB_REPO env — returns "Missing repo parameter. Specify ?repo=repo-name or set GITHUB_REPO."'],
                  ['Invalid ?width', 'Out of [200, 4000] or non-numeric — silently ignored, falls back to responsive.'],
                  ['Invalid ?theme', 'Unknown theme id — silently falls back to "light".'],
                  ['Invalid hex in color override', 'Non-hex string — silently ignored, falls back to theme value.'],
                ],
              },
            ].map((group, i) => (
              <div
                key={i}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
                  {group.status}
                </h3>
                <ul className="space-y-2">
                  {group.examples.map(([title, body]) => (
                    <li key={title} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <code className="text-xs font-semibold text-blue-600 dark:text-blue-400 sm:col-span-1">
                        {title}
                      </code>
                      <span className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 sm:col-span-2 leading-relaxed">
                        {body}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ============ ENVIRONMENT VARIABLES ============ */}
        <section id="environment" className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Environment Variables
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            Configure these in Vercel Project Settings → Environment Variables before
            the first deploy. Only GITHUB_TOKEN is strictly required.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ENV_VARS.map((e) => (
              <div
                key={e.name}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <code className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 break-all">
                    {e.name}
                  </code>
                  {e.required && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-[10px] font-bold tracking-wide">
                      REQUIRED
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {e.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ============ RATE LIMITS ============ */}
        <section id="rate-limits" className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Rate Limits
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            Limits you actually hit when serving a popular README.
          </p>
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 font-semibold">
                <tr>
                  <th className="p-4">Scope</th>
                  <th className="p-4">Anonymous</th>
                  <th className="p-4">Authenticated</th>
                  <th className="p-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {RATE_LIMITS.map((r) => (
                  <tr key={r.scope}>
                    <td className="p-4 font-semibold text-zinc-900 dark:text-zinc-100 align-top">
                      {r.scope}
                    </td>
                    <td className="p-4 font-mono text-xs text-zinc-700 dark:text-zinc-300 align-top">
                      {r.anonymous}
                    </td>
                    <td className="p-4 font-mono text-xs text-zinc-700 dark:text-zinc-300 align-top">
                      {r.authenticated}
                    </td>
                    <td className="p-4 font-sans text-zinc-600 dark:text-zinc-400 align-top leading-relaxed text-xs">
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
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Caching Strategy
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            How a single GitHub fetch serves thousands of README views.
          </p>
          <ol className="space-y-4 list-decimal pl-6">
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
                className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed"
              >
                {step}
              </li>
            ))}
          </ol>
        </section>

        {/* ============ EMBED EXAMPLES ============ */}
        <section id="embed" className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Embed Examples
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            Drop these into any GitHub README, GitLab, Bitbucket, or static site.
            Replace <code className="font-mono text-xs">your-domain.com</code> with
            your deployed GitGlyph URL (or the canonical{' '}
            <code className="font-mono text-xs">git-glyph.vercel.app</code> for the
            hosted version).
          </p>

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
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden"
              >
                <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                  <h3 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {ex.title}
                  </h3>
                </div>
                <pre className="p-4 bg-zinc-950 text-zinc-200 text-xs font-mono overflow-x-auto">
                  <code>{ex.snippet}</code>
                </pre>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 text-center">
          GitGlyph · Self-Hosted Dynamic GitHub Stats · Source-of-truth API reference
        </footer>
      </main>
    </div>
  );
}
