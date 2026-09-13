export interface RepoDetails {
  name: string;
  nameWithOwner: string;
  description: string;
  isFork: boolean;
  stars: number;
  forks: number;
  language: string;
  languageColor: string;
}

interface GraphQLRepoResponse {
  data?: {
    repository?: {
      name: string;
      nameWithOwner: string;
      description: string | null;
      isFork: boolean;
      stargazerCount: number;
      forkCount: number;
      primaryLanguage: {
        name: string;
        color: string | null;
      } | null;
    } | null;
  };
  errors?: Array<{ message: string }>;
}

const REPO_QUERY = `
  query repositoryDetails($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      name
      nameWithOwner
      description
      isFork
      stargazerCount
      forkCount
      primaryLanguage {
        name
        color
      }
    }
  }
`;

export async function fetchRepoDetails(repoInput: string, defaultOwner?: string): Promise<RepoDetails> {
  const token = process.env.GITHUB_TOKEN?.trim();

  let owner = '';
  let name = '';

  const trimmed = repoInput.trim();
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    owner = parts[0];
    name = parts[1];
  } else {
    owner = defaultOwner?.trim() || process.env.GITHUB_USERNAME?.trim() || '';
    name = trimmed;
  }

  if (!owner || !name) {
    throw new Error('Repository owner or name is missing. Pass ?repo=owner/repo or set GITHUB_USERNAME.');
  }

  const headers: Record<string, string> = {
    'User-Agent': 'gitglyph-stats',
    'Content-Type': 'application/json',
  };

  if (!token) {
    throw new Error('GITHUB_TOKEN is required for repository details. Please add GITHUB_TOKEN in your environment variables.');
  }

  headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: REPO_QUERY,
      variables: { owner, name },
    }),
  });

  if (!res.ok) {
    throw new Error(`GitHub repository query failed (${res.status})`);
  }

  const result: GraphQLRepoResponse = await res.json();
  const repo = result?.data?.repository;

  if (!repo) {
    throw new Error(`Repository '${owner}/${name}' not found or is private`);
  }

  return {
    name: repo.name,
    nameWithOwner: repo.nameWithOwner,
    description: repo.description || 'No description provided.',
    isFork: repo.isFork,
    stars: repo.stargazerCount || 0,
    forks: repo.forkCount || 0,
    language: repo.primaryLanguage?.name || 'Markdown',
    languageColor: repo.primaryLanguage?.color || '#858585',
  };
}
