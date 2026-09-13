'use client';

import { useState } from 'react';

const THEMES = [
  { id: 'dark', name: 'GitHub Dark', previewBg: '#0d1117' },
  { id: 'light', name: 'GitHub Light', previewBg: '#ffffff' },
  { id: 'tokyo-night', name: 'Tokyo Night', previewBg: '#1a1b26' },
  { id: 'dracula', name: 'Dracula', previewBg: '#282a36' },
  { id: 'nord', name: 'Nord', previewBg: '#2e3440' },
  { id: 'radical', name: 'Radical', previewBg: '#141321' },
  { id: 'catppuccin', name: 'Catppuccin', previewBg: '#1e1e2e' },
];

export default function Home() {
  const [username, setUsername] = useState('');
  const [theme, setTheme] = useState('dark');
  const [layout, setLayout] = useState<'horizontal' | 'vertical'>('horizontal');
  const [hideBorder, setHideBorder] = useState(false);
  const [repo, setRepo] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Values for live SVG preview on the page
  const previewUser = username.trim() || 'octocat';
  const previewRepo = repo.trim() || 'GitGlyph';

  // Values for README copy snippet
  const snippetUser = username.trim() || 'YOUR_USERNAME';
  const snippetRepo = repo.trim() || 'YOUR_REPO';

  const buildQuery = (user: string, extra: Record<string, string> = {}) => {
    const params = new URLSearchParams();
    if (user) params.set('username', user);
    if (theme && theme !== 'light') params.set('theme', theme);
    if (layout === 'vertical') params.set('layout', 'vertical');
    if (hideBorder) params.set('hide_border', 'true');

    for (const [k, v] of Object.entries(extra)) {
      params.set(k, v);
    }
    const q = params.toString();
    return q ? `?${q}` : '';
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  };

  // Safe base URL for README snippets: Never output localhost in README markdown
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const readmeBaseUrl =
    typeof window !== 'undefined' && !isLocalhost
      ? window.location.origin
      : 'https://your-domain.vercel.app';

  const cards = [
    {
      id: 'stats',
      title: 'Public Stats Card',
      desc: 'Showcases open-source stars, public commits, PRs, issues, repos, and followers.',
      previewUrl: `/api/stats${buildQuery(previewUser)}`,
      snippetUrl: `${readmeBaseUrl}/api/stats${buildQuery(snippetUser)}`,
      width: layout === 'vertical' ? 320 : 450,
      height: layout === 'vertical' ? 285 : 195,
    },
    {
      id: 'streak',
      title: 'Public Contribution Streak',
      desc: 'Visualizes current contribution streak, all-time max streak, and total year contributions.',
      previewUrl: `/api/streak${buildQuery(previewUser)}`,
      snippetUrl: `${readmeBaseUrl}/api/streak${buildQuery(snippetUser)}`,
      width: layout === 'vertical' ? 320 : 450,
      height: layout === 'vertical' ? 270 : 195,
    },
    {
      id: 'languages',
      title: 'Top Languages Card',
      desc: 'Displays percentage breakdown of top used programming languages with proportional color bar.',
      previewUrl: `/api/languages${buildQuery(previewUser)}`,
      snippetUrl: `${readmeBaseUrl}/api/languages${buildQuery(snippetUser)}`,
      width: 450,
      height: 195,
    },
    {
      id: 'pin',
      title: 'Pinned Repository Card',
      desc: 'Showcases a specific public repository with description, language badge, stars, and forks.',
      previewUrl: `/api/pin${buildQuery(previewUser, { repo: previewRepo })}`,
      snippetUrl: `${readmeBaseUrl}/api/pin${buildQuery(snippetUser, { repo: snippetRepo })}`,
      width: 450,
      height: 140,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#090d13] text-zinc-900 dark:text-zinc-100 font-sans antialiased">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-[#090d13]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              GitGlyph Docs
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <a
              href="#playground"
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Playground
            </a>
            <a
              href="#endpoints"
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Endpoints
            </a>
            <a
              href="#parameters"
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Parameters
            </a>
            <a
              href="https://github.com/AhmedTrooper/GitGlyph"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              GitHub ↗
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-6xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-6">
          <span>🚀 Vercel Edge Cached</span>
          <span>•</span>
          <span>5-Hour CDN Expiry</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 max-w-3xl mx-auto leading-tight">
          Dynamic GitHub SVG Cards for your{' '}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
            README
          </span>
        </h1>
        <p className="mt-5 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Generate real-time public stats, streak tracking, top languages, and pinned repository cards.
          Served through Vercel&apos;s Edge CDN with zero database requirements and zero compute usage during cache hits.
        </p>
      </header>

      {/* Interactive Playground & Live Preview */}
      <section id="playground" className="max-w-6xl mx-auto px-6 pb-20">
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 shadow-sm mb-10">
          <h2 className="text-base font-bold uppercase tracking-wider text-zinc-500 mb-4">
            Interactive Customizer
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                GitHub Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="octocat"
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Theme Selector */}
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Theme
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {THEMES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Layout Toggle */}
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Orientation / Layout
              </label>
              <select
                value={layout}
                onChange={(e) => setLayout(e.target.value as 'horizontal' | 'vertical')}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="horizontal">Horizontal (Default)</option>
                <option value="vertical">Vertical (Compact)</option>
              </select>
            </div>

            {/* Pinned Repo Input */}
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Pinned Repository
              </label>
              <input
                type="text"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="GitGlyph"
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Hide Border Toggle */}
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer h-10 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={hideBorder}
                  onChange={(e) => setHideBorder(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                Hide Border
              </label>
            </div>
          </div>
        </div>

        {/* Rendered Live Cards Grid */}
        <div className="space-y-12">
          {cards.map((card) => {
            const markdownCode = `![${card.title}](${card.snippetUrl})`;
            return (
              <div
                key={card.id}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 sm:p-8 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800/60">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                      {card.desc}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={card.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      Open Raw SVG ↗
                    </a>
                    <button
                      onClick={() => copyToClipboard(markdownCode, card.id)}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500 shadow-sm transition-colors"
                    >
                      {copiedId === card.id ? '✓ Copied Markdown' : 'Copy Markdown'}
                    </button>
                  </div>
                </div>

                {/* SVG Card Viewer */}
                <div className="flex items-center justify-center p-8 bg-zinc-100/60 dark:bg-zinc-950/60 rounded-xl my-6 border border-zinc-200/60 dark:border-zinc-800/40 overflow-x-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.previewUrl}
                    alt={card.title}
                    width={card.width}
                    height={card.height}
                    className="rounded-lg shadow-md max-w-full h-auto transition-transform hover:scale-[1.01]"
                  />
                </div>

                {/* Markdown Snippet Code Block */}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                    Markdown for README
                  </div>
                  <pre className="p-3 rounded-lg bg-zinc-950 text-zinc-200 text-xs font-mono overflow-x-auto border border-zinc-800">
                    <code>{markdownCode}</code>
                  </pre>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Query Parameters Reference Table */}
      <section id="parameters" className="max-w-6xl mx-auto px-6 py-16 border-t border-zinc-200 dark:border-zinc-800">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
          Query Parameters Reference
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-8">
          Customize any card on the fly using standard URL query parameters.
        </p>

        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 font-semibold">
              <tr>
                <th className="p-4">Parameter</th>
                <th className="p-4">Default</th>
                <th className="p-4">Allowed Values</th>
                <th className="p-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono text-xs">
              <tr>
                <td className="p-4 font-semibold text-blue-600 dark:text-blue-400">username</td>
                <td className="p-4 text-zinc-500">GITHUB_USERNAME</td>
                <td className="p-4 text-zinc-700 dark:text-zinc-300">string (e.g. torvalds)</td>
                <td className="p-4 font-sans text-zinc-600 dark:text-zinc-400">Target GitHub account handle.</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-blue-600 dark:text-blue-400">theme</td>
                <td className="p-4 text-zinc-500">&apos;light&apos;</td>
                <td className="p-4 text-zinc-700 dark:text-zinc-300">light, dark, tokyo-night, dracula, nord, radical, catppuccin</td>
                <td className="p-4 font-sans text-zinc-600 dark:text-zinc-400">Color palette for background, borders, and typography.</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-blue-600 dark:text-blue-400">layout</td>
                <td className="p-4 text-zinc-500">&apos;horizontal&apos;</td>
                <td className="p-4 text-zinc-700 dark:text-zinc-300">horizontal, vertical</td>
                <td className="p-4 font-sans text-zinc-600 dark:text-zinc-400">Orientation for Stats and Streak cards. Vertical is ideal for sidebars.</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-blue-600 dark:text-blue-400">repo</td>
                <td className="p-4 text-zinc-500">GITHUB_REPO</td>
                <td className="p-4 text-zinc-700 dark:text-zinc-300">repo-name or owner/repo</td>
                <td className="p-4 font-sans text-zinc-600 dark:text-zinc-400">Repository to showcase for the /api/pin endpoint.</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-blue-600 dark:text-blue-400">hide_border</td>
                <td className="p-4 text-zinc-500">&apos;false&apos;</td>
                <td className="p-4 text-zinc-700 dark:text-zinc-300">true, false</td>
                <td className="p-4 font-sans text-zinc-600 dark:text-zinc-400">Hides the outer stroke for borderless blending.</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-blue-600 dark:text-blue-400">custom_title</td>
                <td className="p-4 text-zinc-500">default title</td>
                <td className="p-4 text-zinc-700 dark:text-zinc-300">string</td>
                <td className="p-4 font-sans text-zinc-600 dark:text-zinc-400">Overrides the header title text of the card.</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-blue-600 dark:text-blue-400">bg_color</td>
                <td className="p-4 text-zinc-500">theme default</td>
                <td className="p-4 text-zinc-700 dark:text-zinc-300">hex code (e.g. 0f172a)</td>
                <td className="p-4 font-sans text-zinc-600 dark:text-zinc-400">Custom background color override without &apos;#&apos;.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Deployment & Free Vercel Setup */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-zinc-200 dark:border-zinc-800">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
          Vercel Free Tier Deployment
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-8">
          GitGlyph is designed from the ground up to operate smoothly on Vercel&apos;s free Hobby tier without timeouts.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="text-2xl mb-2">🔑</div>
            <h3 className="font-semibold text-sm mb-1 text-zinc-900 dark:text-zinc-100">
              1. Add Environment Variables
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Add <code className="font-mono text-blue-500">GITHUB_TOKEN</code> (PAT with 0 scopes for 5,000 req/hr) and <code className="font-mono text-blue-500">GITHUB_USERNAME</code> in Vercel Project Settings.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold text-sm mb-1 text-zinc-900 dark:text-zinc-100">
              2. Single GraphQL Query
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Requests resolve in ~200ms using a single round-trip, well beneath Vercel&apos;s 10-second serverless execution threshold.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="text-2xl mb-2">🛡️</div>
            <h3 className="font-semibold text-sm mb-1 text-zinc-900 dark:text-zinc-100">
              3. Global Edge CDN Cache
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Cached for 5 hours via <code className="font-mono text-blue-500">s-maxage=18000</code>. Subsequent views consume zero serverless function execution quotas.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 py-8 text-center text-xs text-zinc-500">
        GitGlyph · Edge-cached GitHub Stats Generator · Built with Next.js &amp; Vercel Edge CDN
      </footer>
    </div>
  );
}
