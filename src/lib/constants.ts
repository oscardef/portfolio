export const siteConfig = {
  name: 'Oscar de Francesca',
  title: 'Oscar de Francesca — Software Engineer',
  description:
    'Systems-oriented software engineer specializing in performance, reliability, and data systems. MSc from EPFL, currently at Bloomberg.',
  url: 'https://oscar.defrancesca.com',
  links: {
    github: 'https://github.com/oscardef',
    linkedin: 'https://www.linkedin.com/in/oscardef/?skipRedirect=true',
    email: 'mailto:oscar.defrancesca@gmail.com',
  },
  ogImage: '/images/og-default.png',
} as const;

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Experience', href: '/experience' },
  { label: 'Projects', href: '/projects' },
] as const;

export const tagTaxonomy = [
  'systems', 'performance', 'concurrency', 'security', 'networking',
  'data-systems', 'databases', 'distributed',
  'ml', 'llm', 'nlp', 'probabilistic', 'forecasting', 'computer-vision',
  'robotics', 'embedded',
  'blockchain', 'fintech',
  'visualization', 'web', 'backend', 'frontend', 'devops',
  'cloud', 'infrastructure', 'testing', 'compilers',
] as const;
