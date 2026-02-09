'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Tag } from '@/components/ui/tag';
import type { Project } from '@/lib/schemas';
import { filterProjects, getAllTags } from '@/lib/filters';

interface FilterBarProps {
  projects: Project[];
  onFilter: (filtered: Project[]) => void;
}

const typeOptions = [
  { value: 'all', label: 'All' },
  { value: 'school', label: 'School' },
  { value: 'personal', label: 'Personal' },
  { value: 'company', label: 'Company' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'featured', label: 'Featured' },
];

export function FilterBar({ projects, onFilter }: FilterBarProps) {
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('all');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [sort, setSort] = useState<'featured' | 'newest'>('featured');
  const [showFilters, setShowFilters] = useState(false);

  const allTags = useMemo(() => getAllTags(projects), [projects]);

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearch('');
    setActiveType('all');
    setActiveTags([]);
    setSort('featured');
  };

  const hasActiveFilters = search || activeType !== 'all' || activeTags.length > 0;

  // Compute filtered results
  const filtered = useMemo(() => {
    return filterProjects(projects, {
      type: activeType,
      tags: activeTags,
      search,
      sort,
    });
  }, [projects, activeType, activeTags, search, sort]);

  // Sync filtered results to parent
  useEffect(() => {
    onFilter(filtered);
  }, [filtered, onFilter]);

  return (
    <div className="space-y-4 mb-8">
      {/* Search + Filter toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-bg-card border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
            aria-label="Search projects"
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
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2.5 text-sm border rounded-lg transition-colors ${
            showFilters || hasActiveFilters
              ? 'border-accent text-accent bg-accent/5'
              : 'border-border text-text-secondary hover:text-text-primary hover:border-border-hover'
          }`}
          aria-label="Toggle filters"
          aria-expanded={showFilters}
        >
          <SlidersHorizontal size={16} />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          )}
        </button>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="rounded-xl border border-border bg-bg-card p-4 space-y-4">
          {/* Type filter */}
          <div>
            <label className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 block">
              Type
            </label>
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
          </div>

          {/* Tag filter */}
          <div>
            <label className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 block">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <Tag
                  key={tag}
                  label={tag}
                  active={activeTags.includes(tag)}
                  onClick={() => toggleTag(tag)}
                  size="md"
                />
              ))}
            </div>
          </div>

          {/* Sort + Clear */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Sort
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as 'featured' | 'newest')}
                className="text-sm bg-bg border border-border rounded-lg px-2 py-1 text-text-primary focus:outline-none focus:border-accent"
                aria-label="Sort order"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-text-muted hover:text-text-primary transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-text-muted">
        {filtered.length} project{filtered.length !== 1 ? 's' : ''}
        {hasActiveFilters ? ' matching filters' : ''}
      </p>
    </div>
  );
}
