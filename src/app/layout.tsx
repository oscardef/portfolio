import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Instrument_Sans, Instrument_Serif } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { SectionLinks } from '@/components/section-links';
import { CommandPalette, type PaletteItem } from '@/components/command-palette';
import { navItems, siteConfig } from '@/lib/constants';
import { getExperienceItems, getProjectItems } from '@/lib/journey';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { SiteAnalytics } from '@/components/site-analytics';
import { JsonLd } from '@/components/json-ld';
import { graph, person, website } from '@/lib/structured-data';

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

export default async function RootLayout({ children, sheet }: { children: ReactNode; sheet: ReactNode }) {
  // Everything the search palette can jump to: sections, projects and roles
  const [projects, roles] = await Promise.all([getProjectItems(), getExperienceItems()]);
  // Projects in the order /projects shows them: selected first, this site last
  const rank = (slug: string, featured: boolean) => (slug === 'portfolio' ? 2 : featured ? 0 : 1);
  projects.sort((a, b) => rank(a.slug, a.featured) - rank(b.slug, b.featured) || b.sortKey - a.sortKey);
  const paletteItems: PaletteItem[] = [
    ...navItems.map((item) => ({ group: 'Go to', label: item.label, href: item.href })),
    { group: 'Go to', label: 'Contact', href: '/#contact', keywords: 'email get in touch' },
    ...projects.map((p) => ({
      group: 'Projects',
      label: p.name,
      hint: p.detail || p.blurb,
      href: p.href!,
      keywords: [...p.stack, p.place, p.period, p.blurb].join(' '),
    })),
    ...roles.map((r) => ({
      group: 'Experience',
      label: `${r.detail}, ${r.name}`,
      hint: `${r.place}, ${r.period}`,
      href: r.href!,
      keywords: [...r.stack, r.blurb].join(' '),
    })),
  ];

  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${instrumentSans.variable} ${instrumentSerif.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <JsonLd data={graph(person, website)} />
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
        <SectionLinks />
        <CommandPalette items={paletteItems} />
        <Analytics />
        <SpeedInsights />
        {/* Visitor analytics only on the live site, not previews or local builds */}
        {process.env.VERCEL_ENV === 'production' && <SiteAnalytics />}
      </body>
    </html>
  );
}
