import { type MDXComponents } from 'mdx/types';
import { Callout } from './callout';
import { Gallery, GalleryImage } from './gallery';
import { VideoEmbed } from './video-embed';
import { MetricRow, Metric } from './metric-row';
import { FloatingImage } from './floating-image';
import { DiagramBlock } from './diagram-block';
import Image from 'next/image';
import { Zoomable } from '@/components/zoomable';

export const mdxComponents: MDXComponents = {
  // Custom components available in MDX files
  Callout,
  Gallery,
  GalleryImage,
  VideoEmbed,
  MetricRow,
  Metric,
  FloatingImage,
  DiagramBlock,

  // Override default HTML elements
  img: (props) => (
    <Zoomable src={props.src || ''} alt={props.alt || ''}>
      <Image
        src={props.src || ''}
        alt={props.alt || ''}
        width={800}
        height={500}
        unoptimized={props.src?.endsWith('.gif')}
        className="my-4 h-auto w-full rounded-lg border border-border"
      />
    </Zoomable>
  ),
  a: (props) => (
    <a
      {...props}
      target={props.href?.startsWith('http') ? '_blank' : undefined}
      rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      className="text-accent hover:text-accent-hover underline underline-offset-4 transition-colors"
    />
  ),
};
