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

  // Tailwind utility shortcuts — keeps the JSX below readable without
  // repeating the same 6-class combo on every input/select.
  const inputClass =
    'w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--foreground)] font-mono placeholder:text-[var(--subtle)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-colors';
  const selectClass =
    'w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-colors';
  const labelClass = 'block text-xs font-semibold uppercase tracking-wider text-[var(--subtle)] mb-1.5';
  const hintClass = 'mt-1 text-[11px] text-[var(--subtle)] leading-relaxed';
  const cardClass =
    'rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_1px_2px_rgb(0_0_0_/_0.04),0_8px_24px_-12px_rgb(0_0_0_/_0.08)]';

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans antialiased">
      {/* Decorative ambient gradient — soft, very low opacity. Adds depth
          without competing with the content. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[80rem] h-[40rem] rounded-full bg-[var(--accent)] opacity-[0.06] blur-3xl" />
        <div className="absolute top-1/3 right-0 w-[40rem] h-[40rem] rounded-full bg-[var(--accent)] opacity-[0.04] blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md supports-[backdrop-filter]:bg-[var(--background)]/60">
        <div className="max-w-6xl min-[2400px]:max-w-7xl min-[3840px]:max-w-[1600px] mx-auto px-6 min-[2400px]:px-12 min-[3840px]:px-24 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="text-xl">⚡</span>
            <span className="font-bold text-base tracking-tight bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              GitGlyph
            </span>
          </div>
          <div className="hidden md:flex items-center gap-1 text-sm font-medium">
            {[
              ['#playground', 'Playground'],
              ['#parameters', 'Parameters'],
              ['#deployment', 'Self-Hosting'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="px-3 py-1.5 rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors"
              >
                {label}
              </a>
            ))}
            <Link
              href="/docs"
              className="px-3 py-1.5 rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors"
            >
              API Reference
            </Link>
            <a
              href="https://github.com/AhmedTrooper/GitGlyph"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 px-3 py-1.5 rounded-md border border-[var(--border-strong)] text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
              </svg>
              Fork
            </a>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            className="md:hidden p-2 rounded-lg border border-[var(--border-strong)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors"
          >
            {mobileMenuOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--border)] bg-[var(--surface)]">
            <div className="max-w-6xl min-[2400px]:max-w-7xl min-[3840px]:max-w-[1600px] mx-auto px-6 min-[2400px]:px-12 min-[3840px]:px-24 py-3 flex flex-col gap-1 text-sm font-medium">
              {[
                ['#playground', 'Playground'],
                ['#parameters', 'Parameters'],
                ['#deployment', 'Self-Hosting'],
              ].map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors"
                >
                  {label}
                </a>
              ))}
              <Link
                href="/docs"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors"
              >
                API Reference
              </Link>
              <a
                href="https://github.com/AhmedTrooper/GitGlyph"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-md text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors"
              >
                Fork on GitHub ↗
              </a>
            </div>
          </div>
        )}
      </nav>

      <main>
        {/* Hero Section */}
        <header className="max-w-6xl min-[2400px]:max-w-7xl min-[3840px]:max-w-[1600px] mx-auto px-6 min-[2400px]:px-12 min-[3840px]:px-24 pt-12 sm:pt-20 pb-10 sm:pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--success-soft)] text-[var(--success-text)] border border-[var(--success)]/20 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" aria-hidden="true" />
            <span>Self-Hosted</span>
            <span aria-hidden="true" className="opacity-50">·</span>
            <span>Zero URL Clutter</span>
          </div>
          <h1 className="text-4xl sm:text-6xl min-[2400px]:text-7xl min-[3840px]:text-8xl min-[6000px]:text-9xl font-extrabold tracking-tight text-[var(--foreground)] max-w-3xl min-[2400px]:max-w-5xl min-[3840px]:max-w-6xl mx-auto leading-[1.05]">
            Dynamic GitHub SVG Cards
            <br className="hidden sm:block" />{' '}
            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              for your README
            </span>
          </h1>
          <p className="mt-6 text-base sm:text-lg min-[2400px]:text-xl min-[3840px]:text-2xl text-[var(--muted)] max-w-2xl min-[2400px]:max-w-3xl mx-auto leading-relaxed prose-readable">
            Fork this repository, deploy to Vercel with your GitHub token, and embed clean URLs like{' '}
            <code className="px-1.5 py-0.5 rounded-md bg-[var(--code-inline-bg)] text-[var(--code-inline-fg)] font-mono text-[0.9em]">/api/stats</code>{' '}
            directly in your README. No query parameters required for self-hosted instances.
          </p>
        </header>

        {/* Interactive Playground & Live Preview */}
        <section id="playground" className="max-w-6xl min-[2400px]:max-w-7xl min-[3840px]:max-w-[1600px] mx-auto px-6 min-[2400px]:px-12 min-[3840px]:px-24 pb-20">
          <div className={`${cardClass} p-6 sm:p-8 mb-10`}>
            {/* Customizer Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-5 border-b border-[var(--border)]">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
                  <span aria-hidden="true">🎛️</span> Interactive Customizer
                </h2>
                <p className="text-sm text-[var(--muted)] mt-1">
                  Customize every query parameter supported by the API in real time.
                </p>
              </div>
              {hasCustomizations && (
                <button
                  onClick={resetAll}
                  className="self-start sm:self-auto text-sm px-3.5 py-1.5 rounded-lg border border-[var(--border-strong)] hover:bg-[var(--surface-2)] hover:border-[var(--accent)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex items-center gap-1.5 font-medium"
                >
                  <span aria-hidden="true">↺</span> Reset all
                </button>
              )}
            </div>

            {/* Block 1: Theme, Layout & Domain */}
            <div className="mb-7">
              <h3 className={`${labelClass}`}>
                <span className="text-[var(--accent)] mr-2">01</span>Theme &amp; Orientation
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Theme Selector */}
                <div>
                  <label className={labelClass}>
                    Preset Theme <code className="font-mono text-[10px] text-[var(--subtle)] normal-case tracking-normal">theme</code>
                  </label>
                  <div className="relative">
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      className={`${selectClass} appearance-none pr-9 cursor-pointer`}
                    >
                      {THEME_OPTIONS.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <svg aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--subtle)]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {THEME_OPTIONS.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTheme(t.id)}
                        aria-label={`Switch to ${t.name} theme`}
                        aria-pressed={theme === t.id}
                        className={`w-6 h-6 rounded-md border-2 transition-all ${
                          theme === t.id
                            ? 'border-[var(--accent)] scale-110 shadow-sm'
                            : 'border-[var(--border)] hover:border-[var(--border-strong)]'
                        }`}
                        style={{ background: t.previewBg }}
                      />
                    ))}
                  </div>
                </div>

                {/* Layout Toggle */}
                <div>
                  <label className={labelClass}>
                    Orientation <code className="font-mono text-[10px] text-[var(--subtle)] normal-case tracking-normal">layout</code>
                  </label>
                  <div className="inline-flex w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-1">
                    {(['horizontal', 'vertical'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setLayout(opt)}
                        aria-pressed={layout === opt}
                        className={`flex-1 px-3 py-1.5 text-sm rounded-md font-medium transition-all ${
                          layout === opt
                            ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-sm'
                            : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                        }`}
                      >
                        {opt === 'horizontal' ? 'Horizontal' : 'Vertical'}
                      </button>
                    ))}
                  </div>
                  <p className={hintClass}>Vertical stacks metrics for narrow sidebars.</p>
                </div>

                {/* Output Width Mode (Auto / Fixed) */}
                <div>
                  <label className={labelClass}>
                    Output Width <code className="font-mono text-[10px] text-[var(--subtle)] normal-case tracking-normal">width</code>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={widthMode}
                      onChange={(e) => setWidthMode(e.target.value as 'auto' | 'fixed')}
                      className={`${selectClass} flex-shrink-0 cursor-pointer`}
                    >
                      <option value="auto">Auto</option>
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
                        className={inputClass}
                      />
                    )}
                  </div>
                  {widthMode === 'fixed' && (
                    <p className={hintClass}>200–4000 px. Out-of-range falls back to fluid.</p>
                  )}
                </div>

                {/* Hide Border Toggle */}
                <div>
                  <label className={labelClass}>Border</label>
                  <button
                    type="button"
                    onClick={() => setHideBorder((v) => !v)}
                    aria-pressed={hideBorder}
                    className={`w-full flex items-center gap-3 h-[42px] px-3.5 rounded-lg border transition-all font-medium text-sm ${
                      hideBorder
                        ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-text)]'
                        : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--foreground)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <span
                      className={`relative w-9 h-5 rounded-full transition-colors ${
                        hideBorder ? 'bg-[var(--accent)]' : 'bg-[var(--surface-3)]'
                      }`}
                      aria-hidden="true"
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                          hideBorder ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </span>
                    <span>Hide border <code className="font-mono text-[10px] text-[var(--subtle)] ml-1">hide_border</code></span>
                  </button>
                </div>
              </div>

              {/* Deployment Domain — full width on its own row below for readability */}
              <div className="mt-5">
                <div className="flex items-center justify-between mb-1.5">
                  <label className={labelClass}>
                    Deployment Domain <code className="font-mono text-[10px] text-[var(--subtle)] normal-case tracking-normal">base URL</code>
                  </label>
                  <span className="text-[11px] text-[var(--subtle)] font-mono">
                    {detectedDomain ? '✓ Auto-detected from browser' : 'From NEXT_PUBLIC_APP_URL env'}
                  </span>
                </div>
                <input
                  type="text"
                  value={domainOverride}
                  onChange={(e) => setDomainOverride(e.target.value)}
                  placeholder={detectedDomain || defaultAppUrl}
                  className={inputClass}
                />
                <p className={hintClass}>Base URL baked into the README snippet. Override to point at your self-hosted instance.</p>
              </div>
            </div>

            {/* Block 2: Text & Identity Overrides */}
            <div className="mb-7">
              <h3 className={`${labelClass}`}>
                <span className="text-[var(--accent)] mr-2">02</span>Text &amp; Identity Overrides
              </h3>

              {/* Behaviour clarification banner — addresses the common confusion where
                  users expect Custom Title to replace the whole card body. It only
                  rewrites the header line; the six stat rows always render. */}
              <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-[var(--accent-soft)] bg-[var(--accent-soft)]/40 px-3 py-2.5">
                <svg
                  viewBox="0 0 16 16"
                  className="w-4 h-4 mt-0.5 shrink-0 text-[var(--accent)]"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16Zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287ZM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
                </svg>
                <p className="text-[11.5px] leading-relaxed text-[var(--foreground)]">
                  <strong className="font-semibold">Custom Title only rewrites the card&apos;s header.</strong>{' '}
                  The 6 stat rows (Stars, Commits, PRs, Issues, Repos, Followers) always render below it &mdash;
                  to swap the <em>whose</em> stats, change <strong className="font-semibold">Username</strong>, not Custom Title.
                </p>
              </div>

              <p className="text-[11px] text-[var(--subtle)] mb-4 -mt-1 leading-relaxed">
                Leave <strong className="text-[var(--muted)] font-semibold">Username</strong> empty to fall back to your{' '}
                <code className="font-mono text-[10px] bg-[var(--code-inline-bg)] text-[var(--code-inline-fg)] px-1 rounded">GITHUB_USERNAME</code> env.
                Unknown users return a styled error card &mdash; no 404.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Custom Title Override — affects ONLY the card header, not the stat rows */}
                <div>
                  <label className={labelClass}>
                    Custom Title <code className="font-mono text-[10px] text-[var(--subtle)] normal-case tracking-normal">custom_title</code>
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. Ahmed's Open Source"
                    className={inputClass}
                  />
                  <div className="mt-1.5 flex items-center gap-2 text-[11px]">
                    <span className="text-[var(--subtle)]">SVG header shows:</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[var(--surface-3)] text-[var(--foreground)] font-mono text-[11px] max-w-[180px] truncate">
                      {customTitle.trim() || `${username.trim() || 'Md. Ramjan Miah'}'s GitHub Stats`}
                    </span>
                  </div>
                </div>

                {/* Username Override — controls WHOSE stats the card displays */}
                <div>
                  <label className={labelClass}>
                    Username <code className="font-mono text-[10px] text-[var(--subtle)] normal-case tracking-normal">username</code>
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="torvalds · gaearon · tj"
                    className={inputClass}
                  />
                  <div className="mt-1.5 flex items-center gap-2 text-[11px]">
                    <span className="text-[var(--subtle)]">Stats pulled for:</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[var(--surface-3)] text-[var(--foreground)] font-mono text-[11px] max-w-[180px] truncate">
                      {username.trim() || 'ahmedtrooper (env default)'}
                    </span>
                  </div>
                </div>

                {/* Pinned Repo Override — only used by the Pinned Repo card */}
                <div>
                  <label className={labelClass}>
                    Pinned Repo <code className="font-mono text-[10px] text-[var(--subtle)] normal-case tracking-normal">repo</code>
                  </label>
                  <input
                    type="text"
                    value={repo}
                    onChange={(e) => setRepo(e.target.value)}
                    placeholder="vercel/next.js"
                    className={inputClass}
                  />
                  <div className="mt-1.5 flex items-center gap-2 text-[11px]">
                    <span className="text-[var(--subtle)]">Repo card shows:</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[var(--surface-3)] text-[var(--foreground)] font-mono text-[11px] max-w-[180px] truncate">
                      {repo.trim() || 'RoleTect (env default)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Block 3: Hex Color Overrides */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className={labelClass}>
                  <span className="text-[var(--accent)] mr-2">03</span>Hex Color Overrides
                </h3>
                {(bgColor || borderColor || titleColor || textColor) && (
                  <button
                    onClick={resetCustomColors}
                    className="text-xs text-[var(--accent-text)] hover:text-[var(--accent)] hover:underline font-semibold"
                  >
                    Clear colors
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(
                  [
                    { label: 'Background', key: 'bg_color', state: bgColor, setter: setBgColor, def: activeThemeColors.bg },
                    { label: 'Border', key: 'border_color', state: borderColor, setter: setBorderColor, def: activeThemeColors.border },
                    { label: 'Title', key: 'title_color', state: titleColor, setter: setTitleColor, def: activeThemeColors.title },
                    { label: 'Text', key: 'text_color', state: textColor, setter: setTextColor, def: activeThemeColors.text },
                  ] as const
                ).map((c) => (
                  <div key={c.key}>
                    <label className={labelClass}>
                      {c.label} <code className="font-mono text-[10px] text-[var(--subtle)] normal-case tracking-normal">{c.key}</code>
                    </label>
                    <div className="flex items-center gap-2">
                      <label
                        className="relative w-9 h-9 rounded-lg border border-[var(--border)] cursor-pointer overflow-hidden hover:border-[var(--border-strong)] transition-colors"
                        style={{ background: c.state ? `#${c.state.replace(/^#/, '')}` : c.def }}
                      >
                        <input
                          type="color"
                          value={c.state ? (c.state.startsWith('#') ? c.state : `#${c.state}`) : c.def}
                          onChange={(e) => c.setter(e.target.value.replace(/^#/, ''))}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          aria-label={`Pick ${c.label.toLowerCase()} color`}
                        />
                      </label>
                      <input
                        type="text"
                        value={c.state}
                        onChange={(e) => c.setter(e.target.value.replace(/^#/, ''))}
                        placeholder={c.def.replace(/^#/, '')}
                        className={`${inputClass} flex-1`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rendered Live Cards Grid */}
          <div className="space-y-10">
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
                  className={`${cardClass} p-6 sm:p-8`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 pb-5 mb-5 border-b border-[var(--border)]">
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-[var(--accent-soft)] text-[var(--accent-text)] text-xs font-mono font-bold">
                          {card.id === 'stats' && 'S'}
                          {card.id === 'streak' && 'T'}
                          {card.id === 'languages' && 'L'}
                          {card.id === 'pin' && 'P'}
                        </span>
                        {card.title}
                      </h3>
                      <p className="text-sm text-[var(--muted)] mt-1.5 prose-readable">
                        {card.desc}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <a
                        href={card.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-sm font-medium rounded-lg border border-[var(--border-strong)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors"
                      >
                        Open SVG ↗
                      </a>
                      <button
                        onClick={() => copyToClipboard(card.snippetUrl, copyUrlId)}
                        className="px-3 py-1.5 text-sm font-medium rounded-lg border border-[var(--border-strong)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors min-w-[110px]"
                      >
                        {copiedId === copyUrlId ? '✓ URL Copied' : 'Copy URL'}
                      </button>
                      <button
                        onClick={() => copyToClipboard(markdownCode, card.id)}
                        className="px-3.5 py-1.5 text-sm font-semibold rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 shadow-sm transition-colors min-w-[140px]"
                      >
                        {copiedId === card.id ? '✓ Markdown Copied' : 'Copy Markdown'}
                      </button>
                    </div>
                  </div>

                  {/* Active parameter chips — shows the user exactly which query params
                      are baked into this card's URL right now. Hidden when there are no
                      customizations to avoid noise. */}
                  {activeForCard.length > 0 && (
                    <div className="mb-5 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--subtle)] mr-1">
                        Active params
                      </span>
                      {activeForCard.map((p) => (
                        <span
                          key={p.key}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--accent-soft)] text-[var(--accent-text)] text-[11px] font-mono border border-[var(--accent)]/15"
                          title={`?${p.key}=${p.value}`}
                        >
                          <span className="font-semibold">{p.key}</span>
                          <span className="opacity-50">=</span>
                          <span className="truncate max-w-[120px]">{p.value}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* SVG Card Viewer */}
                  <div className="flex items-center justify-center p-6 sm:p-10 bg-[var(--surface-2)] rounded-xl my-5 border border-[var(--border)] overflow-x-auto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={card.previewUrl}
                      alt={card.title}
                      style={{ width: '100%', height: 'auto', display: 'block', maxWidth: `${card.width}px` }}
                      className="rounded-lg shadow-md transition-transform hover:scale-[1.005]"
                    />
                  </div>

                  {/* Device-widths Preview Strip — proves responsive SVG at multiple container sizes */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--subtle)]">
                        Renders at any width
                      </span>
                      <span className="text-xs text-[var(--subtle)]">
                        Same SVG, three container widths
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      {[300, 640, 1024].map((w) => (
                        <div
                          key={w}
                          className="bg-[var(--surface-2)] rounded-lg border border-[var(--border)] p-3 flex flex-col items-center"
                        >
                          <span className="text-[11px] font-mono text-[var(--subtle)] mb-2">
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
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--subtle)]">
                        Clean Markdown for your README
                      </span>
                      <span className="text-xs text-[var(--subtle)]">
                        Uses your configured environment variables automatically
                      </span>
                    </div>
                    <pre className="p-4 rounded-lg bg-[var(--code-bg)] text-[var(--code-fg)] text-sm font-mono overflow-x-auto border border-[var(--border)] shadow-inner">
                      <code>{markdownCode}</code>
                    </pre>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Query Parameters Reference Table */}
        <section id="parameters" className="max-w-6xl min-[2400px]:max-w-7xl min-[3840px]:max-w-[1600px] mx-auto px-6 min-[2400px]:px-12 min-[3840px]:px-24 py-16 border-t border-[var(--border)]">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
              Supported Query Parameters
            </h2>
            <p className="text-sm text-[var(--muted)] mt-2 prose-readable">
              In self-hosted setups, all cards work out of the box with zero parameters. Use these parameters to customize style, layout, or color:
            </p>
          </div>

          <div className={`overflow-x-auto ${cardClass}`}>
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--surface-2)] text-[var(--foreground)] font-semibold border-b border-[var(--border)]">
                <tr>
                  <th className="p-4 font-semibold">Parameter</th>
                  <th className="p-4 font-semibold">Default Source</th>
                  <th className="p-4 font-semibold">Allowed Values</th>
                  <th className="p-4 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] font-mono text-xs">
                {[
                  {
                    name: 'theme',
                    def: <span>&apos;light&apos;</span>,
                    vals: 'light, dark, tokyo-night, dracula, nord, radical, catppuccin',
                    desc: 'Color palette for background, borders, and typography.',
                  },
                  {
                    name: 'layout',
                    def: <span>&apos;horizontal&apos;</span>,
                    vals: 'horizontal, vertical',
                    desc: 'Orientation for Stats and Streak cards. Vertical is ideal for sidebars.',
                  },
                  {
                    name: 'hide_border',
                    def: <span>&apos;false&apos;</span>,
                    vals: 'true, false',
                    desc: 'Hides the outer stroke for borderless blending.',
                  },
                  {
                    name: 'custom_title',
                    def: 'Auto-generated',
                    vals: 'string',
                    desc: 'Overrides the header title text of the card.',
                  },
                  {
                    name: 'bg_color',
                    def: 'Theme default',
                    vals: 'hex code (e.g. 1a1b26)',
                    desc: 'Custom background color override (without \'#\').',
                  },
                  {
                    name: 'border_color',
                    def: 'Theme default',
                    vals: 'hex code (e.g. 414868)',
                    desc: 'Custom border stroke color override (without \'#\').',
                  },
                  {
                    name: 'title_color',
                    def: 'Theme default',
                    vals: 'hex code (e.g. 7aa2f7)',
                    desc: 'Custom header title color override (without \'#\').',
                  },
                  {
                    name: 'text_color',
                    def: 'Theme default',
                    vals: 'hex code (e.g. c0caf5)',
                    desc: 'Custom body text and metric values color override (without \'#\').',
                  },
                  {
                    name: 'username',
                    def: 'GITHUB_USERNAME env',
                    vals: 'string',
                    desc: 'Optional override. Defaults to your configured GITHUB_USERNAME environment variable.',
                  },
                  {
                    name: 'repo',
                    def: 'GITHUB_REPO env',
                    vals: 'repo-name or owner/repo',
                    desc: 'Optional override for /api/pin. Defaults to your GITHUB_REPO environment variable.',
                  },
                  {
                    name: 'width',
                    def: 'Responsive',
                    vals: '200–4000 (integer)',
                    desc: 'Optional fixed width in pixels. Overrides the default responsive scaling for badge-style embeds. Out-of-range or invalid values fall back to responsive.',
                  },
                ].map((row) => (
                  <tr key={row.name} className="hover:bg-[var(--surface-2)] transition-colors">
                    <td className="p-4 font-semibold text-[var(--accent)] align-top">{row.name}</td>
                    <td className="p-4 text-[var(--muted)] align-top whitespace-nowrap">{row.def}</td>
                    <td className="p-4 text-[var(--muted)] align-top">{row.vals}</td>
                    <td className="p-4 font-sans text-[var(--muted)] align-top leading-relaxed text-[13px]">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Deployment & Free Vercel Setup */}
        <section id="deployment" className="max-w-6xl min-[2400px]:max-w-7xl min-[3840px]:max-w-[1600px] mx-auto px-6 min-[2400px]:px-12 min-[3840px]:px-24 py-16 border-t border-[var(--border)]">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
                Self-Hosting on Vercel Free Tier
              </h2>
              <p className="text-sm text-[var(--muted)] mt-2 prose-readable">
                Four steps. About 5 minutes. Zero compute hours per README view.
              </p>
            </div>
            <a
              href="https://github.com/AhmedTrooper/GitGlyph/fork"
              target="_blank"
              rel="noopener noreferrer"
              className="self-start sm:self-auto px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 shadow-sm transition-colors flex items-center gap-2"
            >
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
                <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z" />
              </svg>
              Fork on GitHub ↗
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: '01',
                emoji: '🍴',
                title: 'Fork the repository',
                body: (
                  <>
                    Click <strong className="text-[var(--foreground)]">Fork on GitHub</strong>. This creates{' '}
                    <code className="font-mono text-[var(--accent)]">your-username/GitGlyph</code>{' '}
                    under your account so you can deploy it with your own credentials.
                  </>
                ),
              },
              {
                step: '02',
                emoji: '▲',
                title: 'Import to Vercel',
                body: (
                  <>
                    Visit{' '}
                    <a href="https://vercel.com/new" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">vercel.com/new</a>,
                    pick your forked repo, and click <strong className="text-[var(--foreground)]">Deploy</strong>.
                    The first build runs before any env vars are set &mdash; that&apos;s expected and will produce error cards.
                  </>
                ),
              },
              {
                step: '03',
                emoji: '🔑',
                title: 'Add Environment Variables',
                body: (
                  <>
                    In Vercel Project Settings → Environment Variables, add all four:
                    <ul className="mt-2 space-y-1 font-mono text-xs">
                      <li><code className="text-[var(--accent)]">GITHUB_TOKEN</code> <span className="text-[var(--subtle)]">— PAT, 0 scopes, 5k req/hr</span></li>
                      <li><code className="text-[var(--accent)]">GITHUB_USERNAME</code> <span className="text-[var(--subtle)]">— your handle</span></li>
                      <li><code className="text-[var(--accent)]">GITHUB_REPO</code> <span className="text-[var(--subtle)]">— default repo</span></li>
                      <li><code className="text-[var(--accent)]">NEXT_PUBLIC_APP_URL</code> <span className="text-[var(--subtle)]">— your Vercel URL</span></li>
                    </ul>
                  </>
                ),
              },
              {
                step: '04',
                emoji: '⚡',
                title: 'Embed clean URLs',
                body: (
                  <>
                    Redeploy once env vars are set, then drop a clean URL into your README:
                    <pre className="mt-2 p-2.5 rounded-md bg-[var(--code-bg)] text-[var(--code-fg)] text-xs font-mono overflow-x-auto border border-[var(--border)]">
                      <code>{`![Stats](${readmeBaseUrl}/api/stats)`}</code>
                    </pre>
                    <p className="mt-2 text-[11px] text-[var(--subtle)]">
                      Cached for 5h via <code className="font-mono text-[var(--accent)]">s-maxage=18000</code>. Zero compute hours per view.
                    </p>
                  </>
                ),
              },
            ].map((s) => (
              <div key={s.step} className={`${cardClass} p-5 relative overflow-hidden`}>
                <span className="absolute top-3 right-3 text-[10px] font-bold tracking-wider text-[var(--subtle)]">STEP {s.step}</span>
                <div className="text-2xl mb-3" aria-hidden="true">{s.emoji}</div>
                <h3 className="font-semibold text-base mb-2 text-[var(--foreground)]">{s.title}</h3>
                <div className="text-sm text-[var(--muted)] leading-relaxed">{s.body}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[var(--border)] py-8 mt-10 text-center text-xs text-[var(--subtle)]">
        <div className="max-w-6xl mx-auto px-6">
          GitGlyph · Self-Hosted Dynamic GitHub Stats · Built with Next.js &amp; Vercel Edge CDN
        </div>
      </footer>
    </div>
  );
}
