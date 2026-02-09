'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, ArrowRight, Building2, GraduationCap, FlaskConical } from 'lucide-react';
import { Tag } from '@/components/ui/tag';
import { formatDateRange } from '@/lib/utils';
import type { Experience } from '@/lib/schemas';

const typeIcons = {
  internship: Building2,
  teaching: GraduationCap,
  research: FlaskConical,
  fulltime: Building2,
};

const typeLabels: Record<string, string> = {
  internship: 'Internship',
  teaching: 'Teaching',
  research: 'Research',
  fulltime: 'Full-time',
};

const typeOptions = [
  { value: 'all', label: 'All' },
  { value: 'fulltime', label: 'Full-time' },
  { value: 'internship', label: 'Internship' },
  { value: 'teaching', label: 'Teaching' },
  { value: 'research', label: 'Research' },
];

interface ExperienceListClientProps {
  experiences: Experience[];
}

export function ExperienceListClient({ experiences }: ExperienceListClientProps) {
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('all');

  const filtered = useMemo(() => {
    let result = [...experiences];

    if (activeType !== 'all') {
      result = result.filter((e) => e.type === activeType);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.organization.toLowerCase().includes(q) ||
          e.summary.toLowerCase().includes(q) ||
          e.stack.some((s) => s.toLowerCase().includes(q))
      );
    }

    return result;
  }, [experiences, activeType, search]);

  return (
    <>
      {/* Search + Filters */}
      <div className="space-y-4 mb-8">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search experiences..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-bg-card border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
            aria-label="Search experiences"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {typeOptions.map((opt) => (
            <Tag
              key={opt.value}
              label={opt.label}
              active={activeType === opt.value}
              onClick={() => setActiveType(opt.value)}
              size="md"
            />
          ))}
        </div>
        <p className="text-xs text-text-muted">
          {filtered.length} experience{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Results */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((exp) => {
            const Icon = typeIcons[exp.type];
            return (
              <Link
                key={exp.slug}
                href={`/experience/${exp.slug}`}
                className="group block rounded-xl border border-border bg-bg-card transition-all hover:border-border-hover hover:bg-bg-card-hover hover:shadow-lg hover:shadow-accent/5"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    {/* Logo or Icon */}
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-bg-secondary border border-border flex items-center justify-center overflow-hidden">
                      {exp.logo ? (
                        <Image
                          src={exp.logo}
                          alt={exp.organization}
                          width={32}
                          height={32}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <Icon size={20} className="text-accent" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors">
                            {exp.title}
                          </h3>
                          <p className="text-sm text-text-secondary mt-0.5">{exp.organization}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="hidden sm:inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-accent/10 text-accent/80">
                            {typeLabels[exp.type]}
                          </span>
                          <ArrowRight
                            size={14}
                            className="text-text-muted group-hover:text-accent transition-all group-hover:translate-x-0.5"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-text-muted mt-1.5">
                        {formatDateRange(exp.startDate, exp.endDate)} · {exp.location}
                      </p>
                      <p className="text-sm text-text-secondary mt-3 line-clamp-2 leading-relaxed">
                        {exp.summary}
                      </p>
                      {exp.stack.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {exp.stack.slice(0, 5).map((s) => (
                            <Tag key={s} label={s} />
                          ))}
                          {exp.stack.length > 5 && (
                            <span className="text-xs text-text-muted self-center">
                              +{exp.stack.length - 5}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-text-muted">No experiences match your search.</p>
        </div>
      )}
    </>
  );
}
