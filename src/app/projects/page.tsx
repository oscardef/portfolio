import type { Metadata } from 'next';
import { getAllProjects } from '@/lib/content';
import { SectionHeader } from '@/components/ui/section-header';
import { ProjectsClient } from '@/components/projects-client';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'A collection of research, coursework, and personal projects in systems, ML, security, and more.',
};

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div className="mx-auto max-w-6xl px-6 pt-28 pb-20">
      <SectionHeader
        title="Projects"
        subtitle="Explore my work across research, coursework, and personal projects. Filter by type, tags, or search."
      />
      <ProjectsClient projects={projects} />
    </div>
  );
}
