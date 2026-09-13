import { UserLanguages } from './languages';
import { getTheme, CustomThemeOptions } from './themes';

export interface RenderLanguagesOptions extends CustomThemeOptions {
  customTitle?: string | null;
}

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

export function renderLanguagesCard(userLangs: UserLanguages, options: RenderLanguagesOptions = {}): string {
  const theme = getTheme(options);
  const displayName = escapeXml(userLangs.name || userLangs.login);
  const title = escapeXml(options.customTitle || `${displayName}'s Most Used Languages`);
  const langs = userLangs.languages;

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

  <rect x="0.5" y="0.5" width="449" height="194" rx="10" fill="${theme.bg}" stroke="${theme.border}"/>
  <text x="25" y="35" class="title">${title}</text>

  ${
    langs.length === 0
      ? `<text x="25" y="95" class="empty">No public language data found</text>`
      : `
  <g transform="translate(25, 55)">
    <rect width="${barWidth}" height="8" rx="4" fill="${theme.border}"/>
    <g clip-path="url(#bar-clip)">
      ${barSegments}
    </g>
  </g>
  <clipPath id="bar-clip">
    <rect width="${barWidth}" height="8" rx="4"/>
  </clipPath>

  <g transform="translate(25, 85)">
    <g>
      ${col1Markup}
    </g>
    <g transform="translate(210, 0)">
      ${col2Markup}
    </g>
  </g>
  `
  }
</svg>
  `.trim();
}
