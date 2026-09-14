import { UserLanguages } from './languages';
import { getTheme, CustomThemeOptions } from './themes';
import { PADDING, RESPONSIVE_STYLE_CSS, publicBadge, svgRootAttrs } from './svgBadge';

export interface RenderLanguagesOptions extends CustomThemeOptions {
  customTitle?: string | null;
  /**
   * Optional fixed output width in pixels. When omitted, the SVG scales
   * fluidly via viewBox + inline CSS. See `svgRootAttrs` for details.
   */
  requestedWidth?: number;
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

/**
 * Internal padding (in px) kept clear on every side so card content never
 * visually touches the rounded border stroke.
 */
function truncateTitle(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, Math.max(1, maxChars - 1)) + '…';
}

export function renderLanguagesCard(userLangs: UserLanguages, options: RenderLanguagesOptions = {}): string {
  const theme = getTheme(options);
  const displayName = escapeXml(userLangs.name || userLangs.login);
  // Title stays clean — the "PUBLIC" pill in the top-right corner already
  // signals that all metrics below are public-only.
  const rawTitle = options.customTitle || `${displayName}'s Top Languages`;
  const title = escapeXml(truncateTitle(rawTitle, 34));
  const badge = publicBadge(450, theme.badgeBg, theme.border, theme.badgeText);
  const langs = userLangs.languages;

  const width = 450;
  const height = 195;
  // Bar spans [PADDING, width - PADDING] so it never touches the left/right borders
  const barWidth = width - PADDING * 2;
  let currentX = 0;
  const barSegments = langs.map((lang, index) => {
    const segWidth = Math.max(2, (lang.percent / 100) * barWidth);
    const segX = currentX;
    currentX += segWidth;
    return `
      <rect
        x="${segX}"
        y="0"
        width="${segWidth}"
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
<svg ${svgRootAttrs(width, height, options.requestedWidth)}>
  <style>
    ${RESPONSIVE_STYLE_CSS}
    .title { font: 600 17px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: ${theme.title}; }
    .lang-name { font: 500 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: ${theme.bold}; }
    .lang-percent { font: 400 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: ${theme.text}; text-anchor: end; }
    .empty { font: 400 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: ${theme.text}; }
  </style>

  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="10" fill="${theme.bg}" stroke="${theme.border}"/>
  ${badge}
  <text x="${PADDING}" y="35" class="title">${title}</text>

  ${
    langs.length === 0
      ? `<text x="${PADDING}" y="95" class="empty">No public language data found</text>`
      : `
  <g transform="translate(${PADDING}, 55)">
    <rect width="${barWidth}" height="8" rx="4" fill="${theme.border}"/>
    <g clip-path="url(#bar-clip)">
      ${barSegments}
    </g>
  </g>
  <clipPath id="bar-clip">
    <rect width="${barWidth}" height="8" rx="4"/>
  </clipPath>

  <g transform="translate(${PADDING}, 85)">
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
