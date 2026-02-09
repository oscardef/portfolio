interface DiagramBlockProps {
  title?: string;
  children: React.ReactNode;
}

export function DiagramBlock({ title, children }: DiagramBlockProps) {
  return (
    <div className="not-prose my-8 rounded-xl border border-border bg-bg-card p-6">
      {title && (
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-4">
          {title}
        </p>
      )}
      <div className="text-sm text-text-secondary [&>*]:leading-relaxed">
        {children}
      </div>
    </div>
  );
}
