interface DiagramBlockProps {
  title?: string;
  children: React.ReactNode;
}

export function DiagramBlock({ title, children }: DiagramBlockProps) {
  return (
    <div className="not-prose my-8 rounded-[3px] border border-rule bg-paper p-6">
      {title && <p className="mb-4 text-sm font-semibold text-ink">{title}</p>}
      <div className="text-sm text-ink-2 [&>*]:leading-relaxed">{children}</div>
    </div>
  );
}
