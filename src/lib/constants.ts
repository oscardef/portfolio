export const siteConfig = {
  name: 'Oscar de Francesca',
  title: 'Oscar de Francesca — Software Engineer',
  description:
    'Systems-oriented software engineer specializing in performance, reliability, and data systems. CS Master\'s student at EPFL.',
  url: 'https://oscar.defrancesca.com',
  links: {
    github: 'https://github.com/oscardef',
    linkedin: 'https://www.linkedin.com/in/oscardef/?skipRedirect=true',
    email: 'mailto:oscar.defrancesca@gmail.com',
  },
  ogImage: '/images/og-default.svg',
} as const;

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
] as const;
