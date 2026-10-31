import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Dumbbell, Github, Linkedin, Mail, MapPin, Plane, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmailLink } from '@/components/email-link';
import { AtAGlance } from '@/components/at-a-glance';
import { ProjectCard, RoleRow } from '@/components/cards';
import { RouteSection } from '@/components/route-section';
import { PlacesSection } from '@/components/places-section';
import { getExperienceItems, getJourney, getProjectItems } from '@/lib/journey';
import { getGlobeData } from '@/lib/globe-data';
import { siteConfig } from '@/lib/constants';

const organizations = [
  { name: 'ETH Zurich', logo: '/images/logos/eth.svg', width: 120, height: 20 },
  { name: 'Bloomberg', logo: '/images/logos/bloomberg.svg', width: 130, height: 28 },
  { name: 'EPFL', logo: '/images/logos/epfl.svg', width: 80, height: 28 },
  { name: 'ASML', logo: '/images/logos/asml.svg', width: 100, height: 28 },
  { name: 'University of Groningen', logo: '/images/logos/ugroningen.svg', width: 160, height: 36 },
  { name: 'Researchable', logo: '/images/logos/researchable.svg', width: 130, height: 28 },
  { name: 'Securrency', logo: '/images/logos/securrency.png', width: 150, height: 52 },
];

const socials = [
  { href: siteConfig.links.github, icon: Github, label: 'GitHub' },
  { href: siteConfig.links.linkedin, icon: Linkedin, label: 'LinkedIn' },
  { href: siteConfig.links.email, icon: Mail, label: 'Email' },
];

const interests = [
  { icon: Dumbbell, title: 'Health', text: 'Staying fit, mostly at the gym.' },
  {
    icon: UtensilsCrossed,
    title: 'Food',
    text: 'Cooking at home, and trying new places, dishes and cuisines wherever I am.',
  },
  {
    icon: Plane,
    title: 'Travel',
    text: 'Ideally somewhere as different as possible from anywhere I’ve been before.',
  },
];

// The route's colours, from Bangkok to Basel, for the frame around the portrait
const ROUTE_GRADIENT =
  'linear-gradient(140deg, oklch(0.78 0.13 75), oklch(0.72 0.15 20), oklch(0.68 0.15 320), oklch(0.7 0.13 260), oklch(0.78 0.12 190))';

