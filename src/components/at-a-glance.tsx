import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * The summary under the hero: where things stand, what I work on, and the
 * facts people usually look for, before the longer story further down.
 */

function Card({
  label,
  aside,
  className,
  children,
}: {
  label: string;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('flex flex-col rounded-3xl border border-border bg-bg-card p-6 sm:p-7', className)}>
      <div className="flex min-h-10 items-center justify-between gap-4">
        <p className="text-sm font-medium text-accent-light">{label}</p>
        {aside}
      </div>
      <div className="mt-3 flex flex-1 flex-col">{children}</div>
    </div>
  );
}

function Org({ logo, name }: { logo: string; name: string }) {
  return (
    <div className="flex h-10 w-[4.5rem] shrink-0 items-center justify-center rounded-lg bg-white px-2">
      <Image src={logo} alt={name} width={60} height={28} className="h-auto max-h-6 w-full object-contain" />
    </div>
  );
}

const focus = [
  {
    title: 'Systems',
    text: 'Low-latency C++, real-time messaging, and the infrastructure and testing around them.',
    href: '/projects#systems',
  },
  {
    title: 'Machine learning',
    text: 'Language models from scratch, generative models for antibodies, probabilistic forecasting.',
    href: '/projects#ml',
  },
  {
    title: 'Products and hardware',
    text: 'Full-stack platforms, a maths tutoring product, and RFID wristbands with their firmware.',
    href: '/projects',
  },
];

// The same groups the previous version of the site listed
const toolbox: [string, string[]][] = [
  ['Languages', ['C++', 'Python', 'TypeScript', 'C', 'Java', 'SQL', 'Bash', 'Haskell']],
  ['Systems', ['Low latency', 'Concurrency', 'Distributed systems', 'Real-time', 'POSIX', 'Embedded (ESP32, FreeRTOS)']],
  ['Machine learning', ['PyTorch', 'Hugging Face', 'LoRA / PEFT', 'DeepSpeed', 'NumPy', 'pandas', 'scikit-learn']],
  ['Backend and tools', ['Kafka', 'Linux', 'Docker', 'PostgreSQL', 'FastAPI', 'Next.js', 'CMake', 'Git', 'CI/CD']],
];

export function AtAGlance() {
  return (
    <section id="glance" aria-labelledby="glance-title" className="py-20 md:py-28">
      <div className="container-page">
        <h2 id="glance-title" className="text-4xl font-semibold tracking-tight sm:text-5xl">
          At a glance
        </h2>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card label="Now" className="lg:col-span-2" aside={<Org logo="/images/logos/eth.svg" name="ETH Zurich" />}>
            <div className="grid flex-1 gap-x-10 gap-y-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
              <div className="flex flex-col">
                <h3 className="text-2xl font-semibold tracking-tight">Master’s thesis at ETH Zurich</h3>
                <p className="mt-3 max-w-[58ch] leading-relaxed text-text-secondary">
                  Diffusion language models for antibody design, in Prof. Sai Reddy’s Laboratory for Systems and
                  Synthetic Immunology in Basel. It’s the final part of my MSc in Computer Science at EPFL,
                  supervised there by Prof. Maria Brbic.
                </p>
                <p className="tnum mt-auto pt-4 text-sm text-text-muted">October 2026 to April 2027</p>
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

          <Card label="Most recently" aside={<Org logo="/images/logos/bloomberg.svg" name="Bloomberg" />}>
            <h3 className="text-xl font-semibold tracking-tight">Software Engineer (Placement) at Bloomberg</h3>
            <p className="mt-3 leading-relaxed text-text-secondary">
              Designed and built a C++23 rule engine for real-time messaging, now in production. The placement
              ended with a return offer.
            </p>
            <p className="tnum mt-auto pt-4 text-sm text-text-muted">London, March to October 2026</p>
          </Card>

          <Card label="What I work on" className="lg:col-span-2">
            <ul className="grid gap-5 sm:grid-cols-3">
              {focus.map((f) => (
                <li key={f.title}>
                  <Link href={f.href} className="group block">
                    <h3 className="font-semibold">
                      {f.title}
                      <ArrowUpRight
                        size={15}
                        aria-hidden="true"
                        className="mb-0.5 ml-1 inline text-text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-text-primary"
                      />
                    </h3>
                    <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-text-secondary">{f.text}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card label="Education">
            <ul className="space-y-4">
              <li>
                <h3 className="font-semibold">MSc Computer Science, EPFL</h3>
                <p className="tnum text-[0.9375rem] text-text-secondary">5.4/6, 2024 to 2027</p>
              </li>
              <li>
                <h3 className="font-semibold">BSc Computer Science, University of Groningen</h3>
                <p className="tnum text-[0.9375rem] text-text-secondary">Cum laude, 8.6/10, Honours College, 2021 to 2024</p>
              </li>
            </ul>
          </Card>

          <Card label="Teaching">
            <p className="leading-relaxed text-text-secondary">
              Hundreds of students taught, as a teaching assistant for seven computer science courses and as a
              maths tutor. The tutoring led to{' '}
              <Link href="/projects/mathium" scroll={false} className="text-text-primary underline decoration-border-hover underline-offset-4 hover:decoration-text-primary">
                Mathium
              </Link>
              .
            </p>
          </Card>

          <Card label="Recognition">
            <p className="leading-relaxed text-text-secondary">
              Third place overall at LauzHack 2025, and second in its Huawei challenge. BSc cum laude, with the
              Honours College programme.
            </p>
          </Card>

          <Card label="Languages and citizenship">
            <p className="leading-relaxed text-text-secondary">
              English and Swedish, both native. Swedish and American citizen.
            </p>
          </Card>

          <Card label="Toolbox" className="md:col-span-2 lg:col-span-3">
            <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
              {toolbox.map(([group, tools]) => (
                <div key={group}>
                  <dt className="font-semibold">{group}</dt>
                  <dd className="mt-2 flex flex-wrap gap-1.5">
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
