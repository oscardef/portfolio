import { type MDXComponents } from 'mdx/types';
import { Callout } from './callout';
import { Gallery } from './gallery';
import { VideoEmbed } from './video-embed';
import { MetricRow } from './metric-row';
import { FloatingImage } from './floating-image';
import { DiagramBlock } from './diagram-block';
import Image from 'next/image';

export const mdxComponents: MDXComponents = {
  // Custom components available in MDX files
  Callout,
  Gallery,
  VideoEmbed,
  MetricRow,
  FloatingImage,
  DiagramBlock,

  // Override default HTML elements
  img: (props) => (
    <Image
      src={props.src || ''}
      alt={props.alt || ''}
      width={800}
      height={500}
      className="rounded-lg border border-border my-4 w-full h-auto"
    />
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
