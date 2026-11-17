import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { SearchButton } from '@/components/search-button';

// Not a page to index, and not a copy of the home page
export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
  alternates: { canonical: null },
};

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col justify-center pb-24 pt-32">
      <p className="tnum text-sm font-medium text-accent-light">404</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
        This page doesn’t exist
      </h1>
      <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-text-secondary">
        It may have moved, or the link has a typo. Search the site, or start from the home page.
      </p>
      <div className="mt-9 flex flex-wrap gap-3">
        <Button href="/" icon="arrow">
          Go to the home page
        </Button>
        <SearchButton />
        <Button href="/projects" variant="secondary">
          See all projects
        </Button>
      </div>
    </div>
  );
}
