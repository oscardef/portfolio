import Image from 'next/image';
import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import { ArrowRight, ArrowUpRight, Github, Linkedin, Mail, MapPin, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CopyEmailButton } from '@/components/copy-email';
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

// Free-to-use stand-in photos (CC0, no credit needed); swap in your own by
// replacing the files in public/images/interests
const interests = [
  {
    title: 'Health',
    text: 'Staying fit, mostly at the gym.',
    photo: { src: '/images/interests/health.jpg', alt: 'Hands gripping a barbell before a lift' },
  },
  {
    title: 'Food',
    text: 'Cooking at home, and trying new places, dishes and cuisines wherever I am.',
    photo: { src: '/images/interests/food.jpg', alt: 'Fresh pasta coming out of a pasta machine' },
  },
  {
    title: 'Travel',
    text: 'Ideally somewhere as different as possible from anywhere I’ve been before.',
    photo: { src: '/images/interests/travel.jpg', alt: 'Yosemite Valley from Tunnel View' },
  },
];

// "Beyond the work": what follows from the opening line, in three short notes
const noteLink = 'text-text-primary underline decoration-border-hover underline-offset-4 hover:decoration-text-primary';
const notes: { title: string; text: ReactNode }[] = [
  {
    title: 'Starting somewhere new',
    text: 'I do the same with every new codebase, team and field. It’s how I’ve ended up working on everything from message routing to antibody design.',
  },
  {
    title: 'Teaching',
    text: (
      <>
        I tutor mathematics on the side. Between that and seven courses as a teaching assistant, I’ve taught
        hundreds of students, and{' '}
        <Link href="/projects/mathium" scroll={false} className={noteLink}>
          Mathium
        </Link>{' '}
        is my way of making the tutoring better.
      </>
    ),
  },
  {
    title: 'Building with a team',
    text: (
      <>
        I like building quickly with a good team. At LauzHack 2025 we took third place overall, and second in
        the Huawei challenge, with{' '}
        <Link href="/projects/showcaise" scroll={false} className={noteLink}>
          an AI presentation coach
        </Link>{' '}
        built in under 48 hours.
      </>
    ),
  },
];

// How many selected projects a phone shows before "All projects"
const PHONE_PROJECTS = 4;

