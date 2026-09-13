import { UserStats } from './github';

export type CardTheme = 'light' | 'dark' | 'tokyo-night' | 'dracula';

interface ThemeColors {
  bg: string;
  border: string;
  title: string;
  text: string;
  icon: string;
  statBold: string;
}

const THEMES: Record<CardTheme, ThemeColors> = {
  light: {
    bg: '#ffffff',
    border: '#e1e4e8',
    title: '#0969da',
    text: '#57606a',
    icon: '#57606a',
    statBold: '#24292f',
  },
  dark: {
    bg: '#0d1117',
    border: '#30363d',
    title: '#58a6ff',
    text: '#8b949e',
    icon: '#8b949e',
    statBold: '#c9d1d9',
  },
  'tokyo-night': {
    bg: '#1a1b26',
    border: '#414868',
    title: '#7aa2f7',
    text: '#9aa5ce',
    icon: '#7aa2f7',
    statBold: '#cfc9c2',
  },
  dracula: {
    bg: '#282a36',
    border: '#6272a4',
    title: '#bd93f9',
    text: '#bfbfbf',
    icon: '#ff79c6',
    statBold: '#f8f8f2',
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

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toLocaleString('en-US');
}

// Crisp inline SVG vector paths
const ICONS = {
  star: 'M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z',
  commit: 'M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5Zm-1.43-.75a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z',
  pr: 'M7.177 3.073 9.573.677A.25.25 0 0 1 10 .854v4.792a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm-2.25.75a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm1.5 8a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm9-4a2.25 2.25 0 1 0-1.5-2.122v3.744a2.25 2.25 0 1 0 1.5 0V7.25Zm-.75-3.5a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Zm0 8a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Z',
  issue: 'M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm9 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-.25-6.25a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0v-3.5Z',
  repo: 'M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5v-9Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8V1.5Z',
  followers: 'M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4.002 4.002 0 0 0-7.899 0 .75.75 0 0 1-1.483-.235 5.508 5.508 0 0 1 3.034-4.084A3.486 3.486 0 0 1 2 5.5ZM5.5 3.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm5.25.5a.75.75 0 0 1 .75.75 2.75 2.75 0 0 1 0 5.5.75.75 0 0 1 0-1.5 1.25 1.25 0 0 0 0-2.5.75.75 0 0 1-.75-.75Zm1.71 8.283a.75.75 0 1 1 .58-1.383 3.513 3.513 0 0 1 2.21 3.35.75.75 0 0 1-1.5 0 2.012 2.012 0 0 0-1.29-1.967Z',
};

export function renderCard(stats: UserStats, themeName: CardTheme = 'light'): string {
  const theme = THEMES[themeName] || THEMES.light;
  const title = `${escapeXml(stats.name || stats.login)}'s GitHub Stats`;

  return `
<svg width="450" height="195" viewBox="0 0 450 195" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .title { font: 600 17px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; fill: ${theme.title}; }
    .stat-label { font: 400 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; fill: ${theme.text}; }
    .stat-value { font: 700 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; fill: ${theme.statBold}; }
    .icon { fill: ${theme.icon}; }
  </style>

  <!-- Background Card -->
  <rect x="0.5" y="0.5" width="449" height="194" rx="10" fill="${theme.bg}" stroke="${theme.border}"/>

  <!-- Card Header -->
  <text x="25" y="35" class="title">${title}</text>

  <!-- Left Column -->
  <!-- Stars -->
  <g transform="translate(25, 60)">
    <svg class="icon" viewBox="0 0 16 16" width="16" height="16">
      <path d="${ICONS.star}"/>
    </svg>
    <text x="25" y="12.5" class="stat-label">Stars Earned:</text>
    <text x="175" y="12.5" class="stat-value">${formatNumber(stats.totalStars)}</text>
  </g>

  <!-- Commits -->
  <g transform="translate(25, 95)">
    <svg class="icon" viewBox="0 0 16 16" width="16" height="16">
      <path d="${ICONS.commit}"/>
    </svg>
    <text x="25" y="12.5" class="stat-label">Public Commits:</text>
    <text x="175" y="12.5" class="stat-value">${formatNumber(stats.totalCommits)}</text>
  </g>

  <!-- Pull Requests -->
  <g transform="translate(25, 130)">
    <svg class="icon" viewBox="0 0 16 16" width="16" height="16">
      <path d="${ICONS.pr}"/>
    </svg>
    <text x="25" y="12.5" class="stat-label">Public PRs:</text>
    <text x="175" y="12.5" class="stat-value">${formatNumber(stats.totalPRs)}</text>
  </g>

  <!-- Right Column -->
  <!-- Issues -->
  <g transform="translate(245, 60)">
    <svg class="icon" viewBox="0 0 16 16" width="16" height="16">
      <path d="${ICONS.issue}"/>
    </svg>
    <text x="25" y="12.5" class="stat-label">Public Issues:</text>
    <text x="160" y="12.5" class="stat-value">${formatNumber(stats.totalIssues)}</text>
  </g>

  <!-- Repos -->
  <g transform="translate(245, 95)">
    <svg class="icon" viewBox="0 0 16 16" width="16" height="16">
      <path d="${ICONS.repo}"/>
    </svg>
    <text x="25" y="12.5" class="stat-label">Public Repos:</text>
    <text x="160" y="12.5" class="stat-value">${formatNumber(stats.publicRepos)}</text>
  </g>

  <!-- Followers -->
  <g transform="translate(245, 130)">
    <svg class="icon" viewBox="0 0 16 16" width="16" height="16">
      <path d="${ICONS.followers}"/>
    </svg>
    <text x="25" y="12.5" class="stat-label">Followers:</text>
    <text x="160" y="12.5" class="stat-value">${formatNumber(stats.followers)}</text>
  </g>
</svg>
  `.trim();
}

export function renderErrorCard(message: string): string {
  return `
<svg width="450" height="120" viewBox="0 0 450 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .title { font: 600 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: #cf222e; }
    .sub { font: 400 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: #57606a; }
  </style>
  <rect x="0.5" y="0.5" width="449" height="119" rx="10" fill="#ffffff" stroke="#ff8182"/>
  <text x="25" y="45" class="title">Unable to fetch GitHub Stats</text>
  <text x="25" y="75" class="sub">${escapeXml(message)}</text>
</svg>
  `.trim();
}
