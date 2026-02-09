import Image from 'next/image';
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants';
import { AnimatedSection, AnimatedDiv } from '@/components/ui/animated-section';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'About',
  description: 'About Oscar de Francesca — background, life journey, and interests.',
};

const timeline = [
  {
    year: '2003',
    title: 'Born',
    location: 'Bangkok, Thailand',
    flag: '🇹🇭',
    description: 'Born in Bangkok to a Swedish-American family.',
    type: 'life' as const,
  },
  {
    year: '2006–07',
    title: 'Early childhood',
    location: 'Stockholm, Sweden',
    flag: '🇸🇪',
    description: 'First move back to Scandinavia.',
    type: 'life' as const,
  },
  {
    year: '2007–10',
    title: 'Growing up abroad',
    location: 'Al Ain, UAE',
    flag: '🇦🇪',
    description: 'Childhood years in the Emirates.',
    type: 'life' as const,
  },
  {
    year: '2010–12',
    title: 'Primary school',
    location: 'Egham, United Kingdom',
    flag: '🇬🇧',
    description: 'Living in the English countryside.',
    type: 'life' as const,
  },
  {
    year: '2012–18',
    title: 'Middle & early high school',
    location: 'Dubai, UAE',
    flag: '🇦🇪',
    description: 'Longest stretch in one place — formative years in Dubai.',
    type: 'life' as const,
  },
  {
    year: '2018–21',
    title: 'IB Diploma, ISSR',
    location: 'Stockholm, Sweden',
    flag: '🇸🇪',
    description: 'Completed the International Baccalaureate at the International School of the Stockholm Region.',
    type: 'education' as const,
  },
  {
    year: '2021–24',
    title: 'BSc Computing Science',
    location: 'Groningen, Netherlands',
    flag: '🇳🇱',
    description: 'Graduated cum laude (8.6/10) from the University of Groningen. Focused on algorithms, OS, concurrency, and data systems.',
    type: 'education' as const,
  },
  {
    year: '2024–26',
    title: 'MSc Computer Science',
    location: 'Lausanne, Switzerland',
    flag: '🇨🇭',
    description: 'Master\'s at EPFL (5.6/6 average). Systems, security, ML, and a minor in Management, Technology & Entrepreneurship.',
    type: 'education' as const,
  },
  {
    year: '2026–',
    title: 'Software Engineer',
    location: 'London, United Kingdom',
    flag: '🇬🇧',
    description: 'Joining Bloomberg for a software engineering placement.',
    type: 'work' as const,
  },
];

