import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Instrument_Sans, Instrument_Serif } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { siteConfig } from '@/lib/constants';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument-sans',
  display: 'swap',
});

// Place names, in italic, as an atlas would set them
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: 'italic',
  variable: '--font-instrument-serif',
  display: 'swap',
});

// Runs before paint so a saved light theme doesn't flash dark first
const themeScript = `try{if(localStorage.getItem('theme')==='light'){document.documentElement.dataset.theme='light';addEventListener('DOMContentLoaded',function(){var m=document.querySelector('meta[name="theme-color"]');if(m)m.content='#f4f5f7'})}}catch(e){}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: 'Oscar de Francesca', url: siteConfig.url }],
  creator: 'Oscar de Francesca',
  publisher: 'Oscar de Francesca',
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#0c1220',
};

export default function RootLayout({ children, sheet }: { children: ReactNode; sheet: ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Oscar de Francesca',
    url: siteConfig.url,
    image: `${siteConfig.url}/images/portrait.jpg`,
    jobTitle: 'Software Engineer',
    affiliation: {
      '@type': 'CollegeOrUniversity',
      name: 'ETH Zurich',
      url: 'https://ethz.ch',
    },
    alumniOf: [
      {
        '@type': 'EducationalOrganization',
        name: 'EPFL',
        url: 'https://www.epfl.ch',
      },
      {
        '@type': 'EducationalOrganization',
        name: 'University of Groningen',
        url: 'https://www.rug.nl',
      },
    ],
    sameAs: [
      siteConfig.links.github,
      siteConfig.links.linkedin,
    ],
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
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Basel',
      addressCountry: 'CH',
    },
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    author: {
      '@type': 'Person',
      name: 'Oscar de Francesca',
    },
  };

  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${instrumentSans.variable} ${instrumentSerif.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body>
        <div id="page" className="flex min-h-screen flex-col">
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:text-white"
          >
            Skip to content
          </a>
          <Navbar />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
        {sheet}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