export default async function HomePage() {
  const [{ chapters }, projects, roles] = await Promise.all([getJourney(), getProjectItems(), getExperienceItems()]);
  const featured = projects.filter((p) => p.featured);
  const globe = getGlobeData();

  return (
    <>
      {/* ── Hero ── */}
      <section id="top" aria-label="Introduction" className="relative overflow-hidden pt-32 md:pt-40">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[640px] w-[640px] -translate-x-1/3 rounded-full bg-accent/[0.08] blur-3xl" />
          <div className="absolute right-0 top-40 h-[420px] w-[420px] rounded-full bg-[oklch(0.7_0.13_200_/_0.07)] blur-3xl" />
        </div>

        <div className="container-page relative grid items-center gap-14 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-16">
          <div>
            <div className="mb-8 size-24 rounded-full p-[2px] lg:hidden" style={{ background: ROUTE_GRADIENT }}>
              <div className="relative h-full w-full overflow-hidden rounded-full bg-bg-card">
                <Image src="/images/portrait.jpg" alt="Oscar de Francesca" fill priority sizes="96px" className="object-cover" />
              </div>
            </div>
            <p className="mb-5 flex items-center gap-2 text-sm font-medium text-accent-light">
              <MapPin size={15} aria-hidden="true" />
              Basel, Switzerland
            </p>
            <h1 className="text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Oscar
              <br />
              de Francesca
            </h1>
            <p className="mt-7 max-w-[30ch] text-xl leading-snug text-text-primary sm:text-2xl">
              Software engineer, Swedish and American, born in Bangkok and raised across Asia, the
              Middle East and Europe.
            </p>
            <p className="mt-5 max-w-[54ch] text-lg leading-relaxed text-text-secondary">
              I’ve built low-latency C++ at Bloomberg, firmware for RFID wristbands and language models
              from scratch, and taught hundreds of students as a teaching assistant and maths tutor.
              Right now I’m in Basel, writing my master’s thesis at ETH Zurich.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button href="/#work" icon="arrow">
                See my work
              </Button>
              <Button href="/#contact" variant="secondary">
                Get in touch
              </Button>
              <div className="ml-2 flex items-center gap-1">
                {socials.map(({ href, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith('mailto:') ? undefined : '_blank'}
                    rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                    aria-label={label}
                    className="p-2 text-text-muted transition-colors hover:text-text-primary"
                  >
                    <Icon size={20} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="hidden w-full max-w-[22rem] lg:block lg:justify-self-end">
            <div className="relative rounded-[30px] p-[2px] shadow-[0_30px_80px_-30px_rgb(109_114_246_/_0.45)]" style={{ background: ROUTE_GRADIENT }}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-bg-card">
                <Image
                  src="/images/portrait.jpg"
                  alt="Oscar de Francesca"
                  fill
                  priority
                  sizes="(max-width: 1024px) 22rem, 26vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Logos */}
        <div className="container-page relative mt-20 md:mt-28">
          <p className="text-center text-sm text-text-muted">Where I’ve worked and studied</p>
          <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-7 sm:gap-x-14">
            {organizations.map((org) => (
              <li key={org.name} title={org.name}>
                <Image
                  src={org.logo}
                  alt={org.name}
                  width={org.width}
                  height={org.height}
                  className="object-contain opacity-60 brightness-0 invert transition-opacity hover:opacity-100 [[data-theme=light]_&]:invert-0"
                  style={{ height: org.height * 0.85, width: 'auto' }}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <AtAGlance />

      {/* ── Selected projects ── */}
      <section id="work" aria-labelledby="work-title" className="py-20 md:py-28">
        <div className="container-page">
          <SectionHeader id="work-title" title="Selected projects" href="/projects" link={`All ${projects.length} projects`} />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2">
            {featured.map((item) => (
              <li key={item.id}>
                <ProjectCard item={item} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Experience ── */}
      <section id="experience" aria-labelledby="experience-title" className="py-20 md:py-28">
        <div className="container-page">
          <SectionHeader id="experience-title" title="Experience" href="/experience" link="Experience in detail" />
          <ul className="mt-10 space-y-2.5">
            {roles.map((item) => (
              <li key={item.id}>
                <RoleRow item={item} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <RouteSection chapters={chapters} globe={globe} />

      <PlacesSection globe={globe} />

      {/* ── Beyond the work ── */}
      <section id="about" aria-labelledby="about-title" className="py-24 md:py-32">
        <div className="container-page">
          <h2 id="about-title" className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Beyond the work
          </h2>
          <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
            <div className="max-w-[60ch] space-y-5 text-lg leading-relaxed text-text-secondary">
              <p>
                Growing up across six countries taught me to arrive somewhere unfamiliar and work out
                quickly how it fits together. I do the same with every new codebase, team and field,
                which is how I’ve ended up working on everything from message routing to antibody
                design.
              </p>
              <p>
                I tutor maths on the side. Between that and seven courses as a teaching assistant, I’ve
                taught hundreds of students, and Mathium is my way of making the tutoring better.
              </p>
              <p>
                I like building quickly with a good team: at LauzHack 2025 we took third place overall,
                and second in the Huawei challenge, with an AI presentation coach built in under 48
                hours. I speak English and Swedish natively.
              </p>
            </div>
            <ul className="grid gap-4">
              {interests.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-4 rounded-2xl border border-border bg-bg-card p-5 sm:p-6">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-muted text-accent-light">
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="mt-1 text-text-secondary">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" aria-labelledby="contact-title" className="pb-24 md:pb-32">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-bg-card via-bg-card to-accent/[0.08] p-8 sm:p-14">
            <div aria-hidden="true" className="absolute right-0 top-0 h-80 w-80 -translate-y-1/2 translate-x-1/3 rounded-full bg-accent/[0.08] blur-3xl" />
            <div className="relative">
              <h2 id="contact-title" className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Get in touch
              </h2>
              <p className="mt-5 max-w-[52ch] text-lg text-text-secondary">
                I’m always happy to hear from people, whether it’s about something on this page, an idea,
                or an opportunity worth talking about. Email is the best way to reach me.
              </p>
              <div className="mt-10">
                <EmailLink address={siteConfig.email} />
              </div>
              <div className="mt-10 flex flex-wrap gap-3">
                <Button href={siteConfig.links.linkedin} external variant="secondary" icon="external">
                  LinkedIn
                </Button>
                <Button href={siteConfig.links.github} external variant="secondary" icon="external">
                  GitHub
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHeader({ id, title, href, link }: { id: string; title: string; href: string; link: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <h2 id={id} className="text-4xl font-semibold tracking-tight sm:text-5xl">
        {title}
      </h2>
      <Link
        href={href}
        className="group inline-flex items-center gap-1.5 text-[0.9375rem] text-text-secondary transition-colors hover:text-text-primary"
      >
        {link}
        <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
