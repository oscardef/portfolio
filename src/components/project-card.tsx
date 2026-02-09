import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Tag } from '@/components/ui/tag';
import { CardLink } from '@/components/ui/card';
import { AnimatedDiv } from '@/components/ui/animated-section';
import type { Project } from '@/lib/schemas';
import { formatDate } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  index?: number;
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  return (
    <AnimatedDiv delay={index * 0.1}>
      <CardLink href={`/projects/${project.slug}`}>
        {/* Hero image or gradient placeholder */}
        <div className="relative -mx-6 -mt-6 mb-4 h-44 overflow-hidden rounded-t-xl">
          {project.heroImage ? (
            <>
              <Image
                src={project.heroImage.src}
                alt={project.heroImage.alt}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-card/80 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-accent/[0.08] via-bg-secondary to-bg-card flex items-center justify-center">
              <span className="text-4xl font-bold text-accent/20 select-none">
                {project.title.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {project.featured && (
                <span className="text-xs text-accent font-medium">Featured</span>
              )}
              {project.organization && (
                <span className="text-xs text-text-muted">{project.organization}</span>
              )}
            </div>
            <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors line-clamp-2">
              {project.title}
            </h3>
          </div>
          <ArrowRight
            size={16}
            className="shrink-0 text-text-muted group-hover:text-accent transition-all group-hover:translate-x-0.5 mt-1"
          />
        </div>

        {/* Date + Type */}
        <p className="text-xs text-text-muted mt-1">
          {formatDate(project.date)} · {project.type}
        </p>

        {/* Summary */}
        <p className="text-sm text-text-secondary mt-3 line-clamp-2">{project.summary}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {project.tags.slice(0, 4).map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
          {project.tags.length > 4 && (
            <span className="text-xs text-text-muted self-center">
              +{project.tags.length - 4}
            </span>
          )}
        </div>
      </CardLink>
    </AnimatedDiv>
  );
}

interface ProjectCardCompactProps {
  project: Project;
}

export function ProjectCardCompact({ project }: ProjectCardCompactProps) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex items-start gap-4 py-4 border-b border-border last:border-0 hover:bg-bg-card/50 -mx-3 px-3 rounded-lg transition-colors"
    >
      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-text-primary group-hover:text-accent transition-colors text-sm">
          {project.title}
        </h3>
        <p className="text-xs text-text-muted mt-0.5">
          {formatDate(project.date)} · {project.organization || project.type}
        </p>
      </div>
      <ArrowRight
        size={14}
        className="shrink-0 text-text-muted group-hover:text-accent transition-all group-hover:translate-x-0.5 mt-1"
      />
    </Link>
  );
}
