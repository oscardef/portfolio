import Image from 'next/image';
import { Github, Linkedin, Mail, MapPin } from 'lucide-react';
import { getAllProjects, getAllExperiences } from '@/lib/content';
import { siteConfig } from '@/lib/constants';
import { AnimatedSection, AnimatedDiv } from '@/components/ui/animated-section';
import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/project-card';
import { ExperienceCard } from '@/components/experience-card';

export default async function HomePage() {
  const projects = await getAllProjects();
  const experiences = await getAllExperiences();
  const featuredProjects = projects.filter((p) => p.featured).slice(0, 6);

  return (
    <div className="relative">
      {/* ────────── HERO ────────── */}
      <section className="relative min-h-[90vh] flex items-center pt-16">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.03] via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/[0.04] rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Text */}
            <AnimatedDiv>
              <p className="text-accent font-medium text-sm mb-4 flex items-center gap-2">
                <MapPin size={14} />
                Lausanne, Switzerland
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary tracking-tight leading-[1.1]">
                Oscar
                <br />
                de Francesca
              </h1>
              <p className="mt-6 text-lg text-text-secondary max-w-lg leading-relaxed">
                Systems-oriented software engineer with a focus on performance,
                reliability, and data systems. CS Master&apos;s student at EPFL,
                starting at Bloomberg.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 mt-8">
                <Button href="/projects" icon="arrow">
                  View Projects
                </Button>
                <Button href="#experience" variant="secondary">
                  Experience
                </Button>
              </div>

              {/* Social links */}
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

            {/* Right: Portrait */}
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
                {/* Decorative element */}
                <div className="absolute -bottom-3 -right-3 w-72 h-96 sm:w-80 sm:h-[28rem] rounded-2xl border border-accent/20 -z-10" />
              </div>
            </AnimatedDiv>
          </div>
        </div>
      </section>

      {/* ────────── ABOUT ────────── */}
      <AnimatedSection className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeader title="About" />
        <div className="max-w-3xl">
          <p className="text-text-secondary leading-relaxed text-base">
            I&apos;m a Computer Science Master&apos;s student at EPFL (Swiss Federal Institute of Technology)
            with a focus on systems, security, and data-intensive applications. I hold a BSc in CS
            from the University of Groningen (cum laude, 8.6/10 average). I care deeply about writing
            reliable, performant software and building systems that scale.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            {[
              { label: 'Systems & Performance', desc: 'OS, concurrency, distributed systems' },
              { label: 'Machine Learning', desc: 'LLMs, probabilistic models, forecasting' },
              { label: 'Security & Data', desc: 'Applied cryptography, data pipelines' },
            ].map(({ label, desc }) => (
              <div key={label} className="rounded-lg border border-border bg-bg-card p-4">
                <p className="font-medium text-text-primary text-sm">{label}</p>
                <p className="text-xs text-text-muted mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ────────── EXPERIENCE ────────── */}
      <AnimatedSection id="experience" className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeader
          title="Experience"
          subtitle="Professional roles and positions — click any card for details."
        />
        <div className="grid grid-cols-1 gap-4 max-w-3xl">
          {experiences.map((exp, i) => (
            <ExperienceCard key={exp.slug} experience={exp} index={i} />
          ))}
        </div>
      </AnimatedSection>

      {/* ────────── FEATURED PROJECTS ────────── */}
      <AnimatedSection className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <SectionHeader
            title="Featured Projects"
            subtitle="Selected work across research, coursework, and personal projects."
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProjects.map((project, i) => (
            <ProjectCard key={project.slug} project={project} index={i} />
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Button href="/projects" variant="secondary" icon="arrow">
            View All Projects
          </Button>
        </div>
      </AnimatedSection>

      {/* ────────── EDUCATION ────────── */}
      <AnimatedSection className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeader title="Education" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl">
          <div className="rounded-xl border border-border bg-bg-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <GraduationCapIcon />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary text-sm">MSc Computer Science</h3>
                <p className="text-xs text-text-muted">EPFL · 2024 — 2026</p>
              </div>
            </div>
            <p className="text-sm text-text-secondary">
              Average 5.6/6. Minor in Management, Technology &amp; Entrepreneurship.
              Focus on systems, security, and machine learning.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-bg-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <GraduationCapIcon />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary text-sm">BSc Computer Science</h3>
                <p className="text-xs text-text-muted">University of Groningen · 2021 — 2024</p>
              </div>
            </div>
            <p className="text-sm text-text-secondary">
              Cum Laude, average 8.6/10. Coursework in algorithms, operating systems,
              concurrent programming, and data systems.
            </p>
          </div>
        </div>
      </AnimatedSection>

      {/* ────────── SKILLS ────────── */}
      <AnimatedSection className="mx-auto max-w-6xl px-6 py-20">
        <SectionHeader title="Skills & Tools" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl">
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
                    className="text-xs text-text-secondary bg-bg-card border border-border px-2 py-1 rounded"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </AnimatedSection>

      {/* ────────── CONTACT ────────── */}
      <AnimatedSection className="mx-auto max-w-6xl px-6 py-20">
        <div className="rounded-2xl border border-border bg-bg-card p-8 sm:p-12 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Let&apos;s Connect</h2>
          <p className="text-text-secondary mt-3 max-w-md mx-auto">
            I&apos;m always open to interesting conversations about systems, research, or potential
            collaborations.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
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
        </div>
      </AnimatedSection>
    </div>
  );
}

// Small inline icon component
function GraduationCapIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
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
