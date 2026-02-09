import type { Metadata } from 'next';
import { getAllExperiences } from '@/lib/content';
import { ExperienceListClient } from '@/components/experience-list-client';

export const metadata: Metadata = {
  title: 'Experience',
  description: 'Professional experience, internships, and positions.',
};

export default async function ExperiencePage() {
  const experiences = await getAllExperiences();

  return (
    <div className="mx-auto max-w-4xl px-6 pt-28 pb-20">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
          Experience
        </h1>
        <p className="mt-2 text-text-secondary">
          Professional roles, internships, and research positions — from startups to global institutions.
        </p>
        <div className="flex items-center gap-6 mt-4 text-sm text-text-muted">
          <span>{experiences.length} roles</span>
          <span>·</span>
          <span>{new Set(experiences.map((e) => e.organization)).size} organizations</span>
        </div>
      </div>
      <ExperienceListClient experiences={experiences} />
    </div>
  );
}
