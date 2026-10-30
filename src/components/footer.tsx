import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-rule">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-4 py-8 text-sm text-ink-2 sm:flex-row sm:justify-between sm:px-6 md:px-10">
        <p>© {new Date().getFullYear()} Oscar de Francesca</p>
        <p>
          Maps drawn from <a href="https://www.naturalearthdata.com" className="underline decoration-ink-3 underline-offset-4 hover:text-ink">Natural Earth</a> data.{' '}
          <Link href="/projects/portfolio" className="underline decoration-ink-3 underline-offset-4 hover:text-ink">
            How this site is built
          </Link>
        </p>
      </div>
    </footer>
  );
}
