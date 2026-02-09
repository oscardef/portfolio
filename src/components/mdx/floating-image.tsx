import Image from 'next/image';

interface FloatingImageProps {
  src: string;
  alt: string;
  caption?: string;
  side?: 'left' | 'right';
  width?: number;
  height?: number;
}

export function FloatingImage({
  src,
  alt,
  caption,
  side = 'right',
  width = 400,
  height = 300,
}: FloatingImageProps) {
  return (
    <figure
      className={`not-prose my-4 sm:my-2 ${
        side === 'right'
          ? 'sm:float-right sm:ml-6 sm:mb-4'
          : 'sm:float-left sm:mr-6 sm:mb-4'
      } sm:w-[45%] w-full`}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="rounded-lg border border-border w-full h-auto"
      />
      {caption && (
        <figcaption className="text-xs text-text-muted mt-2 text-center italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
