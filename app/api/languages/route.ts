import { NextResponse } from 'next/server';
import { fetchUserLanguages } from '@/lib/languages';
import { renderLanguagesCard } from '@/lib/renderLanguagesCard';
import { renderErrorCard } from '@/lib/renderCard';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // 1. Resolve username: query param -> GITHUB_USERNAME env var
  const username =
    searchParams.get('username')?.trim() ||
    process.env.GITHUB_USERNAME?.trim() ||
    '';

  if (!username) {
    const errorSvg = renderErrorCard('Missing username. Set GITHUB_USERNAME in environment or pass ?username=');
    return new NextResponse(errorSvg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }

  // 2. Query options
  const theme = searchParams.get('theme');
  const hideBorder = searchParams.get('hide_border') === 'true';
  const customTitle = searchParams.get('custom_title');
  const bg = searchParams.get('bg_color');
  const border = searchParams.get('border_color');
  const titleColor = searchParams.get('title_color');
  const text = searchParams.get('text_color');

  try {
    const userLangs = await fetchUserLanguages(username);
    const svg = renderLanguagesCard(userLangs, {
      theme,
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
