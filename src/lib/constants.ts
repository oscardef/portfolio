export const siteConfig = {
  name: 'Oscar de Francesca',
  title: 'Oscar de Francesca · Software Engineer',
  description:
    'Software engineer working across systems and machine learning. Software Engineer at Bloomberg in London, completing an MSc in Computer Science at EPFL, with an incoming ETH Zurich Master\'s thesis on diffusion language models for antibody design.',
  url: 'https://oscar.defrancesca.com',
  links: {
    github: 'https://github.com/oscardef',
    linkedin: 'https://www.linkedin.com/in/oscardef',
    email: 'mailto:oscar.defrancesca@gmail.com',
  },
  keywords: [
    'Oscar de Francesca',
    'software engineer',
    'Oscar de Francesca portfolio',
    'Oscar de Francesca Bloomberg',
    'Oscar de Francesca EPFL',
    'C++ engineer',
    'low-latency systems',
    'distributed systems',
    'machine learning engineer',
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
