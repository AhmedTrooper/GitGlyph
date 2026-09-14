import { UserStats } from './github';
import { getTheme, CustomThemeOptions } from './themes';
import { PADDING, RESPONSIVE_STYLE_CSS, publicBadge, svgRootAttrs } from './svgBadge';

export type CardLayout = 'horizontal' | 'vertical';

export interface RenderCardOptions extends CustomThemeOptions {
  layout?: CardLayout;
  customTitle?: string | null;
  /**
   * Optional fixed output width in pixels. When omitted (default) the SVG
   * drops its `width`/`height` attributes and scales fluidly to fill any
   * container. When provided (e.g. for badge-style embeds), the SVG gets a
   * `width="N"` attribute and renders at a fixed intrinsic size.
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

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toLocaleString('en-US');
}

/**
 * Approximate max characters that fit in the title at the default 17px font
 * width before clipping. Avoids long usernames/custom titles from spilling
 * over the right border.
 */
function truncateTitle(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, Math.max(1, maxChars - 1)) + '…';
}

/**
 * Truncate arbitrary text (titles, error messages) to a maximum number of
 * characters, appending an ellipsis. Shared by error cards and titles.
 */
function truncateText(text: string, maxChars: number): string {
  return truncateTitle(text, maxChars);
}

const ICONS = {
  star: 'M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z',
  commit: 'M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5Zm-1.43-.75a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z',
  pr: 'M7.177 3.073 9.573.677A.25.25 0 0 1 10 .854v4.792a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm-2.25.75a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm1.5 8a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm9-4a2.25 2.25 0 1 0-1.5-2.122v3.744a2.25 2.25 0 1 0 1.5 0V7.25Zm-.75-3.5a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Zm0 8a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Z',
  issue: 'M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm9 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-.25-6.25a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0v-3.5Z',
  repo: 'M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5v-9Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8V1.5Z',
  followers: 'M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4.002 4.002 0 0 0-7.899 0 .75.75 0 0 1-1.483-.235 5.508 5.508 0 0 1 3.034-4.084A3.486 3.486 0 0 1 2 5.5ZM5.5 3.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm5.25.5a.75.75 0 0 1 .75.75 2.75 2.75 0 0 1 0 5.5.75.75 0 0 1 0-1.5 1.25 1.25 0 0 0 0-2.5.75.75 0 0 1-.75-.75Zm1.71 8.283a.75.75 0 1 1 .58-1.383 3.513 3.513 0 0 1 2.21 3.35.75.75 0 0 1-1.5 0 2.012 2.012 0 0 0-1.29-1.967Z',
};

