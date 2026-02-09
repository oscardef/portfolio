import type { Metadata } from 'next';
import { getAllProjects } from '@/lib/content';
import { ProjectsClient } from '@/components/projects-client';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'A collection of research, coursework, and personal projects in systems, ML, security, and more.',
};

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div className="mx-auto max-w-6xl px-6 pt-28 pb-20">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
          Projects
        </h1>
        <p className="mt-2 text-text-secondary">
          Explore my work across research, coursework, and personal projects. Filter by type, tags, or search.
        </p>
        <div className="flex items-center gap-6 mt-4 text-sm text-text-muted">
          <span>{projects.length} projects</span>
          <span>·</span>
          <span>{projects.filter((p) => p.featured).length} featured</span>
        </div>
      </div>
      <ProjectsClient projects={projects} />
    </div>
  );
}
