import { UserLanguages } from './languages';
import { CardTheme } from './renderCard';

interface ThemeColors {
  bg: string;
  border: string;
  title: string;
  text: string;
  bold: string;
}

const THEMES: Record<CardTheme, ThemeColors> = {
  light: {
    bg: '#ffffff',
    border: '#e1e4e8',
    title: '#0969da',
    text: '#57606a',
    bold: '#24292f',
  },
  dark: {
    bg: '#0d1117',
    border: '#30363d',
    title: '#58a6ff',
    text: '#8b949e',
    bold: '#c9d1d9',
  },
  'tokyo-night': {
    bg: '#1a1b26',
    border: '#414868',
    title: '#7aa2f7',
    text: '#9aa5ce',
    bold: '#cfc9c2',
  },
  dracula: {
    bg: '#282a36',
    border: '#6272a4',
    title: '#bd93f9',
    text: '#bfbfbf',
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

export function renderLanguagesCard(userLangs: UserLanguages, themeName: CardTheme = 'light'): string {
  const theme = THEMES[themeName] || THEMES.light;
  const displayName = escapeXml(userLangs.name || userLangs.login);
  const langs = userLangs.languages;

  // Calculate progress bar segments (total bar width = 400px)
  const barWidth = 400;
  let currentX = 0;
  const barSegments = langs.map((lang, index) => {
    const width = Math.max(2, (lang.percent / 100) * barWidth);
    const segX = currentX;
    currentX += width;
    return `
      <rect
        x="${segX}"
        y="0"
        width="${width}"
        height="8"
        fill="${lang.color}"
        ${index === 0 ? 'rx="4"' : ''}
      />
    `.trim();
  }).join('\n    ');

  // Legend grid (2 columns)
  const col1 = langs.slice(0, 3);
  const col2 = langs.slice(3, 6);

  const renderLegendItem = (lang: typeof langs[0], y: number) => `
    <g transform="translate(0, ${y})">
      <circle cx="5" cy="5" r="5" fill="${lang.color}"/>
      <text x="18" y="9" class="lang-name">${escapeXml(lang.name)}</text>
      <text x="160" y="9" class="lang-percent">${lang.percent}%</text>
    </g>
  `.trim();

  const col1Markup = col1.map((l, i) => renderLegendItem(l, i * 28)).join('\n      ');
  const col2Markup = col2.map((l, i) => renderLegendItem(l, i * 28)).join('\n      ');

  return `
<svg width="450" height="195" viewBox="0 0 450 195" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    .title { font: 600 17px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: ${theme.title}; }
    .lang-name { font: 500 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: ${theme.bold}; }
    .lang-percent { font: 400 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: ${theme.text}; text-anchor: end; }
    .empty { font: 400 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: ${theme.text}; }
  </style>

  <!-- Card Background -->
  <rect x="0.5" y="0.5" width="449" height="194" rx="10" fill="${theme.bg}" stroke="${theme.border}"/>

  <!-- Title -->
  <text x="25" y="35" class="title">${displayName}'s Most Used Languages</text>

  ${
    langs.length === 0
      ? `<text x="25" y="95" class="empty">No public language data found</text>`
      : `
  <!-- Progress Bar Container -->
  <g transform="translate(25, 55)">
    <rect width="${barWidth}" height="8" rx="4" fill="${theme.border}"/>
    <g clip-path="url(#bar-clip)">
      ${barSegments}
    </g>
  </g>
  <clipPath id="bar-clip">
    <rect width="${barWidth}" height="8" rx="4"/>
  </clipPath>

  <!-- Legend Columns -->
  <g transform="translate(25, 85)">
    <!-- Column 1 -->
    <g>
      ${col1Markup}
    </g>

    <!-- Column 2 -->
    <g transform="translate(210, 0)">
      ${col2Markup}
    </g>
  </g>
  `
  }
</svg>
  `.trim();
}
