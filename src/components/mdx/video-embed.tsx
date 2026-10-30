interface VideoEmbedProps {
  src: string;
  title?: string;
}

export function VideoEmbed({ src, title = 'Video' }: VideoEmbedProps) {
  // Convert YouTube watch URLs to embed URLs
  const embedUrl = src
    .replace('youtube.com/watch?v=', 'youtube.com/embed/')
    .replace('youtu.be/', 'youtube.com/embed/');

  return (
    <div className="my-6">
      <div className="relative aspect-video overflow-hidden rounded-[3px] border border-rule">
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
      {title && title !== 'Video' && (
        <p className="mt-2 text-sm text-ink-2">{title}</p>
      )}
    </div>
  );
}
