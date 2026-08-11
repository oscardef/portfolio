import Image from 'next/image';
import Link from 'next/link';
import { Github, Linkedin, Mail, MapPin, ArrowRight, Briefcase, FolderOpen } from 'lucide-react';
import { getAllProjects, getAllExperiences } from '@/lib/content';
import { siteConfig } from '@/lib/constants';
import { AnimatedSection, AnimatedDiv } from '@/components/ui/animated-section';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/project-card';
import { formatDateRange } from '@/lib/utils';

const organizations = [
  { name: 'Bloomberg', logo: '/images/logos/bloomberg.svg', width: 130, height: 28 },
  { name: 'EPFL', logo: '/images/logos/epfl.svg', width: 80, height: 28 },
  { name: 'ASML', logo: '/images/logos/asml.svg', width: 100, height: 28 },
  { name: 'University of Groningen', logo: '/images/logos/ugroningen.svg', width: 160, height: 36 },
  { name: 'Researchable', logo: '/images/logos/researchable.svg', width: 130, height: 28 },
  { name: 'Securrency', logo: '/images/logos/securrency.png', width: 150, height: 52 },
];

export default async function HomePage() {
  const projects = await getAllProjects();
  const experiences = await getAllExperiences();
  const featuredProjects = projects.filter((p) => p.featured).slice(0, 4);

  return (
    <div className="relative">
      {/* ── Hero ── */}
      <section className="relative min-h-[80vh] flex items-center pt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.03] via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/[0.04] rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 py-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <AnimatedDiv>
              <p className="text-accent font-medium text-sm mb-4 flex items-center gap-2">
                <MapPin size={14} />
                London, United Kingdom
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary tracking-tight leading-[1.1]">
                Oscar <span className="block">de Francesca</span>
              </h1>
              <p className="mt-3 text-lg font-medium text-text-secondary">
                Software Engineer · Systems &amp; ML
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-text-secondary">
                <span>Bloomberg</span>
                <span className="text-text-muted">·</span>
                <span>MSc CS, EPFL</span>
                <span className="text-text-muted">·</span>
                <span className="text-accent-hover">Incoming: ETH Zurich research</span>
              </div>
              <p className="mt-5 text-base text-text-secondary max-w-lg leading-relaxed">
                I work across systems and machine learning. Right now I&apos;m building
                real-time C++ infrastructure at{' '}
                <strong className="font-semibold text-text-primary">Bloomberg</strong> in London.
                I&apos;m completing an MSc in Computer Science at{' '}
                <strong className="font-semibold text-text-primary">EPFL</strong>, and from October
                I&apos;ll be doing my EPFL Master&apos;s thesis, hosted at{' '}
                <strong className="font-semibold text-text-primary">ETH Zurich</strong>, on
                diffusion language models for antibody design.
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-8">
                <Button href="/projects" icon="arrow">View Projects</Button>
                <Button href="/about" variant="secondary">About Me</Button>
              </div>

              <div className="flex items-center gap-4 mt-8">
                {[
                  { href: siteConfig.links.github, icon: Github, label: 'GitHub' },
                  { href: siteConfig.links.linkedin, icon: Linkedin, label: 'LinkedIn' },
                  { href: siteConfig.links.email, icon: Mail, label: 'Email' },
                ].map(({ href, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith('mailto:') ? undefined : '_blank'}
                    rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                    className="text-text-muted hover:text-text-primary transition-colors p-2 -ml-2"
                    aria-label={label}
                  >
                    <Icon size={20} />
                  </a>
                ))}
              </div>
            </AnimatedDiv>

            <AnimatedDiv delay={0.2} className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="relative w-72 h-96 sm:w-80 sm:h-[28rem] rounded-2xl overflow-hidden border border-border">
                  <Image
                    src="/images/portrait.jpg"
                    alt="Oscar de Francesca"
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 288px, 320px"
                  />
                </div>
                <div className="absolute -bottom-3 -right-3 w-72 h-96 sm:w-80 sm:h-[28rem] rounded-2xl border border-accent/20 -z-10" />
              </div>
            </AnimatedDiv>
          </div>
        </div>
      </section>

      {/* ── Organization Logos ── */}
      <AnimatedSection className="mx-auto max-w-6xl px-6 py-8">
        <h2 className="text-xs text-text-muted uppercase tracking-widest text-center mb-6">
          Worked &amp; Studied With
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          {organizations.map((org) => (
            <div
              key={org.name}
              className="group relative h-auto w-auto transition-all duration-300"
              title={org.name}
            >
              {/* White glow behind logo on hover for readability */}
              <div className="absolute inset-0 -m-6 rounded-2xl bg-white/0 group-hover:bg-white/15 transition-all duration-300 blur-2xl" />
              <Image
                src={org.logo}
                alt={org.name}
                width={org.width}
                height={org.height}
                className="relative object-contain brightness-0 invert opacity-70 group-hover:brightness-100 group-hover:invert-0 group-hover:opacity-100 transition-all duration-300"
                style={{ height: org.height, width: 'auto' }}
              />
            </div>
          ))}
        </div>
      </AnimatedSection>

      {/* ── Experience ── */}
      <AnimatedSection className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Briefcase size={20} className="text-accent" />
            <h2 className="text-xl font-bold text-text-primary">Experience</h2>
          </div>
          <Link
            href="/experience"
            className="text-sm text-text-muted hover:text-accent transition-colors flex items-center gap-1"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="space-y-3">
          {experiences.map((exp) => (
            <Link
              key={exp.slug}
              href={`/experience/${exp.slug}`}
              className="group flex items-center gap-4 rounded-xl border border-border bg-bg-card p-4 transition-all hover:border-border-hover hover:bg-bg-card-hover"
            >
              {exp.logo ? (
                <div className="shrink-0 w-11 h-11 rounded-lg border border-border flex items-center justify-center overflow-hidden bg-white/90">
                  <Image
                    src={exp.logo}
                    alt={exp.organization}
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                  />
                </div>
              ) : (
                <div className="shrink-0 w-11 h-11 rounded-lg border border-accent/20 bg-accent/10 flex items-center justify-center">
                  <span className="text-accent font-semibold text-base">
                    {exp.organization.charAt(0)}
                  </span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-text-primary text-sm group-hover:text-accent transition-colors">
                    {exp.title}
                  </h3>
                  <span className="text-text-muted text-xs">·</span>
                  <span className="text-text-secondary text-sm">{exp.organization}</span>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  {formatDateRange(exp.startDate, exp.endDate)} · {exp.location}
                </p>
              </div>
              <ArrowRight
                size={14}
                className="shrink-0 text-text-muted group-hover:text-accent transition-all group-hover:translate-x-0.5"
              />
            </Link>
          ))}
        </div>
      </AnimatedSection>

      {/* ── Featured Projects ── */}
      <AnimatedSection className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FolderOpen size={20} className="text-accent" />
            <h2 className="text-xl font-bold text-text-primary">Featured Projects</h2>
          </div>
          <Link
            href="/projects"
            className="text-sm text-text-muted hover:text-accent transition-colors flex items-center gap-1"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredProjects.map((project, i) => (
            <ProjectCard key={project.slug} project={project} index={i} />
          ))}
        </div>
      </AnimatedSection>

      {/* ── Education ── */}
      <AnimatedSection className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-center gap-3 mb-6">
          <GraduationCapIcon />
          <h2 className="text-xl font-bold text-text-primary">Education</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-bg-card p-5 transition-all hover:border-border-hover hover:bg-bg-card-hover">
            <h3 className="font-semibold text-text-primary text-sm">MSc Computer Science</h3>
            <p className="text-xs text-text-muted mt-1">EPFL · 2024 – 2027</p>
            <p className="text-sm text-text-secondary mt-3">
              In progress, 5.38/6 average, with a minor in Management, Technology &amp;
              Entrepreneurship. Coursework across distributed systems, security, and
              machine learning. Master&apos;s thesis hosted at ETH Zurich from October 2026.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-bg-card p-5 transition-all hover:border-border-hover hover:bg-bg-card-hover">
            <h3 className="font-semibold text-text-primary text-sm">BSc Computer Science</h3>
            <p className="text-xs text-text-muted mt-1">University of Groningen · 2021 – 2024</p>
            <p className="text-sm text-text-secondary mt-3">
              Cum Laude, 8.6/10 average, Honours College. Coursework in algorithms,
              operating systems, concurrent programming, and data systems.
            </p>
          </div>
        </div>
      </AnimatedSection>

      {/* ── Skills ── */}
      <AnimatedSection className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-xl font-bold text-text-primary mb-6">Skills &amp; Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { category: 'Languages', items: ['C++', 'Python', 'C', 'Java', 'SQL', 'Bash', 'Haskell', 'R', 'Assembly'] },
            { category: 'Systems', items: ['Low-latency', 'Concurrency', 'Distributed systems', 'Real-time', 'POSIX / Unix'] },
            { category: 'ML & AI', items: ['PyTorch', 'Hugging Face', 'LoRA / PEFT', 'DeepSpeed', 'NumPy', 'pandas', 'scikit-learn'] },
            { category: 'Backend & Tools', items: ['Kafka', 'Linux', 'Docker', 'PostgreSQL', 'FastAPI', 'CMake', 'Git', 'CI/CD'] },
          ].map(({ category, items }) => (
            <div key={category}>
              <h3 className="font-medium text-text-primary text-sm mb-3">{category}</h3>
              <div className="flex flex-wrap gap-1.5">
                {items.map((item) => (
                  <span
                    key={item}
                    className="text-xs text-text-secondary bg-bg-card border border-border px-2 py-1 rounded transition-colors hover:border-border-hover hover:text-text-primary"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </AnimatedSection>

      {/* ── Let's Connect ── */}
      <AnimatedSection className="mx-auto max-w-6xl px-6 py-12 pb-20">
        <div className="relative rounded-2xl border border-border bg-gradient-to-br from-bg-card via-bg-card to-accent/[0.06] p-10 sm:p-14 overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-accent/[0.05] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/[0.03] rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
          <div className="relative max-w-xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
              Get in touch
            </h2>
            <p className="text-text-secondary mt-4 leading-relaxed">
              I&apos;m open to conversations about systems, machine learning, and
              interesting engineering problems. Email is the best way to reach me.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Button href={siteConfig.links.email} variant="primary" icon="arrow">
                Email Me
              </Button>
              <Button href={siteConfig.links.linkedin} external variant="secondary" icon="external">
                LinkedIn
              </Button>
              <Button href={siteConfig.links.github} external variant="secondary" icon="external">
                GitHub
              </Button>
            </div>
            <p className="text-xs text-text-muted mt-6">
              oscar.defrancesca@gmail.com
            </p>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}

function GraduationCapIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-accent"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}
