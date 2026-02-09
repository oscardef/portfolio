import Image from 'next/image';
import Link from 'next/link';
import { Github, Linkedin, Mail, MapPin, ArrowRight, Briefcase, FolderOpen } from 'lucide-react';
import { getAllProjects, getAllExperiences } from '@/lib/content';
import { siteConfig } from '@/lib/constants';
import { AnimatedSection, AnimatedDiv } from '@/components/ui/animated-section';
import { Button } from '@/components/ui/button';
import { Tag } from '@/components/ui/tag';
import { formatDate, formatDateRange } from '@/lib/utils';

const organizations = [
  { name: 'Bloomberg', logo: '/images/logos/bloomberg.svg', width: 130, height: 28 },
  { name: 'EPFL', logo: '/images/logos/epfl.svg', width: 80, height: 28 },
  { name: 'ASML', logo: '/images/logos/asml.svg', width: 100, height: 28 },
  { name: 'University of Groningen', logo: '/images/logos/ugroningen.svg', width: 160, height: 36 },
  { name: 'Researchable', logo: '/images/logos/researchable.svg', width: 130, height: 28 },
  { name: 'Securrency', logo: '/images/logos/securrency.png', width: 130, height: 32 },
];

export default async function HomePage() {
  const projects = await getAllProjects();
  const experiences = await getAllExperiences();
  const featuredProjects = projects.filter((p) => p.featured).slice(0, 4);

  return (
    <div className="relative">
      {/* ── Hero ── */}
      <section className="relative min-h-[85vh] flex items-center pt-16">
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
                Oscar
                <br />
                de Francesca
              </h1>
              <p className="mt-6 text-lg text-text-secondary max-w-lg leading-relaxed">
                Systems-oriented software engineer with a focus on performance,
                reliability, and data systems. MSc in Computer Science from EPFL,
                currently at Bloomberg in London.
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
        <p className="text-xs text-text-muted uppercase tracking-widest text-center mb-6">
          Worked &amp; Studied With
        </p>
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
                className="relative object-contain brightness-0 invert opacity-40 group-hover:brightness-100 group-hover:invert-0 group-hover:opacity-100 transition-all duration-300"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featuredProjects.map((project) => (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className="group rounded-xl border border-border bg-bg-card p-5 transition-all hover:border-border-hover hover:bg-bg-card-hover"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-text-primary text-sm group-hover:text-accent transition-colors line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-xs text-text-muted mt-1">
                    {formatDate(project.date)}
                    {project.organization && ` · ${project.organization}`}
                  </p>
                </div>
                <ArrowRight
                  size={14}
                  className="shrink-0 text-text-muted group-hover:text-accent transition-all group-hover:translate-x-0.5 mt-1"
                />
              </div>
              <p className="text-sm text-text-secondary mt-3 line-clamp-2">{project.summary}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {project.tags.slice(0, 3).map((tag) => (
                  <Tag key={tag} label={tag} />
                ))}
                {project.tags.length > 3 && (
                  <span className="text-xs text-text-muted self-center">+{project.tags.length - 3}</span>
                )}
              </div>
            </Link>
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
            <p className="text-xs text-text-muted mt-1">EPFL · 2024 — 2026</p>
            <p className="text-sm text-text-secondary mt-3">
              Average 5.6/6. Minor in Management, Technology &amp; Entrepreneurship.
              Focus on systems, security, and machine learning.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-bg-card p-5 transition-all hover:border-border-hover hover:bg-bg-card-hover">
            <h3 className="font-semibold text-text-primary text-sm">BSc Computer Science</h3>
            <p className="text-xs text-text-muted mt-1">University of Groningen · 2021 — 2024</p>
            <p className="text-sm text-text-secondary mt-3">
              Cum Laude, average 8.6/10. Coursework in algorithms, operating systems,
              concurrent programming, and data systems.
            </p>
          </div>
        </div>
      </AnimatedSection>

      {/* ── Skills ── */}
      <AnimatedSection className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-xl font-bold text-text-primary mb-6">Skills &amp; Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { category: 'Languages', items: ['Python', 'C/C++', 'Java', 'TypeScript', 'Rust', 'SQL'] },
            { category: 'ML & Data', items: ['PyTorch', 'TensorFlow', 'Pandas', 'NumPy', 'Scikit-learn'] },
            { category: 'Systems & Web', items: ['Linux', 'Docker', 'Git', 'React', 'Next.js', 'Node.js'] },
            { category: 'Practices', items: ['CI/CD', 'Testing', 'Agile', 'Code Review', 'Technical Writing'] },
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
          <div className="relative max-w-xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
              Let&apos;s Connect
            </h2>
            <p className="text-text-secondary mt-4 leading-relaxed">
              Always open to interesting conversations about systems, research, or
              potential collaborations. Feel free to reach out.
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
