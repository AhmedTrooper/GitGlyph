import { NextResponse } from 'next/server';
import { fetchRepoDetails } from '@/lib/pin';
import { renderRepoCard } from '@/lib/renderRepoCard';
import { renderErrorCard, CardTheme } from '@/lib/renderCard';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // 1. Resolve repo: query param ?repo= -> GITHUB_REPO env var
  const repo =
    searchParams.get('repo')?.trim() ||
    process.env.GITHUB_REPO?.trim() ||
    '';

  const defaultOwner =
    searchParams.get('username')?.trim() ||
    process.env.GITHUB_USERNAME?.trim() ||
    '';

  // 2. Resolve theme
  const themeParam = (searchParams.get('theme') || 'light').toLowerCase();
  const validThemes: CardTheme[] = ['light', 'dark', 'tokyo-night', 'dracula'];
  const theme: CardTheme = validThemes.includes(themeParam as CardTheme)
    ? (themeParam as CardTheme)
    : 'light';

  if (!repo) {
    const errorSvg = renderErrorCard('Missing repo parameter. Specify ?repo=repo-name or set GITHUB_REPO.');
    return new NextResponse(errorSvg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }

  try {
    const repoDetails = await fetchRepoDetails(repo, defaultOwner);
    const svg = renderRepoCard(repoDetails, theme);

    // 3. Return SVG with Vercel Edge CDN cache headers (5 hours = 18000s)
    return new NextResponse(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=0, s-maxage=18000, stale-while-revalidate=86400',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch repository details';
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
