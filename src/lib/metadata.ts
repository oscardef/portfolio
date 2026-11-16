import type { Metadata } from 'next';
import { siteConfig } from './constants';

/**
 * Metadata for a page other than the home page: its own title, description
 * and address in the tags that link previews read (Open Graph and Twitter).
 * Without this, a shared link to a project showed the home page's title.
 *
 * Pages with their own opengraph-image file get that picture; the rest pass
 * `image` or fall back to the site's card.
 */
export function pageMetadata({
  title,
  description,
  path,
  type = 'website',
  image,
  published,
}: {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'article';
  // false when the route has its own opengraph-image file
  image?: string | false;
  published?: string;
}): Metadata {
  const url = `${siteConfig.url}${path}`;
  const shared = `${title} · ${siteConfig.name}`;
  const images =
    image === false
      ? undefined
      : [{ url: image ?? '/opengraph-image', width: 1200, height: 630, alt: shared }];
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: shared,
      description,
      url,
      siteName: siteConfig.name,
      locale: 'en_US',
      type,
      ...(type === 'article' && {
        authors: [siteConfig.name],
        ...(published && { publishedTime: published }),
      }),
      ...(images && { images }),
    },
    twitter: {
      card: 'summary_large_image',
      title: shared,
      description,
      ...(images && { images }),
    },
  };
}
