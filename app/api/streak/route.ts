import { NextResponse } from 'next/server';
import { fetchUserStreak } from '@/lib/streak';
import { renderStreakCard } from '@/lib/renderStreakCard';
import { renderErrorCard, CardTheme } from '@/lib/renderCard';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // 1. Resolve username: query param -> GITHUB_USERNAME env var -> fallback 'octocat'
  const username =
    searchParams.get('username')?.trim() ||
    process.env.GITHUB_USERNAME?.trim() ||
    'octocat';

  // 2. Resolve theme
  const themeParam = (searchParams.get('theme') || 'light').toLowerCase();
  const validThemes: CardTheme[] = ['light', 'dark', 'tokyo-night', 'dracula'];
  const theme: CardTheme = validThemes.includes(themeParam as CardTheme)
    ? (themeParam as CardTheme)
    : 'light';

  try {
    const stats = await fetchUserStreak(username);
    const svg = renderStreakCard(stats, theme);

    // 3. Return SVG with Vercel Edge CDN cache headers (5 hours = 18000s)
    return new NextResponse(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=0, s-maxage=18000, stale-while-revalidate=86400',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch streak data';
    const errorSvg = renderErrorCard(message);

    return new NextResponse(errorSvg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }
}
