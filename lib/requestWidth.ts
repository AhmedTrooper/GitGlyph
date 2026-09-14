/**
 * Parse the optional `?width=N` query parameter used by every card API
 * route. When present, the SVG is forced to that exact intrinsic width
 * (useful for badge-style embeds). When absent (or invalid), the SVG
 * defaults to responsive behavior — drops width/height attrs and scales
 * fluidly to its container.
 *
 * Valid range is 200–4000 px (smallest sensible card → ~4K width).
 * Out-of-range or non-numeric values are ignored — we never throw on a
 * malformed query parameter; we just degrade gracefully to the responsive
 * default. README embeds with `?width=garbage` should still render.
 */
const MIN_WIDTH = 200;
const MAX_WIDTH = 4000;

export function parseRequestedWidth(raw: string | null | undefined): number | undefined {
  if (!raw) return undefined;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return undefined;
  if (n < MIN_WIDTH || n > MAX_WIDTH) return undefined;
  return n;
}
