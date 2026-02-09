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

  const handleFilter = useCallback((result: Project[]) => {
    setFiltered(result);
  }, []);

  return (
    <>
      <FilterBar projects={projects} onFilter={handleFilter} />
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project, i) => (
            <ProjectCard key={project.slug} project={project} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-text-muted">No projects match your filters.</p>
        </div>
      )}
    </>
  );
}
