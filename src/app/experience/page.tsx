import type { Metadata } from 'next';
import { RoleCard, StudyCard } from '@/components/cards';
import { getExperienceItems, getStudyItems, type JourneyItem } from '@/lib/journey';
import { siteConfig } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Experience',
  description:
    'Oscar de Francesca’s experience: software engineering at Bloomberg and ASML, research at ETH Zurich, data science, teaching, and degrees from EPFL and the University of Groningen.',
  alternates: { canonical: `${siteConfig.url}/experience` },
};

function Group({ title, items, children }: { title: string; items: JourneyItem[]; children?: React.ReactNode }) {
  if (items.length === 0 && !children) return null;
  return (
    <section aria-labelledby={`group-${title}`} className="mt-16 first:mt-0">
      <h2 id={`group-${title}`} className="text-2xl font-semibold tracking-tight">
        {title}
      </h2>
      <ul className="mt-6 space-y-4">
        {items.map((item) => (
          <li key={item.id}>
            <RoleCard item={item} />
          </li>
        ))}
      </ul>
      {children}
    </section>
  );
}

export default async function ExperiencePage() {
  const roles = await getExperienceItems();
  const studies = getStudyItems();
  const of = (...types: string[]) => roles.filter((r) => r.roleTypes.some((t) => types.includes(t)));

  return (
    <div className="container-page pb-24 pt-32 md:pb-32 md:pt-40">
      <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">Experience</h1>
      <p className="mt-5 max-w-[58ch] text-lg leading-relaxed text-text-secondary">
        Where I’ve worked, researched, taught and studied, newest first. Open any role for the full story.
      </p>

      <div className="mt-14">
        <Group title="Work" items={of('fulltime', 'internship')} />
        <Group title="Research" items={of('research')} />
        <Group title="Teaching" items={of('teaching')} />
        <Group title="Education" items={[]}>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {studies.map((item) => (
              <li key={item.id} className="h-full [&>div]:h-full">
                <StudyCard item={item} />
              </li>
            ))}
          </ul>
        </Group>
      </div>
    </div>
  );
}
