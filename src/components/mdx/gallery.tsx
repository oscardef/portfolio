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
    <figure>
      <div className="overflow-hidden rounded-[3px] border border-rule">
        <Image
          src={src}
          alt={alt}
          width={800}
          height={500}
          className="w-full h-auto object-cover"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm text-ink-2">{caption}</figcaption>
      )}
    </figure>
  );
}

export function Gallery({ children }: { children?: ReactNode }) {
  return (
    <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">{children}</div>
  );
}
