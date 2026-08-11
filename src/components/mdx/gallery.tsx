import Image from 'next/image';
import { type ReactNode } from 'react';

export function GalleryImage({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption?: string;
}) {
  return (
    <figure className="group">
      <div className="overflow-hidden rounded-lg border border-border">
        <Image
          src={src}
          alt={alt}
          width={800}
          height={500}
          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-xs text-text-muted text-center">{caption}</figcaption>
      )}
    </figure>
  );
}

export function Gallery({ children }: { children?: ReactNode }) {
  return (
    <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">{children}</div>
  );
}
