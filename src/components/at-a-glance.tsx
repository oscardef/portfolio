import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  ArrowUpRight,
  Award,
  Briefcase,
  GraduationCap,
  Languages,
  Layers,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { Progress } from '@/components/live';
import { cn } from '@/lib/utils';

/**
 * The summary under the hero: where things stand, what I work on, and the
 * facts people usually look for, before the longer story further down.
 */

function Card({
  label,
  icon: Icon,
  aside,
  className,
  children,
}: {
  label: string;
  // Left out for the "Now" card, which gets a live dot instead
  icon?: LucideIcon;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('flex flex-col rounded-3xl border border-border bg-bg-card p-6 sm:p-7', className)}>
      <div className="flex min-h-10 items-center justify-between gap-4">
        <h3 className="flex items-center gap-3 text-[1.1875rem] font-semibold tracking-tight">
          <span className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-muted text-accent-light">
            {Icon ? (
              <Icon size={18} aria-hidden="true" />
            ) : (
              <>
                <span className="absolute size-2 rounded-full bg-accent-light motion-safe:animate-[ping-soft_2.4s_ease-out_infinite]" />
                <span className="relative size-2 rounded-full bg-accent-light" />
              </>
            )}
          </span>
          {label}
        </h3>
        {aside}
      </div>
      <div className="mt-5 flex flex-1 flex-col">{children}</div>
    </div>
  );
}

function Org({ logo, name, className }: { logo: string; name: string; className?: string }) {
  return (
    <div className={cn('flex h-10 w-[4.5rem] shrink-0 items-center justify-center rounded-lg bg-white px-2', className)}>
      <Image src={logo} alt={name} width={60} height={28} className="h-auto max-h-7 w-full object-contain" />
    </div>
  );
}