const interests = [
  { label: 'Systems & Performance', desc: 'OS internals, concurrency, distributed systems, low-level optimization' },
  { label: 'Machine Learning', desc: 'LLMs, probabilistic models, forecasting, applied ML for real problems' },
  { label: 'Security & Cryptography', desc: 'Applied cryptography, secure systems, protocol design' },
  { label: 'Data Engineering', desc: 'Pipelines, databases, stream processing, data-intensive applications' },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 pt-28 pb-20">
      {/* Header */}
      <AnimatedDiv>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-start mb-16">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
              About Me
            </h1>
            <div className="mt-6 space-y-4 text-text-secondary leading-relaxed">
              <p>
                I&apos;m a Swedish-American software engineer who grew up internationally — born
                in Bangkok and raised across six countries on three continents before settling
                into tech. That global upbringing gave me a natural adaptability and a broad
                perspective that shapes how I approach both engineering and collaboration.
              </p>
              <p>
                I hold an MSc in Computer Science from EPFL (Swiss Federal Institute of
                Technology) and a BSc from the University of Groningen, graduating cum laude.
                My focus is on building reliable, performant software — from systems-level work
                to data-intensive applications.
              </p>
              <p>
                Outside of engineering, I&apos;m drawn to entrepreneurship, exploring new places,
                and understanding how technology intersects with real-world impact. I&apos;m
                currently at Bloomberg in London.
              </p>
            </div>
            <div className="flex items-center gap-4 mt-6">
              <Button href={siteConfig.links.email} variant="primary" size="sm" icon="arrow">
                Get in touch
              </Button>
              <Button href={siteConfig.links.linkedin} external variant="secondary" size="sm" icon="external">
                LinkedIn
              </Button>
              <Button href={siteConfig.links.github} external variant="secondary" size="sm" icon="external">
                GitHub
              </Button>
            </div>
          </div>
          <div className="hidden md:block relative w-48 h-64 rounded-2xl overflow-hidden border border-border shrink-0">
            <Image
              src="/images/portrait.jpg"
              alt="Oscar de Francesca"
              fill
              className="object-cover"
              sizes="192px"
            />
          </div>
        </div>
      </AnimatedDiv>

      {/* Life Timeline */}
      <AnimatedSection className="mb-16">
        <h2 className="text-xl font-bold text-text-primary mb-2">Where I&apos;ve Been</h2>
        <p className="text-sm text-text-muted mb-10">
          9 cities, 6 countries, 3 continents — and counting.
        </p>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 sm:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-border via-accent/30 to-accent" />

          <div className="space-y-0">
            {timeline.map((item, i) => {
              const isLast = i === timeline.length - 1;
              const typeColor =
                item.type === 'work'
                  ? 'border-accent bg-accent shadow-lg shadow-accent/20'
                  : item.type === 'education'
                    ? 'border-accent/60 bg-accent/80'
                    : 'border-border bg-bg-card';

              return (
                <div
                  key={i}
                  className="relative flex gap-5 sm:gap-7 pl-0 group"
                >
                  {/* Node */}
                  <div className="relative z-10 flex flex-col items-center pt-1">
                    <div
                      className={`w-[10px] h-[10px] sm:w-3 sm:h-3 rounded-full border-2 ${typeColor} transition-all duration-300 group-hover:scale-125`}
                    />
                  </div>

                  {/* Card */}
                  <div
                    className={`flex-1 pb-8 ${isLast ? 'pb-0' : ''}`}
                  >
                    <div className="rounded-xl border border-border bg-bg-card p-4 sm:p-5 transition-all hover:border-border-hover hover:bg-bg-card-hover">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono text-accent font-medium">
                              {item.year}
                            </span>
                            <span className="text-lg leading-none">{item.flag}</span>
                          </div>
                          <h3 className="font-semibold text-text-primary text-sm mt-1.5">
                            {item.title}
                          </h3>
                          <p className="text-xs text-text-muted mt-0.5">{item.location}</p>
                        </div>
                        {item.type !== 'life' && (
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                              item.type === 'work'
                                ? 'bg-accent/15 text-accent'
                                : 'bg-accent/10 text-accent/80'
                            }`}
                          >
                            {item.type === 'work' ? 'Work' : 'Education'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AnimatedSection>

      {/* Interests & Focus Areas */}
      <AnimatedSection className="mb-16">
        <h2 className="text-xl font-bold text-text-primary mb-6">Focus Areas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {interests.map(({ label, desc }) => (
            <div key={label} className="rounded-xl border border-border bg-bg-card p-5 transition-all hover:border-border-hover">
              <h3 className="font-semibold text-text-primary text-sm">{label}</h3>
              <p className="text-sm text-text-secondary mt-2 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </AnimatedSection>

      {/* Contact CTA */}
      <AnimatedSection>
        <div className="relative rounded-2xl border border-border bg-gradient-to-br from-bg-card via-bg-card to-accent/[0.06] p-8 text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-accent/[0.04] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative">
            <h2 className="text-xl font-bold text-text-primary">Let&apos;s Connect</h2>
            <p className="text-text-secondary mt-2 text-sm max-w-md mx-auto">
              Always open to interesting conversations about systems, research, or potential collaborations.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-5">
              <Button href={siteConfig.links.email} variant="primary" size="sm" icon="arrow">Email Me</Button>
              <Button href={siteConfig.links.linkedin} external variant="secondary" size="sm" icon="external">LinkedIn</Button>
              <Button href={siteConfig.links.github} external variant="secondary" size="sm" icon="external">GitHub</Button>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
