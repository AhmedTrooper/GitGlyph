/**
 * Centralized username resolution used by every public API route.
 *
 * Fallback chain (in order):
 *   1. ?username= query parameter on the request URL (per-card override)
 *   2. GITHUB_USERNAME environment variable (self-hosted default)
 *   3. Hardcoded fallback: 'ahmedtrooper' (always-defined last resort so the
 *      API never returns an empty username, even on misconfigured instances)
 *
 * Empty strings, null, and undefined are treated identically at each step.
 */
export const DEFAULT_GITHUB_USERNAME = 'ahmedtrooper';

export function resolveUsername(
  queryValue: string | null | undefined,
  envValue: string | null | undefined = process.env.GITHUB_USERNAME
): string {
  const trimmedQuery = queryValue?.trim();
  if (trimmedQuery) return trimmedQuery;

  const trimmedEnv = envValue?.trim();
  if (trimmedEnv) return trimmedEnv;

  return DEFAULT_GITHUB_USERNAME;
}
