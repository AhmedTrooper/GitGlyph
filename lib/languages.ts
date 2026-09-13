export interface LanguageStat {
  name: string;
  color: string;
  size: number;
  percent: number;
}

export interface UserLanguages {
  name: string;
  login: string;
  languages: LanguageStat[];
}

interface GraphQLLanguagesResponse {
  data?: {
    user?: {
      name?: string;
      login: string;
      repositories?: {
        nodes?: Array<{
          languages?: {
            edges?: Array<{
              size: number;
              node: {
                name: string;
                color: string | null;
              };
            }>;
          };
        }>;
      };
    };
  };
}

const LANGUAGES_QUERY = `
  query userLanguages($login: String!) {
    user(login: $login) {
      name
      login
      repositories(first: 100, ownerAffiliations: OWNER, isFork: false, orderBy: {field: STARGAZERS, direction: DESC}) {
        nodes {
          languages(first: 8, orderBy: {field: SIZE, direction: DESC}) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
        }
      }
    }
  }
`;

export async function fetchUserLanguages(username: string): Promise<UserLanguages> {
  const token = process.env.GITHUB_TOKEN?.trim();

  const headers: Record<string, string> = {
    'User-Agent': 'gitglyph-stats',
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: LANGUAGES_QUERY,
      variables: { login: username },
    }),
  });

  if (!res.ok) {
    throw new Error(`GitHub languages fetch failed (${res.status})`);
  }

  const result: GraphQLLanguagesResponse = await res.json();
  const user = result?.data?.user;

  if (!user) {
    throw new Error(`GitHub user '${username}' not found`);
  }

  const repoNodes = user.repositories?.nodes || [];
  const langMap: Record<string, { size: number; color: string }> = {};
  let totalBytes = 0;

  for (const repo of repoNodes) {
    const edges = repo.languages?.edges || [];
    for (const edge of edges) {
      const name = edge.node.name;
      const size = edge.size || 0;
      const color = edge.node.color || '#858585';

      totalBytes += size;
      if (!langMap[name]) {
        langMap[name] = { size: 0, color };
      }
      langMap[name].size += size;
    }
  }

  const sortedLangs = Object.entries(langMap)
    .sort(([, a], [, b]) => b.size - a.size)
    .slice(0, 5)
    .map(([name, data]) => ({
      name,
      color: data.color,
      size: data.size,
      percent: totalBytes > 0 ? parseFloat(((data.size / totalBytes) * 100).toFixed(1)) : 0,
    }));

  return {
    name: user.name || user.login,
    login: user.login,
    languages: sortedLangs,
  };
}
