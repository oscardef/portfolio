import Image from 'next/image';

interface GalleryProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  columns?: 1 | 2 | 3;
}

export function Gallery({ images, columns = 2 }: GalleryProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 my-6`}>
      {images.map((img, i) => (
        <figure key={i} className="group">
          <div className="overflow-hidden rounded-lg border border-border">
            <Image
              src={img.src}
              alt={img.alt}
              width={800}
              height={500}
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
          {img.caption && (
            <figcaption className="mt-2 text-xs text-text-muted text-center">
              {img.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
