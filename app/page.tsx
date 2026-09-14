'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
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
  const [widthMode, setWidthMode] = useState<'auto' | 'fixed'>('auto');
  const [fixedWidth, setFixedWidth] = useState<string>('400');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    setWidthMode('auto');
    setFixedWidth('400');
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
    repo ||
    widthMode === 'fixed'
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

    // 7. Fixed output width (optional). Only emitted when user opts in.
    // Values outside [200, 4000] or non-numeric are silently ignored by the
    // API, so we don't need to validate here — we just emit what the user typed.
    if (widthMode === 'fixed') {
      const n = parseInt(fixedWidth, 10);
      if (Number.isFinite(n) && n >= 200 && n <= 4000) {
        params.set('width', String(n));
      }
    }

    // 8. Extra route-specific overrides (e.g. repo for /api/pin)
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
        <div className="max-w-6xl min-[2400px]:max-w-7xl min-[3840px]:max-w-[1600px] mx-auto px-6 min-[2400px]:px-12 min-[3840px]:px-24 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              GitGlyph Docs
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs font-medium">
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
            <Link
              href="/docs"
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              API Reference
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
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            className="md:hidden p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800/80 bg-white/95 dark:bg-[#090d13]/95 backdrop-blur-md">
            <div className="max-w-6xl min-[2400px]:max-w-7xl min-[3840px]:max-w-[1600px] mx-auto px-6 min-[2400px]:px-12 min-[3840px]:px-24 py-3 flex flex-col gap-2 text-sm font-medium">
              <a
                href="#playground"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Playground
              </a>
              <a
                href="#parameters"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Parameters
              </a>
              <a
                href="#deployment"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Self-Hosting
              </a>
              <Link
                href="/docs"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                API Reference
              </Link>
              <a
                href="https://github.com/AhmedTrooper/GitGlyph"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Fork on GitHub ↗
              </a>
            </div>
          </div>
        )}
      </nav>

      <main>
        {/* Hero Section */}
        <header className="max-w-6xl min-[2400px]:max-w-7xl min-[3840px]:max-w-[1600px] mx-auto px-6 min-[2400px]:px-12 min-[3840px]:px-24 pt-10 sm:pt-16 pb-8 sm:pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-6">
            <span>🛡️ Self-Hosted &amp; Forkable</span>
            <span>•</span>
            <span>Zero URL Clutter</span>
          </div>
          <h1 className="text-4xl sm:text-6xl min-[2400px]:text-7xl min-[3840px]:text-8xl min-[6000px]:text-9xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 max-w-3xl min-[2400px]:max-w-5xl min-[3840px]:max-w-6xl mx-auto leading-tight">
            Dynamic GitHub SVG Cards for your{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              README
            </span>
          </h1>
          <p className="mt-5 text-base sm:text-lg min-[2400px]:text-xl min-[3840px]:text-2xl text-zinc-600 dark:text-zinc-400 max-w-2xl min-[2400px]:max-w-3xl mx-auto leading-relaxed">
            Fork this repository, deploy to Vercel with your GitHub token, and embed clean URLs like{' '}
            <code className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono text-xs break-all sm:break-normal">/api/stats</code> directly in your README.
            No query parameters required for self-hosted instances.
          </p>
        </header>

        {/* Interactive Playground & Live Preview */}
        <section id="playground" className="max-w-6xl min-[2400px]:max-w-7xl min-[3840px]:max-w-[1600px] mx-auto px-6 min-[2400px]:px-12 min-[3840px]:px-24 pb-20">
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

                {/* Output Width Mode (Auto / Fixed) */}
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Output Width (<code className="font-mono text-[10px]">width</code>)
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={widthMode}
                      onChange={(e) => setWidthMode(e.target.value as 'auto' | 'fixed')}
                      className="flex-shrink-0 px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="auto">Auto (fluid)</option>
                      <option value="fixed">Fixed (px)</option>
                    </select>
                    {widthMode === 'fixed' && (
                      <input
                        type="number"
                        min={200}
                        max={4000}
                        value={fixedWidth}
                        onChange={(e) => setFixedWidth(e.target.value)}
                        placeholder="400"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                  {widthMode === 'fixed' && (
                    <p className="mt-1 text-[10px] text-zinc-500 dark:text-zinc-400">
                      Lock intrinsic width (200–4000). Out-of-range falls back to fluid.
                    </p>
                  )}
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

              {/* Deployment Domain — full width on its own row below for readability */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Deployment Domain (<code className="font-mono text-[10px]">base URL</code>)
                  </label>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {detectedDomain ? '✓ Auto-detected from browser' : 'From NEXT_PUBLIC_APP_URL env'}
                  </span>
                </div>
                <input
                  type="text"
                  value={domainOverride}
                  onChange={(e) => setDomainOverride(e.target.value)}
                  placeholder={detectedDomain || defaultAppUrl}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-[10px] text-zinc-500 dark:text-zinc-400">
                  Base URL baked into the README snippet. Override to point at your self-hosted instance.
                </p>
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
          <div className="space-y-8 sm:space-y-12">
            {cards.map((card) => {
              const markdownCode = `![${card.title}](${card.snippetUrl})`;
              const copyUrlId = `${card.id}-url`;
              const activeForCard = (() => {
                const cleanHex = (v: string) => v.trim().replace(/^#/, '');
                const items: Array<{ key: string; value: string }> = [];
                if (card.id === 'pin' && repo.trim()) items.push({ key: 'repo', value: repo.trim() });
                if (username.trim()) items.push({ key: 'username', value: username.trim() });
                if (theme !== 'light') items.push({ key: 'theme', value: theme });
                if ((card.id === 'stats' || card.id === 'streak') && layout === 'vertical') items.push({ key: 'layout', value: 'vertical' });
                if (hideBorder) items.push({ key: 'hide_border', value: 'true' });
                if (customTitle.trim()) items.push({ key: 'custom_title', value: customTitle.trim() });
                if (cleanHex(bgColor)) items.push({ key: 'bg_color', value: cleanHex(bgColor) });
                if (cleanHex(borderColor)) items.push({ key: 'border_color', value: cleanHex(borderColor) });
                if (cleanHex(titleColor)) items.push({ key: 'title_color', value: cleanHex(titleColor) });
                if (cleanHex(textColor)) items.push({ key: 'text_color', value: cleanHex(textColor) });
                if (widthMode === 'fixed') {
                  const n = parseInt(fixedWidth, 10);
                  if (Number.isFinite(n) && n >= 200 && n <= 4000) items.push({ key: 'width', value: String(n) });
                }
                return items;
              })();
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
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={card.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        Open Raw SVG ↗
                      </a>
                      <button
                        onClick={() => copyToClipboard(card.snippetUrl, copyUrlId)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        {copiedId === copyUrlId ? '✓ URL Copied' : 'Copy URL'}
                      </button>
                      <button
                        onClick={() => copyToClipboard(markdownCode, card.id)}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500 shadow-sm transition-colors"
                      >
                        {copiedId === card.id ? '✓ Copied Clean Markdown' : 'Copy Markdown'}
                      </button>
                    </div>
                  </div>

                  {/* Active parameter chips — shows the user exactly which query params
                      are baked into this card's URL right now. Hidden when there are no
                      customizations to avoid noise. */}
                  {activeForCard.length > 0 && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                        Active params:
                      </span>
                      {activeForCard.map((p) => (
                        <span
                          key={p.key}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-[11px] font-mono"
                          title={`?${p.key}=${p.value}`}
                        >
                          <span className="font-semibold">{p.key}</span>
                          <span className="opacity-70">=</span>
                          <span className="truncate max-w-[120px]">{p.value}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* SVG Card Viewer */}
                  <div className="flex items-center justify-center p-8 bg-zinc-100/60 dark:bg-zinc-950/60 rounded-xl my-6 border border-zinc-200/60 dark:border-zinc-800/40 overflow-x-auto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={card.previewUrl}
                      alt={card.title}
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                      className="rounded-lg shadow-md transition-transform hover:scale-[1.01]"
                    />
                  </div>

                  {/* Device-widths Preview Strip — proves responsive SVG at multiple container sizes */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                      <span>Renders at any width</span>
                      <span className="normal-case text-zinc-400 font-normal">
                        Same SVG, three container widths
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                      {[300, 640, 1024].map((w) => (
                        <div
                          key={w}
                          className="bg-zinc-100/60 dark:bg-zinc-950/60 rounded-lg border border-zinc-200/60 dark:border-zinc-800/40 p-3 flex flex-col items-center"
                        >
                          <span className="text-[10px] font-mono text-zinc-400 mb-2">
                            container {w}px
                          </span>
                          <div style={{ width: `${w}px`, maxWidth: '100%' }} className="mx-auto">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={card.previewUrl}
                              alt={`${card.title} at ${w}px`}
                              style={{ width: '100%', height: 'auto', display: 'block' }}
                              className="rounded shadow-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
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
        <section id="parameters" className="max-w-6xl min-[2400px]:max-w-7xl min-[3840px]:max-w-[1600px] mx-auto px-6 min-[2400px]:px-12 min-[3840px]:px-24 py-16 border-t border-zinc-200 dark:border-zinc-800">
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
                <tr>
                  <td className="p-4 font-semibold text-blue-600 dark:text-blue-400">width</td>
                  <td className="p-4 text-zinc-500">Responsive</td>
                  <td className="p-4 text-zinc-700 dark:text-zinc-300">200–4000 (integer)</td>
                  <td className="p-4 font-sans text-zinc-600 dark:text-zinc-400">Optional fixed width in pixels. Overrides the default responsive scaling for badge-style embeds. Out-of-range or invalid values fall back to responsive.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Deployment & Free Vercel Setup */}
        <section id="deployment" className="max-w-6xl min-[2400px]:max-w-7xl min-[3840px]:max-w-[1600px] mx-auto px-6 min-[2400px]:px-12 min-[3840px]:px-24 py-16 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
                Self-Hosting on Vercel Free Tier
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Four steps. About 5 minutes. Zero compute hours per README view.
              </p>
            </div>
            <a
              href="https://github.com/AhmedTrooper/GitGlyph/fork"
              target="_blank"
              rel="noopener noreferrer"
              className="self-start sm:self-auto px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500 shadow-sm transition-colors flex items-center gap-2"
            >
              <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z" />
              </svg>
              Fork on GitHub ↗
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Step 1: Fork */}
            <div className="relative p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <span className="absolute top-3 right-3 text-[10px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500">STEP 1</span>
              <div className="text-2xl mb-2">🍴</div>
              <h3 className="font-semibold text-sm mb-1 text-zinc-900 dark:text-zinc-100">
                Fork the repository
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Click <strong className="text-zinc-900 dark:text-zinc-100">Fork on GitHub</strong> above. This creates <code className="font-mono text-blue-500">your-username/GitGlyph</code> under your account so you can deploy it with your own credentials.
              </p>
            </div>

            {/* Step 2: Vercel Import */}
            <div className="relative p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <span className="absolute top-3 right-3 text-[10px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500">STEP 2</span>
              <div className="text-2xl mb-2">▲</div>
              <h3 className="font-semibold text-sm mb-1 text-zinc-900 dark:text-zinc-100">
                Import to Vercel
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Visit <a href="https://vercel.com/new" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">vercel.com/new</a>, pick your forked repo, and click <strong className="text-zinc-900 dark:text-zinc-100">Deploy</strong>. The first build runs before any env vars are set &mdash; that&apos;s expected and will produce error cards. We&apos;ll fix that next.
              </p>
            </div>

            {/* Step 3: Env vars */}
            <div className="relative p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <span className="absolute top-3 right-3 text-[10px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500">STEP 3</span>
              <div className="text-2xl mb-2">🔑</div>
              <h3 className="font-semibold text-sm mb-1 text-zinc-900 dark:text-zinc-100">
                Add Environment Variables
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                In Vercel Project Settings → Environment Variables, add all four:
              </p>
              <ul className="mt-2 text-xs text-zinc-700 dark:text-zinc-300 space-y-1 font-mono">
                <li><code className="text-blue-500">GITHUB_TOKEN</code> <span className="text-zinc-500">— PAT, 0 scopes, 5k req/hr</span></li>
                <li><code className="text-blue-500">GITHUB_USERNAME</code> <span className="text-zinc-500">— your handle</span></li>
                <li><code className="text-blue-500">GITHUB_REPO</code> <span className="text-zinc-500">— default repo</span></li>
                <li><code className="text-blue-500">NEXT_PUBLIC_APP_URL</code> <span className="text-zinc-500">— your Vercel URL (optional)</span></li>
              </ul>
            </div>

            {/* Step 4: Embed */}
            <div className="relative p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <span className="absolute top-3 right-3 text-[10px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500">STEP 4</span>
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-semibold text-sm mb-1 text-zinc-900 dark:text-zinc-100">
                Embed clean URLs
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Redeploy once env vars are set, then drop a clean URL into your README:
              </p>
              <pre className="mt-2 p-2 rounded bg-zinc-950 text-zinc-200 text-[10px] font-mono overflow-x-auto border border-zinc-800">
                <code>{`![Stats](${readmeBaseUrl}/api/stats)`}</code>
              </pre>
              <p className="mt-2 text-[10px] text-zinc-500">
                Cached for 5h via <code className="font-mono text-blue-500">s-maxage=18000</code>. Zero compute hours per view.
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
