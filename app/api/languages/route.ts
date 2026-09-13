import { NextResponse } from 'next/server';
import { fetchUserLanguages } from '@/lib/languages';
import { renderLanguagesCard } from '@/lib/renderLanguagesCard';
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
    const userLangs = await fetchUserLanguages(username);
    const svg = renderLanguagesCard(userLangs, theme);

    // 3. Return SVG with Vercel Edge CDN cache headers (5 hours = 18000s)
    return new NextResponse(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=0, s-maxage=18000, stale-while-revalidate=86400',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch languages data';
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
