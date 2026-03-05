import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { siteConfig } from '@/lib/constants';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
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
    creator: '@oscardef',
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Oscar de Francesca',
    url: siteConfig.url,
    image: `${siteConfig.url}/images/portrait.jpg`,
    jobTitle: 'Software Engineer',
    worksFor: {
      '@type': 'Organization',
      name: 'Bloomberg',
      url: 'https://www.bloomberg.com',
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
      'Machine Learning',
      'Data Systems',
      'Performance Engineering',
      'Python',
      'TypeScript',
      'C++',
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'London',
      addressCountry: 'GB',
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
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="font-sans min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
