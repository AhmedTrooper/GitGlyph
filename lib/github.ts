export interface UserStats {
  name: string;
  login: string;
  totalStars: number;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  publicRepos: number;
  followers: number;
}

const GRAPHQL_QUERY = `
  query userInfo($login: String!) {
    user(login: $login) {
      name
      login
      followers {
        totalCount
      }
      repositories(first: 100, ownerAffiliations: OWNER, isFork: false, orderBy: {field: STARGAZERS, direction: DESC}) {
        totalCount
        nodes {
          stargazerCount
        }
      }
      contributionsCollection {
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
      }
    }
  }
`;

export async function fetchUserStats(username: string): Promise<UserStats> {
  const token = process.env.GITHUB_TOKEN?.trim();

  // If token is available, attempt GraphQL query (single ultra-fast round-trip for Vercel Free)
  if (token) {
    try {
      const gqlRes = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': 'gitglyph-stats',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: GRAPHQL_QUERY,
          variables: { login: username },
        }),
      });

      if (gqlRes.ok) {
        const result = await gqlRes.json();
        const user = result?.data?.user;

        if (user) {
          const repoNodes: Array<{ stargazerCount?: number }> = user.repositories?.nodes || [];
          const totalStars = repoNodes.reduce((acc, curr) => acc + (curr.stargazerCount || 0), 0);

          return {
            name: user.name || user.login,
            login: user.login,
            totalStars,
            totalCommits: user.contributionsCollection?.totalCommitContributions || 0,
            totalPRs: user.contributionsCollection?.totalPullRequestContributions || 0,
            totalIssues: user.contributionsCollection?.totalIssueContributions || 0,
            publicRepos: user.repositories?.totalCount || 0,
            followers: user.followers?.totalCount || 0,
          };
        }
      }
    } catch {
      // Fallback to REST API if GraphQL encounters network or query errors
    }
  }

  // REST API Fallback
  const headers: Record<string, string> = {
    'User-Agent': 'gitglyph-stats',
    Accept: 'application/vnd.github.v3+json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const restRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
    headers,
  });

  if (!restRes.ok) {
    throw new Error(`GitHub user not found or API error (${restRes.status})`);
  }

  const data = await restRes.json();

  return {
    name: data.name || data.login,
    login: data.login,
    totalStars: 0, // REST user endpoint doesn't aggregate stars without extra repo calls
    totalCommits: 0,
    totalPRs: 0,
    totalIssues: 0,
    publicRepos: data.public_repos || 0,
    followers: data.followers || 0,
  };
}
