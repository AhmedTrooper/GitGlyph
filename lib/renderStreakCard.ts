import { StreakStats } from './streak';
import { CardTheme } from './renderCard';

interface ThemeColors {
  bg: string;
  border: string;
  title: string;
  text: string;
  fire: string;
  ring: string;
  bold: string;
}

const THEMES: Record<CardTheme, ThemeColors> = {
  light: {
    bg: '#ffffff',
    border: '#e1e4e8',
    title: '#0969da',
    text: '#57606a',
    fire: '#fa4549',
    ring: '#fd8c73',
    bold: '#24292f',
  },
  dark: {
    bg: '#0d1117',
    border: '#30363d',
    title: '#58a6ff',
    text: '#8b949e',
    fire: '#ff7b72',
    ring: '#ffa657',
    bold: '#c9d1d9',
  },
  'tokyo-night': {
    bg: '#1a1b26',
    border: '#414868',
    title: '#7aa2f7',
    text: '#9aa5ce',
    fire: '#f7768e',
    ring: '#ff9e64',
    bold: '#cfc9c2',
  },
  dracula: {
    bg: '#282a36',
    border: '#6272a4',
    title: '#bd93f9',
    text: '#bfbfbf',
    fire: '#ff5555',
    ring: '#ffb86c',
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

function formatDateRange(start: string, end: string): string {
  if (!start || !end) return 'None';
  const parse = (d: string) => {
    const parts = d.split('-');
    if (parts.length < 3) return d;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[parseInt(parts[1], 10) - 1] || parts[1];
    const day = parseInt(parts[2], 10);
    return `${month} ${day}`;
  };
  return `${parse(start)} – ${parse(end)}`;
}

export function renderStreakCard(stats: StreakStats, themeName: CardTheme = 'light'): string {
  const theme = THEMES[themeName] || THEMES.light;
  const displayName = escapeXml(stats.name || stats.login);

  return `
<svg width="450" height="195" viewBox="0 0 450 195" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .title { font: 600 17px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: ${theme.title}; }
    .label { font: 600 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: ${theme.text}; text-transform: uppercase; letter-spacing: 0.5px; }
    .value { font: 800 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: ${theme.bold}; }
    .range { font: 400 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: ${theme.text}; }
    .fire { fill: ${theme.fire}; }
    .ring { stroke: ${theme.border}; }
  </style>

  <!-- Background -->
  <rect x="0.5" y="0.5" width="449" height="194" rx="10" fill="${theme.bg}" stroke="${theme.border}"/>

  <!-- Title -->
  <text x="25" y="35" class="title">${displayName}'s Contribution Streak</text>

  <!-- Divider lines -->
  <line x1="150" y1="55" x2="150" y2="165" stroke="${theme.border}" stroke-width="1"/>
  <line x1="300" y1="55" x2="300" y2="165" stroke="${theme.border}" stroke-width="1"/>

  <!-- Column 1: Total Contributions -->
  <g transform="translate(25, 65)">
    <text x="50" y="20" text-anchor="middle" class="label">Total</text>
    <text x="50" y="55" text-anchor="middle" class="value">${stats.totalContributions.toLocaleString()}</text>
    <text x="50" y="80" text-anchor="middle" class="range">Past Year</text>
  </g>

  <!-- Column 2: Current Streak (Hero) -->
  <g transform="translate(175, 60)">
    <!-- Fire Icon -->
    <svg x="38" y="0" width="24" height="24" viewBox="0 0 24 24" class="fire">
      <path fill="currentColor" d="M12 23c6.075 0 11-4.925 11-11 0-4.004-2.146-7.51-5.352-9.444a1 1 0 0 0-1.464 1.11C16.89 6.284 17 8.1 17 9.5c0 1.25-.357 2.417-.974 3.407C14.77 10.96 13.5 8.7 13.5 6a1 1 0 0 0-1.782-.62C9.408 8.283 8 11.528 8 14.5c0 .338.02.67.058.997A5.992 5.992 0 0 1 7 14c0-2.316.945-4.412 2.47-5.938a1 1 0 0 0-1.414-1.414A10.96 10.96 0 0 0 5 14c0 4.97 4.03 9 9 9Z"/>
    </svg>
    <text x="50" y="42" text-anchor="middle" class="label">Current Streak</text>
    <text x="50" y="70" text-anchor="middle" class="value">${stats.currentStreak} ${stats.currentStreak === 1 ? 'day' : 'days'}</text>
    <text x="50" y="92" text-anchor="middle" class="range">${formatDateRange(stats.currentStreakStart, stats.currentStreakEnd)}</text>
  </g>

  <!-- Column 3: Longest Streak -->
  <g transform="translate(325, 65)">
    <text x="50" y="20" text-anchor="middle" class="label">Longest Streak</text>
    <text x="50" y="55" text-anchor="middle" class="value">${stats.longestStreak} ${stats.longestStreak === 1 ? 'day' : 'days'}</text>
    <text x="50" y="80" text-anchor="middle" class="range">${formatDateRange(stats.longestStreakStart, stats.longestStreakEnd)}</text>
  </g>
</svg>
  `.trim();
}
