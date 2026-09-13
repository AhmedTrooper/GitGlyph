export default async function Home(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const username = typeof searchParams.username === 'string' ? searchParams.username : '';
  const theme = typeof searchParams.theme === 'string' ? searchParams.theme : '';

  const params = new URLSearchParams();
  if (username) params.set('username', username);
  if (theme) params.set('theme', theme);

  const query = params.toString() ? `?${params.toString()}` : '';
  const imgSrc = `/api/stats${query}`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-950 p-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        alt="GitHub Stats"
        width={450}
        height={195}
        className="rounded-lg shadow-md max-w-full h-auto"
      />
    </main>
  );
}
