import { RepoDetails } from './pin';
import { CardTheme } from './renderCard';

interface ThemeColors {
  bg: string;
  border: string;
  title: string;
  text: string;
  badgeBg: string;
  badgeText: string;
  bold: string;
}

const THEMES: Record<CardTheme, ThemeColors> = {
  light: {
    bg: '#ffffff',
    border: '#e1e4e8',
    title: '#0969da',
    text: '#57606a',
    badgeBg: '#f6f8fa',
    badgeText: '#57606a',
    bold: '#24292f',
  },
  dark: {
    bg: '#0d1117',
    border: '#30363d',
    title: '#58a6ff',
    text: '#8b949e',
    badgeBg: '#161b22',
    badgeText: '#8b949e',
    bold: '#c9d1d9',
  },
  'tokyo-night': {
    bg: '#1a1b26',
    border: '#414868',
    title: '#7aa2f7',
    text: '#9aa5ce',
    badgeBg: '#24283b',
    badgeText: '#7aa2f7',
    bold: '#cfc9c2',
  },
  dracula: {
    bg: '#282a36',
    border: '#6272a4',
    title: '#bd93f9',
    text: '#bfbfbf',
    badgeBg: '#44475a',
    badgeText: '#f8f8f2',
    bold: '#f8f8f2',
  },
};

function escapeXml(unsafe: string | number | null | undefined): string {
  if (unsafe == null) return '';
  return String(unsafe).replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '\'':
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1) + '…';
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toLocaleString('en-US');
}

const ICONS = {
  repo: 'M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5v-9Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8V1.5Z',
  star: 'M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z',
  fork: 'M5 3.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm0 2.122a2.25 2.25 0 1 0-1.5 0v.878A2.25 2.25 0 0 0 5.75 8.5h4.5A2.25 2.25 0 0 0 12.5 6.25v-.878a2.25 2.25 0 1 0-1.5 0v.878a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 1 5 6.25v-.878Zm6.75-2.122a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM8 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM9.5 12.75a2.25 2.25 0 1 0-2.25 2.25.75.75 0 0 0 .75-.75v-2.25h.75a.75.75 0 0 0 .75-.75Z',
};

export function renderRepoCard(repo: RepoDetails, themeName: CardTheme = 'light'): string {
  const theme = THEMES[themeName] || THEMES.light;
  const description = escapeXml(truncateText(repo.description, 85));
  const badgeLabel = repo.isFork ? 'Fork' : 'Public';

  return `
<svg width="450" height="140" viewBox="0 0 450 140" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .repo-title { font: 600 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: ${theme.title}; }
    .badge { font: 500 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: ${theme.badgeText}; }
    .description { font: 400 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: ${theme.text}; }
    .meta-text { font: 500 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: ${theme.text}; }
    .icon { fill: ${theme.text}; }
  </style>

  <!-- Background -->
  <rect x="0.5" y="0.5" width="449" height="139" rx="10" fill="${theme.bg}" stroke="${theme.border}"/>

  <!-- Repo Header -->
  <g transform="translate(25, 25)">
    <svg class="icon" viewBox="0 0 16 16" width="16" height="16" y="2">
      <path d="${ICONS.repo}"/>
    </svg>
    <text x="24" y="15" class="repo-title">${escapeXml(repo.name)}</text>
    
    <!-- Public/Fork Pill Badge -->
    <g transform="translate(335, 0)">
      <rect width="55" height="18" rx="9" fill="${theme.badgeBg}" stroke="${theme.border}"/>
      <text x="27.5" y="12.5" text-anchor="middle" class="badge">${badgeLabel}</text>
    </g>
  </g>

  <!-- Description -->
  <text x="25" y="68" class="description">${description}</text>

  <!-- Footer Meta (Language, Stars, Forks) -->
  <g transform="translate(25, 105)">
    <!-- Primary Language -->
    <g>
      <circle cx="5" cy="5" r="5" fill="${repo.languageColor}"/>
      <text x="16" y="9" class="meta-text">${escapeXml(repo.language)}</text>
    </g>

    <!-- Stars -->
    <g transform="translate(130, 0)">
      <svg class="icon" viewBox="0 0 16 16" width="14" height="14" y="-1">
        <path d="${ICONS.star}"/>
      </svg>
      <text x="18" y="9" class="meta-text">${formatNumber(repo.stars)}</text>
    </g>

    <!-- Forks -->
    <g transform="translate(210, 0)">
      <svg class="icon" viewBox="0 0 16 16" width="14" height="14" y="-1">
        <path d="${ICONS.fork}"/>
      </svg>
      <text x="18" y="9" class="meta-text">${formatNumber(repo.forks)}</text>
    </g>
  </g>
</svg>
  `.trim();
}
