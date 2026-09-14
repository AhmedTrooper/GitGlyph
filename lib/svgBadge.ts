/**
 * Shared SVG layout constants used by every GitGlyph card.
 *
 * Internal PADDING keeps card content from visually touching the rounded
 * border stroke.
 */
export const PADDING = 25;

/**
 * Text shown in the SVG `<title>` element — browsers display this as a
 * tooltip on hover, and screen readers announce it as the card's accessible
 * name. Signals that all metrics below are derived from PUBLIC GitHub
 * activity (the API token has 0 scopes).
 */
export const PUBLIC_TOOLTIP_TEXT = 'Public data only — derived from your public GitHub activity (no private repo, commit, or org data is accessible)';

/**
 * Empty CSS export kept for backwards compatibility with renderers that
 * previously styled a visible badge pill. The pill has been removed in favor
 * of a hover tooltip; the export remains so renderer imports don't break.
 */
export const PUBLIC_BADGE_CSS = '';

/**
 * Returns an SVG `<title>` element to be placed at the top of every card.
 *
 * This is what the user sees on hover (browser tooltip) and what screen
 * readers announce as the card's accessible name. We deliberately keep the
 * signal out of the visible card body — a single "PUBLIC" pill in the
 * corner cluttered the layout and left no room for long custom titles.
 *
 * Signature kept for backwards compatibility (cardWidth, badgeBg, border,
 * fill) — all four arguments are now ignored because the tooltip text is
 * identical on every card regardless of theme.
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
export function publicBadge(
  _cardWidth: number,
  _badgeBg: string,
  _border: string,
  _fill: string
): string {
  // Escape XML special chars in the tooltip text.
  const safe = PUBLIC_TOOLTIP_TEXT
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return `<title>${safe}</title>`;
}
/* eslint-enable @typescript-eslint/no-unused-vars */

/**
 * Returns the attributes string for the root `<svg>` element of every card.
 *
 * Two modes:
 *  - **Responsive (default)**: when `requestedWidth` is omitted, the SVG
 *    drops `width`/`height` and relies on `viewBox` + the inline `<style>`
 *    block (added by each renderer) to scale fluidly to any container.
 *    This is what GitHub README columns need: an `<img>` with no intrinsic
 *    size fills the column at any device width from 300px mobile to 8K.
 *  - **Fixed (opt-in)**: when `requestedWidth` is a positive number, the
 *    SVG gets `width="N"` so it renders at that exact intrinsic size —
 *    useful for badge-style embeds in places like status pages where the
 *    width must be capped.
 *
 * @param intrinsicW  The card's intrinsic width in viewBox units (e.g. 450)
 * @param intrinsicH  The card's intrinsic height in viewBox units (e.g. 195)
 * @param requestedWidth  Optional pixel width override (200–4000)
 */
export function svgRootAttrs(
  intrinsicW: number,
  intrinsicH: number,
  requestedWidth?: number
): string {
  const sizeAttr =
    requestedWidth && requestedWidth > 0
      ? ` width="${Math.floor(requestedWidth)}"`
      : '';
  // No width/height attrs in responsive mode → browser uses viewBox + CSS
  // style (added in each renderer's <style> block) to scale to container.
  return (
    `xmlns="http://www.w3.org/2000/svg" class="gg-root" viewBox="0 0 ${intrinsicW} ${intrinsicH}"` +
    ` preserveAspectRatio="xMidYMid meet"${sizeAttr}` +
    ` role="img"`
  );
}

/**
 * Inline `<style>` snippet every card should include in its root `<svg>` so
 * the SVG scales to fill its container when no fixed width is requested.
 * Drops the `<style>` block in fixed-width mode where it has no effect.
 *
 * Scope the rule to the root `<svg>` only (via a class) so nested icon
 * SVGs inside the card keep their intrinsic 16×16 size. Without scoping,
 * every nested `<svg>` would also get `width: 100%` and balloon to fill
 * the scaled-up card.
 */
export const RESPONSIVE_STYLE_CSS = `
    svg.gg-root { width: 100%; height: auto; display: block; }`;
