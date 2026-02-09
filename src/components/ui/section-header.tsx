interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  id?: string;
}

export function SectionHeader({ title, subtitle, id }: SectionHeaderProps) {
  return (
    <div className="mb-10">
      <h2 id={id} className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
        {title}
      </h2>
      {subtitle && <p className="mt-2 text-text-secondary text-base">{subtitle}</p>}
    </div>
  );
}
