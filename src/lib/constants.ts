export const siteConfig = {
  name: 'Oscar de Francesca',
  title: 'Oscar de Francesca — Software Engineer',
  description:
    'Oscar de Francesca is a systems-oriented software engineer specializing in performance, reliability, and data systems. MSc in Computer Science from EPFL, currently at Bloomberg in London.',
  url: 'https://oscar.defrancesca.com',
  links: {
    github: 'https://github.com/oscardef',
    linkedin: 'https://www.linkedin.com/in/oscardef/?skipRedirect=true',
    email: 'mailto:oscar.defrancesca@gmail.com',
  },
  ogImage: '/images/og-default.png',
  keywords: [
    'Oscar de Francesca',
    'software engineer',
    'Oscar de Francesca portfolio',
    'Oscar de Francesca Bloomberg',
    'Oscar de Francesca EPFL',
    'systems engineer',
    'machine learning engineer',
    'full-stack developer',
    'EPFL computer science',
    'Bloomberg engineer London',
  ],
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
