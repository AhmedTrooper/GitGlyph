import { NextResponse } from 'next/server';

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

function renderErrorSvg(title: string, message: string): string {
  return `
    <svg width="400" height="150" viewBox="0 0 400 150" xmlns="http://www.w3.org/2000/svg">
      <style>
        .header { font: 600 16px 'Segoe UI', Ubuntu, Sans-Serif; fill: #cf222e; }
        .stat { font: 400 13px 'Segoe UI', Ubuntu, Sans-Serif; fill: #57606a; }
      </style>
      <rect width="100%" height="100%" rx="10" fill="#fff" stroke="#ff8182" stroke-width="1"/>
      <text x="25" y="40" class="header">${escapeXml(title)}</text>
      <text x="25" y="75" class="stat">${escapeXml(message)}</text>
      <text x="25" y="105" class="stat">Check your username and GITHUB_TOKEN.</text>
    </svg>
  `.trim();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Resolve username: search parameter -> GITHUB_USERNAME env var -> fallback 'octocat'
  const username =
    searchParams.get('username')?.trim() ||
    process.env.GITHUB_USERNAME?.trim() ||
    'octocat';

  const theme = searchParams.get('theme') || 'light';
  const isDark = theme === 'dark';

  // Card theme styling
  const bg = isDark ? '#0d1117' : '#ffffff';
  const border = isDark ? '#30363d' : '#e1e4e8';
  const headerColor = isDark ? '#58a6ff' : '#2f80ed';
  const statColor = isDark ? '#c9d1d9' : '#434d58';

  // 1. Prepare request headers for GitHub API
  const headers: Record<string, string> = {
    'User-Agent': 'github-stats-generator',
    Accept: 'application/vnd.github.v3+json',
  };

  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 2. Fetch user data from GitHub API
  try {
    const ghRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers,
    });

    if (!ghRes.ok) {
      const errorMsg =
        ghRes.status === 404
          ? `User '${username}' not found`
          : `GitHub API error (status ${ghRes.status})`;
      
      const errorSvg = renderErrorSvg('Failed to fetch GitHub stats', errorMsg);
      return new NextResponse(errorSvg, {
        status: ghRes.status,
        headers: {
          'Content-Type': 'image/svg+xml; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }

    const data = await ghRes.json();

    // 3. Generate raw SVG string
    const displayName = data.name || data.login;
    const svg = `
      <svg width="400" height="150" viewBox="0 0 400 150" xmlns="http://www.w3.org/2000/svg">
        <style>
          .header { font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${headerColor}; }
          .stat { font: 400 14px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${statColor}; }
          .bold { font-weight: 700; }
        </style>
        <rect width="100%" height="100%" rx="10" fill="${bg}" stroke="${border}" stroke-width="1"/>
        <text x="25" y="35" class="header">${escapeXml(displayName)}'s Stats</text>
        <text x="25" y="70" class="stat">Public Repos: <tspan class="bold">${escapeXml(data.public_repos ?? 0)}</tspan></text>
        <text x="25" y="95" class="stat">Followers: <tspan class="bold">${escapeXml(data.followers ?? 0)}</tspan></text>
        <text x="25" y="120" class="stat">Following: <tspan class="bold">${escapeXml(data.following ?? 0)}</tspan></text>
      </svg>
    `.trim();

    // 4. Return SVG with CDN cache headers (5 hours = 18000s)
    return new NextResponse(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=0, s-maxage=18000, stale-while-revalidate=86400',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const errorSvg = renderErrorSvg('Unexpected Error', message);
    return new NextResponse(errorSvg, {
      status: 500,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }
}
