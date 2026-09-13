export default async function Home(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const username = typeof searchParams.username === 'string' ? searchParams.username : '';
  const theme = typeof searchParams.theme === 'string' ? searchParams.theme : '';
  const card = typeof searchParams.card === 'string' ? searchParams.card : '';

  const params = new URLSearchParams();
  if (username) params.set('username', username);
  if (theme) params.set('theme', theme);

  const query = params.toString() ? `?${params.toString()}` : '';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-100 dark:bg-zinc-950 p-6">
      {(!card || card === 'stats') && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={`/api/stats${query}`}
          alt="GitHub Stats"
          width={450}
          height={195}
          className="rounded-lg shadow-md max-w-full h-auto"
        />
      )}
      {(!card || card === 'streak') && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={`/api/streak${query}`}
          alt="GitHub Streak Stats"
          width={450}
          height={195}
          className="rounded-lg shadow-md max-w-full h-auto"
        />
      )}
      {(!card || card === 'languages') && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={`/api/languages${query}`}
          alt="GitHub Top Languages"
          width={450}
          height={195}
          className="rounded-lg shadow-md max-w-full h-auto"
        />
      )}
    </main>
  );
}