// Small flags drawn inline: emoji flags don't render on Windows
function Flag({ country }: { country: 'se' | 'us' }) {
  const frame = 'h-3.5 w-auto shrink-0 rounded-[3px] ring-1 ring-black/10';
  if (country === 'se') {
    return (
      <svg viewBox="0 0 16 10" aria-hidden="true" className={frame}>
        <rect width="16" height="10" fill="#006aa7" />
        <rect x="5" width="2" height="10" fill="#fecc02" />
        <rect y="4" width="16" height="2" fill="#fecc02" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 19 13" aria-hidden="true" className={frame}>
      <rect width="19" height="13" fill="#b22234" />
      {[1, 3, 5, 7, 9, 11].map((y) => (
        <rect key={y} y={y} width="19" height="1" fill="#fff" />
      ))}
      <rect width="7.6" height="7" fill="#3c3b6e" />
    </svg>
  );
}

const focus = [
  {
    title: 'Systems',
    text: 'Low-latency C++, real-time messaging, and the infrastructure and testing around them.',
    href: '/experience/bloomberg',
  },
  {
    title: 'Machine learning',
    text: 'Language models from scratch, generative models for antibodies, probabilistic forecasting.',
    href: '/projects#ml',
  },
  {
    title: 'Products and hardware',
    text: 'Full-stack platforms, a mathematics tutoring product, and RFID wristbands with their firmware.',
    href: '/projects',
  },
];

const education = [
  {
    degree: 'MSc Computer Science',
    school: 'EPFL',
    logo: '/images/logos/epfl.svg',
    years: '2024 to 2027',
    detail: '5.4/6 average',
  },
  {
    degree: 'BSc Computer Science',
    school: 'University of Groningen',
    logo: '/images/logos/ugroningen-crest.svg',
    years: '2021 to 2024',
    detail: 'Cum laude, 8.6/10, Honours College',
  },
];

const recognition = [
  'Third place overall at LauzHack 2025, and second in its Huawei challenge',
  'BSc cum laude, with the Honours College programme',
];

const languages = [
  { name: 'English', level: 'Native' },
  { name: 'Swedish', level: 'Native' },
];

const citizenships: { name: string; flag: 'se' | 'us' }[] = [
  { name: 'Sweden', flag: 'se' },
  { name: 'United States', flag: 'us' },
];

// The same groups the previous version of the site listed
const toolbox: [string, string[]][] = [
  ['Languages', ['C++', 'Python', 'TypeScript', 'C', 'Java', 'SQL', 'Bash', 'Haskell']],
  ['Systems', ['Low latency', 'Concurrency', 'Distributed systems', 'Real-time', 'POSIX', 'Embedded (ESP32, FreeRTOS)']],
  ['Machine learning', ['PyTorch', 'Hugging Face', 'LoRA / PEFT', 'DeepSpeed', 'NumPy', 'pandas', 'scikit-learn']],
  ['Backend and tools', ['Kafka', 'Linux', 'Docker', 'PostgreSQL', 'FastAPI', 'Next.js', 'CMake', 'Git', 'CI/CD']],
];

const groupLabel = 'text-sm font-medium text-text-muted';

export function AtAGlance() {
  return (
    <section id="glance" aria-labelledby="glance-title" className="section">
      <div className="container-page">
        <h2 id="glance-title" className="text-4xl font-semibold tracking-tight sm:text-5xl">
          At a glance
        </h2>

        {/* Two columns on tablets, where the wide cards take a full row and the rest fill in around them */}
        <div className="mt-8 grid grid-flow-dense gap-4 sm:mt-10 md:grid-cols-2 lg:grid-cols-3">
          <Card label="Now" className="md:col-span-2" aside={<Org logo="/images/logos/eth.svg" name="ETH Zurich" />}>
            <div className="grid flex-1 gap-x-10 gap-y-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
              <div className="flex flex-col">
                <h4 className="text-2xl font-semibold tracking-tight">Master’s thesis at ETH Zurich</h4>
                <p className="mt-3 max-w-[58ch] leading-relaxed text-text-secondary">
                  Diffusion language models for antibody design, in Prof. Sai Reddy’s Laboratory for Systems and
                  Synthetic Immunology in Basel. It’s the final part of my MSc in Computer Science at EPFL,
                  supervised there by Prof. Maria Brbic.
                </p>
                <div className="mt-auto pt-4">
                  <p className="tnum text-sm text-text-muted">Basel, October 2026 to April 2027</p>
                  {/* How far along the 26 weeks are today */}
                  <Progress
                    from="2026-10-05"
                    to="2027-04-05"
                    className="mt-2.5 block h-1 w-full max-w-[15rem] overflow-hidden rounded-full bg-border"
                  />
                </div>
              </div>
              <figure className="self-center border-l-2 border-accent/60 pl-5">
                <figcaption className="text-sm text-text-muted">The question it asks</figcaption>
                <blockquote className="place-name mt-2 text-[1.375rem] leading-snug text-text-primary">
                  Can a diffusion language model generate the most variable loop of an antibody, conditioned on
                  the rest of it, well enough to pass structural checks?
                </blockquote>
              </figure>
            </div>
          </Card>

          <Card label="Most recently" icon={Briefcase} aside={<Org logo="/images/logos/bloomberg.svg" name="Bloomberg" />}>
            <h4 className="text-xl font-semibold tracking-tight">Software Engineer (Placement) at Bloomberg</h4>
            <p className="mt-3 leading-relaxed text-text-secondary">
              A six-month placement. I designed and built a C++23 rule engine for real-time messaging, now in
              production, and left with a return offer.
            </p>
            <p className="tnum mt-auto pt-4 text-sm text-text-muted">London, March to October 2026</p>
          </Card>

          <Card label="What I work on" icon={Layers} className="md:col-span-2">
            <ul className="grid gap-5 sm:grid-cols-3">
              {focus.map((f) => (
                <li key={f.title}>
                  <Link href={f.href} scroll={false} className="group block">
                    <h4 className="font-semibold">
                      {f.title}
                      <ArrowUpRight
                        size={15}
                        aria-hidden="true"
                        className="mb-0.5 ml-1 inline text-text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-text-primary"
                      />
                    </h4>
                    <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-text-secondary">{f.text}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card label="Education" icon={GraduationCap}>
            <ul className="space-y-4">
              {education.map((e) => (
                <li key={e.degree} className="flex items-start gap-3.5">
                  <Org logo={e.logo} name={e.school} className="mt-0.5" />
                  <div className="min-w-0">
                    <h4 className="font-semibold leading-snug">{e.degree}</h4>
                    <p className="tnum text-[0.9375rem] leading-snug text-text-secondary">
                      {e.school}, {e.years}
                    </p>
                    <p className="tnum mt-1 text-sm text-text-muted">{e.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card label="Teaching" icon={Users}>
            <p className="leading-relaxed text-text-secondary">
              Hundreds of students taught, as a teaching assistant for seven computer science courses and as a
              mathematics tutor. The tutoring led to{' '}
              <Link href="/projects/mathium" scroll={false} className="text-text-primary underline decoration-border-hover underline-offset-4 hover:decoration-text-primary">
                Mathium
              </Link>
              .
            </p>
          </Card>

          <Card label="Recognition" icon={Award}>
            <ul className="space-y-2.5">
              {recognition.map((r) => (
                <li key={r} className="flex gap-2.5 leading-snug text-text-secondary">
                  <span aria-hidden="true" className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-accent" />
                  {r}
                </li>
              ))}
            </ul>
          </Card>

          <Card label="Languages and citizenship" icon={Languages} className="md:col-span-2 lg:col-span-1">
            <dl className="flex flex-wrap justify-between gap-x-4 gap-y-4 whitespace-nowrap sm:justify-start sm:gap-x-12">
              <div>
                <dt className={groupLabel}>Languages</dt>
                <dd className="mt-2">
                  <ul className="space-y-1.5">
                    {languages.map((l) => (
                      <li key={l.name} className="flex items-baseline gap-2">
                        <span className="font-semibold">{l.name}</span>
                        <span className="text-sm text-text-muted">{l.level}</span>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className={groupLabel}>Citizenship</dt>
                <dd className="mt-2">
                  <ul className="space-y-1.5">
                    {citizenships.map((c) => (
                      <li key={c.name} className="flex items-center gap-2.5">
                        <Flag country={c.flag} />
                        <span className="font-semibold">{c.name}</span>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
            <p className="mt-auto pt-5 text-[0.9375rem] leading-snug text-text-secondary">
              Free to work in the EU, Switzerland and the US.
            </p>
          </Card>

          <Card label="Toolbox" icon={Wrench} className="md:col-span-2 lg:col-span-3">
            <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
              {toolbox.map(([group, tools]) => (
                <div key={group}>
                  <dt className="font-semibold">{group}</dt>
                  <dd className="mt-2.5 flex flex-wrap gap-1.5">
                    {tools.map((t) => (
                      <span key={t} className="rounded-full border border-border px-2.5 py-0.5 text-sm text-text-secondary">
                        {t}
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>
    </section>
  );
}
