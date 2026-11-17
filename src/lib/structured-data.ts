import { siteConfig } from './constants';

/**
 * Structured data (schema.org JSON-LD) that search engines read to understand
 * who the site is about and how its pages fit together. Every page carries the
 * person and the website; the home page says it is that person's profile, and
 * project and role pages add a breadcrumb trail. Shared `@id`s tie them together.
 */

export const PERSON_ID = `${siteConfig.url}/#person`;
export const WEBSITE_ID = `${siteConfig.url}/#website`;

export const person = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: 'Oscar de Francesca',
  givenName: 'Oscar',
  familyName: 'de Francesca',
  url: siteConfig.url,
  image: `${siteConfig.url}/images/portrait.jpg`,
  description: siteConfig.description,
  jobTitle: 'Software Engineer',
  affiliation: {
    '@type': 'CollegeOrUniversity',
    name: 'ETH Zurich',
    url: 'https://ethz.ch',
  },
  alumniOf: [
    {
      '@type': 'CollegeOrUniversity',
      name: 'EPFL',
      url: 'https://www.epfl.ch',
    },
    {
      '@type': 'CollegeOrUniversity',
      name: 'University of Groningen',
      url: 'https://www.rug.nl',
    },
  ],
  sameAs: [siteConfig.links.github, siteConfig.links.linkedin],
  knowsAbout: [
    'Software Engineering',
    'Systems Programming',
    'Low-Latency Systems',
    'Distributed Systems',
    'Real-Time Systems',
    'Machine Learning',
    'Language Models',
    'C++',
    'Python',
  ],
  knowsLanguage: ['English', 'Swedish'],
  nationality: [
    { '@type': 'Country', name: 'Sweden' },
    { '@type': 'Country', name: 'United States' },
  ],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Basel',
    addressCountry: 'CH',
  },
};

export const website = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  inLanguage: 'en',
  author: { '@id': PERSON_ID },
  publisher: { '@id': PERSON_ID },
};

/** Home → section → page, as shown under the title in search results */
export function breadcrumbs(trail: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '' }, ...trail].map((step, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: step.name,
      item: `${siteConfig.url}${step.path}`,
    })),
  };
}

export function graph(...nodes: object[]) {
  return { '@context': 'https://schema.org', '@graph': nodes };
}
