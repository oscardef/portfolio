import Image from 'next/image';
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants';
import { AnimatedSection, AnimatedDiv } from '@/components/ui/animated-section';
import { Button } from '@/components/ui/button';
import { TravelExplorer } from '@/components/travel-explorer';

export const metadata: Metadata = {
  title: 'About',
  description:
    'About Oscar de Francesca — software engineer at Bloomberg, EPFL MSc graduate. Background, life journey, education, and interests.',
  alternates: { canonical: 'https://oscar.defrancesca.com/about' },
};

const timeline = [
  {
    year: '2026–',
    title: 'Software Engineer',
    location: 'London, United Kingdom',
    flag: '🇬🇧',
    description: 'Joining Bloomberg for a software engineering placement.',
    type: 'work' as const,
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
    year: '2021–24',
    title: 'BSc Computing Science',
    location: 'Groningen, Netherlands',
    flag: '🇳🇱',
    description: 'Graduated cum laude (8.6/10) from the University of Groningen. Focused on algorithms, OS, concurrency, and data systems.',
    type: 'education' as const,
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
    year: '2012–18',
    title: 'Middle & early high school',
    location: 'Dubai, UAE',
    flag: '🇦🇪',
    description: 'Longest stretch in one place — formative years in Dubai.',
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
    year: '2007–10',
    title: 'Growing up abroad',
    location: 'Al Ain, UAE',
    flag: '🇦🇪',
    description: 'Childhood years in the Emirates.',
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
    year: '2003',
    title: 'Born',
    location: 'Bangkok, Thailand',
    flag: '🇹🇭',
    description: 'Born in Bangkok to a Swedish-American family.',
    type: 'life' as const,
  },
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
                I&apos;m a Swedish-American software engineer who grew up moving around — born
                in Bangkok and raised across six countries on three continents. I got used to
                being the new kid, picking things up quickly, and figuring out how things work
                in unfamiliar places. That carried over into how I work as an engineer.
              </p>
              <p>
                I did my MSc in Computer Science at EPFL and my BSc at the University of
                Groningen, where I graduated cum laude. I like building things that are fast
                and don&apos;t break — whether that&apos;s low-level systems code or data-heavy
                backends.
              </p>
              <p>
                Outside of work, I&apos;m into startups, traveling, and thinking about how tech
                actually affects people&apos;s lives. Currently at Bloomberg in London.
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
        <h2 className="text-xl font-bold text-text-primary mb-2">Where I&apos;ve Lived</h2>
        <p className="text-sm text-text-muted mb-6">
          9 cities, 6 countries, 3 continents — and counting.
        </p>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[15px] sm:left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-accent via-accent/30 to-border" />

          <div className="space-y-0">
            {timeline.map((item, i) => {
              const isFirst = i === 0;
              const isLast = i === timeline.length - 1;
              const dotStyle = isFirst
                ? 'border-accent bg-accent shadow-lg shadow-accent/20'
                : 'border-border bg-bg-card';

              const typeLabel = item.type === 'work' ? 'Work' : item.type === 'education' ? 'Education' : 'Life';
              const typeStyle = item.type === 'work'
                ? 'bg-accent/15 text-accent'
                : item.type === 'education'
                  ? 'bg-accent/10 text-accent/80'
                  : 'bg-emerald-500/10 text-emerald-400/80';

              return (
                <div
                  key={i}
                  className="relative flex gap-3 sm:gap-5 pl-0 group"
                >
                  {/* Node */}
                  <div className="relative z-10 flex flex-col items-center pt-1.5">
                    <div
                      className={`w-[8px] h-[8px] sm:w-[10px] sm:h-[10px] rounded-full border-2 ${dotStyle} transition-all duration-300 group-hover:scale-125`}
                    />
                  </div>

                  {/* Card */}
                  <div
                    className={`flex-1 ${isLast ? 'pb-0' : 'pb-3'}`}
                  >
                    <div className="rounded-lg border border-border bg-bg-card px-3.5 py-3 sm:px-4 sm:py-3.5 transition-all hover:border-border-hover hover:bg-bg-card-hover">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-mono text-accent font-medium">
                              {item.year}
                            </span>
                            <span className="text-sm leading-none">{item.flag}</span>
                          </div>
                          <h3 className="font-semibold text-text-primary text-[13px] mt-1">
                            {item.title}
                          </h3>
                          <p className="text-[11px] text-text-muted mt-0.5">{item.location}</p>
                        </div>
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${typeStyle}`}
                        >
                          {typeLabel}
                        </span>
                      </div>
                      <p className="text-[13px] text-text-secondary mt-1.5 leading-relaxed">
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

      {/* Where I've Been — 3D Globe */}
      <AnimatedSection className="mb-16">
        <h2 className="text-xl font-bold text-text-primary mb-2">Where I&apos;ve Been</h2>
        <p className="text-sm text-text-muted mb-8">
          Cities and countries I&apos;ve visited, worked, and lived in — select a place to explore.
        </p>
        <TravelExplorer />
      </AnimatedSection>

      {/* Contact CTA */}
      <AnimatedSection>
        <div className="relative rounded-2xl border border-border bg-gradient-to-br from-bg-card via-bg-card to-accent/[0.06] p-8 sm:p-10 text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-accent/[0.04] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/[0.03] rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
          <div className="relative">
            <p className="text-2xl mb-2">👋</p>
            <h2 className="text-xl font-bold text-text-primary">Let&apos;s connect!</h2>
            <p className="text-text-secondary mt-2 text-sm max-w-md mx-auto">
              Always open to interesting conversations about systems, research, or potential collaborations. Feel free to reach out!
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-5">
              <Button href={siteConfig.links.email} variant="primary" size="sm" icon="arrow">Email Me</Button>
              <Button href={siteConfig.links.linkedin} external variant="secondary" size="sm" icon="external">LinkedIn</Button>
              <Button href={siteConfig.links.github} external variant="secondary" size="sm" icon="external">GitHub</Button>
            </div>
            <p className="text-xs text-text-muted mt-4">
              oscar.defrancesca@gmail.com
            </p>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
