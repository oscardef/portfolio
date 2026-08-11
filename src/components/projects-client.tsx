'use client';

import { useState, useCallback } from 'react';
import { FilterBar } from '@/components/filter-bar';
import { ProjectCard } from '@/components/project-card';
import type { Project } from '@/lib/schemas';

interface ProjectsClientProps {
  projects: Project[];
}

export function ProjectsClient({ projects }: ProjectsClientProps) {
  const [filtered, setFiltered] = useState<Project[]>(projects);
  const [active, setActive] = useState(false);

  const handleFilter = useCallback((result: Project[], hasActiveFilters: boolean) => {
    setFiltered(result);
    setActive(hasActiveFilters);
  }, []);

  const featured = projects.filter((p) => p.featured);
  const more = projects.filter((p) => !p.featured);

  return (
    <>
      <FilterBar projects={projects} onFilter={handleFilter} />

      {active ? (
        filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project, i) => (
              <ProjectCard key={project.slug} project={project} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-text-muted">No projects match your filters.</p>
          </div>
        )
      ) : (
        <div className="space-y-12">
          {featured.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4">
                Featured Work
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featured.map((project, i) => (
                  <ProjectCard key={project.slug} project={project} index={i} />
                ))}
              </div>
            </section>
          )}
          {more.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4">
                More Projects
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {more.map((project, i) => (
                  <ProjectCard key={project.slug} project={project} index={i} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </>
  );
}
