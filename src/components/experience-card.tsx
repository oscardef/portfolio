import { ArrowRight, Building2, GraduationCap, FlaskConical } from 'lucide-react';
import { CardLink } from '@/components/ui/card';
import { AnimatedDiv } from '@/components/ui/animated-section';
import { formatDateRange } from '@/lib/utils';
import type { Experience } from '@/lib/schemas';

const typeIcons = {
  internship: Building2,
  teaching: GraduationCap,
  research: FlaskConical,
  fulltime: Building2,
};

interface ExperienceCardProps {
  experience: Experience;
  index?: number;
}

export function ExperienceCard({ experience, index = 0 }: ExperienceCardProps) {
  const Icon = typeIcons[experience.type[0]];

  return (
    <AnimatedDiv delay={index * 0.1}>
      <CardLink href={`/experience/${experience.slug}`}>
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="shrink-0 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Icon size={18} className="text-accent" />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors">
                  {experience.title}
                </h3>
                <p className="text-sm text-text-secondary mt-0.5">{experience.organization}</p>
              </div>
              <ArrowRight
                size={16}
                className="shrink-0 text-text-muted group-hover:text-accent transition-all group-hover:translate-x-0.5 mt-1"
              />
            </div>

            {/* Date + Location */}
            <p className="text-xs text-text-muted mt-1">
              {formatDateRange(experience.startDate, experience.endDate)} ·{' '}
              {experience.location}
            </p>

            {/* Summary */}
            <p className="text-sm text-text-secondary mt-2 line-clamp-2">
              {experience.summary}
            </p>

            {/* Stack */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {experience.stack.slice(0, 5).map((tech) => (
                <span
                  key={tech}
                  className="text-xs text-text-muted bg-bg-secondary px-2 py-0.5 rounded"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </CardLink>
    </AnimatedDiv>
  );
}