export function renderCard(stats: UserStats, options: RenderCardOptions = {}): string {
  const theme = getTheme(options);
  const layout = options.layout === 'vertical' ? 'vertical' : 'horizontal';
  const rawTitle = options.customTitle || `${stats.name || stats.login}'s GitHub Stats`;
  // Reserve space on the right for the PUBLIC pill, then truncate the title
  // so the two never overlap.
  const titleMaxChars = layout === 'vertical' ? 26 : 38;
  const title = escapeXml(truncateTitle(rawTitle, titleMaxChars));
  const intrinsicWidth = layout === 'vertical' ? 320 : 450;
  const badge = publicBadge(intrinsicWidth, theme.badgeBg, theme.border, theme.badgeText);

  if (layout === 'vertical') {
    const width = 320;
    const height = 285;
    // Available width inside the card after subtracting PADDING on each side
    const innerWidth = width - PADDING * 2;
    // Right-side value x within group at translate(PADDING, y): group ends at
    // PADDING + innerWidth, so the right-anchored text sits at x = innerWidth.
    const valueX = innerWidth;
    return `
<svg ${svgRootAttrs(width, height, options.requestedWidth)}>
  <style>
    .title { font: 600 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: ${theme.title}; }
    ${RESPONSIVE_STYLE_CSS}
    .stat-label { font: 400 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: ${theme.text}; }
    .stat-value { font: 700 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: ${theme.bold}; }
    .icon { fill: ${theme.icon}; }
  </style>

  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="10" fill="${theme.bg}" stroke="${theme.border}"/>
  ${badge}
  <text x="${PADDING}" y="35" class="title">${title}</text>

  <g transform="translate(${PADDING}, 65)">
    <svg class="icon" viewBox="0 0 16 16" width="16" height="16"><path d="${ICONS.star}"/></svg>
    <text x="25" y="12.5" class="stat-label">Stars:</text>
    <text x="${valueX}" y="12.5" text-anchor="end" class="stat-value">${formatNumber(stats.totalStars)}</text>
  </g>

  <g transform="translate(${PADDING}, 100)">
    <svg class="icon" viewBox="0 0 16 16" width="16" height="16"><path d="${ICONS.commit}"/></svg>
    <text x="25" y="12.5" class="stat-label">Commits:</text>
    <text x="${valueX}" y="12.5" text-anchor="end" class="stat-value">${formatNumber(stats.totalCommits)}</text>
  </g>

  <g transform="translate(${PADDING}, 135)">
    <svg class="icon" viewBox="0 0 16 16" width="16" height="16"><path d="${ICONS.pr}"/></svg>
    <text x="25" y="12.5" class="stat-label">PRs:</text>
    <text x="${valueX}" y="12.5" text-anchor="end" class="stat-value">${formatNumber(stats.totalPRs)}</text>
  </g>

  <g transform="translate(${PADDING}, 170)">
    <svg class="icon" viewBox="0 0 16 16" width="16" height="16"><path d="${ICONS.issue}"/></svg>
    <text x="25" y="12.5" class="stat-label">Issues:</text>
    <text x="${valueX}" y="12.5" text-anchor="end" class="stat-value">${formatNumber(stats.totalIssues)}</text>
  </g>

  <g transform="translate(${PADDING}, 205)">
    <svg class="icon" viewBox="0 0 16 16" width="16" height="16"><path d="${ICONS.repo}"/></svg>
    <text x="25" y="12.5" class="stat-label">Repos:</text>
    <text x="${valueX}" y="12.5" text-anchor="end" class="stat-value">${formatNumber(stats.publicRepos)}</text>
  </g>

  <g transform="translate(${PADDING}, 240)">
    <svg class="icon" viewBox="0 0 16 16" width="16" height="16"><path d="${ICONS.followers}"/></svg>
    <text x="25" y="12.5" class="stat-label">Followers:</text>
    <text x="${valueX}" y="12.5" text-anchor="end" class="stat-value">${formatNumber(stats.followers)}</text>
  </g>
</svg>
    `.trim();
  }

  // Horizontal layout (default)
  const width = 450;
  const height = 195;
  const innerWidth = width - PADDING * 2;
  // Two columns each ~195px wide (gap of ~10px between them)
  const columnWidth = (innerWidth - 10) / 2;
  const rightColumnX = PADDING + columnWidth + 10;
  const leftValueX = columnWidth;
  const rightValueX = columnWidth;
  return `
<svg ${svgRootAttrs(width, height, options.requestedWidth)}>
  <style>
    .title { font: 600 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: ${theme.title}; }
    ${RESPONSIVE_STYLE_CSS}
    .stat-label { font: 400 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: ${theme.text}; }
    .stat-value { font: 700 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: ${theme.bold}; }
    .icon { fill: ${theme.icon}; }
  </style>

  <!-- Background Card -->
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="10" fill="${theme.bg}" stroke="${theme.border}"/>

  <!-- Card Header -->
  ${badge}
  <text x="${PADDING}" y="35" class="title">${title}</text>

  <!-- Left Column -->
  <g transform="translate(${PADDING}, 60)">
    <svg class="icon" viewBox="0 0 16 16" width="16" height="16"><path d="${ICONS.star}"/></svg>
    <text x="25" y="12.5" class="stat-label">Stars:</text>
    <text x="${leftValueX}" y="12.5" text-anchor="end" class="stat-value">${formatNumber(stats.totalStars)}</text>
  </g>

  <g transform="translate(${PADDING}, 95)">
    <svg class="icon" viewBox="0 0 16 16" width="16" height="16"><path d="${ICONS.commit}"/></svg>
    <text x="25" y="12.5" class="stat-label">Commits:</text>
    <text x="${leftValueX}" y="12.5" text-anchor="end" class="stat-value">${formatNumber(stats.totalCommits)}</text>
  </g>

  <g transform="translate(${PADDING}, 130)">
    <svg class="icon" viewBox="0 0 16 16" width="16" height="16"><path d="${ICONS.pr}"/></svg>
    <text x="25" y="12.5" class="stat-label">PRs:</text>
    <text x="${leftValueX}" y="12.5" text-anchor="end" class="stat-value">${formatNumber(stats.totalPRs)}</text>
  </g>

  <!-- Right Column -->
  <g transform="translate(${rightColumnX}, 60)">
    <svg class="icon" viewBox="0 0 16 16" width="16" height="16"><path d="${ICONS.issue}"/></svg>
    <text x="25" y="12.5" class="stat-label">Issues:</text>
    <text x="${rightValueX}" y="12.5" text-anchor="end" class="stat-value">${formatNumber(stats.totalIssues)}</text>
  </g>

  <g transform="translate(${rightColumnX}, 95)">
    <svg class="icon" viewBox="0 0 16 16" width="16" height="16"><path d="${ICONS.repo}"/></svg>
    <text x="25" y="12.5" class="stat-label">Repos:</text>
    <text x="${rightValueX}" y="12.5" text-anchor="end" class="stat-value">${formatNumber(stats.publicRepos)}</text>
  </g>

  <g transform="translate(${rightColumnX}, 130)">
    <svg class="icon" viewBox="0 0 16 16" width="16" height="16"><path d="${ICONS.followers}"/></svg>
    <text x="25" y="12.5" class="stat-label">Followers:</text>
    <text x="${rightValueX}" y="12.5" text-anchor="end" class="stat-value">${formatNumber(stats.followers)}</text>
  </g>
</svg>
  `.trim();
}

export function renderErrorCard(message: string, requestedWidth?: number): string {
  return `
<svg ${svgRootAttrs(450, 120, requestedWidth)}>
  <style>
    ${RESPONSIVE_STYLE_CSS}
    .title { font: 600 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: #cf222e; }
    .sub { font: 400 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: #57606a; }
  </style>
  <rect x="0.5" y="0.5" width="449" height="119" rx="10" fill="#ffffff" stroke="#ff8182"/>
  <text x="${PADDING}" y="45" class="title">Unable to fetch GitHub Stats</text>
  <text x="${PADDING}" y="75" class="sub">${escapeXml(truncateText(message, 70))}</text>
</svg>
  `.trim();
}
