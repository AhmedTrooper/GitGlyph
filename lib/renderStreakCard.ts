import { StreakStats } from './streak';
import { getTheme, CustomThemeOptions } from './themes';
import { PADDING, RESPONSIVE_STYLE_CSS, publicBadge, svgRootAttrs } from './svgBadge';

export type StreakLayout = 'horizontal' | 'vertical';

export interface RenderStreakOptions extends CustomThemeOptions {
  layout?: StreakLayout;
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

/**
 * Truncate long titles so they don't overflow the right border on narrow
 * vertical cards or super-long GitHub display names.
 */
function truncateTitle(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, Math.max(1, maxChars - 1)) + '…';
}

export function renderStreakCard(stats: StreakStats, options: RenderStreakOptions = {}): string {
  const theme = getTheme(options);
  const layout = options.layout === 'vertical' ? 'vertical' : 'horizontal';
  const displayName = escapeXml(stats.name || stats.login);
  // Title stays clean — the "PUBLIC" pill in the top-right corner already
  // signals that all metrics below are public-only.
  const rawTitle = options.customTitle || `${displayName}'s Contribution Streak`;
  const titleMaxChars = layout === 'vertical' ? 22 : 32;
  const title = escapeXml(truncateTitle(rawTitle, titleMaxChars));
  const badge = publicBadge(
    layout === 'vertical' ? 320 : 450,
    theme.badgeBg,
    theme.border,
    theme.badgeText
  );

  if (layout === 'vertical') {
    const width = 320;
    const height = 270;
    return `
<svg ${svgRootAttrs(width, height, options.requestedWidth)}>
  <style>
    ${RESPONSIVE_STYLE_CSS}
    .title { font: 600 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: ${theme.title}; }
    .label { font: 600 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: ${theme.text}; text-transform: uppercase; letter-spacing: 0.5px; }
    .value { font: 800 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: ${theme.bold}; }
    .range { font: 400 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: ${theme.text}; }
    .fire { fill: ${theme.fire}; }
  </style>

  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="10" fill="${theme.bg}" stroke="${theme.border}"/>
  ${badge}
  <text x="${PADDING}" y="32" class="title">${title}</text>

  <!-- Row 1: Total Contributions -->
  <g transform="translate(${PADDING}, 65)">
    <text x="0" y="16" class="label">Total Contributions</text>
    <text x="0" y="42" class="value">${stats.totalContributions.toLocaleString()}</text>
    <text x="0" y="58" class="range">Past Year</text>
  </g>

  <!-- Row 2: Current Streak -->
  <g transform="translate(${PADDING}, 130)">
    <text x="0" y="16" class="label">Current Streak</text>
    <text x="0" y="42" class="value">${stats.currentStreak} ${stats.currentStreak === 1 ? 'day' : 'days'}</text>
    <text x="0" y="58" class="range">${formatDateRange(stats.currentStreakStart, stats.currentStreakEnd)}</text>
  </g>

  <!-- Row 3: Max Streak -->
  <g transform="translate(${PADDING}, 200)">
    <text x="0" y="16" class="label">Max Streak</text>
    <text x="0" y="42" class="value">${stats.longestStreak} ${stats.longestStreak === 1 ? 'day' : 'days'}</text>
    <text x="0" y="58" class="range">${formatDateRange(stats.longestStreakStart, stats.longestStreakEnd)}</text>
  </g>
</svg>
    `.trim();
  }

  // Horizontal layout (default)
  const width = 450;
  const height = 195;
  // 3 columns of equal width inside [PADDING, width - PADDING]
  const innerWidth = width - PADDING * 2; // 400
  const columnWidth = innerWidth / 3;     // 133.33
  const col2X = PADDING + columnWidth;     // 158.33
  const col3X = PADDING + columnWidth * 2; // 291.67
  // Center each column's contents around its midpoint
  const halfCol = columnWidth / 2;
  // Dividers sit 5px inside the column boundaries
  const divider1X = col2X - 5;
  const divider2X = col3X - 5;
  return `
<svg ${svgRootAttrs(width, height, options.requestedWidth)}>
  <style>
    ${RESPONSIVE_STYLE_CSS}
    .title { font: 600 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: ${theme.title}; }
    .label { font: 600 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: ${theme.text}; text-transform: uppercase; letter-spacing: 0.3px; }
    .value { font: 800 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: ${theme.bold}; }
    .range { font: 400 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: ${theme.text}; }
    .fire { fill: ${theme.fire}; }
  </style>

  <!-- Background -->
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="10" fill="${theme.bg}" stroke="${theme.border}"/>

  ${badge}
  <!-- Title -->
  <text x="${PADDING}" y="35" class="title">${title}</text>

  <!-- Divider lines -->
  <line x1="${divider1X}" y1="55" x2="${divider1X}" y2="175" stroke="${theme.border}" stroke-width="1"/>
  <line x1="${divider2X}" y1="55" x2="${divider2X}" y2="175" stroke="${theme.border}" stroke-width="1"/>

  <!-- Column 1: Total Contributions -->
  <g transform="translate(${PADDING}, 65)">
    <text x="${halfCol}" y="20" text-anchor="middle" class="label">Total Contributions</text>
    <text x="${halfCol}" y="55" text-anchor="middle" class="value">${stats.totalContributions.toLocaleString()}</text>
    <text x="${halfCol}" y="80" text-anchor="middle" class="range">Past Year</text>
  </g>

  <!-- Column 2: Current Streak (Hero) -->
  <g transform="translate(${col2X}, 60)">
    <svg x="${halfCol - 12}" y="0" width="24" height="24" viewBox="0 0 24 24" class="fire">
      <path fill="currentColor" d="M12 23c6.075 0 11-4.925 11-11 0-4.004-2.146-7.51-5.352-9.444a1 1 0 0 0-1.464 1.11C16.89 6.284 17 8.1 17 9.5c0 1.25-.357 2.417-.974 3.407C14.77 10.96 13.5 8.7 13.5 6a1 1 0 0 0-1.782-.62C9.408 8.283 8 11.528 8 14.5c0 .338.02.67.058.997A5.992 5.992 0 0 1 7 14c0-2.316.945-4.412 2.47-5.938a1 1 0 0 0-1.414-1.414A10.96 10.96 0 0 0 5 14c0 4.97 4.03 9 9 9Z"/>
    </svg>
    <text x="${halfCol}" y="42" text-anchor="middle" class="label">Current Streak</text>
    <text x="${halfCol}" y="70" text-anchor="middle" class="value">${stats.currentStreak} ${stats.currentStreak === 1 ? 'day' : 'days'}</text>
    <text x="${halfCol}" y="92" text-anchor="middle" class="range">${formatDateRange(stats.currentStreakStart, stats.currentStreakEnd)}</text>
  </g>

  <!-- Column 3: Longest Streak -->
  <g transform="translate(${col3X}, 65)">
    <text x="${halfCol}" y="20" text-anchor="middle" class="label">Max Streak</text>
    <text x="${halfCol}" y="55" text-anchor="middle" class="value">${stats.longestStreak} ${stats.longestStreak === 1 ? 'day' : 'days'}</text>
    <text x="${halfCol}" y="80" text-anchor="middle" class="range">${formatDateRange(stats.longestStreakStart, stats.longestStreakEnd)}</text>
  </g>
</svg>
  `.trim();
}
