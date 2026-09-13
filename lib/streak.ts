export interface StreakStats {
  name: string;
  login: string;
  totalContributions: number;
  currentStreak: number;
  currentStreakStart: string;
  currentStreakEnd: string;
  longestStreak: number;
  longestStreakStart: string;
  longestStreakEnd: string;
}

interface ContributionDay {
  contributionCount: number;
  date: string;
}

interface GraphQLStreakResponse {
  data?: {
    user?: {
      name?: string;
      login: string;
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions?: number;
          weeks?: Array<{
            contributionDays?: ContributionDay[];
          }>;
        };
      };
    };
  };
}

const STREAK_QUERY = `
  query userStreak($login: String!) {
    user(login: $login) {
      name
      login
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
    }
  }
`;

export async function fetchUserStreak(username: string): Promise<StreakStats> {
  const token = process.env.GITHUB_TOKEN?.trim();

  const headers: Record<string, string> = {
    'User-Agent': 'gitglyph-stats',
    'Content-Type': 'application/json',
  };

  if (!token) {
    throw new Error('GITHUB_TOKEN is required for streak data. Please add GITHUB_TOKEN in your environment variables.');
  }

  headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: STREAK_QUERY,
      variables: { login: username },
    }),
  });

  if (!res.ok) {
    throw new Error(`GitHub streak fetch failed (${res.status})`);
  }

  const result: GraphQLStreakResponse = await res.json();
  const user = result?.data?.user;

  if (!user) {
    throw new Error(`GitHub user '${username}' not found`);
  }

  const calendar = user.contributionsCollection?.contributionCalendar;
  const totalContributions = calendar?.totalContributions || 0;
  const weeks = calendar?.weeks || [];

  const days: ContributionDay[] = [];
  for (const week of weeks) {
    if (week.contributionDays) {
      days.push(...week.contributionDays);
    }
  }

  days.sort((a, b) => a.date.localeCompare(b.date));

  // 1. Calculate Longest Streak
  let longestStreak = 0;
  let longestStreakStart = '';
  let longestStreakEnd = '';

  let currentRun = 0;
  let runStart = '';

  for (const day of days) {
    if (day.contributionCount > 0) {
      if (currentRun === 0) {
        runStart = day.date;
      }
      currentRun++;
      if (currentRun > longestStreak) {
        longestStreak = currentRun;
        longestStreakStart = runStart;
        longestStreakEnd = day.date;
      }
    } else {
      currentRun = 0;
    }
  }

  // 2. Calculate Current Streak
  let currentStreak = 0;
  let currentStreakStart = '';
  let currentStreakEnd = '';

  if (days.length > 0) {
    const lastIndex = days.length - 1;
    const today = days[lastIndex];
    const yesterday = lastIndex > 0 ? days[lastIndex - 1] : null;

    let startIndex = -1;
    if (today.contributionCount > 0) {
      startIndex = lastIndex;
      currentStreakEnd = today.date;
    } else if (yesterday && yesterday.contributionCount > 0) {
      // If haven't committed yet today, streak is still active from yesterday
      startIndex = lastIndex - 1;
      currentStreakEnd = yesterday.date;
    }

    if (startIndex !== -1) {
      for (let i = startIndex; i >= 0; i--) {
        if (days[i].contributionCount > 0) {
          currentStreak++;
          currentStreakStart = days[i].date;
        } else {
          break;
        }
      }
    }
  }

  return {
    name: user.name || user.login,
    login: user.login,
    totalContributions,
    currentStreak,
    currentStreakStart,
    currentStreakEnd,
    longestStreak,
    longestStreakStart,
    longestStreakEnd,
  };
}
