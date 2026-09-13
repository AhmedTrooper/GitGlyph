export default async function Home(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const username = typeof searchParams.username === 'string' ? searchParams.username : '';
  const theme = typeof searchParams.theme === 'string' ? searchParams.theme : '';
  const card = typeof searchParams.card === 'string' ? searchParams.card : '';
  const repo = typeof searchParams.repo === 'string' ? searchParams.repo : (process.env.GITHUB_REPO || '');

  const params = new URLSearchParams();
  if (username) params.set('username', username);
  if (theme) params.set('theme', theme);

  const query = params.toString() ? `?${params.toString()}` : '';

  const pinParams = new URLSearchParams(params);
  if (repo) pinParams.set('repo', repo);
  const pinQuery = pinParams.toString() ? `?${pinParams.toString()}` : '';

  const cards = [
    { id: 'stats', label: 'Public Stats', path: `/api/stats${query}`, width: 450, height: 195 },
    { id: 'streak', label: 'Public Streak', path: `/api/streak${query}`, width: 450, height: 195 },
    { id: 'languages', label: 'Top Languages', path: `/api/languages${query}`, width: 450, height: 195 },
    ...(repo || card === 'pin'
      ? [{ id: 'pin', label: 'Pinned Repository', path: `/api/pin${pinQuery}`, width: 450, height: 140 }]
      : []),
  ];

  const visibleCards = card ? cards.filter((c) => c.id === card) : cards;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-zinc-100 dark:bg-zinc-950 p-6 py-12 font-sans">
      {visibleCards.map((item) => (
        <div key={item.id} className="flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.path}
            alt={item.label}
            width={item.width}
            height={item.height}
            className="rounded-lg shadow-md max-w-full h-auto"
          />
          <a
            href={item.path}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500 shadow-sm transition-all"
          >
            <span>Open Raw SVG</span>
            <span className="text-zinc-400">({item.label})</span>
            <span>↗</span>
          </a>
        </div>
      ))}
    </main>
  );
}
