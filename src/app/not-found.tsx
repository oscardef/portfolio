import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[1200px] flex-col justify-center px-4 pt-28 pb-20 sm:px-6 md:px-10">
      <p className="place-name text-2xl text-ink-2">Off the map</p>
      <h1 className="section-title mt-3">This page doesn’t exist</h1>
      <p className="mt-5 max-w-[48ch] text-ink-2">
        It may have moved, or the link may be broken. Everything on this site is on the home page.
      </p>
      <Link
        href="/"
        className="mt-8 self-start rounded-full bg-ink px-5 py-2.5 text-[0.9375rem] text-paper hover:bg-ink/85"
      >
        Go to the home page
      </Link>
    </div>
  );
}
