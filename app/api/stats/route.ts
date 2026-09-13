import { NextResponse } from 'next/server';
import { fetchUserStats } from '@/lib/github';
import { renderCard, renderErrorCard, CardLayout } from '@/lib/renderCard';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // 1. Resolve username
  const username =
    searchParams.get('username')?.trim() ||
    process.env.GITHUB_USERNAME?.trim() ||
    'octocat';

  // 2. Query options
  const theme = searchParams.get('theme');
  const layout = (searchParams.get('layout') === 'vertical' ? 'vertical' : 'horizontal') as CardLayout;
  const hideBorder = searchParams.get('hide_border') === 'true';
  const customTitle = searchParams.get('custom_title');
  const bg = searchParams.get('bg_color');
  const border = searchParams.get('border_color');
  const titleColor = searchParams.get('title_color');
  const text = searchParams.get('text_color');

  try {
    const stats = await fetchUserStats(username);
    const svg = renderCard(stats, {
      theme,
      layout,
      hideBorder,
      customTitle,
      bg,
      border,
      title: titleColor,
      text,
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
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
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
