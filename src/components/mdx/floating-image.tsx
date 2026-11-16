import Image from 'next/image';
import { Zoomable } from '@/components/zoomable';

interface FloatingImageProps {
  src: string;
  alt: string;
  caption?: string;
  side?: 'left' | 'right';
  width?: number;
  height?: number;
}

// An image the text flows around; a click opens it large
export function FloatingImage({ src, alt, caption, side = 'right', width = 400, height = 300 }: FloatingImageProps) {
  return (
    <figure
      className={`not-prose my-4 w-full sm:my-2 sm:w-[45%] ${
        side === 'right' ? 'sm:float-right sm:mb-4 sm:ml-6' : 'sm:float-left sm:mb-4 sm:mr-6'
      }`}
    >
      <Zoomable src={src} alt={alt} caption={caption}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          unoptimized={src.endsWith('.gif')}
          className="h-auto w-full rounded-lg border border-border transition-[border-color] hover:border-border-hover"
        />
      </Zoomable>
      {caption && <figcaption className="mt-2 text-center text-xs italic text-text-muted">{caption}</figcaption>}
    </figure>
  );
}
