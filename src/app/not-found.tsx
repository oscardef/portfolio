import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col justify-center pb-24 pt-32">
      <p className="tnum text-sm font-medium text-accent-light">404</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">This page doesn’t exist</h1>
      <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-text-secondary">
        It may have moved, or the link has a typo. Everything on the site is reachable from the home page.
      </p>
      <div className="mt-9 flex flex-wrap gap-3">
        <Button href="/" icon="arrow">
          Go to the home page
        </Button>
        <Button href="/projects" variant="secondary">
          See all projects
        </Button>
      </div>
    </div>
  );
}
