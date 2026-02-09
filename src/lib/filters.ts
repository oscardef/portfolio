import type { Project } from './schemas';

// ── Filtering utilities (client-safe — no fs imports) ───────────────────────

export function filterProjects(
  projects: Project[],
  filters: {
    type?: string;
    tags?: string[];
    search?: string;
    sort?: 'featured' | 'newest';
  }
): Project[] {
  let result = [...projects];

  // Filter by type
  if (filters.type && filters.type !== 'all') {
    result = result.filter((p) => p.type === filters.type);
  }

  // Filter by tags (AND logic: project must have ALL selected tags)
  if (filters.tags && filters.tags.length > 0) {
    result = result.filter((p) => filters.tags!.every((tag) => p.tags.includes(tag)));
  }

  // Filter by search
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.stack.some((s) => s.toLowerCase().includes(q))
    );
  }

  // Sort
  if (filters.sort === 'featured') {
    result.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  } else {
    // Default: newest first
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  return result;
}

export function getAllTags(projects: Project[]): string[] {
  const tagSet = new Set<string>();
  projects.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}
