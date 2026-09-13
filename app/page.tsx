'use client';

import { useState, useSyncExternalStore } from 'react';
import { THEMES as THEME_PALETTES, CardTheme } from '@/lib/themes';

const emptySubscribe = () => () => {};

function useDetectedDomain(): string {
  return useSyncExternalStore(
    emptySubscribe,
    () => {
      if (typeof window === 'undefined') return '';
      const isLocal =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';
      return !isLocal && window.location.origin ? window.location.origin : '';
    },
    () => ''
  );
}

const THEME_OPTIONS = [
  { id: 'dark', name: 'GitHub Dark', previewBg: '#0d1117' },
  { id: 'light', name: 'GitHub Light', previewBg: '#ffffff' },
  { id: 'tokyo-night', name: 'Tokyo Night', previewBg: '#1a1b26' },
  { id: 'dracula', name: 'Dracula', previewBg: '#282a36' },
  { id: 'nord', name: 'Nord', previewBg: '#2e3440' },
  { id: 'radical', name: 'Radical', previewBg: '#141321' },
  { id: 'catppuccin', name: 'Catppuccin', previewBg: '#1e1e2e' },
];

export default function Home() {
  const defaultAppUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://git-glyph.vercel.app';
  const detectedDomain = useDetectedDomain();

  // All parameters supported across /api/stats, /api/streak, /api/languages, /api/pin
  const [domainOverride, setDomainOverride] = useState('');
  const [theme, setTheme] = useState('dark');
  const [layout, setLayout] = useState<'horizontal' | 'vertical'>('horizontal');
  const [hideBorder, setHideBorder] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [bgColor, setBgColor] = useState('');
  const [borderColor, setBorderColor] = useState('');
  const [titleColor, setTitleColor] = useState('');
  const [textColor, setTextColor] = useState('');
  const [username, setUsername] = useState('');
  const [repo, setRepo] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeThemeColors = THEME_PALETTES[theme as CardTheme] || THEME_PALETTES.dark;

  const resetCustomColors = () => {
    setBgColor('');
    setBorderColor('');
    setTitleColor('');
    setTextColor('');
  };

  const resetAll = () => {
    setTheme('dark');
    setLayout('horizontal');
    setHideBorder(false);
    setCustomTitle('');
    resetCustomColors();
    setUsername('');
    setRepo('');
    setDomainOverride('');
  };

  const hasCustomizations = Boolean(
    customTitle ||
    bgColor ||
    borderColor ||
    titleColor ||
    textColor ||
    hideBorder ||
    layout === 'vertical' ||
    theme !== 'dark' ||
    username ||
    repo
  );

  // Build query string reflecting every single code-supported parameter
  const buildQuery = (isSnippet: boolean, extra: Record<string, string> = {}) => {
    const params = new URLSearchParams();

    // 1. Username override (optional in self-hosted setup)
    if (username.trim()) {
      params.set('username', username.trim());
    }

    // 2. Preset theme
    if (theme && theme !== 'light') {
      params.set('theme', theme);
    }

    // 3. Layout orientation
    if (layout === 'vertical') {
      params.set('layout', 'vertical');
    }

    // 4. Border visibility
    if (hideBorder) {
      params.set('hide_border', 'true');
    }

    // 5. Custom header title
    if (customTitle.trim()) {
      params.set('custom_title', customTitle.trim());
    }

    // 6. Hex color overrides (stripped of '#' for clean URLs)
    const clean = (val: string) => val.trim().replace(/^#/, '');
    if (clean(bgColor)) params.set('bg_color', clean(bgColor));
    if (clean(borderColor)) params.set('border_color', clean(borderColor));
    if (clean(titleColor)) params.set('title_color', clean(titleColor));
    if (clean(textColor)) params.set('text_color', clean(textColor));

    // 7. Extra route-specific overrides (e.g. repo for /api/pin)
    for (const [k, v] of Object.entries(extra)) {
      if (k === 'repo') {
        if (repo.trim()) params.set('repo', repo.trim());
      } else if (v) {
        params.set(k, v);
      }
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
      // Clipboard fallback
    }
  };

  // Safe base URL for README snippets: Use detected domain, configured env, or production fallback
  const cleanDomain = (domainOverride.trim() || detectedDomain || defaultAppUrl).replace(/\/+$/, '');
  const readmeBaseUrl = cleanDomain;

  const cards = [
    {
      id: 'stats',
      title: 'GitHub Stats Card',
      desc: 'Showcases open-source stars, total commits, PRs, issues, repos, and followers.',
      previewUrl: `/api/stats${buildQuery(false)}`,
      snippetUrl: `${readmeBaseUrl}/api/stats${buildQuery(true)}`,
      width: layout === 'vertical' ? 320 : 450,
      height: layout === 'vertical' ? 285 : 195,
    },
    {
      id: 'streak',
      title: 'Contribution Streak Card',
      desc: 'Visualizes current contribution streak, all-time max streak, and total year contributions.',
      previewUrl: `/api/streak${buildQuery(false)}`,
      snippetUrl: `${readmeBaseUrl}/api/streak${buildQuery(true)}`,
      width: layout === 'vertical' ? 320 : 450,
      height: layout === 'vertical' ? 270 : 195,
    },
    {
      id: 'languages',
      title: 'Top Languages Card',
      desc: 'Displays percentage breakdown of top used programming languages with proportional color bar.',
      previewUrl: `/api/languages${buildQuery(false)}`,
      snippetUrl: `${readmeBaseUrl}/api/languages${buildQuery(true)}`,
      width: 450,
      height: 195,
    },
    {
      id: 'pin',
      title: 'Pinned Repository Card',
      desc: 'Showcases a specific public repository with description, language badge, stars, and forks.',
      previewUrl: `/api/pin${buildQuery(false, { repo: repo.trim() })}`,
      snippetUrl: `${readmeBaseUrl}/api/pin${buildQuery(true, { repo: repo.trim() })}`,
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
              href="#parameters"
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Parameters
            </a>
            <a
              href="#deployment"
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Self-Hosting
            </a>
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

      <main>
        {/* Hero Section */}
        <header className="max-w-6xl mx-auto px-6 pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-6">
            <span>🛡️ Self-Hosted &amp; Forkable</span>
            <span>•</span>
            <span>Zero URL Clutter</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 max-w-3xl mx-auto leading-tight">
            Dynamic GitHub SVG Cards for your{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              README
            </span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Fork this repository, deploy to Vercel with your GitHub token, and embed clean URLs like{' '}
            <code className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono text-xs">/api/stats</code> directly in your README.
            No query parameters required for self-hosted instances.
          </p>
        </header>

        {/* Interactive Playground & Live Preview */}
        <section id="playground" className="max-w-6xl mx-auto px-6 pb-20">
          <div className="p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 shadow-sm mb-10">
            {/* Customizer Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>🎛️</span> Interactive Customizer
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Customize every query parameter supported by the API in real time.
                </p>
              </div>
              {hasCustomizations && (
                <button
                  onClick={resetAll}
                  className="self-start sm:self-auto text-xs px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors flex items-center gap-1.5 font-medium"
                >
                  <span>↺</span> Reset All
                </button>
              )}
            </div>

            {/* Block 1: Theme, Layout & Domain */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
                1. Theme &amp; Orientation
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Theme Selector */}
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Preset Theme (<code className="font-mono text-[10px]">theme</code>)
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {THEME_OPTIONS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Layout Toggle */}
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Orientation (<code className="font-mono text-[10px]">layout</code>)
                  </label>
                  <select
                    value={layout}
                    onChange={(e) => setLayout(e.target.value as 'horizontal' | 'vertical')}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="horizontal">Horizontal (Default)</option>
                    <option value="vertical">Vertical (Compact)</option>
                  </select>
                </div>

                {/* Deployment Domain */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      Domain
                    </label>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {detectedDomain ? 'Auto-detected' : 'From Env'}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={domainOverride}
                    onChange={(e) => setDomainOverride(e.target.value)}
                    placeholder={detectedDomain || defaultAppUrl}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Hide Border Toggle */}
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer h-9 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={hideBorder}
                      onChange={(e) => setHideBorder(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Hide Border (<code className="font-mono text-[10px]">hide_border</code>)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Block 2: Text & Identity Overrides */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
                2. Text &amp; Identity Overrides
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Custom Title Override */}
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Custom Title (<code className="font-mono text-[10px]">custom_title</code>)
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Defaults to auto-generated title"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Username Override */}
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Username Override (<code className="font-mono text-[10px]">username</code>)
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Defaults to GITHUB_USERNAME"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Pinned Repo Override */}
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Pinned Repo Override (<code className="font-mono text-[10px]">repo</code>)
                  </label>
                  <input
                    type="text"
                    value={repo}
                    onChange={(e) => setRepo(e.target.value)}
                    placeholder="Defaults to GITHUB_REPO"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Block 3: Hex Color Overrides */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  3. Color Customization (Hex Overrides)
                </h3>
                {(bgColor || borderColor || titleColor || textColor) && (
                  <button
                    onClick={resetCustomColors}
                    className="text-xs text-blue-500 hover:text-blue-600 hover:underline font-medium"
                  >
                    Clear Colors
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Background Color */}
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Background (<code className="font-mono text-[10px]">bg_color</code>)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor ? (bgColor.startsWith('#') ? bgColor : `#${bgColor}`) : activeThemeColors.bg}
                      onChange={(e) => setBgColor(e.target.value.replace(/^#/, ''))}
                      className="w-8 h-8 rounded border border-zinc-300 dark:border-zinc-700 cursor-pointer p-0.5 bg-transparent"
                      title="Click to pick background color"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value.replace(/^#/, ''))}
                      placeholder={activeThemeColors.bg.replace(/^#/, '')}
                      className="flex-1 px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Border Color */}
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Border (<code className="font-mono text-[10px]">border_color</code>)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={borderColor ? (borderColor.startsWith('#') ? borderColor : `#${borderColor}`) : activeThemeColors.border}
                      onChange={(e) => setBorderColor(e.target.value.replace(/^#/, ''))}
                      className="w-8 h-8 rounded border border-zinc-300 dark:border-zinc-700 cursor-pointer p-0.5 bg-transparent"
                      title="Click to pick border color"
                    />
                    <input
                      type="text"
                      value={borderColor}
                      onChange={(e) => setBorderColor(e.target.value.replace(/^#/, ''))}
                      placeholder={activeThemeColors.border.replace(/^#/, '')}
                      className="flex-1 px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Title Color */}
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Title (<code className="font-mono text-[10px]">title_color</code>)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={titleColor ? (titleColor.startsWith('#') ? titleColor : `#${titleColor}`) : activeThemeColors.title}
                      onChange={(e) => setTitleColor(e.target.value.replace(/^#/, ''))}
                      className="w-8 h-8 rounded border border-zinc-300 dark:border-zinc-700 cursor-pointer p-0.5 bg-transparent"
                      title="Click to pick title color"
                    />
                    <input
                      type="text"
                      value={titleColor}
                      onChange={(e) => setTitleColor(e.target.value.replace(/^#/, ''))}
                      placeholder={activeThemeColors.title.replace(/^#/, '')}
                      className="flex-1 px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Text Color */}
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Text (<code className="font-mono text-[10px]">text_color</code>)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={textColor ? (textColor.startsWith('#') ? textColor : `#${textColor}`) : activeThemeColors.text}
                      onChange={(e) => setTextColor(e.target.value.replace(/^#/, ''))}
                      className="w-8 h-8 rounded border border-zinc-300 dark:border-zinc-700 cursor-pointer p-0.5 bg-transparent"
                      title="Click to pick text color"
                    />
                    <input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value.replace(/^#/, ''))}
                      placeholder={activeThemeColors.text.replace(/^#/, '')}
                      className="flex-1 px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
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
                        {copiedId === card.id ? '✓ Copied Clean Markdown' : 'Copy Markdown'}
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
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                      <span>Clean Markdown for your README</span>
                      <span className="normal-case text-zinc-400 font-normal">
                        Uses your configured environment variables automatically
                      </span>
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
            Supported Query Parameters
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-8">
            In self-hosted setups, all cards work out of the box with zero parameters. Use these parameters to customize style, layout, or color:
          </p>

          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 font-semibold">
                <tr>
                  <th className="p-4">Parameter</th>
                  <th className="p-4">Default Source</th>
                  <th className="p-4">Allowed Values</th>
                  <th className="p-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono text-xs">
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
                  <td className="p-4 font-semibold text-blue-600 dark:text-blue-400">hide_border</td>
                  <td className="p-4 text-zinc-500">&apos;false&apos;</td>
                  <td className="p-4 text-zinc-700 dark:text-zinc-300">true, false</td>
                  <td className="p-4 font-sans text-zinc-600 dark:text-zinc-400">Hides the outer stroke for borderless blending.</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-blue-600 dark:text-blue-400">custom_title</td>
                  <td className="p-4 text-zinc-500">Auto-generated</td>
                  <td className="p-4 text-zinc-700 dark:text-zinc-300">string</td>
                  <td className="p-4 font-sans text-zinc-600 dark:text-zinc-400">Overrides the header title text of the card.</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-blue-600 dark:text-blue-400">bg_color</td>
                  <td className="p-4 text-zinc-500">Theme default</td>
                  <td className="p-4 text-zinc-700 dark:text-zinc-300">hex code (e.g. 1a1b26)</td>
                  <td className="p-4 font-sans text-zinc-600 dark:text-zinc-400">Custom background color override (without &apos;#&apos;).</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-blue-600 dark:text-blue-400">border_color</td>
                  <td className="p-4 text-zinc-500">Theme default</td>
                  <td className="p-4 text-zinc-700 dark:text-zinc-300">hex code (e.g. 414868)</td>
                  <td className="p-4 font-sans text-zinc-600 dark:text-zinc-400">Custom border stroke color override (without &apos;#&apos;).</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-blue-600 dark:text-blue-400">title_color</td>
                  <td className="p-4 text-zinc-500">Theme default</td>
                  <td className="p-4 text-zinc-700 dark:text-zinc-300">hex code (e.g. 7aa2f7)</td>
                  <td className="p-4 font-sans text-zinc-600 dark:text-zinc-400">Custom header title color override (without &apos;#&apos;).</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-blue-600 dark:text-blue-400">text_color</td>
                  <td className="p-4 text-zinc-500">Theme default</td>
                  <td className="p-4 text-zinc-700 dark:text-zinc-300">hex code (e.g. c0caf5)</td>
                  <td className="p-4 font-sans text-zinc-600 dark:text-zinc-400">Custom body text and metric values color override (without &apos;#&apos;).</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-blue-600 dark:text-blue-400">username</td>
                  <td className="p-4 text-zinc-500">GITHUB_USERNAME env</td>
                  <td className="p-4 text-zinc-700 dark:text-zinc-300">string</td>
                  <td className="p-4 font-sans text-zinc-600 dark:text-zinc-400">Optional override. Defaults to your configured GITHUB_USERNAME environment variable.</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-blue-600 dark:text-blue-400">repo</td>
                  <td className="p-4 text-zinc-500">GITHUB_REPO env</td>
                  <td className="p-4 text-zinc-700 dark:text-zinc-300">repo-name or owner/repo</td>
                  <td className="p-4 font-sans text-zinc-600 dark:text-zinc-400">Optional override for /api/pin. Defaults to your GITHUB_REPO environment variable.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Deployment & Free Vercel Setup */}
        <section id="deployment" className="max-w-6xl mx-auto px-6 py-16 border-t border-zinc-200 dark:border-zinc-800">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
            Self-Hosting on Vercel Free Tier
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-8">
            Fork this repository to your personal GitHub, link it to Vercel, and set your private credentials once.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="text-2xl mb-2">🔑</div>
              <h3 className="font-semibold text-sm mb-1 text-zinc-900 dark:text-zinc-100">
                1. Add Environment Variables
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Add <code className="font-mono text-blue-500">GITHUB_TOKEN</code> (PAT with 0 scopes for 5,000 req/hr), <code className="font-mono text-blue-500">GITHUB_USERNAME</code> (your handle), <code className="font-mono text-blue-500">GITHUB_REPO</code>, and optional <code className="font-mono text-blue-500">NEXT_PUBLIC_APP_URL</code> in Vercel Project Settings.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-semibold text-sm mb-1 text-zinc-900 dark:text-zinc-100">
                2. Clean Embed URLs
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Embed clean URLs like <code className="font-mono text-blue-500">{`${readmeBaseUrl}/api/stats`}</code> without passing usernames in the URL.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="text-2xl mb-2">🛡️</div>
              <h3 className="font-semibold text-sm mb-1 text-zinc-900 dark:text-zinc-100">
                3. Edge CDN Cache
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Cached for 5 hours via <code className="font-mono text-blue-500">s-maxage=18000</code>. Zero compute hours are consumed during active readme views.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 py-8 text-center text-xs text-zinc-500">
        GitGlyph · Self-Hosted Dynamic GitHub Stats · Built with Next.js &amp; Vercel Edge CDN
      </footer>
    </div>
  );
}
