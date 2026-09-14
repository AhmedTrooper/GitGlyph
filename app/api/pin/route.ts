import { NextResponse } from 'next/server';
import { fetchRepoDetails } from '@/lib/pin';
import { renderRepoCard } from '@/lib/renderRepoCard';
import { renderErrorCard } from '@/lib/renderCard';
import { resolveUsername } from '@/lib/username';
import { parseRequestedWidth } from '@/lib/requestWidth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // 1. Resolve repo
  const repo =
    searchParams.get('repo')?.trim() ||
    process.env.GITHUB_REPO?.trim() ||
    '';

  // defaultOwner: query param -> GITHUB_USERNAME env -> hardcoded 'ahmedtrooper'
  const defaultOwner = resolveUsername(searchParams.get('username'));
  const requestedWidth = parseRequestedWidth(searchParams.get('width'));

  // 2. Query options
  const theme = searchParams.get('theme');
  const hideBorder = searchParams.get('hide_border') === 'true';
  const customTitle = searchParams.get('custom_title');
  const bg = searchParams.get('bg_color');
  const border = searchParams.get('border_color');
  const titleColor = searchParams.get('title_color');
  const text = searchParams.get('text_color');

  if (!repo) {
    const errorSvg = renderErrorCard('Missing repo parameter. Specify ?repo=repo-name or set GITHUB_REPO.', requestedWidth);
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
    const svg = renderRepoCard(repoDetails, {
      theme,
      hideBorder,
      customTitle,
      bg,
      border,
      title: titleColor,
      text,
      requestedWidth,
    });

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
    const errorSvg = renderErrorCard(message, requestedWidth);

    return new NextResponse(errorSvg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }
}