// Ways to reach me, as shown in the contact panel
const contacts: { label: string; value: string; href: string; icon: LucideIcon }[] = [
  { label: 'Email', value: siteConfig.email, href: siteConfig.links.email, icon: Mail },
  { label: 'LinkedIn', value: siteConfig.links.linkedin.replace(/^https:\/\/(www\.)?/, ''), href: siteConfig.links.linkedin, icon: Linkedin },
  { label: 'GitHub', value: siteConfig.links.github.replace(/^https:\/\//, ''), href: siteConfig.links.github, icon: Github },
];

export default async function HomePage() {
  const [{ chapters }, projects, roles] = await Promise.all([getJourney(), getProjectItems(), getExperienceItems()]);
  const featured = projects.filter((p) => p.featured);
  const globe = getGlobeData();

  return (
    <>
      {/* ── Hero ── */}
      <section id="top" aria-label="Introduction" className="relative overflow-hidden pt-28 md:pt-36">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[640px] w-[640px] -translate-x-1/3 rounded-full bg-accent/[0.08] blur-3xl" />
          <div className="absolute right-0 top-40 h-[420px] w-[420px] rounded-full bg-accent/[0.05] blur-3xl" />
        </div>

        <div className="container-page relative grid items-center gap-14 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-16">
          <div>
            <div className="relative mb-8 size-24 overflow-hidden rounded-full bg-bg-card ring-1 ring-border-hover lg:hidden">
              <Image src="/images/portrait.jpg" alt="Oscar de Francesca" fill priority sizes="96px" className="object-cover" />
            </div>
            <p className="mb-5 flex items-center gap-2 text-sm font-medium text-accent-light">
              <MapPin size={15} aria-hidden="true" />
              Basel, Switzerland
            </p>
            <h1 className="text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
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
              from scratch, and taught hundreds of students as a teaching assistant and mathematics tutor.
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

          <div className="hidden w-full max-w-[22rem] lg:block lg:justify-self-end xl:max-w-[26rem]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-bg-card shadow-[0_30px_80px_-30px_rgb(109_114_246_/_0.5)]">
              <Image
                src="/images/portrait.jpg"
                alt="Oscar de Francesca"
                fill
                priority
                sizes="(max-width: 1280px) 22rem, 26rem"
                className="object-cover"
              />
              {/* A hairline inside the edge, so the photo sits in the page instead of on it */}
              <div aria-hidden="true" className="absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/15" />
            </div>
          </div>
        </div>

        {/* Logos */}
        <div className="container-page relative mt-16 md:mt-24">
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
      <section id="work" aria-labelledby="work-title" className="section">
        <div className="container-page">
          <SectionHeader id="work-title" title="Selected projects" href="/projects" link={`All ${projects.length} projects`} />
          <ul className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {featured.map((item, i) => (
              // Phones start with the first four; the rest are a tap away
              <li key={item.id} className={i >= PHONE_PROJECTS ? 'hidden sm:block' : undefined}>
                <ProjectCard item={item} compact />
              </li>
            ))}
          </ul>
          <MoreLink href="/projects">All {projects.length} projects</MoreLink>
        </div>
      </section>

      {/* ── Experience ── */}
      <section id="experience" aria-labelledby="experience-title" className="section">
        <div className="container-page">
          <SectionHeader id="experience-title" title="Experience" href="/experience" link="Experience in detail" />
          <ul className="mt-8 space-y-2.5 sm:mt-10">
            {roles.map((item) => (
              <li key={item.id}>
                <RoleRow item={item} />
              </li>
            ))}
          </ul>
          <MoreLink href="/experience">Experience in detail</MoreLink>
        </div>
      </section>

      <RouteSection chapters={chapters} globe={globe} />

      <PlacesSection globe={globe} />

      {/* ── Beyond the work ── */}
      <section id="about" aria-labelledby="about-title" className="section">
        <div className="container-page">
          <h2 id="about-title" className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Beyond the work
          </h2>
          <div className="mt-8 grid gap-x-16 gap-y-8 sm:mt-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            {/* The thought the rest follows from, set large */}
            <p className="place-name max-w-[26ch] text-[1.75rem] leading-[1.2] text-text-primary sm:text-[2.125rem] lg:pt-3 lg:text-[2.5rem]">
              Growing up across six countries taught me to arrive somewhere unfamiliar and work out quickly how
              it fits together.
            </p>
            <dl className="divide-y divide-border border-y border-border">
              {notes.map(({ title, text }) => (
                <div key={title} className="grid gap-x-8 gap-y-1.5 py-5 sm:grid-cols-[13rem_minmax(0,1fr)]">
                  <dt className="font-semibold">{title}</dt>
                  <dd className="leading-relaxed text-text-secondary">{text}</dd>
                </div>
              ))}
            </dl>
          </div>

          <ul className="mt-8 grid gap-3 sm:mt-12 sm:grid-cols-3 sm:gap-5">
            {interests.map(({ title, text, photo }) => (
              <li key={title}>
                <figure className="relative aspect-[5/2] overflow-hidden rounded-2xl border border-border bg-bg-card sm:aspect-square lg:aspect-[4/3]">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(min-width: 1280px) 27rem, (min-width: 640px) 33vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent sm:via-black/25" />
                  <figcaption className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <h3 className="place-name text-[1.875rem] leading-none text-white lg:text-[2.25rem]">{title}</h3>
                    <p className="mt-1.5 max-w-[36ch] text-sm leading-snug text-white/85 lg:mt-2 lg:text-[0.9375rem]">
                      {text}
                    </p>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" aria-labelledby="contact-title" className="section">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-bg-card">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div className="absolute -left-40 -top-48 h-[30rem] w-[30rem] rounded-full bg-accent/[0.16] blur-3xl" />
              <div className="absolute -bottom-56 -right-24 h-[28rem] w-[28rem] rounded-full bg-accent/[0.08] blur-3xl" />
            </div>

            <div className="relative grid gap-10 p-5 sm:p-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-16 lg:p-16">
              <div>
                <div className="flex items-center gap-3.5">
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-full bg-bg ring-1 ring-border-hover">
                    <Image src="/images/portrait.jpg" alt="" fill sizes="48px" className="object-cover" />
                  </span>
                  <div>
                    <p className="font-semibold leading-tight">{siteConfig.name}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-text-muted">
                      <MapPin size={13} aria-hidden="true" />
                      Basel, Switzerland
                    </p>
                  </div>
                </div>
                <h2 id="contact-title" className="mt-8 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                  Get in touch
                </h2>
                <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-text-secondary">
                  I’m always happy to hear from people, whether it’s about something on this page, an idea, or
                  an opportunity worth talking about. Email is the best way to reach me.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <a
                    href={siteConfig.links.email}
                    className="group inline-flex items-center gap-2.5 rounded-full bg-accent px-6 py-3 font-medium text-white transition-colors hover:bg-accent-hover"
                  >
                    <Mail size={18} aria-hidden="true" />
                    Send me an email
                    <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
                  </a>
                  <CopyEmailButton address={siteConfig.email} />
                </div>
              </div>

              <ul className="space-y-3">
                {contacts.map(({ label, value, href, icon: Icon }) => {
                  const external = !href.startsWith('mailto:');
                  return (
                    <li key={label}>
                      <a
                        href={href}
                        target={external ? '_blank' : undefined}
                        rel={external ? 'noopener noreferrer' : undefined}
                        className="group flex items-center gap-3.5 rounded-2xl border border-border bg-bg/60 p-3.5 transition-colors hover:border-border-hover hover:bg-bg-card-hover sm:gap-4 sm:p-5"
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-muted text-accent-light sm:size-11">
                          <Icon size={20} aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm text-text-muted">{label}</span>
                          {/* If it has to wrap, it wraps after the @ or a slash */}
                          <span className="block text-sm font-semibold [overflow-wrap:anywhere] sm:text-[1.0625rem]">
                            {value.split(/(?<=[@/])/).map((part, i) => (
                              <Fragment key={part}>
                                {i > 0 && <wbr />}
                                {part}
                              </Fragment>
                            ))}
                          </span>
                        </span>
                        <ArrowUpRight
                          size={18}
                          aria-hidden="true"
                          className="hidden shrink-0 text-text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-text-primary sm:block"
                        />
                      </a>
                    </li>
                  );
                })}
              </ul>
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
      {/* On phones this link sits under the list instead (MoreLink) */}
      <Link
        href={href}
        className="group hidden items-center gap-1.5 text-[0.9375rem] text-text-secondary transition-colors hover:text-text-primary sm:inline-flex"
      >
        {link}
        <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

// The way on to a full list, as a full-width button under the list on phones
function MoreLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-border bg-bg-card py-3 text-[0.9375rem] font-medium transition-colors hover:border-border-hover hover:bg-bg-card-hover sm:hidden"
    >
      {children}
      <ArrowRight size={16} aria-hidden="true" />
    </Link>
  );
}
